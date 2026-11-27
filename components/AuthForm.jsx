"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../app/contexts/AuthContext";

const easeOut = [0.22, 1, 0.36, 1];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AuthForm() {
  const { login, forgotPassword } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState("login"); // "login" | "signup" | "verify" | "forgot"
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    if (newMode !== "verify") {
      setOtpDigits(["", "", "", "", "", ""]);
    }
  };

  const handleOtpChange = (index, value) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    // Handle pasting full 6-digit code
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split("");
      const next = ["", "", "", "", "", ""];
      chars.forEach((ch, idx) => {
        next[idx] = ch;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(chars.length, 5);
      otpRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp: code,
      });

      if (data?.success && data?.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("avenue_token", data.token);
        }
        setSuccessMsg("Email verified! Redirecting to your dashboard...");
        window.location.href = "/dashboard";
      } else {
        setError(data?.message || "Verification failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const { data } = await axios.post(`${API_URL}/auth/resend-otp`, {
        email,
      });
      setSuccessMsg(data?.message || "New OTP sent to your email.");
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCooldown(30);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (!res?.success) {
          // If backend blocked unverified login, switch straight to OTP verification
          if (
            res?.requiresVerification ||
            String(res?.message || "").toLowerCase().includes("verify your email")
          ) {
            setMode("verify");
            setResendCooldown(30);
            setSuccessMsg("We sent a 6-digit verification OTP to your email.");
          } else {
            setError(res?.message || "Invalid email or password");
          }
        }
      } else if (mode === "signup") {
        const { data } = await axios.post(`${API_URL}/auth/register`, {
          name,
          email,
          password,
          phone,
        });

        if (data?.success && data?.requiresVerification) {
          setMode("verify");
          setResendCooldown(30);
          setSuccessMsg(
            data.message || "Verification OTP sent to your email."
          );
        } else {
          setError(data?.message || "Could not create account");
        }
      } else if (mode === "forgot") {
        const res = await forgotPassword(email);
        if (!res?.success) {
          setError(res?.message || "Could not send reset link");
        } else {
          setSuccessMsg("Reset link sent to your email.");
          setEmail("");
        }
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.requiresVerification) {
        setMode("verify");
        setResendCooldown(30);
        setSuccessMsg(resp.message || "Please verify your email with the OTP sent.");
      } else {
        setError(resp?.message || err.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-[#080906] flex">
      {/* LEFT SIDE: CINEMATIC IMAGE */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: easeOut }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080906]/80 to-[#080906]/30" />
        <div className="absolute bottom-20 left-20 z-10 max-w-md">
          <h2 className="font-serif text-4xl text-white font-light leading-tight mb-4">
            "The body achieves what the mind believes."
          </h2>
          <p className="text-[#C9944A] text-[10px] tracking-[0.3em] uppercase font-bold">
            — Avenue Philosophy
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: THE FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-hidden pt-32 lg:pt-0">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#C9944A]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center justify-center mb-12">
            <span className="font-serif text-3xl tracking-[0.3em] text-white font-light">
              AVENUE
            </span>
            <span className="text-[8px] tracking-[0.6em] uppercase text-[#C9944A] mt-1 font-semibold">
              Longevity Retreat
            </span>
          </div>

          {/* Form Header & Toggle */}
          <div className="flex flex-col mb-10">
            <h1 className="font-serif text-4xl text-white font-light mb-8">
              {mode === "login"
                ? "Welcome back."
                : mode === "signup"
                ? "Join the retreat."
                : mode === "verify"
                ? "Verify your email."
                : "Reset password."}
            </h1>

            {(mode === "login" || mode === "signup") && (
              <div className="flex items-center gap-6 border-b border-white/10 pb-4 relative">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${
                    mode === "login"
                      ? "text-white"
                      : "text-white/40 hover:text-white/80"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${
                    mode === "signup"
                      ? "text-white"
                      : "text-white/40 hover:text-white/80"
                  }`}
                >
                  Create Account
                </button>
                <motion.div
                  layoutId="auth-underline"
                  className="absolute bottom-0 h-[2px] bg-[#C9944A]"
                  initial={false}
                  animate={{
                    left: mode === "login" ? "0%" : "22%",
                    width: mode === "login" ? "34px" : "105px",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs"
              >
                <X size={14} className="shrink-0" /> <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-xs"
              >
                <CheckCircle2 size={14} className="shrink-0" />{" "}
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════ OTP VERIFICATION STEP ═══════ */}
          {mode === "verify" ? (
            <motion.form
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: easeOut }}
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >
              <p className="text-white/60 text-sm leading-relaxed">
                Enter the 6-digit verification code sent to{" "}
                <span className="text-[#C9944A] font-medium">{email}</span>.
              </p>

              <div className="flex items-center justify-between gap-2 pt-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    aria-label={`OTP digit ${idx + 1}`}
                    className="w-12 h-14 text-center font-mono text-xl text-white bg-[#121310] border border-white/15 rounded-xl outline-none focus:border-[#C9944A] transition-colors"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.join("").length !== 6}
                className="w-full mt-4 flex items-center justify-center gap-3 bg-[#C9944A] text-[#080906] py-4 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors shadow-[0_0_30px_rgba(201,148,74,0.2)] disabled:opacity-60"
              >
                {isLoading ? "Verifying..." : "Verify & Enter Sanctuary"}
                {!isLoading && <ShieldCheck size={16} />}
              </button>

              <div className="flex items-center justify-between pt-2 text-[10px] uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending}
                  className="inline-flex items-center gap-1.5 text-[#C9944A] hover:text-white transition-colors disabled:opacity-45"
                >
                  <RefreshCw
                    size={12}
                    className={isResending ? "animate-spin" : ""}
                  />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>
            </motion.form>
          ) : (
            /* ═══════ LOGIN / SIGNUP / FORGOT FORM ═══════ */
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: easeOut }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {mode === "signup" && (
                  <>
                    <div className="relative group">
                      <User
                        size={18}
                        className="absolute left-0 top-3 text-white/40 group-focus-within:text-[#C9944A] transition-colors"
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder=" "
                        className="peer w-full bg-transparent border-b border-white/20 py-3 pl-8 text-white outline-none focus:border-[#C9944A] transition-colors"
                      />
                      <label className="absolute left-8 top-3 text-white/40 text-sm transition-all peer-focus:-top-4 peer-focus:left-0 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-[10px] uppercase tracking-widest pointer-events-none">
                        Full Name
                      </label>
                    </div>

                    <div className="relative group">
                      <Phone
                        size={18}
                        className="absolute left-0 top-3 text-white/40 group-focus-within:text-[#C9944A] transition-colors"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder=" "
                        className="peer w-full bg-transparent border-b border-white/20 py-3 pl-8 text-white outline-none focus:border-[#C9944A] transition-colors"
                      />
                      <label className="absolute left-8 top-3 text-white/40 text-sm transition-all peer-focus:-top-4 peer-focus:left-0 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-[10px] uppercase tracking-widest pointer-events-none">
                        Phone Number (Optional)
                      </label>
                    </div>
                  </>
                )}

                <div className="relative group">
                  <Mail
                    size={18}
                    className="absolute left-0 top-3 text-white/40 group-focus-within:text-[#C9944A] transition-colors"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-white/20 py-3 pl-8 text-white outline-none focus:border-[#C9944A] transition-colors"
                  />
                  <label className="absolute left-8 top-3 text-white/40 text-sm transition-all peer-focus:-top-4 peer-focus:left-0 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-[10px] uppercase tracking-widest pointer-events-none">
                    Email Address
                  </label>
                </div>

                {mode !== "forgot" && (
                  <div className="relative group">
                    <Lock
                      size={18}
                      className="absolute left-0 top-3 text-white/40 group-focus-within:text-[#C9944A] transition-colors"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder=" "
                      className="peer w-full bg-transparent border-b border-white/20 py-3 pl-8 pr-8 text-white outline-none focus:border-[#C9944A] transition-colors"
                    />
                    <label className="absolute left-8 top-3 text-white/40 text-sm transition-all peer-focus:-top-4 peer-focus:left-0 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-[10px] uppercase tracking-widest pointer-events-none">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-0 top-3 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-[10px] uppercase tracking-widest text-[#C9944A] hover:text-white transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 flex items-center justify-center gap-3 bg-[#C9944A] text-[#080906] py-4 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors shadow-[0_0_30px_rgba(201,148,74,0.2)] disabled:opacity-70"
                >
                  {isLoading
                    ? "Processing..."
                    : mode === "login"
                    ? "Enter the Sanctuary"
                    : mode === "signup"
                    ? "Send Verification OTP"
                    : "Send Reset Link"}
                  {!isLoading && <ArrowRight size={16} />}
                </button>

                {mode === "forgot" && (
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="w-full text-center text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors mt-4"
                  >
                    Back to Login
                  </button>
                )}
              </motion.form>
            </AnimatePresence>
          )}

          {(mode === "login" || mode === "signup") && (
            <>
              <div className="flex items-center gap-4 my-8">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                  Or continue with
                </span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 bg-[#121310] border border-white/10 py-3 rounded-full hover:bg-white/5 transition-colors"
                >
                  <FcGoogle size={18} />{" "}
                  <span className="text-[10px] uppercase tracking-widest text-white">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 bg-[#121310] border border-white/10 py-3 rounded-full hover:bg-white/5 transition-colors"
                >
                  <FaApple size={18} className="text-white" />{" "}
                  <span className="text-[10px] uppercase tracking-widest text-white">
                    Apple
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}