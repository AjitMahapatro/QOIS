// middleware/asyncHandler.js

/**
 * Higher-order function to wrap async Express middleware/controller functions.
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Use 'export default' to allow 'import asyncHandler from ...'
export default asyncHandler;