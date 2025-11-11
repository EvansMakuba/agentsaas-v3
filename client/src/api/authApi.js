import axios from "axios";

const API = axios.create({
  baseURL: "https://agentsaas-v3.onrender.com/api/auth",
});

// Attach token for protected routes
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);
export const forgotPassword = (data) => API.post("/forgot-password", data);
export const resetPassword = (token, data) =>
  API.post(`/reset-password/${token}`, data);
