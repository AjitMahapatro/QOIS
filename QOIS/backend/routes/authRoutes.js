// routes/authRoutes.js

import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

import {
  signupSendOtp,
  signupVerifyOtp,
  loginWithPassword,
  loginSendOtp,
  loginVerifyOtp,
} from "../controllers/AuthController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   OTP SIGNUP ROUTES
============================================================ */

router.post("/signup/send-otp", signupSendOtp);
router.post("/signup/verify-otp", signupVerifyOtp);

/* ============================================================
   LOGIN ROUTES
============================================================ */

router.post("/login/password", loginWithPassword);
router.post("/login/send-otp", loginSendOtp);
router.post("/login/verify-otp", loginVerifyOtp);

/* ============================================================
   GOOGLE OAUTH ROUTES
============================================================ */

/*
---------------------------------------------------------------
1️⃣ Start Google Login
---------------------------------------------------------------
*/
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/*
---------------------------------------------------------------
2️⃣ Google Callback
---------------------------------------------------------------
THIS IS THE MOST IMPORTANT PART
It generates JWT and redirects frontend
---------------------------------------------------------------
*/
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),

  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
      }

      /* ================= JWT TOKEN ================= */

      const token = jwt.sign(
        {
          id: req.user.id,
          role: req.user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRE || "30d",
        }
      );

      /* ================= USER OBJECT ================= */

      const user = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        picture: req.user.picture || null,
      };

      /* ================= FINAL REDIRECT ================= */

      res.redirect(
        `${process.env.FRONTEND_URL}/oauth-success?token=${token}&user=${encodeURIComponent(
          JSON.stringify(user)
        )}`
      );
    } catch (error) {
      console.error("Google OAuth Error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  }
);

/* ============================================================
   GET CURRENT USER
============================================================ */

router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/* ============================================================
   EXPORT ROUTER
============================================================ */

export default router;
