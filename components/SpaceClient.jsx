"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, ArrowLeft, Sparkles, MapPin,
  Clock, ShieldCheck, Droplets, Wind, Thermometer, RefreshCw,
  ShowerHead, Leaf, Coffee, Wifi, Lock, Bike, Car, Sun,
  ChevronLeft, ChevronRight, X, Camera, Quote, CalendarDays,ChevronDown, ChevronUp
} from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1];

/* ═══════════════════════════════════════════
   DATA
═══════════════════════════════════════════ */
const IMG = {
  sauna:     "https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=2000&auto=format&fit=crop",
  plunge:    "/plunge.jpg",
  hammam:    "/TheHammam.jpg",
  spa:       "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2000&auto=format&fit=crop",
  stones:    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2000&auto=format&fit=crop",
  treatment: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2000&auto=format&fit=crop",
  yoga:      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2000&auto=format&fit=crop",
  candles:   "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2000&auto=format&fit=crop",
  spa2:      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2000&auto=format&fit=crop",
  table:     "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop",
  rocks:     "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2000&auto=format&fit=crop",
};

const filters = [
  { id: "all",       label: "All" },
  { id: "heat",      label: "Heat" },
  { id: "cold",      label: "Cold" },
  { id: "bathing",   label: "Bathing" },
  { id: "recovery",  label: "Recovery" },
  { id: "lounge",    label: "Lounge" },
  { id: "amenities", label: "Amenities" },
];

const gallery = [
  { id: 1, category: "heat",      title: "The Cedar Sauna",        subtitle: "Hand-crafted · 90°C",       image: IMG.sauna,     span: "md:col-span-7 md:row-span-2" },
  { id: 2, category: "cold",      title: "The Plunge Room",        subtitle: "3–6°C · Guided",            image: IMG.plunge,    span: "md:col-span-5" },
  { id: 3, category: "bathing",   title: "The Hammam",             subtitle: "Steam · Scrub · Rest",      image: IMG.hammam,    span: "md:col-span-5" },
  { id: 4, category: "recovery",  title: "Recovery Suites",        subtitle: "Private · Quiet",           image: IMG.table,     span: "md:col-span-4" },
  { id: 5, category: "lounge",    title: "The Rest Lounge",        subtitle: "Tea · Silence",             image: IMG.candles,   span: "md:col-span-4" },
  { id: 6, category: "recovery",  title: "Ceragem Room",           subtitle: "Jade heat therapy",         image: IMG.treatment, span: "md:col-span-4" },
  { id: 7, category: "amenities", title: "Rain Showers",           subtitle: "Private stalls",            image: IMG.spa2,      span: "md:col-span-5" },
  { id: 8, category: "lounge",    title: "The Reading Nook",       subtitle: "Natural light · Books",     image: IMG.yoga,      span: "md:col-span-7" },
  { id: 9, category: "amenities", title: "The Water Bar",          subtitle: "Keragen · Herbal tea",      image: IMG.stones,    span: "md:col-span-6" },
  { id: 10, category: "lounge",   title: "Reception",              subtitle: "Where every ritual begins", image: IMG.spa,       span: "md:col-span-6" },
];

const hygieneSteps = [
  {
    icon: RefreshCw,
    title: "Between every session",
    desc: "Full sanitiser fogging, linen replacement, and surface wipe-down after every guest — no shortcuts.",
  },
  {
    icon: Droplets,
    title: "Water quality testing",
    desc: "Plunge water tested every four hours. Temperature and pH logged. Chlorine-free filtration throughout.",
  },
  {
    icon: Wind,
    title: "Air circulation",
    desc: "HEPA-filtered ventilation exchanges the air in every room six times per hour. Independent climate zones per suite.",
  },
  {
    icon: Thermometer,
    title: "Temperature calibration",
    desc: "Sauna, steam and plunge temperatures calibrated every morning and verified mid-day. You see the numbers at the door.",
  },
  {
    icon: ShieldCheck,
    title: "Trained professionals",
    desc: "Every attendant is certified in hygiene protocols, first aid, and cold-water safety. Re-certified every six months.",
  },
  {
    icon: Leaf,
    title: "Eco-conscious cleaning",
    desc: "Plant-based, non-toxic cleaning products only. No harsh chemicals in rooms where guests spend hours.",
  },
];

