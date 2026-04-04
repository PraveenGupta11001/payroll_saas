import { createContext, useContext, useState, useEffect } from "react";
import API from "./api/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [org, setOrg] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchOrganizations();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchOrganizations = async () => {
    try {
      const res = await API.get("/organizations/");
      setOrganizations(res.data);
      
      const storedOrgId = localStorage.getItem("org_id");
      if (storedOrgId) {
        const found = res.data.find(o => o.id.toString() === storedOrgId);
        if (found) setOrg(found);
        else if (res.data.length > 0) selectOrg(res.data[0]);
      } else if (res.data.length > 0) {
        selectOrg(res.data[0]);
      }
    } catch (err) {
      console.error("Fetch orgs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      const { access_token, user: userData } = res.data;
      
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      toast.success("Welcome back, " + userData.full_name);
      return true;
    } catch (err) {
      return false;
    }
  };

  const register = async (email, password, fullName) => {
    try {
      await API.post("/auth/register", { 
        email, 
        password, 
        full_name: fullName 
      });
      toast.success("Account created! Please login.");
      return true;
    } catch (err) {
      return false;
    }
  };

  const selectOrg = (orgData) => {
    localStorage.setItem("org_id", orgData.id);
    setOrg(orgData);
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      setToken(null);
      setUser(null);
      setOrg(null);
      setOrganizations([]);
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, org, organizations, loading, 
      login, register, logout, selectOrg, fetchOrganizations 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
