import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Load logged-in user (used on refresh)
  const loadUser = async () => {
    const token = localStorage.getItem("access");

    // ✅ IMPORTANT GUARD
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/accounts/me/");
      setUser(res.data);
    } catch (error) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run once on app load
  useEffect(() => {
    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    // 1. Authenticate
    const res = await api.post("/auth/login/", { email, password });

    // 2. Save tokens
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    // 3. Fetch user info
    const meRes = await api.get("/accounts/me/");
    setUser(meRes.data);

    // 4. Redirect based on role
    if (meRes.data.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/employee");
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
