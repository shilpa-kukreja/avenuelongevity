// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
// import { ArrowUpRight, Clock, Sparkles, Droplets, ShowerHead } from "lucide-react";
// import Link from "next/link";

// const easeOut = [0.22, 1, 0.36, 1];

// const API_BASE =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
// const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

// function resolveMediaUrl(url) {
//   if (!url) return "";
//   if (
//     url.startsWith("http://") ||
//     url.startsWith("https://") ||
//     url.startsWith("data:") ||
//     url.startsWith("blob:")
//   ) {
//     return url;
//   }
//   return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
// }

// function formatPrice(price) {
//   if (typeof price === "number") {
//     return `₹${price.toLocaleString("en-IN")}`;
//   }
//   if (typeof price === "string" && price.trim()) {
//     return price.startsWith("₹") ? price : `₹${price}`;
//   }
//   return "₹0";
// }

// function normalizeService(item, index) {
//   return {
//     id: item._id || item.id || String(index + 1).padStart(2, "0"),
//     indexLabel: String(index + 1).padStart(2, "0"),
//     slug: item.slug || "",
//     title: item.title || item.shortTitle || "Ritual",
//     category: item.category || "Wellness",
//     duration: item.duration || "45 MIN",
//     price: formatPrice(item.price),
//     image:
//       resolveMediaUrl(item.heroImage || item.image) ||
//       "https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=2070&auto=format&fit=crop",
//     desc:
//       item.tagline ||
//       item.intro ||
//       (Array.isArray(item.overview) && item.overview[0]) ||
//       "",
//   };
// }

// const fallbackServices = [
//   { id: "01", indexLabel: "01", slug: "finnish-sauna",   title: "Finnish Sauna",       category: "Heat",          duration: "45 MIN", price: "₹1,500", image: "https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=2070&auto=format&fit=crop", desc: "A private heat session to relax, unwind and reconnect — the original hot–cold ritual." },
//   { id: "02", indexLabel: "02", slug: "cold-plunge",     title: "Cold Plunge",         category: "Cold",          duration: "15 MIN", price: "₹1,000", image: "/pexels-sergey-torbik-42706484-7365432.jpg", desc: "Guided cold-water immersion, with client-approved timing and safety guidance." },
//   { id: "03", indexLabel: "03", slug: "ceragem-massage", title: "Ceragem Massage Bed", category: "Recovery Tech", duration: "30 MIN", price: "₹1,200", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop", desc: "Automated thermal massage beds; guests lie back, pick a programme and relax." },
//   { id: "04", indexLabel: "04", slug: "turkish-hammam",  title: "Turkish Hammam",      category: "Bathing",       duration: "90 MIN", price: "₹3,500", image: "/klara-kulikova-7D57RU66rfU-unsplash.jpg", desc: "Steam warm-up, traditional scrub, foam wash and rinse, then rest." },
//   { id: "05", indexLabel: "05", slug: "thz-teta-p90",    title: "THz Teta-P90 Plus",   category: "Recovery Tech", duration: "45 MIN", price: "₹2,500", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop", desc: "Advanced Terahertz wellness system for deep cellular recovery and relaxation." },
//   { id: "06", indexLabel: "06", slug: "pelvic-chair",    title: "Pelvic Chair",        category: "Recovery Tech", duration: "30 MIN", price: "₹1,800", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2070&auto=format&fit=crop", desc: "Discreet, fully-clothed sessions in a private room, with guidance on the first visit." },
//   { id: "07", indexLabel: "07", slug: "body-massage",    title: "Body Massage",        category: "Bodywork",      duration: "60 MIN", price: "₹2,800", image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop", desc: "Private rooms for therapist-led massage in 30, 60 and 90-minute options." },
//   { id: "08", indexLabel: "08", slug: "exopod-infrared", title: "Exopod Infrared Bed", category: "Recovery Tech", duration: "40 MIN", price: "₹1,500", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2000&auto=format&fit=crop", desc: "An enclosed infrared pod for a quiet, private warmth session." },
// ];

