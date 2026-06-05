# QOPS Interview Q&A Quick Reference

## 10 Core Interview Questions & Bullet-Point Answers

### Q1: Explain your OpenQASM 3.0 parsing pipeline
**Answer**:
- **Header Normalization**: Ensure `OPENQASM 3.0;` and `stdgates.inc` declaration
- **Qubit Extraction**: Regex pattern `/(qubit|q)\s*\[\s*(\d+)\s*\]/gi` finds highest index → qubit count
- **Validation**: Convert to Qiskit QuantumCircuit via `qasm3.loads()`
- **Auto-repair**: Inject measurements if missing, add classical bit registers
- **Location**: `circuitIntelligence.js` + `runtime_bridge.py:40-120`

---

### Q2: How do you track IBM backend queue loads?
**Answer**:
- **Bearer Token Caching**: OAuth2 auth → cache 5-min TTL (reduces API calls)
- **Queue Query**: Poll `backend.properties.pending_jobs` for each backend
- **Smart Selection**: Choose backend with minimum queue length
- **Fallback**: Use simulator if all hardware queues exceed threshold
- **Real-Time**: Update during job submission decision, not cached
- **Gap**: Missing T₁/T₂ relaxation times from hardware calibration

---

### Q3: Describe circuit attribute extraction → performance metrics
**Answer**:
- **Extract Phase** (circuitIntelligence.js):
  - Qubit count, gate count, circuit depth, CX gate count
- **Mapping Phase** (estimationService.js):
  ```
  Error Rate = (depth × 0.2%) + (cx_gates × 1.5%)
  Success Rate = max(5%, 100% - errorRate)
  ```
- **Why**:
  - Depth = coherence decay (T₂ ~ 50-100 μs)
  - CX = two-qubit gate errors (2-3% on hardware)
- **Output**: JSON with `{successRate, errorRate, qubits, depth, cxGates}`

---

### Q4: Walk through your Python/JavaScript bridge architecture
**Answer**:
- **No shared runtime**: Python/Qiskit isolated in child_process, can't run in Node
- **Flow**:
  1. Express endpoint receives OpenQASM
  2. Spawn `runtime_bridge.py` (subprocess)
  3. Python: Parse → transpile → submit to IBM
  4. Return jobId + status JSON
  5. Background worker polls job status every 5 sec
- **Transpilation**: `generate_preset_pass_manager(level=3)` optimizes depth
- **Result**: Measurement counts stored in MongoDB
- **Isolation**: Each user's jobs isolated via JWT userId

---

### Q5: How do you implement real-time hardware visualization?
**Answer**:
- **Frontend Charts**: Recharts BarChart + LineChart (backend queue, success rates)
- **Data Pipeline**:
  - Job completes → jobWorker.js detects
  - Socket.IO emits to specific user: `io.to(user123).emit('jobCompleted', job)`
  - React listener: `socket.on('jobCompleted', (data) => setState(data))`
  - Recharts auto-re-renders on state change
- **Performance**: Aggregate at backend, don't send raw circuit data to frontend
- **Real-time**: WebSocket (sub-second latency) vs REST polling (5-10 sec delay)

---

### Q6: What's wrong with your error rate prediction?
**Answer** (What to say in interview):
- **Current Issue**: Using synthetic model (depth × 0.002) instead of real hardware metrics
- **Real Values Available**: 
  - `backend.properties.t2time(qubit)` → coherence time
  - `backend.properties.gate_error('cx', (q0, q1))` → actual error rate
  - `backend.properties.readout_error(qubit)` → measurement error
- **Why We Didn't Use**:
  - Proof-of-concept timeline (hackathon deadline)
  - API latency (would slow down job submission)
- **How to Fix** (for production):
  - Cache hardware properties (refresh hourly)
  - Build backend-specific error lookup table
  - Dynamically adjust error multipliers

---

### Q7: Describe your job tracking system
**Answer**:
- **Job Lifecycle**:
  1. **Pending** (created, not yet submitted)
  2. **Running** (submitted to IBM, polling status)
  3. **Completed** (results retrieved)
  4. **Failed** (IBM error or timeout)
- **MongoDB Schema**: userId, circuit, backend, status, ibmJobId, results, timestamps
- **Polling** (jobWorker.js):
  - `setInterval(async () => { check all running jobs }, 5000)`
  - On completion: update DB, emit socket event
