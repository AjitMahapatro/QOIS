import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const colors = {
    bgDark: "#05001a",
    accentAqua: "#00E5FF",
    accentViolet: "#C400FF",
    textLight: "#E0E0FF",
    glassBg: "rgba(255,255,255,0.05)",
    glassBorder: "rgba(0,229,255,0.2)",
    logoBgIndigo: "rgba(10,0,30,0.8)"
  };

  const isActiveLink = (path) => location.pathname === path;

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__logo">
        <div className="quantum-logo-container">
          <svg className="quantum-logo-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Central Glowing Core - Mimics the "nucleus" */}
            <circle cx="50" cy="50" r="10" fill="url(#core-gradient)" className="logo-core-glow"/>

            {/* Orbitals - 3 distinct, glowing ellipses */}
            {/* First Orbital (more horizontal) */}
            <ellipse cx="50" cy="50" rx="40" ry="20" stroke="url(#orbital-gradient-1)" strokeWidth="2" className="logo-orbital orbital-1" />
            {/* Second Orbital (more vertical) */}
            <ellipse cx="50" cy="50" rx="20" ry="40" stroke="url(#orbital-gradient-2)" strokeWidth="2" className="logo-orbital orbital-2" />
            {/* Third Orbital (diagonal, rotated) */}
            <ellipse cx="50" cy="50" rx="35" ry="25" stroke="url(#orbital-gradient-3)" strokeWidth="2" className="logo-orbital orbital-3" style={{ transform: 'rotate(45deg)' }} />

            {/* Glowing Particles/Electrons on each orbital path */}
            {/* Particle 1 on orbital 1 */}
            <circle cx="50" cy="30" r="3" fill={colors.accentAqua} className="logo-particle particle-1" />
            {/* Particle 2 on orbital 2 */}
            <circle cx="70" cy="50" r="3" fill={colors.accentViolet} className="logo-particle particle-2" />
            {/* Particle 3 on orbital 3 */}
            <circle cx="30" cy="50" r="3" fill={colors.accentAqua} className="logo-particle particle-3" />
            {/* Gradients */}
            <defs>
              <radialGradient id="core-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#FFFFFF" /> {/* Bright center */}
                <stop offset="60%" stopColor={colors.accentAqua} />
                <stop offset="100%" stopColor={colors.accentViolet} />
              </radialGradient>
              <linearGradient id="orbital-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.accentAqua} />
                <stop offset="50%" stopColor={colors.accentViolet} />
                <stop offset="100%" stopColor={colors.accentAqua} />
              </linearGradient>
              <linearGradient id="orbital-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.accentViolet} />
                <stop offset="50%" stopColor={colors.accentAqua} />
                <stop offset="100%" stopColor={colors.accentViolet} />
              </linearGradient>
              <linearGradient id="orbital-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.accentAqua} />
                <stop offset="50%" stopColor={colors.accentViolet} />
                <stop offset="100%" stopColor={colors.accentAqua} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="logo-text">QOP's<span className="logo-accent">System</span></span>
      </div>

      {/* Toggle */}
      <div className={`navbar__toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* Links */}
      <ul className={`navbar__links ${isOpen ? "open" : ""}`}>
        <li>
          <Link to="/" className={`navbar__link ${isActiveLink("/") ? "active" : ""}`}>
            Q-Home
          </Link>
        </li>

        <li>
          <Link to="/dashboard" className={`navbar__link ${isActiveLink("/dashboard") ? "active" : ""}`}>
            Q-Vision
          </Link>
        </li>

        <li>
          <Link to="/hiring" className={`navbar__link ${isActiveLink("/hiring") ? "active" : ""}`}>
            Q-Execute
          </Link>
        </li>

        {/* ⭐ AUTH AREA */}
        {user ? (
          <>
            {/* Profile */}
            <li>
              <div className="profile-circle">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </li>

            {/* Logout */}
            <li>
              <button className="btn-cta" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" className="btn-cta">
              Login
            </Link>
          </li>
        )}
      </ul>

      {/* CSS */}
<style>{`
        /* CSS Variables */
        :root {
          --bg-dark: ${colors.bgDark};
          --accent-aqua: ${colors.accentAqua};
          --accent-violet: ${colors.accentViolet};
          --text-light: ${colors.textLight};
          --glass-bg: ${colors.glassBg};
          --glass-border: ${colors.glassBorder};
          --logo-bg-indigo: ${colors.logoBgIndigo};
        }

        /* --- Base Styles (Ultra-Slim Profile, High Contrast) --- */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.3rem 2.5rem;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, var(--bg-dark), #00000a);
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.9);
          position: sticky;
          top: 0;
          z-index: 1000;
          color: var(--text-light);
          border-bottom: 1px solid rgba(0, 229, 255, 0.03);
          transition: all 0.4s ease;
        }
        .navbar::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 1.5px;
            background: linear-gradient(90deg, transparent, var(--accent-aqua), var(--accent-violet), transparent);
            filter: blur(1px);
            opacity: 0.6;
        }

        .navbar__logo {
          display: flex;
          align-items: center;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: 0.06rem;
          color: var(--text-light);
          z-index: 1001;
        }

        .logo-text {
            color: var(--text-light);
        }

        .logo-accent {
          background: linear-gradient(90deg, var(--accent-aqua), var(--accent-violet));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* --- Mesmerizing Atom-like Logo Styles & Animations --- */
        @keyframes logo-pulse-glow {
            0% { box-shadow: 0 0 10px rgba(0, 229, 255, 0.6), 0 0 20px rgba(196, 0, 255, 0.3); }
            50% { box-shadow: 0 0 15px rgba(0, 229, 255, 0.8), 0 0 30px rgba(196, 0, 255, 0.5); }
            100% { box-shadow: 0 0 10px rgba(0, 229, 255, 0.6), 0 0 20px rgba(196, 0, 255, 0.3); }
        }

        .quantum-logo-container {
          width: 60px; 
          height: 60px; 
          margin-right: 15px; 
          position: relative;
          border-radius: 50%;
          animation: logo-pulse-glow 6s infinite ease-in-out;
          overflow: hidden;
          background-color: var(--logo-bg-indigo); 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          border: 1px solid rgba(0, 229, 255, 0.1); 
          box-shadow: inset 0 0 10px rgba(0, 229, 255, 0.15); 
        }

        .quantum-logo-svg {
          width: 80%; 
          height: 80%;
          display: block;
        }

        /* Core animation */
        @keyframes core-brightness-pulse {
            0%, 100% { filter: brightness(1) blur(0px); opacity: 0.9; }
            50% { filter: brightness(1.5) blur(0.5px); opacity: 1; }
        }
        .logo-core-glow {
            animation: core-brightness-pulse 4s infinite ease-in-out;
            transform-origin: 50% 50%;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 15px var(--accent-aqua));
        }

        /* Orbital animations */
        @keyframes orbit-1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit-2 { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes orbit-3 { from { transform: rotate(45deg); } to { transform: rotate(405deg); } }

        .logo-orbital {
            transform-origin: 50% 50%;
            fill: none;
            stroke-dasharray: 1;
            opacity: 0.8;
            filter: drop-shadow(0 0 5px currentColor);
        }
        .orbital-1 { animation: orbit-1 15s linear infinite; }
        .orbital-2 { animation: orbit-2 18s linear infinite; }
        .orbital-3 { animation: orbit-3 12s linear infinite; }


        /* Particle animations along paths */
        @keyframes particle-pulse {
            0%, 100% { transform: scale(1) translateY(0px); opacity: 0.9; filter: drop-shadow(0 0 5px currentColor); }
            50% { transform: scale(1.1) translateY(-2px); opacity: 1; filter: drop-shadow(0 0 10px currentColor); }
        }

        .logo-particle {
            transform-origin: 50% 50%;
            animation: particle-pulse 3s infinite ease-in-out;
        }
        .particle-1 { animation-delay: 0s; transform: translate(0px, -20px); filter: drop-shadow(0 0 5px var(--accent-aqua)); }
        .particle-2 { animation-delay: 1s; transform: translate(20px, 0px); filter: drop-shadow(0 0 5px var(--accent-violet)); }
        .particle-3 { animation-delay: 2s; transform: translate(-20px, 0px) rotate(45deg); filter: drop-shadow(0 0 5px var(--accent-aqua)); }


        /* --- Navigation Links (Desktop) --- */
        .navbar__links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 1.8rem;
        }

        .navbar__link {
          text-decoration: none;
          color: var(--text-light);
          font-weight: 500;
          font-size: 0.9rem;
          padding: 0.4rem 0.6rem;
          opacity: 0.7;
          position: relative;
          transition: all 0.3s ease;
          border-radius: 6px;
        }

        /* Active/Hover state styles */
        .navbar__link:hover,
        .navbar__link.active {
          color: var(--accent-aqua);
          opacity: 1;
          transform: translateY(-0.5px);
          text-shadow: 0 0 6px var(--accent-aqua);
          background: rgba(0, 229, 255, 0.03);
        }

        .navbar__link::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -1px;
          width: 0%; 
          height: 1.5px;
          background: linear-gradient(90deg, var(--accent-aqua), var(--accent-violet));
          transform: translateX(-50%) scaleX(0);
          transition: transform 0.3s ease, width 0.3s ease;
          border-radius: 0.75px;
          filter: blur(0.2px);
        }

        /* Active/Hover underline state */
        .navbar__link:hover::after,
        .navbar__link.active::after {
          width: 100%;
          transform: translateX(-50%) scaleX(1);
        }
        
        /* --- CTA Button (Hyper-Focused) --- */
        .btn-cta {
            background: linear-gradient(90deg, var(--accent-aqua), var(--accent-violet));
            color: var(--bg-dark);
            text-decoration: none;
            font-weight: 700;
            padding: 0.5rem 1.2rem;
            border-radius: 5px;
            font-size: 0.85rem;
            box-shadow: 0 3px 12px rgba(0, 229, 255, 0.4);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            position: relative;
        }

        .btn-cta:hover {
            transform: translateY(-1px) scale(1.01);
            box-shadow: 0 5px 18px rgba(0, 229, 255, 0.6);
            filter: brightness(1.15);
        }

        /* --- Mobile Toggle Button (Sleek) --- */
        .navbar__toggle {
          display: none;
          cursor: pointer;
          flex-direction: column;
          gap: 4px;
          z-index: 1001;
        }

        .bar {
          width: 24px;
          height: 2px;
          background-color: var(--accent-aqua);
          transition: all 0.3s ease-in-out; 
          border-radius: 1px;
          box-shadow: 0 0 4px var(--accent-aqua);
        }

        /* --- Mobile Styles (768px and below) --- */
        @media (max-width: 768px) {
          .navbar {
            padding: 0.2rem 1.2rem;
          }

          .navbar__logo {
            font-size: 1.4rem;
            white-space: nowrap; /* FIX: Prevents text wrapping on the logo */
            overflow: hidden; /* Ensures no horizontal scroll if it somehow pushes past edge */
          }

          .quantum-logo-container {
            width: 45px;
            height: 45px;
            margin-right: 10px;
          }
           
          /* Adjust logo specific animations for mobile if needed for performance */
          .logo-orbital { animation-duration: 25s; }
          .logo-core-glow { animation-duration: 6s; }
          .logo-particle { animation-duration: 4s; }


          .navbar__links {
            flex-direction: column;
            width: 85%;
            max-width: 220px;
            text-align: center;
            position: absolute;
            top: 100%;
            right: 0;
            padding: 0.5rem 0;
            
            background: var(--glass-bg);
            backdrop-filter: blur(20px); 
            -webkit-backdrop-filter: blur(20px);
            border-radius: 0 0 12px 12px;
            border: 1px solid var(--glass-border);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7);
            box-shadow: inset 0 0 8px rgba(0, 229, 255, 0.1), 0 8px 25px rgba(0, 0, 0, 0.7); 

            transform: scaleY(0.98);
            transform-origin: top;
            opacity: 0;
            pointer-events: none;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-in-out;
          }

          .navbar__links.open {
            transform: scaleY(1);
            opacity: 1;
            pointer-events: all;
          }
          
          .navbar__links li {
            padding: 0.1rem 0;
            width: 90%;
            margin: 0 auto;
          }

          .navbar__links a {
            font-size: 0.9rem;
            padding: 0.6rem 1rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          }

          .btn-cta {
            padding: 0.6rem 1.2rem;
            margin-top: 0.4rem;
            width: 90%;
            font-size: 0.9rem;
          }

          .navbar__toggle {
            display: flex;
          }

          /* Hamburger to X transition */
          .navbar__toggle.open .bar:nth-child(1) {
            transform: rotate(-45deg) translate(-4px, 4px); 
            background-color: var(--accent-violet);
          }
          .navbar__toggle.open .bar:nth-child(2) {
            opacity: 0;
          }
          .navbar__toggle.open .bar:nth-child(3) {
            transform: rotate(45deg) translate(-4px, -4px);
            background-color: var(--accent-aqua);
          }
        }
           .profile-circle{
          width:38px;
          height:38px;
          border-radius:50%;
          border:2px solid ${colors.accentAqua};
          display:flex;
          align-items:center;
          justify-content:center;
          color:${colors.accentAqua};
          font-weight:bold;
        }
      `}</style>
    </nav>
  );
}
