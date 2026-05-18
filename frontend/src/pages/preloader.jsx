import React, { useEffect, useState, useRef } from "react";

const FINISH_AFTER_MS = 2000;

export default function QuantumPreloader({ onFinish }) {
  const [hide, setHide] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setHide(true), FINISH_AFTER_MS - 1400);
    const t2 = setTimeout(() => onFinish && onFinish(), FINISH_AFTER_MS);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const particles = [];
    const particleCount = 75;
    const colors = ["#22d3ee", "#a855f7", "#ec4899", "#6366f1"];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onFinish]);

  return (
    <>
      <style>{`
        :root {
          --bg-deep: #02020a;
          --neon-cyan: #22d3ee;
          --neon-pink: #ec4899;
          --neon-violet: #a855f7;
          --neon-indigo: #6366f1;
        }

        .quantum-container {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, #050520, var(--bg-deep));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 999999;
          font-family: 'Inter', sans-serif;
        }

        .particles-bg {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.15;
          animation: blobFloat 20s infinite alternate ease-in-out;
        }

        @keyframes blobFloat {
          from { transform: translate(-15%, -15%) scale(1); }
          to { transform: translate(20%, 20%) scale(1.3); }
        }

        .logo-stage {
          position: relative;
          width: 460px;
          height: 460px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .outer-border {
  position: absolute;
  border-radius: 50%;
  /* Dashed style ni inka clear chesa */
  border: 2px dashed rgba(255, 255, 255, 0.2);
  
  /* 1. spin: Fast rotation (20s nundi 8s ki taggincha)
     2. pulse: High-frequency breathing
     3. orbitShimmer: Color and opacity flickering
  */
  animation: 
    spin 8s linear infinite,
    pulse 1.5s ease-in-out infinite,
    orbitShimmer 2s linear infinite;
    
  will-change: transform, opacity;
  filter: drop-shadow(0 0 12px currentColor);
}

/* Specific speed and behavior for b1 */
.b1 { 
  width: 440px; 
  height: 440px; 
  border-color: var(--neon-cyan); 
  animation-duration: 6s, 2s, 3s; 
}

/* Specific speed and behavior for b2 (Reverse and Faster) */
.b2 { 
  width: 410px; 
  height: 410px; 
  border-color: var(--neon-violet); 
  animation-direction: reverse, alternate, normal; 
  animation-duration: 4s, 1.2s, 2s;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1) rotate(inherit); }
  50% { transform: scale(1.03) rotate(inherit); }
}

@keyframes orbitShimmer {
  0%, 100% { opacity: 0.4; border-style: dashed; }
  50% { opacity: 0.8; border-style: double; border-width: 2.5px; }
}

        .b1 { width: 440px; height: 440px; border-color: var(--neon-cyan); opacity: 0.3; }
        .b2 { width: 410px; height: 410px; border-color: var(--neon-violet); animation-direction: reverse; opacity: 0.2; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .orbit {
          position: absolute;
          width: 340px;
          height: 140px;
          border: 4px solid currentColor;
          border-radius: 50%;
          filter: drop-shadow(0 0 15px currentColor);
          animation: ringFloat 5s ease-in-out infinite;
          z-index: 5;
        }

        .o1 { color: var(--neon-cyan); transform: rotateZ(0deg); }
        .o2 { color: var(--neon-violet); transform: rotateZ(60deg); animation-delay: -1.5s; }
        .o3 { color: var(--neon-pink); transform: rotateZ(-60deg); animation-delay: -3s; }

        @keyframes ringFloat {
          0%, 100% { transform: rotateZ(var(--rotation)) scale(1); }
          50% { transform: rotateZ(var(--rotation)) scale(1.04); }
        }

        .electron {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 15px #fff, 0 0 30px currentColor;
          offset-path: ellipse(170px 70px at 50% 50%);
          animation: orbitTravel 2.8s infinite linear;
        }

        @keyframes orbitTravel {
          to { offset-distance: 100%; }
        }

        /* QOPS TEXT - Rings paina center lo */
        .qops-core {
          position: absolute;
          text-align: center;
          z-index: 100;
          animation: corePulse 4s ease-in-out infinite;
        }

        .qops-text {
          font-size: 5rem;
          font-weight: 900;
          letter-spacing: 4px;
          background: linear-gradient(to bottom, #ffffff 40%, var(--neon-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 25px rgba(34,211,238,0.7));
          margin: 0;
        }

        /* FOOTER SECTION - Mesmerizing Text and Loader */
        .ui-footer {
          margin-top: 50px;
          text-align: center;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .quantum-subtitle {
          font-size: 1.1rem;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-indigo);
          margin-bottom: 12px;
          font-weight: 300;
          opacity: 0.9;
          animation: glowText 3s ease-in-out infinite;
        }

        @keyframes glowText {
          0%, 100% { opacity: 0.7; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.5); }
        }

        .ui-footer h3 {
          font-size: 0.6rem;
          letter-spacing: 8px;
          opacity: 0.4;
          color: white;
          text-transform: uppercase;
          margin-bottom: 15px;
        }

        .loader-bar {
          width: 260px;
          height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .loader-fill {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, transparent, var(--neon-cyan), var(--neon-violet), var(--neon-pink), transparent);
          background-size: 200% 100%;
          animation: load 6.8s forwards, shimmer 2s infinite linear;
        }

        @keyframes load {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes shimmer {
          to { background-position: -200% 0; }
        }

        @keyframes corePulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.03); filter: brightness(1.2); }
        }

        .quantum-container.hide {
          animation: exit 1.2s forwards ease-in;
        }

        @keyframes exit {
          to { opacity: 0; transform: scale(1.1); filter: blur(30px); }
        }
          /* --- MOBILE OPTIMIZATION --- */
@media (max-width: 768px) {
  /* 1. Container padding tagginchi space pencha */
  .quantum-container {
    padding: 10px;
    justify-content: space-around; /* Elements madhya space equal ga untundhi */
  }

  /* 2. Logo Stage - Too small kakunda 320px ki set chesa */
  .logo-stage {
    width: 320px; 
    height: 320px;
    transform: scale(1); /* Marii chinna scale vaddu */
  }

  /* 3. Outer Borders - Better visibility */
  .b1 { 
    width: 310px !important; 
    height: 310px !important; 
    border-width: 1.5px;
  }
  .b2 { 
    width: 285px !important; 
    height: 285px !important; 
  }

  /* 4. QOPS Text - Bold and readable */
  .qops-text {
    font-size: 3.8rem; /* Size konchem penchanu */
    filter: drop-shadow(0 0 15px rgba(34,211,238,0.8));
  }

  /* 5. Orbits - Responsive width */
  .orbit {
    width: 280px; /* Desktop 340px, Mobile 280px - perfect balance */
    height: 110px;
    border-width: 3px;
  }

  /* 6. Electrons - Size penchanu so mobile lo kanipisthayi */
  .electron {
    width: 14px;
    height: 14px;
    offset-path: ellipse(140px 55px at 50% 50%); /* Path adjustment */
  }

  /* 7. Footer - Labels size adjustment */
  .quantum-subtitle {
    font-size: 0.85rem; /* Readability kosam size penchanu */
    letter-spacing: 2px;
    max-width: 85%; /* Text wrap avvadaniki */
    margin: 0 auto 10px;
  }

  .ui-footer h3 {
    font-size: 0.7rem;
    letter-spacing: 3px;
    opacity: 0.6;
  }

  /* 8. Loader Bar - Inka clear ga kanipinchela */
  .loader-bar {
    width: 220px;
    height: 3px;
  }
}

/* Landscape mode or very short screens */
@media (max-height: 600px) {
  .logo-stage {
    transform: scale(0.7);
    margin-top: -20px;
  }
  .ui-footer {
    margin-top: 10px;
  }
}
      `}</style>

      <div className={`quantum-container ${hide ? "hide" : ""}`}>
        {/* Background Atmosphere */}
        <div className="blob" style={{ width: 700, height: 700, background: "rgba(25, 15, 60, 0.4)", top: "-15%", left: "-15%" }} />
        <div className="blob" style={{ width: 600, height: 600, background: "rgba(140, 123, 255, 0.2)", bottom: "-15%", right: "-15%" }} />

        <canvas ref={canvasRef} className="particles-bg" />

        <div className="logo-stage">
          <div className="outer-border b1" />
          <div className="outer-border b2" />

          {/* Orbits */}
          <div className="orbit o1" style={{ "--rotation": "0deg" }}>
            <div className="electron" />
          </div>
          <div className="orbit o2" style={{ "--rotation": "60deg" }}>
            <div className="electron" />
          </div>
          <div className="orbit o3" style={{ "--rotation": "-60deg" }}>
            <div className="electron" />
          </div>

          {/* QOPS centered on top */}
          <div className="qops-core">
            <h1 className="qops-text">QOPS</h1>
          </div>
        </div>

        {/* Mesmerizing Footer */}
        <div className="ui-footer">
          <div className="quantum-subtitle">Quantum Operational Intelligence System</div>
          <h3>System Initializing</h3>
          <div className="loader-bar">
            <div className="loader-fill" />
          </div>
        </div>
      </div>
    </>
  );
}