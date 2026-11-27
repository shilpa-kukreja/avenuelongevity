"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus, Search, Pencil, Trash2, Power, Eye, EyeOff,
  Sparkles, RefreshCw, AlertCircle, CheckCircle2,
  X, ImageOff, ExternalLink
} from "lucide-react";
import { servicesApi, resolveImageUrl } from "../../app/lib/adminApi";

const easeOut = [0.22, 1, 0.36, 1];

const CATEGORIES = ["Heat", "Cold", "Recovery Tech", "Bathing", "Bodywork", "Amenity"];

export default function ServicesAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteMode, setDeleteMode] = useState("soft");

  // Toasts
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  /* Success toast when redirected from add/edit */
  useEffect(() => {
    if (searchParams.get("created") === "1") {
      pushToast("Service created successfully");
      router.replace("/admin/serviceslist");
    } else if (searchParams.get("updated") === "1") {
      pushToast("Service updated successfully");
      router.replace("/admin/serviceslist");
    }
  }, [searchParams, router, pushToast]);

  /* Fetch */
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        limit: 100,
        isActive: statusFilter === "inactive" ? "false" : statusFilter === "active" ? "true" : undefined,
        category: categoryFilter || undefined,
        search: search.trim() || undefined,
        sort,
      };
      const res = await servicesApi.list(params);
      setServices(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, sort]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  /* Navigate to add page */
  const handleAdd = () => router.push("/admin/services/add");

  /* Navigate to edit page */
  const handleEdit = (service) => router.push(`/admin/services/edit/${service._id}`);

  /* Toggle active */
  const handleToggle = async (service) => {
    try {
      const res = await servicesApi.toggle(service._id);
      pushToast(res.message || "Status updated");
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (err) {
      pushToast(err.message || "Toggle failed", "error");
    }
  };

  /* Delete */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await servicesApi.remove(deleteTarget._id, deleteMode === "hard");
      pushToast(deleteMode === "hard" ? "Service permanently deleted" : "Service removed from public");
      setDeleteTarget(null);
      await fetchServices();
    } catch (err) {
      pushToast(err.message || "Delete failed", "error");
    }
  };

  /* Stats */
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive).length;
    const inactive = total - active;
    const avgPrice = total
      ? Math.round(services.reduce((sum, s) => sum + (s.price || 0), 0) / total)
      : 0;
    return { total, active, inactive, avgPrice };
  }, [services]);

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total Services", value: stats.total, icon: Sparkles },
          { label: "Active", value: stats.active, icon: Eye },
          { label: "Inactive", value: stats.inactive, icon: EyeOff },
          { label: "Avg. Price", value: `₹${stats.avgPrice.toLocaleString()}`, icon: Sparkles },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
              className="bg-[#121310] border border-white/5 p-4 md:p-5 rounded-xl"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">{s.label}</span>
                <Icon size={14} className="text-[#C9944A]" />
              </div>
              <div className="font-serif text-2xl md:text-3xl text-white font-light">{s.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* TOOLBAR */}
      <div className="bg-[#121310] border border-white/5 rounded-2xl p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="w-full bg-[#0A0B09] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9944A] transition-colors min-w-[140px]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9944A] transition-colors min-w-[120px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white outline-none focus:border-[#C9944A] transition-colors min-w-[130px]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="titleAsc">A → Z</option>
            <option value="priceAsc">Price ↑</option>
            <option value="priceDesc">Price ↓</option>
            <option value="ratingDesc">Top Rated</option>
          </select>

          <button
            onClick={fetchServices}
            className="w-10 h-10 shrink-0 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-[#C9944A] text-[#080906] px-5 py-2.5 rounded-lg text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors shrink-0"
          >
            <Plus size={14} /> Add Service
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button onClick={fetchServices} className="text-red-300 hover:text-red-200 text-xs underline">
            Retry
          </button>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#121310] border border-white/5 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-[#121310] border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles size={26} className="text-white/30" />
          </div>
          <h3 className="font-serif text-2xl text-white/70 font-light mb-2">
            {search || categoryFilter || statusFilter !== "all" ? "No services match your filters" : "No services yet"}
          </h3>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-6">
            {search || categoryFilter || statusFilter !== "all"
              ? "Try clearing filters or searching for something else."
              : "Add your first ritual and start building your catalog."}
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-[#C9944A] text-[#080906] px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors"
          >
            <Plus size={14} /> Add First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {services.map((service, i) => (
              <ServiceCard
                key={service._id}
                service={service}
                index={i}
                onEdit={() => handleEdit(service)}
                onDelete={() => { setDeleteTarget(service); setDeleteMode("soft"); }}
                onToggle={() => handleToggle(service)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* DELETE CONFIRM */}
      <DeleteConfirm
        target={deleteTarget}
        mode={deleteMode}
        setMode={setDeleteMode}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* TOASTS */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-2xl ${
                t.type === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-200"
                  : "bg-[#C9944A]/10 border-[#C9944A]/40 text-[#E3D9C9]"
              }`}
            >
              {t.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} className="text-[#C9944A]" />}
              <span className="text-xs font-medium flex-1">{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="opacity-60 hover:opacity-100"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* SERVICE CARD */
function ServiceCard({ service, index, onEdit, onDelete, onToggle }) {
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    setImgErr(false);
  }, [service.heroImage]);

  const imgSrc = resolveImageUrl(service.heroImage);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: easeOut }}
      className={`group relative bg-[#121310] border rounded-2xl overflow-hidden transition-colors ${
        service.isActive
          ? "border-white/10 hover:border-[#C9944A]/40"
          : "border-white/5 opacity-70 hover:opacity-90"
      }`}
    >
      <div className="relative h-40 bg-[#0A0B09] overflow-hidden">
        {imgSrc && !imgErr ? (
          <img
            src={imgSrc}
            alt={service.title}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={28} className="text-white/20" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#080906]/80 backdrop-blur-md border border-white/15 text-[8px] uppercase tracking-[0.2em] text-[#C9944A] font-bold">
            {service.category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full backdrop-blur-md text-[8px] uppercase tracking-[0.2em] font-bold border ${
              service.isActive
                ? "bg-green-500/20 border-green-500/40 text-green-300"
                : "bg-white/10 border-white/20 text-white/60"
            }`}
          >
            {service.isActive ? "Active" : "Hidden"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg text-white font-light leading-tight truncate">
              {service.title}
            </h3>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-0.5 truncate">
              /{service.slug}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[#C9944A] font-serif text-lg leading-none">
              ₹{service.price?.toLocaleString()}
            </div>
            <div className="text-white/40 text-[9px] uppercase tracking-wider mt-1">
              {service.duration}
            </div>
          </div>
        </div>

        <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-4">
          {service.tagline || service.intro}
        </p>

        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/70 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-[#C9944A] hover:text-[#080906] hover:border-[#C9944A] transition-colors"
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={onToggle}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[9px] uppercase tracking-[0.2em] font-bold transition-colors ${
              service.isActive
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
            }`}
          >
            <Power size={11} /> {service.isActive ? "Hide" : "Show"}
          </button>
          <a
            href={`/services/${service.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 text-white/50 hover:text-[#C9944A] hover:border-[#C9944A]/40 transition-colors"
            title="View public page"
          >
            <ExternalLink size={12} />
          </a>
          <button
            onClick={onDelete}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/5 border border-red-500/20 text-red-400/70 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* DELETE CONFIRM */
function DeleteConfirm({ target, mode, setMode, onCancel, onConfirm }) {
  if (!target) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] bg-[#080906]/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#121310] border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="font-serif text-2xl text-white font-light mb-2">
              Delete "{target.title}"?
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Choose how you want to remove this service.
            </p>

            <div className="space-y-2 mb-6">
              <button
                onClick={() => setMode("soft")}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  mode === "soft"
                    ? "bg-[#C9944A]/10 border-[#C9944A]/40"
                    : "bg-[#0A0B09] border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <EyeOff size={13} className="text-[#C9944A]" />
                  <span className="text-sm text-white font-medium">Hide from public</span>
                </div>
                <p className="text-[11px] text-white/40 pl-5">
                  Service becomes inactive. Data preserved.
                </p>
              </button>

              <button
                onClick={() => setMode("hard")}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  mode === "hard"
                    ? "bg-red-500/10 border-red-500/40"
                    : "bg-[#0A0B09] border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Trash2 size={13} className="text-red-400" />
                  <span className="text-sm text-white font-medium">Permanently delete</span>
                </div>
                <p className="text-[11px] text-white/40 pl-5">
                  Cannot be undone. All data erased.
                </p>
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 p-4 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold transition-colors ${
                mode === "hard"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[#C9944A] text-[#080906] hover:bg-[#E3D9C9]"
              }`}
            >
              {mode === "hard" ? "Delete Forever" : "Hide Service"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}