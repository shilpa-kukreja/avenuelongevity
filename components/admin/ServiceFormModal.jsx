// "use client";

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import {
//   ArrowLeft, Plus, Trash2, ChevronDown, Save, AlertCircle,
//   Loader2, Image as ImageIcon, Sparkles, BookOpen, HelpCircle,
//   Star, ListChecks, Layers, Package
// } from "lucide-react";

// const easeOut = [0.22, 1, 0.36, 1];

// const CATEGORIES = ["Heat", "Cold", "Recovery Tech", "Bathing", "Bodywork", "Amenity"];

// const ICON_OPTIONS = [
//   "Flame", "Snowflake", "Heart", "Droplets", "Zap", "Waves",
//   "ShieldCheck", "Moon", "Bone", "Leaf", "Sparkles", "Brain",
//   "Users", "Sun", "Wind", "Star",
// ];

// const emptyService = {
//   slug: "",
//   title: "",
//   shortTitle: "",
//   category: "Heat",
//   tagline: "",
//   duration: "",
//   price: "",
//   capacity: "",
//   rating: 5,
//   reviewsCount: 0,
//   heroImage: "",
//   intro: "",
//   overview: [],
//   included: [],
//   gallery: [],
//   related: [],
//   benefits: [],
//   process: [],
//   reviews_list: [],
//   faqs: [],
//   isActive: true,
// };

// function initForm(service) {
//   if (!service) return { ...emptyService };
//   return {
//     ...emptyService,
//     ...service,
//     price: service.price ?? "",
//     rating: service.rating ?? 5,
//     reviewsCount: service.reviewsCount ?? 0,
//     overview: service.overview || [],
//     included: service.included || [],
//     gallery: service.gallery || [],
//     related: service.related || [],
//     benefits: service.benefits || [],
//     process: service.process || [],
//     reviews_list: service.reviews_list || [],
//     faqs: service.faqs || [],
//   };
// }

// const SECTIONS = [
//   { id: "basic",    label: "Basic Info",        icon: Sparkles },
//   { id: "pricing",  label: "Pricing & Details", icon: Package },
//   { id: "content",  label: "Content",           icon: BookOpen },
//   { id: "benefits", label: "Benefits",          icon: Layers },
//   { id: "process",  label: "Process",           icon: ListChecks },
//   { id: "reviews",  label: "Reviews",           icon: Star },
//   { id: "faqs",     label: "FAQs",              icon: HelpCircle },
// ];

// export default function ServiceFormPage({
//   mode = "add",
//   initialService = null,
//   onSubmit,
//   submitting = false,
//   error: externalError = "",
// }) {
//   const router = useRouter();
//   const [form, setForm] = useState(() => initForm(initialService));
//   const [errors, setErrors] = useState([]);
//   const [activeSection, setActiveSection] = useState("basic");

//   const setField = (field, value) => {
//     setForm((f) => ({ ...f, [field]: value }));
//   };

//   const scrollToSection = (id) => {
//     setActiveSection(id);
//     const el = document.getElementById(`section-${id}`);
//     if (el) {
//       const yOffset = -120;
//       const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
//       window.scrollTo({ top: y, behavior: "smooth" });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors([]);

//     // Client validation
//     const clientErrors = [];
//     if (!form.slug.trim()) clientErrors.push("Slug is required");
//     if (!/^[a-z0-9-]+$/.test(form.slug)) clientErrors.push("Slug must be lowercase letters, numbers, hyphens");
//     if (!form.title.trim()) clientErrors.push("Title is required");
//     if (!form.shortTitle.trim()) clientErrors.push("Short title is required");
//     if (!form.tagline.trim()) clientErrors.push("Tagline is required");
//     if (!form.duration.trim()) clientErrors.push("Duration is required");
//     if (!form.price || Number(form.price) < 0) clientErrors.push("Price must be ≥ 0");
//     if (!form.capacity.trim()) clientErrors.push("Capacity is required");
//     if (!form.heroImage.trim()) clientErrors.push("Hero image URL is required");
//     if (!form.intro.trim()) clientErrors.push("Intro is required");

//     if (clientErrors.length) {
//       setErrors(clientErrors);
//       scrollToSection("basic");
//       return;
//     }

//     // Clean payload
//     const payload = {
//       ...form,
//       price: Number(form.price),
//       rating: Number(form.rating) || 0,
//       reviewsCount: Number(form.reviewsCount) || 0,
//       overview: form.overview.filter((s) => s.trim()),
//       included: form.included.filter((s) => s.trim()),
//       gallery: form.gallery.filter((s) => s.trim()),
//       related: form.related.filter((s) => s.trim()),
//     };

//     try {
//       await onSubmit(payload);
//     } catch (err) {
//       if (err.errors?.length) {
//         setErrors(err.errors.map((e) => `${e.field}: ${e.message}`));
//       } else {
//         setErrors([err.message || "Something went wrong"]);
//       }
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const allErrors = [...errors, ...(externalError ? [externalError] : [])];

//   return (
//     <div className="relative">
//       {/* ═══════ STICKY TOP BAR ═══════ */}
//       <div className="sticky top-0 z-30 -mx-6 md:-mx-10 lg:-mx-12 px-6 md:px-10 lg:px-12 py-4 bg-[#080906]/95 backdrop-blur-xl border-b border-white/5">
//         <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
//           <div className="flex items-center gap-3 min-w-0">
//             <button
//               type="button"
//               onClick={() => router.push("/admin/services")}
//               className="w-9 h-9 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors shrink-0"
//             >
//               <ArrowLeft size={16} />
//             </button>
//             <div className="min-w-0">
//               <p className="text-[9px] uppercase tracking-[0.35em] text-[#C9944A] font-semibold">
//                 Admin · {mode === "add" ? "Add" : "Edit"}
//               </p>
//               <h1 className="font-serif text-xl md:text-2xl text-white font-light truncate">
//                 {mode === "add" ? "New Service" : `Edit: ${initialService?.title || "Service"}`}
//               </h1>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 shrink-0">
//             <button
//               type="button"
//               onClick={() => router.push("/admin/services")}
//               className="px-4 md:px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={submitting}
//               className="flex items-center gap-2 px-5 md:px-7 py-2.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors disabled:opacity-60 disabled:cursor-wait"
//             >
//               {submitting ? (
//                 <><Loader2 size={13} className="animate-spin" /> Saving…</>
//               ) : (
//                 <><Save size={13} /> {mode === "add" ? "Create" : "Save"}</>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ═══════ ERRORS ═══════ */}
//       {allErrors.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-1.5"
//         >
//           <div className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-widest">
//             <AlertCircle size={14} /> Fix these before saving
//           </div>
//           {allErrors.map((e, i) => (
//             <div key={i} className="text-red-300/80 text-xs pl-5">• {e}</div>
//           ))}
//         </motion.div>
//       )}

//       {/* ═══════ LAYOUT: TOC + FORM ═══════ */}
//       <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
//         {/* LEFT: Table of Contents (sticky) */}
//         <aside className="hidden lg:block lg:col-span-3">
//           <div className="sticky top-28">
//             <p className="text-[9px] uppercase tracking-[0.35em] text-white/40 font-semibold mb-4">
//               Sections
//             </p>
//             <nav className="space-y-1">
//               {SECTIONS.map((s) => {
//                 const Icon = s.icon;
//                 const active = activeSection === s.id;
//                 return (
//                   <button
//                     key={s.id}
//                     type="button"
//                     onClick={() => scrollToSection(s.id)}
//                     className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
//                       active
//                         ? "bg-[#C9944A]/10 text-[#C9944A] border border-[#C9944A]/20"
//                         : "text-white/50 hover:text-white hover:bg-white/[0.03] border border-transparent"
//                     }`}
//                   >
//                     <Icon size={14} />
//                     <span className="text-[11px] uppercase tracking-[0.15em] font-medium">{s.label}</span>
//                     {s.id === "benefits" && form.benefits.length > 0 && (
//                       <span className="ml-auto text-[9px] text-[#C9944A] font-mono">{form.benefits.length}</span>
//                     )}
//                     {s.id === "process" && form.process.length > 0 && (
//                       <span className="ml-auto text-[9px] text-[#C9944A] font-mono">{form.process.length}</span>
//                     )}
//                     {s.id === "reviews" && form.reviews_list.length > 0 && (
//                       <span className="ml-auto text-[9px] text-[#C9944A] font-mono">{form.reviews_list.length}</span>
//                     )}
//                     {s.id === "faqs" && form.faqs.length > 0 && (
//                       <span className="ml-auto text-[9px] text-[#C9944A] font-mono">{form.faqs.length}</span>
//                     )}
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>
//         </aside>

//         {/* RIGHT: Form content */}
//         <div className="lg:col-span-9 space-y-6">
//           {/* ═══════ BASIC ═══════ */}
//           <Section id="basic" title="Basic Info" desc="Core identity of the service.">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Field label="Slug *" hint="URL-safe, lowercase">
//                 <input
//                   value={form.slug}
//                   onChange={(e) => setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
//                   placeholder="finnish-sauna"
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 />
//               </Field>

//               <Field label="Category *">
//                 <select
//                   value={form.category}
//                   onChange={(e) => setField("category", e.target.value)}
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 >
//                   {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
//                 </select>
//               </Field>

//               <Field label="Title *">
//                 <input
//                   value={form.title}
//                   onChange={(e) => setField("title", e.target.value)}
//                   placeholder="Finnish Sauna"
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 />
//               </Field>

//               <Field label="Short Title *">
//                 <input
//                   value={form.shortTitle}
//                   onChange={(e) => setField("shortTitle", e.target.value)}
//                   placeholder="Sauna"
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 />
//               </Field>

//               <Field label="Tagline *" full>
//                 <input
//                   value={form.tagline}
//                   onChange={(e) => setField("tagline", e.target.value)}
//                   placeholder="Stillness, wrapped in warmth."
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 />
//               </Field>
//             </div>
//           </Section>

//           {/* ═══════ PRICING ═══════ */}
//           <Section id="pricing" title="Pricing & Details" desc="Session economics and availability.">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <Field label="Price (₹) *">
//                 <input
//                   type="number"
//                   min="0"
//                   value={form.price}
//                   onChange={(e) => setField("price", e.target.value)}
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 />
//               </Field>

//               <Field label="Duration *" hint="e.g. 45 MIN">
//                 <input
//                   value={form.duration}
//                   onChange={(e) => setField("duration", e.target.value)}
//                   placeholder="45 MIN"
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 />
//               </Field>

//               <Field label="Capacity *">
//                 <input
//                   value={form.capacity}
//                   onChange={(e) => setField("capacity", e.target.value)}
//                   placeholder="1–2 Guests"
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 />
//               </Field>

//               <Field label="Rating">
//                 <input
//                   type="number"
//                   step="0.1"
//                   min="0"
//                   max="5"
//                   value={form.rating}
//                   onChange={(e) => setField("rating", e.target.value)}
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 />
//               </Field>

//               <Field label="Reviews Count">
//                 <input
//                   type="number"
//                   min="0"
//                   value={form.reviewsCount}
//                   onChange={(e) => setField("reviewsCount", e.target.value)}
//                   className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//                 />
//               </Field>

//               <Field label="Status">
//                 <button
//                   type="button"
//                   onClick={() => setField("isActive", !form.isActive)}
//                   className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${
//                     form.isActive
//                       ? "bg-green-500/10 border-green-500/30 text-green-400"
//                       : "bg-white/5 border-white/10 text-white/50"
//                   }`}
//                 >
//                   <span className="text-xs">{form.isActive ? "Active (visible)" : "Inactive (hidden)"}</span>
//                   <span className={`w-10 h-5 rounded-full relative transition-colors ${form.isActive ? "bg-green-500" : "bg-white/20"}`}>
//                     <span
//                       className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
//                         form.isActive ? "left-[22px]" : "left-0.5"
//                       }`}
//                     />
//                   </span>
//                 </button>
//               </Field>
//             </div>
//           </Section>

//           {/* ═══════ CONTENT ═══════ */}
//           <Section id="content" title="Content" desc="Hero image, intro, and content arrays.">
//             <Field label="Hero Image URL *" full>
//               <input
//                 value={form.heroImage}
//                 onChange={(e) => setField("heroImage", e.target.value)}
//                 placeholder="https://images.unsplash.com/..."
//                 className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
//               />
//             </Field>

//             {form.heroImage && (
//               <div className="mt-3 relative w-full h-44 rounded-xl overflow-hidden border border-white/10 bg-[#0A0B09] group">
//                 <img
//                   src={form.heroImage}
//                   alt="Preview"
//                   className="w-full h-full object-cover"
//                   onError={(e) => (e.target.style.opacity = 0.2)}
//                 />
//                 <div className="absolute top-3 left-3 backdrop-blur-md bg-black/60 border border-white/20 rounded-full px-3 py-1 flex items-center gap-1.5">
//                   <ImageIcon size={10} className="text-[#C9944A]" />
//                   <span className="text-[8px] uppercase tracking-[0.25em] text-white/70 font-bold">
//                     Preview
//                   </span>
//                 </div>
//               </div>
//             )}

//             <Field label="Intro *" full className="mt-4">
//               <textarea
//                 value={form.intro}
//                 onChange={(e) => setField("intro", e.target.value)}
//                 rows={3}
//                 placeholder="A private heat session to relax, unwind and reconnect..."
//                 className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors resize-none"
//               />
//             </Field>

//             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//               <StringArrayField
//                 label="Overview (paragraphs)"
//                 items={form.overview}
//                 onChange={(v) => setField("overview", v)}
//                 placeholder="Step into a hand-crafted cedar sauna..."
//                 textarea
//               />
//               <StringArrayField
//                 label="What's Included"
//                 items={form.included}
//                 onChange={(v) => setField("included", v)}
//                 placeholder="Private sauna suite"
//               />
//               <StringArrayField
//                 label="Gallery Images"
//                 items={form.gallery}
//                 onChange={(v) => setField("gallery", v)}
//                 placeholder="https://..."
//               />
//               <StringArrayField
//                 label="Related Service Slugs"
//                 items={form.related}
//                 onChange={(v) => setField("related", v)}
//                 placeholder="cold-plunge"
//               />
//             </div>
//           </Section>

//           {/* ═══════ BENEFITS ═══════ */}
//           <Section id="benefits" title={`Benefits`} count={form.benefits.length} desc="What the service actually does.">
//             <ObjectArrayField
//               items={form.benefits}
//               onChange={(v) => setField("benefits", v)}
//               emptyItem={{ icon: "Flame", title: "", desc: "" }}
//               fields={[
//                 { key: "icon", label: "Icon", type: "icon-select" },
//                 { key: "title", label: "Title", placeholder: "Deep Heat Therapy" },
//                 { key: "desc", label: "Description", placeholder: "85–90°C dry heat relaxes muscles.", textarea: true },
//               ]}
//             />
//           </Section>

//           {/* ═══════ PROCESS ═══════ */}
//           <Section id="process" title="Process Steps" count={form.process.length} desc="How the ritual unfolds, step by step.">
//             <ObjectArrayField
//               items={form.process}
//               onChange={(v) => setField("process", v)}
//               emptyItem={{ title: "", desc: "" }}
//               fields={[
//                 { key: "title", label: "Step Title", placeholder: "Arrive" },
//                 { key: "desc", label: "Step Description", placeholder: "Check in at reception...", textarea: true },
//               ]}
//             />
//           </Section>

//           {/* ═══════ REVIEWS ═══════ */}
//           <Section id="reviews" title="Reviews" count={form.reviews_list.length} desc="Testimonials shown on the service page.">
//             <ObjectArrayField
//               items={form.reviews_list}
//               onChange={(v) => setField("reviews_list", v)}
//               emptyItem={{ name: "", rating: 5, text: "" }}
//               fields={[
//                 { key: "name", label: "Name", placeholder: "Arjun M." },
//                 { key: "rating", label: "Rating (0–5)", type: "number" },
//                 { key: "text", label: "Review Text", placeholder: "The most restorative 45 minutes...", textarea: true },
//               ]}
//             />
//           </Section>

//           {/* ═══════ FAQS ═══════ */}
//           <Section id="faqs" title="FAQs" count={form.faqs.length} desc="Questions guests commonly ask.">
//             <ObjectArrayField
//               items={form.faqs}
//               onChange={(v) => setField("faqs", v)}
//               emptyItem={{ q: "", a: "" }}
//               fields={[
//                 { key: "q", label: "Question", placeholder: "Is the sauna private?" },
//                 { key: "a", label: "Answer", placeholder: "Yes — each session is fully private.", textarea: true },
//               ]}
//             />
//           </Section>

//           {/* ═══════ FINAL ACTIONS ═══════ */}
//           <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-8 mt-8 border-t border-white/10">
//             <button
//               type="button"
//               onClick={() => router.push("/admin/services")}
//               className="px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors disabled:opacity-60 disabled:cursor-wait shadow-[0_0_40px_rgba(201,148,74,0.25)]"
//             >
//               {submitting ? (
//                 <><Loader2 size={14} className="animate-spin" /> Saving…</>
//               ) : (
//                 <><Save size={14} /> {mode === "add" ? "Create Service" : "Save Changes"}</>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════
//    SUB-COMPONENTS
// ═══════════════════════════════════════════ */
// function Section({ id, title, count, desc, children }) {
//   return (
//     <motion.section
//       id={`section-${id}`}
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, ease: easeOut }}
//       className="bg-[#121310] border border-white/10 rounded-2xl overflow-hidden"
//     >
//       <div className="px-6 py-5 border-b border-white/5 flex items-start justify-between gap-4">
//         <div>
//           <h2 className="font-serif text-xl md:text-2xl text-white font-light flex items-center gap-3">
//             {title}
//             {typeof count === "number" && (
//               <span className="text-[10px] uppercase tracking-widest text-[#C9944A] font-bold bg-[#C9944A]/10 border border-[#C9944A]/30 px-2 py-0.5 rounded-full font-sans">
//                 {count}
//               </span>
//             )}
//           </h2>
//           {desc && <p className="text-white/40 text-xs mt-1">{desc}</p>}
//         </div>
//       </div>
//       <div className="p-6">{children}</div>
//     </motion.section>
//   );
// }