const amenities = [
  { icon: ShowerHead, title: "Rain Showers",    desc: "Six private shower stalls with heated floors and premium bath products." },
  { icon: Droplets,   title: "Keragen Water Bar",desc: "Complimentary filtered and mineralised water throughout your visit." },
  { icon: Coffee,     title: "Herbal Tea Service",desc: "A rotating selection of caffeine-free herbal infusions in the lounge." },
  { icon: Lock,       title: "Private Lockers", desc: "Secure lockers for every guest with digital locks and phone-charging." },
  { icon: Wifi,       title: "Wi-Fi Everywhere",desc: "High-speed Wi-Fi across the entire studio — work before or after your ritual." },
  { icon: Car,        title: "Valet Parking",   desc: "Complimentary valet on weekends. Self-parking available on-site." },
  { icon: Bike,       title: "Bike Parking",    desc: "Secure bicycle parking with repair kit for those who ride in." },
  { icon: Sun,        title: "Reading Nook",    desc: "A sun-lit corner with curated books on wellness, ritual, and slow living." },
];

const stats = [
  { value: 4200, suffix: " sq ft", label: "Of curated space" },
  { value: 8,    suffix: "",       label: "Ritual suites" },
  { value: 6,    suffix: "",       label: "Shower stalls" },
  { value: 24,   suffix: "/7",     label: "Air filtration" },
];

const faqs = [
  { q: "Is the space temperature-controlled year-round?", a: "Yes. Every suite has independent climate control. The lounge, reception and changing rooms stay between 22–24°C all year." },
  { q: "What should I bring?",                            a: "Just yourself. We provide towels, robes, sandals, bath products and lockers. Many guests bring their own water bottle — we'll fill it at the bar." },
  { q: "Is the studio wheelchair accessible?",            a: "Yes. Elevator access to all floors, wide doorways throughout, and a fully accessible shower and toilet on the ground floor." },
  { q: "Can I arrive early or stay after my session?",    a: "Yes. Guests are welcome to arrive 15 minutes early and stay up to 30 minutes after in the lounge. We ask you to keep noise minimal to preserve the calm." },
  { q: "What are your opening hours?",                    a: "Monday–Friday 9 AM to 9 PM. Saturday–Sunday 9 AM to 8 PM. Last session starts 90 minutes before close." },
];

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function SpaceClient() {
  return (
    <div className="bg-[#080906] min-h-screen">
      <Hero />
      <Philosophy />
      <Stats />
      <Gallery />
      <Hygiene />
      <Amenities />
      <VisitInfo />
      <FAQ />
      <FinalCTA />
    </div>
  );
}

