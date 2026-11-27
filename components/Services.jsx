"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Flame,
  Snowflake,
  Droplets,
  Activity,
  Sun,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowUpRight,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Helper to map backend categories to Lucide icons
const getIcon = (title, category) => {
  const lowerTitle = (title || "").toLowerCase();
  const lowerCat = (category || "").toLowerCase();

  if (lowerTitle.includes("sauna") || lowerTitle.includes("steam") || lowerCat.includes("heat")) return <Flame />;
  if (lowerTitle.includes("plunge") || lowerTitle.includes("cold") || lowerCat.includes("cold")) return <Snowflake />;
  if (lowerTitle.includes("hammam") || lowerTitle.includes("bath") || lowerCat.includes("bathing")) return <Sparkles />;
  if (lowerTitle.includes("pool") || lowerTitle.includes("shower") || lowerCat.includes("amenity")) return <Droplets />;
  if (lowerTitle.includes("ceragem") || lowerCat.includes("recovery tech")) return <Activity />;
  if (lowerTitle.includes("exopod") || lowerTitle.includes("infrared")) return <Sun />;
  if (lowerTitle.includes("pulse") || lowerTitle.includes("pelvic") || lowerTitle.includes("massage")) return <User />;

  // Default fallback
  return <Sparkles />;
};

const DecorativeDivider = () => (
  <div className="flex items-center justify-center gap-4 my-5 opacity-80">
    <span className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent to-[#E3D9C9]/60" />
    <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
      <path d="M12 0V12M12 12L8 8M12 12L16 8M0 6L6 6M18 6L24 6" stroke="#E3D9C9" strokeWidth="1.2" />
    </svg>
    <span className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent to-[#E3D9C9]/60" />
  </div>
);

export default function Facilities() {
  const router = useRouter();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/services`);
        const rawData = Array.isArray(data) ? data : data.services || data.data || [];

        const formatted = rawData.map((item, idx) => ({
          id: item._id || `${item.title}-${idx}`,
          title: item.title,
          category: item.category || "Ritual",
          desc: item.intro || (item.overview && item.overview[0]) || "Experience our premium facility.",
          icon: getIcon(item.title, item.category || ""),
        }));

        setFacilities(formatted);
      } catch (error) {
        console.error("Failed to load facilities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  const handleSelectFacility = (title) => {
    router.push(`/book?service=${encodeURIComponent(title)}`);
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden py-24 bg-[#080906]">
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/h1-img-1-1.jpg')" }}
      />

      {/* BACKGROUND OVERLAY */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[#C49A68] text-[10px] tracking-[0.4em] uppercase font-semibold mb-3"
          >
            Explore The Retreat
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-7xl text-[#F5F0E8] font-light tracking-wide"
          >
            Our Amenities
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <DecorativeDivider />
          </motion.div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="w-full flex justify-center py-20">
            <Loader2 className="animate-spin text-[#C49A68]" size={40} />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && facilities.length === 0 && (
          <div className="w-full text-center py-20 text-white/50">
            No facilities available at the moment.
          </div>
        )}

        {/* FACILITIES GRID */}
        {!loading && facilities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-white/20 shadow-2xl">
            {facilities.map((item, index) => (
              <motion.div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectFacility(item.title)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectFacility(item.title);
                  }
                }}
                aria-label={`Book ${item.title}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.07 }}
                className="group relative h-[420px] md:h-[440px] border-r border-b border-white/20 overflow-hidden cursor-pointer isolation-isolate focus:outline-none focus:ring-2 focus:ring-[#C49A68]"
              >
                {/* DEFAULT CARD CONTENT */}
                <div className="absolute inset-0 flex flex-col items-center justify-between py-12 px-6 opacity-100 group-hover:opacity-0 transition-opacity duration-500 ease-in-out">
                  {/* DOWN ARROW */}
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="w-10 h-10 rounded-full border border-white/30 bg-black/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <ChevronDown size={17} className="text-white" strokeWidth={1.2} />
                  </motion.div>

                  {/* ICON AND TITLE */}
                  <div className="flex flex-col items-center">
                    <div className="text-white/90 mb-7 transition-transform duration-700 group-hover:scale-90">
                      {React.cloneElement(item.icon, { size: 58, strokeWidth: 0.9 })}
                    </div>
                    <h3 className="font-serif text-2xl text-white font-light tracking-wide text-center drop-shadow-lg">
                      {item.title}
                    </h3>
                  </div>

                  <div className="h-10" />
                </div>

                {/* GLASSMORPHISM HOVER CONTENT */}
                <div className="absolute inset-0 z-10 mx-3 flex flex-col justify-between px-7 py-8 md:px-8 md:py-8 bg-[#292725]/0 backdrop-blur-none border-x border-transparent opacity-0 group-hover:opacity-100 group-hover:bg-[#292725]/55 group-hover:backdrop-blur-xl group-hover:border-white/60 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none">
                  {/* TOP RIGHT ARROW */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#E3D9C9] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      Book Ritual
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-10 rounded-full border border-white/80 flex items-center justify-center text-white bg-transparent group-hover:bg-white/10 transition-all duration-500">
                        <ChevronUp size={19} strokeWidth={1.2} />
                      </div>
                      {/* <div className="w-10 h-10 rounded-full bg-[#C9944A] text-[#080906] flex items-center justify-center shadow-lg">
                        <ArrowUpRight size={17} strokeWidth={2} />
                      </div> */}
                    </div>
                  </div>

                  {/* BOTTOM CONTENT */}
                  <div className="flex flex-col items-start">
                    {/* ICON */}
                    <div className="text-white mb-6 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100">
                      {React.cloneElement(item.icon, { size: 82, strokeWidth: 0.75 })}
                    </div>

                    {/* TITLE */}
                    <h3 className="font-serif text-[27px] md:text-[30px] text-white font-light leading-tight mb-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-150">
                      {item.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-white/90 text-[14px] md:text-[15px] leading-[1.8] font-light opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-200">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}