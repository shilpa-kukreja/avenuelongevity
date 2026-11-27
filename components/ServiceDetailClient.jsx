"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Users,
  ShieldCheck,
  Sparkles,
  Droplets,
  Flame,
  Heart,
  Leaf,
  Star,
  Check,
  ChevronDown,
  CalendarDays,
  ArrowUpRight,
  Snowflake,
  Zap,
  Waves,
  Bone,
  Brain,
  MapPin,
  Moon,
  Camera,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

const ICON_MAP = {
  Flame,
  Heart,
  Droplets,
  Moon,
  Snowflake,
  Zap,
  Waves,
  Bone,
  Brain,
  Leaf,
  Sparkles,
  ShieldCheck,
  Users,
  Clock,
};

function resolveMediaUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  return `${API_ORIGIN}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function resolveBenefitIcon(iconName) {
  if (!iconName) return Sparkles;
  if (typeof iconName === "function") return iconName;
  return ICON_MAP[iconName] || Sparkles;
}

function normalizeServiceDoc(doc, allServices = []) {
  if (!doc || typeof doc !== "object") return null;

  const rawPrice = Number(doc.price);
  const price = Number.isFinite(rawPrice) ? rawPrice : 0;

  const rawRating = Number(doc.rating);
  const rating = Number.isFinite(rawRating) ? rawRating : 5;

  const rawReviewsCount = Number(doc.reviewsCount ?? doc.reviews);
  const reviewsCount = Number.isFinite(rawReviewsCount)
    ? rawReviewsCount
    : Array.isArray(doc.reviews_list)
    ? doc.reviews_list.length
    : 0;

  const overview = Array.isArray(doc.overview)
    ? doc.overview.filter(Boolean)
    : doc.overview
    ? [String(doc.overview)]
    : [];

  const included = Array.isArray(doc.included) ? doc.included.filter(Boolean) : [];

  const gallery = Array.isArray(doc.gallery)
    ? doc.gallery.map(resolveMediaUrl).filter(Boolean)
    : [];

  const benefits = Array.isArray(doc.benefits)
    ? doc.benefits.map((b) => ({
        id: b?._id || b?.id || b?.title,
        icon: resolveBenefitIcon(b?.icon),
        title: b?.title || "",
        desc: b?.desc || b?.description || "",
      }))
    : [];

  const process = Array.isArray(doc.process)
    ? doc.process.map((p) => ({
        id: p?._id || p?.id || p?.title,
        title: p?.title || "",
        desc: p?.desc || p?.description || "",
      }))
    : [];

  const reviews_list = Array.isArray(doc.reviews_list)
    ? doc.reviews_list.map((r) => ({
        id: r?._id || r?.id || r?.name,
        name: r?.name || "Guest",
        rating: Number.isFinite(Number(r?.rating)) ? Number(r.rating) : 5,
        text: r?.text || r?.comment || "",
      }))
    : [];

  const faqs = Array.isArray(doc.faqs)
    ? doc.faqs.map((f) => ({
        id: f?._id || f?.id || f?.q,
        q: f?.q || f?.question || "",
        a: f?.a || f?.answer || "",
      }))
    : [];

  const relatedSlugs = Array.isArray(doc.related)
    ? doc.related.filter(Boolean)
    : [];

  const related = relatedSlugs
    .map((relSlug) => {
      const matched = allServices.find(
        (s) => s.slug === relSlug || s._id === relSlug
      );
      if (matched) {
        return {
          slug: matched.slug || relSlug,
          title: matched.title || relSlug,
          shortTitle: matched.shortTitle || matched.title || relSlug,
          category: matched.category || "Wellness",
          duration: matched.duration || "",
          price: Number.isFinite(Number(matched.price))
            ? Number(matched.price)
            : 0,
          heroImage: resolveMediaUrl(matched.heroImage || matched.image),
        };
      }
      return null;
    })
    .filter(Boolean);

  return {
    id: doc._id || doc.id || doc.slug,
    slug: doc.slug || "",
    title: doc.title || doc.shortTitle || "",
    shortTitle: doc.shortTitle || doc.title || "",
    category: doc.category || "Wellness",
    tagline: doc.tagline || "",
    duration: doc.duration || "",
    price,
    capacity: doc.capacity || "",
    rating,
    reviews: reviewsCount,
    heroImage: resolveMediaUrl(doc.heroImage || doc.image),
    intro: doc.intro || "",
    overview,
    included,
    benefits,
    gallery,
    process,
    reviews_list,
    faqs,
    related,
  };
}

function SmartImage({ src, alt, className, ...props }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
  }, [src]);

  if (!src || hidden) return null;

  return (
    <img
      src={src}
      alt={alt || ""}
      onError={() => setHidden(true)}
      className={className}
      {...props}
    />
  );
}

export default function ServiceDetailClient({ slug }) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServiceDetail = useCallback(async () => {
    if (!slug) {
      setError("Missing service slug.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const allRes = await fetch(`${API_BASE}/services?limit=100`);
      const allJson = await allRes.json().catch(() => ({}));
      if (!allRes.ok) {
        throw new Error(
          allJson?.message || `Failed to load services (${allRes.status})`
        );
      }

      const allServices = Array.isArray(allJson)
        ? allJson
        : allJson?.data || allJson?.services || [];

      let rawDoc = allServices.find(
        (item) => item?.slug === slug || item?._id === slug
      );

      if (!rawDoc) {
        const singleRes = await fetch(
          `${API_BASE}/services/${encodeURIComponent(slug)}`
        );
        const singleJson = await singleRes.json().catch(() => ({}));
        if (!singleRes.ok) {
          throw new Error(
            singleJson?.message || `Service "${slug}" not found`
          );
        }
        rawDoc = singleJson?.data || singleJson?.service || singleJson;
      }

      const normalized = normalizeServiceDoc(rawDoc, allServices);
      if (!normalized) {
        throw new Error("Invalid service document received from backend.");
      }

      setService(normalized);
    } catch (err) {
      setService(null);
      setError(err?.message || "Failed to load service details from backend.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchServiceDetail();
  }, [fetchServiceDetail]);

  if (loading) {
    return (
      <div className="bg-[#080906] min-h-screen flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={28} className="text-[#C9944A] animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
            Loading ritual details…
          </p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="bg-[#080906] min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <h1 className="font-serif text-2xl text-white font-light mb-2">
            Unable to load service
          </h1>
          <p className="text-red-200/80 text-xs mb-6">
            {error || "Service not found in backend."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/services"
              className="px-6 py-3 rounded-full border border-white/15 text-white/70 hover:text-white text-[10px] uppercase tracking-[0.25em] transition-colors"
            >
              All Services
            </Link>
            <button
              type="button"
              onClick={fetchServiceDetail}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#080906] min-h-screen">
      <Hero service={service} />
      <StickyNav service={service} />
      <Overview service={service} />
      {service.benefits.length > 0 && <Benefits service={service} />}
      {service.gallery.length > 0 && <Gallery service={service} />}
      {service.process.length > 0 && <Process service={service} />}
      {service.reviews_list.length > 0 && <Reviews service={service} />}
      {service.faqs.length > 0 && <FAQs service={service} />}
      {service.related.length > 0 && <Related service={service} />}
      <FinalCTA service={service} />
      <MobileBar service={service} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   1. HERO
═══════════════════════════════════════════ */
function Hero({ service }) {
  const starCount = Math.max(0, Math.min(5, Math.floor(Number(service.rating) || 0)));

  return (
    <section className="relative w-full bg-[#080906] overflow-hidden pt-24 md:pt-28 lg:pt-40">
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none z-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[80vh]">
        {/* CONTENT */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 py-16 lg:py-24 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="flex items-center gap-2 mb-8 text-[10px] tracking-[0.3em] uppercase flex-wrap"
          >
            <Link
              href="/"
              className="text-white/40 hover:text-[#C9944A] transition-colors"
            >
              Home
            </Link>
            <span className="w-3 h-[1px] bg-white/20" />
            <Link
              href="/services"
              className="text-white/40 hover:text-[#C9944A] transition-colors"
            >
              Services
            </Link>
            <span className="w-3 h-[1px] bg-white/20" />
            <span className="text-[#C9944A]">{service.category}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: easeOut }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="w-8 h-[1px] bg-[#C9944A]" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
              {service.category}
            </span>
          </motion.div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[5rem] text-white font-light leading-[0.92] tracking-tight mb-6">
            <span className="block overflow-hidden">
              {service.title.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 1,
                    delay: 0.4 + i * 0.03,
                    ease: easeOut,
                  }}
                  className="inline-block"
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </span>
          </h1>

          {service.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1, ease: easeOut }}
              className="font-serif italic text-xl md:text-2xl text-[#E3D9C9] font-light mb-8"
            >
              &ldquo;{service.tagline}&rdquo;
            </motion.p>
          )}

          {service.intro && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2, ease: easeOut }}
              className="text-white/55 text-sm md:text-base leading-relaxed mb-10 max-w-md"
            >
              {service.intro}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4, ease: easeOut }}
            className="grid grid-cols-3 gap-6 mb-10 pb-10 border-b border-white/10"
          >
            <Stat icon={Clock} label="Duration" value={service.duration || "—"} />
            <Stat icon={Users} label="Capacity" value={service.capacity || "—"} />
            <Stat
              icon={Star}
              label="Rating"
              value={`${service.rating} (${service.reviews})`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6, ease: easeOut }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href={`/book?service=${encodeURIComponent(service.title)}`}
              className="group relative px-8 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] tracking-[0.3em] uppercase font-semibold overflow-hidden shadow-[0_0_40px_rgba(201,148,74,0.35)] hover:shadow-[0_0_60px_rgba(201,148,74,0.55)] transition-shadow duration-500"
            >
              <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Book Now · ₹{service.price.toLocaleString("en-IN")}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </span>
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 rounded-full border border-white/20 text-[#E3D9C9] text-[11px] tracking-[0.3em] uppercase hover:border-[#C9944A]/70 transition-colors duration-500 text-center"
            >
              All Rituals
            </Link>
          </motion.div>
        </div>

        {/* IMAGE */}
        <div className="lg:col-span-6 xl:col-span-7 relative h-[55vh] lg:h-auto overflow-hidden">
          <motion.div
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: easeOut }}
            className="absolute inset-0"
          >
            <SmartImage
              src={service.heroImage}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080906] lg:hidden" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.7, ease: easeOut }}
            className="absolute bottom-8 left-8 z-20 backdrop-blur-xl bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 hidden sm:flex items-center gap-3"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < starCount
                      ? "fill-[#C9944A] text-[#C9944A]"
                      : "text-white/30"
                  }
                />
              ))}
            </div>
            <span className="text-white text-xs font-mono">{service.rating}</span>
            <span className="text-white/50 text-[10px]">
              · {service.reviews} reviews
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[#C9944A] mb-2">
        <Icon size={11} />
        <span className="text-[9px] uppercase tracking-[0.25em] font-semibold">
          {label}
        </span>
      </div>
      <div className="text-white text-sm md:text-base font-light">{value}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. STICKY MINI-NAV (appears on scroll)
═══════════════════════════════════════════ */
function StickyNav({ service }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handle = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="hidden lg:block fixed top-[72px] left-0 right-0 z-30 bg-[#080906]/95 backdrop-blur-xl border-b border-white/10"
        >
          <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16 pt-[50px] flex items-center justify-between py-3">
            <div className="flex items-center gap-4 min-w-0">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#C9944A] font-semibold shrink-0">
                {service.category}
              </span>
              <span className="w-4 h-[1px] bg-white/20 shrink-0" />
              <span className="font-serif text-lg text-white font-light truncate">
                {service.title}
              </span>
              <span className="text-white/40 text-xs shrink-0 hidden xl:inline">
                {service.duration ? `· ${service.duration} ` : ""}· ₹
                {service.price.toLocaleString("en-IN")}
              </span>
            </div>
            <Link
              href={`/book?service=${encodeURIComponent(service.title)}`}
              className="group flex items-center gap-2 px-5 py-2 rounded-full bg-[#C9944A] text-[#080906] text-[10px] tracking-[0.25em] uppercase font-bold hover:bg-[#E3D9C9] transition-colors shrink-0"
            >
              Book
              <ArrowRight
                size={12}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════
   3. OVERVIEW + STICKY BOOKING
═══════════════════════════════════════════ */
function Overview({ service }) {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: easeOut }}
              className="flex items-center gap-3 mb-6"
            >
              <Sparkles size={14} className="text-[#C9944A]" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
                The Experience
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: easeOut }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.05] mb-8"
            >
              More than a session —{" "}
              <span className="italic text-[#E3D9C9]">a reset.</span>
            </motion.h2>

            {service.overview.length > 0 && (
              <div className="space-y-5 mb-12">
                {service.overview.map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: i * 0.1, ease: easeOut }}
                    className="text-white/55 text-sm md:text-base leading-[1.8]"
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
            )}

            {service.included.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: easeOut }}
              >
                <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-6 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-[#C9944A]" />
                  What&apos;s Included
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.included.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.06,
                        ease: easeOut,
                      }}
                      className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#C9944A]/15 border border-[#C9944A]/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check
                          size={11}
                          className="text-[#C9944A]"
                          strokeWidth={3}
                        />
                      </div>
                      <span className="text-white/75 text-sm leading-relaxed">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-32">
              <BookingCard service={service} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingCard({ service }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: easeOut }}
      className="relative rounded-2xl overflow-hidden border border-[#C9944A]/25 bg-gradient-to-br from-[#121310] to-[#0F100D]"
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-[#C9944A] via-[#E3D9C9]/70 to-transparent" />

      <div className="p-7 md:p-8">
        <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/10">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-2">
              Starting from
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-4xl md:text-5xl text-white font-light leading-none">
                ₹{service.price.toLocaleString("en-IN")}
              </span>
              <span className="text-white/40 text-xs">/ session</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30">
            <Star size={10} className="fill-[#C9944A] text-[#C9944A]" />
            <span className="text-[#C9944A] text-[10px] font-mono">
              {service.rating}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <MetaRow
            icon={Clock}
            label="Duration"
            value={service.duration || "—"}
          />
          <MetaRow
            icon={Users}
            label="Capacity"
            value={service.capacity || "—"}
          />
          <MetaRow
            icon={CalendarDays}
            label="Availability"
            value="7 days · 9 AM – 8 PM"
          />
          <MetaRow
            icon={MapPin}
            label="Location"
            value="Avenue Retreat, Mumbai"
          />
        </div>

        <Link
          href={`/book?service=${encodeURIComponent(service.title)}`}
          className="group relative w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] tracking-[0.3em] uppercase font-bold overflow-hidden shadow-[0_0_30px_rgba(201,148,74,0.3)] hover:shadow-[0_0_50px_rgba(201,148,74,0.5)] transition-shadow duration-500"
        >
          <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
          <span className="relative z-10 flex items-center gap-2">
            Book This Ritual
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </span>
        </Link>

        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-white/40 flex-wrap">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-[#C9944A]" />
            Free cancellation
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1.5">
            <Clock size={11} className="text-[#C9944A]" />
            Instant confirmation
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-white/50 text-xs">
        <Icon size={13} /> {label}
      </span>
      <span className="text-white/90 font-light text-xs text-right">
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   4. BENEFITS
═══════════════════════════════════════════ */
function Benefits({ service }) {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 border-t border-white/5">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="max-w-3xl mb-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="flex items-center gap-3 mb-5"
          >
            <Sparkles size={14} className="text-[#C9944A]" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
              Why It Works
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: easeOut }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.05]"
          >
            The science of{" "}
            <span className="italic text-[#E3D9C9]">stillness.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {service.benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: easeOut }}
                className="group relative p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-[#C9944A]/40 transition-colors duration-500"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9944A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 flex items-center justify-center mb-5 group-hover:bg-[#C9944A]/20 transition-colors duration-500">
                  <Icon
                    size={20}
                    className="text-[#C9944A]"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-serif text-lg text-white font-light mb-2 leading-tight">
                  {b.title}
                </h3>
                <p className="text-white/45 text-xs leading-relaxed">{b.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   5. GALLERY
═══════════════════════════════════════════ */
function Gallery({ service }) {
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: easeOut }}
          >
            <div className="flex items-center gap-3 mb-5">
              <Camera size={14} className="text-[#C9944A]" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
                Inside The Ritual
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.05]">
              A glimpse{" "}
              <span className="italic text-[#E3D9C9]">inside.</span>
            </h2>
          </motion.div>
          <p className="text-white/40 text-xs uppercase tracking-[0.25em]">
            Click to enlarge →
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
          {service.gallery.map((img, i) => {
            const layout =
              i === 0
                ? "md:col-span-7 md:row-span-2 h-[300px] md:h-[520px]"
                : "md:col-span-5 h-[250px] md:h-[252px]";
            return (
              <motion.button
                key={img || i}
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: easeOut }}
                onClick={() => setLightbox(img)}
                className={`relative overflow-hidden rounded-xl group ${layout}`}
              >
                <SmartImage
                  src={img}
                  alt={`${service.title} ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080906]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 text-[#080906] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <ArrowUpRight size={16} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[300] bg-[#080906]/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="relative max-w-full max-h-[90vh]"
            >
              <SmartImage
                src={lightbox}
                alt={service.title}
                className="max-w-full max-h-[90vh] rounded-xl object-contain"
              />
            </motion.div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(null);
              }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              aria-label="Close"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ═══════════════════════════════════════════
   6. PROCESS
