// models/Otp.js

import mongoose from 'mongoose'; // <-- CRITICAL FIX: Use import instead of require()

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required for OTP verification.'],
    unique: true, // Only one active OTP per email at a time
  },
  otp: {
    type: String,
    required: [true, 'OTP code is required.']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // TTL index: document expires 300 seconds (5 minutes) after creation.
    expires: 300 
  }
});

// We ensure the email is indexed for fast lookups during verification
OtpSchema.index({ email: 1 });

// CRITICAL FINAL FIX: Use export default to match the import in AuthController.js
export default mongoose.model('Otp', OtpSchema);