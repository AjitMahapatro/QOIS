import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useIsFetching } from "@tanstack/react-query"; // Import useIsFetching
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

/* =========================================================
   ULTRA ADVANCED NEON + GLASSMORPHIC STYLES
   (Full screen & card arrangement fixes applied here)
========================================================= */
const styles = `
/* FIX: 1. Full screen/White space fix: Remove default margin/padding from browser */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden; /* Prevent horizontal scrollbars/extra space */
}

:root {
  --qd-bg-dark: #000000;
  --qd-card-dark: #00224D ;
  --qd-border-dark: rgba(129, 140, 248, 0.55);
  --qd-text-dark: #e5e7ff;
}

.qd-container {
  min-height: 100vh;
  padding: 21px 34px 4px;
  background: var(--qd-bg-dark);
  color: var(--qd-text-dark);
  font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* animated grid background */
.qd-container::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(148,163,255,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,255,0.08) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
  z-index: 0;
  animation: gridMove 40s linear infinite;
  pointer-events: none;
}
@keyframes gridMove {
  0% { transform: translate3d(0,0,0); }
  100% { transform: translate3d(-80px,-80px,0); }
}

.qd-inner {
  position: relative;
  z-index: 1;
}.qd-card {
  border-radius: 20px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;

  /* 🌌 SUBTLE NEON BG — cyan, indigo, violet */
  background:
    radial-gradient(circle at 25% 20%, rgba(139,92,246,0.15), transparent 40%),  /* violet glow */
    radial-gradient(circle at 70% 80%, rgba(6,182,212,0.12), transparent 45%),   /* cyan glow */
    radial-gradient(circle at 60% 10%, rgba(99,102,241,0.10), transparent 40%),  /* indigo hint */
    linear-gradient(160deg,#040612,#0b0f2a 50%,#040612);

  border: 1px solid rgba(139,92,246,0.20);

  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);

  box-shadow:
    0 8px 25px rgba(0,0,0,0.5),
    0 0 15px rgba(139,92,246,0.15),
    inset 0 1px 1px rgba(255,255,255,0.05);

  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 🌈 MOVING NEON BORDER */
.qd-card::before {
  content:"";
  position:absolute;
  inset:-1px;
  border-radius:inherit;
  padding:1.5px;

  background:linear-gradient(
    120deg,
    #0ea5e9,  /* cyan */
    #6366f1,  /* indigo */
    #8b5cf6,  /* violet */
    #0ea5e9
  );

  background-size:300% 300%;
  animation:borderMove 6s linear infinite;

  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;

  opacity:.7; /* subtle border glow */
  pointer-events:none;
}

/* ✨ HOVER EFFECT */
.qd-card:hover {
  transform: translateY(-4px) scale(1.01);

  box-shadow:
    0 0 15px rgba(139,92,246,.3),
    0 0 25px rgba(6,182,212,.25),
    0 10px 25px rgba(0,0,0,0.5);
}

/* 🔁 BORDER ANIMATION */
@keyframes borderMove {
  0% { background-position:0% 50%; }
  50% { background-position:100% 50%; }
  100% { background-position:0% 50%; }
}


/* header */
.qd-header {
  display: flex;
  flex-direction: column; 
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  position: relative; 
}
.qd-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}
.qd-title-main {
  font-size: 40px; 
  font-weight: 700;
  letter-spacing: 0.24em;
  white-space: nowrap;
  overflow: hidden;
  animation: typing 2.2s steps(26, end), blink-caret 1.1s step-end infinite;
}
.qd-title-sub {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
  text-align: center; 
   margin-bottom:25px;
}

/* orb */
.qd-orb {
  width: 70px;
  height: 70px;
  border-radius: 999px;
  background: radial-gradient(circle at 28% 28%, #2df916, #7c3aed);
  position: relative;
  box-shadow:
    0 0 30px rgba(168,85,247,0.8),
    0 0 90px rgba(56,189,248,0.8);
  animation: orb-spin 4.5s linear infinite;
}


/* controls */
.qd-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute; 
  top: 0; 
  right: 0;
}
.qd-chip-btn {
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11px;
  border: 1px solid rgba(148,163,255,0.7);
  background: rgba(15,23,42,0.7);
  color: var(--qd-text-dark);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.qd-chip-btn span.dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 12px #22c55e;
}

/* notification */
.qd-notice {
  margin-top: 12px;
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(250,204,21,0.5);
  background: radial-gradient(circle at left, rgba(250,204,21,0.24), transparent);
  font-size: 12px;
}

/* stats */
.qd-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 16px;
  margin-bottom: 22px;
}
.qd-stat-card {
  padding: 18px 20px;
  border-radius: 18px;
  position: relative;
  overflow: hidden;

  background:
    radial-gradient(circle at 20% 15%, rgba(0,240,255,0.18), transparent 40%),
    radial-gradient(circle at 80% 85%, rgba(139,92,246,0.18), transparent 45%),
    linear-gradient(180deg, #020617, #020617);

  border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer;

  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

/* 🌈 NEON SLIDING BORDER */
.qd-stat-card::before {
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
.qd-stat-card::after {
  content: "";
  position: absolute;
  inset: -50%;
  
  animation: glowSpin 12s linear infinite;
  opacity: 0.45;
  pointer-events: none;
}

/* 🖱️ HOVER = FULL NEON BLAST */
.qd-stat-card:hover {
  transform: translateY(-5px) scale(1.04);

  box-shadow:
    0 0 20px rgba(0,240,255,.6),
    0 0 40px rgba(139,92,246,.5),
    0 0 60px rgba(255,47,211,.4);
}

/* 📝 TEXT HIGHLIGHT */
.qd-stat-label {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #f1f5f9;
  text-shadow:
    0 0 8px rgba(0, 17, 255, 0.6),
    0 0 16px rgba(139,92,246,0.35);
}

.qd-stat-value {
  margin-top: 8px;
  font-size: 34px;
  font-weight: 800;
  color: ;
  text-shadow:
    0 0 12px rgba(17, 0, 255, 0.9),
    0 0 30px rgba(139,92,246,0.6),
    0 0 45px rgba(255,47,211,0.45);
}

/* 🔁 ANIMATIONS */
@keyframes neonBorderSlide {
  0%   { background-position:   0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position:   0% 50%; }
}


/* layout */
.qd-row {
  display: grid;
  grid-template-columns: 2.2fr 1.4fr;
  gap: 18px;
  margin-bottom: 22px;
}
.qd-row-bottom {
  display: grid;
  grid-template-columns: 1.6fr 1.4fr;
  gap: 18px;
}

/* card header */
.qd-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 3;
}

/* 🧬 QUANTUM NEON HEADER BAR */
.qd-card-header-bar {
  margin: -18px -20px 18px;
  padding: 16px 22px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255,255,255,0.12);

  /* ✅ Background FIXED */
  background:
    radial-gradient(circle at 82% 72%, rgba(168,85,247,0.28), transparent 52%),
    linear-gradient(120deg,#020617,#020617,#0b1120,#020617);

  background-size: 600% 600%;
  animation: quantumFlow 12s linear infinite;

  border-top-left-radius: 22px;
  border-top-right-radius: 22px;

  backdrop-filter: blur(14px);

  box-shadow:
    inset 0 1px 22px rgba(56,189,248,0.28),
    inset 0 -1px 12px rgba(139,92,246,0.22),
    0 10px 30px rgba(0,0,0,0.45);
}


.qd-card-header-bar::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1.5px;
  border-radius: inherit;

  background: linear-gradient(
    120deg,
    #00f0ff,
    #8b5cf6,
    #ff2fd3,
    #00f0ff
  );
  background-size: 400% 400%;
  animation: borderSlide 6s linear infinite;

  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;

  opacity: 0.9;
  pointer-events: none;
}

.qd-card-header-bar::after {
  content: "";
  position: absolute;
  inset: 0;

  background: linear-gradient(
    120deg,
    transparent 30%,
    rgba(255,255,255,0.25),
    transparent 70%
  );

  animation: lightSweep 4.5s ease-in-out infinite;
  mix-blend-mode: overlay;
  pointer-events: none;
}
/* 📝 TITLE GRADIENT */
.qd-card-header-bar .qd-card-title {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.6px;

  background: linear-gradient(
    90deg,
    #00f0ff,
    #8b5cf6,
    #ff2fd3,
    #00f0ff
  );
  background-size: 200% auto;

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  animation: titleShimmer 6s linear infinite;
}
/* 🧾 SUBTITLE — COOL CYAN TONE */
.qd-card-header-bar .qd-card-sub {
  font-size: 12px;
  margin-top: 4px;
  color: #bdf3ff;
  opacity: 0.95;

  text-shadow:
    0 0 8px rgba(0,240,255,0.45),
    0 0 14px rgba(139,92,246,0.3);
}
/* 🔁 ANIMATIONS */
@keyframes quantumFlow {
  0% {background-position:0% 50%}
  50% {background-position:100% 50%}
  100% {background-position:0% 50%}
}

@keyframes borderSlide {
  0% {background-position:0% 50%}
  50% {background-position:100% 50%}
  100% {background-position:0% 50%}
}

@keyframes lightSweep {
  0% {transform: translateX(-100%)}
  50% {transform: translateX(100%)}
  100% {transform: translateX(100%)}
}





/* live pill */
.qd-live-pill {
  font-size: 11px;
  border-radius: 999px;
  padding: 4px 9px;
  border: 1px solid rgba(248,113,113,0.7);
  background: rgba(127,29,29,0.6);
  color: #fecaca;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.qd-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #f97373;
  box-shadow: 0 0 10px #fecaca;
  animation: livePulse 1s infinite;
}
@keyframes livePulse {
  0% { transform: scale(0.8); opacity:0.4; }
  50% { transform: scale(1); opacity:1; }
  100% { transform: scale(0.8); opacity:0.4; }
}

/* chart wrapper */
.qd-chart-wrapper {
  margin-top: 10px;
  width: 100%;
  height: 240px;
}

/* filters */
.qd-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.qd-filter-group {
  display: flex;
  flex-direction: column;
  font-size: 11px;
  min-width: 138px;
}
.qd-filter-input, .qd-filter-select {
  margin-top: 4px;
  padding: 6px 8px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,255,0.7);
  background: black;
  color: var(--qd-text-dark);
  font-size: 12px;
}
.qd-filter-input::placeholder {
  color: #9ca3af;
}

/* AI pill */
.qd-ai-pill {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: radial-gradient(circle at left, #22c55e44, transparent);
  border: 1px solid rgba(34,197,94,0.7);
  color: #bbf7d0;
  animation: aiPulse 1.8s infinite ease-in-out;
}
.qd-ai-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 12px #22c55e;
}
@keyframes aiPulse {
  0%,100% { transform: translateY(0); opacity:0.8; }
  50% { transform: translateY(-2px); opacity:1; }
}

/* tabs for detail panel */
.qd-tab-row {
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(15,23,42,0.8);
}
.qd-tab-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.6;
  transition: all 0.18s ease;
}
.qd-tab-pill.active {
  background: radial-gradient(circle at top, #4f46e5, #22c55e);
  color: white;
  opacity: 1;
  box-shadow: 0 0 12px rgba(129,140,248,0.9);
}

/* table */
.qd-table-wrapper {
  margin-top: 10px;
  overflow-x: auto;
}
.qd-table {
  width: 100%;
  border-collapse: collapse;
}
.qd-table th,
.qd-table td {
  padding: 8px 11px;
  border-bottom: 1px solid rgba(148,163,255,0.16);
  font-size: 12px;
}
.qd-table th {
  text-align: left;
  font-weight: 500;
  opacity: 0.82;
}
.qd-table tr:hover {
  background: rgba(79,70,229,0.25);
  cursor: pointer;
}
.qd-row-selected {
  background: rgba(129,140,248,0.35);
}
.qd-table tr:hover td:nth-child(1) {
  color: #3b82f6;
  font-weight: 600;
  transition: color 0.15s ease;
}
.qd-table tr:hover td:nth-child(5) {
  color: #22c55e;
  font-weight: 600;
  transition: color 0.15s ease;
}

/* status pill */
.qd-status {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
}
.qd-status-operational {
  background: rgba(22,163,74,0.18);
  color: #4ade80;
  border: 1px solid rgba(22,163,74,0.7);
}
.qd-status-offline {
  background: rgba(239,68,68,0.16);
  color: #fecaca;
  border: 1px solid rgba(248,113,113,0.7);
}

/* status list */
.qd-status-list {
  margin-top: 10px;
  font-size: 12px;
}
.qd-status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

/* dev panel */
.qd-dev-panel {
  margin-top: 10px;
  max-height: 220px;
  overflow: auto;
  padding: 8px;
  border-radius: 10px;
  background: #020617;
  border: 1px solid rgba(148,163,255,0.4);
  font-size: 11px;
}

/* export button */
.qd-export-btn {
  font-size: 11px;
  border-radius: 999px;
  padding: 5px 11px;
  border: 1px solid rgba(59,130,246,0.8);
  background: radial-gradient(circle at top, rgba(59,130,246,0.55), rgba(15,23,42,0.85));
  color: #dbeafe;
  cursor: pointer;
}

/* mini tag */
.qd-mini-tag {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,255,0.7);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.8;
}

/* Backend Card Row */
.qd-backend-grid {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 16px;
  margin-top: 20px;
  padding-bottom: 8px;
}

.qd-backend-card {
  padding: 18px;
  min-height: 175px;
  width: 415px; 
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  /* FIX 2: Ensure 2px border space is reserved to prevent overlap/shift */
  border: 2px solid rgba(129, 140, 248, 0.0);
}
.qd-backend-card:hover {
  transform: translateY(-2px) scale(1.01);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 
    0 0 0 1px rgba(129,140,248,0.8),
    0 26px 70px rgba(15,23,42,0.95);
}


.qd-backend-card-selected {
  /* FIX 2: Only apply the desired color/shadow, keep 2px border, and remove scaling */
  border: 2px solid #38bdf8 !important;
  box-shadow: 0 0 20px rgba(56,189,248,0.5) !important;
  /* transform: scale(1.02) !important; is now removed to prevent overlap/shifting */
  /* 🌈 BASE CARD WITH STATIC BORDER COLOR */
.qd-backend-card {
  padding: 24px;
  min-height: 180px;
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  background: 
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.08), transparent 40%),
    rgba(15, 23, 42, 0.95);
  
  backdrop-filter: blur(10px);
  border-radius: 20px;

  /* Unclicked state border: Subtle Grey-Blue */
  border: 1px solid rgba(129, 140, 248, 0.2);
  
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 🌈 MOVING NEON BORDER (Visible even when unclicked but faint) */
.qd-backend-card::after {
  content: "";
  position: absolute;
  inset: 0;
  padding: 2px; 
  border-radius: inherit;
  
  /* Neon Gradient Colors */
  background: linear-gradient(
    120deg,
    #00f0ff,
    #8b5cf6,
    #ff2fd3,
    #00f0ff
  );
  background-size: 300% 300%;
  animation: borderRotate 8s linear infinite;
  
  -webkit-mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  
  /* UNCLICKED STATE: Low opacity glow */
  opacity: 0.25; 
  transition: opacity 0.3s ease, filter 0.3s ease;
}

/* 🖱️ HOVER: Glow increases */
.qd-backend-card:hover::after {
  opacity: 0.7;
  filter: brightness(1.2);
}

/* ✅ SELECTED / CLICKED STATE: Full Brightness & Glow */
.qd-backend-card-selected {
  border: 1px solid rgba(56, 189, 248, 0.5) !important;
  background: rgba(15, 23, 42, 1);
  box-shadow: 0 0 25px rgba(56, 189, 248, 0.2);
}

.qd-backend-card-selected::after {
  opacity: 1 !important;
  filter: drop-shadow(0 0 5px rgba(0, 240, 255, 0.5));
  animation-duration: 4s; /* Speed up animation when selected */
}

/* 🔁 ANIMATION */
@keyframes borderRotate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
}

.qd-backend-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.qd-backend-name {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: lowercase;
}
.qd-backend-version {
  font-size: 12px;
  opacity: 0.7;
}

.qd-backend-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  align-items: flex-end;
}
.qd-backend-info-item {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}
.qd-backend-info-label {
  opacity: 0.7;
  margin-bottom: 2px;
}
.qd-backend-info-value {
  /* New styling for increased number size */
  font-size: 32px; 
  font-weight: 700;
  line-height: 1;
}
.qd-backend-status-value {
  font-size: 20px;
  font-weight: 700;
  color: #4ade80;
}
.qd-backend-status-offline .qd-backend-status-value {
  color: #f97373;
}
.qd-backend-type {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 12px;
}
.qd-backend-active {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 10px;
}

/* responsive */
@media (max-width: 1100px) {
  /* Enhanced Responsiveness: Single column layout for main rows */
  .qd-row, .qd-row-bottom {
    grid-template-columns: 1fr;
  }
  .qd-stats-grid {
    /* Enhanced Responsiveness: Two columns for stats grid on smaller screens */
    grid-template-columns: repeat(2, minmax(0,1fr));
  }
}
@media (max-width: 700px) {
  .qd-container {
    padding: 18px 16px 2px;
  }
  .qd-title-main {
    font-size: 32px; 
    letter-spacing: 0.16em;
  }
  .qd-controls {
    top: 10px; 
    right: 16px;
  }
  .qd-stats-grid {
    /* Enhanced Responsiveness: Single column for stats grid on very small screens */
    grid-template-columns: 1fr; 
  }
  .qd-header {
      margin-bottom: 24px;
  }
  .qd-orb {
      width: 50px;
      height: 50px;
  }
}

.copyright {
    /* Updated copyright style for better dark theme integration */
    background: #08001F; /* Very dark background */
    width: 100%;
    max-width: 100vw;
    text-align: center;
    padding: 20px 0; 
    border-top: 1px solid rgba(148,163,255,0.1);
    font-size: 12px; 
    color: #9ca3af; /* Soft gray text */
    margin-top: 30px; /* Space from content */
}




.qd-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(56, 189, 248, 0.2);
    border-top: 5px solid #38bdf8; /* Neon blue */
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-shadow: 0 0 15px #38bdf8, inset 0 0 8px #38bdf888;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.qd-loading-text {
    margin-top: 20px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: #a5b4fc; /* Light purple-blue */
    animation: pulse 1.5s infinite;
}
@keyframes pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
}
    .atom-orbits{
  position:absolute;
  inset:0;

  display:flex;
  align-items:center;

  padding-left:1034px;   /* right side placement */
  transform-style:preserve-3d;
}



/* Base orbit */
.qd-orb-ring{
  position:absolute;
  width:70px;        /* reduced size */
  height:40px;        /* reduced size */
  border-radius:50%;
  pointer-events:none;

  animation: orbitSpin linear infinite;
}

/* Ring 1 – Pink Neon */
.ring-1{
  border:1.2px solid rgba(255,170,220,0.95);
  box-shadow:
    0 0 6px rgba(255,170,220,0.9),
    0 0 16px rgba(255,140,200,0.6),
    0 0 28px rgba(255,120,190,0.4);

  transform: rotateX(65deg);
  animation-duration:14s;
}

/* Ring 2 – Violet Neon */
.ring-2{
  border:1.2px solid rgba(200,160,255,0.95);
  box-shadow:
    0 0 6px rgba(200,160,255,0.9),
    0 0 16px rgba(180,130,255,0.6),
    0 0 28px rgba(160,110,255,0.4);

  transform: rotateY(65deg);
  animation-duration:18s;
}

/* Ring 3 – Soft Blue Neon */
.ring-3{
  border:1.2px solid rgba(150,220,255,0.95);
  box-shadow:
    0 0 6px rgba(150,220,255,0.9),
    0 0 16px rgba(120,200,255,0.6),
    0 0 28px rgba(100,180,255,0.4);

  transform: rotateX(65deg) rotateY(65deg);
  animation-duration:22s;
}
.atom-core{
  position:relative;
  width:80px;     /* slightly larger than rings */
  height:80px;

  display:flex;
  justify-content:center;
  align-items:center;

  transform-style:preserve-3d;
}

/* Atom orbit motion */
@keyframes orbitSpin{
  from{
    transform: rotateZ(0deg);
  }
  to{
    transform: rotateZ(360deg);
  }
}
.atom-nucleus{
  position:absolute;   /* 🔑 */
  width:14px;
  height:14px;
  border-radius:50%;

  background: radial-gradient(
    circle,
    #fff2ff 0%,
    #ffd6ff 40%,
    #d9a7ff 70%,
    transparent 75%
  );

  box-shadow:
    0 0 8px rgba(255,214,255,0.9),
    0 0 18px rgba(207,168,255,0.9),
    0 0 32px rgba(180,130,255,0.6);

  animation: nucleusPulse 2.8s ease-in-out infinite;
}
/* ────────────────────────────────────────────────
   MOBILE IMPROVEMENTS (≤ 700px)
   ──────────────────────────────────────────────── */

@media (max-width: 700px) {

  .qd-container {
    padding: 16px 14px 8px;   /* more bottom space for copyright */
  }

  .qd-header {
    margin-bottom: 28px;
  }

  .qd-title-main {
    font-size: 2.1rem;          /* 33–34px */
    letter-spacing: 0.18em;
    animation: none;            /* typing animation usually looks bad on mobile */
    border-right: none;         /* remove caret */
    white-space: normal;
    text-align: center;
  }

  .qd-title-sub {
    font-size: 11px;
    line-height: 1.4;
     text-align: center;
  }

  /* Atom orbits – hide or make much smaller on mobile */
  .atom-orbits {
    display: none;              /* ← most common & cleanest choice */
    /* Alternative: scale down heavily
    transform: scale(0.45);
    padding-left: 0;
    justify-content: center;
    inset: auto;
    top: -20px;
    */
  }

  .qd-stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .qd-stat-value {
    font-size: 26px;           /* slightly smaller than desktop 32px */
  }

  .qd-row,
  .qd-row-bottom {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* Backend horizontal scroll cards */
  .qd-backend-grid {
    gap: 14px;
    padding-bottom: 12px;
  }

  .qd-backend-card {
    width: 320px;               /* fixed comfortable width */
    min-height: 160px;
    padding: 16px;
  }

  .qd-backend-name {
    font-size: 1.4rem;          /* 22–23px */
  }

  .qd-backend-info {
    grid-template-columns: repeat(2, 1fr);   /* 3 → 2 columns */
    gap: 12px;
  }

  .qd-backend-info-value {
    font-size: 26px;
  }

  /* Charts – give more vertical space */
  .qd-chart-wrapper {
    height: 260px !important;   /* ← important override */
    margin-top: 12px;
  }

  /* Filters – stack more naturally */
  .qd-filter-row {
    flex-direction: column;
    gap: 14px;
  }

  .qd-filter-group {
    min-width: auto;
    width: 100%;
  }

  .qd-filter-input,
  .qd-filter-select {
    font-size: 13px;
    padding: 8px 12px;
  }

  /* Card headers become too tall on mobile → reduce padding */
  .qd-card-header-bar {
    margin: -16px -16px 14px;   /* match reduced card padding */
    padding: 12px 16px;
  }

  .qd-card-title {
    font-size: 16px;
  }

  .qd-card-sub {
    font-size: 11px;
  }

  /* Deep view tabs – make them smaller & scrollable if needed */
  .qd-tab-row {
    font-size: 11px;
    padding: 3px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .qd-tab-pill {
    padding: 5px 10px;
    font-size: 11px;
  }

  /* Prediction / Details big numbers */
  div[style*="font-size: 40"] {
    font-size: 2.4rem !important;
  }

  /* Status list & small texts */
  .qd-status-list,
  .qd-status-item {
    font-size: 12.5px;
  }

  /* Copyright – make sure it's readable */
  .copyright {
    font-size: 11px;
    padding: 24px 14px;
    margin-top: 40px;
  }
}

/* Extra small phones (≤ 380–400px) */
@media (max-width: 420px) {
  .qd-title-main {
    font-size: 1.9rem;
    letter-spacing: 0.14em;
  }

  .qd-backend-card {
    width: 100%;               /* almost full width on tiny screens */
    min-width: unset;
  }

  .qd-backend-info {
    grid-template-columns: 1fr;   /* stack vertically */
  }

  .qd-chart-wrapper {
    height: 220px !important;
  }

  .qd-stat-value {
    font-size: 22px;
  }
}
`;