// const amenities = [
//   { icon: ShowerHead, title: "Shower Facilities", desc: "Clean, premium showers for before and after heat, cold and bathing sessions." },
//   { icon: Droplets,   title: "Keragen Water",     desc: "A water bar serving guests throughout their visit." },
// ];

// export default function InteractiveServices() {
//   const [services, setServices] = useState(fallbackServices);
//   const [loading, setLoading] = useState(true);
//   const [hoveredId, setHoveredId] = useState(null);
//   const [scrollActiveId, setScrollActiveId] = useState(fallbackServices[0].id);
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     let active = true;

//     async function loadServices() {
//       try {
//         const res = await fetch(`${API_BASE}/services?isActive=true&limit=20`);
//         if (!res.ok) throw new Error(`Failed to load services (${res.status})`);
//         const json = await res.json();
//         const rawList = Array.isArray(json)
//           ? json
//           : json?.data || json?.services || [];

//         if (active && rawList.length > 0) {
//           const normalized = rawList.map(normalizeService);
//           setServices(normalized);
//           setScrollActiveId(normalized[0].id);
//         }
//       } catch (err) {
//         console.error("InteractiveServices fetch error:", err);
//       } finally {
//         if (active) setLoading(false);
//       }
//     }

//     loadServices();
//     return () => {
//       active = false;
//     };
//   }, []);

//   const activeService =
//     services.find((s) => s.id === (hoveredId || scrollActiveId)) || services[0];

//   const totalCountLabel = String(services.length).padStart(2, "0");

//   const { scrollYProgress } = useScroll({
//     target: sectionRef,
//     offset: ["start end", "end start"],
//   });
//   const glowY = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

//   // ── SCROLL SPY: image auto-updates as you scroll past each service ──
//   useEffect(() => {
//     let rafId;
//     const handleScroll = () => {
//       cancelAnimationFrame(rafId);
//       rafId = requestAnimationFrame(() => {
//         const viewportCenter = window.innerHeight / 2;
//         let closestId = null;
//         let minDist = Infinity;

//         services.forEach((s) => {
//           const el = document.querySelector(`[data-service-id="${s.id}"]`);
//           if (!el) return;
//           const rect = el.getBoundingClientRect();
//           const center = rect.top + rect.height / 2;
//           const dist = Math.abs(center - viewportCenter);
//           if (dist < minDist) {
//             minDist = dist;
//             closestId = s.id;
//           }
//         });

//         if (closestId) setScrollActiveId(closestId);
//       });
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     handleScroll();
//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//       cancelAnimationFrame(rafId);
//     };
//   }, [services]);

//   return (
//     <section
//       id="rituals"
//       ref={sectionRef}
//       className="relative w-full bg-[#080906] py-20 md:py-24 scroll-mt-20"
//     >
//       {/* Decorative layer */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           style={{ y: glowY }}
//           className="absolute top-1/3 left-1/4 w-[700px] h-[700px] rounded-full bg-[#C9944A]/10 blur-[220px]"
//         />
//         <motion.div
//           style={{ y: glowY }}
//           className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#9A6B3F]/10 blur-[200px]"
//         />
//         <div
//           className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
//           style={{
//             backgroundImage:
//               "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
//           }}
//         />
//       </div>

//       <div className="max-w-[1700px] mx-auto px-6 md:px-10 xl:px-16 relative z-10">
//         {/* Header */}
//         <div className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
//           <div>
//             <motion.div
//               initial={{ opacity: 0, x: -30 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.9, ease: easeOut }}
//               className="flex items-center gap-3 mb-5"
//             >
//               <Sparkles size={14} className="text-[#C9944A]" />
//               <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
//                 Select a Ritual
//               </span>
//             </motion.div>
//             <motion.h2
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 1, delay: 0.1, ease: easeOut }}
//               className="font-serif text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-light leading-[1.02]"
//             >
//               Our Menu of{" "}
//               <span className="italic text-[#E3D9C9]">Experiences.</span>
//             </motion.h2>
//           </div>

//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 1, delay: 0.2, ease: easeOut }}
//             className="text-white/50 text-sm md:text-base font-light max-w-xs leading-relaxed"
//           >
//             Curated rituals — heat, cold, recovery, and bodywork.
//             Every visit includes showers and hydration.
//           </motion.p>
//         </div>

