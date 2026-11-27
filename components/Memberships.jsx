"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag, Loader2 } from "lucide-react";
import axios from "axios";
import { useCart } from "../app/contexts/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const easeOut = [0.22, 1, 0.36, 1];

export default function Memberships() {
  const { addToCart, openCart } = useCart();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchMemberships = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/memberships`);
        const raw = Array.isArray(data)
          ? data
          : data?.memberships || data?.data || [];

        const normalized = raw
          .filter((item) => item.isActive !== false)
          .map((item, idx) => {
            const monthly = Number(
              item.priceMonthly ?? item.monthlyPrice ?? item.price ?? 0
            );
            const annual = Number(
              item.priceAnnually ??
                item.annualPrice ??
                item.yearlyPrice ??
                Math.round(monthly * 0.8)
            );

            return {
              id: item._id || item.id || `plan-${idx}`,
              name: item.name || item.title || "Membership",
              desc:
                item.desc ||
                item.description ||
                "Curated wellness membership for ongoing restoration.",
              priceMonthly: monthly,
              priceAnnually: annual,
              credits: Number(item.credits ?? item.sessions ?? 0),
              features: Array.isArray(item.features)
                ? item.features
                : Array.isArray(item.perks)
                ? item.perks
                : [],
              highlight: Boolean(
                item.highlight ??
                  item.isPopular ??
                  item.popular ??
                  (item.name || "").toLowerCase().includes("signature")
              ),
            };
          });

        if (active) setPlans(normalized);
      } catch (err) {
        console.error("Failed to fetch memberships:", err);
        if (active) setPlans([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMemberships();
    return () => {
      active = false;
    };
  }, []);

  const handleSelectPlan = (plan) => {
    const billing = isAnnual ? "Annually" : "Monthly";
    const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;

    addToCart({
      id: plan.id,
      name: `${plan.name} Membership`,
      type: "membership",
      billing,
      price,
      credits: plan.credits,
    });
    openCart();
  };

  return (
    <section className="relative w-full overflow-hidden border-t border-white/10 bg-[#080906] py-16 md:py-24 lg:py-24">
      {/* Background ambience */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#9A6B3F]/[0.07] blur-[150px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#9A6B3F]/[0.06] blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 md:px-12">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-[#9A6B3F]/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#C49A68]">
              Memberships
            </span>
            <span className="h-px w-10 bg-[#9A6B3F]/70" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
            className="mb-5 font-serif text-4xl font-light leading-tight text-[#F5F0E8] md:text-5xl lg:text-6xl"
          >
            Invest in your{" "}
            <span className="italic text-[#C49A68]">longevity.</span>
          </motion.h2>

          <p className="max-w-xl text-sm font-light leading-7 text-[#F5F0E8]/55 md:text-base">
            Make wellness a part of your lifestyle. Choose a membership that
            gives you more time, balance and space to recharge.
          </p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5"
          >
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`relative rounded-full px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                !isAnnual
                  ? "bg-[#C49A68] text-[#100E0B]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`relative flex items-center gap-2 rounded-full px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${
                isAnnual
                  ? "bg-[#C49A68] text-[#100E0B]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Annually
              <span
                className={`rounded-full px-2 py-1 text-[8px] font-bold tracking-normal ${
                  isAnnual
                    ? "bg-[#100E0B]/15 text-[#100E0B]"
                    : "bg-[#C49A68]/15 text-[#C49A68]"
                }`}
              >
                SAVE 20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Loading / Empty / Pricing Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/50">
            <Loader2 className="mb-3 animate-spin text-[#C49A68]" size={32} />
            <span className="text-xs uppercase tracking-widest">
              Loading Memberships...
            </span>
          </div>
        ) : plans.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/45">
            No membership plans available right now.
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-5 lg:gap-7">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.12,
                  ease: easeOut,
                }}
                className={`group relative flex flex-col overflow-hidden p-8 transition-all duration-500 md:p-8 lg:p-10 ${
                  plan.highlight
                    ? "border border-[#C49A68]/60 bg-[#17130F] shadow-[0_20px_80px_rgba(0,0,0,0.4)] md:scale-[1.035] md:py-12"
                    : "border border-white/10 bg-[#11120F] hover:-translate-y-2 hover:border-[#C49A68]/40 hover:bg-[#15130F]"
                }`}
              >
                {/* Featured top accent */}
                {plan.highlight && (
                  <>
                    <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#C49A68] to-transparent" />
                    <div className="absolute right-6 top-6">
                      <span className="border border-[#C49A68]/30 bg-[#C49A68]/10 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#D7B58D]">
                        Most Popular
                      </span>
                    </div>
                  </>
                )}

                {/* Plan Name */}
                <div className="mb-7">
                  <h3 className="mb-3 font-serif text-3xl font-light text-[#F5F0E8]">
                    {plan.name}
                  </h3>
                  <p className="min-h-[42px] text-[13px] font-light leading-6 text-[#F5F0E8]/50">
                    {plan.desc}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-8 flex items-end gap-1 border-b border-white/10 pb-8">
                  <span className="mb-2 text-xl font-light text-[#C49A68]">
                    $
                  </span>

                  <div className="relative flex h-[65px] items-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isAnnual ? "annual" : "monthly"}
                        initial={{ y: 35, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -35, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-serif text-6xl font-light tracking-tight text-[#F5F0E8]"
                      >
                        {isAnnual ? plan.priceAnnually : plan.priceMonthly}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  <span className="mb-2 text-[9px] uppercase tracking-[0.2em] text-[#F5F0E8]/40">
                    / month
                  </span>
                </div>

                {/* Features */}
                <ul className="mb-10 flex flex-grow flex-col gap-5">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[13px] font-light leading-relaxed text-[#F5F0E8]/75"
                    >
                      <span className="mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border border-[#C49A68]/35 bg-[#C49A68]/10">
                        <Check
                          size={10}
                          strokeWidth={2}
                          className="text-[#C49A68]"
                        />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`group/btn flex w-full items-center justify-center gap-3 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-500 ${
                    plan.highlight
                      ? "bg-[#C49A68] text-[#100E0B] hover:bg-[#E3D0B5]"
                      : "border border-white/20 bg-white/[0.04] text-[#F5F0E8] hover:border-[#C49A68] hover:bg-[#C49A68] hover:text-[#100E0B]"
                  }`}
                >
                  <ShoppingBag size={14} />
                  Add {plan.name} to Cart
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}