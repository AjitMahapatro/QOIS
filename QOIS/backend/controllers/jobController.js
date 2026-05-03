import Job from "../models/Job.js";
import { emitJobUpdate } from "../utils/socket.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  listRuntimeBackends,
  submitRuntimeJob,
  validateRuntimeCircuit,
} from "../services/qiskitBridge.js";

const BACKEND_CACHE_TTL_MS = 5 * 60 * 1000;
const backendCache = new Map();
const SIMULATOR_BACKEND_NAME = "aer_simulator";

function interpretQuantumResults(result, circuitType = null) {
  if (!result || !result.data) {
    return {
      interpretation: "No results available",
      confidence: "0%",
      type: "unknown"
    };
  }

  const counts = result.data.counts || {};
  const totalShots = Object.values(counts).reduce((sum, count) => sum + count, 0);
  
  if (totalShots === 0) {
    return {
      interpretation: "No measurement data",
      confidence: "0%",
      type: "unknown"
    };
  }

  const outcomes = Object.keys(counts).sort();
  const probabilities = {};
  
  for (const [outcome, count] of Object.entries(counts)) {
    probabilities[outcome] = (count / totalShots * 100).toFixed(1);
  }

  let type = "";
  let interpretation = "";
  let confidence = "";
  let explanation = "";

  // Check for Entangled Bell State
  if (outcomes.length === 2 && 
      (outcomes.includes('00') && outcomes.includes('11'))) {
    const entanglementProb = (counts['00'] + counts['11']) / totalShots;
    type = "Entangled Bell State";
    interpretation = `Entangled Bell State: ${outcomes.join(' & ')} with ${(entanglementProb * 100).toFixed(1)}% entanglement`;
    confidence = entanglementProb > 0.8 ? "high" : entanglementProb > 0.5 ? "medium" : "low";
    explanation = "The measurement outcomes are perfectly correlated, indicating quantum entanglement between qubits.";
  }
  // Check for Deterministic state
  else if (outcomes.length === 1) {
    type = "Deterministic";
    interpretation = `Deterministic: Always measures ${outcomes[0]}`;
    confidence = "high";
    explanation = "The quantum circuit always produces the same measurement outcome, indicating a definite state.";
  }
  // Check for Superposition (equal distribution)
  else if (outcomes.length > 1) {
    const probValues = Object.values(probabilities).map(p => parseFloat(p));
    const maxProb = Math.max(...probValues);
    const minProb = Math.min(...probValues);
    const isUniform = (maxProb - minProb) < 10; // Within 10% of each other
    
    if (isUniform) {
      type = "Superposition";
      interpretation = `Superposition: Nearly equal distribution across ${outcomes.length} states`;
      confidence = "medium";
      explanation = "The quantum system is in a superposition state with approximately equal probability for all basis states.";
    } else {
      type = "Noisy / Probabilistic";
      const dominantOutcome = Object.keys(probabilities).find(k => probabilities[k] === maxProb.toString());
      interpretation = `Probabilistic: ${dominantOutcome} dominant (${maxProb.toFixed(1)}%)`;
      confidence = maxProb > 70 ? "high" : maxProb > 40 ? "medium" : "low";
      explanation = "The measurement shows probabilistic behavior with one or more dominant outcomes, possibly due to noise or mixed states.";
    }
  }

  // Grover Algorithm Awareness
  let groverInfo = null;
  if (circuitType === "grover" && outcomes.length > 1) {
    const maxProb = Math.max(...Object.values(probabilities).map(p => parseFloat(p)));
    const dominantOutcome = Object.keys(probabilities).find(k => probabilities[k] === maxProb.toString());
    
    groverInfo = {
      target_found: dominantOutcome,
      confidence: maxProb > 60 ? "high" : maxProb > 30 ? "medium" : "low",
      success_probability: maxProb.toFixed(1)
    };
    
    // Add Grover-specific explanation
    if (maxProb > 60) {
      explanation += ` Grover's algorithm successfully amplified the target state ${dominantOutcome}.`;
    } else {
      explanation += ` Grover's algorithm shows weak amplification - may need more iterations or oracle refinement.`;
    }
  }

  return {
    type,
    interpretation,
    confidence,
    explanation,
    grover: groverInfo,
    details: {
      counts,
      probabilities,
      totalShots,
      outcomes
    }
  };
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
  const runtimeBackend =
    backend === SIMULATOR_BACKEND_NAME ? null : backend;

  try {
    validation = await validateRuntimeCircuit({
      qasm: rawQASM,
      backend: runtimeBackend,
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
    runMode:
      runMode ||
      (backend === SIMULATOR_BACKEND_NAME ? "simulator" : "hardware"),
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
      backend: job.backend === SIMULATOR_BACKEND_NAME ? null : job.backend,
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
  const minQubits = Number(req.query.minQubits) || 1;
  const cacheKey = String(minQubits);
  const cached = backendCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < BACKEND_CACHE_TTL_MS) {
    return res.status(200).json({
      success: true,
      data: cached.devices,
      devices: cached.devices,
      cached: true,
    });
  }

  try {
    const runtime = await listRuntimeBackends({ minQubits });
    const devices = runtime.devices || [];

    backendCache.set(cacheKey, {
      timestamp: Date.now(),
      devices,
    });

    return res.status(200).json({
      success: true,
      data: devices,
      devices,
      cached: false,
    });
  } catch (error) {
    if (cached?.devices?.length) {
      return res.status(200).json({
        success: true,
        data: cached.devices,
        devices: cached.devices,
        cached: true,
        stale: true,
      });
    }

    throw error;
  }
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

  const interpretation = interpretQuantumResults(job.ibmResult, job.circuitType);

  res.status(200).json({
    success: true,
    results: job.ibmResult,
    data: job.ibmResult,
    interpretation,
  });
});
