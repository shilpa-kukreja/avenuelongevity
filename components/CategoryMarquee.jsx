"use client";

import React from "react";
import { motion } from "framer-motion";

const categories = ["Heat", "Cold", "Recovery", "Bathing", "Bodywork", "Hydration"];

export default function CategoryMarquee() {
  return (
    <div className="relative w-full border-y border-white/5 bg-[#080906] py-6 md:py-8 overflow-hidden">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap will-change-transform"
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center shrink-0">
            {categories.map((word) => (
              <span key={`${copy}-${word}`} className="flex items-center">
                <span className="font-serif italic text-white/25 text-3xl md:text-5xl font-light">
                  {word}
                </span>
                <span className="mx-8 md:mx-12 text-[#C9944A]/60 text-xl md:text-2xl">·</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>

      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#080906] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#080906] to-transparent pointer-events-none z-10" />
    </div>
  );
}