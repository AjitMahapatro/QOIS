import Job from "../models/Job.js";
import { emitJobUpdate } from "../utils/socket.js";
import {
  refreshRuntimeJob,
  submitRuntimeJob,
} from "./qiskitBridge.js";

const POLLING_INTERVAL = 10000;
const MAX_RETRIES = 1;

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
      logs: logs || "",
      suggestion:
        "Retry on a different backend or inspect the runtime logs for circuit issues.",
      backend: job.backend,
    };
    await job.save();
    emitJobUpdate("jobFailed", job);
    return;
  }

  const retryAttempt = (job.retryCount || 0) + 1;

  try {
    const retry = await submitRuntimeJob({
      qasm: job.rawQASM,
      backend: null,
      shots: job.shots,
      circuitType: job.circuitType,
      allowFallback: true,
      excludeBackends: [job.backend].filter(Boolean),
    });

    job.retryCount = retryAttempt;
    job.retryHistory = [
      ...(job.retryHistory || []),
      {
        attemptedAt: new Date(),
        previousBackend: job.backend,
        reason,
      },
    ];

    if (retry.status === "completed" && retry.mode === "simulator") {
      job.status = "completed";
      job.ibmJobId = null;
      job.backend = retry.backend || "aer_simulator";
      job.runMode = "simulator";
      job.ibmResult = retry.result;
      job.transpiledDepth = retry.transpiledDepth ?? job.transpiledDepth;
      job.failureInfo = {
        reason,
        logs: logs || retry.logs || "",
        suggestion: retry.suggestion,
        fallbackUsed: true,
      };
      job.runtimeInfo = {
        ...(job.runtimeInfo || {}),
        executionMode: retry.mode,
        lastStatus: "DONE",
        warnings: retry.warnings || [],
      };
      await job.save();
      emitJobUpdate("jobCompleted", job);
      return;
    }

    job.ibmJobId = retry.jobId;
    job.backend = retry.backend || job.backend;
    job.status = mapRuntimeStatus(retry.status);
    job.runMode = "hardware";
    job.transpiledDepth = retry.transpiledDepth ?? job.transpiledDepth;
    job.failureInfo = {
      reason,
      logs: logs || "",
      suggestion: "The job was retried automatically on a different backend.",
      retried: true,
    };
    job.runtimeInfo = {
      ...(job.runtimeInfo || {}),
      executionMode: retry.mode,
      lastStatus: retry.status,
      warnings: retry.warnings || [],
      backendSummary: retry.backendSummary || null,
    };
    await job.save();
    emitJobUpdate("jobUpdated", job);
  } catch (error) {
    job.status = "failed";
    job.retryCount = retryAttempt;
    job.failureInfo = {
      reason,
      logs: logs || "",
      suggestion:
        "Automatic retry also failed. Inspect the runtime bridge error details.",
      bridgeError: error.details?.traceback || error.message,
    };
    await job.save();
    emitJobUpdate("jobFailed", job);
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
        const runtime = await refreshRuntimeJob({ jobId: job.ibmJobId });
        const mappedStatus = mapRuntimeStatus(runtime.status);

        job.runtimeInfo = {
          ...(job.runtimeInfo || {}),
          lastStatus: runtime.status,
          metrics: runtime.metrics || null,
          usage: runtime.usage || null,
        };

        if (mappedStatus === "completed") {
          job.status = "completed";
          job.ibmResult = runtime.result || job.ibmResult;
          job.failureInfo = null;
          await job.save();
          emitJobUpdate("jobCompleted", job);
          continue;
        }

        if (mappedStatus === "failed" || mappedStatus === "cancelled") {
          await retryOrFallback(
            job,
            runtime.reason || runtime.errorMessage || `Runtime ended in ${runtime.status}.`,
            runtime.logs || ""
          );
          continue;
        }

        if (mappedStatus !== job.status) {
          job.status = mappedStatus;
          await job.save();
          emitJobUpdate("jobUpdated", job);
        } else {
          await job.save();
        }
      } catch (error) {
        await retryOrFallback(
          job,
          error.details?.error || error.message || "Runtime refresh failed.",
          error.details?.traceback || error.stderr || ""
        );
      }
    }
  } catch (error) {
    console.error("FATAL JOB WORKER ERROR:", error.message);
  }
};

export const startWorker = () => {
  setInterval(runJobWorker, POLLING_INTERVAL);
};
