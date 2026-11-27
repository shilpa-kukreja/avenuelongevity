"use client";

import React, { useState, useEffect } from "react";
import {
  Search, Menu, MapPin, Phone, Mail, User as UserIcon, X, ArrowRight,
} from "lucide-react";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import CartNavButton from "./CartNavButton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAuth } from "../app/contexts/AuthContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // ESC closes menu
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navLinksLeft = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Memberships", path: "/packages" },
  ];

  const navLinksRight = [
    { name: "Our Space", path: "/space" },
    { name: "About", path: "/about" },
  ];

  const allLinks = [...navLinksLeft, ...navLinksRight];

  const NavLink = ({ link }) => (
    <Link
      href={link.path}
      className="group relative flex flex-col items-center justify-center overflow-hidden h-5"
    >
      <span className="text-white transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
        {link.name}
      </span>
      <span className="absolute inset-0 flex items-center justify-center text-[#9A6B3F] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0">
        {link.name}
      </span>
    </Link>
  );

  const getImageUrl = (url) => {
    if (!url)
      return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop";
    if (url.startsWith("http")) return url;
    return `${
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:5000"
    }${url}`;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50 flex flex-col font-sans"
      >
        {/* ── TOP BAR (desktop only) ── */}
        <div
          className={`hidden md:flex justify-between items-center px-8 overflow-hidden transition-all duration-700 ease-in-out
            ${
              isScrolled
                ? "h-0 opacity-0 py-0 bg-[#121310] border-transparent"
                : "h-10 opacity-100 py-2.5 bg-[#121310] border-b border-white/10"
            }`}
        >
          <div className="flex gap-8 items-center text-[9px] tracking-[0.2em] uppercase text-white/80">
            <span className="flex items-center gap-2 hover:text-[#9A6B3F] transition-colors cursor-pointer">
              <MapPin size={10} /> 123 Wellness Ave, City
            </span>
            <span className="flex items-center gap-2 hover:text-[#9A6B3F] transition-colors cursor-pointer">
              <Phone size={10} /> +91 98765 43210
            </span>
          </div>
          <div className="flex gap-8 items-center text-[9px] tracking-[0.2em] uppercase text-white/80">
            <span className="flex items-center gap-2 hover:text-[#9A6B3F] transition-colors cursor-pointer">
              <Mail size={10} /> hello@avenuelongevity.com
            </span>
            <div className="flex gap-5 border-l border-white/20 pl-8">
              <FaInstagram
                size={12}
                className="cursor-pointer hover:text-[#9A6B3F] hover:-translate-y-0.5 transition-all duration-300"
              />
              <FaFacebookF
                size={12}
                className="cursor-pointer hover:text-[#9A6B3F] hover:-translate-y-0.5 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* ── MAIN NAVBAR ── */}
        <div
          className={`transition-all duration-500 ease-in-out px-4 sm:px-6 md:px-12 flex items-center justify-between
            ${
              isScrolled
                ? "bg-[#121310]/95 backdrop-blur-xl py-3 md:py-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] border-b border-[#9A6B3F]/20"
                : "bg-transparent py-4 md:py-5 border-b border-transparent"
            }`}
        >
          {/* Left Side */}
          <div className="flex-1 flex items-center justify-start gap-10">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors duration-300 group">
              <Search
                size={18}
                className="text-white group-hover:text-[#9A6B3F] group-hover:scale-110 transition-all duration-300"
              />
            </div>

            <div className="hidden lg:flex gap-8 text-[10px] font-medium tracking-[0.25em] uppercase">
              {navLinksLeft.map((link) => (
                <NavLink key={link.name} link={link} />
              ))}
            </div>
          </div>

          {/* Center Logo */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <Link href="/" className="flex flex-col items-center group relative">
              <span className="font-serif text-[22px] sm:text-[26px] md:text-[32px] tracking-[0.3em] text-white font-light transition-all duration-500 group-hover:text-[#F5F0E8]">
                AVENUE
              </span>
              <span className="text-[6px] sm:text-[7px] md:text-[8px] tracking-[0.6em] md:tracking-[0.7em] uppercase text-[#9A6B3F] mt-0.5 md:mt-1 font-semibold transition-all duration-500 group-hover:tracking-[0.9em]">
                Longevity Retreat
              </span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex-1 flex items-center justify-end gap-3 md:gap-6">
            <div className="hidden lg:flex gap-8 text-[10px] font-medium tracking-[0.25em] uppercase">
              {navLinksRight.map((link) => (
                <NavLink key={link.name} link={link} />
              ))}
            </div>

            <div className="flex items-center gap-3 md:gap-4 lg:border-l lg:border-white/20 lg:pl-6">
              {/* Auth — desktop only (mobile has it in the drawer) */}
              {!loading && (
                <div className="hidden lg:block">
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="relative group w-9 h-9 rounded-full overflow-hidden border border-[#9A6B3F]/50 hover:border-[#9A6B3F] transition-all duration-300 block"
                      aria-label="Open dashboard"
                    >
                      <img
                        src={getImageUrl(user.avatar)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white hover:text-[#9A6B3F] transition-colors group"
                    >
                      <UserIcon
                        size={16}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span className="hidden md:block">Login</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Cart — always visible */}
              <CartNavButton />

              {/* Book Now — desktop only */}
              <Link
                href="/book"
                className="hidden lg:flex items-center justify-center bg-[#9A6B3F] text-white px-7 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#F5F0E8] hover:text-[#121310] transition-colors duration-300"
              >
                Book Now
              </Link>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} className="hover:text-[#9A6B3F] transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ═══════════ MOBILE MENU DRAWER ═══════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-[#080906]/80 backdrop-blur-md lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm bg-[#0F100D] border-l border-white/10 flex flex-col lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <Link href="/" className="flex flex-col">
                  <span className="font-serif text-2xl tracking-[0.3em] text-white font-light">
                    AVENUE
                  </span>
                  <span className="text-[7px] tracking-[0.7em] uppercase text-[#9A6B3F] mt-0.5 font-semibold">
                    Longevity Retreat
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer content (scrollable) */}
              <div className="flex-1 overflow-y-auto py-6">
                {/* Nav links */}
                <nav className="flex flex-col">
                  {allLinks.map((link, i) => {
                    const isActive = pathname === link.path;
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.1 + i * 0.06,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Link
                          href={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`group flex items-center justify-between px-6 py-4 border-b border-white/5 transition-colors ${
                            isActive
                              ? "text-[#C9944A]"
                              : "text-white hover:text-[#C9944A]"
                          }`}
                        >
                          <span className="font-serif text-2xl font-light">
                            {link.name}
                          </span>
                          <ArrowRight
                            size={18}
                            className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Divider */}
                <div className="my-6 mx-6 h-[1px] bg-white/10" />

                {/* Auth section */}
                <div className="px-6 space-y-3">
                  {!loading && user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-[#9A6B3F]/40 shrink-0">
                        <img
                          src={getImageUrl(user.avatar)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-medium truncate">
                          {user.name || "My Account"}
                        </p>
                        <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 truncate">
                          View Dashboard
                        </p>
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-white/40 shrink-0"
                      />
                    </Link>
                  ) : !loading ? (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full border border-white/15 text-white text-[10px] uppercase tracking-[0.25em] font-bold hover:border-[#9A6B3F] hover:text-[#C9944A] transition-colors"
                    >
                      <UserIcon size={14} />
                      Login / Sign Up
                    </Link>
                  ) : null}

                  {/* Book Now — mobile */}
                  <Link
                    href="/book"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#E3D9C9] transition-colors"
                  >
                    Book Now
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-white/10 px-6 py-5">
                <div className="flex flex-col gap-3 text-[10px] uppercase tracking-[0.2em] text-white/50">
                  <span className="flex items-center gap-2">
                    <MapPin size={11} className="text-[#9A6B3F] shrink-0" />
                    123 Wellness Ave, City
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone size={11} className="text-[#9A6B3F] shrink-0" />
                    +91 98765 43210
                  </span>
                  <span className="flex items-center gap-2">
                    <Mail size={11} className="text-[#9A6B3F] shrink-0" />
                    hello@avenuelongevity.com
                  </span>
                </div>

                <div className="flex gap-4 mt-5">
                  <a
                    href="#"
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-[#C9944A] hover:border-[#C9944A]/40 transition-colors"
                    aria-label="Instagram"
                  >
                    <FaInstagram size={13} />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-[#C9944A] hover:border-[#C9944A]/40 transition-colors"
                    aria-label="Facebook"
                  >
                    <FaFacebookF size={13} />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}