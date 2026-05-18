// controllers/AuthController.js

import User from '../models/User.js';
import Otp from '../models/Otp.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendTokenResponse } from '../utils/jwtUtils.js';
import { sendVerificationEmail } from '../services/emailService.js';
import ErrorResponse from '../utils/ErrorResponse.js';


// ------------------------------------------------------------------
// HELPER: Generate OTP, Save to DB, and Send Email
// ------------------------------------------------------------------
const generateAndSaveOtp = async (email) => {

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); 

    // Remove any previous OTPs for this email
    await Otp.deleteOne({ email });

    // Save new OTP (Otp model has TTL indexing)
    await Otp.create({
        email,
        otp: otpCode
    });

    // **REAL EMAIL SENDING — FIXED**
    await sendVerificationEmail(email, otpCode);

    console.log(`📩 OTP ${otpCode} sent to ${email}`);

    return otpCode;
};



// ==================================================================
// 1. SIGNUP FLOW
// ==================================================================

// @desc    Step 1: Send OTP for user registration
// @route   POST /api/auth/signup/send-otp
// @access  Public
export const signupSendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ErrorResponse('Email already registered. Please log in.', 400);
    }

    // Generate + send OTP
    await generateAndSaveOtp(email);

    res.status(200).json({
        success: true,
        message: 'OTP sent to your email address.',
    });
});


// @desc    Step 2: Verify OTP + Create account
// @route   POST /api/auth/signup/verify-otp
// @access  Public
export const signupVerifyOtp = asyncHandler(async (req, res) => {
    const { email, otp, password, name } = req.body;

    // Find OTP record
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
        throw new ErrorResponse('Invalid or expired OTP.', 400);
    }

    // Password validation
    if (!password || password.length < 8) {
        throw new ErrorResponse('Password must be at least 8 characters long.', 400);
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
    });

    // Delete used OTP
    await Otp.deleteOne({ email });

    // Login user immediately
    sendTokenResponse(user, 201, res);
});



// ==================================================================
// 2. LOGIN WITH PASSWORD
// ==================================================================

// @route   POST /api/auth/login/password
// @access  Public
export const loginWithPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ErrorResponse('Please provide an email and password.', 400);
    }

    // Find user and validate password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        throw new ErrorResponse('Invalid credentials.', 401);
    }

    sendTokenResponse(user, 200, res);
});



// ==================================================================
// 3. LOGIN WITH OTP
// ==================================================================

// @desc    Step 1: Send login OTP
// @route   POST /api/auth/login/send-otp
// @access  Public
export const loginSendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new ErrorResponse('No account found with that email.', 404);
    }

    // Send OTP
    await generateAndSaveOtp(email);

    res.status(200).json({
        success: true,
        message: 'OTP sent to your registered email.',
    });
});


// @desc    Step 2: Verify login OTP
// @route   POST /api/auth/login/verify-otp
// @access  Public
export const loginVerifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new ErrorResponse('User not found.', 404);
    }

    // Check OTP
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
        throw new ErrorResponse('Invalid or expired OTP.', 400);
    }

    // Remove used OTP
    await Otp.deleteOne({ email });

    // Log in user
    sendTokenResponse(user, 200, res);
});


// NOTE: Google OAuth will be added later.
