
"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LegalLayout({ title, lastUpdated, sections }) {
  return (
    <section className="relative w-full min-h-screen bg-[#080906] pt-40 pb-24 overflow-hidden">

      {/* Subtle Background Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 border-b border-white/10 pb-10"
        >
          {/* <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-[1px] bg-[#C8A165]/70" />

            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A165] font-semibold">
              Legal Information
            </span>
          </div> */}

          <h1 className="font-serif text-4xl md:text-5xl text-[#E3D9C9] font-light mb-5 leading-tight">
            {title}
          </h1>

          <p className="text-[#C8A165] text-[10px] md:text-xs uppercase tracking-[0.25em] font-semibold">
            Last Updated: {lastUpdated}
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

          {/* Sticky Table of Contents */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3">
            <div className="sticky top-32">

              <p className="text-[10px] uppercase tracking-[0.35em] text-[#C8A165] font-semibold mb-6">
                On This Page
              </p>

              <ul className="space-y-4 border-l border-white/10">
                {sections.map((sec, i) => (
                  <li key={i}>
                    <a
                      href={`#section-${i}`}
                      className="group flex items-start gap-3 pl-4 text-[13px] text-white/45 hover:text-[#C8A165] transition-all duration-300 border-l-2 border-transparent hover:border-[#C8A165] -ml-[1px] leading-relaxed"
                    >
                      <span className="text-[10px] text-[#C8A165]/40 font-serif mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span>{sec.title}</span>
                    </a>
                  </li>
                ))}
              </ul>

            </div>
          </div>

          {/* Legal Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-14">

            {sections.map((sec, i) => (
              <motion.div
                key={i}
                id={`section-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="scroll-mt-32"
              >

                {/* Section Number */}
                <div className="flex items-center gap-4 mb-5">
                  <span className="font-serif italic text-2xl text-[#C8A165]/40 font-light">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="h-[1px] flex-1 bg-white/[0.08]" />
                </div>

                {/* Section Heading */}
                <h2 className="font-serif text-2xl md:text-3xl text-[#E3D9C9] font-light mb-6 leading-snug">
                  {sec.title}
                </h2>

                {/* Legal Paragraphs */}
                <div className="text-white/55 text-sm md:text-[15px] leading-[2] space-y-5">
                  {sec.content.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>

              </motion.div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
