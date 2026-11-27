"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, Edit3, Trash2, Loader2, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const formatUSD = (value) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

export default function PackagesListAdmin() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_URL}/packages?all=true`);
      const list = Array.isArray(data)
        ? data
        : data?.packages || data?.data || [];
      setPackages(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch packages", err);
      setError(
        err?.message === "Network Error"
          ? `Cannot reach API at ${API_URL}. Check if the backend server is running.`
          : err?.response?.data?.message || err?.message || "Failed to fetch packages"
      );
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this package permanently?")) return;
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
      await axios.delete(`${API_URL}/packages/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchPackages();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="text-white/40 text-center py-20">
        <Loader2 className="animate-spin mx-auto mb-4 text-[#C9944A]" />
        Loading Packages...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-2xl text-white">Manage Packages</h2>
        <Link
          href="/admin/packages/add"
          className="flex items-center gap-2 bg-[#C9944A] text-[#080906] px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors"
        >
          <Plus size={14} /> Add Package
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchPackages}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 shrink-0"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const id = pkg._id || pkg.id;
          const isActive = pkg.isActive !== undefined ? Boolean(pkg.isActive) : true;

          return (
            <div
              key={id}
              className="bg-[#121310] border border-white/5 p-6 rounded-2xl group relative flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#C9944A] font-bold">
                    {pkg.sessions} Sessions
                  </span>
                  <h3 className="text-white font-serif text-2xl mt-1">
                    {pkg.name}
                  </h3>
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/packages/edit/${id}`}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-[#C9944A] hover:bg-[#C9944A]/10 transition-colors"
                  >
                    <Edit3 size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(id)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4 mb-6">
                <span className="font-serif text-3xl text-white">
                  {formatUSD(pkg.price)}
                </span>
                {Number(pkg.originalPrice) > 0 && (
                  <span className="text-white/30 line-through text-sm ml-2">
                    {formatUSD(pkg.originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-auto">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">
                  Valid: {pkg.validity}
                </span>
                <span
                  className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${
                    isActive
                      ? "text-green-400 bg-green-500/10"
                      : "text-white/40 bg-white/5"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          );
        })}
        {!error && packages.length === 0 && (
          <div className="col-span-3 text-center text-white/40 py-10 border border-white/5 rounded-2xl">
            No packages found. Add one to get started.
          </div>
        )}
      </div>
    </motion.div>
  );
}