- **Isolation**: Filter queries by `Job.find({userId: req.userId})`
- **Resumable**: If server crashes, jobs resume polling on restart

---

### Q8: How do you handle multi-user security?
**Answer**:
- **OAuth 2.0**: Google/GitHub sign-in via Passport.js
- **JWT Tokens**: Created on login, stored in HttpOnly cookie
- **Middleware**: Extract userId from token:
  ```javascript
  const token = req.headers.authorization?.split(' ')[1];
  const {id} = jwt.verify(token, JWT_SECRET);
  req.userId = id;
  ```
- **DB Isolation**: All queries filtered by userId
  - User A only sees their jobs: `Job.find({userId: userA})`
  - User B can't access User A's results
- **IBM Credentials**: Stored as env vars (never exposed to frontend)
- **Token Refresh**: IBM bearer token auto-refreshes every 5 min

---

### Q9: What was your biggest technical challenge?
**Answer** (Best response):
- **Problem**: IBM Quantum API is async (returns jobId immediately, results later)
  - Users expect: Submit circuit → get results
  - Reality: Submit → wait hours → poll for status
- **Naive Approach Failed**: Try `await ibmService.submitAndWait()` → timeout after 3 min
- **Solution Implemented**:
  - **Phase 1 (Sync)**: Validate + submit → return jobId immediately
  - **Phase 2 (Async)**: Background worker polls every 5 sec
  - **Phase 3 (Notify)**: WebSocket pushes update when complete
  ```javascript
  setInterval(async () => {
    const jobs = await Job.find({status: 'running'});
    for (let job of jobs) {
      const status = await ibmService.checkStatus(job.ibmJobId);
      if (status.isDone) {
        job.results = status.data;
        await job.save();
        io.to(job.userId).emit('jobCompleted', job);
      }
    }
  }, 5000);
  ```
- **Why This Works**:
  - Non-blocking (other jobs can submit while one is executing)
  - Scalable (same code handles 100 or 10,000 concurrent jobs)
  - Resilient (DB persistence survives server restarts)

---

### Q10: How would you scale QOPS to 10,000 concurrent users?
**Answer**:
- **Current Bottleneck**: Single jobWorker polling all jobs
- **Scaling Strategy**:
  1. **Horizontal Load Balancing**:
     - 3-5 Node.js servers behind Nginx
     - Redis cache for shared job status
     - MongoDB sharded on userId
  2. **Job Queue** (Bull/RabbitMQ):
     - Replace polling with job queue
     - Auto-retry with exponential backoff
     - Distribute across worker nodes
  3. **Caching**:
     - Redis: Cache backend list (5 min TTL)
     - Redis: Cache user's last 100 jobs
     - Reduce MongoDB queries by 60%
  4. **WebSocket Optimization**:
     - Use rooms: `socket.join(user:${userId})`
     - Redis adapter for multi-server sync
     - Broadcast only to specific user (not all clients)
  5. **Rate Limiting**:
     - Throttle users with >100 pending jobs
     - Batch submissions when IBM queue > 5000
  6. **IBM API Constraint**:
     - Max ~100 jobs/min per account
     - Implement global rate limiter across all users
     - Queue excess submissions

**Expected Results**:
- Before: 100 concurrent users, 500 jobs/day
- After: 10,000 concurrent users, 50,000 jobs/day
- Bottleneck shifts to IBM API rate limits (need multiple accounts or institutional access)

---

## Key Quantum Computing Terms (Know These!)

| Term | Definition | Why It Matters |
|------|-----------|---|
| **OpenQASM 3.0** | Standard quantum circuit language (human-readable) | Your system's input format |
| **Transpilation** | Converting abstract circuit to hardware-native gates | Necessary for each backend (different native gates) |
| **Qiskit** | Python library for quantum programming | Powers circuit compilation |
| **IBM Quantum Runtime** | IBM's execution service (replaces old API) | Backend we submit jobs to |
| **T₁ Relaxation** | Energy decay time (energy loss to environment) | Limits circuit execution time |
| **T₂ Coherence** | Dephasing time (quantum state decay) | Limits circuit depth (larger impact) |
| **CX/CNOT Gate** | Controlled-NOT (two-qubit entangling gate) | Most error-prone (2-3% error rate) |
| **Circuit Depth** | Number of sequential gate layers | Bigger depth = more errors |
| **NISQ** | Noisy Intermediate-Scale Quantum (current era) | Our hardware has noise (no quantum error correction yet) |
| **Fidelity** | Probability circuit executes perfectly | Inverse of error rate |
| **Decoherence** | Quantum state becomes classical | Main source of error in current hardware |

