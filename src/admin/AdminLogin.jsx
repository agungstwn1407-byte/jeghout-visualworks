import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080B] flex items-center justify-center px-6 relative overflow-hidden" data-testid="admin-login-page">
      <div className="pointer-events-none absolute top-[-20%] right-[-10%] w-[32rem] h-[32rem] rounded-full bg-[radial-gradient(circle,rgba(108,25,217,0.18),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-[#111116] border border-white/10 p-10"
      >
        <p className="font-display font-bold text-2xl">Jeghout<span className="text-[#8B35FF]">.</span></p>
        <p className="text-[#9A9A9F] text-sm mt-2 mb-8">Admin Dashboard — sign in to manage your portfolio.</p>
        <form onSubmit={submit} className="space-y-5" data-testid="admin-login-form">
          <div>
            <label htmlFor="a-email" className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F]">Email</label>
            <input
              id="a-email"
              data-testid="admin-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 bg-[#08080B] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B35FF] transition-colors"
              placeholder="admin@visualworks.id"
            />
          </div>
          <div>
            <label htmlFor="a-pass" className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F]">Password</label>
            <input
              id="a-pass"
              data-testid="admin-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 bg-[#08080B] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B35FF] transition-colors"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-400" data-testid="admin-login-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full bg-[#6C19D9] hover:bg-[#8B35FF] disabled:opacity-50 text-white font-medium py-3.5 transition-colors duration-300"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
