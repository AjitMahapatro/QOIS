// src/pages/Login.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Smartphone,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

import {
  loginWithPassword,
  loginSendOtp,
  loginVerifyOtp,
  getGoogleAuthUrl
} from "../authApi";

import { useAuth } from "../context/AuthContext";
import loginVideo from "./login.mp4";

/* ================= CSS ================= */

const styles = `
.auth-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #020617; /* Deep base color */
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

/* Mesmerizing Blobs */
.blob {
  position: absolute;
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(167, 139, 250, 0.3) 100%);
  filter: blur(80px);
  border-radius: 50%;
  z-index: 1;
  animation: move 20s infinite alternate;
}

.blob-1 {
  top: -10%;
  left: -10%;
  background: rgba(99, 102, 241, 0.2);
  animation-duration: 25s;
}

.blob-2 {
  bottom: -10%;
  right: -10%;
  background: rgba(139, 92, 246, 0.2);
  animation-duration: 30s;
  animation-delay: -5s;
}

.blob-3 {
  top: 40%;
  left: 30%;
  width: 300px;
  height: 300px;
  background: rgba(236, 72, 153, 0.15);
  animation-duration: 20s;
  animation-delay: -10s;
}
.bg-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

  .auth-wrapper {
    width: 90%;
    max-width: 1200px;
    height: 640px;
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    
    /* Glassmorphism */
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    
    /* Premium Border & Multi-Layer Neon Glow */
    border: 1px solid rgba(255, 255, 255, 0.15);
            /* Pink atmospheric glow */
    
    border: 1px solid rgba(255,255,255,0.08);
    
    transition: transform 0.35s ease, box-shadow 0.35s ease;
    
    border-radius: 32px;
    overflow: hidden;
    z-index: 10;
    position: relative;
    margin-top: 65px; 
  }
   .auth-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1.4px;
  border-radius: inherit;

  background: linear-gradient(
    120deg,
    #00f0ff,
    #8b5cf6,
    #ff2fd3,
    #00f0ff
  );
  background-size: 400% 400%;
  animation: neonBorderSlide 6s linear infinite;

  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;

  opacity: 0.85;
  pointer-events: none;
}

/* ✨ EXTRA GLOW LAYER */
.auth-wrapper::after {
  content: "";
  position: absolute;
  inset: -50%;
  
  animation: glowSpin 12s linear infinite;
  opacity: 0.45;
  pointer-events: none;
}

/* Cinematic Glow Pulsing Animation */
@keyframes borderGlow {
  0%, 100% {
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 15px rgba(0, 240, 255, 0.3),
      0 0 30px rgba(139, 92, 246, 0.2);
  }
  50% {
    border-color: rgba(167, 139, 250, 0.5); /* Border brightens up */
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 25px rgba(0, 240, 255, 0.5),         /* Cyan gets stronger */
      0 0 50px rgba(139, 92, 246, 0.4),        /* Purple gets stronger */
      0 0 70px rgba(255, 47, 211, 0.3);        /* Pink bloom effect */
  }
}
.auth-card {
  padding: 45px 65px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  /* Glass base */
  background:
    radial-gradient(circle at 20% 15%, rgba(0,240,255,0.18), transparent 40%),
    radial-gradient(circle at 80% 85%, rgba(139,92,246,0.18), transparent 45%),
    linear-gradient(180deg, #020617, #020617);

  /* Glass effect */
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);

  /* Light glass border */
  border: 1px solid rgba(255,255,255,0.18);

  /* Soft glow */
  box-shadow:
    0 8px 32px rgba(0,0,0,0.35),
    inset 0 1px 1px rgba(255,255,255,0.15);
 border-top-right-radius: 24px;
    border-bottom-right-radius: 24px;
}


.auth-visual {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

.auth-content {
  position: relative;
  margin-top: 385px;
  z-index: 1;
  text-align: center;

  opacity: 0;              
  transform: translateY(20px) scale(0.95);
  animation: fadeInUpScale 1s ease forwards;
  animation-delay: 1s;     
}

/* Keyframes for fade + move + scale */
@keyframes fadeInUpScale {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Brand Text with gradient neon glow */
.auth-brand {
  font-size: 3.3rem;
  font-weight: 900;
  letter-spacing: 2px;
  
  animation: pulseGlow 2s infinite alternate;
}

/* Quote Text with subtle neon glow */
.auth-quote {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 1rem;
  
  animation: pulseGlow 4s infinite alternate;
}

.auth-quote span {
  font-weight: 800;
  
}

/* Button */
.auth-btn {
  margin-top: 0.5rem;
  padding: 0.8rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  background: rgba(129, 140, 248, 0.3);
  border: 1px solid rgba(129, 140, 248, 0.6);
  border-radius: 14px;
  cursor: pointer;
  backdrop-filter: blur(5px);
  transition: 0.3s ease;
}

.auth-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 0 15px rgba(129, 140, 248, 0.6),
              0 0 25px rgba(129, 140, 248, 0.4);
}

/* Pulse Glow animation */
@keyframes pulseGlow {
  0% { text-shadow: 0 0 15px rgba(129, 140, 248, 0.7), 0 0 25px rgba(74, 222, 128, 0.5); }
  50% { text-shadow: 0 0 25px rgba(129, 140, 248, 0.9), 0 0 35px rgba(74, 222, 128, 0.7); }
  100% { text-shadow: 0 0 15px rgba(129, 140, 248, 0.7), 0 0 25px rgba(74, 222, 128, 0.5); }
}


.auth-title { font-size: 40px; font-weight: 700; color: #fff; margin: 0; }
.auth-sub { color: #9ca3af; margin-bottom: 15px; font-size: 16px; }
.auth-tabs {
  display: flex;
  padding: 4px;
  margin-bottom: 30px;
  border-radius: 14px;

  /* dark indigo glass bg */
  background: linear-gradient(
    180deg,
    rgba(15,23,42,0.95),
    rgba(30,27,75,0.95)
  );

  backdrop-filter: blur(10px);

  /* subtle neon border */
  border: 1px solid rgba(0,240,255,0.25);

  /* header-style glow */
  box-shadow:
    0 0 18px rgba(0,240,255,0.15),
    inset 0 0 12px rgba(139,92,246,0.12);
}
.auth-tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  color: #7c8aa0;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  border-radius: 10px;
  transition: 0.3s;
}

.auth-tab:hover {
  color: #c7d2fe;
}.auth-tab.active {
  position: relative;
  border-radius: 16px;
  color: #e0f2fe;
  background: rgba(15,23,42,0.85);
  backdrop-filter: blur(12px);

  border: 2px solid transparent;

  /* gradient border */
  background:
    linear-gradient(rgba(15,23,42,0.85), rgba(15,23,42,0.85)) padding-box,
    linear-gradient(
      90deg,
      #00f0ff,
      #8b5cf6,
      #ff2fd3,
      #00ffa6,
      #00f0ff
    ) border-box;

  background-size: 300% 300%;
  animation: borderSlide 15s linear infinite;

  box-shadow:
    0 0 12px rgba(0,240,255,0.5),
    0 0 22px rgba(139,92,246,0.35);
}
@keyframes borderSlide {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}.auth-field {
  /* 1️⃣ Box background black */
  background: rgba(15, 23, 42, 0.9);

  border: 2px solid transparent;
  border-radius: 12px;

  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  /* 2️⃣ Gradient border only */
  background-image:
    linear-gradient(180deg,
    rgba(6, 12, 26, 0.95),
    rgba(30, 12, 45, 0.95)), /* box bg */
    linear-gradient(
      90deg,
      #2f00ff,
      #8b5cf6,
      #ff2fd3,
      #00ffa6,
      #00f0ff
    );

  background-origin: border-box;
  background-clip: padding-box, border-box;

  /* 3️⃣ Animation */
  background-size: 300% 100%;
}



.auth-field input {
  background: transparent;
  border: none;
  outline: none;
  color: white;
  width: 100%;
  /* Text size penchanu */
  font-size: 16px; 
}

.auth-btn {
  width: 100%;
  padding: 16px;
  border-radius: 35px;
  border: 2px solid transparent;

  /* Glassy blue gradient with border effect */
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(139, 92, 246, 0.3));
  backdrop-filter: blur(10px); /* glassy blur */
  -webkit-backdrop-filter: blur(10px);

  color: white;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  transition: 0.3s;

  /* Animated neon border */
  
}
.auth-btn:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 0 5px rgba(0, 255, 255, 0.4),
    0 0 10px rgba(139, 92, 246, 0.4),
    0 0 15px rgba(255, 47, 211, 0.4);
  border-image-slice: 1;
}
  





.google-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  color: #4b5563;
  font-size: 9px;
  text-transform: uppercase;
}
.google-divider::before, .google-divider::after { content: ""; flex: 1; height: 1px; background: rgba(255, 255, 255, 0.08); }

.google-btn { background: #ffffff !important; color: #1f2937 !important; padding: 8px !important; }

@media(max-width: 750px) {
  .auth-wrapper { grid-template-columns: 1fr; height: auto; max-width: 340px; max-height: 90vh; }
  .auth-visual { display: none; }
  .auth-card { padding: 25px; }
}
`;

