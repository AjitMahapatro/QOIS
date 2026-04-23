import Job from "../models/Job.js";
import { emitJobUpdate } from "../utils/socket.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  listRuntimeBackends,
  submitRuntimeJob,
  validateRuntimeCircuit,
} from "../services/qiskitBridge.js";

function mapRuntimeStatus(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "DONE") return "completed";
  if (normalized === "ERROR") return "failed";
  if (normalized === "CANCELLED") return "cancelled";
  if (normalized === "RUNNING") return "running";
  if (normalized === "QUEUED") return "queued";

  return "pending";
}

/**
 * Create a new job after validating and normalizing the QASM.
 */
export const createJob = asyncHandler(async (req, res) => {
  const {
    name,
    backend,
    circuitType,
    shots,
    rawQASM,
    notes,
    algorithm,
    oracleType,
    runMode,
  } = req.body;

  if (!name || !backend || !circuitType || !rawQASM) {
    throw new ErrorResponse("All required fields must be provided.", 400);
  }

  let validation;

  try {
    validation = await validateRuntimeCircuit({
      qasm: rawQASM,
      backend,
      circuitType,
    });
  } catch (error) {
    throw new ErrorResponse(
      error.details?.error || error.message || "Circuit validation failed.",
      400
    );
  }

  const job = await Job.create({
    user: req.user.id,
    name,
    backend,
    circuitType: circuitType.toLowerCase(),
    shots: Math.max(1, Math.min(Number(shots) || 1024, 1000)),
    rawQASM: validation.normalizedQasm,
    notes: notes || "",
    algorithm: algorithm || "General",
    oracleType: oracleType || "None",
    runMode: runMode || "hardware",
    qubits: validation.qubits,
    depth: validation.depth,
    status: "pending",
    validationInfo: validation,
  });

  emitJobUpdate("jobCreated", job);

  res.status(201).json({
    success: true,
    data: job,
  });
});

/**
 * Submit job to IBM Runtime. If hardware submission fails, the bridge can
 * complete the job immediately on the simulator fallback.
 */
export const submitJobToIBM = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job || job.status !== "pending") {
    throw new ErrorResponse("Invalid job status.", 400);
  }

  let runtime;
  try {
    runtime = await submitRuntimeJob({
      qasm: job.rawQASM,
      backend: job.backend,
      shots: job.shots,
      circuitType: job.circuitType,
      allowFallback: true,
    });
  } catch (error) {
    throw new ErrorResponse(
      error.details?.error ||
        error.message ||
        "IBM Runtime rejected the job submission.",
      502
    );
  }

  job.backend = runtime.backend || job.backend;
  job.transpiledDepth = runtime.transpiledDepth ?? job.transpiledDepth;
  job.runtimeInfo = {
    ...(job.runtimeInfo || {}),
    executionMode: runtime.mode,
    backendSummary: runtime.backendSummary || null,
    lastStatus: runtime.status,
    warnings: runtime.warnings || [],
    shots: runtime.shots || job.shots,
    qubits: runtime.qubits ?? job.qubits,
  };

  if (runtime.status === "completed" && runtime.mode === "simulator") {
    job.status = "completed";
    job.ibmJobId = null;
    job.runMode = "simulator";
    job.ibmResult = runtime.result;
    job.failureInfo = runtime.failureReason
      ? {
          reason: runtime.failureReason,
          logs: runtime.logs || "",
          suggestion: runtime.suggestion,
          fallbackUsed: true,
        }
      : null;
    await job.save();
    emitJobUpdate("jobCompleted", job);
  } else {
    job.ibmJobId = runtime.jobId;
    job.runMode = "hardware";
    job.status = mapRuntimeStatus(runtime.status);
    job.failureInfo = null;
    await job.save();
    emitJobUpdate("jobUpdated", job);
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

/**
 * Get all jobs (admin = all, user = own)
 */
export const getJobs = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "admin"
      ? Job.find().populate("user", "name email")
      : Job.find({ user: req.user.id });

  const jobs = await query.sort("-createdAt");

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

/**
 * Get single job
 */
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("user", "name email");

  if (!job) {
    throw new ErrorResponse("Job not found.", 404);
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

/**
 * Get available IBM backends with least-busy ordering.
 */
export const getBackendsList = asyncHandler(async (req, res) => {
  const runtime = await listRuntimeBackends({
    minQubits: Number(req.query.minQubits) || 1,
  });
  const devices = runtime.devices || [];

  res.status(200).json({
    success: true,
    data: devices,
    devices,
  });
});

/**
 * Get job status
 */
export const getJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new ErrorResponse("Job not found.", 404);
  }

  res.status(200).json({
    success: true,
    status: job.status,
    data: {
      status: job.status,
      backend: job.backend,
      lastUpdated: job.updatedAt,
      reason: job.failureInfo?.reason || null,
      suggestion: job.failureInfo?.suggestion || null,
      runtimeInfo: job.runtimeInfo || null,
    },
  });
});

/**
 * Get job results
 */
export const getJobResults = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job || job.status !== "completed") {
    throw new ErrorResponse("Results not available.", 400);
  }

  res.status(200).json({
    success: true,
    results: job.ibmResult,
    data: job.ibmResult,
  });
});
