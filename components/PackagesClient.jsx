"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Check, Sparkles, Star, ChevronDown, Crown,
  Shield, ArrowUpRight, ShoppingBag, Quote, Infinity as InfinityIcon,
  CheckCircle2, Loader2
} from "lucide-react";
import { useCart } from "../app/contexts/CartContext";

const easeOut = [0.22, 1, 0.36, 1];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const formatUSD = (value) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

const getIcon = (name = "") => {
  const lower = String(name).toLowerCase();
  if (lower.includes("essential")) return Shield;
  if (lower.includes("signature")) return Crown;
  return InfinityIcon;
};

const getPackageMeta = (name = "", sessions = 0, validity = "") => {
  const lower = String(name).toLowerCase();
  if (lower.includes("starter")) {
    return {
      popular: false,
      tagline: "Dip your toe into the ritual.",
      perks: [
        `${sessions} sessions of your choice`,
        `Valid for ${validity}`,
        "Share across any ritual",
        "Complimentary shower + water",
      ],
    };
  }
  if (lower.includes("ritual")) {
    return {
      popular: true,
      tagline: "Your weekly reset.",
      perks: [
        `${sessions} sessions of your choice`,
        `Valid for ${validity}`,
        "Priority booking",
        "Free guest pass",
        "All showers + hydration",
      ],
    };
  }
  return {
    popular: false,
    tagline: "Deep commitment, deep savings.",
    perks: [
      `${sessions} sessions of your choice`,
      `Valid for ${validity}`,
      "Priority booking + concierge",
      "3 guest passes",
      "All showers + hydration",
      "Complimentary robe service",
    ],
  };
};

const getMembershipMeta = (name = "") => {
  const lower = String(name).toLowerCase();
  if (lower.includes("essential")) {
    return {
      popular: false,
      tagline: "The foundation of your practice.",
      sessions: "4 sessions / month",
    };
  }
  if (lower.includes("signature")) {
    return {
      popular: true,
      tagline: "Our most-loved membership.",
      sessions: "10 sessions / month",
    };
  }
  return {
    popular: false,
    tagline: "For the deeply devoted.",
    sessions: "Unlimited sessions",
  };
};

const comparison = [
  { feature: "Sessions per month",        essential: "4",          signature: "10",         sanctuary: "Unlimited" },
  { feature: "Priority booking window",   essential: "30 days",    signature: "7 days",     sanctuary: "Instant" },
  { feature: "Discount on additional",    essential: "10%",        signature: "15%",        sanctuary: "20%" },
  { feature: "Guest passes",              essential: false,        signature: "2 / quarter", sanctuary: "4 / quarter" },
  { feature: "Complimentary massage",     essential: false,        signature: "1 / month",  sanctuary: "1 / month (90 min)" },
  { feature: "Dedicated concierge",       essential: false,        signature: "WhatsApp",   sanctuary: "Personal" },
  { feature: "Member-only packages",      essential: true,         signature: true,         sanctuary: true },
  { feature: "Free robe + towel service", essential: true,         signature: true,         sanctuary: true },
];

const testimonials = [
  { name: "Aditi R.", role: "Signature member", rating: 5, text: "I've been a member for 8 months. The ritual is now non-negotiable — it's the one hour a week that's truly mine." },
  { name: "Karan M.", role: "Ritual package",   rating: 5, text: "The 10-session bundle saved me 15% and let me try everything. Worth every dollar — I've already rebooked." },
  { name: "Priya S.", role: "Sanctuary member", rating: 5, text: "Unlimited access changed how I live. I come 3-4 times a week. The concierge remembers my preferences. Truly premium." },
];

