"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Bot,
  User,
  X,
  SendHorizontal,
  Sparkles,
  Loader2,
  RotateCcw,
  CalendarPlus,
  PhoneCall,
  LayoutDashboard,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../app/contexts/AuthContext";
import { useCart } from "../app/contexts/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const INITIAL_MESSAGE = {
  role: "ai",
  text: "Welcome to Avenue Longevity Retreat. Ask me about our rituals, recovery tech, pricing, memberships, coupons, credits, or contact details.",
  items: [],
  actions: [],
  followUps: [
    "Give me all services list",
    "Contact number, email & hours",
    "Tell me about memberships",
    "Any active coupon codes?",
  ],
};

const getActionIcon = (href = "") => {
  if (href.startsWith("/book")) return <CalendarPlus size={12} />;
  if (href.startsWith("/contact")) return <PhoneCall size={12} />;
  if (href.startsWith("/dashboard")) return <LayoutDashboard size={12} />;
  return <ArrowUpRight size={12} />;
};

const useSafeAuth = () => {
  try {
    return useAuth?.() || null;
  } catch {
    return null;
  }
};

const useSafeCart = () => {
  try {
    return useCart?.() || null;
  } catch {
    return null;
  }
};

function AiChatbotWidget() {
  const auth = useSafeAuth();
  const cartCtx = useSafeCart();

  const user = auth?.user ?? null;
  const isCartOpen = cartCtx?.isOpen ?? false;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleReset = () => {
    if (isLoading) return;
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  const handleSend = async (text) => {
    const cleanText = (text || "").trim();
    if (!cleanText || isLoading) return;

    const updatedMessages = [
      ...messages,
      { role: "user", text: cleanText, items: [], actions: [], followUps: [] },
    ];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = updatedMessages.slice(-8).map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      }));

      const resolvedName = user?.user?.name || user?.name || null;
      const resolvedCredits = user?.user?.credits ?? user?.credits ?? 0;

      const { data } = await axios.post(`${API_URL}/chat`, {
        message: cleanText,
        history: historyPayload,
        userContext: resolvedName
          ? { name: resolvedName, credits: resolvedCredits }
          : null,
      });

      if (data?.success && data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: data.reply,
            items: Array.isArray(data.items) ? data.items : [],
            actions: Array.isArray(data.actions) ? data.actions : [],
            followUps: Array.isArray(data.followUps) ? data.followUps : [],
          },
        ]);
      } else {
        throw new Error(data?.message || "Invalid chat response");
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "I'm having trouble connecting to the concierge desk right now. Please try again shortly or visit our booking page directly.",
          items: [],
          actions: [{ label: "Book a Ritual", href: "/book" }],
          followUps: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const latestAiMessage = [...messages].reverse().find((m) => m.role === "ai");

  return (
    <>
      {!isOpen && !isCartOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Avenue Concierge Chatbot"
          className="group fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-gradient-to-br from-[#DCA659] via-[#C9944A] to-[#9A6B3F] text-[#0A0B09] flex items-center justify-center shadow-[0_10px_35px_rgba(201,148,74,0.45)] hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <Bot
            size={25}
            strokeWidth={2.1}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <span
            title="Concierge Online"
            className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#0A0B09]"
          />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-[100] w-[400px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-3rem)] bg-[#0A0B09] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* HEADER */}
            <div className="relative p-5 border-b border-white/10 bg-gradient-to-b from-[#131410] to-[#0F100D]">
              <div className="absolute top-5 right-5 flex items-center gap-2">
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    title="New conversation"
                    aria-label="Reset chat"
                    className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/55 hover:text-[#C9944A] hover:border-[#C9944A]/50 transition-colors"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close concierge"
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex items-center gap-3.5 pr-20">
                <div className="relative w-11 h-11 rounded-2xl bg-[#C9944A]/15 border border-[#C9944A]/40 flex items-center justify-center text-[#C9944A] shrink-0">
                  <Bot size={22} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0F100D]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#C9944A]" />
                    <span className="text-[10px] tracking-[0.22em] uppercase text-[#C9944A] font-bold">
                      Avenue Concierge
                    </span>
                  </div>
                  <h2 className="font-serif text-xl text-white leading-snug mt-0.5">
                    Wellness &amp; Rituals Assistant
                  </h2>
                </div>
              </div>
            </div>

            {/* CHAT MESSAGES */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar flex flex-col">
              {messages.map((msg, i) => {
                const isAi = msg.role === "ai";
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${
                      isAi ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isAi && (
                      <div className="w-7 h-7 rounded-full bg-[#C9944A]/15 border border-[#C9944A]/35 text-[#C9944A] flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={14} />
                      </div>
                    )}

                    <div
                      className={`flex flex-col ${
                        isAi ? "max-w-[85%] items-start" : "max-w-[82%] items-end"
                      }`}
                    >
                      <div
                        className={`p-3.5 text-sm leading-relaxed whitespace-pre-line ${
                          isAi
                            ? "bg-white/[0.04] text-white/90 rounded-2xl rounded-tl-xs border border-white/10 w-full"
                            : "bg-[#C9944A] text-[#0A0B09] rounded-2xl rounded-tr-xs font-medium"
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* STRUCTURED LIST CARDS FOR SERVICES / PLANS / COUPONS / CONTACT */}
                        {isAi && msg.items?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                            {msg.items.map((item, idx) => {
                              const rowContent = (
                                <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#080906]/80 border border-white/10 hover:border-[#C9944A]/45 transition-colors">
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-white truncate">
                                      {item.title}
                                    </div>
                                    {item.meta && (
                                      <div className="text-[11px] text-[#C9944A] font-mono mt-0.5">
                                        {item.meta}
                                      </div>
                                    )}
                                  </div>
                                  {item.href && (
                                    <ChevronRight
                                      size={14}
                                      className="text-white/45 shrink-0"
                                    />
                                  )}
                                </div>
                              );

                              return item.href ? (
                                <Link
                                  key={`${item.title}-${idx}`}
                                  href={item.href}
                                  onClick={() => setIsOpen(false)}
                                  className="block"
                                >
                                  {rowContent}
                                </Link>
                              ) : (
                                <div key={`${item.title}-${idx}`}>{rowContent}</div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {isAi && msg.actions?.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {msg.actions.map((act, idx) => (
                            <Link
                              key={`${act.href}-${idx}`}
                              href={act.href}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#C9944A] text-[#0A0B09] text-[10px] uppercase tracking-wider font-bold hover:bg-[#E3D9C9] transition-colors"
                            >
                              {getActionIcon(act.href)}
                              {act.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isAi && (
                      <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 text-white/80 flex items-center justify-center shrink-0 mt-0.5">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-[#C9944A]/15 border border-[#C9944A]/35 text-[#C9944A] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-xs border border-white/10 flex items-center gap-2 text-xs text-white/55">
                    <Loader2 size={14} className="animate-spin text-[#C9944A]" />
                    <span>Concierge is typing...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* FOLLOW-UP CHIPS & INPUT */}
            <div className="p-4 sm:p-5 bg-[#0F100D] border-t border-white/10">
              {!isLoading && latestAiMessage?.followUps?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {latestAiMessage.followUps.map((chip) => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => handleSend(chip)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/15 text-white/70 text-[10px] tracking-wide hover:border-[#C9944A] hover:text-[#C9944A] transition-colors"
                    >
                      <Sparkles size={10} className="text-[#C9944A]" />
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about services, contact, credits..."
                  className="w-full bg-white/[0.03] border border-white/15 rounded-xl text-white text-sm py-3 pl-4 pr-12 outline-none focus:border-[#C9944A] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="absolute right-1.5 w-9 h-9 rounded-lg bg-[#C9944A] text-[#0A0B09] flex items-center justify-center hover:bg-[#E3D9C9] transition-colors disabled:opacity-35 disabled:bg-[#C9944A]/20 disabled:text-[#C9944A]"
                >
                  <SendHorizontal size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AiChatbot() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <AiChatbotWidget />;
}