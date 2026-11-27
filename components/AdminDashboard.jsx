"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useRouter} from "next/navigation";
import axios from "axios";
import {
  CalendarDays,
  Crown,
  Mail,
  TrendingUp,
  CheckCircle2,
  MoreHorizontal,
  Download,
  Loader2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import ServicesAdmin from "@/components/admin/ServicesAdmin";

const easeOut = [0.22, 1, 0.36, 1];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const formatUSD = (value) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatCompactK = (value) => {
  const num = Number(value || 0);
  if (num === 0) return "$0";
  if (Math.abs(num) >= 1000) {
    return `$${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
  }
  return formatUSD(num);
};

const getRecordAmount = (record) => {
  if (record.totalAmount !== undefined && record.totalAmount !== null) {
    return Number(record.totalAmount || 0);
  }
  return Number(record.amount || 0);
};

const isPaidRecord = (record) => {
  return !record.paymentStatus || record.paymentStatus === "Paid";
};

const parseRecordDate = (record) => {
  if (record.createdAt) {
    const parsed = new Date(record.createdAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (typeof record.date === "string") {
    const cleaned = record.date.replace(/^Today,\s*/i, "");
    const year = new Date().getFullYear();
    const parsed = new Date(`${cleaned}, ${year}`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

const buildRealChartSeries = (period, bookings, transactions) => {
  const paidRecords = [...bookings, ...transactions].filter(isPaidRecord);
  const now = new Date();

  if (period === "This Month") {
    const year = now.getFullYear();
    const month = now.getMonth();
    const buckets = [
      { label: "Wk 1", amount: 0, bookings: 0 },
      { label: "Wk 2", amount: 0, bookings: 0 },
      { label: "Wk 3", amount: 0, bookings: 0 },
      { label: "Wk 4", amount: 0, bookings: 0 },
    ];

    paidRecords.forEach((rec) => {
      const dt = parseRecordDate(rec);
      if (!dt || dt.getFullYear() !== year || dt.getMonth() !== month) return;
      const weekIdx = Math.min(3, Math.floor((dt.getDate() - 1) / 7));
      buckets[weekIdx].amount += getRecordAmount(rec);
      buckets[weekIdx].bookings += 1;
    });

    return buckets;
  }

  // "This Week" (Monday through Sunday)
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
  const sundayEnd = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const buckets = dayLabels.map((label) => ({
    label,
    amount: 0,
    bookings: 0,
  }));

  paidRecords.forEach((rec) => {
    const dt = parseRecordDate(rec);
    if (!dt || dt < monday || dt > sundayEnd) return;
    const jsDay = dt.getDay();
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    buckets[idx].amount += getRecordAmount(rec);
    buckets[idx].bookings += 1;
  });

  return buckets;
};


// Inside AdminDashboardContent:
const router = useRouter();
const tabFromQuery = searchParams.get("tab");

useEffect(() => {
  if (tabFromQuery === "coupons") {
    router.replace("/admin/coupons");
    return;
  }
  if (tabFromQuery) setActiveTab(tabFromQuery);
}, [tabFromQuery, router]);

const mockCustomers = [
  { id: "U-001", name: "Elena Rodriguez", email: "elena@example.com", tier: "Signature", joined: "Jan 2024", spent: "$12,400", status: "Active" },
  { id: "U-002", name: "James Mitchell", email: "james@example.com", tier: "Essential", joined: "Mar 2024", spent: "$4,500", status: "Active" },
];

const mockPackages = [
  { id: "P-01", name: "Starter Pack", sessions: 5, price: "$675", active: true },
  { id: "P-02", name: "Ritual Pack", sessions: 10, price: "$1,275", active: true },
  { id: "P-03", name: "Sanctuary Pack", sessions: 20, price: "$2,400", active: true },
];

const mockMemberships = [
  { id: "M-001", name: "Elena Rodriguez", tier: "Signature", billing: "Monthly", renewal: "Dec 15, 2026", status: "Active" },
  { id: "M-002", name: "Samantha Lee", tier: "Sanctuary", billing: "Yearly", renewal: "Nov 01, 2027", status: "Active" },
];

const mockTransactions = [
  { id: "pay_N82hF...", customer: "Elena Rodriguez", type: "Membership (Signature)", amount: "$999", date: "Nov 16, 2026", status: "Success" },
];

const mockInquiries = [
  { id: "I-101", name: "Priya Sharma", email: "priya@example.com", subject: "Corporate Booking", date: "Nov 16, 2026", status: "Unread" },
];

const mockSubscribers = [
  { id: "S-01", email: "hello@example.com", date: "Nov 10, 2026", status: "Subscribed" },
];

function RevenueAreaChart({ period, data, activeIndex, setActiveIndex }) {
  const width = 640;
  const height = 220;
  const padX = 44;
  const padTop = 24;
  const padBottom = 34;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;

  const rawMax = Math.max(...data.map((d) => d.amount), 0);
  const maxVal = rawMax > 0 ? rawMax * 1.15 : 100;

  const coords = data.map((d, idx) => {
    const x =
      data.length === 1
        ? padX + plotW / 2
        : padX + (idx / (data.length - 1)) * plotW;
    const y = padTop + plotH - (d.amount / maxVal) * plotH;
    return { ...d, x, y, idx };
  });

  const linePath = coords
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(
          padTop + plotH
        ).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : "";

  const currentPoint = coords[activeIndex] || coords[coords.length - 1];
  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative z-10">
      {/* Hovered / Selected Point Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-3 py-2.5 rounded-xl bg-[#080906]/90 border border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#C9944A]" />
          <span className="text-[11px] uppercase tracking-widest text-white/60">
            {currentPoint?.label} ({period})
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <span className="text-white font-mono font-semibold">
            {formatUSD(currentPoint?.amount)}
          </span>
          <span className="text-[#C9944A] text-[11px]">
            {currentPoint?.bookings} orders
          </span>
        </div>
      </div>

      {/* SVG Line + Area Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 overflow-visible select-none"
          role="img"
          aria-label={`Revenue chart for ${period}`}
        >
          <defs>
            <linearGradient id="avenueGoldArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9944A" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#C9944A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y Labels */}
          {gridTicks.map((ratio, i) => {
            const y = padTop + plotH - ratio * plotH;
            const tickValue = maxVal * ratio;
            return (
              <g key={i}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-white/35 text-[9px] font-mono"
                >
                  {formatCompactK(tickValue)}
                </text>
              </g>
            );
          })}

          {/* Vertical Guide for Active Point */}
          {currentPoint && (
            <line
              x1={currentPoint.x}
              y1={padTop}
              x2={currentPoint.x}
              y2={padTop + plotH}
              stroke="#C9944A"
              strokeOpacity="0.35"
              strokeDasharray="3 3"
            />
          )}

          {/* Shaded Area */}
          {areaPath && (
            <motion.path
              key={`area-${period}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: easeOut }}
              d={areaPath}
              fill="url(#avenueGoldArea)"
            />
          )}

          {/* Curve Line */}
          {linePath && (
            <motion.path
              key={`line-${period}`}
              initial={{ pathLength: 0, opacity: 0.5 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.65, ease: easeOut }}
              d={linePath}
              fill="none"
              stroke="#C9944A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Points */}
          {coords.map((pt) => {
            const isSelected = pt.idx === activeIndex;
            return (
              <g
                key={pt.label}
                className="cursor-pointer"
                onMouseEnter={() => setActiveIndex(pt.idx)}
                onClick={() => setActiveIndex(pt.idx)}
              >
                <rect
                  x={pt.x - plotW / (data.length * 2)}
                  y={padTop}
                  width={Math.max(24, plotW / data.length)}
                  height={plotH + padBottom}
                  fill="transparent"
                />

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? "#E3D9C9" : "#121310"}
                  stroke="#C9944A"
                  strokeWidth={isSelected ? 2.5 : 2}
                />

                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[10px] uppercase tracking-wider ${
                    isSelected
                      ? "fill-[#C9944A] font-bold"
                      : "fill-white/45"
                  }`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Period Breakdown Pills */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-4 ${
          data.length === 7 ? "lg:grid-cols-7" : "sm:grid-cols-4"
        } gap-2 mt-4 pt-4 border-t border-white/5`}
      >
        {data.map((d, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={d.label}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`px-2.5 py-2 rounded-xl text-left transition-all border ${
                active
                  ? "bg-[#C9944A]/15 border-[#C9944A]/40"
                  : "bg-[#080906]/60 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="text-[9px] uppercase tracking-wider text-white/45">
                {d.label}
              </div>
              <div className="text-xs font-mono text-white mt-0.5">
                {formatCompactK(d.amount)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabFromQuery || "overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [chartPeriod, setChartPeriod] = useState("This Week");
  const [activePointIdx, setActivePointIdx] = useState(0);

  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tabFromQuery) setActiveTab(tabFromQuery);
  }, [tabFromQuery]);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        };

        const [bRes, tRes] = await Promise.allSettled([
          axios.get(`${API_URL}/bookings`, config),
          axios.get(`${API_URL}/transactions`, config),
        ]);

        if (!active) return;

        if (bRes.status === "fulfilled") {
          const bData = bRes.value.data?.bookings || bRes.value.data?.data || bRes.value.data;
          setBookings(Array.isArray(bData) ? bData : []);
        }

        if (tRes.status === "fulfilled") {
          const tData = tRes.value.data?.transactions || tRes.value.data?.data || tRes.value.data;
          setTransactions(Array.isArray(tData) ? tData : []);
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const activeChartSeries = useMemo(() => {
    return buildRealChartSeries(chartPeriod, bookings, transactions);
  }, [chartPeriod, bookings, transactions]);

  useEffect(() => {
    const nonZeroIdx = activeChartSeries.findIndex((item) => item.amount > 0);
    setActivePointIdx(nonZeroIdx >= 0 ? nonZeroIdx : activeChartSeries.length - 1);
  }, [activeChartSeries]);

  const handlePeriodChange = (e) => {
    setChartPeriod(e.target.value);
  };

  const periodTotal = useMemo(
    () => activeChartSeries.reduce((sum, item) => sum + item.amount, 0),
    [activeChartSeries]
  );

  const paidBookingsTotal = bookings
    .filter((b) => b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  const paidTransactionsTotal = transactions
    .filter((t) => t.paymentStatus === "Paid")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalRevenue = paidBookingsTotal + paidTransactionsTotal;
  const activeBookingsCount = bookings.filter(
    (b) => b.status === "Confirmed" || b.status === "Pending"
  ).length;

  const recentActivity = [...transactions, ...bookings].slice(0, 5);

  return (
    <AdminShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      subtitle="Welcome back. Here is what's happening at Avenue today."
    >
      <AnimatePresence mode="wait">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="space-y-6"
          >
            {/* HERO STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Revenue",
                  value: loading ? "…" : formatUSD(totalRevenue),
                  trend: "+12.5%",
                  isUp: true,
                  icon: TrendingUp,
                },
                {
                  label: "Active Bookings",
                  value: loading ? "…" : activeBookingsCount.toString(),
                  trend: `${bookings.length} total`,
                  isUp: true,
                  icon: CalendarDays,
                },
                {
                  label: "Total Purchases",
                  value: loading ? "…" : transactions.length.toString(),
                  trend: "Lifetime",
                  isUp: true,
                  icon: Crown,
                },
                {
                  label: "Subscribers",
                  value: "1,204",
                  trend: "-2%",
                  isUp: false,
                  icon: Mail,
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="bg-[#121310] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-[#C9944A]/40 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9944A]/5 blur-2xl group-hover:bg-[#C9944A]/10 transition-colors" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="text-[10px] uppercase tracking-widest text-white/45">
                      {stat.label}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <stat.icon size={14} className="text-[#C9944A]" />
                    </div>
                  </div>
                  <div className="font-serif text-4xl text-white mb-3 relative z-10">
                    {stat.value}
                  </div>
                  <div
                    className={`text-[10px] flex items-center gap-1 font-bold ${
                      stat.isUp ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {stat.isUp ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    {stat.trend}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* INTERACTIVE CHART */}
              <div className="lg:col-span-2 bg-[#121310] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[#C9944A]" />
                      <h2 className="font-serif text-xl text-white">
                        Revenue Analytics
                      </h2>
                    </div>
                    <p className="text-[10px] text-white/45 uppercase tracking-widest mt-1">
                      {chartPeriod} · Period Total {formatUSD(periodTotal)}
                    </p>
                  </div>

                  <select
                    value={chartPeriod}
                    onChange={handlePeriodChange}
                    aria-label="Select revenue timeframe"
                    className="bg-[#080906] border border-white/15 focus:border-[#C9944A] rounded-xl px-3.5 py-2 text-[10px] text-white outline-none uppercase tracking-widest cursor-pointer transition-colors"
                  >
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                  </select>
                </div>

                <RevenueAreaChart
                  period={chartPeriod}
                  data={activeChartSeries}
                  activeIndex={activePointIdx}
                  setActiveIndex={setActivePointIdx}
                />
              </div>

              {/* LIVE ACTIVITY FEED */}
              <div className="bg-[#121310] border border-white/10 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <Activity size={16} className="text-[#C9944A]" />
                  <h2 className="font-serif text-xl text-white">Live Activity</h2>
                </div>

                {loading ? (
                  <div className="flex-1 flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-[#C9944A]" size={20} />
                  </div>
                ) : (
                  <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex gap-4 relative">
                        {i !== recentActivity.length - 1 && (
                          <div className="absolute left-[15px] top-8 bottom-[-24px] w-[1px] bg-white/10" />
                        )}

                        <div className="w-8 h-8 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/20 flex items-center justify-center shrink-0 relative z-10">
                          <CheckCircle2 size={14} className="text-[#C9944A]" />
                        </div>
                        <div>
                          <p className="text-sm text-white leading-tight">
                            <span className="font-semibold text-[#C9944A]">
                              {item.customerName || "Guest"}
                            </span>
                            {item.itemName
                              ? ` purchased ${item.itemName}.`
                              : ` booked ${item.serviceName || "a session"}.`}
                          </p>
                          <p className="text-[9px] text-white/40 mt-1.5 uppercase tracking-widest">
                            Recent activity
                          </p>
                        </div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <p className="text-white/40 text-sm text-center py-10">
                        No recent activity.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* CUSTOMERS */}
        {activeTab === "customers" && (
          <motion.div
            key="customers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <div className="bg-[#121310] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/40 bg-white/[0.02]">
                      <th className="p-4 font-medium">Customer Name</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Tier</th>
                      <th className="p-4 font-medium">Lifetime Value</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCustomers.map((c, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-4 text-sm text-white">{c.name}</td>
                        <td className="p-4 text-sm text-white/60">{c.email}</td>
                        <td className="p-4 text-[10px] uppercase tracking-widest text-[#C9944A] font-bold">
                          {c.tier}
                        </td>
                        <td className="p-4 text-sm text-white">{c.spent}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                              c.status === "VIP"
                                ? "bg-[#C9944A]/20 text-[#C9944A] border border-[#C9944A]/30"
                                : "bg-white/5 text-white/60 border border-white/10"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* SERVICES */}
        {activeTab === "services" && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <Suspense fallback={<div className="text-white/40 text-center py-10">Loading…</div>}>
              <ServicesAdmin />
            </Suspense>
          </motion.div>
        )}

        {/* PACKAGES */}
        {activeTab === "packages" && (
          <motion.div
            key="packages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockPackages.map((p, i) => (
                <div key={i} className="bg-[#121310] border border-white/5 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-serif text-xl">{p.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                        {p.sessions} Sessions
                      </p>
                    </div>
                    <button className="text-white/20 hover:text-white transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-8 border-t border-white/10 pt-4">
                    <span className="text-white font-mono text-lg">{p.price}</span>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-md">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* MEMBERSHIPS */}
        {activeTab === "memberships" && (
          <motion.div
            key="memberships"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <div className="bg-[#121310] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/40 bg-white/[0.02]">
                    <th className="p-4 font-medium">Member Name</th>
                    <th className="p-4 font-medium">Tier</th>
                    <th className="p-4 font-medium">Billing</th>
                    <th className="p-4 font-medium">Next Renewal</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMemberships.map((m, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 text-sm text-white">{m.name}</td>
                      <td className="p-4 text-[10px] uppercase tracking-widest text-[#C9944A] font-bold">
                        {m.tier}
                      </td>
                      <td className="p-4 text-sm text-white/60">{m.billing}</td>
                      <td className="p-4 text-sm text-white">{m.renewal}</td>
                      <td className="p-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* FINANCIALS */}
        {activeTab === "financials" && (
          <motion.div
            key="financials"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <div className="bg-[#121310] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="font-serif text-xl text-white">Transaction History</h2>
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                  <Download size={14} /> Export CSV
                </button>
              </div>
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/40 bg-white/[0.02]">
                    <th className="p-4 font-medium">Txn ID</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((t, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 text-xs font-mono text-[#C9944A]">{t.id}</td>
                      <td className="p-4 text-sm text-white">{t.customer}</td>
                      <td className="p-4 text-[10px] uppercase tracking-widest text-white/60">
                        {t.type}
                      </td>
                      <td className="p-4 text-sm text-white">{t.amount}</td>
                      <td className="p-4 text-sm text-white/60">{t.date}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                            t.status === "Success"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* MARKETING */}
        {activeTab === "marketing" && (
          <motion.div
            key="marketing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-serif text-xl text-white mb-4">Contact Inquiries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockInquiries.map((inq, i) => (
                  <div
                    key={i}
                    className="bg-[#121310] border border-white/5 p-6 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-white text-sm font-medium">{inq.subject}</h3>
                        <span className="text-[9px] text-white/40 uppercase tracking-widest">
                          {inq.date}
                        </span>
                      </div>
                      <p className="text-white/60 text-xs mb-6">
                        {inq.name} · {inq.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-lg bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors">
                        Reply
                      </button>
                      <button className="flex-1 py-2 rounded-lg bg-white/5 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors">
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#121310] border border-white/5 rounded-2xl overflow-hidden mt-8">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="font-serif text-xl text-white">Newsletter Subscribers</h2>
                <button className="text-[10px] uppercase tracking-widest text-[#C9944A] hover:text-white transition-colors flex items-center gap-2">
                  <Download size={14} /> Export
                </button>
              </div>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/40 bg-white/[0.02]">
                    <th className="p-4 font-medium">Email Address</th>
                    <th className="p-4 font-medium">Date Joined</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSubscribers.map((sub, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 text-sm text-white">{sub.email}</td>
                      <td className="p-4 text-sm text-white/60">{sub.date}</td>
                      <td className="p-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080906] flex items-center justify-center text-white/40">
          <Loader2 className="animate-spin text-[#C9944A]" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}