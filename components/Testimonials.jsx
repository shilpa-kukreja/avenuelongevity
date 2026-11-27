
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  BadgeCheck,
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Elena Rodriguez",
    role: "Member since 2022",
    quote:
      "The contrast therapy here is unlike anything else in the city. The transition from the sauna to the cold plunge completely reset my nervous system. I leave feeling reborn every single time.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "James Mitchell",
    role: "Elite Member",
    quote:
      "Avenue Longevity Retreat is my sanctuary. The THz Teta-P90 system is a game changer for my recovery. The attention to detail in the architecture and service makes this world-class.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Samantha Lee",
    role: "Signature Member",
    quote:
      "The Hammam ritual is pure magic. The therapist was incredibly knowledgeable, and the entire environment feels like a luxury resort in Europe. It's the ultimate way to spend a Sunday.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
  },
];

const easeOut = [0.22, 1, 0.36, 1];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const current = testimonials[currentIndex];

  return (
    <section className="relative w-full overflow-hidden border-t border-white/10 bg-[#080906] py-16 md:py-24 lg:py-24">

      {/* Ambient Background */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#9A6B3F]/[0.07] blur-[150px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-[450px] w-[450px] rounded-full bg-[#C49A68]/[0.05] blur-[140px]" />

      {/* Background Watermark */}
      {/* <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-serif text-[18vw] font-light tracking-widest text-white/[0.025]">
        EXPERIENCES
      </div> */}

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 md:px-12">

        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">

          {/* LEFT SIDE: ARCH PORTRAIT */}
          <div className="relative flex justify-center lg:col-span-5 lg:justify-start">

            <div className="relative aspect-[4/5] w-full max-w-[400px]">

              {/* Decorative frame */}
              <div className="absolute -inset-3 rounded-t-full border border-[#C49A68]/20" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                    filter: "blur(8px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.04,
                    filter: "blur(8px)",
                  }}
                  transition={{ duration: 0.7, ease: easeOut }}
                  className="absolute inset-0"
                >

                  {/* Arched Image */}
                  <div className="h-full w-full overflow-hidden rounded-t-full border border-[#C49A68]/25 bg-[#15130F] p-2">

                    <img
                      src={current.avatar}
                      alt={current.name}
                      className="h-full w-full rounded-t-full object-cover grayscale-[30%] transition-all duration-1000 hover:grayscale-0"
                    />

                  </div>

                  {/* Image overlay */}
                  <div className="pointer-events-none absolute inset-2 rounded-t-full bg-gradient-to-t from-[#080906]/30 via-transparent to-transparent" />

                  {/* Verified Badge */}
                  <div className="absolute -bottom-4 -right-3 flex items-center gap-3 border border-white/10 bg-[#171612] px-5 py-4 shadow-[0_15px_50px_rgba(0,0,0,0.4)] md:-right-7">

                    <BadgeCheck
                      size={22}
                      className="shrink-0 text-[#C49A68]"
                      strokeWidth={1.5}
                    />

                    <div>
                      <p className="mb-1 text-[8px] font-semibold uppercase tracking-[0.25em] text-[#C49A68]">
                        Verified
                      </p>

                      <p className="text-xs font-medium text-[#F5F0E8]">
                        Sanctuary Member
                      </p>
                    </div>

                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Portrait number */}
              {/* <span className="absolute -bottom-12 left-0 font-serif text-5xl font-light italic text-[#C49A68]/25">
                0{currentIndex + 1}
              </span> */}

            </div>
          </div>

          {/* RIGHT SIDE: TESTIMONIAL */}
          <div className="flex flex-col justify-center lg:col-span-7">

            {/* Section Label */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easeOut }}
              className="mb-9 flex items-center gap-3"
            >
              <span className="h-px w-10 bg-[#C49A68]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#C49A68]">
                Guest Experiences
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: easeOut }}
              className="mb-7 font-serif text-4xl font-light leading-tight text-[#F5F0E8] md:text-5xl lg:text-6xl"
            >
              Words that
              <br />
              <span className="italic text-[#C49A68]">
                speak for themselves.
              </span>
            </motion.h2>

            {/* Quote Icon */}
            <Quote
              size={38}
              strokeWidth={1}
              className="mb-5 rotate-180 text-[#C49A68]/50"
            />

            {/* Animated Quote */}
            <div className="min-h-[190px] md:min-h-[210px]">

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(5px)" }}
                  transition={{ duration: 0.6, ease: easeOut }}
                >

                  <p className="font-serif text-[22px] font-light italic leading-[1.55] text-[#F5F0E8]/85 md:text-[27px] lg:text-[30px]">
                    "{current.quote}"
                  </p>

                </motion.div>
              </AnimatePresence>

            </div>

            {/* Bottom Information */}
            <div className="mt-8 flex flex-col justify-between gap-8 border-t border-white/10 pt-8 md:flex-row md:items-center">

              {/* User Details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col"
                >

                  {/* Rating */}
                  <div className="mb-3 flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        className="fill-[#C49A68] text-[#C49A68]"
                      />
                    ))}
                  </div>

                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F5F0E8]">
                    {current.name}
                  </h4>

                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#C49A68]/80">
                    {current.role}
                  </p>

                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="flex items-center justify-between gap-6 md:justify-end">

                {/* Progress Indicators */}
                <div className="flex items-center gap-2.5">
                  {testimonials.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`View testimonial ${i + 1}`}
                      aria-current={i === currentIndex ? "true" : undefined}
                      className={`h-[3px] rounded-full transition-all duration-500 ${
                        i === currentIndex
                          ? "w-9 bg-[#C49A68]"
                          : "w-2 bg-white/20 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex gap-2">

                  <button
                    onClick={handlePrev}
                    aria-label="Previous testimonial"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#F5F0E8] transition-all duration-300 hover:border-[#C49A68] hover:bg-[#C49A68] hover:text-[#080906]"
                  >
                    <ChevronLeft size={18} strokeWidth={1.5} />
                  </button>

                  <button
                    onClick={handleNext}
                    aria-label="Next testimonial"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#F5F0E8] transition-all duration-300 hover:border-[#C49A68] hover:bg-[#C49A68] hover:text-[#080906]"
                  >
                    <ChevronRight size={18} strokeWidth={1.5} />
                  </button>

                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Bottom Branding */}
        {/* <div className="mt-24 flex items-center justify-center gap-4 border-t border-white/10 pt-8 text-center">

          <span className="h-px w-8 bg-[#C49A68]/40" />

          <span className="text-[9px] font-medium uppercase tracking-[0.35em] text-white/35">
            Every experience tells a story
          </span>

          <span className="h-px w-8 bg-[#C49A68]/40" />

        </div> */}

      </div>
    </section>
  );
}
