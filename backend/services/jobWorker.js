import Job from "../models/Job.js";
import { emitJobUpdate } from "../utils/socket.js";
import {
  refreshRuntimeJob,
  submitRuntimeJob,
} from "./qiskitBridge.js";

const POLLING_INTERVAL = 10000;
const MAX_RETRIES = 1;
const MEMORY_THRESHOLD_MB = 150;

/**
 * Filter runtime payload to extract only essential keys.
 * This prevents heavy JSON blobs from consuming memory.
 */
function filterRuntimePayload(payload) {
  if (!payload) return null;

  // Extract only essential keys for memory conservation
  const filtered = {
    status: payload.status || "unknown",
    jobId: payload.jobId,
    result: payload.result,
    metrics: payload.metrics ? {
      execution_time: payload.metrics.execution_time,
      queue_time: payload.metrics.queue_time,
    } : null,
    usage: payload.usage ? {
      quantum_seconds: payload.usage.quantum_seconds,
    } : null,
    reason: payload.reason,
    errorMessage: payload.errorMessage,
    logs: payload.logs ? payload.logs.substring(0, 5000) : "", // Cap log size
    transpiledDepth: payload.transpiledDepth,
    mode: payload.mode,
    warnings: payload.warnings ? payload.warnings.slice(0, 5) : [], // Limit warnings array
    suggestion: payload.suggestion,
  };

  return filtered;
}

/**
 * Aggressive garbage collection: explicitly nullify heavy references.
 * Called after critical job processing steps to keep memory below 150MB.
 */
function aggressiveGarbageCollection(references = []) {
  // Nullify provided references
  references.forEach((ref) => {
    if (ref) {
      Object.keys(ref).forEach((key) => {
        ref[key] = null;
      });
    }
  });

  // Force garbage collection if available (v8.performGC requires --expose-gc flag)
  if (global.gc) {
    try {
      global.gc();
    } catch (e) {
      // gc() not available, that's ok
    }
  }

  // Log memory usage warning if threshold exceeded
  if (process.memoryUsage().heapUsed / 1024 / 1024 > MEMORY_THRESHOLD_MB) {
    console.warn(
      `[MEMORY WARNING] Heap usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`
    );
  }
}

function mapRuntimeStatus(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "DONE") return "completed";
  if (normalized === "ERROR") return "failed";
  if (normalized === "CANCELLED") return "cancelled";
  if (normalized === "RUNNING") return "running";
  if (normalized === "QUEUED") return "queued";

  return "pending";
}

