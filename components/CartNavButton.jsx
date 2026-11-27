"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../app/contexts/CartContext";

export default function CartNavButton({ className = "" }) {
  const { cartCount, openCart } = useCart();
  const [pulse, setPulse] = useState(false);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <button
      onClick={openCart}
      className={`relative group flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-white/15 hover:border-[#C9944A]/60 transition-colors duration-300 ${className}`}
      aria-label="Open cart"
    >
      <ShoppingBag
        size={16}
        className="text-white/70 group-hover:text-[#C9944A] transition-colors"
      />

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: pulse ? [1, 1.4, 1] : 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: pulse ? 0.4 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#C9944A] text-[#080906] text-[10px] font-bold flex items-center justify-center leading-none"
          >
            {cartCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}