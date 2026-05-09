import axios from "axios";

const IBM_RUNTIME_URL = "https://quantum.cloud.ibm.com/api/v1";

/**
 * Advanced Backend Recommendation Engine
 * Provides hardware-aware, topology-aware, and circuit-aware backend recommendations
 */

class AdvancedRecommendationEngine {
  constructor() {
    this.weights = {
      qubit_score: 0.15,
      fidelity_score: 0.25,
      queue_score: 0.15,
      connectivity_score: 0.15,
      error_score: 0.20,
      availability_score: 0.10
    };
  }

  /**
   * Calculate comprehensive backend score with weighted factors
   */
  calculateBackendScore(backend, circuitRequirements = {}) {
    // Basic scores
    const qubitScore = (backend.num_qubits || 0) * this.weights.qubit_score;
    const queueScore = backend.queue_length > 0 
      ? (1000 / (1 + backend.queue_length)) * this.weights.queue_score 
      : 1000 * this.weights.queue_score;
    
    // Hardware quality scores
    const fidelityScore = backend.fidelity ? (backend.fidelity / 100) * this.weights.fidelity_score : 0;
    const connectivityScore = backend.connectivity ? (backend.connectivity / 10) * this.weights.connectivity_score : 0;
    const errorScore = backend.error_rate ? (1 - backend.error_rate) * this.weights.error_score : this.weights.error_score;
    const availabilityScore = backend.operational ? this.weights.availability_score : 0;
    
    // Circuit awareness scores
    const depthScore = backend.max_depth ? (1 - backend.max_depth / 1000) * 0.10 : 0;
    const volumeScore = backend.quantum_volume ? (backend.quantum_volume / 1000) * 0.05 : 0;
    
    const baseScore = qubitScore + queueScore + fidelityScore + connectivityScore + errorScore + availabilityScore + depthScore + volumeScore;
    
    // Circuit-specific adjustments
    let suitabilityMultiplier = 1.0;
    
    if (circuitRequirements.qubits && backend.num_qubits) {
      if (circuitRequirements.qubits > backend.num_qubits) {
        suitabilityMultiplier *= 0.1; // Heavy penalty for insufficient qubits
      } else if (circuitRequirements.qubits <= backend.num_qubits * 0.5) {
        suitabilityMultiplier *= 1.2; // Bonus for efficient qubit usage
      }
    }
    
    if (circuitRequirements.depth && backend.max_depth) {
      if (circuitRequirements.depth > backend.max_depth * 0.8) {
        suitabilityMultiplier *= 0.7; // Penalty for deep circuits
      }
    }
    
    if (circuitRequirements.cx_gates && backend.connectivity) {
      const connectivityRatio = backend.connectivity / circuitRequirements.cx_gates;
      if (connectivityRatio < 0.5) {
        suitabilityMultiplier *= 0.8; // Penalty for poor connectivity
      }
    }
    
    return {
      score: baseScore * suitabilityMultiplier,
      details: {
        qubitScore,
        queueScore,
        fidelityScore,
        connectivityScore,
        errorScore,
        availabilityScore,
        depthScore,
        volumeScore,
        suitabilityMultiplier
      }
    };
  }

  /**
   * Analyze backend topology and connectivity
   */
  analyzeTopology(backend) {
    if (!backend.coupling_map) {
      return {
        connectivity: 0,
        swap_overhead: 'unknown',
        topology_efficiency: 0
      };
    }

    const couplingMap = backend.coupling_map;
    const numQubits = backend.num_qubits || 0;
    
    // Calculate connectivity metrics
    let totalConnections = 0;
    const connectionsPerQubit = new Array(numQubits).fill(0);
    
    couplingMap.forEach(([q1, q2]) => {
      connectionsPerQubit[q1]++;
      connectionsPerQubit[q2]++;
      totalConnections++;
    });

    // Calculate average connectivity
    const avgConnectivity = numQubits > 0 ? totalConnections / numQubits : 0;
    
    // Estimate swap overhead (simplified)
    const swapOverhead = avgConnectivity > 3 ? 'low' : avgConnectivity > 2 ? 'medium' : 'high';
    
    // Topology efficiency score
    const topologyEfficiency = Math.min(avgConnectivity / 4, 1.0);

    return {
      connectivity: avgConnectivity,
      swap_overhead: swapOverhead,
      topology_efficiency: topologyEfficiency,
      connections_per_qubit: connectionsPerQubit
    };
  }

  /**
   * Categorize backends for specialized recommendations
   */
  categorizeBackend(backend) {
    const categories = [];
    
    // Performance categories
    if (backend.queue_length <= 5) {
      categories.push('fastest_execution');
    }
    
    if (backend.fidelity >= 0.95) {
      categories.push('highest_fidelity');
    }
    
    if (backend.error_rate <= 0.001) {
      categories.push('lowest_noise');
    }
    
    // Size categories
    if (backend.num_qubits >= 127) {
      categories.push('large_scale');
    } else if (backend.num_qubits >= 27) {
      categories.push('medium_scale');
    }
    
    // Special purpose
    if (backend.quantum_volume >= 64) {
      categories.push('high_volume');
    }
    
    if (backend.is_simulator) {
      categories.push('best_simulator');
    }
    
    return categories;
  }