// function Field({ label, hint, full, children, className = "" }) {
//   return (
//     <div className={`${full ? "md:col-span-2 lg:col-span-3" : ""} ${className}`}>
//       <label className="block text-[9px] uppercase tracking-[0.25em] text-white/50 mb-1.5">
//         {label}
//         {hint && <span className="text-white/30 normal-case tracking-normal ml-2">· {hint}</span>}
//       </label>
//       {children}
//     </div>
//   );
// }

// function StringArrayField({ label, items, onChange, placeholder, textarea }) {
//   const add = () => onChange([...items, ""]);
//   const update = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
//   const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-2">
//         <label className="text-[9px] uppercase tracking-[0.25em] text-white/50">{label}</label>
//         <button
//           type="button"
//           onClick={add}
//           className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#C9944A] hover:text-[#E3D9C9] transition-colors"
//         >
//           <Plus size={11} /> Add
//         </button>
//       </div>
//       <div className="space-y-2">
//         {items.map((item, i) => (
//           <div key={i} className="flex gap-2">
//             {textarea ? (
//               <textarea
//                 value={item}
//                 onChange={(e) => update(i, e.target.value)}
//                 placeholder={placeholder}
//                 rows={2}
//                 className="flex-1 bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#C9944A] transition-colors resize-none"
//               />
//             ) : (
//               <input
//                 value={item}
//                 onChange={(e) => update(i, e.target.value)}
//                 placeholder={placeholder}
//                 className="flex-1 bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#C9944A] transition-colors"
//               />
//             )}
//             <button
//               type="button"
//               onClick={() => remove(i)}
//               className="w-9 h-9 rounded-lg border border-white/10 text-white/30 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center transition-colors shrink-0"
//             >
//               <Trash2 size={12} />
//             </button>
//           </div>
//         ))}
//         {items.length === 0 && (
//           <div className="text-white/25 text-xs py-2 italic">
//             No items yet — click "Add" to start.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function ObjectArrayField({ items, onChange, fields, emptyItem }) {
//   const add = () => onChange([...items, { ...emptyItem }]);
//   const update = (i, key, v) => onChange(items.map((x, idx) => (idx === i ? { ...x, [key]: v } : x)));
//   const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

