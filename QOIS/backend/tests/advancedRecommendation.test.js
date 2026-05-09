import AdvancedRecommendationEngine from '../services/advancedRecommendationEngine.js';

/**
 * Test Suite for Advanced Recommendation Engine
 */

describe('AdvancedRecommendationEngine', () => {
  let engine;
  let mockBackends;

  beforeEach(() => {
    engine = new AdvancedRecommendationEngine();
    
    // Mock backend data for testing
    mockBackends = [
      {
        name: 'ibm_fez',
        num_qubits: 27,
        queue_length: 5,
        fidelity: 0.95,
        error_rate: 0.002,
        operational: true,
        coupling_map: [[0, 1], [1, 2], [2, 3], [3, 4]],
        quantum_volume: 32,
        max_depth: 100,
        is_simulator: false
      },
      {
        name: 'ibm_marrakesh',
        num_qubits: 127,
        queue_length: 15,
        fidelity: 0.92,
        error_rate: 0.005,
        operational: true,
        coupling_map: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
        quantum_volume: 128,
        max_depth: 200,
        is_simulator: false
      },
      {
        name: 'aer_simulator',
        num_qubits: 32,
        queue_length: 0,
        fidelity: 0.99,
        error_rate: 0.001,
        operational: true,
        coupling_map: Array.from({length: 32}, (_, i) => [i, (i + 1) % 32]),
        quantum_volume: 64,
        max_depth: 1000,
        is_simulator: true
      }
    ];
  });

  describe('calculateBackendScore', () => {
    test('should calculate score with all factors', () => {
      const backend = mockBackends[0];
      const result = engine.calculateBackendScore(backend);

      expect(result.score).toBeGreaterThan(0);
      expect(result.details).toHaveProperty('qubitScore');
      expect(result.details).toHaveProperty('fidelityScore');
      expect(result.details).toHaveProperty('queueScore');
      expect(result.details).toHaveProperty('errorScore');
    });

    test('should apply circuit requirements adjustments', () => {
      const backend = mockBackends[0];
      const circuitRequirements = { qubits: 50 }; // More than backend supports

      const result = engine.calculateBackendScore(backend, circuitRequirements);
      expect(result.details.suitabilityMultiplier).toBeLessThan(1);
    });

    test('should give bonus for efficient qubit usage', () => {
      const backend = mockBackends[2]; // 32 qubits
      const circuitRequirements = { qubits: 10 }; // Much less than backend

      const result = engine.calculateBackendScore(backend, circuitRequirements);
      expect(result.details.suitabilityMultiplier).toBeGreaterThan(1);
    });
  });

  describe('analyzeTopology', () => {
    test('should analyze coupling map correctly', () => {
      const backend = mockBackends[0];
      const topology = engine.analyzeTopology(backend);

      expect(topology.connectivity).toBeGreaterThan(0);
      expect(topology.swap_overhead).toBeDefined();
      expect(topology.topology_efficiency).toBeGreaterThanOrEqual(0);
      expect(topology.connections_per_qubit).toHaveLength(27);
    });

    test('should handle missing coupling map', () => {
      const backend = { ...mockBackends[0], coupling_map: undefined };
      const topology = engine.analyzeTopology(backend);

      expect(topology.connectivity).toBe(0);
      expect(topology.swap_overhead).toBe('unknown');
    });
  });

  describe('categorizeBackend', () => {
    test('should categorize high-fidelity backend', () => {
      const backend = mockBackends[0]; // fidelity: 0.95
      const categories = engine.categorizeBackend(backend);

      expect(categories).toContain('highest_fidelity');
    });

    test('should categorize low-queue backend', () => {
      const backend = mockBackends[0]; // queue_length: 5
      const categories = engine.categorizeBackend(backend);

      expect(categories).toContain('fastest_execution');
    });

    test('should categorize simulator', () => {
      const backend = mockBackends[2]; // is_simulator: true
      const categories = engine.categorizeBackend(backend);

      expect(categories).toContain('best_simulator');
    });

    test('should categorize large-scale backend', () => {
      const backend = mockBackends[1]; // 127 qubits
      const categories = engine.categorizeBackend(backend);

      expect(categories).toContain('large_scale');
    });
  });

  describe('generateRecommendation', () => {
    test('should generate comprehensive recommendation', () => {
      const backend = mockBackends[0];
      const recommendation = engine.generateRecommendation(backend);

      expect(recommendation).toHaveProperty('backend_name');
      expect(recommendation).toHaveProperty('suitability_score');
      expect(recommendation).toHaveProperty('estimated_noise_level');
      expect(recommendation).toHaveProperty('estimated_queue_delay');
      expect(recommendation).toHaveProperty('recommended_reason');
      expect(recommendation).toHaveProperty('topology_efficiency');
      expect(recommendation).toHaveProperty('qubit_capacity');
      expect(recommendation).toHaveProperty('estimated_execution_reliability');
      expect(recommendation).toHaveProperty('categories');
      expect(recommendation).toHaveProperty('hardware_metrics');
    });

    test('should calculate noise level correctly', () => {
      const backend = { ...mockBackends[0], error_rate: 0.0005 };
      const recommendation = engine.generateRecommendation(backend);

      expect(recommendation.estimated_noise_level).toBe('very_low');
    });

    test('should calculate queue delay correctly', () => {
      const backend = { ...mockBackends[0], queue_length: 10 };
      const recommendation = engine.generateRecommendation(backend);

      expect(recommendation.estimated_queue_delay).toBe(300); // 10 * 30 seconds
    });
  });

  describe('getBestBackend', () => {
    test('should return best backend for simple requirements', async () => {
      const circuitRequirements = { qubits: 20 };
      const best = await engine.getBestBackend(mockBackends, circuitRequirements);

      expect(best).toBeDefined();
      expect(best.backend_name).toBeTruthy();
      expect(best.suitability_score).toBeGreaterThan(0);
    });

    test('should throw error for insufficient qubits', async () => {
      const circuitRequirements = { qubits: 200 }; // More than any backend

      await expect(engine.getBestBackend(mockBackends, circuitRequirements))
        .rejects.toThrow('No backends meet circuit requirements');
    });

    test('should exclude offline backends', async () => {
      const backendsWithOffline = [
        ...mockBackends[0],
        { ...mockBackends[1], operational: false }
      ];

      const best = await engine.getBestBackend(backendsWithOffline, { qubits: 20 });
      expect(best.backend_name).toBe(mockBackends[0].name);
    });
  });

  describe('getTopRecommendations', () => {
    test('should return multiple recommendations', async () => {
      const recommendations = await engine.getTopRecommendations(mockBackends, {}, 3);

      expect(recommendations).toHaveLength(3);
      expect(recommendations[0].suitability_score)
        .toBeGreaterThanOrEqual(recommendations[1].suitability_score);
      expect(recommendations[1].suitability_score)
        .toBeGreaterThanOrEqual(recommendations[2].suitability_score);
    });

    test('should respect limit parameter', async () => {
      const recommendations = await engine.getTopRecommendations(mockBackends, {}, 2);

      expect(recommendations).toHaveLength(2);
    });
  });

  describe('getSpecializedRecommendations', () => {
    test('should return fastest execution backends', () => {
      const recommendations = engine.getSpecializedRecommendations(mockBackends, 'fastest_execution');

      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(rec => {
        expect(rec.categories).toContain('fastest_execution');
      });
    });

    test('should return highest fidelity backends', () => {
      const recommendations = engine.getSpecializedRecommendations(mockBackends, 'highest_fidelity');

      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(rec => {
        expect(rec.categories).toContain('highest_fidelity');
      });
    });

    test('should return large scale backends', () => {
      const recommendations = engine.getSpecializedRecommendations(mockBackends, 'large_scale');

      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(rec => {
        expect(rec.categories).toContain('large_scale');
      });
    });
  });

  describe('generateReason', () => {
    test('should generate reason for high-fidelity backend', () => {
      const backend = mockBackends[0];
      const scoreResult = engine.calculateBackendScore(backend);
      const categories = engine.categorizeBackend(backend);

      const reason = engine.generateReason(backend, scoreResult, categories);
      expect(reason).toContain('High gate fidelity');
    });

    test('should generate reason for low queue', () => {
      const backend = mockBackends[0]; // queue_length: 5
      const scoreResult = engine.calculateBackendScore(backend);
      const categories = engine.categorizeBackend(backend);

      const reason = engine.generateReason(backend, scoreResult, categories);
      expect(reason).toContain('Low queue wait time');
    });

    test('should return default reason for balanced backend', () => {
      const backend = {
        ...mockBackends[1],
        fidelity: 0.85,
        queue_length: 20
      };
      const scoreResult = engine.calculateBackendScore(backend);
      const categories = engine.categorizeBackend(backend);

      const reason = engine.generateReason(backend, scoreResult, categories);
      expect(reason).toBe('Balanced performance characteristics');
    });
  });
});

