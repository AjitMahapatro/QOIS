import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Stats Card Component
function Card({ label, value }) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

// Feature Tile Component
function Tile({ icon, title, text }) {
  return (
    <div className="tile">
      <div className="ico">{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  );
}

// Animated Quantum Orb
function QuantumOrb() {
  return (
    <div className="orb-wrapper">
      <div className="orb-core"></div>
      <div className="orb-ring ring-1"></div>
      <div className="orb-ring ring-2"></div>
      <div className="orb-ring ring-3"></div>
      <svg className="orb-svg" viewBox="0 0 200 200">
        
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "var(--c1)", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "var(--c2)", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="none" stroke="url(#grad1)" strokeWidth="0.5" strokeDasharray="10 5" />
      </svg>
      <div className="atom-wrap">
        <div className="atom">
          <div className="nucleus"></div>
          <div className="orbit orbit-cyan"><span className="electron cyan"></span></div>
          <div className="orbit orbit-pink"><span className="electron pink"></span></div>
          <div className="orbit orbit-white"><span className="electron white"></span></div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState({ backends: 0, jobs: 0, uptime: 0 });
  const target = useRef({ backends: 3, jobs: 12390, uptime: 99.9 });
const [isResearcher, setIsResearcher] = useState(true);
const [isAuto, setIsAuto] = useState(true); // Auto-rotation control cheyadaniki

// 2. useEffect ni modify cheyandi
useEffect(() => {
  let interval;
  if (isAuto) {
    interval = setInterval(() => {
      setIsResearcher((prev) => !prev);
    }, 2500);
  }
  return () => clearInterval(interval);
}, [isAuto]); // isAuto change ayinappudu interval re-evaluate avthundhi

// 3. Click Handler Function add cheyandi
const handleToggle = (mode) => {
  setIsAuto(false); // Okasari click chesthe auto-rotation aagipothundhi
  setIsResearcher(mode);
};
  useEffect(() => {
    const duration = 1800;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setStats({
        backends: Math.round(target.current.backends * p),
        jobs: Math.round(target.current.jobs * p),
        uptime: +(target.current.uptime * p).toFixed(1),
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div className="home dark-theme">
      <div className="gradient-blob-1"></div>
      <div className="gradient-blob-2"></div>

      {/* --- HERO SECTION --- */}
      <section className="hero-container">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="title">
              Q-Op's <span className="accent">Intelligence System</span>
            </h1>
            <p className="subtitle">
              Live IBM Quantum queues, AI-driven predictions & job execution — optimized for the next generation of researchers..Live IBM Quantum queues, AI-driven predictions & job execution — optimized for the next generation of researchers.
            </p>

            <div className="cta">
  <div className="cta">
  <a href="#about" className="btn primary">
    Explore Intelligence
  </a>

  <a href="#features-h1" className="btn ghost">
    Get Started
  </a>
</div>

</div>


          <div className="spinner-row">
  <div className="spinner-row">
  <div className="spinner-glow">
    <span className="dot green-dot">•</span> Quantum Core Online <br />
    <span className="dot red-dot">•</span> Secure OAuth 2.0 Active
  </div>
</div>


</div>

          </div>

          <div className="hero-right">
            <QuantumOrb />
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="stats">
        <Card label="Active Backends" value={stats.backends} />
        <Card label="Tracked Jobs" value={target.current.jobs.toLocaleString()} />
        <Card label="System Uptime" value={`${stats.uptime}%`} />
      </section>

      {/* --- VISION & MISSION --- */}
     <section id="about" className="q-about-section">
      <div className="container">
        {/* HEADER */}
        <div className="section-title-center">
          <h2>System <span className="text-gradient">Intelligence</span></h2>
          
         <div className="toggle-wrapper">
  <button 
    className={`mode-tab ${isResearcher ? 'active' : ''}`} 
    onClick={() => handleToggle(true)} // Clicked Researcher
  >
    🧠 Intelligence Dashboard
  </button>
  <button 
    className={`mode-tab ${!isResearcher ? 'active' : ''}`} 
    onClick={() => handleToggle(false)} // Clicked Execution Engine
  >
    ⚙️ Execution Engine
  </button>
</div>
        </div>

        <div className="about-grid-main">
          {/* LEFT SIDE: 3 POINTS */}
          <div className="about-content-area">
            <div className="slide-container">
              {isResearcher ? (
                <div className="about-slide active-slide">
                  <h3 className="hero-sub">Researcher Optimization</h3>
                  <p className="hero-desc">High-fidelity autonomous operational layer for complex quantum research.</p>
                  <div className="feature-stack">
                    <div className="f-box">
                      <div className="f-icon-bg">⚡</div>
                      <div className="f-txt"><strong>Adaptive Routing</strong><p>Auto-selects backends with lowest error rates.</p></div>
                    </div>
                    <div className="f-box">
                      <div className="f-icon-bg">🕒</div>
                      <div className="f-txt"><strong>Queue Prediction</strong><p>AI-driven forecasting to bypass wait times.</p></div>
                    </div>
                    <div className="f-box">
                      <div className="f-icon-bg">🛡️</div>
                      <div className="f-txt"><strong>Fidelity Guard</strong><p>Live telemetry analysis for circuit reliability.</p></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="about-slide active-slide">
                  <h3 className="hero-sub">Student Learning Core</h3>
                  <p className="hero-desc">Simplified quantum insights and intuitive guidance for students.</p>
                  <div className="feature-stack">
                    <div className="f-box">
                      <div className="f-icon-bg">🔍</div>
                      <div className="f-txt"><strong>Error Explainer</strong><p>Plain-English breakdown of failures.</p></div>
                    </div>
                    <div className="f-box">
                      <div className="f-icon-bg">📊</div>
                      <div className="f-txt"><strong>Visual Dashboard</strong><p>Interactive heatmaps and calibration trends.</p></div>
                    </div>
                    <div className="f-box">
                      <div className="f-icon-bg">🤖</div>
                      <div className="f-txt"><strong>Auto Transpilation</strong><p>Smart mapping to optimal coupling maps.</p></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: DYNAMIC WORKFLOW */}
          <div className="about-visual-area">
            <div className="workflow-card">
              <div className="workflow-header">
                <span className="wf-label">{isResearcher ? "QID DASHBOARD" : "QEE ENGINE"}</span>
                <div class="blink-btn">LIVE</div>
              </div>

              <div className="workflow-steps">
                {isResearcher ? (
                  <>
                    <div className="wf-step active"><div className="wf-node">01</div><div className="wf-text"><strong>Data Collection</strong><p>IBM API calibration fetching.</p></div></div>
                    <div className="wf-path active"></div>
                    <div className="wf-step active"><div className="wf-node">02</div><div className="wf-text"><strong>QUBO Builder</strong><p>Building optimization weights.</p></div></div>
                    <div className="wf-path active"></div>
                    <div className="wf-step active"><div className="wf-node">03</div><div className="wf-text"><strong>Quantum Optimization</strong><p>QAOA / Solver execution.</p></div></div>
                    <div className="wf-path active"></div>
                    <div className="wf-step active"><div className="wf-node">04</div><div className="wf-text"><strong>Visual Ranking</strong><p>Backend health scoring.</p></div></div>
              <div className="wf-path active"></div>
                    <div className="wf-step active"><div className="wf-node">05</div><div className="wf-text"><strong>Anomaly Alerts</strong><p>System drift detection.</p></div></div>
                  </>
                ) : (
                  <>
                    <div className="wf-step active"><div className="wf-node">01</div><div className="wf-text"><strong>Circuit Input</strong><p>QASM/Template identification.</p></div></div>
                    <div className="wf-path active"></div>
                    <div className="wf-step active"><div className="wf-node">02</div><div className="wf-text"><strong>Circuit Analysis</strong><p>Depth & noise profiling.</p></div></div>
                    <div className="wf-path active"></div>
                    <div className="wf-step active"><div className="wf-node">03</div><div className="wf-text"><strong>Smart Transpilation</strong><p>Error-aware gate reduction.</p></div></div>
                    <div className="wf-path active"></div>
                    <div className="wf-step active"><div className="wf-node">04</div><div className="wf-text"><strong>Job Submission</strong><p>IBM Job tracking & Queue.</p></div></div>
                    <div className="wf-path active"></div>
                    <div className="wf-step active"><div className="wf-node">05</div><div className="wf-text"><strong>Post-Execution</strong><p>Fidelity & Result analytics.</p></div></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
  <h2 id ="features-h1"className="features-h1">System <span className="text-gradient">Features</span></h2>
      {/* --- CORE FEATURES GRID --- */}
      <section id="features" className="tiles">
        <Tile icon="🤖" title="AI Recommendation" text="Smart backend selection using real-time fidelity and queue length analysis." />
        <Tile icon="📊" title="Predictive Analytics" text="Advanced ML models to predict backend wait times and calibration drifts." />
        <Tile icon="⚖️" title="Backend Comparison" text="Side-by-side metrics of T1/T2 times and gate error rates for IBM systems." />
        <Tile icon="⚙️" title="Execution Engine" text="Live job tracking, automated transpilation, and circuit result visualization." />
        <Tile icon="🔐" title="Enterprise Security" text="Bank-grade data protection with Google OAuth 2.0 and encrypted job storage." />
        <Tile icon="📈" title="Visual Dashboards" text="Interactive charts and heatmaps visualizing system status and history." />
      </section>

      {/* --- MEGA FOOTER --- */}
    <footer className="footer">

  {/* BACKGROUND BLOBS */}
  <div className="gradient-blob-1" />
  <div className="gradient-blob-2" />

  <div className="footer-content">

    {/* LEFT PANEL */}
    <div className="footer-col brand-info">
      <h4 className="footer-title">
        Q-Op <span className="accent">System</span>
      </h4>

      <p>
        The definitive intelligence layer for IBM Quantum operations.
        Monitor, analyze, and execute with precision.
      </p>

      

      <div className="social-icons" style={{ marginTop: "25px" }}>
        
<span>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="6"
          stroke="#C13584" stroke-width="2"/>
    <circle cx="12" cy="12" r="5"
            stroke="#C13584" stroke-width="2"/>
    <circle cx="17.5" cy="6.5" r="1.2"
            fill="#C13584"/>
  </svg>
  Instagram
</span>

<span>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2"
          stroke="#BB001B" stroke-width="2"/>
    <path d="M3 7l9 6 9-6"
          stroke="#BB001B" stroke-width="2"/>
  </svg>
  Gmail
</span>

      </div>
    </div>

    {/* RIGHT PANEL */}
    <div className="footer-right">

      {/* TOP BAR */}
      

      <div className="footer-divider" />

      {/* LINK GRID */}
      <div className="footer-grid">

        <div className="footer-col">
          <h5>Navigation</h5>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Hiring</a></li>
            <li><a href="#">Login</a></li>
           
          </ul>
        </div>

        <div className="footer-col">
          <h5>User Manual</h5>
          <ul>
            <li><a href="#">Dashboard Workflow</a></li>
            <li><a href="#">Hiring Workflow</a></li>
            
             <li><a href="#">Admin Guide</a></li>
             <li><a href="#">FAQ</a></li>
           
          </ul>
        </div>
           <div className="footer-col">
          <h5>Services</h5>
          <ul>
            <li><a href="#">⚡ Live Queues</a></li>
            <li><a href="#">🔧 Predictions</a></li>
            <li><a href="#">🚀 Job execution</a></li>
             <li><a href="#">📊 Smart Picks</a></li>
           
          </ul>
        </div>

        <div className="footer-col">
          <h5>Support</h5>
          <ul>
            <li><a href="#">Customer Support</a></li>
            <li><a href="#">Terms & Services</a></li>
            <li><a href="#">Privacy Policy</a></li>
            
          </ul>
        </div>

      </div>
    </div>
  </div>

  {/* BOTTOM BAR */}
  <div className="footer-bottom">
    © {new Date().getFullYear()} Q-Op Intelligence System. All Rights Reserved.
  </div>

</footer>


      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap');

        :root { 
          --c1: #00e5ff; --c2: #c400ff; --c3: #6eff6e; --c4: #ff6699; --c5: #8c7bff;
          --bg: #02000a; --text: #e0e0ff;
          --glass-bg: rgba(25, 15, 60, 0.4);
          --glass-border: rgba(140, 123, 255, 0.2);
          --cyan:#00eaff; --pink:#ff2fd3;
        }

        body { margin: 0; background: var(--bg); color: var(--text); font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; scroll-behavior: smooth; }

        /* HERO */
        .hero-container { max-width: 1200px; margin: 0 auto; padding: 40px 40px 40px 40px; position: relative; z-index: 10; }
        .hero-content { display: flex; align-items: center; justify-content: space-between; gap: 60px; }
        .hero-left { flex: 1.2; }
        .title { font-size: clamp(40px, 6vw, 72px); line-height: 1.1; margin-bottom: 24px; font-weight: 700; }
        .subtitle { font-size: 1.25rem; opacity: 0.7; margin-bottom: 40px; line-height: 1.6; }
        .accent { background: linear-gradient(90deg, var(--c1), var(--c2)); -webkit-background-clip: text; color: transparent; }

        /* ORB & ATOM */
        .orb-wrapper { position: relative; width: 400px; height: 400px; display: flex; align-items: center; justify-content: center; }
        .orb-core { width: 80px; height: 100px; background: var(--c1); border-radius: 50%; filter: blur(40px); animation: pulse 4s ease-in-out infinite; }
        .orb-ring { position: absolute; border-radius: 50%; border: 1px solid var(--glass-border); animation: rotate 10s linear infinite; }
        .ring-1 { width: 280px; height: 280px; border-left: 2px solid var(--c1); transform: rotateX(60deg) rotateY(20deg); }
        .ring-2 { width: 280px; height: 280px; border-right: 2px solid var(--c2); transform: rotateX(-60deg) rotateY(40deg); animation-duration: 7s; }
        .ring-3 { width: 300px; height: 300px; border-top: 1px solid white; opacity: 0.3; transform: rotateX(0deg); animation-duration: 15s; }
        .orb-svg { position: absolute; width: 100%; height: 100%; animation: rotate 20s linear infinite reverse; }
        .atom-wrap { position: absolute; transform: scale(0.8); }
        .atom { position: relative; width: 300px; height: 300px; }
        .nucleus { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle,#fff,var(--cyan)); box-shadow: 0 0 25px var(--cyan); z-index: 5; }
        .orbit { position: absolute; top: 50%; left: 50%; width: 260px; height: 110px; border-radius: 50%; border: 2px solid rgba(0,234,255,0.3); transform: translate(-50%,-50%); }
        .orbit-cyan { border-color: var(--cyan); transform: translate(-50%,-50%) rotateZ(45deg); animation: spin 6s linear infinite; --z:45deg; }
        .orbit-pink { border-color: var(--pink); transform: translate(-50%,-50%) rotateZ(-45deg); animation: spin 8s linear infinite reverse; --z:-45deg; }
        .orbit-white { border-color: white; transform: translate(-50%,-50%) rotateZ(90deg); animation: spin 10s linear infinite; --z:90deg; }
        .electron { position: absolute; top: 50%; left: 0; width: 12px; height: 12px; background: white; border-radius: 50%; transform: translateY(-50%); box-shadow: 0 0 10px white; }

        @keyframes spin { from { transform: translate(-50%,-50%) rotateZ(var(--z)) rotate(0deg) } to { transform: translate(-50%,-50%) rotateZ(var(--z)) rotate(360deg) } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.4); opacity: 0.8; } }

        /* VISION & MISSION */
        /* VARIABLES */
:root {
  --c1: #00e5ff;
  --c2: #6a00ff;
  --glass-bg: rgba(255,255,255,0.05);
  --glass-border: rgba(255,255,255,0.2);
  --text-color: #fff;
  --shadow-color: rgba(0,229,255,0.2);
  --section-gap: 60px;
}
.features-h1  {
  /* Text align and size */
  text-align: center;
  font-size: 3.25rem;              /* Big and impactful */
  font-weight: 600;             /* Extra Bold as seen in Job-Tracker image */
  font-family: 'Inter', sans-serif; 
  margin: 50px 0;
  letter-spacing: -2px;         /* Tight spacing for modern look */

  /* The Gradient Effect */
   background: white;

  /* Clipping to text */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  /* Text Glow/Shadow for Highlight */
  text-shadow: 0px 10px 30px rgba(0, 229, 255, 0.2);
}
/* VARIABLES */
:root {
  --c1: #00e5ff;
  --c2: #6a00ff;
  --accent-color: #00e5ff;
  --bg-glass: rgba(15,23,42,0.7);
  --border-glass: cyan;
  --text-color: #fff;
  --section-gap: 60px;
  --shadow-color: rgba(0,229,255,0.2);
}

/* SECTION */
.vision-mission {
  max-width: 1200px;
  margin: var(--section-gap) auto;
  padding: 60px 20px;
  font-family: 'Poppins', sans-serif;
  color: var(--text-color);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
}

/* CARD */
.vm-card {
  display: flex;
  gap: 40px;
  padding: 50px;
  border-radius: 30px;
  backdrop-filter: blur(12px);
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  box-shadow: 0 15px 40px var(--shadow-color);
  flex-wrap: wrap;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.vm-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 60px rgba(0,229,255,0.4);
}

/* BOXES */
.vm-box {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* HEADINGS */
.vm-box h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  position: relative;
  background: linear-gradient(90deg, var(--c1), var(--c2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animated underline */
.vm-box h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 0%;
  height: 3px;
  background: linear-gradient(90deg, var(--c1), var(--c2));
  border-radius: 3px;
  transition: width 0.4s ease;
}
.vm-box h2:hover::after {
  width: 50%;
}

/* POINTS */
.vm-points {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.point {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  font-size: 1.1rem;
  line-height: 1.6;
  position: relative;
  padding-left: 10px;
  transition: transform 0.3s ease;
}
.point span {
  display: inline-flex;
  width: 28px;
  height: 28px;
  background: linear-gradient(90deg, var(--c1), var(--c2));
  border-radius: 50%;
  color: #fff;
  font-weight: bold;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(0,229,255,0.3);
}
.point:hover {
  transform: translateX(5px);
}

/* DIVIDER */
.vm-divider {
  width: 1px;
  background: var(--border-glass);
  align-self: stretch;
}

/* RESPONSIVE */
@media(max-width:1024px){
  .vm-card { flex-direction: column; padding: 40px; }
  .vm-divider { width: 80%; height: 1px; margin: 20px 0; }
}


        /* STATS & TILES */
       /* ---------- STATS ---------- */
.stats{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:22px;
  max-width:1100px;
  margin:0 auto 42px;
  padding:0 16px;
}

/* Card */
.card{
  position:relative;
  background:
    linear-gradient(
      180deg,
      rgba(15,23,42,.92),   /* dark blue base */
      rgba(15,23,42,.88)
    );
  padding:34px;
  border-radius:24px;
  border:1px solid rgba(255,255,255,.18);
  backdrop-filter:blur(22px);
  text-align:center;
  overflow:hidden;
  transition:all .6s ease;
}

/* Glow border only */
.card::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:24px;
  padding:1.5px;
  background:linear-gradient(
    120deg,
    #22d3ee,   /* cyan */
    #6366f1,   /* indigo */
    #ec4899,   /* pink */
    #ffffff
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
          mask-composite:exclude;
  opacity:.85;
}

/* Hover */
.card:hover{
  transform:translateY(-8px) scale(1.04);
  box-shadow:
    0 0 30px rgba(34,211,238,.45),
    0 0 55px rgba(99,102,241,.45),
    0 0 70px rgba(236,72,153,.35);
}

/* Value */
.value{
  font-size:2.6rem;
  font-weight:800;
  margin-top:12px;
  color:#ffffff;
  text-shadow:
    0 0 8px rgba(255,255,255,.35),
    0 0 18px rgba(34,211,238,.35);
}

/* Label / normal text */
.label,
.card p{
  color:rgba(255,255,255,.85);
  font-size:1rem;
  line-height:1.6;
}

/* ---------- TILES ---------- */
.tiles{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:26px;
  max-width:1100px;
  margin:80px auto;
  padding:0 16px;
}

.tile{
  position:relative;
  background:
    linear-gradient(
      180deg,
      rgba(15,23,42,.92),
      rgba(15,23,42,.85)
    );
  padding:36px;
  border-radius:24px;
  border:1px solid rgba(255,255,255,.16);
  backdrop-filter:blur(24px);
  overflow:hidden;
  transition:all .6s ease;
}

/* Border glow */
.tile::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:24px;
  padding:1.5px;
  background:linear-gradient(
    120deg,
    #22d3ee,
    #6366f1,
    #ec4899,
    #ffffff
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
          mask-composite:exclude;
  opacity:.7;
}

/* Hover */
.tile:hover{
  transform:translateY(-10px) scale(1.05);
  box-shadow:
    0 0 35px rgba(34,211,238,.45),
    0 0 65px rgba(99,102,241,.45),
    0 0 85px rgba(236,72,153,.35);
}

/* ---------- ANIMATIONS ---------- */
@keyframes softPulse{
  0%,100%{opacity:.9;}
  50%{opacity:1;}
}

  /* ================= FOOTER ROOT ================= */
.footer {
  position: relative;
  background: radial-gradient(circle at top, #080812, #010005);
  padding-top: 60px; /* Reduced from 90px for a tighter look */
  overflow: hidden;
  color: #e5e7eb;
  font-family: "Inter", sans-serif;
  box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.5);
  border-top: 2px solid;
  border-image-source: linear-gradient(90deg, #22d3ee, #6366f1, #ec4899, #ffffff);
  border-image-slice: 1;
}
  
/* ================= BLOBS ================= */
.gradient-blob-1,
.gradient-blob-2 {
  position: absolute;
  filter: blur(140px);
  opacity: 0.25;
  pointer-events: none;
}

.gradient-blob-1 {
  width: 520px;
  height: 520px;
  background: #22d3ee;
  top: -220px;
  left: -180px;
}

.gradient-blob-2 {
  width: 480px;
  height: 480px;
  background: #a855f7;
  bottom: -120px;
  right: -160px;
}

/* ================= MAIN GRID ================= */
.footer-content {
  max-width: 1200px; /* Slightly tighter max-width for better focus */
  margin: 0 auto;
  padding: 0 40px 40px; /* Reduced padding */
  display: grid;
  grid-template-columns: 0.9fr 2fr; /* Adjusted ratio for better balance */
  gap: 50px; /* Reduced gap */
  position: relative;
  z-index: 5;
  align-items: start; /* Ensures left and right tops align perfectly */
}

/* ================= LEFT PANEL ================= */
.brand-info {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 30px; /* Reduced from 42px for a cleaner card feel */
  backdrop-filter: blur(20px);
}

.footer-title {
  font-size: 1.8rem; /* Slightly smaller to match reduced padding */
  margin-bottom: 12px;
}

.brand-info p {
  font-size: 0.95rem;
  line-height: 1.7;
  opacity: 0.7;
  margin-bottom: 28px;
}

/* CONTACT */
.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 0.9rem;
  color: #cbd5f5;
  opacity: 0.85;
}

/* ================= SOCIAL ================= */
.social-icons span {
  font-size: 0.85rem;
  margin-right: 14px;
  cursor: pointer;
  opacity: 0.55;
  transition: 0.3s ease;
}

.social-icons span:hover {
  opacity: 1;
  color: #22d3ee;
}

/* ================= RIGHT SIDE ================= */


/* DIVIDER */
.footer-divider {
  height: 1px; /* Made thinner (1px) for a more professional look */
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.2), transparent);
  margin: 30px 0;
}

/* ================= LINK GRID ================= */
.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 60px;
}

.footer-col h5 {
  font-size: 0.80rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 22px;
  color: #22d3ee;
}

.footer-col ul {
  list-style: none;
  padding: 0;
}

.footer-col li {
  margin-bottom: 14px;
}

.footer-col a {
  text-decoration: none;
  font-size: 0.9rem;
  color: #9ca3af;
  transition: 0.25s ease;
}

.footer-col a:hover {
  color: #fff;
  padding-left: 6px;
}

/* ================= BOTTOM BAR ================= */
.footer-bottom {
 
  padding: 18px;
  text-align: center;
  font-size: 0.8rem;
  color: #9ca3af;
  border-top: 1px solid rgba(255,255,255,0.06);
}


/* BLOBS (SAME AS YOURS) */
.gradient-blob-1,
.gradient-blob-2 {
  position: absolute;
  filter: blur(120px);
  opacity: 0.2;
  z-index: 1;
  pointer-events: none;
}

.gradient-blob-1 {
  width: 600px;
  height: 600px;
  background: var(--c2);
  top: -200px;
  left: -200px;
}

.gradient-blob-2 {
  width: 500px;
  height: 500px;
  background: var(--c1);
  bottom: 100px;
  right: -100px;
}

        @media (max-width: 900px) {
          .hero-content { flex-direction: column; text-align: center; }
          .hero-right { order: -1; }
          .cta { justify-content: center; }
          .vm-card { flex-direction: column; text-align: center; }
          .vm-divider { width: 80%; height: 1px; }
          .footer-content { flex-direction: column; }
          .footer-grid { grid-template-columns: 1fr; }
        }/* Container - left aligned */
/* Container - left aligned */
/* Container - left aligned */
.spinner-row{
  display:flex;
  justify-content:flex-start;
  align-items:flex-start;
  margin-top:24px;
  padding-left:24px; /* neat spacing */
}

/* Text glow */
.spinner-glow{
  text-align:left;
  font-size:0.95rem;   /* main text size */
  line-height:1.6;
  color:#ffffff;
  font-weight:500;

  text-shadow:
    0 0 6px rgba(255,255,255,.35),
    0 0 12px rgba(34,211,238,.25),
    0 0 18px rgba(99,102,241,.2);
}

/* Blinking dot base */
.dot{
  display:inline-block;
  margin-right:8px;
  font-weight:bold;
  animation:dotBlink 1s infinite;
  font-size:1.2rem; /* <-- dot size adjustable */
  line-height:1;     /* tight spacing */
  vertical-align:middle;
}

/* Individual colors */
.green-dot{
  color:#22c55e; /* green glow */
  text-shadow:0 0 8px rgba(34,197,94,.6);
}

.red-dot{
  color:#ef4444; /* red glow */
  text-shadow:0 0 8px rgba(239,68,68,.6);
  animation-delay:0.3s; /* stagger blink */
}

/* Blink animation */
@keyframes dotBlink{
  0%,100%{opacity:0.2;}
  50%{opacity:1;}
}
/* Container & Overall Style */
/* --- SECTION BASE --- */
/* --- COMPACT WRAPPER --- */
/* ===== ABOUT SECTION — MORE ATTRACTIVE / PREMIUM LOOK ===== */

.q-about-section {
    background:
     linear-gradient(rgba(5,10,30,0.75), rgba(5,10,30,0.9)),
    color: #fff;
    padding: 50px 5%;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
    position: relative;
}


/* subtle glow overlay */
.q-about-section::before{
    content:"";
    position:absolute;
    inset:0;
    background: linear-gradient(120deg, transparent, rgba(0,242,255,0.06), transparent);
    pointer-events:none;
}

.container { 
    max-width: 1150px; 
    margin: 0 auto; 
}

/* ---------- HEADER ---------- */

.section-title-center { 
    text-align: center; 
    margin-bottom: 40px; 
}

.overline { 
    color: #00f2ff; 
    font-weight: 700; 
    letter-spacing: 3px; 
    font-size: 0.7rem; 
    text-transform: uppercase;
    display: block;
    margin-bottom: 8px;
    opacity:.9;
}

.section-title-center h2 { 
    font-size: 2.8rem; 
    font-weight: 800; 
    margin-bottom: 25px; 
}

.text-gradient { 
    background: linear-gradient(90deg, #fff, #00f2ff, #8b5cf6);
    -webkit-background-clip: text; 
    -webkit-text-fill-color: transparent; 
}

/* ---------- TOGGLE TABS ---------- */

.toggle-wrapper {
    display: inline-flex;
    background: rgba(255, 255, 255, 0.04);
    padding: 5px;
    border-radius: 14px;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.mode-tab {
    padding: 12px 24px;
    cursor: pointer;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.55);
    font-weight: 600;
    transition: 0.3s;
    z-index: 2;
    font-size: 0.9rem;
}

.mode-tab:hover{
    color:#fff;
}

.mode-tab.active { 
    color: #fff; 
}

.mode-indicator {
    position: absolute;
    height: calc(100% - 10px);
    width: 50%;
    background: linear-gradient(90deg, #00f2ff, #8b5cf6);
    border-radius: 10px;
    top: 5px;
    box-shadow: 0 0 18px rgba(0,242,255,0.35);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.mode-indicator.right { transform: translateX(100%); }

/* ---------- GRID ---------- */

.about-grid-main { 
    display: grid; 
    grid-template-columns: 1.1fr 0.9fr; 
    gap: 45px; 
    align-items: start; 
}

/* ---------- LEFT CONTENT ---------- */

.hero-sub { 
    font-size: 1.7rem; 
    margin-bottom: 10px; 
    font-weight: 700; 
}

.hero-desc { 
    font-size: 1rem; 
    opacity: 0.7; 
    line-height: 1.6; 
    margin-bottom: 30px; 
}

.feature-stack { 
    display: flex; 
    flex-direction: column; 
    gap: 15px; 
}

.f-box { 
    display: flex; 
    gap: 16px; 
    padding: 18px;
    border-radius: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    transition: 0.35s;
    position:relative;
    overflow:hidden;
}

.f-box::before{
    content:"";
    position:absolute;
    inset:0;
    background:linear-gradient(120deg, transparent, rgba(0,242,255,0.15), transparent);
    opacity:0;
    transition:.4s;
}

.f-box:hover{
    transform: translateY(-6px);
    border-color: rgba(0,242,255,0.4);
}

.f-box:hover::before{
    opacity:1;
}

.f-icon-bg { 
    font-size: 1.4rem; 
    color: #00f2ff; 
}

.f-txt strong { 
    color: #00f2ff; 
    font-size: 1rem; 
    display: block; 
    margin-bottom: 3px; 
}

.f-txt p { 
    font-size: 0.9rem; 
    opacity: 0.75; 
    margin: 0; 
}

/* ---------- WORKFLOW CARD ---------- */

.workflow-card {
    background: rgba(10, 10, 25, 0.6);
    border: 1px solid rgba(0, 242, 255, 0.25);
    border-radius: 22px;
    padding: 28px; 
    position: relative;
    backdrop-filter: blur(18px);
    box-shadow: 0 0 40px rgba(0,242,255,0.12);
}

.workflow-card::before{
    content:"";
    position:absolute;
    inset:0;
    border-radius:22px;
    background:linear-gradient(120deg, transparent, rgba(0,242,255,0.15), transparent);
    opacity:.4;
    pointer-events:none;
}

.workflow-header { 
    display: flex; 
    justify-content: space-between; 
    margin-bottom: 22px; 
    align-items: center;
}

/* steps */

.wf-step { 
    display: flex; 
    align-items: center; 
    gap: 15px; 
}

.wf-node { 
    width: 30px; 
    height: 30px; 
    background: rgba(255,255,255,0.05); 
    border-radius: 8px; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    font-weight: 800; 
    font-size: 0.8rem;
    color: rgba(255,255,255,0.25);
    border: 1px solid transparent;
    transition:.3s;
}

/* active */

.wf-step.active .wf-node { 
    border-color: #00f2ff;
    color: #00f2ff; 
    background: rgba(0, 242, 255, 0.15);
    box-shadow: 0 0 15px rgba(0,242,255,0.45); 
}

.wf-text strong { 
    font-size: 0.9rem; 
    color: #666; 
    transition: 0.3s; 
}

.wf-step.active .wf-text strong { 
    color: #fff; 
}

/* flow line */

.wf-path { 
    width: 2px; 
    height: 20px; 
    background: rgba(255,255,255,0.07); 
    margin-left: 14px; 
    position: relative;
    overflow: hidden;
}

.wf-path.active::after {
    content: '';
    position: absolute;
    top: -100%; 
    left: 0; 
    width: 100%; 
    height: 100%;
    background: linear-gradient(to bottom, transparent, #00f2ff, transparent);
    animation: flowDown 1.2s infinite linear;
}

/* animations */

@keyframes flowDown {
    0% { top: -100%; }
    100% { top: 100%; }
}

.active-slide { 
    animation: smoothFade 0.6s ease-out; 
}

@keyframes smoothFade {
    0% { opacity: 0; transform: translateY(14px); }
    100% { opacity: 1; transform: translateY(0); }
}

/* status */

.card-status { 
    margin-top: 22px; 
    font-size: 0.8rem; 
    color: #00f2ff; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    opacity:.9;
}

/* ---------- RESPONSIVE ---------- */

@media (max-width: 968px) { 
    .about-grid-main { 
        grid-template-columns: 1fr; 
        gap: 35px; 
    } 

    .section-title-center h2{
        font-size:2.2rem;
    }
}
    .blink-btn{
    padding:5px 8px;
    border:none;
    border-radius:12px;
    font-weight:700;
    color:#fff;
    cursor:pointer;
    background:green;
    box-shadow:0 0 15px rgba(34,211,238,.5);
    animation:blinkGlow 1.2s infinite alternate;
}
    @keyframes blinkGlow{
    0%{
        background:blue;
        opacity:.85;
    }
    100%{
        background:green;
        opacity:1;
    }

}
    /* CTA container */
.cta{
  display:flex;
  gap:24px;
  margin-top:32px;
  flex-wrap:wrap;
}

/* Base button */
.btn{
  position:relative;
  padding:18px 34px;
  border-radius:20px;
  text-decoration:none;
  font-weight:700;
  letter-spacing:.6px;
  color:white;
  overflow:hidden;
  z-index:1;
  transition:.45s ease;
  backdrop-filter:blur(16px);
  background:rgba(15,20,40,.6);
  border:1px solid rgba(255,255,255,.18);
}

/* 🌈 Animated neon border */
.btn::before{
  content:"";
  position:absolute;
  inset:-2px;
  border-radius:20px;
  background:linear-gradient(120deg,
    #00f0ff,
    #8b5cf6,
    #ff2fd3,
    #00ffa6,
    #00f0ff);
  background-size:400% 400%;
  animation:borderFlow 8s linear infinite;
  z-index:-2;
}

/* Dark glass inside */
.btn::after{
  content:"";
  position:absolute;
  inset:2px;
  border-radius:18px;
  background:rgba(10,15,35,.9);
  z-index:-1;
}

/* ✨ Shine sweep */
.btn span::after{
  content:"";
  position:absolute;
  top:0;
  left:-120%;
  width:60%;
  height:100%;
  background:linear-gradient(
    120deg,
    transparent,
    rgba(255,255,255,.5),
    transparent);
  transform:skewX(-25deg);
  animation:shine 4s infinite;
}

/* Hover magic */
.btn:hover{
  transform:translateY(-8px) scale(1.08);
  box-shadow:
    0 0 20px rgba(0,240,255,.6),
    0 0 40px rgba(139,92,246,.5),
    0 0 60px rgba(255,47,211,.4);
}

/* Text glow */
.primary{
  color:#22f5ff;
  text-shadow:0 0 14px rgba(34,245,255,.9);
}

.ghost{
  color:#c084fc;
  text-shadow:0 0 14px rgba(192,132,252,.9);
}

/* Animations */
@keyframes borderFlow{
  0%{background-position:0% 50%;}
  50%{background-position:100% 50%;}
  100%{background-position:0% 50%;}
}

@keyframes shine{
  0%{left:-120%;}
  40%{left:140%;}
  100%{left:140%;}
}
  /* --- UNIVERSAL MOBILE FIX --- */
@media (max-width: 768px) {
  /* Layout ni screen ki lock chesthundhi */
  body, html {
    overflow-x: hidden;
    width: 100%;
    position: relative;
  }

  .home {
    overflow-x: hidden;
    width: 100%;
  }

  /* Hero Section padding fix */
  .hero-container {
    padding: 30px 15px;
    width: 100%;
    box-sizing: border-box;
  }

  /* Title bayataki vellakunda wrap chesthundhi */
  .title {
    font-size: 2.2rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Quantum Orb size ekkuva unte side ki thosthundhi, so scaling */
  .hero-right {
    width: 100%;
    display: flex;
    justify-content: center;
    overflow: hidden;
  }

  .orb-wrapper {
    transform: scale(0.7); /* Chinnanaga chesthundhi */
    margin: -40px 0; /* Extra space remove chesthundhi */
  }

  /* Grid Items lock */
  .stats, .tiles {
    grid-template-columns: 1fr !important;
    width: 100% !important;
    padding: 0 20px !important;
    box-sizing: border-box !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  /* Workflow card horizontal scroll kakunda fix */
  .about-visual-area {
    width: 100%;
    overflow-x: hidden;
  }

  .workflow-card {
    width: 100%;
    box-sizing: border-box;
    padding: 15px;
    margin: 0;
  }

  /* Container bounds */
  .container {
    width: 100%;
    padding: 0 15px;
    box-sizing: border-box;
  }
/* MOBILE FOOTER FIX */
@media (max-width: 768px) {

  .footer-content{
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* LEFT BOX PAIKI */
  .footer-left{
    order: -1;
    text-align: center;
  }

  /* RIGHT / OTHER BOXES */
  .footer-right{
    order: 1;
    text-align: center;
  }

}


`}</style>
    </div>
  );
}