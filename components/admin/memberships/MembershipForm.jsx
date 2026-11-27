"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, Plus, X } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function extractMembership(payload, membershipId) {
  if (!payload) return null;

  if (payload.membership && typeof payload.membership === "object") {
    return payload.membership;
  }
  if (payload.plan && typeof payload.plan === "object") {
    return payload.plan;
  }
  if (
    payload.data &&
    !Array.isArray(payload.data) &&
    typeof payload.data === "object"
  ) {
    return payload.data.membership || payload.data.plan || payload.data;
  }

  const list = Array.isArray(payload)
    ? payload
    : payload.memberships || payload.plans || payload.data || [];

  if (Array.isArray(list)) {
    return (
      list.find(
        (item) => String(item?._id || item?.id) === String(membershipId)
      ) || null
    );
  }

  return null;
}

export default function MembershipForm({ membershipId }) {
  const router = useRouter();
  const isEdit = Boolean(membershipId);

  const [formData, setFormData] = useState({
    name: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    perks: [""],
    isActive: true,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

const formatUSD = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: Number(value) % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;

  useEffect(() => {
    if (!membershipId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchPlan = async () => {
      setLoading(true);
      setError("");
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let found = null;

        try {
          const { data } = await axios.get(
            `${API_URL}/memberships/${membershipId}`,
            { headers }
          );
          found = extractMembership(data, membershipId);
        } catch {
          // Fallback to list endpoint if single-item GET route is not present
        }

        if (!found) {
          const { data } = await axios.get(`${API_URL}/memberships`, { headers });
          found = extractMembership(data, membershipId);
        }

        if (cancelled) return;

        if (!found) {
          setError("Membership plan not found.");
        } else {
          const normalizedPerks =
            Array.isArray(found.perks) && found.perks.length > 0
              ? found.perks.map((p) => String(p ?? ""))
              : [""];

          setFormData({
            name: found.name ?? "",
            monthlyPrice: Number(found.monthlyPrice ?? 0),
            yearlyPrice: Number(found.yearlyPrice ?? 0),
            perks: normalizedPerks,
            isActive:
              found.isActive !== undefined ? Boolean(found.isActive) : true,
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load membership plan."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPlan();

    return () => {
      cancelled = true;
    };
  }, [membershipId]);

  const handlePerkChange = (index, value) => {
    setFormData((prev) => {
      const nextPerks = [...prev.perks];
      nextPerks[index] = value;
      return { ...prev, perks: nextPerks };
    });
  };

  const addPerk = () => {
    setFormData((prev) => ({ ...prev, perks: [...prev.perks, ""] }));
  };

  const removePerk = (index) => {
    setFormData((prev) => {
      const filtered = prev.perks.filter((_, i) => i !== index);
      return { ...prev, perks: filtered.length > 0 ? filtered : [""] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token =
      typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    const cleanedData = {
      name: formData.name.trim(),
      monthlyPrice: Number(formData.monthlyPrice) || 0,
      yearlyPrice: Number(formData.yearlyPrice) || 0,
      perks: formData.perks.map((p) => p.trim()).filter((p) => p !== ""),
      isActive: Boolean(formData.isActive),
    };

    try {
      if (isEdit) {
        await axios.put(
          `${API_URL}/memberships/${membershipId}`,
          cleanedData,
          config
        );
      } else {
        await axios.post(`${API_URL}/memberships`, cleanedData, config);
      }
      router.push("/admin/memberships");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save membership"
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white/40 text-center py-20">
        <Loader2 className="animate-spin mx-auto mb-3 text-[#C9944A]" />
        <p className="text-xs uppercase tracking-widest">Loading plan…</p>
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
        href="/admin/memberships"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Memberships
      </Link>

      <div className="bg-[#121310] border border-white/5 rounded-3xl p-8 md:p-12">
        <h2 className="font-serif text-3xl text-white mb-8">
          {isEdit ? "Edit Plan" : "Create New Plan"}
        </h2>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#C9944A] mb-2">
              Tier Name (e.g. Signature)
            </label>
            <input
              type="text"
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
              Monthly Price ($)
              </label>
              <input
                type="number"
                min={0}
                value={formData.monthlyPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    monthlyPrice: e.target.value,
                  }))
                }
                required
                className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">
                Yearly Price ($)
              </label>
              <input
                type="number"
                min={0}
                value={formData.yearlyPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    yearlyPrice: e.target.value,
                  }))
                }
                required
                className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
              />
            </div>
          </div>

          {/* Perks Array */}
          <div className="pt-2">
            <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-4">
              Perks &amp; Benefits
            </label>
            <div className="space-y-3">
              {formData.perks.map((perk, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={perk}
                    onChange={(e) => handlePerkChange(index, e.target.value)}
                    placeholder="e.g. Unlimited Sauna Access"
                    className="flex-1 bg-[#080906] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9944A]"
                  />
                  <button
                    type="button"
                    onClick={() => removePerk(index)}
                    className="w-10 h-10 rounded-xl bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                    title="Remove perk"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPerk}
              className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#C9944A] hover:text-[#E3D9C9] transition-colors"
            >
              <Plus size={14} /> Add Perk
            </button>
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
              Active (visible and available for members)
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
            {saving ? "Saving..." : "Save Plan"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}