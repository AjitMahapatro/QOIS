import asyncHandler from "../middleware/asyncHandler.js";
import AdvancedRecommendationEngine from "../services/advancedRecommendationEngine.js";
import { listRuntimeBackends } from "../services/qiskitBridge.js";

const recommendationEngine = new AdvancedRecommendationEngine();

/**
 * Get advanced backend recommendation
 * POST /api/recommendations/advanced
 */
export const getAdvancedRecommendation = asyncHandler(async (req, res) => {
  const { circuit_requirements = {}, limit = 5 } = req.body;

  try {
    // Get available backends
    const runtime = await listRuntimeBackends({ minQubits: circuit_requirements.qubits || 1 });
    const backends = runtime.devices || [];

    // Get recommendation
    const recommendation = await recommendationEngine.getBestBackend(backends, circuit_requirements);

    res.status(200).json({
      success: true,
      data: recommendation,
      message: "Advanced recommendation generated successfully"
    });
  } catch (error) {
    console.error("Advanced recommendation error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to generate recommendation"
    });
  }
});

/**
 * Get multiple top recommendations
 * POST /api/recommendations/top
 */
export const getTopRecommendations = asyncHandler(async (req, res) => {
  const { circuit_requirements = {}, limit = 5 } = req.body;

  try {
    // Get available backends
    const runtime = await listRuntimeBackends({ minQubits: circuit_requirements.qubits || 1 });
    const backends = runtime.devices || [];

    // Get top recommendations
    const recommendations = await recommendationEngine.getTopRecommendations(backends, circuit_requirements, limit);

    res.status(200).json({
      success: true,
      data: recommendations,
      message: `Top ${recommendations.length} recommendations generated successfully`
    });
  } catch (error) {
    console.error("Top recommendations error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to generate recommendations"
    });
  }
});

/**
 * Get specialized recommendations by category
 * POST /api/recommendations/specialized
 */
export const getSpecializedRecommendations = asyncHandler(async (req, res) => {
  const { category, circuit_requirements = {} } = req.body;

  if (!category) {
    return res.status(400).json({
      success: false,
      error: "Category is required"
    });
  }

  try {
    // Get available backends
    const runtime = await listRuntimeBackends({ minQubits: circuit_requirements.qubits || 1 });
    const backends = runtime.devices || [];

    // Get specialized recommendations
    const recommendations = recommendationEngine.getSpecializedRecommendations(backends, category);

    res.status(200).json({
      success: true,
      data: recommendations,
      category,
      message: `${recommendations.length} specialized recommendations for category: ${category}`
    });
  } catch (error) {
    console.error("Specialized recommendations error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to generate specialized recommendations"
    });
  }
});

/**
 * Get backend categories and available options
 * GET /api/recommendations/categories
 */
export const getRecommendationCategories = asyncHandler(async (req, res) => {
  try {
    const categories = {
      fastest_execution: "Backends with lowest queue times for rapid execution",
      highest_fidelity: "Hardware with highest gate fidelity for precision",
      lowest_noise: "Backends with lowest error rates for reliability",
      large_scale: "High-qubit backends for complex circuits",
      medium_scale: "Mid-range backends for balanced workloads",
      high_volume: "Backends with high quantum volume for deep circuits",
      best_simulator: "Simulator backends for testing and development"
    };

    res.status(200).json({
      success: true,
      data: categories,
      message: "Available recommendation categories"
    });
  } catch (error) {
    console.error("Categories error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to get categories"
    });
  }
});

/**
 * Analyze backend topology
 * POST /api/recommendations/topology
 */
export const analyzeBackendTopology = asyncHandler(async (req, res) => {
  const { backend_name } = req.body;

  if (!backend_name) {
    return res.status(400).json({
      success: false,
      error: "Backend name is required"
    });
  }

  try {
    // Get available backends
    const runtime = await listRuntimeBackends();
    const backends = runtime.devices || [];
    
    const backend = backends.find(b => b.name === backend_name);
    if (!backend) {
      return res.status(404).json({
        success: false,
        error: "Backend not found"
      });
    }

    // Analyze topology
    const topology = recommendationEngine.analyzeTopology(backend);

    res.status(200).json({
      success: true,
      data: topology,
      backend_name,
      message: "Topology analysis completed"
    });
  } catch (error) {
    console.error("Topology analysis error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to analyze topology"
    });
  }
});
