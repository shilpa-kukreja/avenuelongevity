"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  Package,
  Crown,
  Ticket,
  CreditCard,
  Mail,
  MessageSquare,
  LogOut,
  Search,
  Bell,
  Plus,
  List,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const navLinks = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarDays, path: "/admin/bookings" },
  { id: "customers", label: "Customers", icon: Users, path: "/admin/customers" },
  { id: "services", label: "Services", icon: Sparkles, path: "/admin/services" },
  { id: "packages", label: "Packages", icon: Package, path: "/admin/packages" },
  { id: "memberships", label: "Memberships", icon: Crown, path: "/admin/memberships" },
  { id: "coupons", label: "Coupons", icon: Ticket, path: "/admin/coupons" },
  { id: "transactions", label: "Transactions", icon: CreditCard, path: "/admin/transactions" },
  // { id: "marketing", label: "Marketing", icon: Mail },
  { id: "messages", label: "Messages", icon: MessageSquare, path: "/admin/messages" },
  { id: "subscribers", label: "Subscribers", icon: Users, path: "/admin/subscribers" },
];

export default function AdminShell({
  children,
  activeTab = "overview",
  onSelectTab,
  title,
  subtitle = "Manage your sanctuary operations.",
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isServicesRoute = pathname?.startsWith("/admin/services");
  const isPackagesRoute = pathname?.startsWith("/admin/packages");
  const isMembershipsRoute = pathname?.startsWith("/admin/memberships");
  const isCouponsRoute = pathname?.startsWith("/admin/coupons");
  const isBookingsRoute = pathname?.startsWith("/admin/bookings");
  const isCustomersRoute = pathname?.startsWith("/admin/customers");
  const isTransactionsRoute = pathname?.startsWith("/admin/transactions");
  const isMessagesRoute = pathname?.startsWith("/admin/messages");
  const isSubscribersRoute = pathname?.startsWith("/admin/subscribers");

  const [servicesExpanded, setServicesExpanded] = useState(true);
  const [packagesExpanded, setPackagesExpanded] = useState(true);
  const [membershipsExpanded, setMembershipsExpanded] = useState(true);

  const handleTabNav = (e, tabId) => {
    if (
      [
        "bookings",
        "customers",
        "services",
        "packages",
        "memberships",
        "coupons",
        "transactions",
        "messages",
        "subscribers",
      ].includes(tabId)
    ) {
      return;
    }
    if (onSelectTab && pathname === "/admin") {
      e.preventDefault();
      onSelectTab(tabId);
    }
  };

  const pageTitle =
    title ||
    (isServicesRoute
      ? "Services"
      : isPackagesRoute
      ? "Packages"
      : isMembershipsRoute
      ? "Memberships"
      : isCouponsRoute
      ? "Coupons"
      : isBookingsRoute
      ? "Bookings"
      : isCustomersRoute
      ? "Customers"
      : isTransactionsRoute
      ? "Transactions"
      : isMessagesRoute
      ? "Messages"
      : isSubscribersRoute
      ? "Subscribers"
      : activeTab);

  const SubMenu = ({
    route,
    label,
    icon: Icon,
    isExpanded,
    toggleExpand,
    isActive,
    subLinks,
  }) => (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative group ${
          isActive
            ? "text-white"
            : "text-white/40 hover:text-white/80 hover:bg-white/5"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="admin-pill"
            className="absolute inset-0 bg-[#C9944A]/10 border border-[#C9944A]/20 rounded-xl -z-10"
          />
        )}
        <Link href={route} className="flex items-center gap-4 flex-1">
          <Icon
            size={18}
            className={
              isActive
                ? "text-[#C9944A]"
                : "group-hover:text-[#C9944A] transition-colors"
            }
          />
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase">
            {label}
          </span>
        </Link>
        <button
          type="button"
          onClick={toggleExpand}
          className="p-1 text-white/40 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
      {isExpanded && (
        <div className="ml-7 mt-1 mb-1 pl-3 border-l border-white/10 flex flex-col gap-1">
          {subLinks.map((sub, idx) => (
            <Link
              key={idx}
              href={sub.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] uppercase tracking-[0.12em] ${
                pathname === sub.path
                  ? "text-[#C9944A] bg-[#C9944A]/10 font-semibold"
                  : "text-white/45 hover:text-white hover:bg-white/5"
              }`}
            >
              <sub.icon size={13} /> <span>{sub.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="relative w-full min-h-screen bg-[#080906] flex flex-col lg:flex-row">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9944A]/5 blur-[150px] rounded-full pointer-events-none" />

      <aside className="w-full lg:w-[280px] shrink-0 border-r border-white/5 bg-[#0A0B09] hidden lg:flex flex-col justify-between sticky top-0 h-screen z-20 overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 rounded-lg bg-[#C9944A] flex items-center justify-center text-[#080906] font-bold text-sm">
              A
            </div>
            <span className="text-white font-serif tracking-widest text-lg">
              Admin Command
            </span>
          </Link>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;

              if (link.id === "services") {
                return (
                  <SubMenu
                    key={link.id}
                    route="/admin/services"
                    label="Services"
                    icon={Icon}
                    isExpanded={servicesExpanded}
                    toggleExpand={() => setServicesExpanded(!servicesExpanded)}
                    isActive={isServicesRoute || activeTab === "services"}
                    subLinks={[
                      { label: "All Services", path: "/admin/services", icon: List },
                      { label: "Add Service", path: "/admin/services/add", icon: Plus },
                    ]}
                  />
                );
              }

              if (link.id === "packages") {
                return (
                  <SubMenu
                    key={link.id}
                    route="/admin/packages"
                    label="Packages"
                    icon={Icon}
                    isExpanded={packagesExpanded}
                    toggleExpand={() => setPackagesExpanded(!packagesExpanded)}
                    isActive={isPackagesRoute || activeTab === "packages"}
                    subLinks={[
                      { label: "All Packages", path: "/admin/packages", icon: List },
                      { label: "Add Package", path: "/admin/packages/add", icon: Plus },
                    ]}
                  />
                );
              }

              if (link.id === "memberships") {
                return (
                  <SubMenu
                    key={link.id}
                    route="/admin/memberships"
                    label="Memberships"
                    icon={Icon}
                    isExpanded={membershipsExpanded}
                    toggleExpand={() =>
                      setMembershipsExpanded(!membershipsExpanded)
                    }
                    isActive={isMembershipsRoute || activeTab === "memberships"}
                    subLinks={[
                      { label: "All Plans", path: "/admin/memberships", icon: List },
                      { label: "Add Plan", path: "/admin/memberships/add", icon: Plus },
                    ]}
                  />
                );
              }

              const isActive = link.path
                ? pathname === link.path || pathname?.startsWith(`${link.path}/`)
                : !isServicesRoute &&
                  !isPackagesRoute &&
                  !isMembershipsRoute &&
                  !isCouponsRoute &&
                  !isBookingsRoute &&
                  !isCustomersRoute &&
                  !isTransactionsRoute &&
                  !isMessagesRoute &&
                  !isSubscribersRoute &&
                  activeTab === link.id;
              const href = link.path || `/admin?tab=${link.id}`;

              return (
                <Link
                  key={link.id}
                  href={href}
                  onClick={(e) => handleTabNav(e, link.id)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                    isActive
                      ? "text-white"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-pill"
                      className="absolute inset-0 bg-[#C9944A]/10 border border-[#C9944A]/20 rounded-xl -z-10"
                    />
                  )}
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-[#C9944A]"
                        : "group-hover:text-[#C9944A] transition-colors"
                    }
                  />
                  <span className="text-[11px] font-medium tracking-[0.1em] uppercase">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#0A0B09]">
          <Link
            href="/admin/login"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("avenue_token");
              }
            }}
            className="flex items-center gap-4 px-4 py-3 text-white/40 hover:text-red-400 transition-colors w-full rounded-xl hover:bg-red-500/5"
          >
            <LogOut size={18} />
            <span className="text-[11px] font-medium tracking-[0.1em] uppercase">
              Sign Out
            </span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 p-6 md:p-10 lg:p-12 relative z-10 w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-white/5 pb-6">
          <div>
            <h1 className="font-serif text-3xl text-white capitalize">
              {pageTitle}
            </h1>
            <p className="text-white/40 text-xs mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-[#121310] border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-[#C9944A] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/bookings")}
              className="w-10 h-10 shrink-0 rounded-full bg-[#121310] border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors relative"
              title="Notifications & Bookings"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#C9944A] rounded-full animate-pulse" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}