//         {/* Grid: no items-start so sticky works */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20">
//           {/* LEFT: STICKY IMAGE */}
//           <div className="hidden lg:block lg:col-span-5 relative">
//             <div className="sticky top-24">
//               <div className="relative h-[calc(100vh-8rem)] max-h-[840px] min-h-[620px] w-full overflow-hidden bg-[#12130F] rounded-sm">
//                 <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#C9944A]/80 z-30" />
//                 <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#C9944A]/80 z-30" />

//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={activeService.id}
//                     initial={{ opacity: 0, scale: 1.12, filter: "blur(24px)" }}
//                     animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
//                     exit={{ opacity: 0, scale: 0.98, filter: "blur(12px)" }}
//                     transition={{ duration: 0.9, ease: easeOut }}
//                     className="absolute inset-0"
//                   >
//                     <img
//                       src={activeService.image}
//                       alt={activeService.title}
//                       className="object-cover w-full h-full opacity-85"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-[#080906]/25 to-transparent" />
//                   </motion.div>
//                 </AnimatePresence>

//                 {/* Top strip */}
//                 <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
//                   <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
//                     <span className="w-1.5 h-1.5 rounded-full bg-[#C9944A] animate-pulse" />
//                     <span className="text-[9px] tracking-[0.3em] uppercase text-white/70">
//                       Now Viewing
//                     </span>
//                   </div>
//                   <div className="text-[10px] tracking-[0.3em] uppercase text-white/60 font-mono">
//                     {activeService.indexLabel} / {totalCountLabel}
//                   </div>
//                 </div>

//                 {/* Glass card */}
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={activeService.id + "-card"}
//                     initial={{ opacity: 0, y: 40 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
//                     className="absolute bottom-6 left-6 right-6 z-20"
//                   >
//                     <div className="backdrop-blur-2xl bg-white/[0.06] border border-white/15 rounded-2xl p-6 xl:p-7">
//                       <div className="flex items-center gap-3 mb-3">
//                         <span className="text-[9px] tracking-[0.35em] uppercase text-[#C9944A] font-bold">
//                           {activeService.category}
//                         </span>
//                         <span className="w-1 h-1 rounded-full bg-[#C9944A]" />
//                         <div className="flex items-center gap-1.5 text-white/50">
//                           <Clock size={11} />
//                           <span className="text-[9px] tracking-[0.3em] uppercase">
//                             {activeService.duration}
//                           </span>
//                         </div>
//                       </div>

//                       <h3 className="font-serif text-3xl xl:text-[2.75rem] text-white font-light leading-[1.05] mb-3">
//                         {activeService.title}
//                       </h3>

//                       <p className="text-white/65 text-sm leading-relaxed mb-5">
//                         {activeService.desc}
//                       </p>

//                       <div className="h-[1px] w-full bg-white/10 mb-4" />

//                       <div className="flex items-center justify-between">
//                         <div>
//                           <span className="text-[9px] tracking-[0.3em] uppercase text-white/40 block mb-1">
//                             Starting from
//                           </span>
//                           <span className="font-serif text-2xl text-[#E3D9C9]">
//                             {activeService.price}
//                           </span>
//                         </div>
//                         <Link
//                           href={`/book?service=${encodeURIComponent(activeService.title)}`}
//                           className="group flex items-center gap-3 bg-[#C9944A] hover:bg-[#E3D9C9] text-[#080906] pl-5 pr-2 py-2 rounded-full transition-all duration-500"
//                         >
//                           <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">
//                             Book
//                           </span>
//                           <span className="w-8 h-8 rounded-full bg-[#080906]/10 flex items-center justify-center group-hover:bg-[#080906]/20 transition-colors">
//                             <ArrowUpRight
//                               size={14}
//                               className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
//                             />
//                           </span>
//                         </Link>
//                       </div>
//                     </div>
//                   </motion.div>
//                 </AnimatePresence>
//               </div>