  /**
   * Generate comprehensive recommendation object
   */
  generateRecommendation(backend, circuitRequirements = {}, allBackends = []) {
    const scoreResult = this.calculateBackendScore(backend, circuitRequirements);
    const topology = this.analyzeTopology(backend);
    const categories = this.categorizeBackend(backend);
    
    // Calculate queue delay estimate
    const estimatedQueueDelay = Math.max(0, backend.queue_length * 30); // 30 seconds per job
    
    // Estimate noise level
    const estimatedNoiseLevel = backend.error_rate ? 
      (backend.error_rate < 0.001 ? 'very_low' :
       backend.error_rate < 0.005 ? 'low' :
       backend.error_rate < 0.01 ? 'medium' : 'high') : 'unknown';
    
    // Calculate execution reliability
    const executionReliability = Math.min(
      (backend.operational ? 1.0 : 0.0) * 
      (backend.fidelity || 0.5) * 
      (1 - (backend.error_rate || 0.1)), 
      1.0
    );

    return {
      backend_name: backend.name,
      suitability_score: Math.round(scoreResult.score * 100) / 100,
      score_breakdown: scoreResult.details,
      estimated_noise_level: estimatedNoiseLevel,
      estimated_queue_delay: estimatedQueueDelay,
      recommended_reason: this.generateReason(backend, scoreResult, categories),
      topology_efficiency: topology.topology_efficiency,
      qubit_capacity: backend.num_qubits,
      estimated_execution_reliability: Math.round(executionReliability * 100) / 100,
      categories,
      topology_analysis: topology,
      hardware_metrics: {
        fidelity: backend.fidelity,
        error_rate: backend.error_rate,
        quantum_volume: backend.quantum_volume,
        max_depth: backend.max_depth,
        operational: backend.operational,
        queue_length: backend.queue_length
      }
    };
  }

  /**
   * Generate human-readable recommendation reason
   */
  generateReason(backend, scoreResult, categories) {
    const reasons = [];
    
    if (scoreResult.details.queueScore > 100) {
      reasons.push('Low queue wait time');
    }
    
    if (scoreResult.details.fidelityScore > 0.15) {
      reasons.push('High gate fidelity');
    }
    
    if (scoreResult.details.errorScore > 0.15) {
      reasons.push('Low error rates');
    }
    
    if (scoreResult.details.qubitScore > 2) {
      reasons.push('Sufficient qubits for circuit');
    }
    
    if (categories.includes('fastest_execution')) {
      reasons.push('Fast execution available');
    }
    
    if (categories.includes('highest_fidelity')) {
      reasons.push('Highest fidelity hardware');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Balanced performance characteristics';
  }

  /**
   * Get specialized recommendations by category
   */
  getSpecializedRecommendations(backends, category) {
    return backends
      .filter(backend => this.categorizeBackend(backend).includes(category))
      .map(backend => this.generateRecommendation(backend, {}, backends))
      .sort((a, b) => b.suitability_score - a.suitability_score);
  }

  /**
   * Main recommendation method - returns best backend for given requirements
   */
  async getBestBackend(backends, circuitRequirements = {}) {
    if (!backends || backends.length === 0) {
      throw new Error('No backends available for recommendation');
    }

    // Filter backends that meet minimum requirements
    const eligibleBackends = backends.filter(backend => {
      if (circuitRequirements.qubits && backend.num_qubits < circuitRequirements.qubits) {
        return false;
      }
      if (!backend.operational) {
        return false;
      }
      return true;
    });

    if (eligibleBackends.length === 0) {
      throw new Error('No backends meet circuit requirements');
    }

    // Score all eligible backends
    const scoredBackends = eligibleBackends.map(backend => ({
      backend,
      recommendation: this.generateRecommendation(backend, circuitRequirements, backends)
    }));

    // Sort by score and return best
    scoredBackends.sort((a, b) => b.recommendation.suitability_score - a.recommendation.suitability_score);
    
    return scoredBackends[0].recommendation;
  }

  /**
   * Get multiple top recommendations
   */
  async getTopRecommendations(backends, circuitRequirements = {}, limit = 5) {
    if (!backends || backends.length === 0) {
      return [];
    }

    const eligibleBackends = backends.filter(backend => {
      if (circuitRequirements.qubits && backend.num_qubits < circuitRequirements.qubits) {
        return false;
      }
      if (!backend.operational) {
        return false;
      }
      return true;
    });

    const scoredBackends = eligibleBackends.map(backend => ({
      backend,
      recommendation: this.generateRecommendation(backend, circuitRequirements, backends)
    }));

    scoredBackends.sort((a, b) => b.recommendation.suitability_score - a.recommendation.suitability_score);
    
    return scoredBackends.slice(0, limit).map(item => item.recommendation);
  }
}

export default AdvancedRecommendationEngine;
