// src/pages/JobDetails.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Cpu,
  Activity,
  Code2,
  BarChart2,
  Copy,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  getJobById,
  getJobStatus,
  getJobResults,
} from "../jobsApi.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const styles = `
.qjd-page {
  min-height: 100vh;
  padding: 26px 34px 40px;
  background: linear-gradient(145deg, #0f172a, #020617);
  color: #ffffff;
  font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.qjd-page::before,
.qjd-page::after {
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
.qjd-page::before {
  top: -160px;
  left: -120px;
  background: radial-gradient(circle, rgba(56,189,248,0.7), transparent 70%);
}
.qjd-page::after {
  bottom: -180px;
  right: -140px;
  background: radial-gradient(circle, rgba(168,85,247,0.8), transparent 70%);
}

.qjd-grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(148,163,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,255,0.06) 1px, transparent 1px);
  background-size: 46px 46px;
  opacity: 0.6;
  z-index: 0;
  animation: qjd-grid-move 40s linear infinite;
  pointer-events: none;
}
@keyframes qjd-grid-move {
  0% { transform: translate3d(0,0,0); }
  100% { transform: translate3d(-92px,-92px,0); }
}

.qjd-inner {
  position: relative;
  z-index: 1;
}

/* header */
.qjd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
}
.qjd-header-left {
  display: flex;
  flex-direction: column;
}
.qjd-kicker {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #9ca3ff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.qjd-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 14px #22c55e;
}
.qjd-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-shadow: 0 0 30px rgba(129,140,248,0.8);
}
.qjd-title span {
  background: linear-gradient(90deg,#60a5fa,#a855f7,#22c55e);
  -webkit-background-clip: text;
  color: transparent;
}
.qjd-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #94a3b8;
  max-width: 640px;
}
.qjd-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.qjd-header-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 999px;
  background: radial-gradient(circle at left, rgba(34,197,94,0.35), rgba(15,23,42,0.96));
  border: 1px solid rgba(52,211,153,0.9);
  font-size: 12px;
  box-shadow: 0 0 20px rgba(22,163,74,0.7);
}

/* card base */
.qjd-card {
  background: linear-gradient(145deg, #0f172a, #020617);
  border-radius: 22px;
  padding: 18px 20px 18px;
  border: 1px solid #334155;
  box-shadow:
    0 0 10px rgba(56,189,248,0.3),
    0 30px 80px rgba(15,23,42,0.95);
  backdrop-filter: blur(26px);
  -webkit-backdrop-filter: blur(26px);
  position: relative;
  overflow: hidden;
  transition: transform 0.18s ease-out, box-shadow 0.18s ease-out, border-color 0.18s ease-out;
}
.qjd-card::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: conic-gradient(
    from 220deg,
    rgba(56,189,248,0.0),
    rgba(56,189,248,0.45),
    rgba(168,85,247,0.35),
    rgba(236,72,153,0.0)
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}
.qjd-card:hover::before {
  opacity: 0.16;
}
.qjd-card:hover {
  transform: translateY(-3px) scale(1.005);
  box-shadow:
    0 0 0 1px rgba(129,140,248,0.95),
    0 36px 90px rgba(15,23,42,1);
  border-color: rgba(191,219,254,0.7);
}
.qjd-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.qjd-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}
.qjd-card-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

/* layout */
.qjd-top-grid {
  display: grid;
  grid-template-columns: minmax(0,1.35fr) minmax(0,1.25fr);
  gap: 18px;
  margin-bottom: 18px;
}
.qjd-bottom-grid {
  display: grid;
  grid-template-columns: minmax(0,1.4fr) minmax(0,1.3fr);
  gap: 18px;
}

