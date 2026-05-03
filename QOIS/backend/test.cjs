// ibm_step4_tests.cjs
// Usage: node ibm_step4_tests.cjs <IBM_API_KEY> "<SERVICE_CRN>"

const axios = require("axios");

const API_KEY = process.argv[2];
const SERVICE_CRN = process.argv[3];

if (!API_KEY || !SERVICE_CRN) {
  console.error("Usage: node ibm_step4_tests.cjs <IBM_API_KEY> \"<SERVICE_CRN>\"");
  process.exit(1);
}

const IAM_URL = "https://iam.cloud.ibm.com/identity/token";
const RUNTIME_BASE = "https://quantum.cloud.ibm.com/v1";
const API_VERSION = "2025-05-01";

let cachedToken = null;

// Small helper to sleep
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function getIamToken(key = API_KEY) {
  const params = new URLSearchParams();
  params.append("grant_type", "urn:ibm:params:oauth:grant-type:apikey");
  params.append("apikey", key);

  const res = await axios.post(IAM_URL, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return res.data.access_token;
}

async function authHeaders(tokenOverride) {
  const token = tokenOverride || (cachedToken ?? (cachedToken = await getIamToken()));
  return {
    Authorization: `Bearer ${token}`,
    "Service-CRN": SERVICE_CRN,
    "IBM-API-Version": API_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function runTest(id, name, fn) {
  process.stdout.write(`Test ${id} – ${name} ... `);
  try {
    await fn();
    console.log("✅ PASS");
  } catch (err) {
    console.log("❌ FAIL");
    if (err.response) {
      console.log("   status:", err.response.status);
      console.log("   data  :", err.response.data);
    } else {
      console.log("   error :", err.message);
    }
  }
}

(async () => {
  console.log("=== STEP 4 – IBM RUNTIME DIRECT TESTS ===");
  console.log("Using CRN:", SERVICE_CRN);
  console.log("");

  let goodToken;
  let oneBackendName = null;
  let createdJobId = null;

  // 1) Get IAM token with valid API key
  await runTest("4.1", "IAM token – valid key", async () => {
    goodToken = await getIamToken();
    if (!goodToken || typeof goodToken !== "string") {
      throw new Error("No access_token returned");
    }
  });

  // 2) IAM with invalid API key (expect 4xx)
  await runTest("4.2", "IAM token – INVALID key", async () => {
    try {
      await getIamToken(API_KEY + "_BAD");
      throw new Error("Expected IAM to fail but it succeeded");
    } catch (err) {
      if (!err.response || (err.response.status !== 400 && err.response.status !== 401)) {
        throw err;
      }
    }
  });

  // 3) Get backends list
  await runTest("4.3", "Backends – list devices", async () => {
    const headers = await authHeaders();
    const res = await axios.get(`${RUNTIME_BASE}/backends`, { headers });
    if (!Array.isArray(res.data.devices)) {
      throw new Error("devices[] not found in response");
    }
    if (!res.data.devices.length) {
      throw new Error("No devices available for this account");
    }
    oneBackendName = res.data.devices[0].name;
    console.log("\n   Using backend:", oneBackendName);
  });

  // 4) Backends with INVALID token
  await runTest("4.4", "Backends – invalid token (expect 401)", async () => {
    const badHeaders = await authHeaders("Bearer_is_invalid");
    try {
      await axios.get(`${RUNTIME_BASE}/backends`, { headers: badHeaders });
      throw new Error("Expected 401 but request succeeded");
    } catch (err) {
      if (!err.response || err.response.status !== 401) {
        throw err;
      }
    }
  });

  // 5) Backends with INVALID CRN
  await runTest("4.5", "Backends – invalid Service-CRN", async () => {
    const token = goodToken;
    const headers = {
      ...(await authHeaders(token)),
      "Service-CRN": SERVICE_CRN + ":BAD",
    };
    try {
      await axios.get(`${RUNTIME_BASE}/backends`, { headers });
      throw new Error("Expected error but request succeeded");
    } catch (err) {
      if (!err.response || (err.response.status !== 403 && err.response.status !== 404 && err.response.status !== 409)) {
        throw err;
      }
    }
  });

  // 6) Backends with fields param
  await runTest("4.6", "Backends – with fields=wait_time_seconds", async () => {
    const headers = await authHeaders();
    const res = await axios.get(
      `${RUNTIME_BASE}/backends?fields=wait_time_seconds`,
      { headers }
    );
    if (!Array.isArray(res.data.devices)) {
      throw new Error("devices[] not found");
    }
  });

  // 7) List jobs (all)
  await runTest("4.7", "Jobs – list all", async () => {
    const headers = await authHeaders();
    const res = await axios.get(`${RUNTIME_BASE}/jobs`, { headers });
    if (!res.data || !("jobs" in res.data)) {
      throw new Error("jobs[] field missing");
    }
  });

  // 8) List pending jobs
  await runTest("4.8", "Jobs – list pending=true", async () => {
    const headers = await authHeaders();
    const res = await axios.get(`${RUNTIME_BASE}/jobs?pending=true`, {
      headers,
    });
    if (!res.data || !("jobs" in res.data)) {
      throw new Error("jobs[] field missing");
    }
  });

  // 9) Jobs with invalid token
  await runTest("4.9", "Jobs – invalid token (expect 401)", async () => {
    const token = "BAD_TOKEN";
    const headers = await authHeaders(token);
    try {
      await axios.get(`${RUNTIME_BASE}/jobs`, { headers });
      throw new Error("Expected 401 but request succeeded");
    } catch (err) {
      if (!err.response || err.response.status !== 401) {
        throw err;
      }
    }
  });

  // --------- Job creation / status / results -------------

  const qasmString = `
OPENQASM 3;
include "stdgates.inc";
qreg q[2];
creg c[2];
x q[0];
cx q[0], q[1];
c[0] = measure q[0];
c[1] = measure q[1];
`;

  // 10) Create sampler job
  await runTest("4.10", "Create sampler job (POST /v1/jobs)", async () => {
    const headers = await authHeaders();
    if (!oneBackendName) throw new Error("No backend name from previous test");

    const jobInput = {
      program_id: "sampler",
      backend: oneBackendName,
      params: {
        pubs: [[qasmString]],
      },
    };

    const res = await axios.post(`${RUNTIME_BASE}/jobs`, jobInput, { headers });
    if (!res.data || !res.data.id) {
      throw new Error("Job id missing in response");
    }
    createdJobId = res.data.id;
    console.log("\n   IBM job id:", createdJobId);
  });

  // 11) Get created job status
  await runTest("4.11", "Get job status (GET /v1/jobs/{id})", async () => {
    if (!createdJobId) throw new Error("No createdJobId from test 4.10");
    const headers = await authHeaders();
    const res = await axios.get(`${RUNTIME_BASE}/jobs/${createdJobId}`, {
      headers,
    });
    if (!res.data || res.data.id !== createdJobId) {
      throw new Error("Job id mismatch");
    }
  });

  // 12) Poll job results (waits up to ~2 minutes)
  await runTest("4.12", "Get job results (poll until Completed)", async () => {
    if (!createdJobId) throw new Error("No createdJobId from test 4.10");
    const headers = await authHeaders();

    const maxAttempts = 12; // 12 * 10s = 120s
    let state = "UNKNOWN";
    for (let i = 0; i < maxAttempts; i++) {
      const res = await axios.get(`${RUNTIME_BASE}/jobs/${createdJobId}`, {
        headers,
      });
      state = res.data?.state?.status || res.data?.status || "UNKNOWN";
      console.log(`   Poll #${i + 1}: state=${state}`);
      if (String(state).toLowerCase().includes("completed")) break;
      await sleep(10000);
    }

    const resRes = await axios.get(
      `${RUNTIME_BASE}/jobs/${createdJobId}/results`,
      { headers }
    );

    if (!resRes.data || !resRes.data.results) {
      throw new Error("results field missing");
    }
  });

  // 13) Get job by INVALID id
  await runTest("4.13", "Job – invalid id returns error", async () => {
    const headers = await authHeaders();
    try {
      await axios.get(`${RUNTIME_BASE}/jobs/00000000-0000-0000-0000-000000000000`, {
        headers,
      });
      throw new Error("Expected error but request succeeded");
    } catch (err) {
      if (!err.response || (err.response.status !== 404 && err.response.status !== 400)) {
        throw err;
      }
    }
  });

  // 14) Jobs – invalid query parameter limit=-1
  await runTest("4.14", "Jobs – invalid limit query", async () => {
    const headers = await authHeaders();
    const res = await axios.get(`${RUNTIME_BASE}/jobs?limit=-1`, { headers });
    // Some APIs ignore bad limit and still return 200, so just log status.
    console.log("\n   HTTP status:", res.status);
  });

  // 15) Try to cancel the created job
  await runTest("4.15", "Cancel job (DELETE /v1/jobs/{id})", async () => {
    if (!createdJobId) throw new Error("No createdJobId from test 4.10");
    const headers = await authHeaders();
    try {
      const res = await axios.delete(`${RUNTIME_BASE}/jobs/${createdJobId}`, {
        headers,
      });
      console.log("\n   Cancel status:", res.status);
    } catch (err) {
      // If already completed, IBM might return 409 / 400 etc – treat as OK
      if (!err.response) throw err;
      console.log("\n   Cancel failed as expected, status:", err.response.status);
    }
  });

  console.log("\n=== STEP 4 DONE ===");
})();
