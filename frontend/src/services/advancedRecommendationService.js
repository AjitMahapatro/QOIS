const API_BASE = "https://quantum-jobs-tracker-l3jz.onrender.com/api";

/**
 * Advanced Recommendation Service
 * Provides hardware-aware, topology-aware, and circuit-aware backend recommendations
 */

class AdvancedRecommendationService {
  /**
   * Get advanced backend recommendation
   */
  static async getAdvancedRecommendation(circuitRequirements = {}) {
    try {
      const response = await fetch(`${API_BASE}/recommendations/advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circuit_requirements: circuitRequirements
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get recommendation');
      }

      return data.data;
    } catch (error) {
      console.error('Advanced recommendation error:', error);
      throw error;
    }
  }

  /**
   * Get multiple top recommendations
   */
  static async getTopRecommendations(circuitRequirements = {}, limit = 5) {
    try {
      const response = await fetch(`${API_BASE}/recommendations/top`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circuit_requirements: circuitRequirements,
          limit
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get top recommendations');
      }

      return data.data;
    } catch (error) {
      console.error('Top recommendations error:', error);
      throw error;
    }
  }

  /**
   * Get specialized recommendations by category
   */
  static async getSpecializedRecommendations(category, circuitRequirements = {}) {
    try {
      const response = await fetch(`${API_BASE}/recommendations/specialized`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          circuit_requirements: circuitRequirements
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get specialized recommendations');
      }

      return data.data;
    } catch (error) {
      console.error('Specialized recommendations error:', error);
      throw error;
    }
  }

  /**
   * Get available recommendation categories
   */
  static async getRecommendationCategories() {
    try {
      const response = await fetch(`${API_BASE}/recommendations/categories`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get categories');
      }

      return data.data;
    } catch (error) {
      console.error('Categories error:', error);
      throw error;
    }
  }

  /**
   * Analyze backend topology
   */
  static async analyzeBackendTopology(backendName) {
    try {
      const response = await fetch(`${API_BASE}/recommendations/topology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backend_name: backendName
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze topology');
      }

      return data.data;
    } catch (error) {
      console.error('Topology analysis error:', error);
      throw error;
    }
  }

  /**
   * Format recommendation score for display
   */
  static formatRecommendationScore(score) {
    if (score >= 0.8) return { text: 'Excellent', color: '#22c55e', level: 'high' };
    if (score >= 0.6) return { text: 'Good', color: '#3b82f6', level: 'medium' };
    if (score >= 0.4) return { text: 'Fair', color: '#f59e0b', level: 'low' };
    return { text: 'Poor', color: '#ef4444', level: 'poor' };
  }

  /**
   * Format noise level for display
   */
  static formatNoiseLevel(level) {
    const levels = {
      very_low: { text: 'Very Low', color: '#22c55e', icon: '🟢' },
      low: { text: 'Low', color: '#10b981', icon: '🟡' },
      medium: { text: 'Medium', color: '#f59e0b', icon: '🟠' },
      high: { text: 'High', color: '#ef4444', icon: '🔴' },
      unknown: { text: 'Unknown', color: '#6b7280', icon: '⚪' }
    };

    return levels[level] || levels.unknown;
  }

  /**
   * Format execution reliability for display
   */
  static formatReliability(reliability) {
    if (reliability >= 0.9) return { text: 'Very Reliable', color: '#22c55e' };
    if (reliability >= 0.7) return { text: 'Reliable', color: '#3b82f6' };
    if (reliability >= 0.5) return { text: 'Moderate', color: '#f59e0b' };
    return { text: 'Unreliable', color: '#ef4444' };
  }

  /**
   * Format topology efficiency for display
   */
  static formatTopologyEfficiency(efficiency) {
    if (efficiency >= 0.8) return { text: 'Excellent', color: '#22c55e' };
    if (efficiency >= 0.6) return { text: 'Good', color: '#3b82f6' };
    if (efficiency >= 0.4) return { text: 'Fair', color: '#f59e0b' };
    return { text: 'Poor', color: '#ef4444' };
  }

  /**
   * Get category display info
   */
  static getCategoryDisplayInfo(category) {
    const categoryInfo = {
      fastest_execution: {
        title: 'Fastest Execution',
        description: 'Lowest queue times for rapid results',
        icon: '⚡',
        color: '#3b82f6'
      },
      highest_fidelity: {
        title: 'Highest Fidelity',
        description: 'Best gate fidelity for precision work',
        icon: '🎯',
        color: '#8b5cf6'
      },
      lowest_noise: {
        title: 'Lowest Noise',
        description: 'Lowest error rates for reliability',
        icon: '🛡️',
        color: '#22c55e'
      },
      large_scale: {
        title: 'Large Scale',
        description: 'High-qubit backends for complex circuits',
        icon: '🔬',
        color: '#ef4444'
      },
      medium_scale: {
        title: 'Medium Scale',
        description: 'Balanced backends for moderate workloads',
        icon: '⚖️',
        color: '#f59e0b'
      },
      high_volume: {
        title: 'High Volume',
        description: 'High quantum volume for deep circuits',
        icon: '📊',
        color: '#06b6d4'
      },
      best_simulator: {
        title: 'Best Simulator',
        description: 'Optimized simulators for testing',
        icon: '💻',
        color: '#6366f1'
      }
    };

    return categoryInfo[category] || {
      title: category,
      description: 'Specialized recommendation category',
      icon: '📋',
      color: '#6b7280'
    };
  }

  /**
   * Generate circuit requirements from circuit data
   */
  static extractCircuitRequirements(circuit) {
    if (!circuit) return {};

    const requirements = {
      qubits: circuit.numQubits || 0,
      depth: this.estimateCircuitDepth(circuit),
      cx_gates: this.countCXGates(circuit)
    };

    return requirements;
  }

  /**
   * Estimate circuit depth from circuit structure
   */
  static estimateCircuitDepth(circuit) {
    if (!circuit.gates || !Array.isArray(circuit.gates)) return 0;
    
    let maxDepth = 0;
    const qubitDepths = new Array(circuit.numQubits || 0).fill(0);
    
    circuit.gates.forEach(gate => {
      if (gate.targets && Array.isArray(gate.targets)) {
        const maxTargetDepth = Math.max(...gate.targets.map(t => qubitDepths[t] || 0));
        const gateDepth = maxTargetDepth + 1;
        
        gate.targets.forEach(target => {
          if (target < qubitDepths.length) {
            qubitDepths[target] = gateDepth;
          }
        });
        
        maxDepth = Math.max(maxDepth, gateDepth);
      }
    });
    
    return maxDepth;
  }

  /**
   * Count CX gates in circuit
   */
  static countCXGates(circuit) {
    if (!circuit.gates || !Array.isArray(circuit.gates)) return 0;
    
    return circuit.gates.filter(gate => 
      gate.type && (gate.type.toLowerCase() === 'cx' || gate.type.toLowerCase() === 'cnot')
    ).length;
  }
}

export default AdvancedRecommendationService;
