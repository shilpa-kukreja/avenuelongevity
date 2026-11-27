"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Crown,
  User,
  Clock,
  Users,
  Sparkles,
  Loader2,
  Plus,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "../app/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const easeOut = [0.22, 1, 0.36, 1];

const formatUSD = (value) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

const getId = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return String(val._id || val.id || "");
  return String(val);
};

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "packages", label: "Packages", icon: Package },
  { id: "memberships", label: "Memberships", icon: Crown },
  { id: "profile", label: "Profile", icon: User },
];

export default function UserDashboardPage() {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(user || null);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  // Profile Edit & Save State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatusMsg, setProfileStatusMsg] = useState({ type: "", text: "" });

  const loadDashboardData = useCallback(async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;

    if (!token && !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [profileRes, bookingsRes, txnsRes] = await Promise.allSettled([
        axios.get(`${API_URL}/auth/profile`, { headers }),
        axios.get(`${API_URL}/bookings/my-bookings`, { headers }),
        axios
          .get(`${API_URL}/transactions/my-transactions`, { headers })
          .catch(() => axios.get(`${API_URL}/transactions`, { headers })),
      ]);

      let currentUser = profile?.user || profile || user || null;
      if (profileRes.status === "fulfilled" && profileRes.value.data?.user) {
        currentUser = profileRes.value.data.user;
        setProfile(currentUser);
        setEditName(currentUser.name || "");
        setEditPhone(currentUser.phone || "");
      } else if (currentUser) {
        setEditName(currentUser.name || "");
        setEditPhone(currentUser.phone || "");
      }

      const currentUserId = getId(currentUser?._id || currentUser?.id);
      const currentUserEmail = (currentUser?.email || "").toLowerCase();

      if (bookingsRes.status === "fulfilled") {
        const raw = bookingsRes.value.data;
        const list = Array.isArray(raw)
          ? raw
          : raw?.bookings || raw?.data || [];
        setBookings(list);
      }

      if (txnsRes.status === "fulfilled") {
        const raw = txnsRes.value.data;
        const list = Array.isArray(raw)
          ? raw
          : raw?.transactions || raw?.data || [];
        const mine = list.filter((t) => {
          const tUserId = getId(t.user);
          const tEmail = (t.customerEmail || "").toLowerCase();
          if (currentUserId && tUserId) return tUserId === currentUserId;
          if (currentUserEmail && tEmail) return tEmail === currentUserEmail;
          return true;
        });
        setTransactions(mine);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStartEdit = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setProfileStatusMsg({ type: "", text: "" });
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setProfileStatusMsg({ type: "", text: "" });
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setProfileStatusMsg({ type: "error", text: "Name is required." });
      return;
    }

    setSavingProfile(true);
    setProfileStatusMsg({ type: "", text: "" });

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;
      const { data } = await axios.put(
        `${API_URL}/auth/profile`,
        {
          name: editName.trim(),
          phone: editPhone.trim(),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const updated = {
        ...profile,
        name: data.name ?? editName.trim(),
        phone: data.phone ?? editPhone.trim(),
        avatar: data.avatar ?? profile?.avatar,
      };

      if (data.token && typeof window !== "undefined") {
        localStorage.setItem("avenue_token", data.token);
      }

      setProfile(updated);
      setUser?.((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditingProfile(false);
      setProfileStatusMsg({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (err) {
      setProfileStatusMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to save profile changes.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const paidTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => !t.paymentStatus || t.paymentStatus === "Paid"
      ),
    [transactions]
  );

  const packagePurchases = useMemo(
    () => paidTransactions.filter((t) => t.itemType === "Package"),
    [paidTransactions]
  );

  const membershipPurchases = useMemo(
    () => paidTransactions.filter((t) => t.itemType === "Membership"),
    [paidTransactions]
  );

  const activeMembershipLabel = useMemo(() => {
    if (profile?.membershipTier && profile.membershipTier !== "None") {
      return profile.membershipTier;
    }
    if (membershipPurchases.length > 0) {
      return membershipPurchases[0].itemName;
    }
    return "No Active Membership";
  }, [profile, membershipPurchases]);

  if (!loading && !profile) {
    return (
      <section className="min-h-screen bg-[#080906] flex flex-col items-center justify-center pt-28 p-6 text-center text-white">
        <h1 className="font-serif text-3xl mb-3">
          Sign in to view your sanctuary dashboard
        </h1>
        <p className="text-white/50 text-sm mb-6 max-w-md">
          Access your booked services, packages, and active membership.
        </p>
        <Link
          href="/login"
          className="px-7 py-3.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors"
        >
          Go to Login
        </Link>
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-screen bg-[#080906] text-white flex flex-col lg:flex-row pt-28 md:pt-36 lg:pt-28">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9944A]/5 blur-[150px] rounded-full pointer-events-none" />

      {/* SIDEBAR */}
      <aside className="w-full lg:w-[270px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0A0B09] lg:sticky lg:top-28 lg:h-[calc(100vh-7rem)] flex flex-col justify-between z-20">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-[#C9944A] flex items-center justify-center text-[#080906] font-bold text-sm">
              A
            </div>
            <div>
              <span className="font-serif tracking-widest text-lg text-white block leading-none">
                AVENUE
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#C9944A]">
                Member Portal
              </span>
            </div>
          </Link>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const count =
                item.id === "bookings"
                  ? bookings.length
                  : item.id === "packages"
                  ? packagePurchases.length
                  : item.id === "memberships"
                  ? membershipPurchases.length
                  : null;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    if (item.id !== "profile") {
                      setIsEditingProfile(false);
                      setProfileStatusMsg({ type: "", text: "" });
                    }
                  }}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all shrink-0 ${
                    isActive
                      ? "bg-[#C9944A]/15 text-white border border-[#C9944A]/30"
                      : "text-white/45 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className={isActive ? "text-[#C9944A]" : "text-white/50"}
                    />
                    <span className="text-[11px] font-medium tracking-[0.12em] uppercase">
                      {item.label}
                    </span>
                  </span>
                  {count !== null && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/60">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-6 border-t border-white/10 space-y-2">
          <Link
            href="/book"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors"
          >
            <Plus size={14} /> Book Ritual
          </Link>
          <button
            type="button"
            onClick={() => {
              logout?.();
              router.push("/login");
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-white/45 hover:text-red-400 transition-colors w-full rounded-xl hover:bg-red-500/5 text-[11px] uppercase tracking-[0.1em]"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-10 lg:p-12 relative z-10 max-w-[1300px]">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-white/10">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-white capitalize">
              {activeSection === "overview"
                ? `Welcome, ${profile?.name || "Guest"}`
                : activeSection}
            </h1>
            <p className="text-white/45 text-xs mt-1">
              {activeSection === "overview"
                ? "Your booked services, packages, and active membership at a glance."
                : `Manage and review your ${activeSection}.`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadDashboardData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#121310] border border-white/10 text-xs text-white/70 hover:text-[#C9944A] transition-colors"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              href="/book"
              className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold"
            >
              <Plus size={13} /> Book
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-white/50">
            <Loader2 className="animate-spin text-[#C9944A] mb-3" size={28} />
            Loading your dashboard...
          </div>
        ) : (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="space-y-8"
          >
            {/* OVERVIEW */}
            {activeSection === "overview" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-[#121310] border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">
                        Booked Services
                      </span>
                      <Sparkles size={16} className="text-[#C9944A]" />
                    </div>
                    <div className="font-serif text-3xl">{bookings.length}</div>
                  </div>

                  <div className="bg-[#121310] border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">
                        Packages
                      </span>
                      <Package size={16} className="text-[#C9944A]" />
                    </div>
                    <div className="font-serif text-3xl">
                      {packagePurchases.length}
                    </div>
                  </div>

                  <div className="bg-[#121310] border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">
                        Membership
                      </span>
                      <Crown size={16} className="text-[#C9944A]" />
                    </div>
                    <div className="font-serif text-2xl truncate">
                      {activeMembershipLabel}
                    </div>
                    <p className="text-[10px] text-white/40 mt-1">
                      {profile?.membershipStatus ||
                        (membershipPurchases.length ? "Active" : "None")}
                    </p>
                  </div>

                  <div className="bg-[#121310] border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">
                        Credits
                      </span>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                    <div className="font-serif text-3xl">
                      {profile?.credits ?? 0}
                    </div>
                  </div>
                </div>

                <BookingsBlock bookings={bookings} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PackagesBlock packages={packagePurchases} />
                  <MembershipsBlock
                    memberships={membershipPurchases}
                    activeMembershipLabel={activeMembershipLabel}
                    membershipStatus={profile?.membershipStatus}
                  />
                </div>
              </>
            )}

            {activeSection === "bookings" && <BookingsBlock bookings={bookings} />}

            {activeSection === "packages" && (
              <PackagesBlock packages={packagePurchases} />
            )}

            {activeSection === "memberships" && (
              <MembershipsBlock
                memberships={membershipPurchases}
                activeMembershipLabel={activeMembershipLabel}
                membershipStatus={profile?.membershipStatus}
              />
            )}

            {/* PROFILE TAB WITH EDIT -> SAVE */}
            {activeSection === "profile" && (
              <div className="bg-[#121310] border border-white/10 rounded-2xl p-6 md:p-8 max-w-2xl space-y-6">
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C9944A]/15 border border-[#C9944A]/30 flex items-center justify-center text-[#C9944A]">
                      <User size={22} />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl text-white">
                        {profile?.name || "Member"}
                      </h2>
                      <span className="text-[10px] uppercase tracking-widest text-[#C9944A]">
                        {activeMembershipLabel}
                      </span>
                    </div>
                  </div>

                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs text-white hover:border-[#C9944A] hover:text-[#C9944A] transition-colors"
                    >
                      <Pencil size={13} /> Edit Profile
                    </button>
                  )}
                </div>

                {profileStatusMsg.text && (
                  <div
                    className={`p-3.5 rounded-xl text-xs border ${
                      profileStatusMsg.type === "error"
                        ? "bg-red-500/10 border-red-500/25 text-red-300"
                        : "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                    }`}
                  >
                    {profileStatusMsg.text}
                  </div>
                )}

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full bg-[#080906] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">
                        Email Address (Read-only)
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="w-full bg-[#080906]/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/45 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={savingProfile}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white transition-colors"
                      >
                        <X size={14} /> Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors disabled:opacity-60"
                      >
                        {savingProfile ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save size={14} /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-center gap-3 text-white/75">
                      <Mail size={15} className="text-[#C9944A]" />
                      <span>{profile?.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/75">
                      <Phone size={15} className="text-[#C9944A]" />
                      <span>{profile?.phone || "Not added"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/75">
                      <ShieldCheck size={15} className="text-[#C9944A]" />
                      <span>Available Credits: {profile?.credits ?? 0}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function BookingsBlock({ bookings }) {
  return (
    <div className="bg-[#121310] border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl">Booked Services</h2>
        <Link href="/book" className="text-xs text-[#C9944A] hover:underline">
          + Book a service
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="text-white/45 text-sm">
          No booked services found for your account.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="p-5 rounded-xl bg-[#080906] border border-white/10 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-serif text-xl text-white">
                    {b.serviceName}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {b.status || "Confirmed"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-white/60 mt-3">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} className="text-[#C9944A]" />
                    {b.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="text-[#C9944A]" />
                    {b.time}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} className="text-[#C9944A]" />
                    {b.guests} {b.guests > 1 ? "Guests" : "Guest"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40">
                  Payment: {b.paymentStatus || "Paid"}
                </span>
                <span className="font-semibold text-white text-sm">
                  {formatUSD(b.totalAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PackagesBlock({ packages }) {
  return (
    <div className="bg-[#121310] border border-white/10 rounded-2xl p-6 md:p-8">
      <h2 className="font-serif text-2xl mb-6">Your Packages</h2>
      {packages.length === 0 ? (
        <p className="text-white/45 text-sm">No packages purchased yet.</p>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="p-5 rounded-xl bg-[#080906] border border-white/10 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-serif text-lg text-white">{pkg.itemName}</h3>
                <p className="text-[11px] text-white/45 mt-1">
                  {pkg.createdAt
                    ? new Date(pkg.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  {formatUSD(pkg.amount)}
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400">
                  {pkg.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MembershipsBlock({
  memberships,
  activeMembershipLabel,
  membershipStatus,
}) {
  return (
    <div className="bg-[#121310] border border-white/10 rounded-2xl p-6 md:p-8">
      <h2 className="font-serif text-2xl mb-6">Your Membership</h2>
      {memberships.length === 0 &&
      activeMembershipLabel === "No Active Membership" ? (
        <p className="text-white/45 text-sm">No active membership plan found.</p>
      ) : (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[#080906] border border-[#C9944A]/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#C9944A] font-bold">
                  Current Membership
                </span>
                <h3 className="font-serif text-xl text-white mt-0.5">
                  {activeMembershipLabel}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold bg-[#C9944A]/15 text-[#C9944A]">
                {membershipStatus || "Active"}
              </span>
            </div>
          </div>

          {memberships.map((m) => (
            <div
              key={m._id}
              className="p-4 rounded-xl bg-[#080906] border border-white/10 flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <p className="text-white font-medium">{m.itemName}</p>
                <p className="text-white/40 mt-0.5">
                  Cycle: {m.billingCycle || "Standard"}
                </p>
              </div>
              <span className="font-bold text-white">{formatUSD(m.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}