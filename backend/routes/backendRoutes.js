// routes/backendRoutes.js

import express from 'express'; // <-- CRITICAL FIX: Use import instead of require()
const router = express.Router();

import { getBackendsList } from '../controllers/jobController.js'; 

// --- Public Backend Endpoint ---

// GET /api/backends
// Purpose: Get list of available IBM backends, status, and queue data.
// Access: Public (Used for the Quantum Dashboard, no login required)
router.get('/', getBackendsList);

// CRITICAL FIX: Use export default to match the import in server.js
export default router;
