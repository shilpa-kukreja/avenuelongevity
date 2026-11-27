"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Tag,
  X,
  CreditCard,
  Wallet,
  Building2,
  Loader2,
  Check,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import { useCart } from "../app/contexts/CartContext";
import { useAuth } from "../app/contexts/AuthContext";

const easeOut = [0.22, 1, 0.36, 1];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const paymentMethods = [
  { id: "card", label: "Card", icon: CreditCard, sub: "Visa, Master, Amex" },
  { id: "upi", label: "UPI", icon: Wallet, sub: "GPay, PhonePe" },
  { id: "netbanking", label: "Net Banking", icon: Building2, sub: "All major banks" },
];

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

export default function CheckoutClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart = [], cartTotal = 0, removeFromCart = () => {}, clearCart = () => {} } = useCart() || {};

  // ── Payment state ──
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ── Coupon state ──
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [promoInput, setPromoInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // ── Form state ──
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  /* ── Fetch active coupons ── */
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/coupons/active`);
        const rawCoupons = Array.isArray(data)
          ? data
          : data.coupons || data.data || [];
        setAvailableCoupons(rawCoupons);
      } catch (err) {
        console.error("Failed to load coupons", err);
        setAvailableCoupons([]);
      } finally {
        setIsLoadingCoupons(false);
      }
    };
    fetchCoupons();
  }, []);

  /* ── Calculations ── */
  const tax = Math.round(cartTotal * 0.18); // 18% GST

  let rawDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      rawDiscountAmount = Math.round(
        (cartTotal * Number(appliedCoupon.discountValue)) / 100
      );
    } else {
      rawDiscountAmount = Number(appliedCoupon.discountValue) || 0;
    }
  }
  // Cap at cart total — don't let discount exceed subtotal
  const discountAmount = Math.min(rawDiscountAmount, cartTotal);
  const finalTotal = Math.max(0, cartTotal + tax - discountAmount);

  /* ── Apply coupon via backend ── */
  const handleApplyPromo = async (codeToApply) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) return;

    setIsValidatingPromo(true);
    setPromoError("");

    try {
      const { data } = await axios.post(`${API_URL}/coupons/validate`, {
        code,
        cartTotal,
      });

      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        setPromoInput("");
      } else {
        throw new Error(data.message || "Invalid coupon");
      }
    } catch (err) {
      setPromoError(
        err.response?.data?.message || "Invalid or expired coupon"
      );
      setTimeout(() => setPromoError(""), 3000);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  /* ── Checkout ── */
  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to checkout");
      return router.push("/login");
    }
    if (cart.length === 0) return;

    setIsProcessing(true);

    try {
      // 1. Create Razorpay Order
      const { data: orderData } = await axios.post(
        `${API_URL}/transactions/order`,
        { amount: finalTotal },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("avenue_token")}`,
          },
        }
      );

      if (!orderData.success) throw new Error("Could not create order");

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Avenue Longevity Retreat",
        description: "Membership/Package Purchase",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment & Save to DB
            const { data: verifyData } = await axios.post(
              `${API_URL}/transactions/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cartItems: cart,
                couponCode: appliedCoupon?.code || null,
                discountAmount,
                tax,
                totalAmount: finalTotal,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "avenue_token"
                  )}`,
                },
              }
            );

            if (verifyData.success) {
              setIsSuccess(true);
              clearCart();
            }
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: "#C9944A" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment failed. Please try again.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
      setIsProcessing(false);
    }
  };

  /* ═══════════ EMPTY STATE ═══════════ */
  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-[#080906] flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-white/20" />
        </div>
        <h1 className="font-serif text-3xl text-white mb-4">
          Your cart is empty
        </h1>
        <p className="text-white/40 text-sm mb-8 text-center max-w-sm">
          Looks like you haven't added any packages or memberships to your
          collection yet.
        </p>
        <Link
          href="/packages"
          className="px-8 py-4 bg-[#C9944A] text-[#080906] rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors"
        >
          Explore Packages
        </Link>
      </div>
    );
  }

  return (
    <section className="relative w-full min-h-screen bg-[#080906] pt-32 pb-24 overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C9944A]/5 blur-[150px] rounded-full pointer-events-none" />

      {/* ═══════════ SUCCESS OVERLAY ═══════════ */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[#080906]/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="relative text-center max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-[#C9944A]/10 border border-[#C9944A]/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(201,148,74,0.3)]"
              >
                <Check size={40} className="text-[#C9944A]" strokeWidth={3} />
              </motion.div>
              <h2 className="font-serif text-4xl text-white mb-4">
                Welcome to the Inner Circle.
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                Your order has been confirmed. Check your email for your
                receipt and updated account details.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C9944A] text-[#080906] rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors w-full"
              >
                Go to Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative z-10">
        <div className="mb-12 md:mb-20">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Packages
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-5xl text-white font-light">
            Secure Checkout.
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* ═══════════ LEFT: ORDER SUMMARY ═══════════ */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-32">
              <div className="bg-[#121310] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9944A] to-transparent" />

                <h2 className="font-serif text-2xl text-white mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-4 bg-white/[0.02] border border-white/5 rounded-xl group"
                    >
                      <div>
                        <p className="text-white text-sm font-medium mb-1">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">
                          {item.type === "membership"
                            ? `${item.billing} Membership`
                            : `${item.sessions} Sessions`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-white font-serif text-lg">
                          ${item.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.type, item.billing)
                          }
                          className="text-[9px] text-red-400/50 hover:text-red-400 uppercase tracking-widest mt-2 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ═══════════ COUPON SECTION ═══════════ */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                      Promo Code
                    </label>
                    {appliedCoupon && (
                      <span className="text-[9px] uppercase tracking-widest text-green-400 flex items-center gap-1">
                        <Check size={10} /> Applied
                      </span>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-green-500/30 bg-green-500/5">
                      <div className="flex items-center gap-3">
                        <Tag size={14} className="text-green-400" />
                        <div>
                          <span className="text-white text-sm font-mono">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-green-400 text-xs ml-2">
                            −
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discountValue}%`
                              : formatCurrency(appliedCoupon.discountValue)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-white/40 hover:text-white transition-colors"
                        aria-label="Remove coupon"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) =>
                            setPromoInput(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleApplyPromo()
                          }
                          placeholder="Enter code"
                          className={`flex-1 bg-transparent border rounded-lg px-4 py-3 text-white text-xs placeholder-white/25 outline-none transition-colors ${
                            promoError
                              ? "border-red-500/50"
                              : "border-white/10 focus:border-[#C9944A]"
                          }`}
                        />
                        <button
                          onClick={() => handleApplyPromo()}
                          disabled={isValidatingPromo}
                          className="px-5 bg-white/5 hover:bg-[#C9944A] hover:text-[#080906] text-white text-[10px] uppercase tracking-widest font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center min-w-[70px]"
                        >
                          {isValidatingPromo ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>

                      {promoError && (
                        <p className="text-red-400 text-[10px] mt-2">
                          {promoError}
                        </p>
                      )}

                      {/* Available coupons */}
                      {!isLoadingCoupons && availableCoupons.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[9px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
                            <Ticket size={10} /> Available Offers
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {availableCoupons.map((coupon) => (
                              <button
                                key={coupon._id || coupon.code}
                                type="button"
                                onClick={() => handleApplyPromo(coupon.code)}
                                disabled={isValidatingPromo}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[#C9944A]/10 border border-[#C9944A]/30 rounded-lg text-[10px] text-[#C9944A] hover:bg-[#C9944A] hover:text-[#080906] transition-colors group disabled:opacity-50 disabled:cursor-wait"
                              >
                                <span className="font-mono font-bold">
                                  {coupon.code}
                                </span>
                                <span className="opacity-70 group-hover:opacity-100">
                                  {coupon.discountType === "percentage"
                                    ? `${coupon.discountValue}% off`
                                    : `${formatCurrency(
                                        coupon.discountValue
                                      )} off`}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm text-white/50">
                    <span>Subtotal</span>
                    <span>${cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-white/50">
                    <span>Taxes (18% GST)</span>
                    <span>${tax.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span className="flex items-center gap-1.5">
                        <Tag size={11} /> Discount
                      </span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-4">
                    <span className="text-white text-base">Total</span>
                    <span className="text-white font-serif text-4xl">
                      ${finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-white/30">
                  <ShieldCheck size={12} className="text-[#C9944A]" /> Secure
                  256-bit SSL Encryption
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════ RIGHT: BILLING & PAYMENT ═══════════ */}
          <div className="lg:col-span-7">
            <div className="bg-[#0A0B09] border border-white/5 rounded-3xl p-8 md:p-12">
              <h2 className="font-serif text-2xl text-white mb-8 border-b border-white/10 pb-4">
                Billing Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-white/20 py-3 text-white outline-none focus:border-[#C9944A] transition-colors"
                  />
                  <label className="absolute left-0 top-3 text-white/40 text-sm transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-valid:-top-4 peer-valid:text-[10px] uppercase tracking-widest cursor-text">
                    Full Name
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-white/20 py-3 text-white outline-none focus:border-[#C9944A] transition-colors"
                  />
                  <label className="absolute left-0 top-3 text-white/40 text-sm transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-valid:-top-4 peer-valid:text-[10px] uppercase tracking-widest cursor-text">
                    Email Address
                  </label>
                </div>
                <div className="relative md:col-span-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-transparent border-b border-white/20 py-3 text-white outline-none focus:border-[#C9944A] transition-colors"
                  />
                  <label className="absolute left-0 top-3 text-white/40 text-sm transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-valid:-top-4 peer-valid:text-[10px] uppercase tracking-widest cursor-text">
                    Phone Number
                  </label>
                </div>
              </div>

              <h2 className="font-serif text-2xl text-white mb-6 border-b border-white/10 pb-4">
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  const active = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`relative p-5 rounded-2xl border text-left transition-all duration-300 ${
                        active
                          ? "bg-[#C9944A]/10 border-[#C9944A]"
                          : "bg-[#121310] border-white/10 hover:border-white/30"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`mb-4 ${
                          active ? "text-[#C9944A]" : "text-white/40"
                        }`}
                      />
                      <p
                        className={`text-sm font-semibold mb-1 ${
                          active ? "text-white" : "text-white/60"
                        }`}
                      >
                        {pm.label}
                      </p>
                      <p className="text-[9px] uppercase tracking-widest text-white/30">
                        {pm.sub}
                      </p>
                      {active && (
                        <div className="absolute top-4 right-4 w-4 h-4 bg-[#C9944A] rounded-full flex items-center justify-center">
                          <Check
                            size={10}
                            className="text-[#080906]"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-3 bg-[#C9944A] text-[#080906] py-5 rounded-full text-[11px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-all duration-300 shadow-[0_0_40px_rgba(201,148,74,0.2)] disabled:opacity-70 disabled:cursor-wait"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Pay ${finalTotal.toLocaleString()} <ShieldCheck size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-[9px] text-white/30 uppercase tracking-widest mt-6">
                By completing this purchase you agree to our{" "}
                <a
                  href="/terms"
                  className="text-white hover:text-[#C9944A] underline"
                >
                  Terms
                </a>{" "}
                &{" "}
                <a
                  href="/cancellation"
                  className="text-white hover:text-[#C9944A] underline"
                >
                  Cancellation Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}