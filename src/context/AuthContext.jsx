import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  // null = checking, false = guest, object = authed
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("jv_token");
    if (!t) {
      setUser(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => {
        localStorage.removeItem("jv_token");
        setUser(false);
      });
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("jv_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("jv_token");
    setUser(false);
  };

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (user === null) {
    return (
      <div className="min-h-screen bg-[#08080B] flex items-center justify-center" data-testid="admin-loading">
        <div className="w-8 h-8 border-2 border-[#6C19D9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user === false) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
}