//   return (
//     <div>
//       <div className="flex justify-end mb-3">
//         <button
//           type="button"
//           onClick={add}
//           className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 text-[#C9944A] text-[9px] uppercase tracking-widest font-bold hover:bg-[#C9944A]/20 transition-colors"
//         >
//           <Plus size={11} /> Add Item
//         </button>
//       </div>
//       <div className="space-y-3">
//         {items.map((item, i) => (
//           <div key={i} className="relative bg-[#0A0B09] border border-white/10 rounded-lg p-3 space-y-2">
//             <div className="flex items-center justify-between mb-1">
//               <span className="text-[9px] uppercase tracking-widest text-[#C9944A] font-semibold">
//                 #{i + 1}
//               </span>
//               <button
//                 type="button"
//                 onClick={() => remove(i)}
//                 className="text-white/30 hover:text-red-400 transition-colors"
//               >
//                 <Trash2 size={13} />
//               </button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//               {fields.map((f) => (
//                 <div key={f.key} className={f.textarea ? "md:col-span-2" : ""}>
//                   <label className="block text-[8px] uppercase tracking-widest text-white/40 mb-1">
//                     {f.label}
//                   </label>
//                   {f.type === "icon-select" ? (
//                     <select
//                       value={item[f.key] || ""}
//                       onChange={(e) => update(i, f.key, e.target.value)}
//                       className="w-full bg-[#121310] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-[#C9944A]"
//                     >
//                       {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
//                     </select>
//                   ) : f.textarea ? (
//                     <textarea
//                       value={item[f.key] || ""}
//                       onChange={(e) => update(i, f.key, e.target.value)}
//                       placeholder={f.placeholder}
//                       rows={2}
//                       className="w-full bg-[#121310] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-[#C9944A] resize-none"
//                     />
//                   ) : (
//                     <input
//                       type={f.type === "number" ? "number" : "text"}
//                       value={item[f.key] ?? ""}
//                       onChange={(e) =>
//                         update(i, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
//                       }
//                       placeholder={f.placeholder}
//                       className="w-full bg-[#121310] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-[#C9944A]"
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//         {items.length === 0 && (
//           <div className="text-white/25 text-xs py-4 text-center border border-dashed border-white/10 rounded-lg italic">
//             No items yet — click "Add Item" above to start.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  HelpCircle,
  Star,
  ListChecks,
  Layers,
  Package,
  Upload,
  Check,
  X,
} from "lucide-react";
import { servicesApi, resolveImageUrl } from "../../app/lib/adminApi";