//               {/* Vertical progress rail */}
//               <div className="absolute top-1/2 -right-5 xl:-right-7 -translate-y-1/2 flex flex-col gap-2">
//                 {services.map((s) => (
//                   <motion.div
//                     key={s.id}
//                     animate={{
//                       height: activeService.id === s.id ? 32 : 6,
//                       backgroundColor:
//                         activeService.id === s.id
//                           ? "#C9944A"
//                           : "rgba(255,255,255,0.2)",
//                     }}
//                     transition={{ duration: 0.4, ease: easeOut }}
//                     className="w-1 rounded-full"
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* RIGHT: MENU LIST */}
//           <div className="lg:col-span-7 flex flex-col">
//             <div className="hidden lg:flex items-center justify-between mb-3 pb-4 border-b border-white/10">
//               <span className="text-[9px] tracking-[0.4em] uppercase text-white/40">
//                 Scroll or hover to preview
//               </span>
//               <span className="text-[9px] tracking-[0.4em] uppercase text-white/40">
//                 {loading ? "Syncing…" : `${totalCountLabel} Rituals`}
//               </span>
//             </div>

//             <div className="flex flex-col border-t border-white/10 lg:border-t-0">
//               {services.map((service, index) => {
//                 const isActive = activeService.id === service.id;
//                 return (
//                   <motion.div
//                     key={service.id}
//                     data-service-id={service.id}
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     viewport={{ once: true, margin: "-40px" }}
//                     transition={{ duration: 0.6, delay: index * 0.04, ease: easeOut }}
//                     onMouseEnter={() => setHoveredId(service.id)}
//                     onMouseLeave={() => setHoveredId(null)}
//                     className="group relative border-b border-white/10 py-6 md:py-8 lg:py-9 cursor-pointer overflow-hidden"
//                   >
//                     <Link
//                       href={`/services/${service.slug}`}
//                       aria-label={`View ${service.title}`}
//                       className="absolute inset-0 z-10"
//                     />

//                     <div
//                       className={`absolute inset-0 bg-gradient-to-r from-[#C9944A]/[0.08] via-[#C9944A]/[0.03] to-transparent transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
//                         isActive
//                           ? "opacity-100 translate-x-0"
//                           : "opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0"
//                       }`}
//                     />
//                     <div
//                       className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#C9944A] to-transparent transition-transform duration-500 origin-top ${
//                         isActive ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
//                       }`}
//                     />

//                     <div className="relative flex items-center justify-between gap-4 px-3 md:px-5">
//                       <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
//                         <span
//                           className={`text-[10px] font-mono tracking-widest shrink-0 transition-colors duration-300 ${
//                             isActive ? "text-[#C9944A]" : "text-white/40 group-hover:text-[#C9944A]"
//                           }`}
//                         >
//                           {service.indexLabel}
//                         </span>
//                         <h3
//                           className={`font-serif text-2xl md:text-4xl lg:text-[2.75rem] font-light leading-tight truncate transition-all duration-500 ${
//                             isActive
//                               ? "text-[#E3D9C9] translate-x-1"
//                               : "text-white group-hover:text-[#E3D9C9] group-hover:translate-x-1"
//                           }`}
//                         >
//                           {service.title}
//                         </h3>
//                       </div>

//                       <div className="flex items-center gap-4 md:gap-6 shrink-0">
//                         <div
//                           className={`hidden md:flex items-center gap-1.5 transition-colors duration-300 ${
//                             isActive ? "text-white" : "text-white/40 group-hover:text-white/80"
//                           }`}
//                         >
//                           <Clock size={12} />
//                           <span className="text-[10px] uppercase tracking-widest">
//                             {service.duration}
//                           </span>
//                         </div>
//                         <span
//                           className={`text-base md:text-lg font-light transition-colors duration-300 min-w-[60px] text-right ${
//                             isActive ? "text-[#E3D9C9]" : "text-[#C9944A]"
//                           }`}
//                         >
//                           {service.price}
//                         </span>
//                         <span
//                           className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 shrink-0 ${
//                             isActive
//                               ? "border-[#C9944A] bg-[#C9944A] text-[#080906]"
//                               : "border-white/20 text-white/40 group-hover:border-[#C9944A]/50 group-hover:text-[#C9944A] group-hover:rotate-45"
//                           }`}
//                         >
//                           <ArrowUpRight size={13} />
//                         </span>
//                       </div>
//                     </div>

