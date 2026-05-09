import express from "express";
import {
  getAdvancedRecommendation,
  getTopRecommendations,
  getSpecializedRecommendations,
  getRecommendationCategories,
  analyzeBackendTopology
} from "../controllers/advancedRecommendationController.js";

const router = express.Router();

// Advanced recommendation endpoint
router.post("/advanced", getAdvancedRecommendation);

// Top recommendations endpoint
router.post("/top", getTopRecommendations);

// Specialized recommendations by category
router.post("/specialized", getSpecializedRecommendations);

// Available categories
router.get("/categories", getRecommendationCategories);

// Topology analysis
router.post("/topology", analyzeBackendTopology);

export default router;
