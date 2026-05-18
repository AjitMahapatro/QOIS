// src/jobsApi.js

// -------------------------------
// API BASE URL
// -------------------------------
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// -------------------------------
// AUTH HEADERS
// -------------------------------
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// -------------------------------
// UNIFIED JSON HANDLER
// -------------------------------
const handleJsonResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Unexpected server response.");
  }

  if (!res.ok || data?.success === false) {
    throw new Error(
      data?.error || data?.message || `Request failed with ${res.status}`
    );
  }

  return data;
};

// ---------------------------------------------------------
// 1. Fetch IBM Backends
// ---------------------------------------------------------
export async function fetchBackends({ minQubits = 1 } = {}) {
  const params = new URLSearchParams();
  params.set("minQubits", String(Math.max(1, Number(minQubits) || 1)));

  const res = await fetch(`${API_BASE_URL}/backends?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  const json = await handleJsonResponse(res);

  if (Array.isArray(json.data?.devices)) return json.data.devices;
  if (Array.isArray(json.data)) return json.data;
  return [];
}

// ---------------------------------------------------------
// 2. Create Job (POST /jobs)
// ---------------------------------------------------------
export async function createJob(payload) {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const json = await handleJsonResponse(res);
  return json.data;
}

// ---------------------------------------------------------
// 3. Get Job By ID (GET /jobs/:id)
// ---------------------------------------------------------
export async function getJobById(jobId) {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  const json = await handleJsonResponse(res);
  return json.data;
}

// ---------------------------------------------------------
// 4. Submit Job to IBM (POST /jobs/:id/submit)
// ---------------------------------------------------------
export async function submitJobToIbm(jobId) {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  const json = await handleJsonResponse(res);
  return json.data;
}

// ---------------------------------------------------------
// 5. Get Job Status (GET /jobs/:id/status)
// ---------------------------------------------------------
export async function getJobStatus(jobId) {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  const json = await handleJsonResponse(res);
  return json.data || { status: json.status };
}

// ---------------------------------------------------------
// 6. Get Job Results (GET /jobs/:id/results)
// ---------------------------------------------------------
export async function getJobResults(jobId) {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/results`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  const json = await handleJsonResponse(res);
  return json.data || json.results;
}
