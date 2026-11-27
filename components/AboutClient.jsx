"use client";

import React, { useRef, useState } from "react";
import {
  motion, useScroll, useTransform, useInView, AnimatePresence
} from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Sparkles, Quote, Heart, Leaf,
  Users, Star, Moon, Flame, CalendarDays, Award, Play,
  MapPin, BookOpen, ChevronDown
} from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1];
const easeInOut = [0.65, 0, 0.35, 1];

/* ═══════════ IMAGES ═══════════ */
const FALLBACK = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2000&auto=format&fit=crop";
function SmartImage({ src, alt, className, ...props }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err ? FALLBACK : src}
      alt={alt}
      onError={() => setErr(true)}
      className={className}
      {...props}
    />
  );
}

const IMG = {
  founder: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1400&auto=format&fit=crop",
  studio:  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2000&auto=format&fit=crop",
  candles: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2000&auto=format&fit=crop",
  yoga:    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2000&auto=format&fit=crop",
  sauna:   "https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=2000&auto=format&fit=crop",
  hammam:  "https://images.unsplash.com/photo-1533619043865-1f5f5f7b9b4a?q=80&w=2000&auto=format&fit=crop",
  team1:   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
  team2:   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  team3:   "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
  team4:   "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
};

/* ═══════════ DATA ═══════════ */
const heroStats = [
  { value: "MMXX",   label: "Founded" },
  { value: "2,000+", label: "Guests" },
  { value: "8",      label: "Rituals" },
  { value: "4.9",    label: "Rating", suffix: "/5" },
];

const principles = [
  { num: "I",   icon: Moon,  title: "Stillness over stimulation", desc: "In a world that rewards speed, we build for slowness. Every ritual begins with a breath, ends with rest, and refuses to hurry." },
  { num: "II",  icon: Flame, title: "Ritual over routine",        desc: "We don't run a gym. We hold space for rituals — small, intentional, repeated acts that change how you feel over time." },
  { num: "III", icon: Leaf,  title: "Feeling over metrics",       desc: "No leaderboards, no step counts, no streaks to chase. Our only measure is how you leave feeling — and how soon you return." },
  { num: "IV",  icon: Heart, title: "Warmth over efficiency",     desc: "Every guest is greeted by name. Towels are warm. Tea is poured slowly. Efficiency is easy — hospitality is what we practice." },
];

const milestones = [
  { year: "2019", title: "The burnout",   desc: "Our founder, after a decade in tech, finds herself unable to sleep, focus, or feel. A Finnish sauna in Helsinki on a work trip changes everything.", image: IMG.sauna },
  { year: "2020", title: "The study",     desc: "Two years of study — contrast therapy, breathwork, recovery science, ancient bathing traditions from Turkey, Finland, and Japan.", image: IMG.hammam },
  { year: "2022", title: "The concept",   desc: "A quiet studio in Bandra opens as a 3-room pilot. Word of mouth spreads faster than any marketing could have managed.", image: IMG.studio },
  { year: "2023", title: "The expansion", desc: "Eight rituals. Private suites. A full recovery wing. Avenue takes shape as the studio we always imagined.", image: IMG.candles },
  { year: "2024", title: "The community", desc: "Over 2,000 members and guests. A community of people who've made ritual a non-negotiable part of their lives.", image: IMG.yoga },
];

const team = [
  { name: "Ananya Mehra", role: "Founder & Vision",    image: IMG.team1, quote: "I built Avenue for the version of myself that was too tired to keep going.", creds: "Ex-tech · Recovered insomniac" },
  { name: "Rohan Kapoor", role: "Head of Wellness",    image: IMG.team2, quote: "Recovery isn't a luxury. It's the foundation everything else is built on.", creds: "Certified recovery therapist" },
  { name: "Priya Iyer",   role: "Experience Director", image: IMG.team3, quote: "The best compliment a guest can give us is silence.", creds: "Ex-hospitality · 12 years" },
  { name: "Maya Shah",    role: "Lead Therapist",      image: IMG.team4, quote: "Every body holds a story. My job is to listen.", creds: "Swedish · Deep tissue · 8 years" },
];

const press = ["Vogue India", "GQ", "Condé Nast Traveler", "Elle", "Harper's Bazaar", "Forbes India", "Mint Lounge", "Architectural Digest"];

