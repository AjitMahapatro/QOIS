// services/estimationService.js

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