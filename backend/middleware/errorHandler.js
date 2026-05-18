// middleware/errorHandler.js

/**
 * Custom Error Class (We define this for clean error responses)
 */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err }; // Copy the error object
    error.message = err.message;

    // Log the error to the console for debugging
    console.error(`\n--- ERROR HANDLER ---`);
    console.error(`Status: ${err.statusCode || 500}`);
    console.error(`Message: ${err.message}`);
    console.error(err.stack);
    console.error(`---------------------\n`);
    
    // Mongoose Bad ObjectId (e.g., /api/jobs/1234 - invalid ID format)
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose Duplicate Key (e.g., registering with an existing email)
    if (err.code === 11000) {
        const message = `Duplicate field value entered: ${Object.keys(err.keyValue)} already exists.`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose Validation Error (e.g., missing required fields, enum failure)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        const message = messages.join('. ');
        error = new ErrorResponse(message, 400);
    }
    
    // Custom JWT errors (optional, usually handled by authMiddleware)
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token failed verification or is malformed.';
        error = new ErrorResponse(message, 401);
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Session expired. Please log in again.';
        error = new ErrorResponse(message, 401);
    }

    // Send the final formatted response
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        // In development, you might include the stack trace:
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
};
export default errorHandler;