// src/pages/HiringPage.jsx
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Activity,
  TrendingUp,
  Filter,
  User,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://qois.onrender.com/api";

/* =========================================================
   ULTRA NEON GLASSMORPHIC HIRING PAGE (qh-* CLASSES)
   (same as your original, with a few small additions)
========================================================= */
const styles = `
:root {
  --qh-bg-1: #020018;
  --qh-bg-2: #03001f;
  --qh-bg-3: #050025;
  --qh-card: rgba(9, 12, 35, 0.96);
  --qh-card-soft: rgba(11, 15, 40, 0.9);
  --qh-border: rgba(129,140,248,0.7);
  --qh-border-soft: rgba(79, 70, 229, 0.5);
  --qh-text-main: #e5e7ff;
  --qh-text-sub: #9ca3ff;
  --qh-accent-blue: #38bdf8;
  --qh-accent-green: #22c55e;
  --qh-accent-purple: #a855f7;
  --qh-accent-pink: #ec4899;
  --qh-accent-gold: #eab308;
  --qh-accent-red: #ef4444;
}

/* PAGE BACKGROUND + ANIMATED GRID */
.qh-page {
  min-height: 100vh;
  padding: 26px 34px 40px;
  background:
    linear-gradient(145deg, #0f172a, #020617);
  color: var(--qh-text-main);
  font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* drifting aurora blobs */
.qh-page::before,
.qh-page::after {
  content: "";
  position: fixed;
  width: 520px;
  height: 520px;
  border-radius: 999px;
  filter: blur(90px);
  opacity: 0.55;
  pointer-events: none;
  z-index: 0;
}
.qh-page::before {
  top: -160px;
  left: -120px;
  background: radial-gradient(circle, rgba(56,189,248,0.7), transparent 70%);
}
.qh-page::after {
  bottom: -180px;
  right: -140px;
  background: radial-gradient(circle, rgba(168,85,247,0.8), transparent 70%);
}

/* subtle moving grid */
.qh-grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(148,163,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,255,0.06) 1px, transparent 1px);
  background-size: 46px 46px;
  opacity: 0.6;
  z-index: 0;
  animation: qh-grid-move 40s linear infinite;
  pointer-events: none;
}
@keyframes qh-grid-move {
  0% { transform: translate3d(0,0,0); }
  100% { transform: translate3d(-92px,-92px,0); }
}

.qh-inner {
  position: relative;
  z-index: 1;
}

/
/* header */
.qd-header {
  display: flex;
  flex-direction: column; 
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  position: relative; 
}


/* ================= TITLE WRAPPER ================= */
.qh-header-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 10px auto;
}

/* ================= MAIN TITLE ================= */
.qh-title {
  font-family: "Orbitron", "Poppins", sans-serif; /* premium look */
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  line-height: 1.2;

  /* neon glow */
 
}

/* ================= GRADIENT TEXT ================= */
.qh-title span {
  background: white;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align:centre;
}

/* ================= SUB TITLE ================= */
.qh-subtitle {
  margin-top: 10px;
  font-family: "Inter", "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: rgba(203,213,225,0.85);
  max-width: 620px;
  line-height: 1.6;
  margin-bottom:25px;
}


.qh-live-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  background: radial-gradient(circle at left, rgba(34,197,94,0.35), rgba(15,23,42,0.96));
  border: 1px solid rgba(52,211,153,0.9);
  font-size: 12px;
  box-shadow: 0 0 20px rgba(22,163,74,0.7);
}
.qh-live-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 18px #22c55e;
  animation: qh-pulse 1.3s infinite;
}
@keyframes qh-pulse {
  0%,100% { transform: scale(0.8); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
}

/* CARDS */
.qh-card {
  padding: 18px 20px;
  border-radius: 18px;
  position: relative;
  overflow: hidden;

  background:
    radial-gradient(circle at 20% 15%, rgba(0,240,255,0.18), transparent 40%),
    radial-gradient(circle at 80% 85%, rgba(139,92,246,0.18), transparent 45%),
    linear-gradient(180deg, #020617, #020617);

  border: 1px solid #334155;
  cursor: pointer;

  transition: transform 0.35s ease, box-shadow 0.35s ease;
  box-shadow: 0 0 10px rgba(56,189,248,0.3);
}
.qh-card::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: conic-gradient(
    from 210deg,
    rgba(56,189,248,0.0),
    rgba(56,189,248,0.45),
    rgba(168,85,247,0.4),
    rgba(236,72,153,0.0)
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}
.qh-card:hover::before {
  opacity: 0.16;
}
.qh-card:hover {
  transform: translateY(-3px) scale(1.005);
  box-shadow:
    0 0 0 1px rgba(129,140,248,0.95),
    0 36px 90px rgba(15,23,42,1);
  border-color: rgba(191,219,254,0.7);
}
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
.qh-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}
.qh-card-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
/* STATS OVERVIEW */
.qh-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0,1fr));

  gap: 18px;
  margin-bottom: 28px;
}

.qh-stat {
  padding: 18px 20px;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
  cursor: pointer;

  background:
    radial-gradient(circle at 20% 15%, rgba(0,240,255,0.12), transparent 40%),
    radial-gradient(circle at 80% 85%, rgba(139,92,246,0.12), transparent 45%),
    linear-gradient(180deg,#020617,#020617);

  transition: 0.35s ease;
}

/* 🔥 MOVING NEON BORDER */
.qh-stat::before {
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

  background-size: 300% 300%;
  animation: neonMove 8s linear infinite;

  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;

  opacity: 0.85;
  pointer-events: none;
}

/* 🌊 Smooth flow */
@keyframes neonMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

/* ✨ SOFT INNER GLOW */
.qh-stat::after {
  content: "";
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle, rgba(0,240,255,0.12), transparent 70%);
  opacity: 0.35;
  pointer-events: none;
}

/* 🖱️ HOVER */
.qh-stat:hover {
  transform: translateY(-5px) scale(1.03);

  box-shadow:
    0 0 15px rgba(0,240,255,.5),
    0 0 30px rgba(139,92,246,.4);
}

/* TEXT */
.qh-stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}

.qh-stat-value {
 margin-top: 8px;
  font-size: 34px;
  font-weight: 800;
  color: #ffffff;
  text-shadow:
    0 0 12px rgba(17, 0, 255, 0.9),
    0 0 30px rgba(139,92,246,0.6),
    0 0 45px rgba(255,47,211,0.45);
}

.qh-stat-footer {
  margin-top: 6px;
  font-size: 11px;
  color: #94a3b8;
}

/* ICON */
.qh-stat-icon {
  position: absolute;
  right: 14px;
  top: 14px;
  opacity: 0.45;
  font-size: 18px;
}

/* SECTION LAYOUT */
.qh-section {
  margin-bottom: 28px;
}
.qh-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.qh-section-title {
  font-size: 20px;
  font-weight: 600;
}

/* FILTERS + TABLE */
.qh-filters-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr)) 240px;
  gap: 10px;
  margin-bottom: 14px;
  align-items: center;
}
.qh-filter-group {
  display: flex;
  flex-direction: column;
  font-size: 11px;
}
.qh-input,
.qh-select {
  margin-top: 4px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,255,0.75);
  background: radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(15,23,42,0.96));
  color: var(--qh-text-main);
  font-size: 12px;
  outline: none;
}
.qh-input::placeholder {
  color: #64748b;
}
.qh-input:focus,
.qh-select:focus {
  box-shadow: 0 0 0 1px rgba(191,219,254,0.9), 0 0 18px rgba(59,130,246,0.9);
}

.qh-slider-wrap {
  display: flex;
  flex-direction: column;
  font-size: 11px;
}
.qh-slider-wrap span {
  margin-bottom: 4px;
}
.qh-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(129,140,248,0.4), rgba(168,85,247,0.8));
  outline: none;
}
.qh-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--qh-accent-purple);
  cursor: pointer;
  box-shadow: 0 0 18px rgba(168,85,247,1);
}

/* TABLE */
.qh-table-wrapper {
  overflow-x: auto;
  border-radius: 18px;
  border: 1px solid rgba(148,163,255,0.45);
}
.qh-table {
  width: 100%;
  border-collapse: collapse;
}
.qh-table th,
.qh-table td {
  padding: 9px 11px;
  font-size: 12px;
  border-bottom: 1px solid rgba(30,64,175,0.55);
  white-space: nowrap;
}
.qh-table th {
  text-align: left;
  color: var(--qh-text-sub);
  font-weight: 500;
  background: radial-gradient(circle at top, rgba(37,99,235,0.7), rgba(15,23,42,0.98));
  position: sticky;
  top: 0;
  z-index: 1;
}
.qh-table tr:nth-child(even) td {
  background: rgba(15,23,42,0.86);
}
.qh-table tr:nth-child(odd) td {
  background: rgba(8,14,37,0.98);
}
.qh-table tr:hover td {
  background: radial-gradient(circle at left, rgba(56,189,248,0.35), rgba(17,24,39,0.98));
  transform: translateY(-1px);
  transition: background 0.16s ease, transform 0.16s ease;
}

/* STATUS BADGES (real backend statuses) */
.qh-badge {
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.qh-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}
.qh-badge-running { background: rgba(59,130,246,0.26); color: #bfdbfe; }
.qh-badge-running .qh-badge-dot { background: #38bdf8; }

.qh-badge-queued { background: rgba(234,179,8,0.26); color: #facc15; }
.qh-badge-queued .qh-badge-dot { background: #eab308; }

.qh-badge-completed { background: rgba(34,197,94,0.26); color: #bbf7d0; }
.qh-badge-completed .qh-badge-dot { background: #22c55e; }

.qh-badge-failed { background: rgba(239,68,68,0.28); color: #fecaca; }
.qh-badge-failed .qh-badge-dot { background: #ef4444; }

.qh-badge-pending { background: rgba(168,85,247,0.26); color: #e9d5ff; }
.qh-badge-pending .qh-badge-dot { background: #a855f7; }

.qh-badge-cancelled { background: rgba(148,163,184,0.26); color: #e5e7eb; }
.qh-badge-cancelled .qh-badge-dot { background: #64748b; }

/* GRID HELPERS */
.qh-grid-2 {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 18px;
}

/* BUTTONS */
.qh-btn {
  border-radius: 999px;
  padding: 7px 15px;
  border: 1px solid rgba(129,140,248,0.9);
  background: radial-gradient(circle at top, rgba(59,130,246,0.8), rgba(15,23,42,0.98));
  color: #e5e7ff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  transition: box-shadow 0.18s ease, transform 0.16s ease, border-color 0.16s ease;
}
.qh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 22px rgba(59,130,246,0.9);
  border-color: rgba(191,219,254,0.95);
}
.qh-btn-outline {
  background: rgba(15,23,42,0.8);
  border-color: rgba(148,163,255,0.75);
}

/* LIVE FEED */
.qh-feed-list {
  margin-top: 6px;
  max-height: 230px;
  overflow-y: auto;
}
.qh-feed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 7px 0;
  border-bottom: 1px dashed rgba(51,65,85,0.9);
}
.qh-feed-left {
  display: flex;
  flex-direction: column;
}
.qh-feed-title {
  font-weight: 500;
}
.qh-feed-sub {
  font-size: 11px;
  color: #94a3b8;
}
.qh-feed-indicator {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  box-shadow: 0 0 16px currentColor;
}

/* ANALYTICS LAYOUT */
.qh-analytics-grid {
  display: grid;
  grid-template-columns: 1.35fr 1.35fr 1.3fr;
  gap: 18px;
  margin-bottom: 18px;
}
.qh-analytics-bottom {
  display: grid;
  grid-template-columns: 1.1fr 1.9fr;
  gap: 18px;
}

/* RESPONSIVE */
@media (max-width: 1280px) {
  .qh-stats-grid {
    grid-template-columns: repeat(3,minmax(0,1fr));
  }
  .qh-analytics-grid {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }
  .qh-analytics-bottom {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 960px) {
  .qh-page {
    padding: 22px 18px 30px;
  }
  .qh-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .qh-stats-grid {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }
  .qh-filters-row {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }
  .qh-grid-2 {
    grid-template-columns: 1fr;
  }
  .qh-analytics-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .qh-stats-grid {
    grid-template-columns: 1fr;
  }
  .qh-filters-row {
    grid-template-columns: 1fr;
  }
}
`;

