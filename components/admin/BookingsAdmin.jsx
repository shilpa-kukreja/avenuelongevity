"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Loader2,
  Search,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Download,
  X,
  Copy,
  Check,
  Mail,
  Phone,
  Users,
  Clock,
  CreditCard,
  Tag,
  Sparkles,
  CheckCircle2,
  Eye,
  FileJson,
  FileSpreadsheet,
  FileText,
  ArrowUpDown,
  UserCheck,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const easeOut = [0.22, 1, 0.36, 1];

const STATUS_OPTIONS = ["Pending", "Confirmed", "Completed", "Cancelled"];

const STATUS_STYLES = {
  Confirmed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  Pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  Completed: "bg-sky-500/10 border-sky-500/30 text-sky-400",
  Cancelled: "bg-rose-500/10 border-rose-500/30 text-rose-400",
};

const PAYMENT_STYLES = {
  Paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Failed: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  Refunded: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
};

function safeText(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
  if (typeof val === "object") {
    return (
      val.name ||
      val.title ||
      val.email ||
      val._id ||
      val.id ||
      fallback
    );
  }
  return fallback;
}

function safeId(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val._id || val.id || "";
  return String(val);
}

function safeNumber(val, fallback = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
}

function formatINR(amount) {
  return `₹${safeNumber(amount, 0).toLocaleString("en-IN")}`;
}

