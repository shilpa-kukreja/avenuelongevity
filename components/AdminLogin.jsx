"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../app/contexts/AuthContext";

const easeOut = [0.22, 1, 0.36, 1];

export default function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // We pass "/admin" as the redirect path
    const res = await login(email, password, "/admin");
    
    if (!res.success) {
      setError(res.message);
      setIsLoading(false);
    } else if (res.role !== "admin") {
      // If logged in but not an admin, we need to log them out
      localStorage.removeItem("avenue_token");
      window.location.reload();
      setError("Access Denied: You do not have admin privileges.");
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-[#080906] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#C9944A]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#9A6B3F]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:40px_40px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut }}
        className="relative z-10 w-full max-w-md bg-[#121310]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-[#C9944A] flex items-center justify-center text-[#080906] font-bold text-xl mb-4 shadow-[0_0_20px_rgba(201,148,74,0.3)]">
            A
          </div>
          <h1 className="font-serif text-2xl text-white tracking-widest">ADMIN ACCESS</h1>
          <p className="text-[#A89C8C] text-[10px] uppercase tracking-[0.3em] mt-2">Authorized Personnel Only</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle size={14} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <Mail size={18} className="absolute left-0 top-3 text-white/40 group-focus-within:text-[#C9944A] transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" " 
              required 
              className="peer w-full bg-transparent border-b border-white/20 py-3 pl-8 text-white outline-none focus:border-[#C9944A] transition-colors" 
            />
            <label className="absolute left-8 top-3 text-white/40 text-sm transition-all peer-focus:-top-4 peer-focus:left-0 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-valid:-top-4 peer-valid:left-0 peer-valid:text-[10px] cursor-text uppercase tracking-widest pointer-events-none">Admin Email</label>
          </div>

          <div className="relative group">
            <Lock size={18} className="absolute left-0 top-3 text-white/40 group-focus-within:text-[#C9944A] transition-colors" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" " 
              required 
              className="peer w-full bg-transparent border-b border-white/20 py-3 pl-8 text-white outline-none focus:border-[#C9944A] transition-colors" 
            />
            <label className="absolute left-8 top-3 text-white/40 text-sm transition-all peer-focus:-top-4 peer-focus:left-0 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-valid:-top-4 peer-valid:left-0 peer-valid:text-[10px] cursor-text uppercase tracking-widest pointer-events-none">Password</label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#C9944A] text-[#080906] py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-all duration-300 mt-8 disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading ? "Authenticating..." : "Secure Login"}
            {!isLoading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-white/30">
          <ShieldCheck size={12} className="text-[#C9944A]" /> 256-bit Encrypted Connection
        </div>
      </motion.div>
    </section>
  );
}