// ===== Helpers =====
const API_BASE = "https://quantum-jobs-tracker-l3jz.onrender.com/api";

function computeScore(b) {
  const qubitScore = b.qubits || 0;
  const queueScore = b.queue > 0 ? 1000 / (1 + b.queue) : 1000;
  return qubitScore * 2 + queueScore;
}

const REGION_MAP = {
  ibm_fez: "Europe",
  ibm_marrakesh: "Europe",
  ibm_torino: "Europe",
};

// Helper to format seconds into a readable string (e.g., 1h 30m)
const formatSeconds = (seconds) => {
  if (seconds === undefined || seconds === null || seconds < 0) return "N/A";

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "< 1m";
  }
};

// API call to fetch all backends
async function fetchBackends() {
  const res = await fetch(`${API_BASE}/backends`);
  const json = await res.json();
  const backends = json.data || [];

  return backends.map((b, idx) => ({
    id: idx,
    name: b.name,
    type: b.is_simulator ? "simulator" : "hardware",
    status: b.operational ? "operational" : "offline",
    qubits: b.num_qubits,
    queue: b.queue_length,
    region: REGION_MAP[b.name] || "Unknown",
    version: b.version,
  }));
}

// API call to fetch full backend details
async function fetchBackendDetails(backendName) {
  const res = await fetch(`${API_BASE}/backends/${backendName}/details`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to load backend details");
  return json.data;
}

// API call to fetch backend analytics
async function fetchBackendAnalytics(backendName) {
  const res = await fetch(`${API_BASE}/backends/${backendName}/analytics`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to load analytics");
  return json.data;
}

/**
 * ✅ History API – aligned with OLD working dashboard
 * Returns raw rows: { snapshot_time, queue_length, ... }
 */
async function fetchQueueHistoryLive(backendName) {
  const res = await fetch(
    `${API_BASE}/history?backend_name=${backendName}&limit=200`
  );
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to load history");
  return json.data || [];
}

/**
 * Live API call to fetch wait time prediction
 */
async function fetchWaitPrediction(backendName) {
  const res = await fetch(
    `${API_BASE}/predict_wait?backend_name=${backendName}`
  );
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to load prediction");
  return json; // { ok: true, estimate_seconds: N, median_queue_length: M }
}

/* =========================================================
   REUSABLE COUNTUP ANIMATION COMPONENT
========================================================= */
const easing = [0.42, 0, 0.58, 1.0]; // easeInOut custom

const CountUp = ({ end, duration = 1.2, formatter = (n) => n }) => {
  const [count, setCount] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    // Round the end value to ensure we count up to the integer value
    const final = Math.round(end);

    let frameId;
    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = timestamp - startRef.current;
      const timeRatio = Math.min(1, progress / (duration * 1000));
      
      // Use the easing curve for a smoother effect
      const easedTime = easing[0] * Math.pow(timeRatio, 3) +
                       easing[1] * Math.pow(timeRatio, 2) +
                       easing[2] * timeRatio +
                       easing[3] * Math.pow(timeRatio, 4) +
                       (1 - easing[0] - easing[1] - easing[2] - easing[3]) * Math.pow(timeRatio, 5);

      const currentValue = Math.round(easedTime * final);
      setCount(currentValue);

      if (timeRatio < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [end, duration]);

  // Use the formatter on the current animated count
  return <>{formatter(count)}</>;
};


/* =========================================================
   CUSTOM TOOLTIP COMPONENT (For Bar Chart Hover)
========================================================= */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const backendName = label;
    const queueValue = payload[0].value;

    const nameColor = "#38bdf8";
    const queueColor = "#f472b6";

    return (
      <div className="qd-card" style={{ padding: "10px 14px", minWidth: 150 }}>
        <div style={{ color: nameColor, fontWeight: 600, fontSize: 14 }}>
          {backendName}
        </div>
        <div style={{ color: queueColor, fontWeight: 700, marginTop: 4 }}>
          queue: {queueValue}
        </div>
      </div>
    );
  }

  return null;
};

