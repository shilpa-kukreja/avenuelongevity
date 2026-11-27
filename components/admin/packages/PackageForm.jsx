"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function extractPackage(payload, packageId) {
  if (!payload) return null;

  if (payload.package && typeof payload.package === "object") {
    return payload.package;
  }
  if (payload.data && !Array.isArray(payload.data) && typeof payload.data === "object") {
    return payload.data.package || payload.data;
  }

  const list = Array.isArray(payload)
    ? payload
    : payload.packages || payload.data || [];

  if (Array.isArray(list)) {
    return (
      list.find(
        (item) =>
          String(item?._id || item?.id) === String(packageId)
      ) || null
    );
  }

  return null;
}

export default function PackageForm({ packageId }) {
  const router = useRouter();
  const isEdit = Boolean(packageId);

  const [formData, setFormData] = useState({
    name: "",
    sessions: 5,
    price: 0,
    originalPrice: 0,
    validity: "90 days",
    isActive: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!packageId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchPkg = async () => {
      setLoading(true);
      setError("");
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let found = null;

        try {
          const { data } = await axios.get(`${API_URL}/packages/${packageId}`, {
            headers,
          });
          found = extractPackage(data, packageId);
        } catch {
          // Fallback to list endpoint if single-item GET route is not used
        }

        if (!found) {
          const { data } = await axios.get(`${API_URL}/packages`, { headers });
          found = extractPackage(data, packageId);
        }

        if (cancelled) return;

        if (!found) {
          setError("Package not found.");
        } else {
          setFormData({
            name: found.name ?? "",
            sessions: Number(found.sessions ?? 0),
            price: Number(found.price ?? 0),
            originalPrice: Number(found.originalPrice ?? 0),
            validity: found.validity ?? "90 days",
            isActive: found.isActive !== undefined ? Boolean(found.isActive) : true,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message || err?.message || "Failed to load package."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPkg();

    return () => {
      cancelled = true;
    };
  }, [packageId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token =
      typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const payload = {
      name: formData.name.trim(),
      sessions: Number(formData.sessions) || 0,
      price: Number(formData.price) || 0,
      originalPrice: Number(formData.originalPrice) || 0,
      validity: formData.validity.trim(),
      isActive: Boolean(formData.isActive),
    };

    try {
      if (isEdit) {
        await axios.put(`${API_URL}/packages/${packageId}`, payload, config);
      } else {
        await axios.post(`${API_URL}/packages`, payload, config);
      }
      router.push("/admin/packages");
      router.refresh();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to save package."
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white/40 text-center py-20">
        <Loader2 className="animate-spin mx-auto mb-3 text-[#C9944A]" />
        <p className="text-xs uppercase tracking-widest">Loading package…</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Link
        href="/admin/packages"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Packages
      </Link>

      <div className="bg-[#121310] border border-white/5 rounded-3xl p-8 md:p-12">
        <h2 className="font-serif text-3xl text-white mb-8">
          {isEdit ? "Edit Package" : "Create New Package"}
        </h2>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#C9944A] mb-2">
              Package Name
            </label>
            <input
              type="text"
              placeholder="e.g. Starter"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">
                Total Sessions
              </label>
              <input
                type="number"
                min={1}
                value={formData.sessions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sessions: e.target.value,
                  }))
                }
                required
                className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">
                Validity
              </label>
              <input
                type="text"
                placeholder="e.g. 90 days"
                value={formData.validity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validity: e.target.value }))
                }
                required
                className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">
                Discounted Price ($)
              </label>
              <input
                type="number"
                min={0}
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                required
                className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">
                Original Price ($)
              </label>
              <input
                type="number"
                min={0}
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    originalPrice: e.target.value,
                  }))
                }
                required
                className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-4 h-4 accent-[#C9944A] rounded"
            />
            <span className="text-xs text-white/75">
              Active (visible and available for purchase)
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-8 flex items-center justify-center gap-3 bg-[#C9944A] text-[#080906] py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors disabled:opacity-70"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : isEdit ? "Update Package" : "Save Package"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}