const numbers = [
  { value: 2400, suffix: "+", label: "Guests hosted" },
  { value: 12000, suffix: "+", label: "Sessions run" },
  { value: 98,   suffix: "%", label: "Would return" },
  { value: 4.9,  suffix: "/5", label: "Average rating" },
];

/* ═══════════ MAIN ═══════════ */
export default function AboutClient() {
  return (
    <div className="bg-[#080906] min-h-screen">
      <Hero />
      <Origin />
      <Interlude />
      <Manifesto />
      <Journey />
      <People />
      {/* <Press /> */}
      {/* <ByTheNumbers /> */}
      <FinalCTA />
    </div>
  );
}

/* ═══════════════════════════════════════════
   HERO
═══════════════════════════════════════════ */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const statOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const w1 = "Wellness,".split("");
  const w2 = "reimagined.".split("");

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[100svh] overflow-hidden bg-[#080906] pt-40"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#C9944A]/12 blur-[200px] pointer-events-none" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none z-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100svh-8rem)]">
        {/* CONTENT */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 py-16 lg:py-24 relative z-20"
        >
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="flex items-center gap-2 mb-10 text-[10px] tracking-[0.3em] uppercase"
          >
            <Link href="/" className="text-white/40 hover:text-[#C9944A] transition-colors">
              Home
            </Link>
            <span className="w-3 h-[1px] bg-white/20" />
            <span className="text-[#C9944A]">Our Story</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: easeOut }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="w-8 h-[1px] bg-[#C9944A]" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
              Chapter 00 · Prologue
            </span>
          </motion.div>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7rem] text-white font-light leading-[0.88] tracking-tight mb-8">
            <span className="block overflow-hidden">
              {w1.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.035, ease: easeOut }}
                  className="inline-block"
                >
                  {ch}
                </motion.span>
              ))}
            </span>
            <span className="block overflow-hidden mt-2">
              {w2.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 + i * 0.04, ease: easeOut }}
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
            className="text-white/55 text-base md:text-lg font-light max-w-md leading-relaxed mb-10"
          >
            Avenue began as a personal answer to a very modern question — what
            do you do when your body is fine but your soul is exhausted?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.7, ease: easeOut }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="#origin"
              className="group relative px-8 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] tracking-[0.3em] uppercase font-bold overflow-hidden shadow-[0_0_40px_rgba(201,148,74,0.35)] hover:shadow-[0_0_60px_rgba(201,148,74,0.55)] transition-shadow duration-500"
            >
              <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              <span className="relative z-10 flex items-center gap-2">
                Read the story
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/book"
              className="px-8 py-4 rounded-full border border-white/20 text-[#E3D9C9] text-[11px] tracking-[0.3em] uppercase hover:border-[#C9944A]/70 transition-colors duration-500 text-center"
            >
              Visit the Studio
            </Link>
          </motion.div>
        </motion.div>

        {/* IMAGE */}
        <div className="lg:col-span-6 xl:col-span-7 relative h-[55vh] lg:h-auto overflow-hidden">
          <motion.div style={{ y: imgY }} className="absolute inset-0 -top-16 -bottom-16">
            <motion.div
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1.02, opacity: 0.9 }}
              transition={{ duration: 2.4, ease: easeOut }}
              className="w-full h-full"
            >
              <SmartImage
                src={IMG.founder}
                alt="Ananya Mehra, founder of Avenue"
                className="w-full h-full object-cover object-center grayscale-[20%]"
              />
            </motion.div>
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#080906] via-[#080906]/25 to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-transparent to-transparent lg:hidden" />

          {/* Corner frames */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 1.4, ease: easeOut }}
            className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#C9944A]/70 z-20"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 1.6, ease: easeOut }}
            className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#C9944A]/70 z-20"
          /> */}

          {/* Since badge — top-left */}
          {/* <motion.div
            initial={{ opacity: 0, y: -20, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -8 }}
            transition={{ duration: 1.2, delay: 1.6, ease: easeOut }}
            className="hidden lg:flex absolute top-10 left-10 z-20 bg-[#C9944A] text-[#080906] rounded-full px-5 py-2 items-center gap-2 shadow-xl"
          >
            <Sparkles size={12} />
            <span className="text-[9px] font-bold uppercase tracking-[0.25em]">
              Since 2019
            </span>
          </motion.div> */}

          {/* Floating name card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8, ease: easeOut }}
            className="absolute bottom-8 left-8 md:left-auto md:right-28 z-20 backdrop-blur-xl bg-white/[0.06] border border-white/15 rounded-xl px-5 py-4"
          >
            <div className="text-[9px] tracking-[0.3em] uppercase text-[#C9944A] font-bold mb-1.5">
              Founder
            </div>
            <div className="font-serif text-xl text-white font-light leading-tight">
              Ananya Mehra
            </div>
            <div className="font-serif italic text-sm text-[#E3D9C9]/70 mt-1">
              "The ritual that saved me."
            </div>
          </motion.div>

          {/* Vertical side text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 2 }}
            className="hidden lg:flex absolute top-1/2 right-8 -translate-y-1/2 z-20 flex-col items-center gap-3"
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#C9944A]/50 to-transparent" />
            <span
              className="text-[9px] tracking-[0.5em] uppercase text-white/40"
              style={{ writingMode: "vertical-rl" }}
            >
              Est. MMXX · Mumbai
            </span>
            <div className="w-[1px] h-16 bg-gradient-to-t from-transparent via-[#C9944A]/50 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* BOTTOM STAT STRIP */}
      {/* <motion.div
        style={{ opacity: statOpacity }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2, ease: easeOut }}
        className="relative z-20 border-t border-white/10 bg-[#080906]/70 backdrop-blur-xl"
      >
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {heroStats.map((s, i) => (
              <div
                key={i}
                className="text-center md:text-left md:border-l md:border-white/10 md:pl-6 first:md:border-l-0 first:md:pl-0"
              >
                <div className="font-serif text-2xl md:text-4xl text-[#E3D9C9] font-light leading-none">
                  {s.value}
                  {s.suffix && <span className="text-white/30 text-base md:text-xl ml-1">{s.suffix}</span>}
                </div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-white/40 mt-1.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div> */}
    </section>
  );
}

