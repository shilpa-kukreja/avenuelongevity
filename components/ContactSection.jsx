"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, Clock, ArrowRight, Plus, Minus, CheckCircle2, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const faqs = [
  {
    q: "What should I bring for my first visit?",
    a: "We provide everything you need including towels, robes, and premium shower facilities. We recommend bringing a swimsuit for the sauna and cold plunge, and comfortable clothing for the recovery tech sessions.",
  },
  {
    q: "What is the cancellation policy?",
    a: "We require 24 hours notice for cancellations. Cancellations made within 24 hours of the appointment will be charged 50% of the service fee.",
  },
  {
    q: "Are the recovery tech sessions fully clothed?",
    a: "Yes. The Ceragem Massage Beds, THz Teta-P90, and B Pulse Pelvic Chair are all experienced fully clothed in our private rooms.",
  },
];

const floatingLabelClass =
  "pointer-events-none absolute left-0 top-3 text-xs text-white/40 uppercase tracking-[0.2em] transition-all duration-200 " +
  "peer-placeholder-shown:top-3 peer-placeholder-shown:text-xs peer-placeholder-shown:tracking-[0.2em] peer-placeholder-shown:text-white/40 " +
  "peer-focus:-top-4 peer-focus:text-[10px] peer-focus:tracking-[0.25em] peer-focus:text-[#C9944A] " +
  "peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:tracking-[0.25em] peer-[:not(:placeholder-shown)]:text-[#C9944A]";

export default function ContactSection() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/messages`, formData);
      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-[#080906] pt-40 pb-24 overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#C9944A]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#9A6B3F]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl lg:text-7xl text-white font-light leading-tight"
          >
            Let's begin your <br />
            <span className="italic text-[#E3D9C9]">transformation.</span>
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">
          {/* LEFT: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <div>
              <h2 className="font-serif text-3xl text-white mb-4">Visit the Sanctuary</h2>
              <p className="text-white/50 text-sm leading-relaxed font-light max-w-md mb-8">
                Located in the heart of the city, our retreat is designed to be your escape from the
                noise. Valet parking is available upon arrival.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#121310] border border-white/5 p-6 rounded-2xl group hover:border-[#C9944A]/30 transition-colors">
                <MapPin
                  size={20}
                  className="text-[#C9944A] mb-4 group-hover:-translate-y-1 transition-transform"
                />
                <h3 className="text-white text-sm font-semibold mb-2">Location</h3>
                <p className="text-white/50 text-xs leading-relaxed">
                  123 Wellness Ave,
                  <br />
                  City Center, 400001
                </p>
              </div>
              <div className="bg-[#121310] border border-white/5 p-6 rounded-2xl group hover:border-[#C9944A]/30 transition-colors">
                <Clock
                  size={20}
                  className="text-[#C9944A] mb-4 group-hover:-translate-y-1 transition-transform"
                />
                <h3 className="text-white text-sm font-semibold mb-2">Opening Hours</h3>
                <p className="text-white/50 text-xs leading-relaxed">
                  Mon - Sun
                  <br />
                  7:00 AM - 10:00 PM
                </p>
              </div>
              <a
                href="mailto:hello@avenue.com"
                className="bg-[#121310] border border-white/5 p-6 rounded-2xl group hover:border-[#C9944A]/30 transition-colors block"
              >
                <Mail
                  size={20}
                  className="text-[#C9944A] mb-4 group-hover:-translate-y-1 transition-transform"
                />
                <h3 className="text-white text-sm font-semibold mb-2">Email Us</h3>
                <p className="text-white/50 text-xs">hello@avenuelongevity.com</p>
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366]/5 border border-[#121310]/20 p-6 rounded-2xl group hover:border-[#C9944A]/30 transition-all block relative overflow-hidden"
              >
                <FaWhatsapp
                  size={20}
                  className="text-[#C9944A] mb-4 group-hover:scale-110 transition-transform relative z-10"
                />
                <h3 className="text-white text-sm font-semibold mb-2 relative z-10">WhatsApp</h3>
                <p className="text-white/50 text-xs relative z-10">Chat with our concierge</p>
              </a>
            </div>
          </motion.div>

          {/* RIGHT: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#121310]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-3xl relative"
          >
            <h3 className="font-serif text-2xl text-white mb-8">Send an Inquiry</h3>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder=" "
                    required
                    className="peer w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-transparent outline-none focus:border-[#C9944A] transition-colors"
                  />
                  <label htmlFor="contact-name" className={floatingLabelClass}>
                    Full Name
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-transparent outline-none focus:border-[#C9944A] transition-colors"
                  />
                  <label htmlFor="contact-phone" className={floatingLabelClass}>
                    Phone Number
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder=" "
                  required
                  className="peer w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-transparent outline-none focus:border-[#C9944A] transition-colors"
                />
                <label htmlFor="contact-email" className={floatingLabelClass}>
                  Email Address
                </label>
              </div>

              <div className="relative">
                <input
                  id="contact-subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder=" "
                  required
                  className="peer w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-transparent outline-none focus:border-[#C9944A] transition-colors"
                />
                <label htmlFor="contact-subject" className={floatingLabelClass}>
                  Subject
                </label>
              </div>

              <div className="relative">
                <textarea
                  id="contact-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder=" "
                  required
                  rows={4}
                  className="peer w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-transparent outline-none focus:border-[#C9944A] transition-colors resize-none"
                />
                <label htmlFor="contact-message" className={floatingLabelClass}>
                  How can we help?
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full group flex items-center justify-center gap-3 py-4 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-500 overflow-hidden ${
                  isSubmitted
                    ? "bg-[#25D366] text-white"
                    : "bg-[#C9944A] text-[#080906] hover:bg-[#E3D9C9] hover:scale-[1.02] shadow-[0_0_30px_rgba(201,148,74,0.2)]"
                } disabled:opacity-70`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending...
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle2 size={16} /> Message Sent
                  </>
                ) : (
                  <>
                    <span>Send Message</span>{" "}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full h-[400px] rounded-3xl overflow-hidden border border-white/10 relative mb-16 group"
        >
          <div className="absolute inset-0 bg-[#080906]/40 pointer-events-none z-10 mix-blend-multiply" />
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509374!2d144.9537353153166!3d-37.81720997975171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577d6a12c0b0f0!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1614312247311!5m2!1sen!2sau"
            width="100%"
            height="100%"
            style={{
              border: 0,
              filter: "invert(90%) hue-rotate(180deg) contrast(1.2) grayscale(0.5)",
            }}
            allowFullScreen=""
            loading="lazy"
            className="group-hover:scale-105 transition-transform duration-[2s]"
          />
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-white mb-4">Common Questions</h2>
            <p className="text-white/40 text-sm">Everything you need to know before your visit.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-[#121310] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-[#C9944A]/30 transition-colors"
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <div className="flex items-center justify-between p-6">
                  <h3 className="text-white font-serif text-lg">{faq.q}</h3>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60">
                    {activeFaq === index ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </div>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-white/50 text-sm leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}