const faqs = [
  { q: "Can I switch or upgrade my membership?",       a: "Yes — anytime. Changes take effect at your next billing cycle. Upgrades are prorated instantly." },
  { q: "How long is the commitment?",                  a: "Monthly plans are rolling — cancel anytime. Yearly plans commit you for 12 months at the discounted rate." },
  { q: "Do guest passes roll over?",                   a: "No. Guest passes reset quarterly. Unused monthly sessions also don't roll over." },
  { q: "Can I share my package with a partner?",       a: "Yes. Packages are shareable with anyone in your household. Memberships are personal but guest passes can be gifted." },
  { q: "What happens if I don't use all my sessions?", a: "Unused monthly sessions expire. Unused package sessions stay valid for their full duration (3–12 months)." },
];

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function PackagesClient() {
  const [billing, setBilling] = useState("monthly");
  const { addToCart, cartCount, cartTotal, openCart } = useCart();

  const [packages, setPackages] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [pkgRes, memRes] = await Promise.all([
          axios.get(`${API_URL}/packages`),
          axios.get(`${API_URL}/memberships`),
        ]);

        if (!active) return;

        const rawPackages = Array.isArray(pkgRes.data)
          ? pkgRes.data
          : pkgRes.data?.packages || pkgRes.data?.data || [];

        const rawMemberships = Array.isArray(memRes.data)
          ? memRes.data
          : memRes.data?.memberships || memRes.data?.plans || memRes.data?.data || [];

        const formattedPackages = rawPackages.map((p) => {
          const price = Number(p.price || 0);
          const originalPrice = Number(p.originalPrice || 0);
          const sessions = Number(p.sessions || 0);
          const save =
            originalPrice > 0 && originalPrice > price
              ? Math.round(((originalPrice - price) / originalPrice) * 100)
              : 0;
          const meta = getPackageMeta(p.name, sessions, p.validity || "90 days");

          return {
            ...p,
            id: p._id || p.id,
            price,
            originalPrice,
            sessions,
            save,
            popular: meta.popular,
            tagline: meta.tagline,
            perks: meta.perks,
          };
        });

        const formattedMemberships = rawMemberships.map((m) => {
          const monthlyPrice = Number(m.monthlyPrice || 0);
          const yearlyPrice = Number(m.yearlyPrice || 0);
          const meta = getMembershipMeta(m.name);

          return {
            ...m,
            id: m._id || m.id,
            monthly: monthlyPrice,
            yearly: yearlyPrice,
            popular: meta.popular,
            tagline: meta.tagline,
            sessions: meta.sessions,
            perks: Array.isArray(m.perks) ? m.perks : [],
            icon: getIcon(m.name),
          };
        });

        setPackages(formattedPackages);
        setMemberships(formattedMemberships);
      } catch (error) {
        console.error("Failed to load packages and memberships", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080906] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#C9944A] animate-spin mb-4" />
        <p className="text-[#C9944A] font-serif tracking-widest uppercase">Loading Plans...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#080906] min-h-screen">
      <Hero />
      <StatBar />
      <Packages packages={packages} addToCart={addToCart} />
      <Memberships
        billing={billing}
        setBilling={setBilling}
        memberships={memberships}
        addToCart={addToCart}
      />
      <Comparison />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <MobileBar
        billing={billing}
        memberships={memberships}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onCartClick={openCart}
      />
    </div>
  );
}

/* ═══════════ HERO ═══════════ */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const headline1 = "Commit to".split("");
  const headline2 = "stillness.".split("");

  return (
    <section ref={ref} className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#080906] pt-44 pb-20">
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#C9944A]/12 blur-[180px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none z-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-20 max-w-5xl mx-auto px-6 text-center">
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[5rem] xl:text-[6rem] text-white font-light leading-[0.88] tracking-tight mb-8">
          <span className="block overflow-hidden">
            {headline1.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 + i * 0.035, ease: easeOut }}
                className="inline-block"
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </span>
          <span className="block overflow-hidden mt-2">
            {headline2.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 1, delay: 0.9 + i * 0.04, ease: easeOut }}
                className="inline-block italic bg-gradient-to-r from-[#F5F0E8] via-[#E3D9C9] to-[#C9944A] bg-clip-text text-transparent"
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5, ease: easeOut }}
          className="text-white/55 text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed mb-10"
        >
          Session bundles and monthly memberships for every rhythm of wellness.
          Commit to your ritual, save on every visit.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.7, ease: easeOut }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="#packages"
            className="group relative px-9 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] tracking-[0.3em] uppercase font-bold overflow-hidden  transition-shadow duration-500"
          >
            <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <span className="relative z-10 flex items-center gap-2">
              Explore Packages
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link
            href="#memberships"
            className="px-9 py-4 rounded-full border border-white/20 text-[#E3D9C9] text-[11px] tracking-[0.3em] uppercase hover:border-[#C9944A]/70 transition-colors duration-500"
          >
            See Memberships
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080906] to-transparent z-10" />
    </section>
  );
}

