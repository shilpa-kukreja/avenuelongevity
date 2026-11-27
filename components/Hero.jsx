"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, Play, MoveRight, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// --- MAGNETIC BUTTON COMPONENT ---
const MagneticButton = ({ children, className }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function Hero() {
  const router = useRouter();

  // --- PARALLAX EFFECT ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 80, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 80, damping: 20 });

  const handleMouseMove = (e) => {
    const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - left) / width - 0.5);
    y.set((e.clientY - top) / height - 0.5);
  };

  const bgX = useTransform(mouseXSpring, [-0.5, 0.5], ["-1%", "1%"]);
  const bgY = useTransform(mouseYSpring, [-0.5, 0.5], ["-1%", "1%"]);
  const textX = useTransform(mouseXSpring, [-0.5, 0.5], ["8px", "-8px"]);
  const textY = useTransform(mouseYSpring, [-0.5, 0.5], ["8px", "-8px"]);

  // --- ANIMATION VARIANTS ---
  const letterReveal = {
    hidden: { y: "100%", rotate: 2, opacity: 0 },
    visible: { 
      y: 0, 
      rotate: 0, 
      opacity: 1,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  // --- CONCIERGE WIDGET STATE ---
  const [calendarData, setCalendarData] = useState({ currentMonth: "", currentYear: "", days: [], todayDate: null });
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState("");

  // Fetch Services for Dropdown
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/services`);
        const rawServices = Array.isArray(data) ? data : data.services || data.data || [];
        setServices(rawServices);
      } catch (error) {
        console.error("Failed to load services", error);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Generate Calendar
  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toLocaleDateString("en-US", { month: "long" });
    const currentYear = today.getFullYear();
    
    const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, today.getMonth(), 1).getDay();
    const startDayOffset = (firstDayOfMonth + 6) % 7; 

    const days = [];
    for (let i = 0; i < startDayOffset; i++) days.push({ day: "", isCurrentMonth: false });
    
    for (let i = 1; i <= daysInMonth; i++) {
      const isPast = i < today.getDate();
      const dateString = `${currentYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, isCurrentMonth: true, isPast, dateString });
    }

    setCalendarData({ currentMonth, currentYear, days, todayDate: today.getDate() });
  }, []);

  const handleDateClick = (dayObj) => {
    if (!dayObj.isCurrentMonth || dayObj.isPast) return;
    setSelectedDate(dayObj.dateString);
  };

  const handleCheckAvailability = () => {
    let url = "/book?";
    if (selectedDate) url += `date=${selectedDate}&`;
    if (selectedService) url += `service=${encodeURIComponent(selectedService)}`;
    router.push(url);
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full overflow-hidden bg-[#0A0B09] flex items-center"
    >
      {/* 1. BACKGROUND IMAGE */}
      <motion.div
        style={{ x: bgX, y: bgY, backgroundImage: "url('/hero2.jpeg')", backgroundPosition: "70% 30%" }}
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat"
      />
      
      {/* 2. CINEMATIC GRADIENT MASKS */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B09] via-[#0A0B09]/50 to-transparent" />

      {/* MAIN CONTENT GRID */}
      <div className="relative z-10 w-full mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between pt-32 md:pt-40 pb-20">
        
        {/* LEFT SIDE: Typography & CTA */}
        <motion.div style={{ x: textX, y: textY }} className="w-full lg:w-[55%] text-white flex flex-col items-start z-10">
          <h1 className="font-serif text-[40px] md:text-[55px] lg:text-[70px] leading-[1.05] font-light mb-6 text-white drop-shadow-2xl">
            <div className="overflow-hidden pb-2">
              <motion.div variants={letterReveal} initial="hidden" animate="visible">
                THE ART OF
              </motion.div>
            </div>
            <div className="overflow-hidden pb-4">
              <motion.div variants={letterReveal} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="italic font-light text-[#E3D9C9]">
                RESTORATION<span className="text-[#9A6B3F]">.</span>
              </motion.div>
            </div>
          </h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }} className="text-[#E3D9C9] text-sm md:text-base max-w-md leading-relaxed mb-10 font-light border-l border-[#9A6B3F] pl-6 drop-shadow-lg">
            Contrast therapy, ancient rituals, and advanced recovery technology. Step into a private sanctuary designed to extend your lifespan and elevate your state of being.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }} className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center">
            <MagneticButton>
              <Link href="/book" className="bg-[#F5F0E8] text-[#0A0B09] px-10 py-5 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#9A6B3F] hover:text-white transition-colors duration-500 flex items-center justify-center gap-3 group relative overflow-hidden">
                RESERVE NOW <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
            
            <button className="flex items-center gap-4 text-white text-[10px] font-medium tracking-[0.2em] uppercase group hover:text-[#E3D9C9] transition-colors drop-shadow-md">
              <span className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#9A6B3F] group-hover:border-[#9A6B3F] transition-all duration-300 relative backdrop-blur-md">
                <span className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20 group-hover:hidden" />
                <Play size={14} className="ml-1 text-white transition-colors" />
              </span>
              WATCH THE FILM
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE: CONCIERGE WIDGET */}
        <motion.div initial={{ opacity: 0, x: 50, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ duration: 1.2, delay: 0.5 }} className="w-full lg:w-auto mt-16 lg:mt-0 flex justify-center lg:justify-end z-10">
          <div className="relative group">
            <div className="relative bg-[#0A0B09]/80 backdrop-blur-2xl text-[#F5F0E8] w-[340px] p-8 border border-white/10 shadow-2xl">
              
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/10">
                <div>
                  <h3 className="font-serif text-2xl font-light text-white">{calendarData.currentMonth || "Loading..."}</h3>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#9A6B3F] mt-1">{calendarData.currentYear || "..."} Availability</p>
                </div>
                <div className="flex gap-1 bg-white/5 rounded-full p-1 opacity-50 cursor-not-allowed">
                  <ChevronRight size={14} className="rotate-180" />
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-y-3 text-center text-[11px] mb-6 font-sans tracking-wider">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-[#A89C8C] uppercase text-[8px] tracking-[0.2em] mb-2">{day}</div>
                ))}
                
                {calendarData.days.map((d, i) => {
                  if (!d.isCurrentMonth) return <div key={`empty-${i}`} className="text-white/10" />;
                  const isToday = d.day === calendarData.todayDate;
                  const isSelected = selectedDate === d.dateString;
                  
                  return (
                    <div 
                      key={`day-${d.day}`} 
                      onClick={() => handleDateClick(d)}
                      className={`py-2 rounded-full transition-colors ${
                        d.isPast ? "text-white/20 cursor-not-allowed" : 
                        isSelected ? "bg-[#9A6B3F] text-white font-medium shadow-[0_0_20px_rgba(154,107,63,0.6)] cursor-pointer" :
                        isToday ? "border border-[#9A6B3F] text-white cursor-pointer" :
                        "text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                      }`}
                    >
                      {d.day}
                    </div>
                  );
                })}
              </div>

              {/* SERVICE DROPDOWN */}
              <div className="mb-6">
                <label className="text-[9px] uppercase tracking-[0.25em] text-white/40 mb-2 block">Select Experience</label>
                <div className="relative">
                  {isLoadingServices ? (
                    <div className="w-full bg-white/5 border border-white/10 py-3 px-4 text-white text-xs flex items-center gap-2">
                       <Loader2 size={12} className="animate-spin text-[#9A6B3F]"/> Loading rituals...
                    </div>
                  ) : (
                    <>
                      <select 
                        value={selectedService} 
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white text-xs py-3 pl-4 pr-10 outline-none appearance-none cursor-pointer hover:border-[#9A6B3F] transition-colors"
                      >
                        <option value="" disabled className="bg-[#0A0B09] text-white/50">Choose a ritual...</option>
                        {services.map(s => (
                          <option key={s._id} value={s.title} className="bg-[#0A0B09] text-white">
                            {s.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A6B3F] pointer-events-none" />
                    </>
                  )}
                </div>
              </div>

              <button 
                onClick={handleCheckAvailability}
                className="w-full bg-transparent border border-[#9A6B3F] text-[#E3D9C9] py-4 text-[9px] tracking-[0.2em] font-bold uppercase hover:bg-[#9A6B3F] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn"
              >
                CHECK AVAILABILITY
                <MoveRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}