//                     {/* Mobile preview */}
//                     <div className="lg:hidden mt-4 px-3 relative z-20">
//                       <AnimatePresence initial={false}>
//                         {isActive && (
//                           <motion.div
//                             initial={{ height: 0, opacity: 0 }}
//                             animate={{ height: "auto", opacity: 1 }}
//                             exit={{ height: 0, opacity: 0 }}
//                             transition={{ duration: 0.4, ease: easeOut }}
//                             className="overflow-hidden"
//                           >
//                             <div className="h-44 overflow-hidden relative rounded-xl">
//                               <img
//                                 src={service.image}
//                                 alt={service.title}
//                                 className="w-full h-full object-cover opacity-75"
//                               />
//                               <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-transparent to-transparent" />
//                               <p className="absolute bottom-3 left-3 right-3 text-white/70 text-xs leading-relaxed">
//                                 {service.desc}
//                               </p>
//                             </div>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>

//             {/* Amenities strip */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
//             >
//               {amenities.map((a) => {
//                 const Icon = a.icon;
//                 return (
//                   <div
//                     key={a.title}
//                     className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]"
//                   >
//                     <div className="w-9 h-9 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 flex items-center justify-center shrink-0">
//                       <Icon size={15} className="text-[#C9944A]" />
//                     </div>
//                     <div>
//                       <p className="text-[#E3D9C9] font-serif text-base leading-tight mb-1">
//                         {a.title}
//                       </p>
//                       <p className="text-white/45 text-[11px] leading-relaxed">
//                         {a.desc}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </motion.div>

//             {/* Footer CTA */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent"
//             >
//               <div>
//                 <p className="text-[#E3D9C9] font-serif text-xl mb-1">
//                   Not sure where to begin?
//                 </p>
//                 <p className="text-white/40 text-xs leading-relaxed max-w-[260px]">
//                   Our wellness concierge will craft a personalized ritual sequence just for you.
//                 </p>
//               </div>
//               <Link
//                 href="/contact"
//                 className="group flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#C9944A] hover:text-[#E3D9C9] transition-colors shrink-0"
//               >
//                 Talk to us
//                 <span className="w-9 h-9 rounded-full border border-[#C9944A]/50 flex items-center justify-center group-hover:bg-[#C9944A] group-hover:text-[#080906] group-hover:border-[#C9944A] transition-all duration-300">
//                   <ArrowUpRight size={14} />
//                 </span>
//               </Link>
//             </motion.div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile sticky Book Now */}
//       <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
//         <Link
//           href="/book"
//           className="flex items-center justify-between gap-3 bg-[#C9944A] text-[#080906] px-5 py-4 rounded-full shadow-[0_8px_40px_rgba(201,148,74,0.4)]"
//         >
//           <span className="text-[11px] tracking-[0.3em] uppercase font-semibold">
//             Book Now
//           </span>
//           <span className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase">
//             {activeService.title}
//             <ArrowUpRight size={14} />
//           </span>
//         </Link>
//       </div>
//     </section>
//   );
// }


"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Clock,
  Sparkles,
  Droplets,
  ShowerHead,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const easeOut = [0.22, 1, 0.36, 1];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