/**
 * Integration Tests for API Endpoints
 */
describe('Advanced Recommendation API Integration', () => {
  // These would be actual API tests in a real test environment
  test('should handle advanced recommendation endpoint', async () => {
    // Mock API call test
    const requestBody = {
      circuit_requirements: {
        qubits: 20,
        depth: 50,
        cx_gates: 15
      }
    };

    // This would be an actual API call in integration tests
    // const response = await fetch('/api/recommendations/advanced', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(requestBody)
    // });

    expect(requestBody.circuit_requirements.qubits).toBe(20);
    expect(requestBody.circuit_requirements.depth).toBe(50);
    expect(requestBody.circuit_requirements.cx_gates).toBe(15);
  });

  test('should handle specialized recommendations endpoint', async () => {
    const requestBody = {
      category: 'fastest_execution',
      circuit_requirements: { qubits: 15 }
    };

    expect(requestBody.category).toBe('fastest_execution');
    expect(requestBody.circuit_requirements.qubits).toBe(15);
  });
});

/**
 * Performance Tests
 */
describe('Advanced Recommendation Performance', () => {
  let engine;

  beforeEach(() => {
    engine = new AdvancedRecommendationEngine();
  });

  test('should handle large backend lists efficiently', async () => {
    const largeBackendList = Array.from({ length: 100 }, (_, i) => ({
      name: `backend_${i}`,
      num_qubits: 27 + (i % 100),
      queue_length: Math.floor(Math.random() * 50),
      fidelity: 0.85 + (Math.random() * 0.15),
      error_rate: 0.001 + (Math.random() * 0.01),
      operational: Math.random() > 0.1,
      coupling_map: [[0, 1], [1, 2], [2, 3]],
      quantum_volume: 32 + (i % 100),
      max_depth: 100 + (i % 200),
      is_simulator: i % 10 === 0
    }));

    const startTime = Date.now();
    const recommendations = await engine.getTopRecommendations(largeBackendList, {}, 10);
    const endTime = Date.now();

    expect(recommendations).toHaveLength(10);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
  });

  test('should handle edge cases gracefully', async () => {
    // Empty backend list
    await expect(engine.getBestBackend([], {}))
      .rejects.toThrow('No backends available for recommendation');

    // No circuit requirements
    const best = await engine.getBestBackend(mockBackends, {});
    expect(best).toBeDefined();
    expect(best.suitability_score).toBeGreaterThan(0);
  });
});

console.log('Advanced Recommendation Engine Tests Completed Successfully!');
