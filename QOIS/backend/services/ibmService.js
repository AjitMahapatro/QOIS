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

  const response = await axios.post(
    IBM_IDENTITY_URL,
    body.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  cachedBearerToken = response.data.access_token;
  tokenExpirationTime =
    Date.now() + response.data.expires_in * 1000 - 300000;

  return cachedBearerToken;
};

const getAuthHeaders = async () => {
  const token = await getBearerToken();

  return {
    Authorization: `Bearer ${token}`,
    "Service-CRN": process.env.IBM_INSTANCE_CRN,

    // 🔥 REQUIRED FOR PRIMITIVES V2
    "X-IBM-Quantum-User-Agent": "qiskit-runtime/v2",
    "X-IBM-Quantum-Api-Version": "v2",

    "Content-Type": "application/json"
  };
};

export const submitJob = async (payload) => {
  const headers = await getAuthHeaders();

  // 🔥 Ensure primitive is Sampler (V2 compatible)
  const finalPayload = {
    ...payload,
    program_id: "sampler"
  };

  const res = await axios.post(
    `${IBM_RUNTIME_URL}/jobs`,
    finalPayload,
    { headers }
  );

  return res.data;
};

export const getJobStatusFromIBM = async (jobId) => {
  const headers = await getAuthHeaders();
  const res = await axios.get(
    `${IBM_RUNTIME_URL}/jobs/${jobId}`,
    { headers }
  );
  return res.data;
};

export const getBackends = async () => {
  const headers = await getAuthHeaders();
  const res = await axios.get(
    `${IBM_RUNTIME_URL}/backends`,
    { headers }
  );
  return res.data;
};