/* ═══════════ STAT BAR ═══════════ */
function StatBar() {
  const stats = [
    { value: "2,000+", label: "Rituals booked" },
    { value: "4.9", label: "Average rating", suffix: "/5" },
    { value: "94%", label: "Members renew" },
  ];

  return (
    <section className="w-full border-y border-white/5 bg-[#080906]">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 min-h-[190px] items-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: easeOut,
              }}
              className={`
                flex flex-col items-center justify-center
                text-center py-8 sm:py-0
                ${i !== 0
                  ? "sm:border-l sm:border-white/10"
                  : ""}
                ${i !== 0
                  ? "border-t border-white/10 sm:border-t-0"
                  : ""}
              `}
            >
              <div className="flex items-baseline justify-center">
                <span className="font-serif text-4xl md:text-5xl xl:text-[56px] font-light text-[#E3D9C9] leading-none">
                  {s.value}
                </span>

                {s.suffix && (
                  <span className="font-serif text-xl md:text-2xl text-white/30 ml-1">
                    {s.suffix}
                  </span>
                )}
              </div>

              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/40 mt-3">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════ PACKAGES ═══════════ */
function Packages({ packages, addToCart }) {
  return (
    <section id="packages" className="relative w-full bg-[#080906] py-20 md:py-20 scroll-mt-20">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <Sparkles size={14} className="text-[#C9944A]" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
              Session Bundles
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: easeOut }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-light leading-[1.02] mb-6"
          >
            Buy sessions.{" "}
            <span className="italic text-[#E3D9C9]">Save on every one.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: easeOut }}
            className="text-white/50 text-sm md:text-base leading-relaxed"
          >
            Buy a bundle of sessions upfront and use them across any ritual — sauna, cold plunge,
            massage, hammam and more. The more you commit, the more you save.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {packages.map((p, i) => (
            <PackageCard key={p.id} pkg={p} index={i} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg, index, addToCart }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      id: pkg.id,
      type: "package",
      name: `${pkg.name} Package`,
      price: pkg.price,
      sessions: pkg.sessions,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const perSession = pkg.sessions > 0 ? pkg.price / pkg.sessions : pkg.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: easeOut }}
      className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 ${
        pkg.popular
          ? "border-2 border-[#C9944A]/60 bg-gradient-to-b from-[#1A1508] via-[#121310] to-[#0F100D] shadow-[0_0_60px_rgba(201,148,74,0.15)] md:-translate-y-3"
          : "border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-white/20"
      }`}
    >
      {pkg.popular && (
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <div className="bg-[#C9944A] text-[#080906] px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] font-bold rounded-b-lg flex items-center gap-1.5">
            <Star size={10} className="fill-[#080906]" />
            Most Popular
          </div>
        </div>
      )}

      <div className={`p-7 md:p-8 ${pkg.popular ? "pt-12" : ""}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-[#C9944A] font-bold mb-2">
              {pkg.sessions} Sessions
            </div>
            <h3 className="font-serif text-3xl md:text-4xl text-white font-light leading-tight">
              {pkg.name}
            </h3>
            <p className="text-white/40 text-xs mt-1">{pkg.tagline}</p>
          </div>
          {pkg.save > 0 && (
            <div className="shrink-0">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                <span className="text-green-400 text-[10px] font-bold">SAVE {pkg.save}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 pb-6 border-b border-white/10">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-serif text-4xl md:text-5xl text-white font-light leading-none">
              {formatUSD(pkg.price)}
            </span>
            {pkg.originalPrice > 0 && (
              <span className="text-white/30 line-through text-sm">
                {formatUSD(pkg.originalPrice)}
              </span>
            )}
          </div>
          <div className="text-white/40 text-[10px] uppercase tracking-[0.25em] mt-2">
            {formatUSD(perSession)} / session · valid {pkg.validity}
          </div>
        </div>

        <ul className="space-y-3 mb-7">
          {pkg.perks.map((perk, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-[#C9944A]/20 border border-[#C9944A]/40 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={9} className="text-[#C9944A]" strokeWidth={3.5} />
              </div>
              <span className="text-white/70 text-sm leading-relaxed">{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto p-7 md:p-8 pt-0 space-y-2.5">
        <button
          onClick={handleAdd}
          className={`group relative w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full text-[11px] tracking-[0.3em] uppercase font-bold overflow-hidden transition-all duration-500 ${
            pkg.popular
              ? "bg-[#C9944A] text-[#080906] "
              : "border border-white/20 text-white hover:border-[#C9944A]/60 hover:text-[#C9944A]"
          }`}
        >
          {pkg.popular && (
            <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 size={14} />
                  Added
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag size={14} />
                  Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>
        <Link
          href={`/book?package=${pkg.id}`}
          className="block w-full text-center px-6 py-2.5 text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-[#C9944A] transition-colors"
        >
          Or book directly →
        </Link>
      </div>
    </motion.div>
  );
}

/* ═══════════ MEMBERSHIPS ═══════════ */
function Memberships({ billing, setBilling, memberships, addToCart }) {
  return (
    <section
      id="memberships"
      className="relative w-full bg-gradient-to-b from-[#080906] via-[#0A0B08] to-[#080906] py-20 md:py-20 scroll-mt-20 border-t border-white/5"
    >
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <Crown size={14} className="text-[#C9944A]" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
              Monthly Memberships
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: easeOut }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-light leading-[1.02] mb-6"
          >
            A ritual,{" "}
            <span className="italic text-[#E3D9C9]">on repeat.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: easeOut }}
            className="text-white/50 text-sm md:text-base leading-relaxed"
          >
            Wellness isn't a one-time thing. Memberships give you a standing
            invitation to slow down, recover and return to yourself — every week.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: easeOut }}
          className="flex justify-center mb-14"
        >
          <BillingToggle billing={billing} setBilling={setBilling} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {memberships.map((m, i) => (
            <MembershipCard key={m.id} tier={m} index={i} billing={billing} addToCart={addToCart} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-10 text-white/40 text-xs"
        >
          All memberships include tax · Cancel anytime (monthly) · Yearly saves 2 months
        </motion.div>
      </div>
    </section>
  );
}

function BillingToggle({ billing, setBilling }) {
  return (
    <div className="relative inline-flex items-center p-1 rounded-full border border-white/15 bg-[#121310]">
      {["monthly", "yearly"].map((option) => {
        const active = billing === option;
        return (
          <button
            key={option}
            onClick={() => setBilling(option)}
            className="relative px-6 md:px-8 py-3 text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-bold transition-colors z-10"
          >
            {active && (
              <motion.div
                layoutId="billing-pill"
                className="absolute inset-0 bg-[#C9944A] rounded-full"
                transition={{ duration: 0.4, ease: easeOut }}
              />
            )}
            <span className={`relative flex items-center gap-2 ${active ? "text-[#080906]" : "text-white/60"}`}>
              {option === "monthly" ? "Monthly" : "Yearly"}
              {option === "yearly" && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                  active ? "bg-[#080906]/20 text-[#080906]" : "bg-green-500/20 text-green-400"
                } font-bold`}>
                  SAVE 17%
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MembershipCard({ tier, index, billing, addToCart }) {
  const Icon = tier.icon;
  const price = billing === "monthly" ? tier.monthly : Math.round(tier.yearly / 12);
  const period = billing === "monthly" ? "/ month" : "/ mo · billed yearly";
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      id: tier.id,
      type: "membership",
      name: `${tier.name} Membership`,
      price,
      billing,
      sessions: tier.sessions,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: easeOut }}
      className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 ${
        tier.popular
          ? "border-2 border-[#C9944A]/60 bg-gradient-to-b from-[#1A1508] via-[#121310] to-[#0F100D]  md:-translate-y-3"
          : "border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-white/20"
      }`}
    >
      {tier.popular && (
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <div className="bg-[#C9944A] text-[#080906] px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] font-bold rounded-b-lg flex items-center gap-1.5">
            <Star size={10} className="fill-[#080906]" />
            Best Value
          </div>
        </div>
      )}

      <div className={`p-7 md:p-8 ${tier.popular ? "pt-12" : ""}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
              tier.popular ? "bg-[#C9944A]/20 border border-[#C9944A]/40" : "bg-white/[0.04] border border-white/10"
            }`}>
              <Icon size={18} className={tier.popular ? "text-[#C9944A]" : "text-white/60"} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-3xl md:text-4xl text-white font-light leading-tight">{tier.name}</h3>
            <p className="text-white/40 text-xs mt-1">{tier.tagline}</p>
          </div>
        </div>

        <div className="mb-6 pb-6 border-b border-white/10">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <AnimatePresence mode="wait">
              <motion.span
                key={price}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="font-serif text-4xl md:text-5xl text-white font-light leading-none tabular-nums"
              >
                {formatUSD(price)}
              </motion.span>
            </AnimatePresence>
            <span className="text-white/40 text-xs ml-1">{period}</span>
          </div>
          <div className="mt-2 text-[#C9944A] text-[10px] uppercase tracking-[0.25em] font-bold">
            {tier.sessions}
          </div>
        </div>

        <ul className="space-y-3 mb-7">
          {tier.perks.map((perk, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-[#C9944A]/20 border border-[#C9944A]/40 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={9} className="text-[#C9944A]" strokeWidth={3.5} />
              </div>
              <span className="text-white/70 text-sm leading-relaxed">{perk}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto p-7 md:p-8 pt-0 space-y-2.5">
        <button
          onClick={handleAdd}
          className={`group relative w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full text-[11px] tracking-[0.3em] uppercase font-bold overflow-hidden transition-all duration-500 ${
            tier.popular
              ? "bg-[#C9944A] text-[#080906] "
              : "border border-white/20 text-white hover:border-[#C9944A]/60 hover:text-[#C9944A]"
          }`}
        >
          {tier.popular && (
            <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 size={14} />
                  Added
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag size={14} />
                  Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>
        <Link
          href={`/signup?plan=${tier.id}&billing=${billing}`}
          className="block w-full text-center px-6 py-2.5 text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-[#C9944A] transition-colors"
        >
          Or join directly →
        </Link>
      </div>
    </motion.div>
  );
}

/* ═══════════ COMPARISON ═══════════ */
function Comparison() {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: easeOut }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.05] mb-4"
          >
            Compare{" "}
            <span className="italic text-[#E3D9C9]">at a glance.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: easeOut }}
            className="text-white/50 text-sm max-w-md mx-auto"
          >
            Every tier includes free showers, hydration, and member-only pricing.
            Here's how they differ.
          </motion.p>
        </div>

        <div className=" rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-5 md:p-6 text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold">
                  Feature
                </th>
                {["Essential", "Signature", "Sanctuary"].map((name, i) => (
                  <th
                    key={name}
                    className={`text-center p-5 md:p-6 text-[10px] uppercase tracking-[0.25em] font-semibold ${
                      i === 1 ? "text-[#C9944A]" : "text-white/60"
                    }`}
                  >
                    {i === 1 && <Star size={10} className="inline mr-1 fill-[#C9944A]" />}
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: easeOut }}
                  className={`border-b border-white/[0.06] ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                >
                  <td className="p-5 md:p-6 text-sm text-white/75 font-light">{row.feature}</td>
                  {["essential", "signature", "sanctuary"].map((key, idx) => {
                    const val = row[key];
                    return (
                      <td key={key} className={`p-5 md:p-6 text-center text-sm ${idx === 1 ? "text-[#E3D9C9]" : "text-white/60"}`}>
                        {val === true ? (
                          <Check size={16} strokeWidth={2.5} className={`mx-auto ${idx === 1 ? "text-[#C9944A]" : "text-white/70"}`} />
                        ) : val === false ? (
                          <span className="text-white/20">—</span>
                        ) : (
                          <span className="font-light">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ═══════════ TESTIMONIALS ═══════════ */
function Testimonials() {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="max-w-2xl mb-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="flex items-center gap-3 mb-5"
          >
            <Quote size={14} className="text-[#C9944A]" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
              Member Voices
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: easeOut }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.05]"
          >
            Why they{" "}
            <span className="italic text-[#E3D9C9]">keep returning.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: easeOut }}
              className="relative p-7 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent"
            >
              <Quote size={28} className="text-[#C9944A]/20 mb-4" fill="currentColor" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={11} className={s < t.rating ? "fill-[#C9944A] text-[#C9944A]" : "text-white/20"} />
                ))}
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-9 h-9 rounded-full bg-[#C9944A]/15 border border-[#C9944A]/30 flex items-center justify-center">
                  <span className="text-[#C9944A] text-sm font-semibold">{t.name[0]}</span>
                </div>
                <div>
                  <div className="text-white text-sm">{t.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════ FAQ ═══════════ */
function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 border-t border-white/5">
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
              Everything you need to know about packages and memberships. Can't
              find what you're looking for? Our team is one message away.
            </motion.p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#C9944A] hover:text-[#E3D9C9] transition-colors group"
            >
              Talk to our team
              <ArrowUpRight size={12} className="group-hover:rotate-45 transition-transform" />
            </Link>
          </div>

          <div className="lg:col-span-8">
            <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
              {faqs.map((faq, i) => {
                const isOpen = open === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: easeOut }}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="w-full flex items-center justify-between gap-4 py-6 text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <span className={`text-[10px] font-mono tracking-widest mt-1 transition-colors duration-300 ${isOpen ? "text-[#C9944A]" : "text-white/30 group-hover:text-[#C9944A]"}`}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className={`font-serif text-lg md:text-xl font-light transition-colors duration-300 ${isOpen ? "text-[#E3D9C9]" : "text-white group-hover:text-[#E3D9C9]"}`}>
                          {faq.q}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          isOpen ? "border-[#C9944A] bg-[#C9944A]/10 text-[#C9944A]" : "border-white/20 text-white/50 group-hover:border-[#C9944A]/50"
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

/* ═══════════ FINAL CTA ═══════════ */
function FinalCTA() {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 xl:px-16 relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1, ease: easeOut }}
          className="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-light leading-[0.95] mb-6"
        >
          Commit to{" "}
          <span className="italic bg-gradient-to-r from-[#E3D9C9] via-[#C9944A] to-[#E3D9C9] bg-clip-text text-transparent">
            yourself.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.25, ease: easeOut }}
          className="text-white/50 text-base max-w-md mx-auto leading-relaxed mb-10"
        >
          Join hundreds of members who've made ritual a non-negotiable part of their week.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.35, ease: easeOut }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="#memberships"
            className="group relative px-10 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] tracking-[0.3em] uppercase font-bold overflow-hidden shadow-[0_0_40px_rgba(201,148,74,0.4)] hover:shadow-[0_0_60px_rgba(201,148,74,0.6)] transition-shadow duration-500"
          >
            <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <span className="relative z-10 flex items-center gap-2">
              Become a Member
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link
            href="/contact"
            className="px-10 py-4 rounded-full border border-white/20 text-[#E3D9C9] text-[11px] tracking-[0.3em] uppercase hover:border-[#C9944A]/70 transition-colors duration-500"
          >
            Talk to Us First
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════ MOBILE BAR ═══════════ */
function MobileBar({ billing, memberships = [], cartCount, cartTotal, onCartClick }) {
  const showCart = cartCount > 0;
  const signaturePlan =
    memberships.find((m) => String(m.name).toLowerCase().includes("signature")) ||
    memberships[0];

  const mobileMonthlyPrice = signaturePlan
    ? billing === "monthly"
      ? signaturePlan.monthly
      : Math.round((signaturePlan.yearly || 0) / 12)
    : 0;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#080906]/95 backdrop-blur-xl px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {showCart ? (
            <>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/40">
                {cartCount} {cartCount === 1 ? "item" : "items"} · Cart
              </p>
              <p className="text-white font-serif text-lg leading-tight">
                {formatUSD(cartTotal)}
              </p>
            </>
          ) : (
            <>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/40">
                {signaturePlan?.name || "Signature"} · {billing}
              </p>
              <p className="text-white font-serif text-lg leading-tight">
                {formatUSD(mobileMonthlyPrice)}
                <span className="text-white/40 text-xs ml-1">/ mo</span>
              </p>
            </>
          )}
        </div>
        {showCart ? (
          <button
            onClick={onCartClick}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold shrink-0"
          >
            View Cart
            <span className="w-5 h-5 rounded-full bg-[#080906] text-[#C9944A] flex items-center justify-center text-[10px] font-bold">
              {cartCount}
            </span>
          </button>
        ) : (
          <Link
            href={`/signup?plan=${signaturePlan?.id || "signature"}&billing=${billing}`}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold shrink-0"
          >
            Join
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}