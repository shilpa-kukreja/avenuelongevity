"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../app/contexts/CartContext";

const easeOut = [0.22, 1, 0.36, 1];

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeFromCart, updateQty, cartTotal } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[100] bg-[#080906]/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="fixed top-0 right-0 bottom-0 z-[110] w-full max-w-md bg-[#0F100D] border-l border-white/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#C9944A]" />
                <div>
                  <h2 className="font-serif text-2xl text-white font-light leading-tight">
                    Your Cart
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    {cart.length} {cart.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-10 h-10 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6">
                    <ShoppingBag size={28} className="text-white/30" />
                  </div>
                  <h3 className="font-serif text-xl text-white/60 font-light mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-white/35 text-sm max-w-xs mb-6">
                    Browse our packages and memberships to find the perfect ritual.
                  </p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-3 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-[0.25em] font-bold"
                  >
                    Start browsing
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {cart.map((item) => (
                      <motion.div
                        key={`${item.type}-${item.id}-${item.billing || ""}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]"
                      >
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#C9944A]/20 to-[#C9944A]/5 border border-[#C9944A]/30 flex items-center justify-center shrink-0">
                          <span className="font-serif text-lg text-[#C9944A] font-light">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <h4 className="text-white text-sm font-light truncate">
                                {item.name}
                              </h4>
                              <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mt-0.5">
                                {item.type === "package"
                                  ? "Package"
                                  : `${item.billing} membership`}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                removeFromCart(item.id, item.type, item.billing)
                              }
                              className="text-white/30 hover:text-red-400 transition-colors shrink-0"
                              aria-label="Remove"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 bg-[#080906] rounded-full border border-white/10 p-0.5">
                              <button
                                onClick={() =>
                                  updateQty(item.id, item.type, item.billing, -1)
                                }
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="text-white text-xs font-mono w-6 text-center tabular-nums">
                                {item.qty}
                              </span>
                              <button
                                onClick={() =>
                                  updateQty(item.id, item.type, item.billing, 1)
                                }
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                            <span className="text-white font-serif text-lg">
                              ${(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/50">
                    <span>Subtotal</span>
                    <span>${cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/50">
                    <span>Taxes</span>
                    <span className="text-white/30">Included</span>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-white/10">
                    <span className="text-white/60 text-sm">Total</span>
                    <span className="text-white font-serif text-3xl">
                      ${cartTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="group relative w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#C9944A] text-[#080906] text-[11px] uppercase tracking-[0.3em] font-bold overflow-hidden  transition-shadow duration-500"
                >
                  <span className="absolute inset-0 bg-[#E3D9C9] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative z-10 flex items-center gap-2">
                    Proceed to Checkout
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </Link>
                <p className="text-center text-[10px] text-white/30 uppercase tracking-[0.25em]">
                  Secure checkout · Cancel anytime
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}