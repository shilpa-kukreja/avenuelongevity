
"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Wand2,
  Ticket,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Generate a date in YYYY-MM-DD format.
// This function is called only after the component mounts or on user interaction.
const getFutureDateInput = (days = 30) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + days);

  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const generateRandomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";

  for (let i = 0; i < 6; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `AVENUE${suffix}`;
};

const formatExpiryDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState(null);

  // Date values are initialized after mounting to avoid
  // server/client rendering differences.
  const [todayMinDate, setTodayMinDate] = useState("");

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchaseAmount: "0",
    expiryDate: "",
    usageLimit: "",
    isActive: true,
  });

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("avenue_token")
          : null;

      const { data } = await axios.get(`${API_URL}/coupons`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      if (data?.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Fetch coupons error:", err);

      setFeedback({
        type: "error",
        text: "Could not load coupons from server.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize dates and fetch coupons after component mounts.
  useEffect(() => {
    const today = getFutureDateInput(0);

    setTodayMinDate(today);

    setForm((prev) => ({
      ...prev,
      expiryDate: getFutureDateInput(30),
    }));

    fetchCoupons();
  }, []);

  // Create coupon
  const handleCreate = async (e) => {
    e.preventDefault();

    setFeedback(null);

    if (!form.expiryDate) {
      setFeedback({
        type: "error",
        text: "Please select an expiry date.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("avenue_token")
          : null;

      const { data } = await axios.post(
        `${API_URL}/coupons`,
        {
          code: form.code.trim().toUpperCase(),
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minPurchaseAmount: Number(form.minPurchaseAmount) || 0,
          expiryDate: form.expiryDate,
          usageLimit:
            form.usageLimit === ""
              ? null
              : Number(form.usageLimit),
          isActive: form.isActive,
        },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (data?.success) {
        setFeedback({
          type: "success",
          text: `Coupon ${data.coupon.code} created.`,
        });

        setForm({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minPurchaseAmount: "0",
          expiryDate: getFutureDateInput(30),
          usageLimit: "",
          isActive: true,
        });

        await fetchCoupons();
      }
    } catch (err) {
      console.error("Create coupon error:", err);

      setFeedback({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to create coupon.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle coupon status
  const handleToggleActive = async (coupon) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("avenue_token")
          : null;

      await axios.put(
        `${API_URL}/coupons/${coupon._id}`,
        {
          isActive: !coupon.isActive,
        },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      setFeedback({
        type: "success",
        text: `Coupon ${coupon.code} updated successfully.`,
      });

      await fetchCoupons();
    } catch (err) {
      console.error("Toggle coupon error:", err);

      setFeedback({
        type: "error",
        text: "Failed to update status.",
      });
    }
  };

  // Delete coupon
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("avenue_token")
          : null;

      await axios.delete(`${API_URL}/coupons/${id}`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      setFeedback({
        type: "success",
        text: "Coupon removed.",
      });

      await fetchCoupons();
    } catch (err) {
      console.error("Delete coupon error:", err);

      setFeedback({
        type: "error",
        text: "Failed to delete coupon.",
      });
    }
  };

  // Copy coupon code
  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 1800);
    } catch (err) {
      console.error("Copy error:", err);

      setFeedback({
        type: "error",
        text: "Could not copy coupon code.",
      });
    }
  };

  // Search coupons
  const filteredCoupons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return coupons;

    return coupons.filter((c) =>
      c.code?.toLowerCase().includes(q)
    );
  }, [coupons, searchQuery]);

  // Calculate active coupons after client-side initialization.
  const activeCount = useMemo(() => {
    if (!todayMinDate) return 0;

    return coupons.filter((c) => {
      if (!c.isActive || !c.expiryDate) return false;

      const expiry = new Date(c.expiryDate);

      if (Number.isNaN(expiry.getTime())) return false;

      return expiry.getTime() >= new Date(
        `${todayMinDate}T00:00:00`
      ).getTime();
    }).length;
  }, [coupons, todayMinDate]);

  // Calculate total redemptions
  const totalRedemptions = useMemo(
    () =>
      coupons.reduce(
        (sum, c) => sum + Number(c.usedCount || 0),
        0
      ),
    [coupons]
  );

  return (
    <AdminShell
      activeTab="coupons"
      title="Coupons"
      subtitle="Create and manage promotional codes across Avenue bookings & concierge."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search coupon codes..."
    >
      <div className="space-y-8">

        {/* TOP STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-[#121310] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/45">
                Total Coupons
              </p>
              <p className="font-serif text-3xl text-white mt-1">
                {coupons.length}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#C9944A]">
              <Ticket size={18} />
            </div>
          </div>

          <div className="bg-[#121310] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/45">
                Active Offers
              </p>
              <p className="font-serif text-3xl text-emerald-400 mt-1">
                {activeCount}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="bg-[#121310] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/45">
                Total Uses
              </p>
              <p className="font-serif text-3xl text-[#C9944A] mt-1">
                {totalRedemptions}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#C9944A]/10 flex items-center justify-center text-[#C9944A]">
              <TrendingUp size={18} />
            </div>
          </div>

        </div>

        {/* FEEDBACK */}
        {feedback && (
          <div
            className={`px-4 py-3 rounded-xl text-sm border ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* CREATE COUPON FORM */}
        <form
          onSubmit={handleCreate}
          className="bg-[#121310] border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >

          {/* COUPON CODE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/50">
                Coupon Code *
              </label>

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    code: generateRandomCode(),
                  }))
                }
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#C9944A] hover:text-[#E3D9C9]"
              >
                <Wand2 size={11} />
                Auto Generate
              </button>
            </div>

            <input
              type="text"
              required
              placeholder="e.g. LONGEVITY25"
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-[#C9944A]"
            />
          </div>

          {/* DISCOUNT TYPE */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1.5">
              Discount Type *
            </label>

            <select
              value={form.discountType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  discountType: e.target.value,
                }))
              }
              className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9944A]"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          {/* DISCOUNT VALUE */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1.5">
              Discount Value *
            </label>

            <input
              type="number"
              required
              min="1"
              step="any"
              placeholder={
                form.discountType === "percentage" ? "20" : "25"
              }
              value={form.discountValue}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  discountValue: e.target.value,
                }))
              }
              className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9944A]"
            />
          </div>

          {/* MIN PURCHASE */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1.5">
              Min Purchase ($)
            </label>

            <input
              type="number"
              min="0"
              step="any"
              value={form.minPurchaseAmount}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  minPurchaseAmount: e.target.value,
                }))
              }
              className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9944A]"
            />
          </div>

          {/* EXPIRY DATE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/50">
                Expiry Date *
              </label>

              <div className="flex items-center gap-1.5">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        expiryDate: getFutureDateInput(d),
                      }))
                    }
                    className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/60 hover:text-[#C9944A] hover:bg-white/10 transition-colors"
                  >
                    +{d}d
                  </button>
                ))}
              </div>
            </div>

            <input
              type="date"
              required
              min={todayMinDate}
              value={form.expiryDate}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  expiryDate: e.target.value,
                }))
              }
              className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] [color-scheme:dark]"
            />
          </div>

          {/* USAGE LIMIT */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1.5">
              Usage Limit (Optional)
            </label>

            <input
              type="number"
              min="1"
              placeholder="Unlimited"
              value={form.usageLimit}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  usageLimit: e.target.value,
                }))
              }
              className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#C9944A]"
            />
          </div>

          {/* FORM ACTIONS */}
          <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-4 pt-2">

            <label className="inline-flex items-center gap-2 text-xs text-white/75 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="accent-[#C9944A]"
              />
              Active immediately
            </label>

            <button
              type="submit"
              disabled={submitting || !form.expiryDate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors disabled:opacity-50"
            >
              <Plus size={14} />
              {submitting ? "Creating..." : "Create Coupon"}
            </button>

          </div>
        </form>

        {/* COUPONS LIST */}
        <div className="bg-[#121310] border border-white/10 rounded-2xl overflow-hidden">

          {loading ? (
            <div className="p-8 text-sm text-white/50">
              Loading coupons...
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="p-8 text-sm text-white/50">
              No coupons found.
            </div>
          ) : (
            <div className="divide-y divide-white/10">

              {filteredCoupons.map((c) => {
                const expiry = c.expiryDate
                  ? new Date(c.expiryDate)
                  : null;

                const expired =
                  !expiry ||
                  Number.isNaN(expiry.getTime()) ||
                  (todayMinDate &&
                    expiry.getTime() <
                      new Date(`${todayMinDate}T00:00:00`).getTime());

                return (
                  <div
                    key={c._id}
                    className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >

                    <div className="space-y-1">

                      <div className="flex items-center gap-2.5 flex-wrap">

                        <span className="font-mono text-base font-bold text-[#C9944A]">
                          {c.code}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopy(c.code)}
                          className="text-white/50 hover:text-white"
                          title="Copy code"
                        >
                          {copiedCode === c.code ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>

                        <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white/80">
                          {c.discountType === "percentage"
                            ? `${c.discountValue}% OFF`
                            : `$${c.discountValue} OFF`}
                        </span>

                        {expired && (
                          <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300">
                            Expired
                          </span>
                        )}

                      </div>

                      <p className="text-xs text-white/50">
                        Min purchase: ${c.minPurchaseAmount || 0}
                        {" · "}
                        Expires: {formatExpiryDate(c.expiryDate)}
                        {" · "}
                        Used: {c.usedCount || 0}
                        {c.usageLimit
                          ? ` / ${c.usageLimit}`
                          : " (Unlimited)"}
                      </p>

                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-3">

                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold border ${
                          c.isActive
                            ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                            : "border-white/15 text-white/50"
                        }`}
                      >
                        {c.isActive ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <XCircle size={13} />
                        )}

                        {c.isActive ? "Active" : "Paused"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(c._id)}
                        className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/30 transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </AdminShell>
  );
}
