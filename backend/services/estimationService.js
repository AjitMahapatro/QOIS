// services/estimationService.js

/**
 * Legacy circuit quality estimation (maintained for backward compatibility)
 */
export const estimateCircuitQuality = ({ qubits, depth, cxGates, backend }) => {
  // FALLBACK: Prevent 0-qubit crash
  const qCount = (qubits && qubits > 0) ? qubits : 2; 
  const dCount = (depth && depth > 0) ? depth : 1;

  // Real-world noise logic for systems like ibm_torino
  const errorRate = (dCount * 0.002) + (cxGates * 0.015);
  const successRate = Math.max(5, (100 * (1 - errorRate))).toFixed(2);

  return {
    successRate: parseFloat(successRate),
    errorRate: (errorRate * 100).toFixed(2),
    qubits: qCount,
    depth: dCount,
    cxGates: cxGates || 0
  };
};

/**
 * Dynamic Weighted Cost-Scoring Engine
 * 
 * Calculates optimal backend selection using the formula:
 * C = (w₁ × Normalized Queue Depth) + (w₂ × Circuit Gate Complexity) + (w₃ × Hardware Error Rate)
 * 
 * Where:
 * - Normalized Queue Depth: queue_length / max_queue_observed
 * - Circuit Gate Complexity: (depth × total_gates) / (num_qubits × 1000)
 * - Hardware Error Rate: (1/T₁ + 1/T₂) average across qubits
 * 
 * The backend with LOWEST C score is recommended.
 * 
 * @param {Object[]} backends - Array of backend configurations from IBM Runtime
 * @param {Object} circuit - Circuit metrics { depth, qubits, totalGates }
 * @param {Object} weights - Optional weight configuration { w1, w2, w3 }
 * @returns {Object} { scores, recommended, analysis }
 */
export const calculateWeightedCostScores = (backends, circuit, weights = {}) => {
  // Adjustable default weights optimized for balanced performance
  const defaultWeights = {
    w1: 0.4,  // Queue depth priority (40%)
    w2: 0.35, // Circuit complexity overhead (35%)
    w3: 0.25, // Hardware error rate (25%)
  };

  // Merge provided weights with defaults
  const w = { ...defaultWeights, ...weights };

  // Validate inputs
  if (!backends || backends.length === 0) {
    throw new Error("No backends provided for cost analysis.");
  }

  if (!circuit || !circuit.depth || !circuit.qubits) {
    throw new Error("Circuit metrics (depth, qubits) are required.");
  }

  // Normalize circuit metrics
  const circuitDepth = Math.max(circuit.depth, 1);
  const circuitQubits = Math.max(circuit.qubits, 1);
  const circuitGates = circuit.totalGates || (circuitDepth * 3); // Estimate if not provided

  // Find max queue length for normalization
  const queueLengths = backends.map((b) => b.queue_length || 0);
  const maxQueueLength = Math.max(...queueLengths, 1);

  // Calculate cost score for each backend
  const scores = backends.map((backend) => {
    // 1. NORMALIZED QUEUE DEPTH METRIC
    const queueDepth = backend.queue_length || 0;
    const normalizedQueue = queueDepth / maxQueueLength;

    // 2. CIRCUIT GATE COMPLEXITY OVERHEAD
    // Based on circuit depth, gate count, and available qubits
    const gateComplexity = (circuitDepth * circuitGates) / (circuitQubits * 1000);

    // 3. HARDWARE ERROR RATE FROM COHERENCE TIMES
    // Error Rate = 1/T₁ + 1/T₂ (inverse of coherence times)
    const t1Times = backend.t1_times || [];
    const t2Times = backend.t2_times || [];

    let hardwareErrorRate = 0;
    if (t1Times.length > 0 || t2Times.length > 0) {
      const maxQubits = Math.max(t1Times.length, t2Times.length);
      let totalErrorRate = 0;

      for (let i = 0; i < maxQubits; i++) {
        const t1 = t1Times[i] || 1e-3; // Default 1ms if unavailable
        const t2 = t2Times[i] || 1e-3;
        // Avoid division by zero
        totalErrorRate += (1 / Math.max(t1, 1e-6)) + (1 / Math.max(t2, 1e-6));
      }

      hardwareErrorRate = totalErrorRate / Math.max(maxQubits, 1);
    } else {
      // Fallback: estimate from readout error if coherence data unavailable
      hardwareErrorRate = (backend.readout_error || 0.002) * 100;
    }

    // CALCULATE FINAL COST SCORE
    const costScore = (w.w1 * normalizedQueue) + (w.w2 * gateComplexity) + (w.w3 * hardwareErrorRate);

    return {
      backend_name: backend.backend_name || backend.name,
      num_qubits: backend.num_qubits || backend.qubits || 0,
      status: backend.status || "unknown",
      queue_length: queueDepth,
      cost_score: costScore.toFixed(6),
      score_components: {
        normalized_queue_depth: normalizedQueue.toFixed(6),
        circuit_complexity: gateComplexity.toFixed(6),
        hardware_error_rate: hardwareErrorRate.toFixed(8),
      },
      weights_applied: { ...w },
    };
  });

  // Sort by cost score (ascending - lowest score is best)
  const sortedScores = scores.sort((a, b) => parseFloat(a.cost_score) - parseFloat(b.cost_score));

  // Recommend the backend with lowest cost
  const recommended = sortedScores[0];

  return {
    scores: sortedScores,
    recommended: {
      backend_name: recommended.backend_name,
      cost_score: parseFloat(recommended.cost_score),
      reason: `Selected for optimal balance: ${recommended.status === 'active' ? 'active' : 'warning - not active'} backend with lowest cost score`,
    },
    analysis: {
      total_backends_evaluated: backends.length,
      circuit_metrics: {
        depth: circuitDepth,
        qubits: circuitQubits,
        estimated_gates: circuitGates,
      },
      weight_configuration: { ...w },
      normalized_queue_range: {
        min: (Math.min(...queueLengths) / maxQueueLength).toFixed(6),
        max: 1,
      },
    },
  };
};

/**
 * Select best backend based on cost-scoring (convenience wrapper)
 * 
 * @param {Object[]} backends - Backend configurations
 * @param {Object} circuit - Circuit metrics { depth, qubits, totalGates }
 * @param {Object} executionPriority - "speed" | "reliability" | "balanced" (adjusts weights)
 * @returns {string} Recommended backend name
 */
export const selectOptimalBackend = (backends, circuit, executionPriority = "balanced") => {
  // Adjust weights based on execution priority
  let priorityWeights = { w1: 0.4, w2: 0.35, w3: 0.25 }; // balanced (default)

  if (executionPriority === "speed") {
    // Prioritize queue depth over error rate for speed
    priorityWeights = { w1: 0.6, w2: 0.25, w3: 0.15 };
  } else if (executionPriority === "reliability") {
    // Prioritize error rate for accuracy
    priorityWeights = { w1: 0.2, w2: 0.25, w3: 0.55 };
  }

  const result = calculateWeightedCostScores(backends, circuit, priorityWeights);
  return result.recommended.backend_name;
};