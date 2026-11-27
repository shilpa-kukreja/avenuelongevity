"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useCart } from "../app/contexts/CartContext";

const easeOut = [0.22, 1, 0.36, 1];

export default function CartToasts() {
  const { toasts, dismissToast } = useCart();
  const safeToasts = Array.isArray(toasts) ? toasts : [];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {safeToasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#121310] border border-[#C9944A]/40 shadow-2xl backdrop-blur-xl pointer-events-auto"
          >
            <CheckCircle2 size={16} className="text-[#C9944A] shrink-0" />
            <span className="text-white text-sm font-light whitespace-nowrap">
              {t.message}
            </span>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="text-white/40 hover:text-white ml-1"
              aria-label="Dismiss notification"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}