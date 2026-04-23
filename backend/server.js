// server.js
// --------------------------------------------------------
// 1. Load Environment Variables BEFORE anything else
// --------------------------------------------------------
import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); 

// Optional: Console logs for debugging environment variables (remove in final production deployment)
console.log("SMTP_HOST =", process.env.SMTP_HOST);
console.log("SMTP_PORT =", process.env.SMTP_PORT);
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("SMTP_PASS =", process.env.SMTP_PASS);


// --------------------------------------------------------
// 2. Core Imports (Express, HTTP, DB, Worker, Socket)
// --------------------------------------------------------
import express from 'express';
import http from 'http';
import connectDB from './config/db.js';
import { initializeSocketIO } from './utils/socket.js';
import { startWorker } from './services/jobWorker.js';

// --------------------------------------------------------
// 3. 🔑 Passport & Security Imports
// --------------------------------------------------------
import cors from 'cors';
import errorHandler from './middleware/errorHandler.js';
import passport from 'passport';
// CRITICAL: Ensure express-session is imported and installed (npm install express-session)
import session from 'express-session'; 

// --------------------------------------------------------
// 4. Route Imports
// --------------------------------------------------------
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import backendRoutes from './routes/backendRoutes.js';

// --------------------------------------------------------
// 5. Initialize Express Application
// --------------------------------------------------------
const app = express();
const server = http.createServer(app);

// --------------------------------------------------------
// 6. Connect to MongoDB
// --------------------------------------------------------
connectDB();

// --------------------------------------------------------
// 7. Load Passport Configuration (CRITICAL STEP)
// --------------------------------------------------------
// This must happen after core imports but before middleware initialization
import './config/passport.js'; 

// --------------------------------------------------------
// 8. Global Middleware Setup
// --------------------------------------------------------

// A. CORS Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use localhost:3000 as fallback
    credentials: true
}));

// B. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// C. Passport Session Setup (FIXED CONFIGURATION)
app.use(session({
    // 1. Use a unique session name
    name: 'quantum_session_id', 
    // 2. Use the JWT_SECRET from .env
    secret: process.env.JWT_SECRET || 'fallback_session_secret',
    // 3. CRITICAL: Prevents sessions being saved back to the store unnecessarily
    resave: false, 
    // 4. CRITICAL: Prevents session objects from being created until a modification is made 
    //    (which Passport does upon login). This resolves the `regenerate` issue in many setups.
    saveUninitialized: false, 
    // 5. Configure cookie settings (optional, but good practice)
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        // secure: process.env.NODE_ENV === 'production', // Uncomment for production with HTTPS
        httpOnly: true 
    }
}));

// D. Passport Initialization (Must be AFTER express-session setup)
app.use(passport.initialize());
app.use(passport.session()); 

// --------------------------------------------------------
// 9. Initialize Socket.io
// --------------------------------------------------------
initializeSocketIO(server);

// --------------------------------------------------------
// 10. API Routes
// --------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/backends', backendRoutes);

// --------------------------------------------------------
// 11. Basic Health Route
// --------------------------------------------------------
app.get('/', (req, res) => {
    res.send('Quantum Job Tracker API is running!');
});

// --------------------------------------------------------
// 12. Global Error Handler
// --------------------------------------------------------
app.use(errorHandler);

// --------------------------------------------------------
// 13. Start Server & Background Worker
// --------------------------------------------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Backend URL: http://localhost:${PORT}\n`);

    // Start Worker 
    if (process.env.RUN_WORKER === 'true' || process.env.NODE_ENV === 'development') {
        startWorker();
    }
});