/* ═══════════════════════════════════════════
   1. HERO
═══════════════════════════════════════════ */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const word1 = "The Space".split("");
  const word2 = "Between.".split("");

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[95vh] overflow-hidden bg-[#080906] pt-40 pb-16"
    >
      {/* Background image with parallax */}
      <motion.div
        style={{ y: imgY }}
        className="absolute inset-0 -top-20 -bottom-20"
      >
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.55 }}
          transition={{ duration: 2.4, ease: easeOut }}
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${IMG.spa}')` }}
        />
      </motion.div>

      {/* Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-[#080906]/70 to-[#080906]/40" />
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#080906_100%)] opacity-90" /> */}

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none z-20"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Corner accents */}
      {/* <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 1.2, ease: easeOut }}
        className="absolute top-24 left-8 md:top-28 md:left-12 w-16 h-16 border-t-2 border-l-2 border-[#C9944A]/70 z-20"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 1.4, ease: easeOut }}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 w-16 h-16 border-b-2 border-r-2 border-[#C9944A]/70 z-20"
      /> */}

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 h-[calc(95vh-12rem)] max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16 flex flex-col justify-between"
      >
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase"
        >
          <Link href="/" className="text-white/40 hover:text-[#C9944A] transition-colors">
            Home
          </Link>
          <span className="w-3 h-[1px] bg-white/20" />
          <span className="text-[#C9944A]">Our Space</span>
        </motion.div>

        {/* Center headline */}
        <div className="text-center">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: easeOut }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <span className="h-[1px] w-10 md:w-14 bg-[#C9944A]/60" />
            <span className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
              Step Inside
            </span>
            <span className="h-[1px] w-10 md:w-14 bg-[#C9944A]/60" />
          </motion.div> */}

          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[8rem] text-white font-light leading-[0.88] tracking-tight mb-20">
            <span className="block overflow-hidden">
              {word1.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.05, ease: easeOut }}
                  className="inline-block"
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </span>
            <span className="block overflow-hidden mt-1">
              {word2.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 1, delay: 0.9 + i * 0.05, ease: easeOut }}
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
            className="text-white/55 text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed"
          >
            Hand-crafted interiors. Meticulous hygiene. Thoughtful amenities.
            A sanctuary designed for slowing down.
          </motion.p>
        </div>

        {/* Bottom bar */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8, ease: easeOut }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.3em] text-white/40">
            <span className="flex items-center gap-1.5">
              <MapPin size={11} className="text-[#C9944A]" /> Mumbai, IN
            </span>
            <span className="flex items-center gap-1.5">
              <Camera size={11} className="text-[#C9944A]" /> {gallery.length} views
            </span>
          </div>
          <Link
            href="#gallery"
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#C9944A] hover:text-[#E3D9C9] transition-colors"
          >
            Explore gallery
            <ArrowRight size={12} />
          </Link>
        </motion.div> */}
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   2. PHILOSOPHY (large centered statement)
═══════════════════════════════════════════ */
function Philosophy() {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 xl:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <Sparkles size={14} className="text-[#C9944A]" />
          <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
            The Design
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.1, ease: easeOut }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.15] mb-8"
        >
          Every material, every temperature, every moment —{" "}
          <span className="italic text-[#E3D9C9]">
            chosen with intention.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.25, ease: easeOut }}
          className="text-white/50 text-base md:text-lg leading-[1.8] max-w-2xl mx-auto"
        >
          We built Avenue to feel like the best version of your own home —
          warm materials, gentle light, and a rhythm that never rushes you.
          Cedar, limestone, and brushed bronze. Soft water, warm towels, and
          silence when you need it most.
        </motion.p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   3. STATS (animated counters)
═══════════════════════════════════════════ */
function Stats() {
  return (
    <div className="relative w-full border-y border-white/5 bg-[#080906]">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <StatItem key={i} {...s} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, suffix, label, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    const startVal = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (value - startVal) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: easeOut }}
      className="text-center md:text-left md:border-l md:border-white/10 md:pl-8 first:md:border-l-0 first:md:pl-0"
    >
      <div className="font-serif text-4xl md:text-6xl text-[#E3D9C9] font-light leading-none tabular-nums">
        {count.toLocaleString()}
        {suffix && <span className="text-white/30 text-lg md:text-2xl ml-1">{suffix}</span>}
      </div>
      <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/40 mt-3">
        {label}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   4. FILTERABLE GALLERY