async function retryOrFallback(job, reason, logs) {
  if ((job.retryCount || 0) >= MAX_RETRIES) {
    job.status = "failed";
    job.failureInfo = {
      reason: reason || "IBM Runtime returned an ERROR state.",
      logs: logs.substring(0, 2000) || "", // Limit log size
      suggestion:
        "Retry on a different backend or inspect the runtime logs for circuit issues.",
      backend: job.backend,
    };
    await job.save();
    emitJobUpdate("jobFailed", job);
    aggressiveGarbageCollection([logs]);
    return;
  }

  const retryAttempt = (job.retryCount || 0) + 1;

  try {
    const retry = await submitRuntimeJob({
      qasm: job.rawQASM,
      backend: null, // Use IBM cloud simulator by default (not local Aer)
      shots: job.shots,
      circuitType: job.circuitType,
      allowFallback: true,
      excludeBackends: [job.backend].filter(Boolean),
    });

    // Filter the retry payload to reduce memory footprint
    const filteredRetry = filterRuntimePayload(retry);

    job.retryCount = retryAttempt;
    job.retryHistory = [
      ...(job.retryHistory || []),
      {
        attemptedAt: new Date(),
        previousBackend: job.backend,
        reason,
      },
    ];

    if (filteredRetry.status === "completed" && filteredRetry.mode === "simulator") {
      job.status = "completed";
      job.ibmJobId = null;
      job.backend = filteredRetry.backend || "ibmq_qasm_simulator";
      job.runMode = "simulator";
      job.ibmResult = filteredRetry.result;
      job.transpiledDepth = filteredRetry.transpiledDepth ?? job.transpiledDepth;
      job.failureInfo = {
        reason,
        logs: filteredRetry.logs || "",
        suggestion: filteredRetry.suggestion,
        fallbackUsed: true,
      };
      job.runtimeInfo = {
        ...(job.runtimeInfo || {}),
        executionMode: filteredRetry.mode,
        lastStatus: "DONE",
        warnings: filteredRetry.warnings || [],
      };
      await job.save();
      emitJobUpdate("jobCompleted", job);
      aggressiveGarbageCollection([retry, filteredRetry]);
      return;
    }

    job.ibmJobId = filteredRetry.jobId;
    job.backend = filteredRetry.backend || job.backend;
    job.status = mapRuntimeStatus(filteredRetry.status);
    job.runMode = "hardware";
    job.transpiledDepth = filteredRetry.transpiledDepth ?? job.transpiledDepth;
    job.failureInfo = {
      reason,
      logs: "",
      suggestion: "The job was retried automatically on a different backend.",
      retried: true,
    };
    job.runtimeInfo = {
      ...(job.runtimeInfo || {}),
      executionMode: filteredRetry.mode,
      lastStatus: filteredRetry.status,
      warnings: filteredRetry.warnings || [],
      backendSummary: null, // Omit heavy backendSummary
    };
    await job.save();
    emitJobUpdate("jobUpdated", job);
    aggressiveGarbageCollection([retry, filteredRetry]);
  } catch (error) {
    job.status = "failed";
    job.retryCount = retryAttempt;
    job.failureInfo = {
      reason,
      logs: "",
      suggestion:
        "Automatic retry also failed. Inspect the runtime bridge error details.",
      bridgeError: error.message ? error.message.substring(0, 500) : "",
    };
    await job.save();
    emitJobUpdate("jobFailed", job);
    aggressiveGarbageCollection([error]);
  }
}

const runJobWorker = async () => {
  try {
    const jobs = await Job.find({ status: { $in: ["queued", "running"] } });

    for (const job of jobs) {
      if (!job.ibmJobId) {
        await retryOrFallback(
          job,
          "Missing IBM Runtime job identifier for a queued/running job.",
          ""
        );
        continue;
      }

      try {
        const runtime = await refreshRuntimeJob({
          jobId: job.ibmJobId,
          qasm: job.rawQASM,
          shots: job.shots,
        });

        // Filter runtime payload to reduce memory footprint
        const filteredRuntime = filterRuntimePayload(runtime);
        const mappedStatus = mapRuntimeStatus(filteredRuntime.status);

        job.runtimeInfo = {
          ...(job.runtimeInfo || {}),
          lastStatus: filteredRuntime.status,
          metrics: filteredRuntime.metrics,
          usage: filteredRuntime.usage,
        };

        if (mappedStatus === "completed") {
          job.status = "completed";
          job.ibmResult = filteredRuntime.result || job.ibmResult;
          job.failureInfo = null;
          await job.save();
          emitJobUpdate("jobCompleted", job);
          // Clean up heavy runtime objects
          aggressiveGarbageCollection([runtime, filteredRuntime]);
          continue;
        }

        if (mappedStatus === "failed" || mappedStatus === "cancelled") {
          await retryOrFallback(
            job,
            filteredRuntime.reason || filteredRuntime.errorMessage || `Runtime ended in ${filteredRuntime.status}.`,
            filteredRuntime.logs || ""
          );
          aggressiveGarbageCollection([runtime, filteredRuntime]);
          continue;
        }

        if (mappedStatus !== job.status) {
          job.status = mappedStatus;
          await job.save();
          emitJobUpdate("jobUpdated", job);
        } else {
          await job.save();
        }

        // Clean up after processing
        aggressiveGarbageCollection([runtime, filteredRuntime]);
      } catch (error) {
        await retryOrFallback(
          job,
          error.details?.error || error.message || "Runtime refresh failed.",
          error.details?.traceback || error.stderr || ""
        );
        aggressiveGarbageCollection([error]);
      }
    }
  } catch (error) {
    console.error("FATAL JOB WORKER ERROR:", error.message);
  }
};

export const startWorker = () => {
  setInterval(runJobWorker, POLLING_INTERVAL);
};