function normalizeBooking(raw) {
  const b = raw && typeof raw === "object" ? raw : {};
  const userObj = b.user && typeof b.user === "object" ? b.user : null;
  const serviceObj = b.service && typeof b.service === "object" ? b.service : null;

  return {
    ...b,
    _id: safeId(b._id || b.id),
    userId: safeId(b.user),
    userName: userObj ? safeText(userObj.name) : "",
    userEmail: userObj ? safeText(userObj.email) : "",
    customerName: safeText(b.customerName || userObj?.name, "Guest"),
    customerEmail: safeText(b.customerEmail || userObj?.email, ""),
    customerPhone: safeText(b.customerPhone, ""),
    serviceId: safeId(b.service),
    serviceName: safeText(b.serviceName || serviceObj?.title, "Wellness Ritual"),
    date: safeText(b.date, "—"),
    time: safeText(b.time, "—"),
    guests: Math.max(1, safeNumber(b.guests, 1)),
    originalAmount: safeNumber(b.originalAmount ?? b.totalAmount, 0),
    discountAmount: safeNumber(b.discountAmount, 0),
    couponCode: b.couponCode ? safeText(b.couponCode) : "",
    totalAmount: safeNumber(b.totalAmount, 0),
    paymentStatus: safeText(b.paymentStatus, "Pending"),
    razorpayOrderId: safeText(b.razorpayOrderId, ""),
    razorpayPaymentId: safeText(b.razorpayPaymentId, ""),
    status: safeText(b.status, "Pending"),
    createdAt: safeText(b.createdAt, ""),
    updatedAt: safeText(b.updatedAt, ""),
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

function triggerFileDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [copiedKey, setCopiedKey] = useState("");
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? "" : prev));
    }, 2600);
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
      const { data } = await axios.get(`${API_URL}/bookings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const bookingData = Array.isArray(data)
        ? data
        : data?.bookings || data?.data || [];

      const normalized = Array.isArray(bookingData)
        ? bookingData.map(normalizeBooking)
        : [];

      setBookings(normalized);

      setSelectedBooking((current) => {
        if (!current) return null;
        return normalized.find((item) => item._id === current._id) || current;
      });
    } catch (err) {
      console.error("Failed to fetch bookings", err);
      setError(
        safeText(
          err?.response?.data?.message || err?.message,
          "Could not load bookings from server."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelectedBooking(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (!id) return;
    setUpdatingId(id);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
      const { data } = await axios.put(
        `${API_URL}/bookings/${id}/status`,
        { status: newStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (data?.success !== false) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
        setSelectedBooking((prev) =>
          prev && prev._id === id ? { ...prev, status: newStatus } : prev
        );
        showToast(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Failed to update status", err);
      showToast(
        safeText(err?.response?.data?.message, "Failed to update status")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopy = async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedKey(key);
      showToast("Copied to clipboard");
      setTimeout(() => setCopiedKey(""), 1600);
    } catch {
      showToast("Unable to copy");
    }
  };

  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const list = bookings.filter((b) => {
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      const matchesPayment =
        paymentFilter === "All" || b.paymentStatus === paymentFilter;

      if (!matchesStatus || !matchesPayment) return false;
      if (!q) return true;

      return (
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.customerPhone.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b._id.toLowerCase().includes(q) ||
        b.razorpayOrderId.toLowerCase().includes(q) ||
        b.razorpayPaymentId.toLowerCase().includes(q) ||
        b.couponCode.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === "amount_high") return b.totalAmount - a.totalAmount;
      if (sortBy === "amount_low") return a.totalAmount - b.totalAmount;
      if (sortBy === "guests_high") return b.guests - a.guests;
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "oldest" ? tA - tB : tB - tA;
    });
  }, [bookings, searchTerm, statusFilter, paymentFilter, sortBy]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const paidBookings = bookings.filter((b) => b.paymentStatus === "Paid");
    const paidRevenue = paidBookings.reduce(
      (sum, b) => sum + safeNumber(b.totalAmount, 0),
      0
    );
    const avgTicket = paidBookings.length
      ? Math.round(paidRevenue / paidBookings.length)
      : 0;
    const pendingCount = bookings.filter((b) => b.status === "Pending").length;
    const totalGuests = bookings.reduce(
      (sum, b) => sum + safeNumber(b.guests, 1),
      0
    );

    return { total, paidRevenue, avgTicket, pendingCount, totalGuests };
  }, [bookings]);

  const exportCsv = () => {
    if (!filteredBookings.length) {
      showToast("No bookings to export");
      return;
    }

    const headers = [
      "Booking ID",
      "User ID",
      "Account Name",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Service ID",
      "Service Name",
      "Date",
      "Time",
      "Guests",
      "Original Amount",
      "Discount Amount",
      "Coupon Code",
      "Total Amount",
      "Payment Status",
      "Razorpay Order ID",
      "Razorpay Payment ID",
      "Booking Status",
      "Created At",
      "Updated At",
    ];

    const rows = filteredBookings.map((b) => [
      b._id,
      b.userId,
      b.userName,
      b.customerName,
      b.customerEmail,
      b.customerPhone,
      b.serviceId,
      b.serviceName,
      b.date,
      b.time,
      b.guests,
      b.originalAmount,
      b.discountAmount,
      b.couponCode,
      b.totalAmount,
      b.paymentStatus,
      b.razorpayOrderId,
      b.razorpayPaymentId,
      b.status,
      b.createdAt,
      b.updatedAt,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((r) => r.map(escapeCsv).join(",")),
    ].join("\n");

    const stamp = new Date().toISOString().slice(0, 10);
    triggerFileDownload(csv, `bookings-${stamp}.csv`, "text/csv;charset=utf-8;");
    showToast(`Exported ${filteredBookings.length} bookings to CSV`);
  };

  const downloadSingleJson = (booking) => {
    if (!booking) return;
    const shortId = booking._id ? booking._id.slice(-6).toUpperCase() : "BOOKING";
    triggerFileDownload(
      JSON.stringify(booking, null, 2),
      `booking-${shortId}.json`,
      "application/json"
    );
    showToast(`Downloaded booking #${shortId} JSON`);
  };

  const downloadSingleReceipt = (booking) => {
    if (!booking) return;
    const shortId = booking._id ? booking._id.slice(-6).toUpperCase() : "BOOKING";
    const lines = [
      "==========================================",
      `BOOKING RECEIPT — #${shortId}`,
      "==========================================",
      `Booking ID       : ${booking._id || "—"}`,
      `Status           : ${booking.status}`,
      `Payment Status   : ${booking.paymentStatus}`,
      `Service          : ${booking.serviceName}`,
      `Session Date     : ${booking.date}`,
      `Session Time     : ${booking.time}`,
      `Guests           : ${booking.guests}`,
      "------------------------------------------",
      `Customer Name    : ${booking.customerName}`,
      `Customer Email   : ${booking.customerEmail || "—"}`,
      `Customer Phone   : ${booking.customerPhone || "—"}`,
      "------------------------------------------",
      `Original Amount  : ${formatINR(booking.originalAmount)}`,
      `Coupon Code      : ${booking.couponCode || "None"}`,
      `Discount         : -${formatINR(booking.discountAmount)}`,
      `Total Paid       : ${formatINR(booking.totalAmount)}`,
      "------------------------------------------",
      `Razorpay Order   : ${booking.razorpayOrderId || "—"}`,
      `Razorpay Payment : ${booking.razorpayPaymentId || "—"}`,
      `Created At       : ${booking.createdAt || "—"}`,
      "==========================================",
    ].join("\n");

    triggerFileDownload(
      lines,
      `booking-receipt-${shortId}.txt`,
      "text/plain;charset=utf-8"
    );
    showToast(`Downloaded receipt #${shortId}`);
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

      {/* EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#121310] border border-white/5 hover:border-[#C9944A]/30 transition-colors p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Total Bookings
            </span>
            <CalendarDays size={16} className="text-[#C9944A]" />
          </div>
          <div className="font-serif text-3xl text-white">{stats.total}</div>
          <p className="text-[10px] text-white/40 mt-2">
            {filteredBookings.length} visible · {stats.totalGuests} total guests
          </p>
        </div>

        <div className="bg-[#121310] border border-white/5 hover:border-[#C9944A]/30 transition-colors p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Paid Revenue
            </span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="font-serif text-3xl text-white">
            {formatINR(stats.paidRevenue)}
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-2">
            Avg ticket: {formatINR(stats.avgTicket)}
          </p>
        </div>

        <div className="bg-[#121310] border border-white/5 hover:border-[#C9944A]/30 transition-colors p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Action Required
            </span>
            <AlertCircle size={16} className="text-amber-400" />
          </div>
          <div className="font-serif text-3xl text-white">
            {stats.pendingCount}{" "}
            <span className="text-lg font-sans text-amber-400 font-normal">
              Pending
            </span>
          </div>
          <p className="text-[10px] text-white/40 mt-2">
            Waiting for confirmation
          </p>
        </div>

        <div className="bg-[#121310] border border-white/5 hover:border-[#C9944A]/30 transition-colors p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase tracking-widest text-white/40">
              Confirmed Rate
            </span>
            <Sparkles size={16} className="text-[#C9944A]" />
          </div>
          <div className="font-serif text-3xl text-white">
            {stats.total
              ? Math.round(
                  (bookings.filter(
                    (b) => b.status === "Confirmed" || b.status === "Completed"
                  ).length /
                    stats.total) *
                    100
                )
              : 0}
            %
          </div>
          <p className="text-[10px] text-white/40 mt-2">
            Confirmed &amp; completed sessions
          </p>
        </div>
      </div>

      {/* BOOKINGS TABLE CARD */}
      <div className="bg-[#121310] border border-white/5 rounded-2xl overflow-hidden">
        {/* TOP CONTROLS */}
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-serif text-xl text-white">
                  Bookings Command
                </h2>
                <p className="text-[11px] text-white/40">
                  Click any booking row to inspect full details &amp; download
                </p>
              </div>
              <button
                type="button"
                onClick={fetchBookings}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/50 hover:text-[#C9944A] hover:border-[#C9944A]/30 transition-colors"
                title="Refresh bookings"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  placeholder="Search guest, email, phone, service, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#080906] border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </div>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-[#080906] border border-white/10 rounded-full px-4 py-2 text-[10px] uppercase tracking-widest text-white/80 outline-none focus:border-[#C9944A] cursor-pointer"
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
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
                  <option value="guests_high">Most Guests</option>
                </select>
                <ArrowUpDown
                  size={11}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
                />
              </div>

              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors shrink-0"
              >
                <FileSpreadsheet size={13} />
                Export CSV
              </button>
            </div>
          </div>

          {/* STATUS FILTER PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["All", ...STATUS_OPTIONS].map((st) => {
              const active = statusFilter === st;
              const count =
                st === "All"
                  ? bookings.length
                  : bookings.filter((b) => b.status === st).length;
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

        {/* TABLE */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-14 flex flex-col items-center justify-center text-white/50">
              <Loader2 className="animate-spin mb-3 text-[#C9944A]" size={26} />
              <p className="text-xs tracking-wider uppercase">
                Fetching bookings…
              </p>
            </div>
          ) : error ? (
            <div className="p-12 text-center space-y-4">
              <p className="text-rose-400 text-sm">{error}</p>
              <button
                type="button"
                onClick={fetchBookings}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-14 text-center text-white/45 text-sm">
              No bookings found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1060px]">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/40 bg-white/[0.02]">
                  <th className="p-4 font-medium">Ref ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Service &amp; Guests</th>
                  <th className="p-4 font-medium">Date / Time</th>
                  <th className="p-4 font-medium">Pricing</th>
                  <th className="p-4 font-medium">Payment</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const isSelected = selectedBooking?._id === b._id;
                  return (
                    <tr
                      key={b._id}
                      onClick={() => setSelectedBooking(b)}
                      className={`border-b border-white/5 cursor-pointer transition-colors group ${
                        isSelected ? "bg-[#C9944A]/[0.07]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* Ref ID */}
                      <td className="p-4 text-xs font-mono text-[#C9944A]">
                        <span>
                          {b._id ? `#${b._id.slice(-6).toUpperCase()}` : "—"}
                        </span>
                        <p className="text-[9px] text-white/35 font-sans mt-1">
                          {b.createdAt
                            ? new Date(b.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <p className="text-sm text-white font-medium group-hover:text-[#E3D9C9] transition-colors">
                          {b.customerName}
                        </p>
                        {b.customerPhone && (
                          <p className="text-[11px] text-white/50">
                            {b.customerPhone}
                          </p>
                        )}
                        {b.customerEmail && (
                          <p className="text-[10px] text-white/40">
                            {b.customerEmail}
                          </p>
                        )}
                      </td>

                      {/* Service */}
                      <td className="p-4">
                        <p className="text-sm text-white">{b.serviceName}</p>
                        <p className="text-[10px] text-[#C9944A] uppercase tracking-widest mt-0.5">
                          {b.guests} {b.guests > 1 ? "Guests" : "Guest"}
                        </p>
                      </td>

                      {/* Date / Time */}
                      <td className="p-4">
                        <p className="text-sm text-white">{b.date}</p>
                        <p className="text-[11px] text-white/50">{b.time}</p>
                      </td>

                      {/* Pricing */}
                      <td className="p-4 text-xs">
                        <p className="text-white font-semibold">
                          {formatINR(b.totalAmount)}
                        </p>
                        {b.discountAmount > 0 && (
                          <p className="text-emerald-400 text-[10px] mt-0.5">
                            {b.couponCode ? `${b.couponCode}: ` : ""}-
                            {formatINR(b.discountAmount)}
                          </p>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-[9px] uppercase tracking-widest font-bold ${
                            PAYMENT_STYLES[b.paymentStatus] ||
                            "bg-white/10 text-white/60"
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                        {b.razorpayPaymentId && (
                          <p className="text-[9px] font-mono text-white/35 mt-1 truncate max-w-[125px]">
                            {b.razorpayPaymentId}
                          </p>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block w-36">
                          <select
                            value={b.status}
                            onChange={(e) =>
                              handleStatusChange(b._id, e.target.value)
                            }
                            disabled={updatingId === b._id}
                            className={`appearance-none w-full border rounded-xl px-3 py-2 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer transition-colors ${
                              STATUS_STYLES[b.status] ||
                              "bg-white/5 border-white/15 text-white"
                            }`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-[#121310] text-white"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                          {updatingId === b._id ? (
                            <Loader2
                              size={12}
                              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#C9944A]"
                            />
                          ) : (
                            <ChevronDown
                              size={12}
                              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                            />
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="p-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/60 hover:text-[#C9944A] hover:border-[#C9944A]/40 transition-colors"
                            title="Inspect booking"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadSingleReceipt(b)}
                            className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/60 hover:text-[#C9944A] hover:border-[#C9944A]/40 transition-colors"
                            title="Download receipt (.txt)"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CLICK-TO-INSPECT BOOKING DRAWER */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBooking(null)}
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
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-[#C9944A] font-semibold">
                      Booking Inspector
                    </span>
                    <span className="text-xs font-mono text-white/50">
                      {selectedBooking._id
                        ? `#${selectedBooking._id.slice(-6).toUpperCase()}`
                        : ""}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl text-white font-light">
                    {selectedBooking.serviceName}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close booking inspector"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status & Download Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#121310] border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    Status:
                  </span>
                  <div className="relative w-36">
                    <select
                      value={selectedBooking.status}
                      onChange={(e) =>
                        handleStatusChange(selectedBooking._id, e.target.value)
                      }
                      disabled={updatingId === selectedBooking._id}
                      className={`appearance-none w-full border rounded-xl px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer ${
                        STATUS_STYLES[selectedBooking.status] ||
                        "bg-white/5 border-white/15 text-white"
                      }`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                          className="bg-[#121310] text-white"
                        >
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadSingleReceipt(selectedBooking)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors"
                  >
                    <FileText size={13} />
                    Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSingleJson(selectedBooking)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors"
                  >
                    <FileJson size={13} />
                    JSON
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-5 rounded-2xl bg-[#121310] border border-white/5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-semibold">
                  Customer Details
                </p>
                <p className="text-base text-white font-medium">
                  {selectedBooking.customerName}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-white/65">
                  {selectedBooking.customerEmail && (
                    <a
                      href={`mailto:${selectedBooking.customerEmail}`}
                      className="inline-flex items-center gap-1.5 hover:text-[#C9944A] transition-colors"
                    >
                      <Mail size={13} className="text-[#C9944A]" />
                      {selectedBooking.customerEmail}
                    </a>
                  )}
                  {selectedBooking.customerPhone && (
                    <a
                      href={`tel:${selectedBooking.customerPhone}`}
                      className="inline-flex items-center gap-1.5 hover:text-[#C9944A] transition-colors"
                    >
                      <Phone size={13} className="text-[#C9944A]" />
                      {selectedBooking.customerPhone}
                    </a>
                  )}
                </div>
                {(selectedBooking.userName || selectedBooking.userEmail) && (
                  <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] text-white/45">
                    <UserCheck size={13} className="text-[#C9944A]" />
                    <span>
                      Linked Account:{" "}
                      <strong className="text-white/75 font-medium">
                        {selectedBooking.userName || selectedBooking.userEmail}
                      </strong>
                      {selectedBooking.userEmail && selectedBooking.userName
                        ? ` (${selectedBooking.userEmail})`
                        : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Session Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#121310] border border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    <CalendarDays size={12} className="text-[#C9944A]" />
                    Date
                  </div>
                  <p className="text-sm text-white font-medium">
                    {selectedBooking.date}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121310] border border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    <Clock size={12} className="text-[#C9944A]" />
                    Time Slot
                  </div>
                  <p className="text-sm text-white font-medium">
                    {selectedBooking.time}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121310] border border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40 mb-1">
                    <Users size={12} className="text-[#C9944A]" />
                    Guests
                  </div>
                  <p className="text-sm text-white font-medium">
                    {selectedBooking.guests}{" "}
                    {selectedBooking.guests > 1 ? "Guests" : "Guest"}
                  </p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-5 rounded-2xl bg-[#121310] border border-white/5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-semibold">
                  Pricing &amp; Discount Breakdown
                </p>

                <div className="flex justify-between text-xs text-white/65">
                  <span>Original Amount</span>
                  <span className="font-mono text-white">
                    {formatINR(selectedBooking.originalAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-white/65">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag size={12} className="text-[#C9944A]" />
                    Coupon Code
                  </span>
                  <span className="font-mono text-white">
                    {selectedBooking.couponCode || "None"}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-white/65">
                  <span>Discount Amount</span>
                  <span className="font-mono text-emerald-400">
                    -{formatINR(selectedBooking.discountAmount)}
                  </span>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-widest text-white/50">
                    Total Amount
                  </span>
                  <span className="font-serif text-2xl text-[#E3D9C9]">
                    {formatINR(selectedBooking.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment & Reference IDs */}
              <div className="p-5 rounded-2xl bg-[#121310] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-semibold inline-flex items-center gap-1.5">
                    <CreditCard size={12} /> Payment &amp; Reference IDs
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[9px] uppercase tracking-widest font-bold ${
                      PAYMENT_STYLES[selectedBooking.paymentStatus] ||
                      "bg-white/10 text-white/60"
                    }`}
                  >
                    {selectedBooking.paymentStatus}
                  </span>
                </div>

                {[
                  { label: "Booking _id", value: selectedBooking._id, key: "id" },
                  { label: "User ID", value: selectedBooking.userId, key: "user" },
                  {
                    label: "Service ID",
                    value: selectedBooking.serviceId,
                    key: "service",
                  },
                  {
                    label: "Razorpay Order ID",
                    value: selectedBooking.razorpayOrderId,
                    key: "order",
                  },
                  {
                    label: "Razorpay Payment ID",
                    value: selectedBooking.razorpayPaymentId,
                    key: "payment",
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
                  <span>
                    Created:{" "}
                    {selectedBooking.createdAt
                      ? new Date(selectedBooking.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </span>
                  <span>
                    Updated:{" "}
                    {selectedBooking.updatedAt
                      ? new Date(selectedBooking.updatedAt).toLocaleString("en-IN")
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