/* ═══════════════════════════════════════════
   ORIGIN (narrative + marginalia + portrait)
═══════════════════════════════════════════ */
function Origin() {
  return (
    <section id="origin" className="relative w-full bg-[#080906] py-20 md:py-20 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 xl:px-16">
        {/* Chapter label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="flex items-center gap-3 mb-16"
        >
          <span className="w-10 h-[1px] bg-[#C9944A]/70" />
          <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
            Chapter 01 · Origin
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* LEFT: portrait (sticky) */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: easeOut }}
                className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden group"
              >
                <SmartImage
                  src={IMG.candles}
                  alt="Inside Avenue"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080906]/80 via-[#080906]/20 to-transparent" />

                {/* <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#C9944A]/70" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#C9944A]/70" /> */}

                {/* Editorial caption */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-[1px] bg-[#C9944A]" />
                    <span className="text-[9px] tracking-[0.3em] uppercase text-[#C9944A] font-bold">
                      Fig. 01
                    </span>
                  </div>
                  <div className="text-white/70 text-xs leading-relaxed">
                    The first studio — Bandra, 2022. Three rooms, one sauna, and a
                    waiting list that grew faster than we could build.
                  </div>
                </div>
              </motion.div>

              {/* Marginalia annotation */}
              {/* <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.3, ease: easeOut }}
                className="hidden lg:flex absolute -left-20 top-24 items-start gap-3"
              >
                <div className="w-[1px] h-16 bg-[#C9944A]/40 shrink-0" />
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A]/70 leading-relaxed max-w-[120px]">
                  The cabin was<br />80 years old.<br />It smelled of<br />cedar and rain.
                </div>
              </motion.div> */}
            </div>
          </div>

          {/* RIGHT: narrative */}
          <div className="lg:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: easeOut }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.05] mb-10"
            >
              It started with a single sauna —{" "}
              <span className="italic text-[#E3D9C9]">and a very tired woman.</span>
            </motion.h2>

            {/* Drop cap paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2, ease: easeOut }}
              className="mb-8 relative"
            >
              <p className="text-white/65 text-base md:text-lg leading-[1.9]">
                <span className="font-serif text-[#C9944A] text-[7rem] md:text-[8rem] float-left leading-[0.7] mr-3 mt-3 font-light">
                  O
                </span>
                ur founder, Ananya, spent the first decade of her career building products
                that never let her sleep. By thirty, she had everything on paper — and
                nothing in her body. The insomnia, the adrenal fatigue, the strange
                numbness that comes from running on screens and cortisol for years.
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: easeOut }}
              className="text-white/55 text-base leading-[1.9] mb-8"
            >
              The turning point came on a work trip to Helsinki — a wooden sauna cabin
              by a frozen lake, and a cold plunge she almost didn't take. She emerged
              from that water feeling something she hadn't felt in years: awake. Not
              just alert — alive. The body she'd been ignoring for a decade finally
              said something back.
            </motion.p>

            {/* Pull quote breakout */}
            <motion.blockquote
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4, ease: easeOut }}
              className="relative my-12 py-8 px-6 md:px-10 border-l-2 border-[#C9944A] bg-gradient-to-r from-[#C9944A]/[0.04] to-transparent"
            >
              <Quote size={32} className="absolute top-6 left-6 text-[#C9944A]/20" fill="currentColor" />
              <p className="relative font-serif text-2xl md:text-3xl text-[#E3D9C9] font-light italic leading-[1.4] pl-8">
                "I didn't need another workout. I needed a place that would let me stop."
              </p>
              <div className="mt-4 ml-8 flex items-center gap-2">
                <div className="w-6 h-[1px] bg-[#C9944A]" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#C9944A] font-semibold">
                  Ananya Mehra · Founder
                </span>
              </div>
            </motion.blockquote>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5, ease: easeOut }}
              className="text-white/55 text-base leading-[1.9] mb-10"
            >
              Two years of study followed — contrast therapy, breathwork, ancient
              bathing traditions from Turkey, Finland, and Japan. Then a quiet pilot
              in Bandra. Then a community. Avenue is what happens when someone
              builds the studio they needed but couldn't find.
            </motion.p>

            {/* Signature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6, ease: easeOut }}
              className="flex items-end gap-6 pt-8 border-t border-white/10"
            >
              <div>
                <div
                  className="font-serif italic text-4xl md:text-5xl text-[#E3D9C9] mb-2"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Ananya
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  Founder, Avenue Longevity Retreat
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   INTERLUDE — Cinematic full-bleed quote
═══════════════════════════════════════════ */
function Interlude() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <section
      ref={ref}
      className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden bg-[#080906]"
    >
      {/* Parallax image */}
      <motion.div
        style={{ y: imgY, scale }}
        className="absolute inset-0 -top-16 -bottom-16"
      >
        <SmartImage
          src={IMG.studio}
          alt="The Avenue studio"
          className="w-full h-full object-cover opacity-45"
        />
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-[#080906]/60 to-[#080906]/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#080906_90%)] opacity-90" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="flex items-center justify-center gap-3 mb-10"
          >
            <div className="w-8 h-[1px] bg-[#C9944A]/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
              An Interlude
            </span>
            <div className="w-8 h-[1px] bg-[#C9944A]/60" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: easeOut }}
            className="mb-8 flex justify-center"
          >
            <Quote size={48} className="text-[#C9944A]/40" fill="currentColor" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2, ease: easeOut }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.15] mb-10"
          >
            Some places ask you to do more.{" "}
            <span className="italic text-[#E3D9C9]">
              We ask you to do less — and stay longer.
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.5, ease: easeOut }}
            className="flex items-center justify-center gap-4"
          >
            <div className="w-12 h-[1px] bg-[#C9944A]/50" />
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/50">
              — The Avenue Principle
            </div>
            <div className="w-12 h-[1px] bg-[#C9944A]/50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   MANIFESTO (cream with watermark)