---

## What Interviewers Will Test

### ✅ Technical Knowledge
- [ ] Can you explain Qiskit transpilation pipeline?
- [ ] Why are your success rates estimated vs measured?
- [ ] How do you handle backend-specific constraints?

### ✅ System Design
- [ ] How would you scale to 10,000 users?
- [ ] What would you change in production?
- [ ] How do you monitor system health?

### ✅ Problem-Solving
- [ ] A user says results differ on different backends. Debug this.
- [ ] Job worker crashes. Prevent this.
- [ ] Error predictions are 20% too optimistic. Fix it.

### ✅ Quantum Intuition
- [ ] Why are CX gates expensive?
- [ ] What happens if circuit depth > T₂ coherence time?
- [ ] Explain T₁ vs T₂.

### ✅ Honesty About Limitations
- [ ] What would you improve?
- [ ] What shortcuts did you take?
- [ ] What didn't you implement?

**Good Answer**: "We use synthetic error model, but production would fetch real hardware metrics from IBM properties API. We made this trade-off to ship the MVP for the hackathon."

**Bad Answer**: "Our error model is 100% accurate."

---

## 60-Second Pitch (If Asked "Tell Me About QOPS")

"QOPS is a cloud platform that lets anyone submit quantum circuits and execute them on real IBM Quantum hardware without learning Qiskit. We handle the complexity: parsing OpenQASM 3.0, transpiling to hardware-native gates, selecting the optimal backend based on queue load, and submitting to IBM Runtime. The backend is Python/Qiskit (because Node.js can't compile quantum circuits), and we expose results via REST API + real-time WebSocket updates. The frontend visualizes backend metrics and circuit performance using Recharts. We built this in 3 months and won runner-up at the Amaravati hackathon against 12 other teams."

---

## Top 3 Resume Claims to Emphasize

### 1️⃣ **Cloud Platform + Hardware Integration**
"Built a full-stack cloud platform (not just a Qiskit wrapper) that intelligently routes circuits to real IBM Quantum backends, monitoring queue loads in real-time and selecting the least-congested device to minimize user wait time."

### 2️⃣ **Async Job Architecture**
"Solved the asynchronous execution model: IBM returns immediately after job submission, but users want synchronous results. Implemented background polling + WebSocket notifications to create a seamless UX while handling 100+ concurrent jobs."

### 3️⃣ **Production-Aware Limitations**
"Acknowledge using synthetic error prediction (physics-based estimate), but know the path to production: integrate real hardware calibration data from IBM properties API (T₁, T₂, gate errors) for 90%+ accuracy."

---

## Before Interview: Self-Check

- [ ] Can you run `parseQubitCount('qubit[5] q; x q[0]; cx q[0], q[1];')` and get 5 without looking at code?
- [ ] Can you draw the data flow diagram (submit → validate → transpile → submit → poll → complete → visualize)?
- [ ] Do you know why depth=50, cx=10 predicts ~70% success?
- [ ] Can you explain why you chose WebSocket over REST polling?
- [ ] Can you name 3 real IBM backends and their qubit counts?
- [ ] Do you understand why Python/Qiskit is necessary (not optional)?

**If you can't answer all → review the full guide before interview**

---

## Final Talking Points

**Confidence Builders**:
✅ "I know the system inside-out—I built it."
✅ "I understand the physics behind the error model."
✅ "I know the gaps and how to fix them in production."

**Avoid**:
❌ "The error model is probably accurate..." (be certain or admit synthetic)
❌ "I'm not sure why we use Python." (You know: can't compile circuits in Node)
❌ Overstating what works (honesty > hype)

**Strong Closing**:
"This project taught me how to bridge quantum computing theory with practical full-stack engineering. The biggest lesson: hardware constraints force architectural decisions. In production, I'd replace synthetic error prediction with real hardware metrics, implement distributed job queuing, and add monitoring dashboards for operational insights."

---

**Generated**: May 28, 2026 | **Project**: QOPS | **Status**: Interview-Ready
