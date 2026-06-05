export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "/api"
    : "http://localhost:5000/api");

export const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchJson(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    throw new Error("Unexpected server response.");
  }

  if (!res.ok || data?.success === false || data?.ok === false) {
    throw new Error(
      data?.error || data?.message || `Request failed with ${res.status}`
    );
  }

  return data;
}
