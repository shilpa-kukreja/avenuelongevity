"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1];
const headline = "Rituals &".split("");

export default function ServicesHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative w-full h-[100svh] min-h-[720px] flex items-center justify-center overflow-hidden bg-[#080906]"
    >
      {/* Background */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 -top-24 -bottom-24"
      >
        <motion.div
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.85 }}
          transition={{ duration: 3, ease: easeOut }}
          className="w-full h-full bg-cover bg-center will-change-transform"
          style={{
            backgroundImage:
              "url('/hero2.jpeg')",
          }}
        />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-[#080906]/60 to-[#080906]/30" />
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#080906_95%)] opacity-90" /> */}

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.10] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 3, delay: 0.6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[1000px] h-[700px] md:h-[1000px] rounded-full bg-[#C9944A]/20 blur-[180px] pointer-events-none"
      />

      {/* Cinematic bars */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.6, delay: 0.3, ease: easeOut }}
        className="absolute top-0 left-0 right-0 h-[1px] origin-left bg-gradient-to-r from-transparent via-[#C9944A]/50 to-transparent z-20"
      />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.6, delay: 0.5, ease: easeOut }}
        className="absolute bottom-0 left-0 right-0 h-[1px] origin-right bg-gradient-to-r from-transparent via-[#C9944A]/50 to-transparent z-20"
      />

      {/* ── MAIN CONTENT ── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-6xl"
      >
        {/* Eyebrow — restored & refined */}
        {/* <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: easeOut }}
          className="flex items-center gap-4 mb-10"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: easeOut }}
            className="h-[1px] w-12 md:w-20 origin-right bg-gradient-to-l from-[#C9944A] to-transparent"
          />
          <span className="text-[10px] md:text-[11px] tracking-[0.55em] uppercase text-[#E3D9C9] font-semibold">
            The Catalog
          </span>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: easeOut }}
            className="h-[1px] w-12 md:w-20 origin-left bg-gradient-to-r from-[#C9944A] to-transparent"
          />
        </motion.div> */}

        {/* Headline — much bigger */}
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem]  text-white font-light leading-[0.88] tracking-tight mb-6">
          <span className="inline-block overflow-hidden">
            {headline.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 1.1,
                  delay: 0.5 + i * 0.04,
                  ease: easeOut,
                }}
                className="inline-block"
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </span>
          <br className="hidden sm:block" />
          <span className="relative inline-block italic mt-2 sm:mt-0">
            <motion.span
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1.3, delay: 1.1, ease: easeOut }}
              className="inline-block  bg-clip-text text-[#C9944A]"
            >
              Therapies.
            </motion.span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.6, delay: 1.7, ease: easeOut }}
              className="absolute -bottom-3 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-[#C9944A] via-[#E3D9C9] to-transparent"
            />
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5, ease: easeOut }}
          className="text-white/60 text-base md:text-lg font-light max-w-xl leading-relaxed mb-12 mt-8"
        >
          Ancient wisdom, modern serenity. Eight curated experiences designed
          to restore balance to body, mind, and spirit.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.7, ease: easeOut }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.a
            href="#rituals"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="group relative px-10 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] tracking-[0.3em] uppercase overflow-hidden font-semibold shadow-[0_0_40px_rgba(201,148,74,0.35)] hover:shadow-[0_0_60px_rgba(201,148,74,0.6)] transition-shadow duration-500"
          >
            <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <span className="relative z-10 flex items-center gap-2">
              Explore Rituals
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </span>
          </motion.a>

          <motion.a
            href="/book"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="group relative px-10 py-4 rounded-full border border-white/20 text-[#E3D9C9] text-[11px] tracking-[0.3em] uppercase overflow-hidden backdrop-blur-sm hover:border-[#C9944A]/70 transition-colors duration-500"
          >
            <span className="relative z-10">Book a Session</span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* ── BOTTOM SCROLL CUE ── */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
      >
        <span className="text-[9px] tracking-[0.5em] uppercase text-white/40">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-white/10 relative overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-[#C9944A] to-transparent"
          />
        </div>
      </motion.div> */}
    </section>
  );
}