import axios from "axios";
import toast from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
  baseURL: BACKEND_URL || "http://localhost:8000",
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    toast.error(err.response?.data?.detail || "Something went wrong");
    return Promise.reject(err);
  }
);

export default API;