/* status badge */
.qjd-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
}
.qjd-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
}
.qjd-status-running { background: rgba(59,130,246,0.26); color: #bfdbfe; }
.qjd-status-running .qjd-status-dot { background: #38bdf8; }

.qjd-status-queued { background: rgba(234,179,8,0.26); color: #facc15; }
.qjd-status-queued .qjd-status-dot { background: #eab308; }

.qjd-status-completed { background: rgba(34,197,94,0.26); color: #bbf7d0; }
.qjd-status-completed .qjd-status-dot { background: #22c55e; }

.qjd-status-failed { background: rgba(239,68,68,0.28); color: #fecaca; }
.qjd-status-failed .qjd-status-dot { background: #ef4444; }

.qjd-status-pending { background: rgba(168,85,247,0.26); color: #e9d5ff; }
.qjd-status-pending .qjd-status-dot { background: #a855f7; }

.qjd-status-cancelled { background: rgba(148,163,184,0.26); color: #e5e7eb; }
.qjd-status-cancelled .qjd-status-dot { background: #64748b; }

/* stat tiles */
.qjd-stat-grid {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  gap: 12px;
}
.qjd-stat-tile {
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid rgba(148,163,255,0.6);
  background: radial-gradient(circle at top left, rgba(59,130,246,0.25), rgba(15,23,42,0.98));
  font-size: 11px;
}
.qjd-stat-label {
  opacity: 0.8;
  margin-bottom: 3px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.qjd-stat-value {
  font-size: 14px;
  font-weight: 600;
}

/* QASM + circuit */
.qjd-qasm-wrapper {
  border-radius: 16px;
  border: 1px solid rgba(148,163,255,0.5);
  background: radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(2,8,23,0.98));
  padding: 10px 12px;
  font-size: 12px;
}
.qjd-qasm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.qjd-qasm-badge {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,255,0.7);
  background: rgba(15,23,42,0.95);
}
.qjd-qasm-scroll {
  max-height: 220px;
  overflow-y: auto;
}
.qjd-qasm-code {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre;
}

/* circuit visualizer */
.qjd-circ-wrapper {
  border-radius: 16px;
  border: 1px solid rgba(148,163,255,0.5);
  background: radial-gradient(circle at top left, rgba(59,130,246,0.3), rgba(15,23,42,0.98));
  padding: 10px 12px;
  font-size: 11px;
}
.qjd-circ-grid {
  margin-top: 8px;
  border-radius: 10px;
  padding: 6px;
  background: rgba(15,23,42,0.96);
  overflow-x: auto;
}
.qjd-circ-table {
  border-collapse: collapse;
}
.qjd-circ-table td,
.qjd-circ-table th {
  border: 1px solid rgba(31,41,55,0.9);
  padding: 4px 6px;
  min-width: 50px;
  text-align: center;
  font-size: 11px;
}
.qjd-circ-qubit {
  color: #9ca3ff;
  font-weight: 500;
}
.qjd-gate-pill {
  border-radius: 8px;
  padding: 2px 6px;
  display: inline-block;
  font-size: 10px;
  background: rgba(59,130,246,0.25);
  border: 1px solid rgba(129,140,248,0.8);
}

/* results */
.qjd-results-summary {
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 12px;
  font-size: 11px;
}
.qjd-results-json {
  border-radius: 14px;
  border: 1px solid rgba(148,163,255,0.5);
  background: rgba(15,23,42,0.96);
  padding: 10px 12px;
  max-height: 260px;
  overflow: auto;
}
.qjd-results-json pre {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  white-space: pre;
}

/* buttons + alerts */
.qjd-btn {
  border-radius: 999px;
  padding: 7px 14px;
  border: none;
  background: linear-gradient(90deg,#4f46e5,#7c3aed);
  color: #f9fafb;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  box-shadow: 0 18px 40px rgba(88,28,135,0.6);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.qjd-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 52px rgba(88,28,135,0.75);
}
.qjd-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}
.qjd-btn-outline {
  border-radius: 999px;
  padding: 7px 14px;
  border: 1px solid rgba(148,163,255,0.8);
  background: rgba(15,23,42,0.92);
  color: #e5e7ff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.qjd-btn-outline:hover {
  background: rgba(30,64,175,0.6);
}

.qjd-error {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(248,113,113,0.9);
  background: rgba(127,29,29,0.3);
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* responsive */
@media (max-width: 1100px) {
  .qjd-top-grid {
    grid-template-columns: 1fr;
  }
  .qjd-bottom-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .qjd-page {
    padding: 22px 18px 30px;
  }
  .qjd-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .qjd-header-right {
    align-items: flex-start;
  }
  .qjd-stat-grid {
    grid-template-columns: repeat(2,minmax(0,1fr));
  }
}
@media (max-width: 640px) {
  .qjd-stat-grid {
    grid-template-columns: 1fr;
  }
}
`;

/* ---------- helpers copied from submission page-style logic ---------- */

// Infer qubits from QASM
function inferQubitCount(qasm = "") {
  const match = qasm.match(/qubit\[(\d+)\]\s+q\s*;/i);
  if (match) return Number(match[1]) || 0;
  return 0;
}

// Build simple gate grid from QASM
function buildGateGrid(qasm = "") {
  const lines = qasm
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));

  const qubitMatch = qasm.match(/qubit\[(\d+)\]\s+q\s*;/i);
  const nQubits = qubitMatch ? Number(qubitMatch[1]) || 0 : 0;
  if (!nQubits) return [];

  const rows = Array.from({ length: nQubits }, (_, i) => ({
    label: `q[${i}]`,
    gates: [],
  }));

  let column = 0;
  const gateRegex =
    /^(h|x|z|rx|ry|rz|cx|cp|cz)\s+q\[(\d+)\](?:\s*,\s*q\[(\d+)\])?/i;

  for (const line of lines) {
    const m = line.match(gateRegex);
    if (!m) continue;
    const gate = m[1].toUpperCase();
    const q1 = Number(m[2]);
    const q2 = m[3] !== undefined ? Number(m[3]) : null;

    rows.forEach((r) => {
      while (r.gates.length < column) r.gates.push("");
    });

    if (q1 < nQubits) {
      rows[q1].gates[column] = gate;
    }
    if (q2 !== null && q2 < nQubits) {
      rows[q2].gates[column] = gate === "CX" || gate === "CZ" ? "●" : gate;
    }
    column += 1;
  }

  rows.forEach((r) => {
    while (r.gates.length < column) r.gates.push("");
  });

  return rows;
}

// Try to extract counts / probabilities from generic IBM result
function buildCountsData(results) {
  if (!results) return [];

  // Try common shapes
  let countsObj = null;

  if (results.counts && typeof results.counts === "object") {
    countsObj = results.counts;
  } else if (results.c && typeof results.c === "object") {
    countsObj = results.c;
  } else if (
    Array.isArray(results.quasi_dists) &&
    results.quasi_dists[0] &&
    typeof results.quasi_dists[0] === "object"
  ) {
    countsObj = results.quasi_dists[0];
  }

  if (!countsObj) return [];

  const entries = Object.entries(countsObj)
    .map(([bitstring, value]) => ({
      bitstring,
      value: Number(value),
    }))
    .filter((d) => !Number.isNaN(d.value));

  entries.sort((a, b) => b.value - a.value);

  return entries.slice(0, 16); // Top 16 outcomes
}

function renderStatusBadge(status) {
  const key = (status || "pending").toLowerCase();
  let cls = "qjd-status-badge ";
  let Icon = Clock;

  if (key === "completed") {
    cls += "qjd-status-completed";
    Icon = CheckCircle2;
  } else if (key === "running") {
    cls += "qjd-status-running";
  } else if (key === "failed") {
    cls += "qjd-status-failed";
    Icon = XCircle;
  } else if (key === "queued") {
    cls += "qjd-status-queued";
  } else if (key === "cancelled") {
    cls += "qjd-status-cancelled";
  } else {
    cls += "qjd-status-pending";
  }

  return (
    <span className={cls}>
      <span className="qjd-status-dot" />
      <Icon size={14} />
      {key.toUpperCase()}
    </span>
  );
}

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");

  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");

  // Fetch job on mount
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getJobById(jobId);
        if (!mounted) return;
        setJob(data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load job details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  // Poll for status while not in terminal state
  useEffect(() => {
    if (!job) return;

    const terminal = ["completed", "failed", "cancelled"];
    if (terminal.includes((job.status || "").toLowerCase())) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        setStatusLoading(true);
        const resp = await getJobStatus(job._id);
        const newStatus = resp.status;
        setJob((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                updatedAt: resp.lastUpdated || prev.updatedAt,
              }
            : prev
        );
      } catch (err) {
        console.error("Status polling error", err);
      } finally {
        setStatusLoading(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [job]);

  // Auto-fetch results when job becomes completed
  useEffect(() => {
    if (!job) return;
    if ((job.status || "").toLowerCase() !== "completed") return;

    let mounted = true;

    async function loadResults() {
      try {
        setResultsLoading(true);
        setResultsError("");
        const r = await getJobResults(job._id);
        if (!mounted) return;
        setResults(r);
      } catch (err) {
        if (!mounted) return;
        setResultsError(
          err.message || "Failed to load job results from backend."
        );
      } finally {
        if (mounted) setResultsLoading(false);
      }
    }

    loadResults();
    return () => {
      mounted = false;
    };
  }, [job]);

  const inferredQubits = useMemo(
    () => inferQubitCount(job?.rawQASM || ""),
    [job]
  );
  const gateGrid = useMemo(
    () => buildGateGrid(job?.rawQASM || ""),
    [job]
  );
  const countsData = useMemo(
    () => buildCountsData(results),
    [results]
  );

  const durationSec =
    job?.createdAt && job?.updatedAt
      ? (
          (new Date(job.updatedAt).getTime() -
            new Date(job.createdAt).getTime()) /
          1000
        ).toFixed(2)
      : null;

  const handleCopyQasm = () => {
    if (!job?.rawQASM) return;
    navigator.clipboard.writeText(job.rawQASM).catch(() => {});
  };

  const handleManualResultsFetch = async () => {
    if (!job) return;
    try {
      setResultsLoading(true);
      setResultsError("");
      const r = await getJobResults(job._id);
      setResults(r);
    } catch (err) {
      setResultsError(
        err.message || "Failed to load job results from backend."
      );
    } finally {
      setResultsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="qjd-page">
        <style>{styles}</style>
        <div className="qjd-grid-bg" />
        <div className="qjd-inner">
          <div style={{ marginTop: 80, textAlign: "center" }}>
            <Loader2 size={26} className="qjd-spin" />
            <div style={{ marginTop: 10, fontSize: 13, color: "#9ca3ff" }}>
              Loading job details…
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="qjd-page">
        <style>{styles}</style>
        <div className="qjd-grid-bg" />
        <div className="qjd-inner">
          <motion.div
            className="qjd-card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 40 }}
          >
            <div className="qjd-card-header">
              <div>
                <div className="qjd-card-title" style={{ color: "#fecaca" }}>
                  Job not available
                </div>
                <div className="qjd-card-sub">
                  {error ||
                    "We could not load this job. It may have been deleted or you are not authorized."}
                </div>
              </div>
              <button
                className="qjd-btn-outline"
                type="button"
                onClick={() => navigate("/hiring")}
              >
                <ArrowLeft size={15} />
                Back to hiring dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="qjd-page">
      <style>{styles}</style>
      <div className="qjd-grid-bg" />
      <div className="qjd-inner">
        {/* HEADER */}
        <motion.div
          className="qjd-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="qjd-header-left">
            <button
              type="button"
              className="qjd-btn-outline"
              onClick={() => navigate("/hiring")}
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={15} />
              Back to jobs
            </button>
            <div className="qjd-kicker">
              <span className="qjd-kicker-dot" />
              Quantum Job Detail • Full analytics
            </div>
            <div className="qjd-title">
              <span>{job.name || "Unnamed Quantum Job"}</span>
            </div>
            <div className="qjd-subtitle">
              Deep-dive view for this specific IBM Quantum workload: status,
              backend, timing, circuit visualizer and result histogram.
            </div>
          </div>
          <div className="qjd-header-right">
            {renderStatusBadge(job.status)}
            <div className="qjd-header-pill">
              <Cpu size={16} />
              Backend: {job.backend || "—"}
            </div>
          </div>
        </motion.div>

        {/* TOP GRID: meta + QASM */}
        <motion.div
          className="qjd-top-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* META + STATS */}
          <div className="qjd-card">
            <div className="qjd-card-header">
              <div>
                <div className="qjd-card-title">
                  <Activity size={17} style={{ marginRight: 6 }} />
                  Runtime Overview
                </div>
                <div className="qjd-card-sub">
                  Internal job ID, IBM job linkage, timestamps and circuit
                  primitive context.
                </div>
              </div>
              {statusLoading && (
                <div
                  style={{
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#9ca3ff",
                  }}
                >
                  <Loader2 size={14} className="qjd-spin" />
                  Syncing latest status…
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: 12,
                marginBottom: 12,
                display: "grid",
                gap: 4,
              }}
            >
              <div>
                <strong>Internal ID:</strong> {job._id}
              </div>
              <div>
                <strong>IBM Job ID:</strong> {job.ibmJobId || "—"}
              </div>
              <div>
                <strong>Circuit primitive:</strong>{" "}
                {job.circuitType === "estimator"
                  ? "Estimator (expectation values)"
                  : "Sampler (bitstring sampling)"}
              </div>
              {job.notes && (
                <div style={{ opacity: 0.9 }}>
                  <strong>Notes:</strong> {job.notes}
                </div>
              )}
            </div>

            <div className="qjd-stat-grid">
              <div className="qjd-stat-tile">
                <div className="qjd-stat-label">Backend</div>
                <div className="qjd-stat-value">{job.backend || "—"}</div>
              </div>
              <div className="qjd-stat-tile">
                <div className="qjd-stat-label">Shots</div>
                <div className="qjd-stat-value">{job.shots ?? "—"}</div>
              </div>
              <div className="qjd-stat-tile">
                <div className="qjd-stat-label">Qubits (stored / inferred)</div>
                <div className="qjd-stat-value">
                  {job.qubits ?? "—"} / {inferredQubits || "?"}
                </div>
              </div>
              <div className="qjd-stat-tile">
                <div className="qjd-stat-label">Depth (stored)</div>
                <div className="qjd-stat-value">{job.depth ?? "—"}</div>
              </div>
              <div className="qjd-stat-tile">
                <div className="qjd-stat-label">Created at</div>
                <div className="qjd-stat-value">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleString()
                    : "—"}
                </div>
              </div>
              <div className="qjd-stat-tile">
                <div className="qjd-stat-label">Last updated</div>
                <div className="qjd-stat-value">
                  {job.updatedAt
                    ? new Date(job.updatedAt).toLocaleString()
                    : "—"}
                </div>
              </div>
              <div className="qjd-stat-tile">
                <div className="qjd-stat-label">Elapsed (created → updated)</div>
                <div className="qjd-stat-value">
                  {durationSec ? `${durationSec}s` : "—"}
                </div>
              </div>
              <div className="qjd-stat-tile">
                <div className="qjd-stat-label">Submitter</div>
                <div className="qjd-stat-value">
                  {job.user?.name || job.user?.email || "You"}
                </div>
              </div>
            </div>
          </div>

          {/* QASM VIEWER */}
          <div className="qjd-card">
            <div className="qjd-card-header">
              <div>
                <div className="qjd-card-title">
                  <Code2 size={17} style={{ marginRight: 6 }} />
                  QASM Program
                </div>
                <div className="qjd-card-sub">
                  The exact OpenQASM program stored for this job and submitted
                  by your backend.
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="qjd-btn-outline"
                  onClick={handleCopyQasm}
                >
                  <Copy size={14} />
                  Copy QASM
                </button>
              </div>
            </div>
            <div className="qjd-qasm-wrapper">
              <div className="qjd-qasm-header">
                <span className="qjd-qasm-badge">
                  {job.rawQASM?.toUpperCase().startsWith("OPENQASM 3.0")
                    ? "OPENQASM 3.0"
                    : "QASM program"}
                </span>
              </div>
              <div className="qjd-qasm-scroll">
                <pre className="qjd-qasm-code">
                  {job.rawQASM || "// No QASM stored for this job."}
                </pre>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM GRID: circuit visual + results */}
        <motion.div
          className="qjd-bottom-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* CIRCUIT VISUALIZER */}
          <div className="qjd-card">
            <div className="qjd-card-header">
              <div>
                <div className="qjd-card-title">
                  <BarChart2 size={17} style={{ marginRight: 6 }} />
                  Circuit Visualizer
                </div>
                <div className="qjd-card-sub">
                  A reconstructed gate grid from the stored QASM — intended for
                  intuition and quick debugging.
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3ff",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Info size={13} />
                Not a full composer; only basic gates are parsed.
              </div>
            </div>
            <div className="qjd-circ-wrapper">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <div style={{ fontSize: 11, color: "#9ca3ff" }}>
                  Inferred qubits: <strong>{inferredQubits || "unknown"}</strong>
                </div>
                <div style={{ fontSize: 11, color: "#9ca3ff" }}>
                  Columns:{" "}
                  <strong>
                    {gateGrid.length ? gateGrid[0].gates.length : 0}
                  </strong>
                </div>
              </div>
              <div className="qjd-circ-grid">
                {gateGrid.length ? (
                  <table className="qjd-circ-table">
                    <tbody>
                      {gateGrid.map((row) => (
                        <tr key={row.label}>
                          <td className="qjd-circ-qubit">{row.label}</td>
                          {row.gates.map((g, idx) => (
                            <td key={idx}>
                              {g ? (
                                <span className="qjd-gate-pill">{g}</span>
                              ) : (
                                "·"
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ fontSize: 11, color: "#9ca3ff" }}>
                    Unable to parse gates. Ensure QASM lines use simple patterns
                    such as <code>h q[0];</code> or{" "}
                    <code>cx q[0], q[1];</code>.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RESULTS + HISTOGRAM */}
          <div className="qjd-card">
            <div className="qjd-card-header">
              <div>
                <div className="qjd-card-title">
                  <Cpu size={17} style={{ marginRight: 6 }} />
                  IBM Results & Measurements
                </div>
                <div className="qjd-card-sub">
                  Measurement distribution (if available) plus raw IBM result
                  payload saved by the worker.
                </div>
              </div>
              <button
                type="button"
                className="qjd-btn-outline"
                onClick={handleManualResultsFetch}
                disabled={resultsLoading}
              >
                {resultsLoading ? (
                  <>
                    <Loader2 size={14} className="qjd-spin" />
                    Refresh
                  </>
                ) : (
                  <>
                    Refresh results
                    <Activity size={14} />
                  </>
                )}
              </button>
            </div>

            <div className="qjd-results-summary">
              <div>
                <div style={{ opacity: 0.7, marginBottom: 2 }}>
                  Job status
                </div>
                <div style={{ fontWeight: 600 }}>{job.status}</div>
              </div>
              <div>
                <div style={{ opacity: 0.7, marginBottom: 2 }}>
                  Results available
                </div>
                <div style={{ fontWeight: 600 }}>
                  {results ? "Yes" : "No"}
                </div>
              </div>
              <div>
                <div style={{ opacity: 0.7, marginBottom: 2 }}>
                  Histogram points
                </div>
                <div style={{ fontWeight: 600 }}>
                  {countsData.length || "0"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, marginBottom: 6 }}>
                Measurement distribution (top outcomes)
              </div>
              <div style={{ width: "100%", height: 220 }}>
                {countsData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countsData}>
                      <CartesianGrid
                        stroke="#334155"
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="bitstring"
                        stroke="#cbd5f5"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        stroke="#cbd5f5"
                        tick={{ fontSize: 10 }}
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
                      <Bar
                        dataKey="value"
                        fill="#38bdf8"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ fontSize: 11, color: "#9ca3ff" }}>
                    No parsable counts found yet. For sampler jobs, the worker
                    must store a counts / quasi_dists object for this job in
                    <code>job.ibmResult</code>.
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Interpretation Section */}
            {results?.interpretation && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <BarChart2 size={13} />
                  Quantum Result Interpretation
                </div>
                <div className="qjd-results-json" style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                  <div style={{ padding: "12px" }}>
                    {/* Type Badge */}
                    {results.interpretation.type && (
                      <div style={{ marginBottom: 8 }}>
                        <strong>Type:</strong>{" "}
                        <span style={{ 
                          background: "#22c55e", 
                          color: "white", 
                          padding: "2px 8px", 
                          borderRadius: "12px", 
                          fontSize: "10px",
                          fontWeight: "bold"
                        }}>
                          {results.interpretation.type}
                        </span>
                      </div>
                    )}
                    
                    {/* Analysis */}
                    <div style={{ marginBottom: 8 }}>
                      <strong>Analysis:</strong> {results.interpretation.interpretation || "No interpretation available"}
                    </div>
                    
                    {/* Explanation */}
                    {results.interpretation.explanation && (
                      <div style={{ marginBottom: 8, fontSize: 11, opacity: 0.9, fontStyle: "italic" }}>
                        <strong>Explanation:</strong> {results.interpretation.explanation}
                      </div>
                    )}
                    
                    {/* Confidence */}
                    <div style={{ marginBottom: 8 }}>
                      <strong>Confidence:</strong>{" "}
                      <span style={{ 
                        color: results.interpretation.confidence === "high" ? "#22c55e" : 
                               results.interpretation.confidence === "medium" ? "#f59e0b" : "#ef4444",
                        fontWeight: "bold"
                      }}>
                        {results.interpretation.confidence || "N/A"}
                      </span>
                    </div>
                    
                    {/* Grover Algorithm Specific Info */}
                    {results.interpretation.grover && (
                      <div style={{ 
                        marginBottom: 8, 
                        padding: "8px", 
                        background: "rgba(59, 130, 246, 0.1)", 
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "6px"
                      }}>
                        <div style={{ fontSize: 11, fontWeight: "bold", color: "#3b82f6", marginBottom: 4 }}>
                          🎯 Grover Algorithm Results
                        </div>
                        <div style={{ fontSize: 10 }}>
                          <div><strong>Target Found:</strong> {results.interpretation.grover.target_found}</div>
                          <div><strong>Success Probability:</strong> {results.interpretation.grover.success_probability}%</div>
                          <div><strong>Confidence:</strong> {results.interpretation.grover.confidence}</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Details */}
                    {results.interpretation.details && (
                      <div style={{ fontSize: 11, opacity: 0.8 }}>
                        <strong>Details:</strong>
                        <ul style={{ margin: "4px 0", paddingLeft: 16 }}>
                          <li>Total Shots: {results.interpretation.details.totalShots || 0}</li>
                          <li>Outcomes: {results.interpretation.details.outcomes?.join(", ") || "None"}</li>
                          {results.interpretation.details.probabilities && (
                            <li>Probabilities: {Object.entries(results.interpretation.details.probabilities)
                              .map(([state, prob]) => `${state}: ${prob}%`)
                              .join(", ")}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  fontSize: 12,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ExternalLink size={13} />
                Raw IBM result payload
              </div>
              <div className="qjd-results-json">
                <pre>
                  {results
                    ? JSON.stringify(results, null, 2)
                    : "// Results not yet available or job not completed."}
                </pre>
              </div>
              {resultsError && (
                <div className="qjd-error">
                  <XCircle size={13} />
                  {resultsError}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* generic error (status) */}
        {error && (
          <div className="qjd-error">
            <XCircle size={13} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
