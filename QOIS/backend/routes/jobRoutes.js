// routes/jobRoutes.js

import express from 'express';
const router = express.Router();

// Import necessary middleware
import { protect, authorize } from '../middleware/authMiddleware.js'; 

// Import all required functions from the Job Controller
import { 
  createJob,
  getJob,
  getJobs,
  submitJobToIBM,
  getJobStatus, // Although primarily used by the worker, we keep the endpoint.
  getJobResults, 

  getBackendsList// Endpoint to retrieve results from MongoDB
  // We remove 'deleteJob' because it was not implemented/exported.
} from '../controllers/jobController.js'; 

// --- Protected Job Endpoints (Requires Authentication) ---

// POST /api/jobs
// Purpose: Save the job definition to MongoDB (Status: 'pending')
router.post('/', protect, createJob);

// GET /api/jobs
// Purpose: Get the list of jobs (filtered by user or all for admin)
router.get('/', protect, getJobs);

// GET /api/jobs/backends
router.get('/backends', protect, getBackendsList);

// GET /api/jobs/:id
// Purpose: Get full details for one specific job
router.get('/:id', protect, getJob);

// POST /api/jobs/:id/submit
// Purpose: Submits a 'pending' job to the IBM Cloud API
router.post('/:id/submit', protect, submitJobToIBM);

// GET /api/jobs/:id/status
// Purpose: Manually check job status (or fetch latest status from DB)
router.get('/:id/status', protect, getJobStatus);

// GET /api/jobs/:id/results
// Purpose: Fetch final results from MongoDB
router.get('/:id/results', protect, getJobResults);

// --- Admin-Specific Endpoints (Optional, but planned for future) ---
// If we implement a delete function later, it would look like this:
// router.delete('/:id', protect, authorize('admin'), deleteJob);

// CRITICAL FIX: Use the default export for the router
export default router;
