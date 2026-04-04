import axios from "axios";
import toast from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: BACKEND_URL,
});

// Request interceptor to add JWT token and Organization ID
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const orgId = localStorage.getItem("org_id");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (orgId) {
      // Add org_id as a query param for relevant requests
      const method = config.method ? config.method.toUpperCase() : "";
      if (["GET", "POST", "PUT", "DELETE"].includes(method)) {
        config.params = config.params || {};
        config.params.org_id = orgId;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and blacklisted tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      toast.error(error.response?.data?.detail || "Session expired. Please login again.");
    } else {
      toast.error(error.response?.data?.detail || "Something went wrong. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default API;