/* =========================================================
   CUSTOM TOOLTIP COMPONENT (For Line Chart Hover)
   NOTE: This component is defined inline within the Dashboard 
   function to access the dark theme colors and be fully transparent.
========================================================= */
const LineChartCustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = new Date(label * 1000);
    const time = d.toLocaleTimeString();
    const queue = payload[0].value;
    
    // Custom style for the LineChart Tooltip (transparent/dark)
    return (
      <div
        style={{
          // Target style: make transparent and use dark theme colors
          background: "rgba(19, 13, 48, 0.95)", // Slightly darker than qd-card-dark for contrast
          padding: "10px 14px",
          border: "1px solid rgba(129, 140, 248, 0.65)", // Use a faint border
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(5px)",
          color: "#e5e7ff", // qd-text-dark
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#38bdf8", // Blue neon color
            fontWeight: "bold",
            fontSize: 13,
          }}
        >
          {time}
        </p>
        <p
          style={{
            margin: 0,
            color: "#f472b6", // Pink neon color
            fontWeight: "bold",
            fontSize: 13,
            marginTop: 4,
          }}
        >
          queue : {queue}
        </p>
      </div>
    );
  }
  return null;
};

/* =========================================================
   PRELOADER COMPONENT
========================================================= */




/* =========================================================
   MAIN DASHBOARD
========================================================= */
export default function Dashboard() {
  const [selectedId, setSelectedId] = useState(null);
  const [minQubits, setMinQubits] = useState(0);
  const [maxQueue, setMaxQueue] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("queue");
  const [compareIds, setCompareIds] = useState([]);
  const [showDev, setShowDev] = useState(false);
  const [notification, setNotification] = useState(null);
  const [detailTab, setDetailTab] = useState("prediction"); // prediction | details | analytics
  const [isDataLoaded, setIsDataLoaded] = useState(false); // New state to track initial data load

  // Load prefs
  useEffect(() => {
    const savedMin = localStorage.getItem("qd-minQubits");
    if (savedMin) setMinQubits(Number(savedMin));
  }, []);

  useEffect(() => {
    localStorage.setItem("qd-minQubits", String(minQubits));
  }, [minQubits]);

  // Use useIsFetching to globally track pending queries
  const isFetching = useIsFetching();

  const { data: backends = [], isLoading: backendsLoading } = useQuery({
    queryKey: ["backends"],
    queryFn: fetchBackends,
    refetchInterval: 20000,
  });
  
  // Set isDataLoaded to true once the initial backends query completes successfully
  useEffect(() => {
      if (!backendsLoading && backends.length > 0 && !isDataLoaded) {
          setIsDataLoaded(true);
      }
  }, [backendsLoading, backends.length, isDataLoaded]);

  // Derived analytics
  const analytics = useMemo(() => {
    const totalQueue = backends.reduce((sum, b) => sum + (b.queue || 0), 0);
    const busiest =
      backends.length > 0
        ? backends.reduce(
            (best, b) => (b.queue > (best.queue || 0) ? b : best),
            backends[0]
          )
        : null;
    return {
      totalQueue,
      busiestName: busiest?.name || "-",
    };
  }, [backends]);

  // Filters & sort
  const filtered = useMemo(() => {
    let list = backends;

    if (minQubits > 0) list = list.filter((b) => b.qubits >= minQubits);
    if (maxQueue !== null) list = list.filter((b) => b.queue <= maxQueue);
    if (typeFilter !== "all") list = list.filter((b) => b.type === typeFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(s));
    }

    if (sortBy === "queue") list = [...list].sort((a, b) => a.queue - b.queue);
    else if (sortBy === "qubits")
      list = [...list].sort((a, b) => b.qubits - a.qubits);
    else if (sortBy === "score")
      list = [...list].sort((a, b) => computeScore(b) - computeScore(a));

    return list;
  }, [backends, minQubits, maxQueue, typeFilter, search, sortBy]);

  // Ensure a selected backend is set on initial load or filter change
  useEffect(() => {
      if (!selectedId && filtered.length > 0) {
          setSelectedId(filtered[0].id);
      } else if (selectedId && !filtered.find(b => b.id === selectedId)) {
          // If selected backend is filtered out, select the first one
          setSelectedId(filtered.length > 0 ? filtered[0].id : null);
      }
  }, [filtered, selectedId]);

  const selected = filtered.find((b) => b.id === selectedId) || filtered[0];
  const selectedName = selected?.name;

  // Notification
  useEffect(() => {
    if (!backends.length) return;
    const heavy = backends.find((b) => b.queue > 10000);
    if (heavy) {
      setNotification(
        `⚠️ High global queue detected on ${heavy.name} (${heavy.queue} jobs). AI suggests switching to a lighter backend.`
      );
    } else {
      setNotification(null);
    }
  }, [backends]);

  // Recommendation
  const recommendation = filtered.length
    ? [...filtered].sort((a, b) => computeScore(b) - computeScore(a))[0]
    : null;

  // details + analytics queries for selected backend
  const {
    data: details,
    isLoading: detailsLoading,
    isError: detailsError,
  } = useQuery({
    queryKey: ["backend-details", selectedName],
    queryFn: () => fetchBackendDetails(selectedName),
    enabled: !!selectedName,
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useQuery({
    queryKey: ["backend-analytics", selectedName],
    queryFn: () => fetchBackendAnalytics(selectedName),
    enabled: !!selectedName,
  });

  // Queue History Query - fetches raw data (snapshot_time + queue_length)
  const {
    data: rawQueueHistory = [],
    isLoading: historyLoading,
  } = useQuery({
    queryKey: ["queue-history", selectedName],
    queryFn: () => fetchQueueHistoryLive(selectedName),
    enabled: !!selectedName,
    refetchInterval: 60000 * 5,
  });

  // Wait Prediction Query
  const {
    data: waitPrediction,
    isLoading: predictionLoading,
    isError: predictionError,
  } = useQuery({
    queryKey: ["wait-prediction", selectedName],
    queryFn: () => fetchWaitPrediction(selectedName),
    enabled: !!selectedName,
    refetchInterval: 60000,
  });

  // Compare
  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [prev[1], prev[2], id];
      return [...prev, id];
    });
  };

  const compareBackends = compareIds
    .map((id) => backends.find((b) => b.id === id))
    .filter(Boolean);

  // Export Backend List
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(backends, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quantum-backends-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export History – now exports raw rows (like old dashboard)
  const handleHistoryExport = () => {
    if (!rawQueueHistory.length) {
      alert("No history data to export.");
      return;
    }
    const dataToExport = rawQueueHistory; // already in backend format
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedName}-queue-history.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Only using dark theme
  const containerClass = `qd-container`;
  const totalQueue = analytics.totalQueue;

  // prepare analytics charts from analyticsData
  const t1Data =
    analyticsData?.t1_distribution?.slice(0, 40).map((d) => ({
      qubit: `q${d.qubit}`,
      value: d.t1,
    })) || [];
  const t2Data =
    analyticsData?.t2_distribution?.slice(0, 40).map((d) => ({
      qubit: `q${d.qubit}`,
      value: d.t2,
    })) || [];
  const readoutData =
    analyticsData?.readout_error_distribution?.slice(0, 40).map((d) => ({
      qubit: `q${d.qubit}`,
      value: d.readout_error ?? d.error ?? d.p ?? 0,
    })) || [];

  const summary = analyticsData?.summary || {};
  const basic = details?.basic_info || {};
  const config = details?.configuration || {};
  const status = details?.status || {};
  const calibration = details?.calibration || {};

  // Check for global loading state. We only show the preloader on the initial load.
 
  return (
      <>
        <style>{styles}</style>
        
        
        
        {/* Main Dashboard Content */}
        <div className={containerClass}>
            <div className="qd-inner">
              {/* HEADER */}
              <div className="qd-header">
                <motion.div
                  className="qd-title-wrap"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <div className="qd-title-main">QUANTUM INTELLIGENCE DASHBOARD</div>
                    <div className="qd-title-sub">
                      Live IBM backend insights • QID recommendations • Quantum analytics
                    </div>
                  </div>
                  


                </motion.div>
              </div>

              {/* Notification */}
              {notification && <div className="qd-notice">{notification}</div>}

              {/* STATS */}
              {/* NOTE: Stats cards are small and don't need the large header bar */}
              <motion.div
                className="qd-stats-grid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="qd-stat-card">
                  <div className="qd-stat-label">Total Backends</div>
                  <div className="qd-stat-value">
                    {/* CountUp Animation */}
                    <CountUp end={backends.length} />
                  </div>
                </div>
                <div className="qd-stat-card">
                  <div className="qd-stat-label">Hardware</div>
                  <div className="qd-stat-value">
                    {/* CountUp Animation */}
                    <CountUp
                      end={backends.filter((b) => b.type === "hardware").length}
                    />
                  </div>
                </div>
                <div className="qd-stat-card">
                  <div className="qd-stat-label">Simulators</div>
                  <div className="qd-stat-value">
                    {/* CountUp Animation */}
                    <CountUp
                      end={backends.filter((b) => b.type === "simulator").length}
                    />
                  </div>
                </div>
                <div className="qd-stat-card">
                  <div className="qd-stat-label">Total Queue</div>
                  <div className="qd-stat-value">
                    {/* CountUp Animation */}
                    <CountUp end={totalQueue} formatter={(n) => n.toLocaleString()} />
                  </div>
                </div>
              </motion.div>

              {/* TOP ROW */}
              <div className="qd-row">
                {/* Queue Overview */}
                <motion.div
                  className="qd-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* NEW HEADER BAR IMPLEMENTATION */}
                  <div className="qd-card-header-bar">
                    <div className="qd-card-header">
                      <div>
                        <div className="qd-card-title">Queue Overview</div>
                        <div className="qd-card-sub">
                          Real-time IBM Quantum cluster queue activity
                        </div>
                      </div>
                      <span className="qd-live-pill">
                        <span className="qd-live-dot" />
                        LIVE
                      </span>
                    </div>
                  </div>
                  {/* END NEW HEADER BAR */}

                  <div className="qd-chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filtered}>
                        <CartesianGrid stroke="#3b3b74" strokeDasharray="4 4" />
                        <XAxis dataKey="name" stroke="currentColor" />
                        <YAxis stroke="currentColor" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="queue" fill="#fb3cf8f7" radius={[7, 7, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* AI Recommendation + Filters */}
                <motion.div
                  className="qd-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  {/* NEW HEADER BAR IMPLEMENTATION */}
                  <div className="qd-card-header-bar">
                    <div className="qd-card-header">
                      <div>
                        <div className="qd-card-title">QID Backend Recommendation</div>
                        <div className="qd-card-sub">
                          Scoring based on qubits, queue, and load balance
                        </div>
                      </div>
                      <div className="qd-ai-pill" style={{marginTop: 0}}>
                        <span className="qd-ai-dot" />
                        QID OPTIMIZED
                      </div>
                    </div>
                  </div>
                  {/* END NEW HEADER BAR */}

                  <div className="qd-filter-row" style={{ marginTop: '0px' }}>
                    <div className="qd-filter-group">
                      <label>Min qubits</label>
                      <input
                        className="qd-filter-input"
                        type="number"
                        value={minQubits}
                        onChange={(e) => setMinQubits(Number(e.target.value))}
                      />
                    </div>
                    <div className="qd-filter-group">
                      <label>Max queue</label>
                      <input
                        className="qd-filter-input"
                        type="number"
                        placeholder="no limit"
                        value={maxQueue ?? ""}
                        onChange={(e) =>
                          setMaxQueue(
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="qd-filter-group">
                      <label>Type</label>
                      <select
                        className="qd-filter-select"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="hardware">Hardware</option>
                        <option value="simulator">Simulator</option>
                      </select>
                    </div>
                    <div className="qd-filter-group">
                      <label>Sort by</label>
                      <select
                        className="qd-filter-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="queue">Queue (low → high)</option>
                        <option value="qubits">Qubits (high → low)</option>
                        <option value="score">AI Score</option>
                      </select>
                    </div>
                    <div
                      className="qd-filter-group"
                      style={{ flex: 1, minWidth: 180 }}
                    >
                      <label>Search backend</label>
                      <input
                        className="qd-filter-input"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {recommendation ? (
                    <>
                      <p className="qd-reco-main">
                        Recommended: <strong>{recommendation.name}</strong>
                      </p>
                      <p className="qd-reco-meta">
                        {recommendation.qubits} qubits • queue {recommendation.queue} •{" "}
                        {recommendation.type}
                      </p>
                    </>
                  ) : (
                    <p style={{ marginTop: 12, fontSize: 12 }}>
                      No backend matches filters.
                    </p>
                  )}

                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button className="qd-export-btn" onClick={handleExport}>
                      Export Backend Report (JSON)
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* MID ROW: All Backends Card Grid */}
              <motion.div
                className="qd-card"
                style={{ marginBottom: 22 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* NEW HEADER BAR IMPLEMENTATION */}
                <div className="qd-card-header-bar">
                  <div className="qd-card-header">
                    <div>
                      <div className="qd-card-title">All Backends</div>
                      <div className="qd-card-sub">
                        View all backends. Click a card to
                        inspect.
                      </div>
                    </div>
                    <span className="qd-mini-tag">
                      HORIZONTAL SCROLL • SELECT • COMPARE
                    </span>
                  </div>
                </div>
                {/* END NEW HEADER BAR */}

                <div className="qd-backend-grid" style={{ marginTop: '0px' }}>
                  {filtered.map((b) => {
                    const isSelected = selected?.id === b.id;
                    const isComparing = compareIds.includes(b.id);

                    return (
                      <motion.div
                        key={b.id}
                        className={`qd-card qd-backend-card ${
                          isSelected ? "qd-backend-card-selected" : ""
                        } ${isComparing ? "qd-backend-card-selected" : ""} qd-backend-status-${
                          b.status
                        }`}
                        onClick={() => {
                          setSelectedId(b.id);
                        }}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.01, transition: { duration: 0.1 } }}
                      >
                        <div>
                          <div className="qd-backend-header">
                            <div className="qd-backend-name">{b.name}</div>
                            <div className="qd-backend-version">{b.version}</div>
                          </div>
                          <div className="qd-backend-type">{b.type}</div>

                          <div className="qd-backend-info">
                            <div className="qd-backend-info-item">
                              <div className="qd-backend-info-label">Qubits</div>
                              <div className="qd-backend-info-value">
                                {/* CountUp Animation */}
                                <CountUp end={b.qubits} />
                              </div>
                            </div>
                            <div className="qd-backend-info-item">
                              <div className="qd-backend-info-label">Queue</div>
                              <div className="qd-backend-info-value">
                                {/* CountUp Animation */}
                                <CountUp end={b.queue} />
                              </div>
                            </div>
                            <div className="qd-backend-info-item">
                              <div className="qd-backend-info-label">Status</div>
                              <div className="qd-backend-status-value">
                                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="qd-backend-active">
                          <label>
                            <input
                              type="checkbox"
                              checked={compareIds.includes(b.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleCompare(b.id);
                              }}
                              style={{ marginRight: 6 }}
                            />
                            Compare Backend
                          </label>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* NEW HISTORY + DEEP VIEW ROW */}
              <div className="qd-row" style={{ marginBottom: 22 }}>
                {/* Queue History Chart */}
                <motion.div
                  className="qd-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* NEW HEADER BAR IMPLEMENTATION */}
                  <div className="qd-card-header-bar">
                    <div className="qd-card-header">
                      <div>
                        <div className="qd-card-title">
                          Queue History: {selectedName || "Select a Backend"}
                        </div>
                        <div className="qd-card-sub">
                          Live job queue trend over the last recorded period (time based
                          on snapshot timestamps).
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* END NEW HEADER BAR */}

                  <div
                    className="qd-chart-wrapper"
                    style={{ height: 200, marginTop: 16 }}
                  >
                    {historyLoading ? (
                      <p
                        style={{
                          textAlign: "center",
                          paddingTop: 50,
                          fontSize: 14,
                        }}
                      >
                        Loading historical data...
                      </p>
                    ) : selectedName ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={(rawQueueHistory || []).map((d) => ({
                            time: d.snapshot_time,
                            queue: d.queue_length || 0,
                          }))}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#3b3b74"
                          />
                          <XAxis
  dataKey="time"
  stroke="currentColor"
  tick={{ fontSize: 12 }}
  tickFormatter={(ts) => {
    const date = new Date(ts * 1000);
    // Format time with AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  }} 
/>

                          <YAxis stroke="currentColor" />
                          <Tooltip
                            // IMPORTANT: Use the custom component defined above for the transparent background
                            content={LineChartCustomTooltip} 
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="queue"
                            stroke="#8884d8"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p
                        style={{
                          textAlign: "center",
                          paddingTop: 50,
                          opacity: 0.7,
                        }}
                      >
                        Please select a backend from the horizontal list above to view
                        its queue history.
                      </p>
                    )}
                  </div>

                  {selectedName && (
                    <button
                      className="qd-export-btn"
                      onClick={handleHistoryExport}
                      style={{ marginTop: 10 }}
                    >
                      Download Queue History (JSON)
                    </button>
                  )}
                </motion.div>

                {/* Deep view card with 3 tabs */}
                <motion.div
                  className="qd-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  {/* NEW HEADER BAR IMPLEMENTATION */}
                  <div className="qd-card-header-bar">
                    <div className="qd-card-header">
                      <div>
                        <div className="qd-card-title">
                          {selectedName || "Backend Deep View"}
                        </div>
                        <div className="qd-card-sub">
                          Queue prediction, full details & calibration analytics for the
                          selected backend.
                        </div>
                      </div>
                      <div className="qd-tab-row">
                        <button
                          className={
                            "qd-tab-pill" +
                            (detailTab === "prediction" ? " active" : "")
                          }
                          onClick={() => setDetailTab("prediction")}
                        >
                          Prediction
                        </button>
                        <button
                          className={
                            "qd-tab-pill" + (detailTab === "details" ? " active" : "")
                          }
                          onClick={() => setDetailTab("details")}
                        >
                          Details
                        </button>
                        <button
                          className={
                            "qd-tab-pill" +
                            (detailTab === "analytics" ? " active" : "")
                          }
                          onClick={() => setDetailTab("analytics")}
                        >
                          Analytics
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* END NEW HEADER BAR */}

                  {!selected ? (
                    <p style={{ fontSize: 12, marginTop: 8 }}>
                      Select any backend from the list above to view information.
                    </p>
                  ) : detailTab === "prediction" ? (
                    <>
                      <div style={{ fontSize: 12, marginTop: 6 }}>
                        <strong>{selected.name}</strong> • {selected.qubits} qubits •
                        queue {selected.queue}
                      </div>

                      {predictionLoading ? (
                        <p style={{ marginTop: 16, fontSize: 14 }}>
                          Analyzing queue metrics for live prediction...
                        </p>
                      ) : predictionError || !waitPrediction?.ok ? (
                        <p
                          style={{
                            marginTop: 16,
                            fontSize: 14,
                            color: "#f87171",
                          }}
                        >
                          Prediction unavailable:{" "}
                          {waitPrediction?.error || "Error fetching data."}
                        </p>
                      ) : (
                        <div style={{ marginTop: 16 }}>
                          <div
                            style={{
                              fontSize: 12,
                              opacity: 0.8,
                              marginBottom: 4,
                            }}
                          >
                            ESTIMATED WAIT TIME (Median Queue-based)
                          </div>
                          <div
                            style={{
                              fontSize: 40,
                              fontWeight: 700,
                              color: "#38bdf8",
                              lineHeight: 1,
                            }}
                          >
                            {formatSeconds(waitPrediction.estimate_seconds)}
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 10,
                              marginTop: 10,
                              paddingTop: 10,
                              borderTop: "1px solid rgba(148,163,255,0.4)",
                            }}
                          >
                            <div>
                              <div
                                style={{ fontSize: 11, opacity: 0.7 }}
                              >
                                Median Queue Length
                              </div>
                              <div
                                style={{ fontSize: 18, fontWeight: 600 }}
                              >
                                {waitPrediction.median_queue_length} jobs
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ fontSize: 11, opacity: 0.7 }}
                              >
                                Current Queue
                              </div>
                              <div
                                style={{ fontSize: 18, fontWeight: 600 }}
                              >
                                {selected.queue} jobs
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: 8, fontSize: 11 }}>
                        <strong>Circuit suggestion:</strong>{" "}
                        {selected.qubits >= 20
                          ? "Good candidate for deep QFT, VQE, or larger QAOA experiments."
                          : selected.qubits >= 5
                          ? "Ideal for mid-sized algorithms: small QAOA, 3–5 qubit GHZ, or variational demos."
                          : "Perfect for Bell pairs, basic gates exploration and beginner circuits."}
                      </div>
                    </>
                  ) : detailTab === "details" ? (
                    <div style={{ marginTop: 8, fontSize: 11 }}>
                      {detailsLoading && <p>Loading backend details…</p>}
                      {detailsError && (
                        <p>Failed to load details for {selectedName}.</p>
                      )}
                      {!detailsLoading && !detailsError && (
                        <>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1.4fr 1.6fr",
                              gap: 10,
                            }}
                          >
                            <div>
                              <div
                                style={{ fontSize: 12, opacity: 0.8 }}
                              >
                                BASIC INFO
                              </div>
                              <div
                                style={{ fontSize: 20, fontWeight: 600 }}
                              >
                                {basic.name || selectedName}
                              </div>
                              <div
                                style={{ fontSize: 11, opacity: 0.8 }}
                              >
                                {basic.description || "IBM Quantum backend"}
                              </div>
                              <div
                                style={{ marginTop: 6, fontSize: 11 }}
                              >
                                Version:{" "}
                                <strong>
                                  {basic.backend_version ||
                                    selected.version ||
                                    "-"}
                                </strong>
                                <br />
                                Qubits:{" "}
                                <strong>
                                  {basic.num_qubits || selected.qubits}
                                </strong>
                                <br />
                                Simulator:{" "}
                                <strong>
                                  {basic.simulator ? "Yes" : "No"}
                                </strong>
                                <br />
                                Pending jobs:{" "}
                                <strong>
                                  {status.pending_jobs ?? selected.queue}
                                </strong>
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ fontSize: 12, opacity: 0.8 }}
                              >
                                CONFIGURATION SNAPSHOT
                              </div>
                              <div style={{ marginTop: 6 }}>
                                <div>
                                  <span style={{ opacity: 0.8 }}>
                                    Basis gates:
                                  </span>{" "}
                                  <span>
                                    {Array.isArray(config.basis_gates)
                                      ? config.basis_gates.join(", ")
                                      : "—"}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ opacity: 0.8 }}>
                                    Dynamic circuits:
                                  </span>{" "}
                                  <strong>
                                    {String(
                                      config.dynamic_circuits_enabled ?? "—"
                                    )}
                                  </strong>
                                </div>
                                <div>
                                  <span style={{ opacity: 0.8 }}>
                                    Max shots:
                                  </span>{" "}
                                  <strong>
                                    {config.max_shots ?? "—"}
                                  </strong>
                                </div>
                                <div>
                                  <span style={{ opacity: 0.8 }}>
                                    Coupling map size:
                                  </span>{" "}
                                  <strong>
                                    {Array.isArray(config.coupling_map)
                                      ? config.coupling_map.length
                                      : "—"}{" "}
                                    edges
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              paddingTop: 8,
                              borderTop:
                                "1px solid rgba(148,163,255,0.4)",
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(3,minmax(0,1fr))",
                              gap: 8,
                            }}
                          >
                            <div>
                              <div
                                style={{ fontSize: 11, opacity: 0.75 }}
                              >
                                STATUS
                              </div>
                              <div style={{ fontSize: 12 }}>
                                State:{" "}
                                <strong>
                                  {status.operational
                                    ? "Operational"
                                    : "Online"}
                                </strong>
                                <br />
                                Message:{" "}
                                <span>
                                  {status.status_msg || "OK"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ fontSize: 11, opacity: 0.75 }}
                              >
                                CALIBRATION TIMES
                              </div>
                              <div style={{ fontSize: 12 }}>
                                Last T1 update:{" "}
                                <span>
                                  {calibration.last_t1_update ||
                                    "N/A"}
                                </span>
                                <br />
                                Last T2 update:{" "}
                                <span>
                                  {calibration.last_t2_update ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ fontSize: 11, opacity: 0.75 }}
                              >
                                EXTRA
                              </div>
                              <div style={{ fontSize: 12 }}>
                                Max experiment circuits:{" "}
                                <span>
                                  {config.max_experiments ??
                                    "N/A"}
                                </span>
                                <br />
                                IBM instance:{" "}
                                <span>
                                  {basic.instance ||
                                    "Configured in env"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontSize: 11 }}>
                      {analyticsLoading && <p>Loading analytics…</p>}
                      {analyticsError && (
                        <p>Failed to load analytics for {selectedName}.</p>
                      )}
                      {!analyticsLoading && !analyticsError && (
                        <>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(3,minmax(0,1fr))",
                              gap: 10,
                              marginBottom: 10,
                            }}
                          >
                            <div>
                              <div
                                style={{ fontSize: 11, opacity: 0.7 }}
                              >
                                Avg T1 (µs)
                              </div>
                              <div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 600,
                                }}
                              >
                                {(summary.avg_t1_us || 0).toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ fontSize: 11, opacity: 0.7 }}
                              >
                                Avg T2 (µs)
                              </div>
                              <div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 600,
                                }}
                              >
                                {(summary.avg_t2_us || 0).toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div
                                style={{ fontSize: 11, opacity: 0.7 }}
                              >
                                Avg readout error
                              </div>
                              <div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 600,
                                }}
                              >
                                {summary.avg_readout_error
                                  ? summary.avg_readout_error.toExponential(
                                      2
                                    )
                                  : "—"}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              width: "100%",
                              height: 120,
                              marginBottom: 10,
                            }}
                          >
                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                            >
                              <LineChart data={t1Data}>
                                <CartesianGrid
                                  stroke="#334155"
                                  strokeDasharray="3 3"
                                />
                                <XAxis dataKey="qubit" hide />
                                <YAxis stroke="currentColor" />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#22c55e"
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              marginBottom: 4,
                            }}
                          >
                            T1 distribution (first {t1Data.length} qubits)
                          </div>

                          <div
                            style={{
                              width: "100%",
                              height: 120,
                              marginBottom: 10,
                            }}
                          >
                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                            >
                              <LineChart data={t2Data}>
                                <CartesianGrid
                                  stroke="#334155"
                                  strokeDasharray="3 3"
                                />
                                <XAxis dataKey="qubit" hide />
                                <YAxis stroke="currentColor" />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#38bdf8"
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              marginBottom: 4,
                            }}
                          >
                            T2 distribution (first {t2Data.length} qubits)
                          </div>

                          <div
                            style={{
                              width: "100%",
                              height: 120,
                            }}
                          >
                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                            >
                              <BarChart data={readoutData}>
                                <CartesianGrid
                                  stroke="#334155"
                                  strokeDasharray="3 3"
                                />
                                <XAxis dataKey="qubit" hide />
                                <YAxis stroke="currentColor" />
                                <Tooltip />
                                <Bar
                                  dataKey="value"
                                  fill="#f97316"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              marginTop: 4,
                            }}
                          >
                            Readout error per qubit (first{" "}
                            {readoutData.length} qubits)
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* BOTTOM ROW: status + compare/dev */}
              <div className="qd-row-bottom">
                {/* System Status */}
                <motion.div
                  className="qd-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* NEW HEADER BAR IMPLEMENTATION */}
                  <div className="qd-card-header-bar">
                    <div className="qd-card-header">
                      <div>
                        <div className="qd-card-title">
                          System Status & Analytics
                        </div>
                        <div className="qd-card-sub">
                          Overall cluster health, throughput and workload.
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* END NEW HEADER BAR */}

                  <div className="qd-status-list" style={{ marginTop: '0px' }}>
                    <div className="qd-status-item">
                      <span>Operational backends</span>
                      <span>
                        {
                          backends.filter(
                            (b) => b.status === "operational"
                          ).length
                        }{" "}
                        / {backends.length}
                      </span>
                    </div>
                    <div className="qd-status-item">
                      <span>Busiest backend</span>
                      <span>{analytics.busiestName}</span>
                    </div>
                    <div className="qd-status-item">
                      <span>Approx. total queued jobs</span>
                      <span>{analytics.totalQueue}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 11 }}>
                    <strong>Traffic lights:</strong> green → safe, orange → busy, red
                    → avoid for latency-sensitive jobs.
                  </div>
                </motion.div>

                {/* Comparison + Dev */}
                <motion.div
                  className="qd-card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 }}
                >
                  {/* NEW HEADER BAR IMPLEMENTATION */}
                  <div className="qd-card-header-bar">
                    <div className="qd-card-header">
                      <div>
                        <div className="qd-card-title">
                          Backend Comparison & Dev View
                        </div>
                        <div className="qd-card-sub">
                          Select up to 3 backends to inspect side-by-side.
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* END NEW HEADER BAR */}

                  <button
                    className="qd-chip-btn"
                    onClick={() => setShowDev((x) => !x)}
                    style={{ marginTop: "10px" }}
                  >
                    <span
                      className="dot"
                      style={{
                        background: "#38bdf8",
                        boxShadow: "0 0 10px #38bdf8",
                      }}
                    />
                    {showDev ? "Hide Dev Panel" : "Show Dev Panel"}
                  </button>

                  {compareBackends.length === 0 ? (
                    <p style={{ fontSize: 12, marginTop: 10 }}>
                      Use the checkboxes in the cards above to pick backends for
                      comparison.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 10,
                        marginTop: 8,
                        fontSize: 11,
                      }}
                    >
                      {compareBackends.map((b) => (
                        <div
                          key={b.id}
                          style={{
                            borderRadius: 12,
                            border:
                              "1px solid rgba(148,163,255,0.7)",
                            padding: 8,
                            background:
                              "radial-gradient(circle at top, rgba(37,99,235,0.4), transparent)",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              marginBottom: 4,
                            }}
                          >
                            {b.name}
                          </div>
                          <div>Type: {b.type}</div>
                          <div>Region: {b.region}</div>
                          <div>Qubits: {b.qubits}</div>
                          <div>Queue: {b.queue}</div>
                          <div>Status: {b.status}</div>
                          <div>
                            AI Score: {computeScore(b).toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showDev && (
                    <div className="qd-dev-panel">
                      <pre>{JSON.stringify(backends, null, 2)}</pre>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
            
            {/* The copyright component must be outside the main flex/grid container to span the full width at the bottom */}
            
        </div>
        <div className="copyright">
                © {new Date().getFullYear()} Quantum Job Tracker. Built for the Quantum Community.
            </div>
      </>
  );
}