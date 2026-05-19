# QOIS

**Quantum Operational Intelligence System** is a full-stack platform for submitting, monitoring, and interpreting quantum jobs with IBM Quantum Runtime. It combines a cinematic React frontend, a Node.js orchestration layer, MongoDB-backed persistence, and a Python-Qiskit execution bridge to create a practical workflow for quantum experimentation.

The project is designed around a simple goal: make quantum job execution feel operational, observable, and developer-friendly. Instead of treating circuit submission as a one-off script, QOIS turns it into a tracked lifecycle with authentication, job metadata, backend discovery, status updates, result interpretation, and fallback behavior.

## Why This Project Stands Out

- **Production-shaped architecture**: React + Vite frontend, Express API, MongoDB models, background worker, Socket.io updates, and a dedicated Python runtime bridge.
- **IBM Quantum Runtime integration**: validates OpenQASM, selects backends, submits jobs, polls runtime status, and returns structured results.
- **Operational resilience**: queued/running jobs are monitored by a worker and can fall back to simulation when hardware execution fails.
- **User-ready experience**: OTP-based auth, password auth, Google OAuth scaffolding, protected routes, dashboards, analytics, and job-level detail views.
- **Quantum-aware result handling**: measurement counts are interpreted into higher-level insights such as deterministic behavior, superposition, Bell-state style entanglement, and Grover-style dominant-state detection.

## Core Capabilities

### 1. Quantum job lifecycle
- Create a job with circuit metadata, QASM, backend selection, shots, notes, and execution mode.
- Validate circuits before submission using a Python Qiskit bridge.
- Submit jobs to IBM Runtime hardware or simulator.
- Track execution through `pending`, `queued`, `running`, `completed`, `failed`, and `cancelled`.
- Retrieve execution results plus a human-readable interpretation layer.

### 2. Backend intelligence
- Fetch available IBM backends ordered by operational availability and queue pressure.
- Cache backend lookups to reduce unnecessary repeated calls.
- Support backend selection by qubit requirements.
- Expose backend data publicly for dashboard-style visualizations.

### 3. Authentication and access control
- Signup with email OTP verification.
- Login with either password or OTP.
- JWT-based protected API access.
- Role-aware job access patterns for `user` and `admin`.
- Google OAuth strategy is scaffolded in the codebase for deployments that provide credentials.

### 4. Live operations model
- Background worker polls active IBM jobs.
- Socket.io broadcasts job events such as creation, updates, completion, and failure.
- Frontend dashboards consume live-like job data patterns for analytics and monitoring.

## System Architecture

```text
Frontend (React + Vite)
  -> Auth flows, dashboards, job creation, job details, analytics UI

Backend API (Express + MongoDB)
  -> Auth routes, job routes, backend routes, JWT protection, session/OAuth setup

Background Worker
  -> Polls IBM Runtime jobs, updates MongoDB, retries or falls back when needed

Python Runtime Bridge (Qiskit)
  -> QASM normalization, circuit validation, backend listing, hardware submission,
     simulator fallback, runtime refresh

IBM Quantum Runtime + Qiskit Aer
  -> Hardware execution and local simulation
```

## Repository Structure

```text
.
|-- backend/
|   |-- config/              # DB and passport configuration
|   |-- controllers/         # Auth, job, IBM-facing request handlers
|   |-- middleware/          # Async wrapper, auth, global error handler
|   |-- models/              # User, OTP, Job schemas
|   |-- python/              # Qiskit runtime bridge
|   |-- routes/              # API route declarations
|   |-- services/            # Worker, mail, estimation, optimization, bridges
|   |-- utils/               # JWT helpers, logging, sockets, circuit utilities
|   |-- server.js            # API entrypoint
|   `-- requirements.txt     # Python quantum dependencies
|-- frontend/
|   |-- src/
|   |   |-- context/         # Auth provider
|   |   |-- components/      # Shared UI primitives
|   |   `-- pages/           # Home, auth, dashboard, job pages
|   |-- index.html
|   `-- vite.config.js
|-- docs/
|   `-- AdvancedRecommendationSystem.md
|-- render.yaml              # Render deployment configuration
|-- DEPLOYMENT.md            # Deployment notes
`-- README.md
```

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Framer Motion
- Recharts
- Lucide React
- React Query
- Three.js / Globe / particles-based UI elements

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Passport + Google OAuth strategy
- Nodemailer
- Socket.io

### Quantum execution layer
- Python
- Qiskit
- Qiskit IBM Runtime
- Qiskit Aer
- OpenQASM 3 parsing and normalization

## Job Execution Flow

1. A signed-in user creates a job from the frontend.
2. The backend validates the submitted QASM through `backend/python/runtime_bridge.py`.
3. Circuit metadata such as qubit count and depth is extracted and stored in MongoDB.
4. A submission request sends the circuit to IBM Runtime or to simulator mode when appropriate.
5. The worker polls active jobs and updates status in MongoDB.
6. Socket events can broadcast lifecycle changes to connected clients.
7. Completed jobs expose raw result data plus a semantic interpretation layer.

## Result Interpretation Layer

QOIS does more than return measurement counts. The backend attempts to classify outcomes into patterns such as:

- **Deterministic states**: a single dominant measured outcome.
- **Superposition-like distributions**: near-uniform spread across basis states.
- **Entangled Bell-state patterns**: correlated `00` / `11` distributions.
- **Noisy or probabilistic behavior**: dominant but non-uniform mixed outcomes.
- **Grover-style signal detection**: identifies likely target states when using Grover-style circuits.

This makes the output more useful for learners, demos, and rapid operator review.

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB instance
- IBM Quantum Runtime credentials
- SMTP credentials if using email OTP flows

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install Python quantum dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure environment variables

Create `backend/.env` and `frontend/.env`.

### Backend environment

The current backend code reads the following values directly:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BE_BASE_URL=http://localhost:5000

MONGO_URI=mongodb://localhost:27017/quantum-jobs
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_NAME=Quantum Job Tracker
FROM_EMAIL=your_email@gmail.com

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

IBM_API_KEY=your_ibm_runtime_api_key
IBM_INSTANCE_CRN=your_ibm_instance_crn
IBM_RUNTIME_CHANNEL=ibm_quantum_platform

RUN_WORKER=true
PYTHON_BIN=python
```

