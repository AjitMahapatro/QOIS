// routes/backendRoutes.js

import express from 'express'; 
const router = express.Router();

// Import your controller handlers
import { 
  getBackendsList, 
  getBackendDetails, 
  getBackendAnalytics
} from '../controllers/jobController.js'; 

// --------------------------------------------------------
// --- Public Backend Endpoints ---
// --------------------------------------------------------

// GET /api/backends
// Purpose: Get list of available IBM backends, status, and queue data.
router.get('/', getBackendsList);

// GET /api/backends/:backendName/details
// Purpose: Get full configuration snapshot properties for a specific backend.
router.get('/:backendName/details', getBackendDetails);

// GET /api/backends/:backendName/analytics
// Purpose: Get calibration data matrices (T1/T2 coherence times, readout errors)
router.get('/:backendName/analytics', getBackendAnalytics);

// NOTE: /api/history and /api/predict_wait are registered explicitly in server.js
// as flat routes to avoid route-nesting confusion and ensure proper 404 resolution.

// CRITICAL export default to match the import structure in server.js
export default router;