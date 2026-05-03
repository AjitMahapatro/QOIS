// utils/socket.js

// We assume you have installed socket.io and are using the ES module import method
import { Server } from 'socket.io'; 

let io; // This variable will hold our Socket.io server instance

/**
 * Initializes the Socket.io server and attaches it to the Express HTTP server.
 * @param {object} httpServer - The HTTP server instance created in server.js.
 */
function initializeSocketIO(httpServer) {
  io = new Server(httpServer, {
    // CRITICAL: Configure CORS for the Netlify frontend deployment
    cors: {
      origin: process.env.FRONTEND_URL || '*', 
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`\tSocket.io: User connected with ID: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`\tSocket.io: User disconnected: ${socket.id}`);
    });
  });

  console.log('\tSocket.io Initialized successfully.');
  return io;
}

/**
 * Emits a job status update event to all connected clients.
 * This function will be called by JobController and jobworker.js.
 * @param {string} eventName - The event name (e.g., 'jobCreated', 'jobUpdated', 'jobCompleted').
 * @param {object} data - The job payload to send.
 */
function emitJobUpdate(eventName, data) {
  if (io) {
    // Emit the event on the specified channel
    io.emit(eventName, data); 
    console.log(`\tSocket.io: Emitted event '${eventName}' for Job ID: ${data._id || data.ibmJobId}`);
  } else {
    console.error('Socket.io not initialized. Cannot emit event.');
  }
}

// CRITICAL FIX: Use named exports for both functions to match the imports in server.js and JobController.js
export {
  initializeSocketIO,
  emitJobUpdate // The function the JobController was failing to import!
};