Important note:
- Some deployment files in the repo mention `MONGODB_URI`, but the current backend code uses `MONGO_URI`.
- For maximum compatibility, you can set both to the same connection string in hosted environments.

### Frontend environment

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Run the backend

```bash
cd backend
npm run dev
```

### 6. Run the frontend

```bash
cd frontend
npm run dev
```

## API Overview

### Auth routes

```text
POST /api/auth/signup/send-otp
POST /api/auth/signup/verify-otp
POST /api/auth/login/password
POST /api/auth/login/send-otp
POST /api/auth/login/verify-otp
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/me
```

### Job routes

```text
POST /api/jobs
GET  /api/jobs
GET  /api/jobs/backends
GET  /api/jobs/:id
POST /api/jobs/:id/submit
GET  /api/jobs/:id/status
GET  /api/jobs/:id/results
```

### Public backend route

```text
GET /api/backends
```

## Frontend Experience

The frontend is intentionally styled like a futuristic operations console rather than a generic CRUD dashboard. It includes:

- A cinematic landing page with motion-heavy visual identity
- Login and signup flows
- Protected hiring dashboard
- Job creation interface for QASM-based submission
- Job detail pages for per-run analysis
- Analytics views for success rates, trends, and status distribution

## Deployment Model

The repo is already structured for split deployment:

- **Frontend**: Vercel or Netlify
- **Backend**: Render
- **Database**: MongoDB Atlas

Included deployment assets:

- [render.yaml](C:/Users/amitm/OneDrive/Desktop/Quantum Operational Intelligent System/render.yaml)
- [DEPLOYMENT.md](C:/Users/amitm/OneDrive/Desktop/Quantum Operational Intelligent System/DEPLOYMENT.md)
- [frontend/netlify.toml](C:/Users/amitm/OneDrive/Desktop/Quantum Operational Intelligent System/frontend/netlify.toml)

## Experimental and Future-Facing Work

This repository also includes groundwork for a more advanced backend recommendation layer:

- [docs/AdvancedRecommendationSystem.md](C:/Users/amitm/OneDrive/Desktop/Quantum Operational Intelligent System/docs/AdvancedRecommendationSystem.md)
- [frontend/src/services/advancedRecommendationService.js](C:/Users/amitm/OneDrive/Desktop/Quantum Operational Intelligent System/frontend/src/services/advancedRecommendationService.js)

That work positions QOIS toward:

- topology-aware backend scoring
- queue-aware hardware recommendations
- circuit-aware backend suitability analysis
- higher-level execution intelligence

In the current branch, the core production path is the job submission and tracking system. The recommendation engine materials should be treated as advanced roadmap or in-progress extension work unless the corresponding backend routes are fully wired in your deployment.

## Strengths of the Current Codebase

- Clear separation between UI, API, worker, and quantum runtime layers
- Sensible MongoDB models for jobs, users, and time-limited OTP records
- Automatic status polling for long-running quantum jobs
- Real hardware plus simulator fallback path
- OpenQASM normalization and measurement enforcement
- Deployment-friendly split frontend/backend design

## Known Operational Notes

- Google OAuth requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `BE_BASE_URL`.
- Email OTP requires valid SMTP credentials.
- IBM Runtime execution requires Python dependencies in addition to Node.js dependencies.
- The backend currently logs some environment values at startup; review before production hardening.
- Frontend visuals are rich and impressive, but some pages are highly customized and may benefit from a later cleanup pass for maintainability.

## Recommended Next Upgrades

- Add a formal test suite for the main API flows and worker behavior
- Add Docker support for reproducible local setup
- Introduce API rate limiting and request validation schemas
- Add persistent job logs and audit trails
- Wire the advanced recommendation engine fully into the live dashboard
- Add CI for frontend build, backend linting, and Python bridge validation

## Project Positioning

QOIS is best described as a **quantum operations platform prototype**: part research tool, part execution orchestrator, and part observability dashboard. It already demonstrates a compelling architecture for real-world quantum workload management, and it has enough depth to be presented as more than a basic student CRUD app.