function resolveMediaUrl(url) {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatPrice(price) {
  if (typeof price === "number") {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: price % 1 !== 0 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  }
  if (typeof price === "string" && price.trim()) {
    return price.startsWith("$") ? price : `$${price}`;
  }
  return "$0";
}

function normalizeService(item, index) {
  return {
    id: item._id || item.id || String(index + 1).padStart(2, "0"),
    indexLabel: String(index + 1).padStart(2, "0"),
    slug: item.slug || "",
    title: item.title || item.shortTitle || "Ritual",
    category: item.category || "Wellness",
    duration: item.duration || "45 MIN",
    price: formatPrice(item.price),
    image: resolveMediaUrl(item.heroImage || item.image),
    desc:
      item.tagline ||
      item.intro ||
      (Array.isArray(item.overview) && item.overview[0]) ||
      "",
  };
}

const amenities = [
  {
    icon: ShowerHead,
    title: "Shower Facilities",
    desc: "Clean, premium showers for before and after heat, cold and bathing sessions.",
  },
  {
    icon: Droplets,
    title: "Keragen Water",
    desc: "A water bar serving guests throughout their visit.",
  },
];

export default function InteractiveServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [scrollActiveId, setScrollActiveId] = useState(null);
  const sectionRef = useRef(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/services?isActive=true&limit=20`);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || `Failed to load services (${res.status})`);
      }

      const rawList = Array.isArray(json)
        ? json
        : json?.data || json?.services || [];

      const normalized = rawList.map(normalizeService);
      setServices(normalized);
      setScrollActiveId(normalized[0]?.id || null);
    } catch (err) {
      setServices([]);
      setScrollActiveId(null);
      setError(err?.message || "Could not connect to backend services API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const activeService =
    services.find((s) => s.id === (hoveredId || scrollActiveId)) ||
    services[0] ||
    null;

  const totalCountLabel = String(services.length).padStart(2, "0");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

  // ── SCROLL SPY: image auto-updates as you scroll past each service ──
  useEffect(() => {
    if (!services.length) return;

    let rafId;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const viewportCenter = window.innerHeight / 2;
        let closestId = null;
        let minDist = Infinity;

        services.forEach((s) => {
          const el = document.querySelector(`[data-service-id="${s.id}"]`);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const dist = Math.abs(center - viewportCenter);
          if (dist < minDist) {
            minDist = dist;
            closestId = s.id;
          }
        });

        if (closestId) setScrollActiveId(closestId);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [services]);

  return (
    <section
      id="rituals"
      ref={sectionRef}
      className="relative w-full bg-[#080906] py-20 md:py-24 scroll-mt-20"
    >
      {/* Decorative layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: glowY }}
          className="absolute top-1/3 left-1/4 w-[700px] h-[700px] rounded-full bg-[#C9944A]/10 blur-[220px]"
        />
        <motion.div
          style={{ y: glowY }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#9A6B3F]/10 blur-[200px]"
        />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="max-w-[1700px] mx-auto px-6 md:px-10 xl:px-16 relative z-10">
        {/* Header */}
        <div className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: easeOut }}
              className="flex items-center gap-3 mb-5"
            >
              <Sparkles size={14} className="text-[#C9944A]" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#C9944A] font-semibold">
                Select a Ritual
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: easeOut }}
              className="font-serif text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-light leading-[1.02]"
            >
              Our Menu of{" "}
              <span className="italic text-[#E3D9C9]">Experiences.</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: easeOut }}
            className="text-white/50 text-sm md:text-base font-light max-w-xs leading-relaxed"
          >
            Curated rituals — heat, cold, recovery, and bodywork.
            Every visit includes showers and hydration.
          </motion.p>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20">
            <div className="hidden lg:block lg:col-span-5">
              <div className="h-[620px] w-full rounded-sm bg-[#121310] border border-white/10 animate-pulse" />
            </div>
            <div className="lg:col-span-7 space-y-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="h-24 w-full rounded-xl bg-[#121310] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-xl text-white mb-1">
                  Unable to load services from backend
                </h3>
                <p className="text-red-200/80 text-xs">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadServices}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors shrink-0"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && services.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#121310] p-12 text-center">
            <h3 className="font-serif text-2xl text-white font-light mb-2">
              No active services found
            </h3>
            <p className="text-white/45 text-xs">
              Add or activate services in the admin panel to display them here.
            </p>
          </div>
        )}

        {/* DATA LOADED FROM BACKEND */}
        {!loading && !error && activeService && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20">
            {/* LEFT: STICKY IMAGE */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="sticky top-24">
                <div className="relative h-[calc(100vh-8rem)] max-h-[840px] min-h-[620px] w-full overflow-hidden bg-[#12130F] rounded-sm">
                  <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#C9944A]/80 z-30" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#C9944A]/80 z-30" />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeService.id}
                      initial={{ opacity: 0, scale: 1.12, filter: "blur(24px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.98, filter: "blur(12px)" }}
                      transition={{ duration: 0.9, ease: easeOut }}
                      className="absolute inset-0"
                    >
                      {activeService.image && (
                        <img
                          src={activeService.image}
                          alt={activeService.title}
                          className="object-cover w-full h-full opacity-85"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-[#080906]/25 to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Top strip */}
                  <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                    <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9944A] animate-pulse" />
                      <span className="text-[9px] tracking-[0.3em] uppercase text-white/70">
                        Now Viewing
                      </span>
                    </div>
                    <div className="text-[10px] tracking-[0.3em] uppercase text-white/60 font-mono">
                      {activeService.indexLabel} / {totalCountLabel}
                    </div>
                  </div>

                  {/* Glass card */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeService.id + "-card"}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
                      className="absolute bottom-6 left-6 right-6 z-20"
                    >
                      <div className="backdrop-blur-2xl bg-white/[0.06] border border-white/15 rounded-2xl p-6 xl:p-7">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[9px] tracking-[0.35em] uppercase text-[#C9944A] font-bold">
                            {activeService.category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#C9944A]" />
                          <div className="flex items-center gap-1.5 text-white/50">
                            <Clock size={11} />
                            <span className="text-[9px] tracking-[0.3em] uppercase">
                              {activeService.duration}
                            </span>
                          </div>
                        </div>

                        <h3 className="font-serif text-3xl xl:text-[2.75rem] text-white font-light leading-[1.05] mb-3">
                          {activeService.title}
                        </h3>

                        <p className="text-white/65 text-sm leading-relaxed mb-5">
                          {activeService.desc}
                        </p>

                        <div className="h-[1px] w-full bg-white/10 mb-4" />

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[9px] tracking-[0.3em] uppercase text-white/40 block mb-1">
                              Starting from
                            </span>
                            <span className="font-serif text-2xl text-[#E3D9C9]">
                              {activeService.price}
                            </span>
                          </div>
                          <Link
                            href={`/book?service=${encodeURIComponent(activeService.title)}`}
                            className="group flex items-center gap-3 bg-[#C9944A] hover:bg-[#E3D9C9] text-[#080906] pl-5 pr-2 py-2 rounded-full transition-all duration-500"
                          >
                            <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">
                              Book
                            </span>
                            <span className="w-8 h-8 rounded-full bg-[#080906]/10 flex items-center justify-center group-hover:bg-[#080906]/20 transition-colors">
                              <ArrowUpRight
                                size={14}
                                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                              />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Vertical progress rail */}
                <div className="absolute top-1/2 -right-5 xl:-right-7 -translate-y-1/2 flex flex-col gap-2">
                  {services.map((s) => (
                    <motion.div
                      key={s.id}
                      animate={{
                        height: activeService.id === s.id ? 32 : 6,
                        backgroundColor:
                          activeService.id === s.id
                            ? "#C9944A"
                            : "rgba(255,255,255,0.2)",
                      }}
                      transition={{ duration: 0.4, ease: easeOut }}
                      className="w-1 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: MENU LIST */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="hidden lg:flex items-center justify-between mb-3 pb-4 border-b border-white/10">
                <span className="text-[9px] tracking-[0.4em] uppercase text-white/40">
                  Scroll or hover to preview
                </span>
                <span className="text-[9px] tracking-[0.4em] uppercase text-white/40">
                  {totalCountLabel} Rituals
                </span>
              </div>

              <div className="flex flex-col border-t border-white/10 lg:border-t-0">
                {services.map((service, index) => {
                  const isActive = activeService.id === service.id;
                  return (
                    <motion.div
                      key={service.id}
                      data-service-id={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.04,
                        ease: easeOut,
                      }}
                      onMouseEnter={() => setHoveredId(service.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="group relative border-b border-white/10 py-6 md:py-8 lg:py-9 cursor-pointer overflow-hidden"
                    >
                      <Link
                        href={`/services/${service.slug}`}
                        aria-label={`View ${service.title}`}
                        className="absolute inset-0 z-10"
                      />

                      <div
                        className={`absolute inset-0 bg-gradient-to-r from-[#C9944A]/[0.08] via-[#C9944A]/[0.03] to-transparent transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isActive
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0"
                        }`}
                      />
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#C9944A] to-transparent transition-transform duration-500 origin-top ${
                          isActive
                            ? "scale-y-100"
                            : "scale-y-0 group-hover:scale-y-100"
                        }`}
                      />

                      <div className="relative flex items-center justify-between gap-4 px-3 md:px-5">
                        <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                          <span
                            className={`text-[10px] font-mono tracking-widest shrink-0 transition-colors duration-300 ${
                              isActive
                                ? "text-[#C9944A]"
                                : "text-white/40 group-hover:text-[#C9944A]"
                            }`}
                          >
                            {service.indexLabel}
                          </span>
                          <h3
                            className={`font-serif text-2xl md:text-4xl lg:text-[2.75rem] font-light leading-tight truncate transition-all duration-500 ${
                              isActive
                                ? "text-[#E3D9C9] translate-x-1"
                                : "text-white group-hover:text-[#E3D9C9] group-hover:translate-x-1"
                            }`}
                          >
                            {service.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6 shrink-0">
                          <div
                            className={`hidden md:flex items-center gap-1.5 transition-colors duration-300 ${
                              isActive
                                ? "text-white"
                                : "text-white/40 group-hover:text-white/80"
                            }`}
                          >
                            <Clock size={12} />
                            <span className="text-[10px] uppercase tracking-widest">
                              {service.duration}
                            </span>
                          </div>
                          <span
                            className={`text-base md:text-lg font-light transition-colors duration-300 min-w-[60px] text-right ${
                              isActive ? "text-[#E3D9C9]" : "text-[#C9944A]"
                            }`}
                          >
                            {service.price}
                          </span>
                          <span
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 shrink-0 ${
                              isActive
                                ? "border-[#C9944A] bg-[#C9944A] text-[#080906]"
                                : "border-white/20 text-white/40 group-hover:border-[#C9944A]/50 group-hover:text-[#C9944A] group-hover:rotate-45"
                            }`}
                          >
                            <ArrowUpRight size={13} />
                          </span>
                        </div>
                      </div>

                      {/* Mobile preview */}
                      <div className="lg:hidden mt-4 px-3 relative z-20">
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: easeOut }}
                              className="overflow-hidden"
                            >
                              <div className="h-44 overflow-hidden relative rounded-xl">
                                {service.image && (
                                  <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover opacity-75"
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-transparent to-transparent" />
                                <p className="absolute bottom-3 left-3 right-3 text-white/70 text-xs leading-relaxed">
                                  {service.desc}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Amenities strip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {amenities.map((a) => {
                  const Icon = a.icon;
                  return (
                    <div
                      key={a.title}
                      className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-[#C9944A]" />
                      </div>
                      <div>
                        <p className="text-[#E3D9C9] font-serif text-base leading-tight mb-1">
                          {a.title}
                        </p>
                        <p className="text-white/45 text-[11px] leading-relaxed">
                          {a.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Footer CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent"
              >
                <div>
                  <p className="text-[#E3D9C9] font-serif text-xl mb-1">
                    Not sure where to begin?
                  </p>
                  <p className="text-white/40 text-xs leading-relaxed max-w-[260px]">
                    Our wellness concierge will craft a personalized ritual sequence just for you.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="group flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#C9944A] hover:text-[#E3D9C9] transition-colors shrink-0"
                >
                  Talk to us
                  <span className="w-9 h-9 rounded-full border border-[#C9944A]/50 flex items-center justify-center group-hover:bg-[#C9944A] group-hover:text-[#080906] group-hover:border-[#C9944A] transition-all duration-300">
                    <ArrowUpRight size={14} />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky Book Now */}
      {activeService && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <Link
            href={`/book?service=${encodeURIComponent(activeService.title)}`}
            className="flex items-center justify-between gap-3 bg-[#C9944A] text-[#080906] px-5 py-4 rounded-full shadow-[0_8px_40px_rgba(201,148,74,0.4)]"
          >
            <span className="text-[11px] tracking-[0.3em] uppercase font-semibold">
              Book Now
            </span>
            <span className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase">
              {activeService.title}
              <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}