import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/User.js';


// ======================================================
// 🔐 AUTH PROTECTION MIDDLEWARE
// ======================================================
export const protect = asyncHandler(async (req, res, next) => {

  let token;

  // 1️⃣ Extract Token From Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2️⃣ Check Token Exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  try {

    // 3️⃣ Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Fetch User From Database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists.'
      });
    }

    // 5️⃣ Attach User To Request
    req.user = user;

    next();

  } catch (error) {

    console.error("JWT Error:", error.message);

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.'
    });

  }

});


// ======================================================
// 🛡️ ROLE AUTHORIZATION MIDDLEWARE
// ======================================================
export const authorize = (...roles) => {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(500).json({
        success: false,
        error: 'Authorization middleware used without authentication.'
      });
    }

    if (!roles.includes(req.user.role)) {

      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not allowed to access this resource.`
      });

    }

    next();

  };

};
