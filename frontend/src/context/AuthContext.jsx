// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";

export const API_BASE = "http://localhost:5000/api";
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("qn_token") || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("qn_user")); } catch { return null; }
  });

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem("qn_token", newToken);
    localStorage.setItem("qn_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("qn_token");
    localStorage.removeItem("qn_user");
    setToken(null);
    setUser(null);
  }, []);

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const currentToken = localStorage.getItem("qn_token");
    const res = await fetch(API_BASE + endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + currentToken,
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      logout();
      throw new Error("Session expired. Please login again.");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── useApi Hook ──────────────────────────────
export const useApi = (endpoint) => {
  const { apiFetch } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFetch(endpoint);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { loadData(); }, [endpoint]);
  return { data, loading, error, refetch: loadData };
};