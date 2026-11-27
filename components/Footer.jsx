"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const easeOut = [0.22, 1, 0.36, 1];

export default function Footer() {
  const [currentYear, setCurrentYear] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Mobile accordion state — null means all closed
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post(`${API_URL}/subscribers`, { email });
      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to subscribe");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (key) =>
    setOpenSection((prev) => (prev === key ? null : key));

  const exploreLinks = [
    { label: "Home", href: "/" },
    { label: "Our Services", href: "/services" },
    { label: "Membership", href: "/packages" },
    { label: "The Space", href: "/space" },
    { label: "Our Philosophy", href: "/about" },
    { label: "Get in Touch", href: "/contact" },
  ];

  return (
    <footer className="relative w-full bg-[#0A0B09] text-white overflow-hidden flex flex-col pt-14 md:pt-16">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">
        {/* ═══════════ CTA BANNER ═══════════ */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-10 md:pb-12 border-b border-white/10">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-serif text-2xl sm:text-3xl md:text-5xl font-light text-center md:text-left"
          >
            Begin your <span className="italic text-[#C9944A]">journey.</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-auto"
          >
            <Link
              href="/book"
              className="group flex items-center justify-center gap-3 bg-[#F5F0E8] text-[#0A0B09] px-8 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#C9944A] hover:text-white transition-all duration-300 w-full md:w-auto"
            >
              RESERVE YOUR SESSION
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>

        {/* ═══════════ MAIN GRID (desktop) ═══════════ */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-10 py-12 w-full">
          {/* Col 1: Brand */}
          <div className="flex flex-col items-start col-span-2 lg:col-span-1">
            <Link href="/" className="flex flex-col items-start mb-4">
              <span className="font-serif text-2xl tracking-[0.2em] font-light">
                AVENUE
              </span>
              <span className="text-[7px] tracking-[0.5em] uppercase text-[#C9944A] mt-0.5 font-semibold">
                Longevity Retreat
              </span>
            </Link>
            <p className="text-[#A89C8C] text-[12px] leading-relaxed font-light mb-6 max-w-[250px]">
              A private sanctuary merging ancient contrast therapy with
              advanced recovery science.
            </p>
            <div className="flex gap-3">
              {[FaInstagram, FaFacebookF, FaTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#A89C8C] hover:bg-[#C9944A] hover:text-white hover:border-[#C9944A] transition-all duration-300"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Explore */}
          <div className="flex flex-col">
            <h4 className="text-[10px] tracking-[0.35em] uppercase text-[#C9944A] font-semibold mb-6">
              Explore
            </h4>
            <ul className="flex flex-col gap-4">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 w-fit text-[#E3D9C9]/55 text-[13px] font-light tracking-wide transition-all duration-300 hover:text-[#C9944A]"
                  >
                    <span className="w-0 h-[1px] bg-[#C9944A] transition-all duration-300 group-hover:w-4" />
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="flex flex-col">
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white font-bold mb-4">
              Contact
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-3 text-[#A89C8C] text-[12px] font-light">
                <MapPin size={14} className="text-[#C9944A] shrink-0 mt-0.5" />
                <span>
                  123 Wellness Avenue,
                  <br />
                  City Center, 400001
                </span>
              </li>
              <li className="flex items-center gap-3 text-[#A89C8C] text-[12px] font-light">
                <Phone size={14} className="text-[#C9944A] shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="hover:text-white transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3 text-[#A89C8C] text-[12px] font-light">
                <Mail size={14} className="text-[#C9944A] shrink-0" />
                <a
                  href="mailto:hello@avenue.com"
                  className="hover:text-white transition-colors"
                >
                  hello@avenue.com
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="flex flex-col">
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white font-bold mb-4">
              Newsletter
            </h4>
            <p className="text-[#A89C8C] text-[12px] font-light mb-4">
              Subscribe for longevity tips and exclusive offers.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="relative flex items-center border-b border-white/20 pb-2 focus-within:border-[#C9944A] transition-colors"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="bg-transparent border-none outline-none text-[12px] text-white placeholder:text-[#A89C8C] w-full font-light"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="text-[#C9944A] hover:text-white transition-colors ml-2 disabled:opacity-50"
                aria-label="Subscribe"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            </form>

            {success && (
              <p className="text-green-400 text-[10px] mt-2 flex items-center gap-1">
                <CheckCircle2 size={10} /> Subscribed successfully!
              </p>
            )}
            {error && <p className="text-red-400 text-[10px] mt-2">{error}</p>}
          </div>
        </div>

        {/* ═══════════ MOBILE LAYOUT ═══════════ */}
        <div className="md:hidden py-8 w-full flex flex-col">
          {/* Brand block — always visible */}
          <div className="flex flex-col items-center text-center pb-8 border-b border-white/10">
            <Link href="/" className="flex flex-col items-center mb-4">
              <span className="font-serif text-2xl tracking-[0.2em] font-light">
                AVENUE
              </span>
              <span className="text-[7px] tracking-[0.5em] uppercase text-[#C9944A] mt-0.5 font-semibold">
                Longevity Retreat
              </span>
            </Link>
            <p className="text-[#A89C8C] text-[12px] leading-relaxed font-light mb-5 max-w-[280px]">
              A private sanctuary merging ancient contrast therapy with
              advanced recovery science.
            </p>
            <div className="flex gap-3">
              {[FaInstagram, FaFacebookF, FaTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-[#A89C8C] active:bg-[#C9944A] active:text-white active:border-[#C9944A] transition-all duration-300"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Accordion sections */}
          <div className="flex flex-col">
            {/* Explore */}
            <AccordionSection
              title="Explore"
              isOpen={openSection === "explore"}
              onToggle={() => toggleSection("explore")}
            >
              <ul className="flex flex-col gap-1 py-2">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between w-full py-3 px-1 text-[#E3D9C9]/70 text-[14px] font-light transition-colors active:text-[#C9944A]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-[1px] bg-[#C9944A]/40" />
                        {link.label}
                      </span>
                      <ArrowRight
                        size={14}
                        className="opacity-30 group-active:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionSection>

            {/* Contact */}
            <AccordionSection
              title="Contact"
              isOpen={openSection === "contact"}
              onToggle={() => toggleSection("contact")}
            >
              <ul className="flex flex-col gap-4 py-3">
                <li className="flex items-start gap-3 text-[#A89C8C] text-[13px] font-light">
                  <MapPin
                    size={14}
                    className="text-[#C9944A] shrink-0 mt-0.5"
                  />
                  <span>
                    123 Wellness Avenue,
                    <br />
                    City Center, 400001
                  </span>
                </li>
                <li className="flex items-center gap-3 text-[#A89C8C] text-[13px] font-light">
                  <Phone size={14} className="text-[#C9944A] shrink-0" />
                  <a
                    href="tel:+919876543210"
                    className="active:text-white transition-colors"
                  >
                    +91 98765 43210
                  </a>
                </li>
                <li className="flex items-center gap-3 text-[#A89C8C] text-[13px] font-light">
                  <Mail size={14} className="text-[#C9944A] shrink-0" />
                  <a
                    href="mailto:hello@avenue.com"
                    className="active:text-white transition-colors"
                  >
                    hello@avenue.com
                  </a>
                </li>
              </ul>
            </AccordionSection>

            {/* Newsletter */}
            <AccordionSection
              title="Newsletter"
              isOpen={openSection === "newsletter"}
              onToggle={() => toggleSection("newsletter")}
            >
              <div className="py-3">
                <p className="text-[#A89C8C] text-[12px] font-light mb-4">
                  Subscribe for longevity tips and exclusive offers.
                </p>

                <form
                  onSubmit={handleSubscribe}
                  className="relative flex items-center border-b border-white/20 pb-2 focus-within:border-[#C9944A] transition-colors"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="bg-transparent border-none outline-none text-[13px] text-white placeholder:text-[#A89C8C] w-full font-light"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="text-[#C9944A] active:text-white transition-colors ml-2 disabled:opacity-50 shrink-0"
                    aria-label="Subscribe"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                  </button>
                </form>

                {success && (
                  <p className="text-green-400 text-[10px] mt-2 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Subscribed successfully!
                  </p>
                )}
                {error && (
                  <p className="text-red-400 text-[10px] mt-2">{error}</p>
                )}
              </div>
            </AccordionSection>
          </div>

          {/* Extra mobile CTAs */}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/book"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#C9944A] text-[#0A0B09] text-[10px] uppercase tracking-[0.25em] font-bold active:bg-[#E3D9C9] transition-colors"
            >
              Reserve Your Session
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════ COPYRIGHT BAR ═══════════ */}
      <div className="border-t border-white/10 bg-[#0A0B09] relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-[#A89C8C] tracking-widest uppercase text-center md:text-left">
          <p>© {currentYear} Avenue Longevity Retreat.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   ACCORDION SECTION (mobile)
═══════════════════════════════════════════ */
function AccordionSection({ title, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-1 text-left active:bg-white/[0.02] transition-colors"
        aria-expanded={isOpen}
      >
        <span
          className={`text-[11px] tracking-[0.3em] uppercase font-semibold transition-colors ${
            isOpen ? "text-[#C9944A]" : "text-white"
          }`}
        >
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: easeOut }}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
            isOpen
              ? "border-[#C9944A] bg-[#C9944A]/10 text-[#C9944A]"
              : "border-white/15 text-white/50"
          }`}
        >
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}