/* ==================== LIVE DATA CONFIG ==================== */

const statusLabel = {
  completed: "Completed",
  running: "Running",
  queued: "Queued",
  failed: "Failed",
  pending: "Pending",
  cancelled: "Cancelled",
};

const statusColors = {
  completed: "#22c55e",
  running: "#22c55e",
  queued: "#38bdf8",
  failed: "#ef4444",
  pending: "#f59e0b",
  cancelled: "#9ca3af",
};

const statusList = Object.keys(statusLabel);

const pieColors = [
  statusColors.completed,
  statusColors.running,
  statusColors.queued,
  statusColors.failed,
  statusColors.pending,
  statusColors.cancelled,
];

/* ====================== MAIN PAGE (LIVE DASHBOARD) ========================= */

export default function HiringPage() {

  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [backendFilter, setBackendFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [circuitFilter, setCircuitFilter] = useState("");
  const [jobsToShow, setJobsToShow] = useState(10);

  /* =====================================================
     ⭐ UNIVERSAL TOKEN HANDLER (Works for Google + OTP + Password)
  ===================================================== */
  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    // If Google OAuth provided token in URL → store it
    if (urlToken) {
      localStorage.setItem("token", urlToken);

      // Clean URL after saving token
      window.history.replaceState({}, document.title, "/hiring");
    }

    // If NO token exists anywhere → redirect to login
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      navigate("/login");
    }

  }, [navigate]);

  /* =====================================================
     ⭐ USER ROLE LOADING (Admin/User View Control)
  ===================================================== */
  const currentUser =
    JSON.parse(localStorage.getItem("user") || "null") || {};

  const IS_ADMIN = currentUser?.role === "admin";

  /* =====================================================
     ⭐ FETCH JOBS (Role handled by backend automatically)
  ===================================================== */
  const fetchJobs = useCallback(async () => {

    try {

      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Missing auth token. Please log in again.");
      }

      const res = await fetch(`${API_BASE_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load jobs.");
      }

      setJobs(Array.isArray(json.data) ? json.data : []);

    } catch (err) {

      console.error("Failed to fetch jobs:", err);
      setError(err.message || "Failed to load jobs.");

      // Optional safety → if token expired redirect
      if (err.message.includes("token")) {
        localStorage.removeItem("token");
        navigate("/login");
      }

    } finally {
      setIsLoading(false);
    }

  }, [navigate]);

  /* =====================================================
     ⭐ LOAD JOBS AFTER AUTH CHECK
  ===================================================== */
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /* -------- Derived stats for overview -------- */
  const stats = useMemo(() => {
    const total = jobs.length;
    const running = jobs.filter((j) => j.status === "running").length;
    const queued = jobs.filter((j) => j.status === "queued").length;
    const pending = jobs.filter((j) => j.status === "pending").length;
    const completed = jobs.filter((j) => j.status === "completed").length;
    const failed = jobs.filter((j) => j.status === "failed").length;
    const successRate = total ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      running,
      queued,
      pending,
      completed,
      failed,
      successRate,
    };
  }, [jobs]);

  /* -------- Filters for jobs table -------- */
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((j) =>
        statusFilter === "all" ? true : j.status === statusFilter
      )
      .filter((j) =>
        backendFilter
          ? j.backend
              ?.toLowerCase()
              .includes(backendFilter.toLowerCase())
          : true
      )
      .filter((j) =>
        circuitFilter
          ? j.circuitType
              ?.toLowerCase()
              .includes(circuitFilter.toLowerCase())
          : true
      )
      .filter((j) =>
        searchFilter
          ? (j.name + " " + (j.notes || ""))
              .toLowerCase()
              .includes(searchFilter.toLowerCase())
          : true
      )
      .slice(0, jobsToShow);
  }, [
    jobs,
    statusFilter,
    backendFilter,
    circuitFilter,
    searchFilter,
    jobsToShow,
  ]);

  /* -------- Job distribution for charts -------- */
  const distributionData = useMemo(
    () =>
      statusList.map((status) => ({
        name: statusLabel[status],
        value: jobs.filter((j) => j.status === status).length,
      })),
    [jobs]
  );

  /* -------- Job trends per day for charts -------- */
  const trendData = useMemo(() => {
    const map = new Map();
    for (const j of jobs) {
      const d = (j.createdAt || "").slice(0, 10);
      if (!d) continue;

      if (!map.has(d))
        map.set(d, { date: d, total: 0, completed: 0, failed: 0 });
      const row = map.get(d);
      row.total += 1;
      if (j.status === "completed") row.completed += 1;
      if (j.status === "failed") row.failed += 1;
    }
    return Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [jobs]);

  /* -------- Performance timeline (avg duration from createdAt to updatedAt) -------- */
  const performanceData = useMemo(() => {
    const map = new Map();
    const completedJobs = jobs.filter((j) => j.status === "completed");
    for (const j of completedJobs) {
      if (!j.createdAt || !j.updatedAt) continue;
      const d = j.createdAt.slice(0, 10);
      const duration =
        (new Date(j.updatedAt).getTime() -
          new Date(j.createdAt).getTime()) /
        1000;
      if (!map.has(d)) map.set(d, { date: d, total: 0, count: 0 });
      const row = map.get(d);
      row.total += duration;
      row.count += 1;
    }
    return Array.from(map.values())
      .map((r) => ({
        date: r.date,
        avgDuration: r.count ? r.total / r.count : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [jobs]);

  /* -------- Live activity feed (latest events) -------- */
  const feedItems = useMemo(
    () =>
      [...jobs]
        .sort((a, b) =>
          a.createdAt < b.createdAt ? 1 : -1
        )
        .slice(0, 7),
    [jobs]
  );

  /* -------- helpers -------- */
  const renderStatusBadge = (status) => {
    const key = status || "pending";
    const base = `qh-badge qh-badge-${key}`;

    let Icon = Clock;
    if (key === "completed") Icon = CheckCircle;
    else if (key === "running") Icon = Play;
    else if (key === "failed") Icon = XCircle;
    else if (key === "queued") Icon = Clock;
    else if (key === "cancelled") Icon = XCircle;

    return (
      <span className={base}>
        <span className="qh-badge-dot" />
        <Icon size={13} />
        {statusLabel[key] || key}
      </span>
    );
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setBackendFilter("");
    setCircuitFilter("");
    setSearchFilter("");
  };

  const loadingState = isLoading && (
    <div
      style={{
        textAlign: "center",
        padding: "30px 0",
        color: "var(--qh-text-sub)",
      }}
    >
      Loading live jobs from backend…
    </div>
  );

  if (error) {
    return (
      <div className="qh-page">
        <style>{styles}</style>
        <div className="qh-grid-bg" />
        <div className="qh-inner">
          <motion.div
            className="qh-card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 40 }}
          >
            <div className="qh-card-title" style={{ color: "#fecaca" }}>
              Connection Error
            </div>
            <div className="qh-card-sub">
              {error}. Please confirm your backend is running and that your JWT
              token is valid.
            </div>
            <button
              className="qh-btn qh-btn-outline"
              style={{ marginTop: 16 }}
              onClick={fetchJobs}
            >
              Retry Loading Jobs
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="qh-page">
      <style>{styles}</style>
      <div className="qh-grid-bg" />
      <div className="qh-inner">
        {/* HEADER */}
        <motion.div
          className="qh-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="qh-header-main">
            <div className="qh-title">
              <span>QUANTUM EXECUTION ENGINE</span>
            </div>
            <div className="qh-subtitle">
              Live IBM backend insights • QEE Execution • Quantum analytics
              
            </div>
          </div>
         
        </motion.div>

        {/* 1. STATS */}
        <motion.div
          className="qh-section qh-stats-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="qh-stat">
            <div className="qh-stat-label">TOTAL JOBS</div>
            <div className="qh-stat-value">{stats.total}</div>
            <div className="qh-stat-footer">
              {IS_ADMIN ? "All workspace jobs" : "Jobs you submitted"}
            </div>
            <div className="qh-stat-icon">
              <Activity size={22} />
            </div>
          </div>
          <div className="qh-stat">
            <div className="qh-stat-label">COMPLETED</div>
            <div className="qh-stat-value">{stats.completed}</div>
            <div className="qh-stat-footer">Successfully finished</div>
            <div className="qh-stat-icon">
              <CheckCircle size={22} />
            </div>
          </div>
          <div className="qh-stat">
            <div className="qh-stat-label">RUNNING</div>
            <div className="qh-stat-value">{stats.running}</div>
            <div className="qh-stat-footer">Currently executing</div>
            <div className="qh-stat-icon">
              <Play size={22} />
            </div>
          </div>
          <div className="qh-stat">
            <div className="qh-stat-label">PENDING</div>
            <div className="qh-stat-value">{stats.pending}</div>
            <div className="qh-stat-footer">Not submitted to IBM yet</div>
            <div className="qh-stat-icon">
              <Clock size={22} />
            </div>
          </div>
          <div className="qh-stat">
            <div className="qh-stat-label">QUEUED</div>
            <div className="qh-stat-value">{stats.queued}</div>
            <div className="qh-stat-footer">Waiting in IBM queue</div>
            <div className="qh-stat-icon">
              <Clock size={22} />
            </div>
          </div>
          
          
         
        </motion.div>

        {/* 2. RECENT JOBS TABLE */}
        <motion.section
          className="qh-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
        >
          <div className="qh-section-header">
            <div>
              <div className="qh-section-title">Recent Jobs Overview</div>
              <div className="qh-card-sub">
                Live jobs from your backend API with advanced filtering. Click{" "}
                <strong>View</strong> to open the full Job Details page.
              </div>
            </div>
            
          </div>

          <div className="qh-card">
            {/* Filters */}
            <div className="qh-filters-row">
              <div className="qh-filter-group">
                <label>Status</label>
                <select
                  className="qh-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All status</option>
                  {statusList.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
              </div>
             
              <div className="qh-filter-group">
                <label>Search (name / notes)</label>
                <input
                  className="qh-input"
                  placeholder="portfolio, molecule…"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
              <div className="qh-slider-wrap">
                <span>Jobs to show: {jobsToShow}</span>
                <input
                  type="range"
                  min={5}
                  max={Math.max(5, jobs.length || 5)}
                  value={jobsToShow}
                  onChange={(e) =>
                    setJobsToShow(Number(e.target.value))
                  }
                  className="qh-slider"
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
              
              <button
                className="qh-btn"
                type="button"
                onClick={() => navigate("/jobs/new")}

              >
                <Plus size={15} />
                Create New Job
              </button>
            </div>
            </div>

            {loadingState}

            {/* Jobs table */}
            {!isLoading && (
              <div className="qh-table-wrapper">
                <table className="qh-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      {IS_ADMIN && <th>Submitter</th>}
                      <th>Job ID (IBM / Internal)</th>
                      <th>Status</th>
                      <th>Backend</th>
                      <th>Shots</th>
                      <th>Qubits</th>
                      <th>Depth</th>
                      
                      <th>Created At</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job, idx) => {
                      const durationSec =
                        job.status === "completed" &&
                        job.createdAt &&
                        job.updatedAt
                          ? (
                              (new Date(
                                job.updatedAt
                              ).getTime() -
                                new Date(
                                  job.createdAt
                                ).getTime()) /
                              1000
                            ).toFixed(2)
                          : null;

                      const displayId =
                        job.ibmJobId || job._id || "—";

                      return (
                        <tr key={job._id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>
                            {job.name}
                          </td>
                          {IS_ADMIN && (
                            <td>
                              <User
                                size={12}
                                style={{ marginRight: 4 }}
                              />
                              {job.user?.name || "—"}
                            </td>
                          )}
                          <td>{displayId}</td>
                          <td>{renderStatusBadge(job.status)}</td>
                          <td>{job.backend}</td>
                          <td>{job.shots}</td>
                          <td>{job.qubits ?? "—"}</td>
                          <td>{job.depth ?? "—"}</td>
                          
                          <td>
                            {job.createdAt
                              ? new Date(
                                  job.createdAt
                                ).toLocaleString(undefined, {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td>
                            <button
                              className="qh-btn qh-btn-outline"
                              style={{
                                padding: "5px 10px",
                              }}
                              type="button"
                              onClick={() =>
                                navigate(`/hiring/job/${job._id}`)
                              }
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!filteredJobs.length && !isLoading && (
                      <tr>
                        <td
                          colSpan={IS_ADMIN ? 12 : 11}
                          style={{
                            textAlign: "center",
                            padding: 18,
                          }}
                        >
                          No jobs match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.section>

        {/* 3. JOB STATUS DISTRIBUTION + LIVE ACTIVITY FEED */}

        <motion.section
          className="qh-section qh-grid-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <div className="qh-card">
              <div className="qh-card-header">
                <div className="qh-card-title">
                  Performance Timeline
                </div>
              </div>
              <div style={{ width: "100%", height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid
                      stroke="#334155"
                      strokeDasharray="3 3"
                    />
                    <XAxis dataKey="date" stroke="#cbd5f5" />
                    <YAxis
                      stroke="#cbd5f5"
                      label={{
                        value: "Avg duration (s)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#cbd5f5",
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        borderRadius: 12,
                        border: "1px solid #38bdf8",
                        color: "#ffffff",
                        fontSize: 11,
                      }}
                      itemStyle={{ color: "#ffffff" }}
                      labelStyle={{ color: "#cbd5f5" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgDuration"
                      stroke="#a855f7"
                      strokeWidth={2.4}
                      dot={{ r: 3.3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
        
          


          {/* Live activity feed */}
          <div className="qh-card">
            <div className="qh-card-header">
              <div>
                <div className="qh-card-title">
                  Live Activity Feed
                </div>
                <div className="qh-card-sub">
                  Most recent job creations and status updates
                  recorded in MongoDB.
                </div>
                 <div className="qh-live-pill">
            <span className="qh-live-dot" />
            <span>Live Data from Backend</span>
          </div>
              </div>
            </div>

            <div className="qh-feed-list">
              {feedItems.map((job) => (
                <div key={job._id} className="qh-feed-item">
                  <div className="qh-feed-left">
                    <div className="qh-feed-title">
                      {job.name}
                    </div>
                    <div className="qh-feed-sub">
                      {statusLabel[job.status] || job.status} •{" "}
                      {job.backend} •{" "}
                      {job.createdAt
                        ? new Date(
                            job.createdAt
                          ).toLocaleTimeString()
                        : "—"}
                    </div>
                  </div>
                  <div
                    className="qh-feed-indicator"
                    style={{
                      color:
                        statusColors[job.status] ||
                        statusColors.pending,
                    }}
                  />
                </div>
              ))}
              {!feedItems.length && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--qh-text-sub)",
                    marginTop: 8,
                  }}
                >
                  No jobs yet — create your first job from the
                  dashboard.
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* 4. ANALYTICS DASHBOARD */}
        <motion.section
          className="qh-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
        >
          
          <div className="qh-section-header">
            <div>
              <div className="qh-section-title">
                Analytics Dashboard
              </div>
              <div className="qh-card-sub">
                Premium analytics from your live jobs — distribution,
                reliability and performance over time.
              </div>
            </div>
          </div>

          <div className="qh-analytics-grid">
            {/* Job Distribution Donut */}
           
<div className="qh-card">
              <div className="qh-card-header">
                <div className="qh-card-title">
                  Status Overview
                </div>
              </div>
              <div style={{ width: "100%", height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid
                      stroke="#334155"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#cbd5f5"
                      interval={0}
                      tick={{ fontSize: 11 }}
                      tickMargin={8}
                      padding={{ left: 18, right: 18 }}
                    />
                    <YAxis stroke="#cbd5f5" />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        borderRadius: 12,
                        border: "1px solid #38bdf8",
                        color: "#ffffff",
                        fontSize: 11,
                      }}
                      itemStyle={{ color: "#ffffff" }}
                      labelStyle={{ color: "#cbd5f5" }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[7, 7, 0, 0]}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            pieColors[index % pieColors.length]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
                

            {/* Success Rate big ring */}
            <div className="qh-card">
              <div className="qh-card-header">
                <div className="qh-card-title">
                  Success Rate
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 230,
                }}
              >
                <div
                  style={{
                    width: 170,
                    height: 170,
                    borderRadius: "999px",
                    background:
                      "conic-gradient(from 220deg, #22c55e " +
                      stats.successRate +
                      "%, #020617 " +
                      stats.successRate +
                      "%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 0 40px rgba(34,197,94,0.6)",
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "999px",
                      background:
                        "radial-gradient(circle at top, #020617, #020014)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{ fontSize: 34, fontWeight: 700 }}
                    >
                      {stats.successRate}%
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3ff",
                      }}
                    >
                      Job Success
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                {stats.completed} of {stats.total} jobs completed
                successfully
              </div>
            </div>

            {/* Job trends line chart */}
            
            <div className="qh-card">
              <div className="qh-card-header">
                <div className="qh-card-title">Job Trends</div>
              </div>
              <div style={{ width: "100%", height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient
                        id="qt-total"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#38bdf8"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#38bdf8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="#334155"
                      strokeDasharray="3 3"
                    />
                    <XAxis dataKey="date" stroke="#cbd5f5" />
                    <YAxis stroke="#cbd5f5" />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        borderRadius: 12,
                        border: "1px solid #38bdf8",
                        color: "#ffffff",
                        fontSize: 11,
                      }}
                      itemStyle={{ color: "#ffffff" }}
                      labelStyle={{ color: "#cbd5f5" }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#38bdf8"
                      fill="url(#qt-total)"
                      strokeWidth={2.4}
                      name="Total"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Completed"
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Failed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
