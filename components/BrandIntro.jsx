"use client";

import React from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function BrandIntro() {
  const marqueeItems = [
    "SAUNA", "COLD PLUNGE", "RECOVERY TECH", "HYDROTHERAPY", "LONGEVITY", "HAMMAM", "RESTORATION"
  ];

  // This is the style object that applies your Elementor CSS variables
  const elementorHighlightStyle = {
    fontFamily: "var(--e-global-typography-450773f-font-family), Sans-serif",
    fontSize: "var(--e-global-typography-450773f-font-size)",
    fontStyle: "var(--e-global-typography-450773f-font-style)",
    lineHeight: "var(--e-global-typography-450773f-line-height)",
    color: "var(--e-global-color-accent)", 
    // Fallback to the gold color if the variable isn't loaded on this page
    color: "#B08D6A", 
  };

  return (
    <section className="relative w-full  bg-[#1A1A1A] overflow-hidden font-sans">
      
      {/* 1. INFINITE SCROLLING MARQUEE */}
      <div className=" py-4 overflow-hidden flex whitespace-nowrap bg-[#1A1A1A]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
          className="flex items-center gap-6 text-[#B08D6A] text-[9px] md:text-[10px] tracking-[0.3em] uppercase"
        >
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
            <React.Fragment key={index}>
              <span className="font-semibold">{item}</span>
              <span className="text-[#B08D6A] text-sm leading-none mx-2">•</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* 2. EDITORIAL BRAND INTRO */}
      <div className="w-full max-w-[1500px] mx-auto px-6 md:px-12 py-16 md:py-24 relative flex flex-col min-h-[85vh] justify-between">
        
        {/* --- TOP SECTION: About Us Label --- */}
        <div className="w-full flex justify-start items-start">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2"
          >
            <Leaf size={16} className="text-[#B08D6A]" />
            <span className="text-[18px] tracking-[0.1em] text-[#B08D6A] font-medium">
              About Us
            </span>
          </motion.div>
        </div>

        {/* --- MIDDLE SECTION: Right-Aligned Typography --- */}
        <div className="flex-grow flex items-center justify-end mt-20 md:mt-0 w-full pb-16">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } }
            }}
            className="text-[#F8F6F0] text-[38px] md:text-[52px] lg:text-[64px] leading-[1.15] font-medium tracking-tight max-w-5xl text-left md:text-right"
          >
            <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="block">
              Creating Serene Spaces Where
            </motion.span>
            <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="block mt-2">
              
              {/* APPLYING YOUR CUSTOM ELEMENTOR FONT HERE */}
              <span style={elementorHighlightStyle}>Beauty</span>,{" "}
              <span style={elementorHighlightStyle}>Wellness</span>, and{" "}
              <span style={elementorHighlightStyle}>Inner Peace</span>
              
            </motion.span>
            <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="block mt-2">
              Come Together.
            </motion.span>
          </motion.h2>
        </div>

        {/* --- BOTTOM SECTION: Play Button & Text (Aligned Right) --- */}
        <div className="w-full flex flex-col md:flex-row justify-center md:justify-end items-center gap-12 md:gap-24 mt-12 md:mt-0 pr-0 md:pr-12">
          
          {/* Bottom Left: Rotating Play Button */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative w-36 h-36 md:w-44 md:h-44 flex-shrink-0 group cursor-pointer"
          >
            {/* Solid White Background Circle */}
            <div className="absolute inset-0 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow duration-500 group-hover:shadow-[0_8px_30px_rgba(176,141,106,0.2)]" />

            {/* Rotating Text */}
            <motion.svg 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              viewBox="0 0 100 100" 
              className="w-full h-full relative z-10"
            >
              <path id="circlePath" d="M 50, 50 m -41, 0 a 41,41 0 1,1 82,0 a 41,41 0 1,1 -82,0" fill="none" />
              <text className="text-[9px] uppercase tracking-[0.28em] fill-[#4A4A4A] font-medium transition-colors duration-500 group-hover:fill-[#B08D6A]">
                <textPath href="#circlePath">
                  PLAY VIDEO ✦ PLAY VIDEO ✦ PLAY VIDEO ✦ 
                </textPath>
              </text>
            </motion.svg>
            
            {/* Inner Circle & Play Icon */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[#D0BA9E] rounded-full flex items-center justify-center group-hover:bg-[#B08D6A] transition-colors duration-500 shadow-sm">
                <svg width="12" height="14" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                  <path d="M14 8L0.5 15.5V0.5L14 8Z" fill="#333333" className="group-hover:fill-white transition-colors duration-500"/>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Bottom Right: Paragraph */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-[400px] flex-shrink-0"
          >
            <p className="text-[#666666] text-[15px] leading-[1.8] font-normal">
              At Elaris, we believe self-care is not a luxury, it’s a necessity. Our philosophy blends traditional healing rituals with modern wellness techniques.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}