═══════════════════════════════════════════ */
function Gallery() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);

  const filtered = activeFilter === "all"
    ? gallery
    : gallery.filter((g) => g.category === activeFilter);

  const openLightbox = (img) => setLightbox(img);
  const closeLightbox = () => setLightbox(null);
  const nextImage = () => {
    const idx = filtered.findIndex((g) => g.id === lightbox.id);
    setLightbox(filtered[(idx + 1) % filtered.length]);
  };
  const prevImage = () => {
    const idx = filtered.findIndex((g) => g.id === lightbox.id);
    setLightbox(filtered[(idx - 1 + filtered.length) % filtered.length]);
  };

  useEffect(() => {
    if (!lightbox) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, filtered]);

  return (
    <section id="gallery" className="relative w-full bg-[#080906] py-20 md:py-20 scroll-mt-20">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: easeOut }}
              className="flex items-center gap-3 mb-5"
            >
              <Camera size={14} className="text-[#C9944A]" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
                Inside The Studio
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: easeOut }}
              className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-light leading-[1.02]"
            >
              A gallery of{" "}
              <span className="italic text-[#E3D9C9]">the space.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: easeOut }}
            className="text-white/40 text-xs uppercase tracking-[0.25em] md:text-right"
          >
            Click any image to enlarge
            <br />
            <span className="text-[#C9944A]">Use arrow keys to navigate</span>
          </motion.p>
        </div>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: easeOut }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {filters.map((f) => {
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`relative px-5 py-2.5 rounded-full border text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300 ${
                  active
                    ? "border-[#C9944A] text-[#080906]"
                    : "border-white/15 text-white/60 hover:border-[#C9944A]/50 hover:text-white"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="filter-pill"
                    className="absolute inset-0 bg-[#C9944A] rounded-full"
                    transition={{ duration: 0.4, ease: easeOut }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 auto-rows-[220px] md:auto-rows-[240px]"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: easeOut }}
                onClick={() => openLightbox(item)}
                className={`relative overflow-hidden rounded-xl group ${item.span || "md:col-span-4"}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-[#080906]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-left">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-[#C9944A] font-bold mb-1.5">
                    {item.subtitle}
                  </div>
                  <h3 className="font-serif text-lg md:text-xl text-white font-light leading-tight">
                    {item.title}
                  </h3>
                </div>
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#080906] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <ArrowUpRight size={14} />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[300] bg-[#080906]/98 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>

            {/* Image */}
            <motion.div
              key={lightbox.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full max-h-[85vh] flex flex-col items-center"
            >
              <img
                src={lightbox.image}
                alt={lightbox.title}
                className="max-w-full max-h-[78vh] rounded-xl object-contain"
              />
              <div className="mt-4 text-center">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-bold mb-1">
                  {lightbox.subtitle}
                </div>
                <div className="font-serif text-2xl text-white font-light">
                  {lightbox.title}
                </div>
              </div>
            </motion.div>

            {/* Progress dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {filtered.map((f) => (
                <div
                  key={f.id}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    f.id === lightbox.id ? "w-6 bg-[#C9944A]" : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ═══════════════════════════════════════════
   5. HYGIENE STANDARDS (cream background)
═══════════════════════════════════════════ */

function Hygiene() {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 overflow-hidden">

      {/* Subtle Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16 relative z-10">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">

          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: easeOut }}
              className="flex items-center gap-3 mb-5"
            >
              <span className="h-[1px] w-10 bg-[#C8A165]/70" />

              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C8A165] font-semibold">
                Hygiene Standards
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: easeOut }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#E3D9C9] font-light leading-[1.05]"
            >
              Cleanliness is{" "}
              <span className="italic text-[#C8A165]">
                non-negotiable.
              </span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: easeOut }}
            className="text-white/55 text-base leading-[1.8] md:pt-10"
          >
            Every surface, every linen, every litre of water — cleaned, tested
            and verified against protocols we don't compromise on. Here's
            exactly how we keep the space immaculate.
          </motion.p>

        </div>

        {/* Hygiene Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">

          {hygieneSteps.map((step, i) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.08,
                  ease: easeOut,
                }}
                className="relative p-7 rounded-2xl bg-[#11120F] border border-white/[0.07] hover:bg-[#171711] hover:border-[#C8A165]/40 transition-all duration-500 group"
              >

                {/* Icon & Number */}
                <div className="flex items-start justify-between mb-5">

                  <div className="w-12 h-12 rounded-xl bg-[#1C1A14] border border-[#C8A165]/25 flex items-center justify-center group-hover:bg-[#C8A165]/10 group-hover:border-[#C8A165]/50 transition-all duration-500">
                    <Icon
                      size={20}
                      className="text-[#C8A165]"
                      strokeWidth={1.5}
                    />
                  </div>
{/* 
                  <span className="font-serif italic text-3xl text-[#C8A165]/30 font-light leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span> */}

                </div>

                {/* Content */}
                <h3 className="font-serif text-xl text-[#E3D9C9] font-light mb-2 leading-tight group-hover:text-[#C8A165] transition-colors duration-300">
                  {step.title}
                </h3>

                <p className="text-white/50 text-sm leading-relaxed">
                  {step.desc}
                </p>

              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════
   6. AMENITIES
═══════════════════════════════════════════ */
function Amenities() {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 border-t border-white/5">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="max-w-2xl mb-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="flex items-center gap-3 mb-5"
          >
            <Sparkles size={14} className="text-[#C9944A]" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
              Included With Every Visit
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: easeOut }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.05]"
          >
            Little things,{" "}
            <span className="italic text-[#E3D9C9]">done right.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {amenities.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: easeOut }}
                className="group relative p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-[#C9944A]/40 transition-colors duration-500"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9944A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 rounded-xl bg-[#C9944A]/10 border border-[#C9944A]/30 flex items-center justify-center mb-5 group-hover:bg-[#C9944A]/20 transition-colors duration-500">
                  <Icon size={18} className="text-[#C9944A]" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg text-white font-light mb-2 leading-tight">
                  {a.title}
                </h3>
                <p className="text-white/45 text-xs leading-relaxed">{a.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   7. VISIT INFO (map + hours split)
═══════════════════════════════════════════ */
function VisitInfo() {
  return (
    <section className="relative w-full bg-[#080906] py-20 md:py-20 border-t border-white/5">
      <div className="max-w-[1500px] mx-auto px-6 md:px-10 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT: image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: easeOut }}
            className="relative h-[400px] lg:h-[560px] rounded-2xl overflow-hidden group"
          >
            <img
              src={IMG.spa}
              alt="Avenue Retreat exterior"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-transparent to-transparent" />
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#C9944A]/70" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#C9944A]/70" /> */}
          </motion.div>

          {/* RIGHT: info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: easeOut }}
          >
            <div className="flex items-center gap-3 mb-5">
              <Sparkles size={14} className="text-[#C9944A]" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
                Plan Your Visit
              </span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-light leading-[1.05] mb-8">
              Come find{" "}
              <span className="italic text-[#E3D9C9]">your stillness.</span>
            </h2>

            {/* Hours */}
            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 flex items-center justify-center shrink-0">
                  <Clock size={15} className="text-[#C9944A]" />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">
                    Hours
                  </div>
                  <div className="text-white/85 text-sm">
                    Monday–Friday · 9 AM – 9 PM
                  </div>
                  <div className="text-white/85 text-sm">
                    Saturday–Sunday · 9 AM – 8 PM
                  </div>
                  <div className="text-[#C9944A]/80 text-[11px] mt-1">
                    Last session starts 90 minutes before close
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-[#C9944A]" />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">
                    Address
                  </div>
                  <div className="text-white/85 text-sm leading-relaxed">
                    123 Wellness Avenue, Bandra West<br />
                    Mumbai, MH 400050
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 flex items-center justify-center shrink-0">
                  <CalendarDays size={15} className="text-[#C9944A]" />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">
                    Appointments
                  </div>
                  <div className="text-white/85 text-sm">
                    Walk-ins welcome · Booking recommended
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/book"
                className="group relative px-8 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] tracking-[0.3em] uppercase font-bold overflow-hidden  transition-shadow duration-500 text-center"
              >
                <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Book a Visit
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-full border border-white/20 text-[#E3D9C9] text-[11px] tracking-[0.3em] uppercase hover:border-[#C9944A]/70 transition-colors duration-500 text-center"
              >
                Get Directions
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   8. FAQ
═══════════════════════════════════════════ */
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
                Before You Visit
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
              A few things guests often ask before their first visit. Anything
              else, just drop us a message.
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

/* ═══════════════════════════════════════════
   9. FINAL CTA
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
            Visit In Person
          </span>
          <span className="h-[1px] w-12 bg-[#C9944A]/60" />
        </motion.div> */}

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1, ease: easeOut }}
          className="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-light leading-[0.95] mb-6"
        >
          The best way to know{" "}
          <span className="italic bg-gradient-to-r from-[#E3D9C9] via-[#C9944A] to-[#E3D9C9] bg-clip-text text-transparent">
            is to feel.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.25, ease: easeOut }}
          className="text-white/50 text-base max-w-md mx-auto leading-relaxed mb-10"
        >
          Book a ritual — or just drop by for a walkthrough. We'd love to show
          you around.
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
            href="/contact"
            className="px-10 py-4 rounded-full border border-white/20 text-[#E3D9C9] text-[11px] tracking-[0.3em] uppercase hover:border-[#C9944A]/70 transition-colors duration-500"
          >
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </section>
  );
}