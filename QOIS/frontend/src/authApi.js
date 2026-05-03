// src/authApi.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";


// --------------------------------------------------
// AXIOS INSTANCE
// --------------------------------------------------
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


// --------------------------------------------------
// AUTO ATTACH TOKEN TO REQUESTS
// --------------------------------------------------
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------
const getErrorMessage = (error) => {
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.message) return error.response.data.message;
  return error.message || "Something went wrong.";
};


// ==================================================
// SIGNUP
// ==================================================
export const signupSendOtp = async ({ name, email }) => {
  try {
    const res = await api.post("/auth/signup/send-otp", { email, name });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};


export const signupVerifyOtp = async ({ name, email, otp, password }) => {
  try {
    const res = await api.post("/auth/signup/verify-otp", {
      name,
      email,
      otp,
      password,
    });

    // ⭐ STORE TOKEN
    localStorage.setItem("token", res.data.token);

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};


// ==================================================
// LOGIN PASSWORD
// ==================================================
export const loginWithPassword = async ({ email, password }) => {
  try {
    const res = await api.post("/auth/login/password", { email, password });

    localStorage.setItem("token", res.data.token);

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};


// ==================================================
// LOGIN OTP
// ==================================================
export const loginSendOtp = async ({ email }) => {
  try {
    const res = await api.post("/auth/login/send-otp", { email });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};


export const loginVerifyOtp = async ({ email, otp }) => {
  try {
    const res = await api.post("/auth/login/verify-otp", { email, otp });

    localStorage.setItem("token", res.data.token);

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};


// ==================================================
// GOOGLE LOGIN
// ==================================================
export const getGoogleAuthUrl = () =>
  `${API_BASE_URL}/auth/google`;


// ==================================================
// GET LOGGED USER (VERY IMPORTANT FOR NAVBAR)
// ==================================================
export const getCurrentUser = async () => {
  try {
    const res = await api.get("/auth/me");
    return res.data.user;
  } catch (err) {
    localStorage.removeItem("token");
    throw new Error(getErrorMessage(err));
  }
};


// ==================================================
// LOGOUT
// ==================================================
export const logout = () => {
  localStorage.removeItem("token");
};


export default api;