/* ================= COMPONENT ================= */

export default function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("password");
  const [otpSent, setOtpSent] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: ""
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ===== OTP HANDLERS ===== */

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }

    setForm(f => ({ ...f, otp: newOtp.join("") }));
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  /* ===== LOGIN HANDLER ===== */

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {

      let data;

      if (mode === "password") {
        data = await loginWithPassword(form);
      }

      else if (!otpSent) {
        await loginSendOtp({ email: form.email });
        setOtpSent(true);
        setLoading(false);
        return;
      }

      else {
        data = await loginVerifyOtp({
          email: form.email,
          otp: form.otp
        });
      }

      /* ⭐ AUTH CONTEXT LOGIN */
      login(data.user, data.token);

      navigate("/hiring");

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  /* ================= UI ================= */

  return (
    <div className="auth-page">
      <style>{styles}</style>

      <motion.div
        className="auth-wrapper"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >

        {/* LEFT VIDEO */}
        <div className="auth-visual">
          <video autoPlay muted loop className="auth-video">
            <source src={loginVideo} type="video/mp4" />
          </video>
        </div>

        {/* RIGHT FORM */}
        <div className="auth-card">

          <h1 className="auth-title">Welcome Back</h1>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "password" ? "active" : ""}`}
              onClick={() => {
                setMode("password");
                setOtpSent(false);
              }}
            >
              Password
            </button>

            <button
              className={`auth-tab ${mode === "otp" ? "active" : ""}`}
              onClick={() => setMode("otp")}
            >
              OTP
            </button>
          </div>

          <form onSubmit={handleAction}>

            {/* EMAIL */}
            <div className="auth-field">
              <Mail size={18} />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                onChange={handleChange}
              />
            </div>

            {/* PASSWORD */}
            <AnimatePresence>
              {mode === "password" ? (
                <motion.div className="auth-field">
                  {showPassword ? (
                    <EyeOff onClick={() => setShowPassword(false)} />
                  ) : (
                    <Eye onClick={() => setShowPassword(true)} />
                  )}

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    required
                    onChange={handleChange}
                  />
                </motion.div>
              ) : otpSent && (
                <motion.div className="auth-field">

                  <Smartphone />

                  <div style={{ display: "flex", gap: 8 }}>
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        value={d}
                        maxLength={1}
                        onChange={(e) =>
                          handleOtpChange(e.target.value, i)
                        }
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        style={{
                          width: 40,
                          textAlign: "center",
                          background: "#020617",
                          color: "white",
                          border: "1px solid #8b5cf6",
                          borderRadius: 8
                        }}
                        required
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p style={{ color: "red", fontSize: 13 }}>
                {error}
              </p>
            )}

            <button className="auth-btn" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : mode === "password" ? (
                "Sign In"
              ) : otpSent ? (
                "Verify OTP"
              ) : (
                "Send OTP"
              )}
            </button>

          </form>

          {/* GOOGLE LOGIN */}
          <div className="google-divider">OR</div>

          <button
            className="auth-btn google-btn"
            onClick={() =>
              (window.location.href = getGoogleAuthUrl())
            }
          >
            Continue with Google
          </button>

          <div style={{ marginTop: 15 }}>
            New here?{" "}
            <span
              onClick={() => navigate("/signup")}
              style={{ color: "#8b5cf6", cursor: "pointer" }}
            >
              Create account
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
