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
 * Explicitly preserves measurement counts for histogram parsing while discarding memory leaks.
 */
function filterRuntimePayload(payload) {
  if (!payload) return null;

  // Safely extract counts or quasi-distributions without dropping them
  let cleanCounts = {};
  if (payload.result && payload.result.counts) {
    cleanCounts = payload.result.counts;
  } else if (payload.result && payload.result.quasi_dists) {
    cleanCounts = payload.result.quasi_dists[0] || payload.result.quasi_dists;
  } else if (payload.counts) {
    cleanCounts = payload.counts;
  }

  const filtered = {
    status: payload.status || "unknown",
    jobId: payload.jobId,
    result: {
      source: "ibm_runtime",
      type: payload.type || "sampler",
      counts: cleanCounts
    },
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
    mode: payload.mode || payload.runMode || "hardware",
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
  references.forEach((ref) => {
    if (ref) {
      Object.keys(ref).forEach((key) => {
        ref[key] = null;
      });
    }
  });

  if (global.gc) {
    try {
      global.gc();
    } catch (e) {
      // gc() not available, that's ok
    }
  }

  if (process.memoryUsage().heapUsed / 1024 / 1024 > MEMORY_THRESHOLD_MB) {
    console.warn(
      `[MEMORY WARNING] Heap usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`
    );
  }
}

function mapRuntimeStatus(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "DONE" || normalized === "COMPLETED") return "completed";
  if (normalized === "ERROR" || normalized === "FAILED") return "failed";
  if (normalized === "CANCELLED") return "cancelled";
  if (normalized === "RUNNING") return "running";
  
  if (
    normalized === "QUEUED" || 
    normalized === "PENDING" || 
    normalized === "INITIALIZING" || 
    normalized === "VALIDATING" || 
    normalized === "CREATING"
  ) {
    return "queued";
  }

  return "queued"; 
}

async function retryOrFallback(job, reason, logs) {
  if ((job.retryCount || 0) >= MAX_RETRIES) {
    await Job.findByIdAndUpdate(job._id, {
      $set: {
        status: "failed",
        failureInfo: {
          reason: reason || "IBM Runtime returned an ERROR state.",
          logs: logs.substring(0, 2000) || "",
          suggestion: "Retry on a different backend or inspect the runtime logs for circuit issues.",
          backend: job.backend,
        }
      }
    });
    
    // Fetch fresh copy for socket broadcast
    const failedJob = await Job.findById(job._id);
    emitJobUpdate("jobFailed", failedJob);
    aggressiveGarbageCollection([logs, failedJob]);
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

    const filteredRetry = filterRuntimePayload(retry);

    const historyEntry = {
      attemptedAt: new Date(),
      previousBackend: job.backend,
      reason,
    };

    if (filteredRetry.status === "completed" && filteredRetry.mode === "simulator") {
      const simulatedJob = await Job.findByIdAndUpdate(
        job._id,
        {
          $set: {
            status: "completed",
            retryCount: retryAttempt,
            ibmJobId: null,
            backend: filteredRetry.backend || "ibmq_qasm_simulator",
            runMode: "simulator",
            ibmResult: filteredRetry.result,
            transpiledDepth: filteredRetry.transpiledDepth ?? job.transpiledDepth,
            failureInfo: {
              reason,
              logs: filteredRetry.logs || "",
              suggestion: filteredRetry.suggestion,
              fallbackUsed: true,
            },
            'runtimeInfo.executionMode': filteredRetry.mode,
            'runtimeInfo.lastStatus': "DONE",
            'runtimeInfo.warnings': filteredRetry.warnings || []
          },
          $push: { retryHistory: historyEntry }
        },
        { new: true }
      );

      emitJobUpdate("jobCompleted", simulatedJob);
      aggressiveGarbageCollection([retry, filteredRetry, simulatedJob]);
      return;
    }

    const retriedHardwareJob = await Job.findByIdAndUpdate(
      job._id,
      {
        $set: {
          ibmJobId: filteredRetry.jobId,
          backend: filteredRetry.backend || job.backend,
          status: mapRuntimeStatus(filteredRetry.status),
          runMode: "hardware",
          retryCount: retryAttempt,
          transpiledDepth: filteredRetry.transpiledDepth ?? job.transpiledDepth,
          failureInfo: {
            reason,
            logs: "",
            suggestion: "The job was retried automatically on a different backend.",
            retried: true,
          },
          'runtimeInfo.executionMode': filteredRetry.mode,
          'runtimeInfo.lastStatus': filteredRetry.status,
          'runtimeInfo.warnings': filteredRetry.warnings || [],
          'runtimeInfo.backendSummary': null
        },
        $push: { retryHistory: historyEntry }
      },
      { new: true }
    );

    emitJobUpdate("jobUpdated", retriedHardwareJob);
    aggressiveGarbageCollection([retry, filteredRetry, retriedHardwareJob]);
  } catch (error) {
    const criticalFailedJob = await Job.findByIdAndUpdate(
      job._id,
      {
        $set: {
          status: "failed",
          retryCount: retryAttempt,
          failureInfo: {
            reason,
            logs: "",
            suggestion: "Automatic retry also failed. Inspect the runtime bridge error details.",
            bridgeError: error.message ? error.message.substring(0, 500) : "",
          }
        }
      },
      { new: true }
    );
    emitJobUpdate("jobFailed", criticalFailedJob);
    aggressiveGarbageCollection([error, criticalFailedJob]);
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

        const filteredRuntime = filterRuntimePayload(runtime);
        const mappedStatus = mapRuntimeStatus(filteredRuntime.status);

        // Atomic Telemetry Updates Map
        const updateFields = {
          'runtimeInfo.lastStatus': filteredRuntime.status,
          'runtimeInfo.metrics': filteredRuntime.metrics,
          'runtimeInfo.usage': filteredRuntime.usage,
        };

        if (mappedStatus === "completed") {
          const parsedResult = filteredRuntime.result;
          
          // Guard Clause: Prevent ghost completions if counts are completely missing
          if (!parsedResult || !parsedResult.counts || Object.keys(parsedResult.counts).length === 0) {
            await retryOrFallback(
              job,
              "IBM Runtime reported complete but returned empty payload measurements.",
              filteredRuntime.logs || ""
            );
            aggressiveGarbageCollection([runtime, filteredRuntime]);
            continue;
          }

          // Atomic Save Pass to wipe out Mongoose version locks
          const completedJob = await Job.findByIdAndUpdate(
            job._id,
            {
              $set: {
                status: "completed",
                ibmResult: parsedResult,
                failureInfo: null,
                ...updateFields
              }
            },
            { new: true }
          );

          emitJobUpdate("jobCompleted", completedJob);
          aggressiveGarbageCollection([runtime, filteredRuntime, completedJob]);
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

        // Direct Atomic update for general tracking state synchronization changes
        if (mappedStatus !== job.status) {
          const updatedJob = await Job.findByIdAndUpdate(
            job._id,
            { $set: { status: mappedStatus, ...updateFields } },
            { new: true }
          );
          emitJobUpdate("jobUpdated", updatedJob);
          aggressiveGarbageCollection([runtime, filteredRuntime, updatedJob]);
        } else {
          // Quietly update metrics if status hasn't shifted
          await Job.findByIdAndUpdate(job._id, { $set: updateFields });
          aggressiveGarbageCollection([runtime, filteredRuntime]);
        }
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