═══════════════════════════════════════════ */
function Process({ service }) {
  return (
    <section className="relative w-full bg-[#090909] py-20 md:py-20 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#C8A165]/[0.05] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16 relative z-10">
        <div className="max-w-2xl mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="h-[1px] w-10 bg-[#C8A165]/70" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#C8A165] font-semibold">
              The Ritual
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: easeOut }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#F5F0E8] font-light leading-[1.08]"
          >
            How your session{" "}
            <span className="italic text-[#C8A165]">unfolds.</span>
          </motion.h2>

          <p className="text-[#F5F0E8]/45 text-sm md:text-base mt-6 leading-relaxed max-w-lg">
            Every detail is thoughtfully curated to create a seamless experience
            of relaxation, renewal and restoration.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#C8A165]/40 to-transparent z-0" />

          {service.process.map((p, i) => (
            <motion.div
              key={p.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.12,
                ease: easeOut,
              }}
              className="relative z-10 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#C8A165]/30 flex items-center justify-center mb-7 shadow-[0_4px_25px_rgba(200,161,101,0.06)] group-hover:border-[#C8A165] group-hover:bg-[#C8A165]/10 transition-all duration-500">
                <span className="font-serif italic text-2xl text-[#C8A165] font-light">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="font-serif text-2xl md:text-[26px] text-[#F5F0E8] font-light mb-3 group-hover:text-[#C8A165] transition-colors duration-500">
                {p.title}
              </h3>

              <p className="text-[#F5F0E8]/50 text-sm leading-[1.9] max-w-xs font-light">
                {p.desc}
              </p>

              <div className="mt-7 w-8 h-[1px] bg-[#C8A165]/40 group-hover:w-16 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   7. REVIEWS
═══════════════════════════════════════════ */
function Reviews({ service }) {
  const starCount = Math.max(0, Math.min(5, Math.floor(Number(service.rating) || 0)));

  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 border-t border-white/5">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: easeOut }}
              className="flex items-center gap-3 mb-5"
            >
              <Star size={14} className="text-[#C9944A] fill-[#C9944A]" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
                Guest Voices
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: easeOut }}
              className="font-serif text-4xl md:text-5xl text-white font-light leading-[1.05]"
            >
              What guests <span className="italic text-[#E3D9C9]">say.</span>
            </motion.h2>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < starCount
                      ? "fill-[#C9944A] text-[#C9944A]"
                      : "text-white/20"
                  }
                />
              ))}
            </div>
            <span className="text-white text-sm font-semibold">
              {service.rating}
            </span>
            <span className="text-white/40 text-xs">
              · {service.reviews} reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {service.reviews_list.map((rev, i) => (
            <motion.div
              key={rev.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: easeOut }}
              className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <Star
                    key={s}
                    size={11}
                    className={
                      s < rev.rating
                        ? "fill-[#C9944A] text-[#C9944A]"
                        : "text-white/20"
                    }
                  />
                ))}
              </div>
              <p className="text-white/75 text-sm leading-relaxed mb-5">
                &ldquo;{rev.text}&rdquo;
              </p>
              <div className="flex items-center gap-2.5 pt-4 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-[#C9944A]/15 border border-[#C9944A]/30 flex items-center justify-center">
                  <span className="text-[#C9944A] text-xs font-semibold">
                    {rev.name?.[0] || "G"}
                  </span>
                </div>
                <span className="text-white/70 text-xs">{rev.name}</span>
                <span className="text-white/30 text-[10px] ml-auto">
                  Verified
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   8. FAQs
═══════════════════════════════════════════ */
function FAQs({ service }) {
  const [open, setOpen] = useState(0);

  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: easeOut }}
              className="flex items-center gap-3 mb-5"
            >
              <Sparkles size={14} className="text-[#C9944A]" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
                Good to Know
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: easeOut }}
              className="font-serif text-4xl md:text-5xl text-white font-light leading-[1.05] mb-6"
            >
              Common{" "}
              <span className="italic text-[#E3D9C9]">questions.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2, ease: easeOut }}
              className="text-white/50 text-sm leading-relaxed mb-6"
            >
              Everything you might want to know before your session. Still unsure?
              Our concierge is one message away.
            </motion.p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#C9944A] hover:text-[#E3D9C9] transition-colors group"
            >
              Talk to concierge
              <ArrowUpRight
                size={12}
                className="group-hover:rotate-45 transition-transform"
              />
            </Link>
          </div>

          <div className="lg:col-span-8">
            <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
              {service.faqs.map((faq, i) => {
                const isOpen = open === i;
                return (
                  <motion.div
                    key={faq.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.08,
                      ease: easeOut,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="w-full flex items-center justify-between gap-4 py-6 text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`text-[10px] font-mono tracking-widest mt-1 transition-colors duration-300 ${
                            isOpen
                              ? "text-[#C9944A]"
                              : "text-white/30 group-hover:text-[#C9944A]"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3
                          className={`font-serif text-lg md:text-xl font-light transition-colors duration-300 ${
                            isOpen
                              ? "text-[#E3D9C9]"
                              : "text-white group-hover:text-[#E3D9C9]"
                          }`}
                        >
                          {faq.q}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          isOpen
                            ? "border-[#C9944A] bg-[#C9944A]/10 text-[#C9944A]"
                            : "border-white/20 text-white/50 group-hover:border-[#C9944A]/50"
                        }`}
                      >
                        <ChevronDown size={14} />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: easeOut }}
                          className="overflow-hidden"
                        >
                          <p className="text-white/55 text-sm leading-relaxed pl-9 pr-12 pb-6">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   9. RELATED
═══════════════════════════════════════════ */
function Related({ service }) {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 border-t border-white/5">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: easeOut }}
              className="flex items-center gap-3 mb-5"
            >
              <Sparkles size={14} className="text-[#C9944A]" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
                Continue Your Journey
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: easeOut }}
              className="font-serif text-4xl md:text-5xl text-white font-light leading-[1.05]"
            >
              You may also <span className="italic text-[#E3D9C9]">like.</span>
            </motion.h2>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#C9944A] hover:text-[#E3D9C9] transition-colors"
          >
            View all rituals
            <span className="w-8 h-8 rounded-full border border-[#C9944A]/40 flex items-center justify-center group-hover:bg-[#C9944A] group-hover:text-[#080906] transition-all duration-300">
              <ArrowUpRight size={12} />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {service.related.map((r, i) => (
            <motion.div
              key={r.slug || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: easeOut }}
            >
              <Link
                href={`/services/${r.slug}`}
                className="group block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#C9944A]/40 transition-colors duration-500"
              >
                <div className="relative h-[260px] md:h-[300px] overflow-hidden bg-[#121310]">
                  <SmartImage
                    src={r.heroImage}
                    alt={r.title}
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-[#080906]/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-[#C9944A] font-bold">
                      {r.category}
                    </span>
                    {r.duration && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[#C9944A]" />
                        <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">
                          {r.duration}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <h3 className="font-serif text-2xl text-white font-light leading-tight">
                      {r.shortTitle}
                    </h3>
                    <span className="text-white/80 font-serif text-lg shrink-0">
                      ₹{r.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   10. FINAL CTA
═══════════════════════════════════════════ */
function FinalCTA({ service }) {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#C9944A]/10 blur-[140px] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 xl:px-16 relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1, ease: easeOut }}
          className="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-light leading-[0.95] mb-6"
        >
          Step into the{" "}
          <span className="italic bg-gradient-to-r from-[#E3D9C9] via-[#C9944A] to-[#E3D9C9] bg-clip-text text-transparent">
            ritual.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.25, ease: easeOut }}
          className="text-white/50 text-base max-w-md mx-auto leading-relaxed mb-10"
        >
          Book your {service.shortTitle.toLowerCase()} session today. Instant
          confirmation, free cancellation, and a ritual that&apos;s all yours.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.35, ease: easeOut }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href={`/book?service=${encodeURIComponent(service.title)}`}
            className="group relative px-10 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] tracking-[0.3em] uppercase font-bold overflow-hidden transition-shadow duration-500"
          >
            <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <span className="relative z-10 flex items-center gap-2">
              Book Now · ₹{service.price.toLocaleString("en-IN")}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </Link>
          <Link
            href="/services"
            className="px-10 py-4 rounded-full border border-white/20 text-[#E3D9C9] text-[11px] tracking-[0.3em] uppercase hover:border-[#C9944A]/70 transition-colors duration-500"
          >
            Back to All Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   11. MOBILE BAR
═══════════════════════════════════════════ */
function MobileBar({ service }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#080906]/95 backdrop-blur-xl px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 truncate">
            {service.shortTitle}
          </p>
          <p className="text-white font-serif text-xl leading-tight">
            ₹{service.price.toLocaleString("en-IN")}
          </p>
        </div>
        <Link
          href={`/book?service=${encodeURIComponent(service.title)}`}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold shrink-0"
        >
          Book Now
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}