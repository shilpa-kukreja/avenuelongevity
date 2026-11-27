"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Clock, Plus } from "lucide-react";
import Link from "next/link";

// Full Services Data based on your list
const allServices = [
  { id: 1, title: "Finnish Sauna", category: "Heat", duration: "45 MIN", price: "1,500", image: "https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=2070&auto=format&fit=crop", desc: "A private heat session to relax and unwind; pairs with the cold plunge as a hot–cold ritual." },
  { id: 2, title: "Cold Plunge", category: "Cold", duration: "15 MIN", price: "1,000", image: "https://images.unsplash.com/photo-1622396054470-8b06d6ec6e2d?q=80&w=2000&auto=format&fit=crop", desc: "Guided cold-water immersion, with client-approved timing and safety guidance." },
  { id: 3, title: "Ceragem Massage Bed", category: "Recovery Tech", duration: "30 MIN", price: "1,200", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop", desc: "Automated thermal massage beds; guests lie back, pick a programme and relax." },
  { id: 4, title: "Turkish Hammam", category: "Bathing", duration: "90 MIN", price: "3,500", image: "https://images.unsplash.com/photo-1533619043865-1f5f5f7b9b4a?q=80&w=2000&auto=format&fit=crop", desc: "Steam warm-up, traditional scrub, foam wash and rinse, then rest." },
  { id: 5, title: "THz Teta-P90 Plus", category: "Recovery Tech", duration: "45 MIN", price: "2,500", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop", desc: "Advanced Terahertz wellness system for deep cellular recovery and relaxation." },
  { id: 6, title: "B Pulse Pelvic Chair", category: "Recovery Tech", duration: "30 MIN", price: "1,800", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2070&auto=format&fit=crop", desc: "Discreet, fully-clothed sessions in a private room, with guidance on the first visit." },
  { id: 7, title: "Body Massage", category: "Bodywork", duration: "60 MIN", price: "2,800", image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop", desc: "Private rooms for therapist-led massage in 30, 60 and 90-minute options." },
  { id: 8, title: "Exopod Infrared Bed", category: "Recovery Tech", duration: "40 MIN", price: "1,500", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2000&auto=format&fit=crop", desc: "An enclosed infrared pod for a quiet, private warmth session." },
];

const categories = ["All", "Heat", "Cold", "Recovery Tech", "Bathing", "Bodywork"];

export default function ServiceList() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredServices = activeCategory === "All" 
    ? allServices 
    : allServices.filter(service => service.category === activeCategory);

  return (
    <section className="relative w-full bg-[#F5F0E8] py-20 md:py-32">
      <div className="max-w-[1500px] mx-auto px-6 md:px-12">
        
        {/* ANIMATED FILTER BAR */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-6 py-3 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                activeCategory === cat ? "text-[#F5F0E8]" : "text-[#1C1E18] hover:text-[#9A6B3F]"
              }`}
            >
              {/* Animated Background Pill */}
              {activeCategory === cat && (
                <motion.div
                  layoutId="active-filter"
                  className="absolute inset-0 bg-[#1C1E18] rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {cat}
            </button>
          ))}
        </div>

        {/* EDITORIAL GRID */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          <AnimatePresence>
            {filteredServices.map((service, index) => (
              <motion.div
                layout
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                // Stagger the middle column down for an editorial feel
                className={`relative group ${index % 3 === 1 ? 'lg:mt-24' : ''}`}
              >
                <Link href={`/book?service=${service.title}`} className="block">
                  
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#E3D9C9]">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="object-cover w-full h-full transition-transform duration-[1.5s] ease-in-out group-hover:scale-110"
                    />
                    
                    {/* Dark Gradient on Hover */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

                    {/* Price Tag (Top Right) */}
                    <div className="absolute top-4 right-4 bg-[#F5F0E8]/90 backdrop-blur-md px-3 py-1.5 shadow-sm">
                      <span className="text-[10px] font-bold tracking-widest text-[#1C1E18]">₹{service.price}</span>
                    </div>

                    {/* Floating Action Button (Reveals on Hover) */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#9A6B3F] rounded-full flex items-center justify-center text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                      <Plus size={20} />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="mt-6 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-2xl text-[#1C1E18] group-hover:text-[#9A6B3F] transition-colors">
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[#A89C8C] mt-1">
                        <Clock size={12} />
                        <span className="text-[9px] uppercase tracking-wider font-semibold">{service.duration}</span>
                      </div>
                    </div>
                    
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#9A6B3F] font-bold mb-4">
                      {service.category}
                    </span>
                    
                    <p className="text-[#5A5F4A] text-sm leading-relaxed font-light mb-4 line-clamp-2">
                      {service.desc}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1C1E18] group-hover:gap-4 transition-all duration-300">
                      Book Session <ArrowUpRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}