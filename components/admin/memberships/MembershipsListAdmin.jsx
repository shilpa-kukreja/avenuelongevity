"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, Edit3, Trash2, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function MembershipsListAdmin() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatUSD = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: Number(value) % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/memberships`);
      const list = Array.isArray(data)
        ? data
        : data?.memberships || data?.plans || data?.data || [];
      setMemberships(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch memberships", error);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this membership tier permanently?")) return;
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
      await axios.delete(`${API_URL}/memberships/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchMemberships();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="text-white/40 text-center py-20">
        <Loader2 className="animate-spin mx-auto mb-4 text-[#C9944A]" />
        Loading Plans...
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
        <h2 className="font-serif text-2xl text-white">
          Manage Membership Plans
        </h2>
        <Link
          href="/admin/memberships/add"
          className="flex items-center gap-2 bg-[#C9944A] text-[#080906] px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors"
        >
          <Plus size={14} /> Add Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {memberships.map((m) => {
          const id = m._id || m.id;
          const monthlyPrice = Number(m.monthlyPrice || 0);
          const yearlyPrice = Number(m.yearlyPrice || 0);
          const isActive = m.isActive !== undefined ? Boolean(m.isActive) : true;

          return (
            <div
              key={id}
              className="bg-[#121310] border border-white/5 p-6 rounded-2xl group relative flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-serif text-2xl">{m.name}</h3>
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/memberships/edit/${id}`}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-[#C9944A] hover:bg-[#C9944A]/10 transition-colors"
                    title="Edit plan"
                  >
                    <Edit3 size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(id)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-6 mt-2">
                <span className="font-serif text-3xl text-white">
                  {formatUSD(m.monthlyPrice)}
                </span>
                <span className="text-white/40 text-xs ml-1">/ mo</span>
                <div className="text-white/30 text-xs mt-1">
                  {formatUSD(m.yearlyPrice)} billed yearly
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-auto">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">
                  {m.perks?.length || 0} Perks
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
        {memberships.length === 0 && (
          <div className="col-span-3 text-center text-white/40 py-10 border border-white/5 rounded-2xl">
            No membership plans found. Add one to get started.
          </div>
        )}
      </div>
    </motion.div>
  );
}