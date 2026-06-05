// src/jobsApi.js
import { fetchJson } from "./apiBase.js";

// ---------------------------------------------------------
// 1. Fetch IBM Backends
// ---------------------------------------------------------
export async function fetchBackends({ minQubits = 1 } = {}) {
  const params = new URLSearchParams();
  params.set("minQubits", String(Math.max(1, Number(minQubits) || 1)));

  const json = await fetchJson(`/backends?${params.toString()}`);

  if (Array.isArray(json.data?.devices)) return json.data.devices;
  if (Array.isArray(json.data)) return json.data;
  return [];
}

// ---------------------------------------------------------
// 2. Create Job (POST /jobs)
// ---------------------------------------------------------
export async function createJob(payload) {
  const json = await fetchJson("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return json.data;
}

// ---------------------------------------------------------
// 3. Get Job By ID (GET /jobs/:id)
// ---------------------------------------------------------
export async function getJobById(jobId) {
  const json = await fetchJson(`/jobs/${jobId}`);
  return json.data;
}

// ---------------------------------------------------------
// 4. Submit Job to IBM (POST /jobs/:id/submit)
// ---------------------------------------------------------
export async function submitJobToIbm(jobId) {
  const json = await fetchJson(`/jobs/${jobId}/submit`, {
    method: "POST",
  });
  return json.data;
}

// ---------------------------------------------------------
// 5. Get Job Status (GET /jobs/:id/status)
// ---------------------------------------------------------
export async function getJobStatus(jobId) {
  const json = await fetchJson(`/jobs/${jobId}/status`);
  return json.data || { status: json.status };
}

// ---------------------------------------------------------
// 6. Get Job Results (GET /jobs/:id/results)
// ---------------------------------------------------------
export async function getJobResults(jobId) {
  const json = await fetchJson(`/jobs/${jobId}/results`);
  return json.data || json.results;
}