const easeOut = [0.22, 1, 0.36, 1];

const CATEGORIES = ["Heat", "Cold", "Recovery Tech", "Bathing", "Bodywork", "Amenity"];

const ICON_OPTIONS = [
  "Flame", "Snowflake", "Heart", "Droplets", "Zap", "Waves",
  "ShieldCheck", "Moon", "Bone", "Leaf", "Sparkles", "Brain",
  "Users", "Sun", "Wind", "Star",
];

const emptyService = {
  slug: "",
  title: "",
  shortTitle: "",
  category: "Heat",
  tagline: "",
  duration: "",
  price: "",
  capacity: "",
  rating: 5,
  reviewsCount: 0,
  heroImage: "",
  intro: "",
  overview: [],
  included: [],
  gallery: [],
  related: [],
  benefits: [],
  process: [],
  reviews_list: [],
  faqs: [],
  isActive: true,
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initForm(service) {
  if (!service) return { ...emptyService };
  return {
    ...emptyService,
    ...service,
    price: service.price ?? "",
    rating: service.rating ?? 5,
    reviewsCount: service.reviewsCount ?? 0,
    overview: service.overview || [],
    included: service.included || [],
    gallery: service.gallery || [],
    related: service.related || [],
    benefits: service.benefits || [],
    process: service.process || [],
    reviews_list: service.reviews_list || [],
    faqs: service.faqs || [],
  };
}

const SECTIONS = [
  { id: "basic",    label: "Basic Info",        icon: Sparkles },
  { id: "pricing",  label: "Pricing & Details", icon: Package },
  { id: "content",  label: "Content",           icon: BookOpen },
  { id: "benefits", label: "Benefits",          icon: Layers },
  { id: "process",  label: "Process",           icon: ListChecks },
  { id: "reviews",  label: "Reviews",           icon: Star },
  { id: "faqs",     label: "FAQs",              icon: HelpCircle },
];

export default function ServiceFormPage({
  mode = "add",
  initialService = null,
  availableServices = null,
  onSubmit,
  submitting: externalSubmitting = false,
  error: externalError = "",
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => initForm(initialService));
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");
  const [servicesList, setServicesList] = useState(availableServices || []);
  const [loadingServices, setLoadingServices] = useState(!availableServices);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [savingInternal, setSavingInternal] = useState(false);
  const [errors, setErrors] = useState([]);
  const [activeSection, setActiveSection] = useState("basic");

  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const isSaving = externalSubmitting || savingInternal;

  // Fetch existing services for the Related Services selector
  useEffect(() => {
    if (availableServices) {
      setServicesList(availableServices);
      setLoadingServices(false);
      return;
    }

    let active = true;
    async function loadServices() {
      try {
        // Fetch both active and inactive services for admin selection
        const res = await servicesApi.list({ limit: 100, isActive: "" });
        const list = Array.isArray(res) ? res : res?.data || res?.services || [];
        if (active) setServicesList(list);
      } catch (err) {
        console.error("Failed to fetch services for related list:", err);
      } finally {
        if (active) setLoadingServices(false);
      }
    }

    loadServices();
    return () => {
      active = false;
    };
  }, [availableServices]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: !slugManuallyEdited ? slugify(value) : prev.slug,
    }));
  };

  const handleSlugChange = (value) => {
    setSlugManuallyEdited(true);
    setField("slug", value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
  };

  const handleHeroFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    setErrors([]);
    try {
      const res = await servicesApi.uploadImages({ heroFile: file });
      const uploadedUrl = res?.data?.heroImage;
      if (!uploadedUrl) {
        throw new Error("Server did not return heroImage URL");
      }
      setField("heroImage", uploadedUrl);
    } catch (err) {
      setErrors([err.message || "Hero image upload failed"]);
    } finally {
      setUploadingHero(false);
      e.target.value = "";
    }
  };

  const handleGalleryFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingGallery(true);
    setErrors([]);
    try {
      const res = await servicesApi.uploadImages({ galleryFiles: files });
      const uploadedUrls = res?.data?.gallery || [];
      if (!uploadedUrls.length) {
        throw new Error("Server did not return gallery URLs");
      }
      setField("gallery", [...form.gallery, ...uploadedUrls]);
    } catch (err) {
      setErrors([err.message || "Gallery image upload failed"]);
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const removeGalleryImage = (index) => {
    setField(
      "gallery",
      form.gallery.filter((_, idx) => idx !== index)
    );
  };

  const toggleRelatedService = (slug) => {
    setForm((prev) => {
      const exists = prev.related.includes(slug);
      return {
        ...prev,
        related: exists
          ? prev.related.filter((item) => item !== slug)
          : [...prev.related, slug],
      };
    });
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const clientErrors = [];
    if (!form.slug.trim()) clientErrors.push("Slug is required");
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      clientErrors.push("Slug must contain only lowercase letters, numbers, and hyphens");
    }
    if (!form.title.trim()) clientErrors.push("Title is required");
    if (!form.shortTitle.trim()) clientErrors.push("Short title is required");
    if (!form.tagline.trim()) clientErrors.push("Tagline is required");
    if (!form.duration.trim()) clientErrors.push("Duration is required");
    if (form.price === "" || Number(form.price) < 0) clientErrors.push("Price must be ≥ 0");
    if (!form.capacity.trim()) clientErrors.push("Capacity is required");
    if (!form.heroImage.trim()) clientErrors.push("Hero image is required");
    if (!form.intro.trim()) clientErrors.push("Intro is required");

    if (clientErrors.length) {
      setErrors(clientErrors);
      scrollToSection("basic");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      rating: Number(form.rating) || 0,
      reviewsCount: Number(form.reviewsCount) || 0,
      overview: form.overview.filter((s) => s.trim()),
      included: form.included.filter((s) => s.trim()),
      gallery: form.gallery.filter((s) => s.trim()),
      related: form.related.filter((s) => s.trim()),
    };

    setSavingInternal(true);
    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else if (mode === "edit" && initialService?._id) {
        await servicesApi.update(initialService._id, payload);
        router.push("/admin/services");
        router.refresh();
      } else {
        await servicesApi.create(payload);
        router.push("/admin/services");
        router.refresh();
      }
    } catch (err) {
      if (err.errors?.length) {
        setErrors(err.errors.map((item) => `${item.field}: ${item.message}`));
      } else {
        setErrors([err.message || "Something went wrong"]);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSavingInternal(false);
    }
  };

  const allErrors = [...errors, ...(externalError ? [externalError] : [])];

  const selectableServices = servicesList.filter(
    (srv) => srv.slug && srv.slug !== form.slug && srv._id !== initialService?._id
  );

  return (
    <div className="relative">
      {/* ═══════ STICKY TOP BAR ═══════ */}
      <div className="sticky top-0 z-30 -mx-6 md:-mx-10 lg:-mx-12 px-6 md:px-10 lg:px-12 py-4 bg-[#080906]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push("/admin/services")}
              className="w-9 h-9 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.35em] text-[#C9944A] font-semibold">
                Admin · {mode === "add" ? "Add" : "Edit"}
              </p>
              <h1 className="font-serif text-xl md:text-2xl text-white font-light truncate">
                {mode === "add" ? "New Service" : `Edit: ${initialService?.title || "Service"}`}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.push("/admin/services")}
              className="px-4 md:px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || uploadingHero || uploadingGallery}
              className="flex items-center gap-2 px-5 md:px-7 py-2.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              {isSaving ? (
                <><Loader2 size={13} className="animate-spin" /> Saving…</>
              ) : (
                <><Save size={13} /> {mode === "add" ? "Create" : "Save"}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════ ERRORS ═══════ */}
      {allErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-1.5"
        >
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-widest">
            <AlertCircle size={14} /> Fix these before saving
          </div>
          {allErrors.map((e, i) => (
            <div key={i} className="text-red-300/80 text-xs pl-5">• {e}</div>
          ))}
        </motion.div>
      )}

      {/* ═══════ LAYOUT: TOC + FORM ═══════ */}
      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Table of Contents */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-28">
            <p className="text-[9px] uppercase tracking-[0.35em] text-white/40 font-semibold mb-4">
              Sections
            </p>
            <nav className="space-y-1">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollToSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      active
                        ? "bg-[#C9944A]/10 text-[#C9944A] border border-[#C9944A]/20"
                        : "text-white/50 hover:text-white hover:bg-white/[0.03] border border-transparent"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="text-[11px] uppercase tracking-[0.15em] font-medium">{s.label}</span>
                    {s.id === "benefits" && form.benefits.length > 0 && (
                      <span className="ml-auto text-[9px] text-[#C9944A] font-mono">{form.benefits.length}</span>
                    )}
                    {s.id === "process" && form.process.length > 0 && (
                      <span className="ml-auto text-[9px] text-[#C9944A] font-mono">{form.process.length}</span>
                    )}
                    {s.id === "reviews" && form.reviews_list.length > 0 && (
                      <span className="ml-auto text-[9px] text-[#C9944A] font-mono">{form.reviews_list.length}</span>
                    )}
                    {s.id === "faqs" && form.faqs.length > 0 && (
                      <span className="ml-auto text-[9px] text-[#C9944A] font-mono">{form.faqs.length}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* RIGHT: Form content */}
        <div className="lg:col-span-9 space-y-6">
          {/* ═══════ BASIC ═══════ */}
          <Section id="basic" title="Basic Info" desc="Core identity of the service.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title *">
                <input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Finnish Sauna"
                  className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </Field>

              <Field label="Category *">
                <select
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field
                label="Slug *"
                hint={slugManuallyEdited ? "Custom slug" : "Auto-generated from title"}
              >
                <div className="relative flex items-center">
                  <input
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="finnish-sauna"
                    className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors pr-20"
                  />
                  {slugManuallyEdited && form.title && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlugManuallyEdited(false);
                        setField("slug", slugify(form.title));
                      }}
                      className="absolute right-2 text-[9px] uppercase tracking-wider text-[#C9944A] hover:text-[#E3D9C9] px-2 py-1 rounded bg-[#C9944A]/10"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </Field>

              <Field label="Short Title *">
                <input
                  value={form.shortTitle}
                  onChange={(e) => setField("shortTitle", e.target.value)}
                  placeholder="Sauna"
                  className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </Field>

              <Field label="Tagline *" full>
                <input
                  value={form.tagline}
                  onChange={(e) => setField("tagline", e.target.value)}
                  placeholder="Stillness, wrapped in warmth."
                  className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </Field>
            </div>
          </Section>

          {/* ═══════ PRICING ═══════ */}
          <Section id="pricing" title="Pricing & Details" desc="Session economics and availability.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Price (₹) *">
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </Field>

              <Field label="Duration *" hint="e.g. 45 MIN">
                <input
                  value={form.duration}
                  onChange={(e) => setField("duration", e.target.value)}
                  placeholder="45 MIN"
                  className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </Field>

              <Field label="Capacity *">
                <input
                  value={form.capacity}
                  onChange={(e) => setField("capacity", e.target.value)}
                  placeholder="1–2 Guests"
                  className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </Field>

              <Field label="Rating">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={(e) => setField("rating", e.target.value)}
                  className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </Field>

              <Field label="Reviews Count">
                <input
                  type="number"
                  min="0"
                  value={form.reviewsCount}
                  onChange={(e) => setField("reviewsCount", e.target.value)}
                  className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors"
                />
              </Field>

              <Field label="Status">
                <button
                  type="button"
                  onClick={() => setField("isActive", !form.isActive)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    form.isActive
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-white/5 border-white/10 text-white/50"
                  }`}
                >
                  <span className="text-xs">{form.isActive ? "Active (visible)" : "Inactive (hidden)"}</span>
                  <span className={`w-10 h-5 rounded-full relative transition-colors ${form.isActive ? "bg-green-500" : "bg-white/20"}`}>
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                        form.isActive ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              </Field>
            </div>
          </Section>

          {/* ═══════ CONTENT ═══════ */}
          <Section id="content" title="Content" desc="Hero image, intro, gallery, and related services.">
            {/* HERO IMAGE FILE SELECTOR */}
            <Field label="Hero Image *" full>
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroFileSelect}
                className="hidden"
              />

              {!form.heroImage ? (
                <button
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={uploadingHero}
                  className="w-full h-40 rounded-xl border border-dashed border-white/15 hover:border-[#C9944A]/60 bg-[#0A0B09] hover:bg-[#C9944A]/[0.03] flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {uploadingHero ? (
                    <>
                      <Loader2 size={22} className="text-[#C9944A] animate-spin" />
                      <span className="text-xs text-white/60">Uploading hero image…</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 flex items-center justify-center text-[#C9944A]">
                        <Upload size={16} />
                      </div>
                      <span className="text-xs text-white/80 font-medium">
                        Select Hero Image from Device
                      </span>
                      <span className="text-[10px] text-white/35">
                        Uploads to /api/services/upload
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="relative w-full h-52 rounded-xl overflow-hidden border border-white/10 bg-[#0A0B09]">
                  <img
                    src={resolveImageUrl(form.heroImage)}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 backdrop-blur-md bg-black/60 border border-white/20 rounded-full px-3 py-1 flex items-center gap-1.5">
                    <ImageIcon size={10} className="text-[#C9944A]" />
                    <span className="text-[8px] uppercase tracking-[0.25em] text-white/70 font-bold">
                      Hero Image
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => heroInputRef.current?.click()}
                      disabled={uploadingHero}
                      className="backdrop-blur-md bg-black/70 hover:bg-[#C9944A] text-white hover:text-[#080906] border border-white/20 rounded-full px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-colors"
                    >
                      {uploadingHero ? "Uploading…" : "Change"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setField("heroImage", "")}
                      className="w-7 h-7 rounded-full backdrop-blur-md bg-black/70 hover:bg-red-500/80 text-white border border-white/20 flex items-center justify-center transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )}
            </Field>

            <Field label="Intro *" full className="mt-5">
              <textarea
                value={form.intro}
                onChange={(e) => setField("intro", e.target.value)}
                rows={3}
                placeholder="A private heat session to relax, unwind and reconnect..."
                className="w-full bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9944A] transition-colors resize-none"
              />
            </Field>

            {/* OVERVIEW & INCLUDED */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <StringArrayField
                label="Overview (paragraphs)"
                items={form.overview}
                onChange={(v) => setField("overview", v)}
                placeholder="Step into a hand-crafted cedar sauna..."
                textarea
              />
              <StringArrayField
                label="What's Included"
                items={form.included}
                onChange={(v) => setField("included", v)}
                placeholder="Private sauna suite"
              />
            </div>

            {/* GALLERY IMAGES FILE SELECTOR */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.25em] text-white/50">
                    Gallery Images ({form.gallery.length})
                  </label>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    Select one or more photos from your device.
                  </p>
                </div>
                <div>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFilesSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingGallery}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 text-[#C9944A] text-[9px] uppercase tracking-widest font-bold hover:bg-[#C9944A]/20 transition-colors disabled:opacity-50"
                  >
                    {uploadingGallery ? (
                      <><Loader2 size={11} className="animate-spin" /> Uploading…</>
                    ) : (
                      <><Plus size={11} /> Select Photos</>
                    )}
                  </button>
                </div>
              </div>

              {form.gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {form.gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-[#0A0B09] group"
                    >
                      <img
                        src={resolveImageUrl(imgUrl)}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/75 hover:bg-red-500 text-white border border-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 size={12} />
                      </button>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[9px] text-white/70 font-mono">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  className="text-white/30 text-xs py-6 text-center border border-dashed border-white/10 hover:border-[#C9944A]/40 rounded-xl italic cursor-pointer transition-colors"
                >
                  No gallery images yet — click "Select Photos" to upload images.
                </div>
              )}
            </div>

            {/* RELATED SERVICES SELECTOR */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.25em] text-white/50">
                    Related Services ({form.related.length} selected)
                  </label>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    Choose from services you have already added.
                  </p>
                </div>
                {form.related.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setField("related", [])}
                    className="text-[9px] uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {loadingServices ? (
                <div className="flex items-center gap-2 text-xs text-white/40 py-4">
                  <Loader2 size={14} className="animate-spin text-[#C9944A]" />
                  Loading existing services…
                </div>
              ) : selectableServices.length === 0 ? (
                <div className="text-white/25 text-xs py-4 px-4 border border-dashed border-white/10 rounded-xl italic">
                  No other services added yet. Create more services to select them here.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {selectableServices.map((srv) => {
                    const isSelected = form.related.includes(srv.slug);
                    return (
                      <button
                        key={srv._id || srv.slug}
                        type="button"
                        onClick={() => toggleRelatedService(srv.slug)}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-[#C9944A]/15 border-[#C9944A] text-white"
                            : "bg-[#0A0B09] border-white/10 text-white/60 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{srv.title}</div>
                          <div className="text-[10px] text-white/40 truncate mt-0.5">
                            {srv.category} · {srv.slug}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#C9944A] text-[#080906]"
                              : "border border-white/20"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>

          {/* ═══════ BENEFITS ═══════ */}
          <Section id="benefits" title="Benefits" count={form.benefits.length} desc="What the service actually does.">
            <ObjectArrayField
              items={form.benefits}
              onChange={(v) => setField("benefits", v)}
              emptyItem={{ icon: "Flame", title: "", desc: "" }}
              fields={[
                { key: "icon", label: "Icon", type: "icon-select" },
                { key: "title", label: "Title", placeholder: "Deep Heat Therapy" },
                { key: "desc", label: "Description", placeholder: "85–90°C dry heat relaxes muscles.", textarea: true },
              ]}
            />
          </Section>

          {/* ═══════ PROCESS ═══════ */}
          <Section id="process" title="Process Steps" count={form.process.length} desc="How the ritual unfolds, step by step.">
            <ObjectArrayField
              items={form.process}
              onChange={(v) => setField("process", v)}
              emptyItem={{ title: "", desc: "" }}
              fields={[
                { key: "title", label: "Step Title", placeholder: "Arrive" },
                { key: "desc", label: "Step Description", placeholder: "Check in at reception...", textarea: true },
              ]}
            />
          </Section>

          {/* ═══════ REVIEWS ═══════ */}
          <Section id="reviews" title="Reviews" count={form.reviews_list.length} desc="Testimonials shown on the service page.">
            <ObjectArrayField
              items={form.reviews_list}
              onChange={(v) => setField("reviews_list", v)}
              emptyItem={{ name: "", rating: 5, text: "" }}
              fields={[
                { key: "name", label: "Name", placeholder: "Arjun M." },
                { key: "rating", label: "Rating (0–5)", type: "number" },
                { key: "text", label: "Review Text", placeholder: "The most restorative 45 minutes...", textarea: true },
              ]}
            />
          </Section>

          {/* ═══════ FAQS ═══════ */}
          <Section id="faqs" title="FAQs" count={form.faqs.length} desc="Questions guests commonly ask.">
            <ObjectArrayField
              items={form.faqs}
              onChange={(v) => setField("faqs", v)}
              emptyItem={{ q: "", a: "" }}
              fields={[
                { key: "q", label: "Question", placeholder: "Is the sauna private?" },
                { key: "a", label: "Answer", placeholder: "Yes — each session is fully private.", textarea: true },
              ]}
            />
          </Section>

          {/* ═══════ FINAL ACTIONS ═══════ */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-8 mt-8 border-t border-white/10">
            <button
              type="button"
              onClick={() => router.push("/admin/services")}
              className="px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || uploadingHero || uploadingGallery}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors disabled:opacity-60 disabled:cursor-wait shadow-[0_0_40px_rgba(201,148,74,0.25)]"
            >
              {isSaving ? (
                <><Loader2 size={14} className="animate-spin" /> Saving…</>
              ) : (
                <><Save size={14} /> {mode === "add" ? "Create Service" : "Save Changes"}</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════ */
function Section({ id, title, count, desc, children }) {
  return (
    <motion.section
      id={`section-${id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="bg-[#121310] border border-white/10 rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-white/5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl md:text-2xl text-white font-light flex items-center gap-3">
            {title}
            {typeof count === "number" && (
              <span className="text-[10px] uppercase tracking-widest text-[#C9944A] font-bold bg-[#C9944A]/10 border border-[#C9944A]/30 px-2 py-0.5 rounded-full font-sans">
                {count}
              </span>
            )}
          </h2>
          {desc && <p className="text-white/40 text-xs mt-1">{desc}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.section>
  );
}

