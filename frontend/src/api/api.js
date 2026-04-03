import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    toast.error(err.response?.data?.detail || "Something went wrong");
    return Promise.reject(err);
  }
);

export default API;