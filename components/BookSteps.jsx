
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  CalendarDays,
  CreditCard,
  ArrowUpRight,
  MoveRight,
  Check,
} from "lucide-react";
import Link from "next/link";

const easeOut = [0.22, 1, 0.36, 1];

const steps = [
  {
    icon: Sparkles,
    num: "01",
    roman: "I",
    title: "Choose your ritual",
    desc: "Explore our curated collection of wellness experiences and discover the ritual that speaks to you.",
    tag: "THE EXPERIENCE",
  },
  {
    icon: CalendarDays,
    num: "02",
    roman: "II",
    title: "Find your moment",
    desc: "Choose a date and time that works for you with our simple, real-time booking experience.",
    tag: "YOUR TIME",
  },
  {
    icon: CreditCard,
    num: "03",
    roman: "III",
    title: "Confirm & unwind",
    desc: "Complete your secure booking and receive instant confirmation. Your moment of calm awaits.",
    tag: "THE FINAL TOUCH",
  },
];

export default function BookSteps() {
  return (
    <section className="relative w-full overflow-hidden bg-[#080906] py-16 md:py-20 lg:py-20">

      {/* Background Decorations */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#C49A68]/[0.07] blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-[#C49A68]/[0.06] blur-[130px]" />

      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A47A50]/[0.025] blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 xl:px-16">

        {/* SECTION HEADING */}
        <div className="mx-auto mb-16 max-w-4xl text-center md:mb-24">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="mb-7 flex items-center justify-center gap-4"
          >
            <span className="h-px w-10 bg-[#C49A68]/50" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#C49A68] md:text-[11px]">
              A seamless experience
            </span>

            <span className="h-px w-10 bg-[#C49A68]/50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1, ease: easeOut }}
            className="font-serif text-5xl font-light leading-[1.08] tracking-tight text-[#F5F0E8] sm:text-6xl md:text-7xl lg:text-[88px]"
          >
            A little time for
            <br />
            <span className="italic text-[#C49A68]">
              a lot of you.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25, ease: easeOut }}
            className="mx-auto mt-7 max-w-xl text-sm font-light leading-7 text-[#E3D9C9]/60 md:text-base md:leading-8"
          >
            Your journey to feeling renewed begins here.
            Three thoughtful steps are all it takes to make
            space for yourself.
          </motion.p>
        </div>

        {/* BOOKING STEPS */}
        <div className="relative">

          {/* Connecting Line */}
          <div className="absolute left-[16.66%] right-[16.66%] top-[43px] hidden h-px bg-[#C49A68]/20 md:block">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3, ease: easeOut }}
              className="h-full origin-left bg-[#C49A68]/70"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7 lg:gap-9">

            {steps.map((step, i) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.18,
                    ease: easeOut,
                  }}
                  className="group relative"
                >

                  <div className="
                    relative flex h-full min-h-[340px] flex-col
                    overflow-hidden
                    border border-white/[0.09]
                    bg-[#11120F]
                    p-7
                    transition-all duration-700
                    hover:-translate-y-2
                    hover:border-[#C49A68]/50
                    hover:bg-[#15140F]
                    hover:shadow-[0_25px_65px_rgba(0,0,0,0.4)]
                    sm:p-9 md:min-h-[370px]
                  ">

                    {/* Top Decorative Glow */}
                    <div className="
                      pointer-events-none absolute -right-20 -top-20
                      h-48 w-48 rounded-full
                      bg-[#C49A68]/0 blur-[75px]
                      transition-all duration-700
                      group-hover:bg-[#C49A68]/10
                    " />

                    {/* Card Top */}
                    <div className="relative z-10 mb-10 flex items-center justify-between">

                      {/* Icon Circle */}
                      <div className="
                        relative flex h-[86px] w-[86px]
                        items-center justify-center rounded-full
                        border border-[#C49A68]/30
                        bg-[#080906]
                        transition-all duration-700
                        group-hover:border-[#C49A68]
                        group-hover:bg-[#C49A68]
                      ">

                        <div className="
                          absolute inset-[6px] rounded-full
                          border border-dashed border-[#C49A68]/35
                          transition-all duration-700
                          group-hover:rotate-45
                          group-hover:border-white/50
                        " />

                        <Icon
                          size={26}
                          strokeWidth={1.3}
                          className="
                            relative z-10 text-[#C49A68]
                            transition-colors duration-500
                            group-hover:text-[#080906]
                          "
                        />
                      </div>

                      {/* Roman Number */}
                      {/* <span className="
                        font-serif text-6xl font-light italic leading-none
                        text-[#C49A68]/20
                        transition-colors duration-500
                        group-hover:text-[#C49A68]/55
                      ">
                        {step.roman}
                      </span> */}
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10">

                      <span className="
                        mb-4 block text-[9px] font-semibold
                        uppercase tracking-[0.3em]
                        text-[#C49A68]
                      ">
                        {step.tag}
                      </span>

                      <h3 className="
                        mb-4 font-serif text-2xl font-light
                        text-[#F5F0E8]
                        transition-colors duration-500
                        group-hover:text-[#C49A68]
                        md:text-[29px]
                      ">
                        {step.title}
                      </h3>

                      <p className="
                        max-w-sm text-sm font-light leading-7
                        text-[#E3D9C9]/55
                        transition-colors duration-500
                        group-hover:text-[#E3D9C9]/75
                      ">
                        {step.desc}
                      </p>
                    </div>

                    {/* Bottom Detail */}
                    <div className="
                      relative z-10 mt-auto flex items-center
                      justify-between border-t border-white/[0.09] pt-6
                    ">

                      <span className="
                        text-[10px] font-medium tracking-[0.25em]
                        text-white/30
                        transition-colors duration-500
                        group-hover:text-[#C49A68]/70
                      ">
                        STEP {step.num}
                      </span>

                      <div className="
                        flex h-8 w-8 items-center justify-center
                        rounded-full border border-[#C49A68]/25
                        text-[#C49A68]
                        transition-all duration-500
                        group-hover:border-[#C49A68]
                        group-hover:bg-[#C49A68]
                        group-hover:text-[#080906]
                      ">
                        <MoveRight size={15} strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Background Number */}
                    {/* <span className="
                      pointer-events-none absolute -bottom-12 -right-3
                      select-none font-serif text-[180px]
                      font-light leading-none
                      text-[#C49A68]/[0.035]
                    ">
                      {step.num}
                    </span> */}

                  </div>
                </motion.div>
              );
            })}

          </div>
        </div>

        {/* BOTTOM CTA */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.35, ease: easeOut }}
          className="mt-16 flex flex-col items-center text-center md:mt-20"
        >

          <p className="mb-6 font-serif text-xl italic text-[#E3D9C9]/65">
            Your moment of stillness is just a few clicks away.
          </p>

          <Link
            href="/book"
            className="
              group relative inline-flex items-center gap-8
              overflow-hidden rounded-full
              border border-[#C49A68]/30
              bg-[#C49A68] py-2 pl-8 pr-2
              text-[#080906]
              transition-all duration-500
              hover:border-[#D7B58D]
              hover:bg-[#D7B58D]
              hover:shadow-[0_12px_35px_rgba(196,154,104,0.2)]
            "
          >
            <span className="
              relative z-10 text-[10px] font-semibold
              uppercase tracking-[0.25em] md:text-[11px]
            ">
              Reserve your experience
            </span>

            <span className="
              flex h-11 w-11 items-center justify-center
              rounded-full bg-black/10
              transition-all duration-500
              group-hover:rotate-45
              group-hover:bg-black/15
            ">
              <ArrowUpRight size={19} strokeWidth={1.5} />
            </span>
          </Link>

          {/* Trust Detail */}
          {/* <div className="mt-6 flex items-center gap-2">
            <Check size={12} className="text-[#C49A68]" />

            <span className="
              text-[9px] font-medium uppercase tracking-[0.25em]
              text-[#E3D9C9]/40
            ">
              Simple booking · Secure checkout · Instant confirmation
            </span>
          </div> */}

        </motion.div>

      </div>
    </section>
  );
}
