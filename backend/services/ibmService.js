import axios from "axios";

const IBM_IDENTITY_URL = "https://iam.cloud.ibm.com/identity/token";
const IBM_RUNTIME_URL = "https://quantum.cloud.ibm.com/api/v1";

let cachedBearerToken = null;
let tokenExpirationTime = 0;

export const getBearerToken = async () => {
  if (cachedBearerToken && Date.now() < tokenExpirationTime) {
    return cachedBearerToken;
  }

  const body = new URLSearchParams({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: process.env.IBM_API_KEY
  });

  const response = await axios.post(IBM_IDENTITY_URL, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  cachedBearerToken = response.data.access_token;
  tokenExpirationTime =
    Date.now() + response.data.expires_in * 1000 - 300000;

  return cachedBearerToken;
};

export const getRuntimeRequestHeaders = () => {
  const apiKey = process.env.IBM_API_KEY;

  if (!apiKey) {
    throw new Error("IBM_API_KEY is not configured.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "X-IBM-Quantum-User-Agent": "qiskit-runtime/v2",
    "X-IBM-Quantum-Api-Version": "v2"
  };

  if (process.env.IBM_INSTANCE_CRN) {
    headers["Service-CRN"] = process.env.IBM_INSTANCE_CRN;
  }

  return headers;
};

const getAuthHeaders = async () => getRuntimeRequestHeaders();

export const extractRuntimeCounts = (rawResults) => {
  if (rawResults?.results?.[0]?.data) {
    const dataObj = rawResults.results[0].data;

    for (const key of Object.keys(dataObj)) {
      if (dataObj[key] && typeof dataObj[key] === "object") {
        if (dataObj[key].counts) {
          return dataObj[key].counts;
        }

        if (dataObj[key].get_counts) {
          return dataObj[key].get_counts;
        }
      }
    }
  }

  if (rawResults?.results?.[0]?.counts) {
    return rawResults.results[0].counts;
  }

  for (const val of Object.values(rawResults || {})) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return val;
    }
  }

  return {};
};

export const getJobResultsFromIBM = async (jobId) => {
  const headers = getRuntimeRequestHeaders();
  const res = await axios.get(`${IBM_RUNTIME_URL}/jobs/${jobId}/results`, {
    headers
  });
  return res.data;
};

export const fetchRuntimeJobFromIBM = async (jobId) => {
  const headers = getRuntimeRequestHeaders();
  const statusRes = await axios.get(`${IBM_RUNTIME_URL}/jobs/${jobId}`, {
    headers
  });
  const statusData = statusRes.data;
  const stateStr = String(
    statusData.state?.status || statusData.status || ""
  ).toUpperCase();

  let rawResults = null;
  let parsedCounts = {};
  let resultWarning = "";

  if (stateStr === "COMPLETED" || stateStr === "DONE") {
    try {
      rawResults = await getJobResultsFromIBM(jobId);
      parsedCounts = extractRuntimeCounts(rawResults);
    } catch (error) {
      resultWarning =
        error.response?.data?.message ||
        error.message ||
        "IBM Runtime result payload is not available yet.";
    }
  }

  return {
    jobId,
    status: stateStr,
    backend: statusData.backend || statusData.backend_id || null,
    metrics: statusData.metrics || {},
    usage: statusData.usage || {},
    rawResults,
    result: {
      type: "sampler",
      source: "ibm_runtime_rest",
      counts: parsedCounts
    },
    resultWarning,
    reason: statusData.state?.reason || "",
    errorMessage: statusData.error_message || ""
  };
};

export const submitJob = async (payload) => {
  const headers = await getAuthHeaders();
  const finalPayload = {
    ...payload,
    program_id: "sampler"
  };

  const res = await axios.post(`${IBM_RUNTIME_URL}/jobs`, finalPayload, {
    headers
  });

  return res.data;
};

export const getJobStatusFromIBM = async (jobId) => {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${IBM_RUNTIME_URL}/jobs/${jobId}`, {
    headers
  });
  return res.data;
};

export const getBackends = async () => {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${IBM_RUNTIME_URL}/backends`, {
    headers
  });
  return res.data;
};
