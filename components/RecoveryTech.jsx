"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Activity, Zap, Shield, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const defaultTechImage =
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop";

const getTechIcon = (title, category) => {
  const lowerTitle = (title || "").toLowerCase();
  const lowerCat = (category || "").toLowerCase();

  if (lowerTitle.includes("ceragem") || lowerTitle.includes("massage") || lowerTitle.includes("bed")) {
    return <Activity size={20} />;
  }
  if (lowerTitle.includes("thz") || lowerTitle.includes("teta") || lowerTitle.includes("terahertz")) {
    return <Zap size={20} />;
  }
  if (lowerTitle.includes("pulse") || lowerTitle.includes("pelvic") || lowerTitle.includes("chair")) {
    return <Shield size={20} />;
  }
  if (lowerTitle.includes("exopod") || lowerTitle.includes("infrared") || lowerCat.includes("heat")) {
    return <Sparkles size={20} />;
  }

  return <Sparkles size={20} />;
};

const resolveImageUrl = (heroImage) => {
  if (!heroImage) return defaultTechImage;
  if (heroImage.startsWith("http")) return heroImage;
  const cleanPath = heroImage.startsWith("/") ? heroImage : `/${heroImage}`;
  return `${API_ORIGIN}${cleanPath}`;
};

// --- INDIVIDUAL TECH ITEM COMPONENT FOR PARALLAX ---
const TechItem = ({ item, index }) => {
  const ref = useRef(null);
  const isEven = index % 2 === 0;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div
      ref={ref}
      className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-0 relative ${
        isEven ? "" : "lg:flex-row-reverse"
      }`}
    >
      {/* IMAGE SIDE (Parallax) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full lg:w-[55%] relative group z-10 ${
          isEven ? "lg:-mr-12" : "lg:-ml-12"
        }`}
      >
        <div className="relative aspect-[4/3] lg:aspect-[16/10] overflow-hidden bg-[#1A1A1A]">
          <motion.div
            style={{ y: imageY }}
            className="absolute inset-0 w-full h-[120%] -top-[10%]"
          >
            <img
              src={item.image}
              alt={item.title}
              className="object-cover w-full h-full transition-transform duration-[2s] ease-out group-hover:scale-110 opacity-70 group-hover:opacity-90"
            />
          </motion.div>

          {/* Floating Glass Tag */}
          <div className="absolute top-8 left-8 bg-[#0A0B09]/50 backdrop-blur-xl border border-white/10 px-5 py-3 flex items-center gap-3">
            <span className="text-[#9A6B3F]">{item.icon}</span>
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-white">
              {item.tag}
            </span>
          </div>
        </div>
      </motion.div>

      {/* TEXT SIDE (Overlapping) */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full lg:w-[45%] relative z-20 ${
          isEven ? "lg:pl-20" : "lg:pr-20"
        }`}
      >
        <div className="bg-[#0A0B09]/90 backdrop-blur-2xl p-10 md:p-14 border border-white/5 shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-[1px] bg-[#9A6B3F]" />
              <p className="text-[#9A6B3F] text-[10px] tracking-[0.3em] uppercase font-bold">
                {item.subtitle}
              </p>
            </div>

            <h3 className="font-serif text-3xl md:text-5xl font-light mb-6 text-white leading-tight">
              {item.title}
            </h3>

            <p className="text-[#A89C8C] text-sm md:text-[15px] leading-loose font-light mb-10">
              {item.desc}
            </p>

            <Link
              href={`/book?service=${encodeURIComponent(item.title)}`}
              className="inline-flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase text-white group pb-2 border-b border-white/20 hover:text-[#9A6B3F] hover:border-[#9A6B3F] transition-colors"
            >
              RESERVE SESSION
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function RecoveryTech() {
  const [techList, setTechList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;

    const fetchRecoveryTech = async () => {
      try {
        setErrorMsg("");
        const { data } = await axios.get(`${API_URL}/services`);
        const raw = Array.isArray(data)
          ? data
          : data?.services || data?.data || [];

        const techMatches = raw.filter((item) => {
          const cat = (item.category || "").toLowerCase();
          const title = (item.title || "").toLowerCase();
          return (
            cat.includes("recovery") ||
            cat.includes("tech") ||
            title.includes("ceragem") ||
            title.includes("thz") ||
            title.includes("teta") ||
            title.includes("pulse") ||
            title.includes("pelvic") ||
            title.includes("exopod") ||
            title.includes("infrared")
          );
        });

        const sourceItems = techMatches.length > 0 ? techMatches : raw;

        if (active) {
          const formatted = sourceItems.map((item, idx) => ({
            id: item._id || String(idx + 1).padStart(2, "0"),
            title: item.title,
            subtitle: item.subtitle || item.category || "Advanced Recovery",
            desc:
              item.intro ||
              (Array.isArray(item.overview) ? item.overview[0] : item.overview) ||
              item.description ||
              "Advanced recovery technology tailored for deep restoration.",
            image: resolveImageUrl(item.heroImage),
            icon: getTechIcon(item.title, item.category),
            tag: item.category || "Recovery Tech",
          }));

          setTechList(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch recovery tech from backend:", error);
        if (active) {
          setTechList([]);
          setErrorMsg("Unable to load recovery technology from backend.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRecoveryTech();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative w-full py-16 md:py-20 bg-[#0A0B09] overflow-hidden text-white">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#9A6B3F]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-[1500px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="w-12 h-[1px] bg-[#9A6B3F]" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-[#9A6B3F] font-semibold">
              Advanced Technology
            </span>
            <span className="w-12 h-[1px] bg-[#9A6B3F]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-light leading-tight"
          >
            Recovery, <span className="italic text-[#E3D9C9]">redefined.</span>
          </motion.h2>
        </div>

        {/* Loading / Error / Empty / Z-Pattern Showcase */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#9A6B3F]" size={36} />
          </div>
        ) : errorMsg ? (
          <div className="text-center py-16 text-sm text-red-300/80">
            {errorMsg}
          </div>
        ) : techList.length === 0 ? (
          <div className="text-center py-16 text-sm text-white/45">
            No recovery technology items found in backend.
          </div>
        ) : (
          <div className="flex flex-col gap-32 md:gap-48">
            {techList.map((item, index) => (
              <TechItem key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}