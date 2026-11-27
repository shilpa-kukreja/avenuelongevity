"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Loader2,
  Search,
  Download,
  CreditCard,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  Copy,
  Check,
  X,
  FileText,
  FileJson,
  RefreshCw,
  ArrowUpDown,
  Mail,
  User,
  Calendar,
  Layers,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const easeOut = [0.22, 1, 0.36, 1];

const PAYMENT_FILTERS = ["All", "Paid", "Pending", "Failed", "Refunded"];
const TYPE_FILTERS = ["All", "Package", "Membership"];

const STATUS_BADGE = {
  Paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/25",
  Failed: "bg-rose-500/10 text-rose-400 border border-rose-500/25",
  Refunded: "bg-purple-500/10 text-purple-400 border border-purple-500/25",
};

function safeText(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
  if (typeof val === "object") {
    return val.name || val.title || val.email || val._id || val.id || fallback;
  }
  return fallback;
}

function safeId(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val._id || val.id || "";
  return String(val);
}

function safeNum(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function formatUSD(amount) {
  const n = safeNum(amount, 0);
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: n % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeTransaction(raw) {
  const t = raw && typeof raw === "object" ? raw : {};
  const userObj = t.user && typeof t.user === "object" ? t.user : null;

  return {
    ...t,
    _id: safeId(t._id || t.id),
    userId: safeId(t.user),
    accountName: userObj ? safeText(userObj.name) : "",
    customerName: safeText(t.customerName || userObj?.name, "Guest"),
    customerEmail: safeText(t.customerEmail || userObj?.email, ""),
    itemType: safeText(t.itemType, "Package"),
    itemName: safeText(t.itemName, "Wellness Plan"),
    originalAmount: safeNum(t.originalAmount ?? t.amount, 0),
    discountAmount: safeNum(t.discountAmount, 0),
    couponCode: t.couponCode ? safeText(t.couponCode) : "",
    amount: safeNum(t.amount, 0),
    paymentStatus: safeText(t.paymentStatus, "Pending"),
    razorpayOrderId: safeText(t.razorpayOrderId, ""),
    razorpayPaymentId: safeText(t.razorpayPaymentId, ""),
    billingCycle: safeText(t.billingCycle, "None"),
    createdAt: safeText(t.createdAt, ""),
    updatedAt: safeText(t.updatedAt, ""),
  };
}

function escapeCsv(val) {
  if (val === null || val === undefined) return "";
  const str = typeof val === "object" ? safeText(val) : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function TransactionsAdmin() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [copiedKey, setCopiedKey] = useState("");
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? "" : prev));
    }, 2500);
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
      const { data } = await axios.get(`${API_URL}/transactions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const list = Array.isArray(data)
        ? data
        : data?.transactions || data?.data || [];
      const normalized = Array.isArray(list)
        ? list.map(normalizeTransaction)
        : [];
      setTransactions(normalized);

      setSelectedTxn((curr) => {
        if (!curr) return null;
        return normalized.find((item) => item._id === curr._id) || curr;
      });
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setError(
        safeText(
          err?.response?.data?.message || err?.message,
          "Failed to load transactions."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelectedTxn(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleCopy = async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedKey(key);
      showToast("Copied to clipboard");
      setTimeout(() => setCopiedKey(""), 1600);
    } catch {
      showToast("Copy failed");
    }
  };

  const filteredTransactions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const list = transactions.filter((t) => {
      const matchesStatus =
        statusFilter === "All" || t.paymentStatus === statusFilter;
      const matchesType = typeFilter === "All" || t.itemType === typeFilter;
      if (!matchesStatus || !matchesType) return false;
      if (!q) return true;

      return (
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        t.itemName.toLowerCase().includes(q) ||
        t.itemType.toLowerCase().includes(q) ||
        t._id.toLowerCase().includes(q) ||
        t.razorpayOrderId.toLowerCase().includes(q) ||
        t.razorpayPaymentId.toLowerCase().includes(q) ||
        t.couponCode.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === "amount_high") return b.amount - a.amount;
      if (sortBy === "amount_low") return a.amount - b.amount;
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "oldest" ? tA - tB : tB - tA;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter, sortBy]);

  const summary = useMemo(() => {
    const totalCount = transactions.length;
    const paidTxns = transactions.filter((t) => t.paymentStatus === "Paid");
    const paidRevenue = paidTxns.reduce(
      (sum, t) => sum + safeNum(t.amount, 0),
      0
    );
    const totalDiscounts = paidTxns.reduce(
      (sum, t) => sum + safeNum(t.discountAmount, 0),
      0
    );
    const failedCount = transactions.filter(
      (t) => t.paymentStatus === "Failed"
    ).length;

    return { totalCount, paidRevenue, totalDiscounts, failedCount };
  }, [transactions]);

  const exportCsv = () => {
    if (!filteredTransactions.length) {
      showToast("No transactions to export");
      return;
    }

    const headers = [
      "Transaction ID",
      "User ID",
      "Customer Name",
      "Customer Email",
      "Item Type",
      "Item Name",
      "Billing Cycle",
      "Original Amount",
      "Coupon Code",
      "Discount Amount",
      "Amount Paid",
      "Payment Status",
      "Razorpay Order ID",
      "Razorpay Payment ID",
      "Created At",
      "Updated At",
    ];

    const rows = filteredTransactions.map((t) => [
      t._id,
      t.userId,
      t.customerName,
      t.customerEmail,
      t.itemType,
      t.itemName,
      t.billingCycle,
      t.originalAmount,
      t.couponCode,
      t.discountAmount,
      t.amount,
      t.paymentStatus,
      t.razorpayOrderId,
      t.razorpayPaymentId,
      t.createdAt,
      t.updatedAt,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((r) => r.map(escapeCsv).join(",")),
    ].join("\n");

    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `transactions-${stamp}.csv`, "text/csv;charset=utf-8;");
    showToast(`Exported ${filteredTransactions.length} transactions`);
  };

  const downloadReceipt = (t) => {
    if (!t) return;
    const ref = t.razorpayPaymentId || t._id.slice(-6).toUpperCase();
    const text = [
      "==========================================",
      `PAYMENT RECEIPT — ${ref}`,
      "==========================================",
      `Transaction _id   : ${t._id || "—"}`,
      `Status            : ${t.paymentStatus}`,
      `Item              : ${t.itemName} (${t.itemType})`,
      `Billing Cycle     : ${t.billingCycle}`,
      "------------------------------------------",
      `Customer          : ${t.customerName}`,
      `Email             : ${t.customerEmail || "—"}`,
      "------------------------------------------",
      `Original Amount   : ${formatUSD(t.originalAmount)}`,
      `Coupon Code       : ${t.couponCode || "None"}`,
      `Discount          : -${formatUSD(t.discountAmount)}`,
      `Net Amount Paid   : ${formatUSD(t.amount)}`,
      "------------------------------------------",
      `Razorpay Order ID : ${t.razorpayOrderId || "—"}`,
      `Razorpay Pay ID   : ${t.razorpayPaymentId || "—"}`,
      `Timestamp         : ${t.createdAt || "—"}`,
      "==========================================",
    ].join("\n");

    downloadFile(text, `receipt-${ref}.txt`, "text/plain;charset=utf-8;");
    showToast("Downloaded receipt");
  };

  const downloadJson = (t) => {
    if (!t) return;
    const ref = t._id ? t._id.slice(-6).toUpperCase() : "TXN";
    downloadFile(
      JSON.stringify(t, null, 2),
      `transaction-${ref}.json`,
      "application/json"
    );
    showToast("Downloaded JSON");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="space-y-6 relative"
    >
      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 z-[90] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#161813] border border-[#C9944A]/40 text-white text-xs shadow-2xl"
          >
            <CheckCircle2 size={15} className="text-[#C9944A] shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#121310] border border-white/5 hover:border-[#C9944A]/30 transition-colors p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Total Transactions
            </span>
            <CreditCard size={16} className="text-[#C9944A]" />
          </div>
          <div className="font-serif text-3xl text-white">
            {summary.totalCount}
          </div>
          <p className="text-[10px] text-white/40 mt-2">
            {filteredTransactions.length} shown in view
          </p>
        </div>

        <div className="bg-[#121310] border border-white/5 hover:border-[#C9944A]/30 transition-colors p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Paid Revenue
            </span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="font-serif text-3xl text-white">
            {formatUSD(summary.paidRevenue)}
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-2">
            Packages &amp; Memberships
          </p>
        </div>

        <div className="bg-[#121310] border border-white/5 hover:border-[#C9944A]/30 transition-colors p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Discounts Given
            </span>
            <Sparkles size={16} className="text-[#C9944A]" />
          </div>
          <div className="font-serif text-3xl text-white">
            {formatUSD(summary.totalDiscounts)}
          </div>
          <p className="text-[10px] text-white/40 mt-2">
            Promo &amp; coupon savings
          </p>
        </div>

        <div className="bg-[#121310] border border-white/5 hover:border-[#C9944A]/30 transition-colors p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Failed Payments
            </span>
            <XCircle size={16} className="text-rose-400" />
          </div>
          <div className="font-serif text-3xl text-white">
            {summary.failedCount}
          </div>
          <p className="text-[10px] text-white/40 mt-2">
            Requires attention if &gt; 0
          </p>
        </div>
      </div>

      {/* MAIN TRANSACTIONS LEDGER */}
      <div className="bg-[#121310] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-serif text-xl text-white">
                  Transactions Ledger
                </h2>
                <p className="text-[11px] text-white/40">
                  Click any row to inspect payment IDs, pricing &amp; receipt
                </p>
              </div>
              <button
                type="button"
                onClick={fetchTransactions}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/50 hover:text-[#C9944A] hover:border-[#C9944A]/30 transition-colors"
                title="Refresh transactions"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  placeholder="Search guest, item, order/pay ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#080906] border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#080906] border border-white/10 rounded-full px-4 py-2 text-[10px] uppercase tracking-widest text-white/80 outline-none focus:border-[#C9944A] cursor-pointer"
              >
                {TYPE_FILTERS.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp === "All" ? "All Types" : `${tp}s`}
                  </option>
                ))}
              </select>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#080906] border border-white/10 rounded-full pl-4 pr-8 py-2 text-[10px] uppercase tracking-widest text-white/80 outline-none focus:border-[#C9944A] cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount_high">Amount: High → Low</option>
                  <option value="amount_low">Amount: Low → High</option>
                </select>
                <ArrowUpDown
                  size={11}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
                />
              </div>

              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 bg-[#C9944A] hover:bg-[#E3D9C9] text-[#080906] px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors shrink-0"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* STATUS FILTER PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {PAYMENT_FILTERS.map((st) => {
              const active = statusFilter === st;
              const count =
                st === "All"
                  ? transactions.length
                  : transactions.filter((t) => t.paymentStatus === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold transition-all shrink-0 flex items-center gap-2 ${
                    active
                      ? "bg-[#C9944A]/15 text-[#C9944A] border border-[#C9944A]/40"
                      : "bg-white/[0.02] text-white/45 border border-white/5 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <span>{st}</span>
                  <span className="text-[9px] font-mono opacity-75">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-14 flex flex-col items-center justify-center text-white/50">
              <Loader2 className="animate-spin mb-4 text-[#C9944A]" size={24} />
              Fetching transactions...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-400 text-sm">
              {error}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-14 text-center text-white/50 text-sm">
              No transactions found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/40 bg-white/[0.02]">
                  <th className="p-4 font-medium">Payment / Ref ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Item Purchased</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => {
                  const isSelected = selectedTxn?._id === t._id;
                  const displayId = t.razorpayPaymentId
                    ? t.razorpayPaymentId.length > 16
                      ? `${t.razorpayPaymentId.slice(0, 16)}…`
                      : t.razorpayPaymentId
                    : t._id
                    ? `#${t._id.slice(-6).toUpperCase()}`
                    : "—";

                  return (
                    <tr
                      key={t._id}
                      onClick={() => setSelectedTxn(t)}
                      className={`border-b border-white/5 cursor-pointer transition-colors group ${
                        isSelected
                          ? "bg-[#C9944A]/[0.08]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <td className="p-4 text-xs font-mono text-[#C9944A]">
                        <span>{displayId}</span>
                        <p className="text-[9px] text-white/35 font-sans mt-1">
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-white font-medium group-hover:text-[#E3D9C9] transition-colors">
                          {t.customerName}
                        </p>
                        {t.customerEmail && (
                          <p className="text-[10px] text-white/40">
                            {t.customerEmail}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-white">{t.itemName}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] uppercase tracking-widest text-white/60">
                          {t.itemType}
                          {t.billingCycle && t.billingCycle !== "None"
                            ? ` (${t.billingCycle})`
                            : ""}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-white/60">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-white">
                          {formatUSD(t.amount)}
                        </p>
                        {t.discountAmount > 0 && (
                          <p className="text-[9px] text-emerald-400 mt-1">
                            Disc: -{formatUSD(t.discountAmount)}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                            STATUS_BADGE[t.paymentStatus] ||
                            "bg-white/10 text-white/60"
                          }`}
                        >
                          {t.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* TRANSACTION INSPECTOR DRAWER */}
      <AnimatePresence>
        {selectedTxn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTxn(null)}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex justify-end"
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: easeOut }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[#0D0E0B] border-l border-white/10 h-full overflow-y-auto p-6 md:p-8 space-y-6"
            >
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-[#C9944A] font-semibold">
                      Transaction Details
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                        STATUS_BADGE[selectedTxn.paymentStatus] ||
                        "bg-white/10 text-white/60"
                      }`}
                    >
                      {selectedTxn.paymentStatus}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl text-white font-light">
                    {selectedTxn.itemName}
                  </h3>
                  <p className="text-xs text-white/45 mt-1">
                    {selectedTxn.itemType}
                    {selectedTxn.billingCycle &&
                    selectedTxn.billingCycle !== "None"
                      ? ` · ${selectedTxn.billingCycle} billing`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close transaction details"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Download Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#121310] border border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Layers size={14} className="text-[#C9944A]" />
                  <span>Export record:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadReceipt(selectedTxn)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors"
                  >
                    <FileText size={13} />
                    Receipt (.txt)
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadJson(selectedTxn)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors"
                  >
                    <FileJson size={13} />
                    JSON
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-5 rounded-2xl bg-[#121310] border border-white/5 space-y-2.5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-semibold">
                  Customer
                </p>
                <div className="flex items-center gap-2 text-sm text-white font-medium">
                  <User size={14} className="text-[#C9944A]" />
                  <span>{selectedTxn.customerName}</span>
                </div>
                {selectedTxn.customerEmail && (
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Mail size={14} className="text-[#C9944A]" />
                    <a
                      href={`mailto:${selectedTxn.customerEmail}`}
                      className="hover:text-[#C9944A] transition-colors"
                    >
                      {selectedTxn.customerEmail}
                    </a>
                  </div>
                )}
              </div>

              {/* Amount Breakdown */}
              <div className="p-5 rounded-2xl bg-[#121310] border border-white/5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-semibold">
                  Payment Breakdown
                </p>
                <div className="flex justify-between text-xs text-white/65">
                  <span>Original Amount</span>
                  <span className="font-mono text-white">
                    {formatUSD(selectedTxn.originalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-white/65">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag size={12} className="text-[#C9944A]" />
                    Coupon Code
                  </span>
                  <span className="font-mono text-white">
                    {selectedTxn.couponCode || "None"}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-white/65">
                  <span>Discount Amount</span>
                  <span className="font-mono text-emerald-400">
                    -{formatUSD(selectedTxn.discountAmount)}
                  </span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-widest text-white/50">
                    Amount Paid
                  </span>
                  <span className="font-serif text-2xl text-[#E3D9C9]">
                    {formatUSD(selectedTxn.amount)}
                  </span>
                </div>
              </div>

              {/* Gateway & Database IDs */}
              <div className="p-5 rounded-2xl bg-[#121310] border border-white/5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-semibold">
                  Gateway &amp; Record IDs
                </p>

                {[
                  {
                    label: "Razorpay Payment ID",
                    value: selectedTxn.razorpayPaymentId,
                    key: "pay",
                  },
                  {
                    label: "Razorpay Order ID",
                    value: selectedTxn.razorpayOrderId,
                    key: "order",
                  },
                  {
                    label: "Transaction _id",
                    value: selectedTxn._id,
                    key: "id",
                  },
                  {
                    label: "User ID",
                    value: selectedTxn.userId,
                    key: "user",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-b-0 text-xs"
                  >
                    <span className="text-white/45 shrink-0">{item.label}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] text-white/80 truncate">
                        {item.value || "—"}
                      </span>
                      {item.value && (
                        <button
                          type="button"
                          onClick={() => handleCopy(item.value, item.key)}
                          className="p-1 rounded hover:bg-white/10 text-white/45 hover:text-[#C9944A] transition-colors shrink-0"
                          title={`Copy ${item.label}`}
                        >
                          {copiedKey === item.key ? (
                            <Check size={12} className="text-emerald-400" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex flex-wrap justify-between gap-2 text-[10px] text-white/40">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={11} />
                    Created:{" "}
                    {selectedTxn.createdAt
                      ? new Date(selectedTxn.createdAt).toLocaleString("en-US")
                      : "—"}
                  </span>
                  <span>
                    Updated:{" "}
                    {selectedTxn.updatedAt
                      ? new Date(selectedTxn.updatedAt).toLocaleString("en-US")
                      : "—"}
                  </span>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}