function Field({ label, hint, full, children, className = "" }) {
  return (
    <div className={`${full ? "md:col-span-2 lg:col-span-3" : ""} ${className}`}>
      <label className="block text-[9px] uppercase tracking-[0.25em] text-white/50 mb-1.5">
        {label}
        {hint && <span className="text-white/30 normal-case tracking-normal ml-2">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function StringArrayField({ label, items, onChange, placeholder, textarea }) {
  const add = () => onChange([...items, ""]);
  const update = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[9px] uppercase tracking-[0.25em] text-white/50">{label}</label>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#C9944A] hover:text-[#E3D9C9] transition-colors"
        >
          <Plus size={11} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            {textarea ? (
              <textarea
                value={item}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="flex-1 bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#C9944A] transition-colors resize-none"
              />
            ) : (
              <input
                value={item}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-[#0A0B09] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#C9944A] transition-colors"
              />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-9 h-9 rounded-lg border border-white/10 text-white/30 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center transition-colors shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-white/25 text-xs py-2 italic">
            No items yet — click "Add" to start.
          </div>
        )}
      </div>
    </div>
  );
}

function ObjectArrayField({ items, onChange, fields, emptyItem }) {
  const add = () => onChange([...items, { ...emptyItem }]);
  const update = (i, key, v) => onChange(items.map((x, idx) => (idx === i ? { ...x, [key]: v } : x)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 text-[#C9944A] text-[9px] uppercase tracking-widest font-bold hover:bg-[#C9944A]/20 transition-colors"
        >
          <Plus size={11} /> Add Item
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="relative bg-[#0A0B09] border border-white/10 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-widest text-[#C9944A] font-semibold">
                #{i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {fields.map((f) => (
                <div key={f.key} className={f.textarea ? "md:col-span-2" : ""}>
                  <label className="block text-[8px] uppercase tracking-widest text-white/40 mb-1">
                    {f.label}
                  </label>
                  {f.type === "icon-select" ? (
                    <select
                      value={item[f.key] || ""}
                      onChange={(e) => update(i, f.key, e.target.value)}
                      className="w-full bg-[#121310] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-[#C9944A]"
                    >
                      {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  ) : f.textarea ? (
                    <textarea
                      value={item[f.key] || ""}
                      onChange={(e) => update(i, f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={2}
                      className="w-full bg-[#121310] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-[#C9944A] resize-none"
                    />
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={item[f.key] ?? ""}
                      onChange={(e) =>
                        update(i, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)
                      }
                      placeholder={f.placeholder}
                      className="w-full bg-[#121310] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-[#C9944A]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-white/25 text-xs py-4 text-center border border-dashed border-white/10 rounded-lg italic">
            No items yet — click "Add Item" above to start.
          </div>
        )}
      </div>
    </div>
  );
}