"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import CartDrawer from "@/components/CartDrawer";
import CartToasts from "@/components/CartToasts";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("avenue-cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (e) {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("avenue-cart", JSON.stringify(cart));
    } catch (e) {}
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, hydrated]);

  const pushToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const addToCart = useCallback(
    (item) => {
      setCart((prev) => {
        const existing = prev.find(
          (i) => i.id === item.id && i.type === item.type && i.billing === item.billing
        );
        if (existing) {
          return prev.map((i) =>
            i.id === item.id && i.type === item.type && i.billing === item.billing
              ? { ...i, qty: i.qty + 1 }
              : i
          );
        }
        return [...prev, { ...item, qty: 1 }];
      });
      pushToast(`${item.name} added to cart`);
    },
    [pushToast]
  );

  const removeFromCart = useCallback((id, type, billing) => {
    setCart((prev) =>
      prev.filter((i) => !(i.id === id && i.type === type && i.billing === billing))
    );
  }, []);

  const updateQty = useCallback((id, type, billing, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id && i.type === type && i.billing === billing
            ? { ...i, qty: Math.max(0, i.qty + delta) }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + (Number(i.qty) || 0), 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toasts,
      pushToast,
      dismissToast,
    }),
    [cart, cartCount, cartTotal, addToCart, removeFromCart, updateQty, clearCart, isOpen, toasts, pushToast, dismissToast]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {hydrated && <CartDrawer />}
      {hydrated && <CartToasts />}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}