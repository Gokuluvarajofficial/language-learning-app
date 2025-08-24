// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: "/", // goes through Vite proxy
  // no global headers here; let Axios decide per-method
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      if (typeof window !== "undefined") window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export default api;