═══════════════════════════════════════════ */

function Manifesto() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 overflow-hidden">

      {/* Background Watermark */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif italic text-[#C8A165]/[0.035] text-[12rem] md:text-[25rem] leading-none pointer-events-none select-none whitespace-nowrap"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Manifesto
      </div>

      {/* Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 xl:px-16 relative z-10">

        {/* Chapter Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="flex items-center gap-3 mb-12"
        >
          {/* <span className="w-10 h-[1px] bg-[#C8A165]/70" /> */}

          <span className="text-[10px] tracking-[0.5em] uppercase text-[#C8A165] font-semibold">
            Chapter 02 · Manifesto
          </span>
        </motion.div>

        {/* Main Statement */}
        <div className="max-w-4xl mb-20">

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: easeOut }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#E3D9C9] font-light leading-[1.08] mb-8"
          >
            We believe wellness isn't something you do —{" "}
            <span className="italic text-[#C8A165]">
              it's something you return to.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: easeOut }}
            className="text-white/50 text-base md:text-lg leading-[1.9] max-w-2xl"
          >
            Not a destination. Not a habit to tick off. A place you come back
            to, again and again, until it becomes part of who you are. These are
            the four principles we hold everything against.
          </motion.p>

        </div>

        {/* Manifesto Principles */}
        <div className="space-y-4">

          {principles.map((p, i) => {
            const Icon = p.icon;
            const isOpen = openIdx === i;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: easeOut,
                }}
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                className={`relative cursor-pointer p-6 md:p-8 rounded-2xl border transition-all duration-500 ${
                  isOpen
                    ? "bg-[#15150F] border-[#C8A165]/40 shadow-[0_20px_60px_rgba(200,161,101,0.07)]"
                    : "bg-[#10110E] border-white/[0.07] hover:bg-[#15150F] hover:border-[#C8A165]/25"
                }`}
              >

                {/* Top Row */}
                <div className="flex items-center gap-4 md:gap-8">

                  {/* Roman Numeral */}
                  {/* <div className="font-serif italic text-3xl md:text-5xl text-[#C8A165]/40 font-light leading-none shrink-0 w-10 md:w-20">
                    {p.num}
                  </div> */}

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isOpen
                        ? "bg-[#C8A165] text-[#080906]"
                        : "bg-[#1C1A14] text-[#C8A165] border border-[#C8A165]/25 group-hover:border-[#C8A165]/50"
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="flex-1 font-serif text-lg md:text-3xl text-[#E3D9C9] font-light leading-tight">
                    {p.title}
                  </h3>

                  {/* Toggle */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.35 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? "bg-[#C8A165]/15 text-[#C8A165]"
                        : "border border-white/10 text-white/40"
                    }`}
                  >
                    <ChevronDown size={17} />
                  </motion.div>

                </div>

                {/* Expandable Description */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: easeOut }}
                      className="overflow-hidden"
                    >
                      <p className="text-white/50 text-sm md:text-base leading-[1.9] pt-6 pl-0 md:pl-28 max-w-3xl">
                        {p.desc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════
   JOURNEY (scroll-driven timeline)
═══════════════════════════════════════════ */
function Journey() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 40%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative w-full bg-[#080906] py-20 md:py-20">
      <div className="max-w-[1300px] mx-auto px-6 md:px-10 xl:px-16">
        {/* Chapter label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="flex items-center gap-3 mb-12"
        >
          <span className="w-10 h-[1px] bg-[#C9944A]/70" />
          <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
            Chapter 03 · Journey
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: easeOut }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-light leading-[1.05] mb-20 max-w-2xl"
        >
          Five years,{" "}
          <span className="italic text-[#E3D9C9]">one long exhale.</span>
        </motion.h2>

        {/* Timeline */}
        <div className="relative">
          {/* Static line */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[1px] bg-white/10" />

          {/* Bronze progress */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 w-[2px] bg-gradient-to-b from-[#C9944A] via-[#E3D9C9] to-transparent origin-top shadow-[0_0_20px_rgba(201,148,74,0.5)]"
          />

          <div className="space-y-16 md:space-y-28">
            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.9, delay: 0.05, ease: easeOut }}
                  className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12"
                >
                  {/* Marker */}
                  <div className="absolute left-6 md:left-1/2 top-3 md:top-8 -translate-x-1/2 z-10">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-[#C9944A] border-2 border-[#080906] shadow-[0_0_30px_rgba(201,148,74,0.8)]" />
                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-[#C9944A] animate-ping opacity-40" />
                    </div>
                  </div>

                  {/* Content block */}
                  <div className={`${isLeft ? "md:pr-14 md:text-right md:order-1" : "md:pl-14 md:order-2"} pl-16 md:pl-0`}>
                    {/* Big background year */}
                    <div className={`relative ${isLeft ? "md:text-right" : ""} mb-4`}>
                      <div
                        aria-hidden
                        className={`absolute font-serif italic text-[#C9944A]/[0.08] text-7xl md:text-[10rem] leading-none pointer-events-none -z-10 top-0 ${
                          isLeft ? "right-0 md:right-0" : "left-0"
                        }`}
                      >
                        {m.year}
                      </div>
                      <div className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-bold ${isLeft ? "md:justify-end" : ""}`}>
                        <CalendarDays size={11} />
                        {m.year}
                      </div>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-3 leading-tight">
                      {m.title}
                    </h3>
                    <p className={`text-white/55 text-sm md:text-base leading-[1.8] max-w-md ${isLeft ? "md:ml-auto" : ""}`}>
                      {m.desc}
                    </p>
                  </div>

                  {/* Image block */}
                  <div className={`${isLeft ? "md:order-2 md:pl-14" : "md:order-1 md:pr-14 md:flex md:justify-end"} hidden md:block`}>
                    <div className="relative w-full max-w-[280px] h-[180px] rounded-xl overflow-hidden group">
                      <SmartImage
                        src={m.image}
                        alt={m.title}
                        className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                      />
                      {/* <div className="absolute inset-0 bg-gradient-to-t from-[#080906]/60 to-transparent" />
                      <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-[#C9944A]/70" />
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-[#C9944A]/70" /> */}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PEOPLE (team cards)
═══════════════════════════════════════════ */
function People() {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 border-t border-white/5">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        {/* Chapter label */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="flex items-center gap-3 mb-12"
        >
          <span className="w-10 h-[1px] bg-[#C9944A]/70" />
          <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
            Chapter 04 · People
          </span>
        </motion.div> */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: easeOut }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-light leading-[1.05] max-w-2xl"
          >
            The people behind{" "}
            <span className="italic text-[#E3D9C9]">the stillness.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: easeOut }}
            className="text-white/40 text-xs uppercase tracking-[0.25em] md:text-right"
          >
            A small team of specialists —{" "}
            <br />
            <span className="text-[#C9944A]">not a large staff.</span>
          </motion.p>
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {team.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: easeOut }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl h-[400px] md:h-[460px]">
                <SmartImage
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-[#080906]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#C9944A]/0 via-transparent to-transparent group-hover:from-[#C9944A]/10 transition-colors duration-700" />

                {/* <div className="absolute top-0 left-0 w-14 h-14 border-t-2 border-l-2 border-[#C9944A]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 right-0 w-14 h-14 border-b-2 border-r-2 border-[#C9944A]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" /> */}

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-[#C9944A] font-bold mb-1.5">
                    {t.role}
                  </div>
                  <h3 className="font-serif text-2xl text-white font-light leading-tight mb-1">
                    {t.name}
                  </h3>
                  <p className="text-white/40 text-[11px] leading-tight">
                    {t.creds}
                  </p>
                </div>
              </div>

              <div className="mt-4 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-start gap-2">
                  <Quote size={14} className="text-[#C9944A]/40 shrink-0 mt-0.5" />
                  <p className="text-white/60 text-xs italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4, ease: easeOut }}
          className="mt-16 md:mt-24 max-w-3xl mx-auto text-center"
        >
          <Quote size={32} className="text-[#C9944A]/30 mx-auto mb-6" fill="currentColor" />
          <p className="font-serif text-2xl md:text-4xl text-white font-light italic leading-[1.4] mb-6">
            "We don't think of ourselves as staff. We're the quiet hands that
            hold the room while you rest."
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-[1px] bg-[#C9944A]/50" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              The Avenue Team
            </span>
            <div className="w-10 h-[1px] bg-[#C9944A]/50" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PRESS
═══════════════════════════════════════════ */
// function Press() {
//   const doubled = [...press, ...press];

//   return (
//     <section className="relative w-full bg-[#080906] py-20 border-t border-white/5 overflow-hidden">
//       <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16 mb-14">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.9, ease: easeOut }}
//           className="flex items-center justify-between flex-wrap gap-4"
//         >
//           <div className="flex items-center gap-3">
//             <Award size={14} className="text-[#C9944A]" />
//             <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
//               Chapter 05 · Press
//             </span>
//           </div>
//           <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">
//             As seen in
//           </span>
//         </motion.div>
//       </div>

//       {/* Marquee */}
//       <div className="relative overflow-hidden">
//         <motion.div
//           animate={{ x: ["0%", "-50%"] }}
//           transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
//           className="flex items-center whitespace-nowrap will-change-transform"
//         >
//           {doubled.map((name, i) => (
//             <span key={i} className="flex items-center shrink-0">
//               <span className="px-12 md:px-20 font-serif text-3xl md:text-5xl lg:text-6xl text-white/25 font-light italic">
//                 {name}
//               </span>
//               <span className="w-1.5 h-1.5 rounded-full bg-[#C9944A]/40" />
//             </span>
//           ))}
//         </motion.div>
//       </div>

//       <div className="absolute inset-y-0 left-0 w-32 md:w-48 bg-gradient-to-r from-[#080906] to-transparent pointer-events-none" />
//       <div className="absolute inset-y-0 right-0 w-32 md:w-48 bg-gradient-to-l from-[#080906] to-transparent pointer-events-none" />
//     </section>
//   );
// }

/* ═══════════════════════════════════════════
   BY THE NUMBERS
═══════════════════════════════════════════ */
// function ByTheNumbers() {
//   return (
//     <div className="relative w-full border-y border-white/5 bg-[#080906]">
//       <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16 py-14">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//           {numbers.map((n, i) => (
//             <NumberItem key={i} {...n} index={i} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// function NumberItem({ value, suffix, label, index }) {
//   const ref = useRef(null);
//   const inView = useInView(ref, { once: true, margin: "-50px" });
//   const [count, setCount] = useState(0);

//   React.useEffect(() => {
//     if (!inView) return;
//     const duration = 1600;
//     const start = performance.now();
//     const isFloat = !Number.isInteger(value);

//     const tick = (now) => {
//       const elapsed = now - start;
//       const progress = Math.min(elapsed / duration, 1);
//       const eased = 1 - Math.pow(1 - progress, 3);
//       const current = value * eased;
//       setCount(isFloat ? current : Math.round(current));
//       if (progress < 1) requestAnimationFrame(tick);
//     };
//     requestAnimationFrame(tick);
//   }, [inView, value]);

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 20 }}
//       animate={inView ? { opacity: 1, y: 0 } : {}}
//       transition={{ duration: 0.8, delay: index * 0.1, ease: easeOut }}
//       className="text-center md:text-left md:border-l md:border-white/10 md:pl-8 first:md:border-l-0 first:md:pl-0"
//     >
//       <div className="font-serif text-4xl md:text-6xl text-[#E3D9C9] font-light leading-none tabular-nums">
//         {Number.isInteger(value)
//           ? Math.round(count).toLocaleString()
//           : count.toFixed(1)}
//         {suffix && <span className="text-white/30 text-lg md:text-2xl ml-1">{suffix}</span>}
//       </div>
//       <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/40 mt-3">
//         {label}
//       </div>
//     </motion.div>
//   );
// }

/* ═══════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-[#C9944A]/10 blur-[180px] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 xl:px-16 relative z-10 text-center">
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className="h-[1px] w-12 bg-[#C9944A]/60" />
          <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
            Your Chapter Begins
          </span>
          <span className="h-[1px] w-12 bg-[#C9944A]/60" />
        </motion.div> */}

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1, ease: easeOut }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-[6rem] text-white font-light leading-[0.92] mb-6"
        >
          Come write{" "}
          <span className="italic bg-gradient-to-r from-[#E3D9C9] via-[#C9944A] to-[#E3D9C9] bg-clip-text text-transparent">
            yours.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.25, ease: easeOut }}
          className="text-white/50 text-base max-w-md mx-auto leading-relaxed mb-10"
        >
          Every guest is a new story. Book a ritual, visit the space, and see
          what your next chapter might feel like.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.35, ease: easeOut }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/book"
            className="group relative px-10 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] tracking-[0.3em] uppercase font-bold overflow-hidden  transition-shadow duration-500"
          >
            <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <span className="relative z-10 flex items-center gap-2">
              Book a Ritual
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link
            href="/space"
            className="px-10 py-4 rounded-full border border-white/20 text-[#E3D9C9] text-[11px] tracking-[0.3em] uppercase hover:border-[#C9944A]/70 transition-colors duration-500"
          >
            See the Space
          </Link>
        </motion.div>
      </div>
    </section>
  );
}