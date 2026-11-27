"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Check,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  User,
  Minus,
  Plus,
  CreditCard,
  Tag,
  CheckCircle2,
  Copy,
  Loader2,
  X,
  Wallet,
  Building2,
  CalendarCheck,
  Home,
  AlertCircle,
  PartyPopper,
  Zap,
  Ticket,
} from "lucide-react";
import { useAuth } from "../app/contexts/AuthContext";

const easeOut = [0.22, 1, 0.36, 1];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const formatUSD = (value) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

const timeSlots = [
  { time: "09:00 AM", status: "available" },
  { time: "10:30 AM", status: "available" },
  { time: "12:00 PM", status: "limited" },
  { time: "01:30 PM", status: "limited" },
  { time: "03:00 PM", status: "available" },
  { time: "04:30 PM", status: "limited" },
  { time: "06:00 PM", status: "available" },
  { time: "07:30 PM", status: "available" },
];

const paymentMethods = [
  { id: "card", label: "Card", icon: CreditCard, sub: "Visa, Mastercard, Amex" },
  { id: "upi", label: "UPI", icon: Wallet, sub: "GPay, PhonePe, Paytm" },
  { id: "netbanking", label: "Net Banking", icon: Building2, sub: "All major banks" },
];

const generateDates = () => {
  const out = [];
  const today = new Date();
  for (let i = 0; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isToday = i === 0;
    out.push({
      id: d.toISOString().split("T")[0],
      day: isToday
        ? "Today"
        : d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      full: isToday
        ? "Today"
        : d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
      isToday,
      isTomorrow: i === 1,
    });
  }
  return out;
};

export default function BookingWizardWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080906] flex items-center justify-center text-white font-serif">
          Loading...
        </div>
      }
    >
      <BookingWizard />
    </Suspense>
  );
}

function BookingWizard() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");
  const dateParam = searchParams.get("date");
  const { user } = useAuth();
  const router = useRouter();

  // ── DB State ──
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // ── Wizard State ──
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [guests, setGuests] = useState(1);

  // ── Form State ──
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // ── Coupon State ──
  const [promoInput, setPromoInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [useCredits, setUseCredits] = useState(false);

  // ── Submission State ──
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const [toasts, setToasts] = useState([]);
  const dates = useMemo(() => generateDates(), []);

  /* ── Fill user info ── */
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ── Turn off credits if not enough ── */
  useEffect(() => {
    if ((user?.credits ?? 0) < guests && useCredits) {
      setUseCredits(false);
    }
  }, [user, guests, useCredits]);

  /* ── 1. Fetch services + active coupons ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcRes, cpnRes] = await Promise.allSettled([
          axios.get(`${API_URL}/services`),
          axios.get(`${API_URL}/coupons/active`),
        ]);

        // Services
        if (svcRes.status === "fulfilled") {
          const rawServices = Array.isArray(svcRes.value.data)
            ? svcRes.value.data
            : svcRes.value.data.services ||
              svcRes.value.data.data ||
              [];

          const formattedServices = rawServices.map((s, i) => ({
            id: s._id,
            title: s.title,
            category: s.category,
            duration: s.duration,
            price: s.price,
            image: s.heroImage?.startsWith("http")
              ? s.heroImage
              : `${API_ORIGIN}${s.heroImage}`,
            popular: i < 2,
          }));

          setServices(formattedServices);
        } else {
          console.error("Failed to load services", svcRes.reason);
          pushToast("Could not connect to backend services", "error");
        }

        // Coupons — don't fail whole flow if this errors
        if (cpnRes.status === "fulfilled") {
          const rawCoupons = Array.isArray(cpnRes.value.data)
            ? cpnRes.value.data
            : cpnRes.value.data.coupons ||
              cpnRes.value.data.data ||
              [];
          setAvailableCoupons(rawCoupons);
        } else {
          console.error("Failed to load coupons", cpnRes.reason);
          setAvailableCoupons([]);
        }
      } catch (err) {
        console.error("Unexpected error loading data", err);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── 2. Handle URL params (service + date) ── */
  useEffect(() => {
    let shouldMoveToStep2 = false;

    if (serviceParam && services.length > 0) {
      const matched = services.find((s) =>
        s.title.toLowerCase().includes(serviceParam.toLowerCase())
      );
      if (matched && selectedService?.id !== matched.id) {
        setSelectedService(matched);
        shouldMoveToStep2 = true;
      }
    }

    if (dateParam) {
      const matchedDate = dates.find((d) => d.id === dateParam);
      if (matchedDate && selectedDate?.id !== matchedDate.id) {
        setSelectedDate(matchedDate);
        setSelectedTime(null);
        shouldMoveToStep2 = true;
      }
    }

    if (shouldMoveToStep2) {
      setStep((prev) => (prev === 1 ? 2 : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceParam, dateParam, services, dates]);

  /* ── Scroll to top on step change (mobile) ── */
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  /* ── Calculations ── */
  const subtotal = selectedService
    ? Number(selectedService.price || 0) * guests
    : 0;

  let discountAmount = 0;
  if (useCredits) {
    discountAmount = subtotal;
  } else if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = Math.round(
        (subtotal * Number(appliedCoupon.discountValue)) / 100
      );
    } else {
      discountAmount = Number(appliedCoupon.discountValue) || 0;
    }
  }

  const total = useCredits ? 0 : Math.max(0, subtotal - discountAmount);

  /* ── Helpers ── */
  const isSlotInPast = (slotTime, date) => {
    if (!date?.isToday) return false;
    const now = new Date();
    const [time, period] = slotTime.split(" ");
    const [h, m] = time.split(":").map(Number);
    let hour = h;
    if (period === "PM" && h !== 12) hour += 12;
    if (period === "AM" && h === 12) hour = 0;
    const slotMinutes = hour * 60 + m;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slotMinutes <= nowMinutes + 30;
  };

  const pushToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const dismissToast = (id) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  /* ── Validate coupon with backend ── */
  const applyPromo = async (codeToApply) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) return;

    setIsValidatingPromo(true);
    setPromoError("");

    try {
      const { data } = await axios.post(`${API_URL}/coupons/validate`, {
        code,
        cartTotal: subtotal,
      });

      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        setPromoInput("");
        pushToast(`Coupon "${code}" applied!`);
      } else {
        throw new Error(data.message || "Invalid coupon");
      }
    } catch (error) {
      setPromoError(
        error.response?.data?.message || "Invalid or expired coupon"
      );
      setTimeout(() => setPromoError(""), 3000);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  /* ── Credit booking ── */
  const handleCreditBooking = async () => {
    if (!user) return router.push("/login");
    if (!name || !email || !phone || !agreed) {
      pushToast("Please fill all details and agree to terms", "error");
      return;
    }

    setSubmitting(true);
    try {
      const bookingDetails = {
        name,
        email,
        phone,
        serviceId: selectedService.id,
        serviceName: selectedService.title,
        date: `${selectedDate.day}, ${selectedDate.month} ${selectedDate.date}`,
        time: selectedTime,
        guests,
        originalAmount: subtotal,
        discountAmount: subtotal,
        totalAmount: 0,
        paymentMethod: "credits",
      };

      const { data } = await axios.post(
        `${API_URL}/bookings/credits`,
        { bookingDetails, guests },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("avenue_token")}`,
          },
        }
      );

      if (data.success) {
        setBookingRef(data.booking._id.slice(-6).toUpperCase());
        setSuccess(true);
      }
    } catch (error) {
      pushToast(
        error.response?.data?.message || "Failed to book with credits",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Razorpay booking ── */
 const handleSubmit = async () => {
    if (!user) {
      pushToast("Please login to complete your booking", "error");
      return router.push("/login");
    }
    if (!name || !email || !phone || !agreed) {
      pushToast("Please fill all details and agree to terms", "error");
      return;
    }
    if (typeof window === "undefined" || !window.Razorpay) {
      pushToast("Payment gateway is still loading. Please try again.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("avenue_token") : null;

      const { data: orderData } = await axios.post(
        `${API_URL}/bookings/order`,
        { amount: total },
        {
          timeout: 10000,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!orderData?.success || !orderData?.order?.id) {
        throw new Error(orderData?.message || "Could not create payment order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "Avenue Longevity Retreat",
        description: `Booking for ${selectedService.title}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            const bookingDetails = {
              name,
              email,
              phone,
              serviceId: selectedService.id,
              serviceName: selectedService.title,
              date: `${selectedDate.day}, ${selectedDate.month} ${selectedDate.date}`,
              time: selectedTime,
              guests,
              originalAmount: subtotal,
              discountAmount,
              couponCode: appliedCoupon?.code || null,
              totalAmount: total,
            };

            const { data: verifyData } = await axios.post(
              `${API_URL}/bookings/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingDetails,
              },
              {
                timeout: 10000,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              }
            );

            if (verifyData?.success && verifyData?.booking?._id) {
              setBookingRef(verifyData.booking._id.slice(-6).toUpperCase());
              setSuccess(true);
            } else {
              throw new Error(verifyData?.message || "Verification failed");
            }
          } catch (error) {
            pushToast(
              error.response?.data?.message ||
                "Payment verification failed. Please contact support.",
              "error"
            );
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            pushToast("Payment cancelled", "error");
          },
        },
        prefill: { name, email, contact: phone },
        theme: { color: "#C9944A" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        pushToast(
          resp?.error?.description || "Payment failed. Please try again.",
          "error"
        );
        setSubmitting(false);
      });
      rzp.open();
    } catch (error) {
      pushToast(
        error.response?.data?.message || error.message || "Could not start payment",
        "error"
      );
      setSubmitting(false);
    }
  };

  const canContinue = selectedDate && selectedTime;

  /* ── Loading state ── */
  if (isLoadingServices) {
    return (
      <div className="min-h-screen bg-[#080906] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#C9944A] animate-spin mb-4" />
        <p className="text-[#C9944A] font-serif tracking-widest uppercase">
          Loading Rituals...
        </p>
      </div>
    );
  }

  return (
    <section className="relative w-full min-h-screen bg-[#080906] flex flex-col lg:flex-row pt-28 md:pt-40 pb-24 lg:pb-0">
      {/* Background grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#C9944A]/5 blur-[160px] rounded-full pointer-events-none" />

      {/* ═══════ TOASTS ═══════ */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl backdrop-blur-xl border shadow-2xl ${
                t.type === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-200"
                  : "bg-[#C9944A]/10 border-[#C9944A]/40 text-[#E3D9C9]"
              }`}
            >
              {t.type === "error" ? (
                <AlertCircle size={16} />
              ) : (
                <CheckCircle2 size={16} className="text-[#C9944A]" />
              )}
              <span className="text-xs font-medium flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="opacity-60 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══════ SUCCESS OVERLAY ═══════ */}
      <AnimatePresence>
        {success && (
          <SuccessOverlay
            bookingRef={bookingRef}
            service={selectedService}
            date={selectedDate}
            time={selectedTime}
            guests={guests}
            total={total}
            onClose={() => router.push("/dashboard")}
          />
        )}
      </AnimatePresence>

      {/* ═══════ LEFT: VISUAL SUMMARY ═══════ */}
      <div className="hidden lg:block lg:w-[42%] relative border-r border-white/5 overflow-hidden z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedService ? selectedService.id : "default"}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: easeOut }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-55 mix-blend-luminosity"
              style={{
                backgroundImage: `url('${
                  selectedService
                    ? selectedService.image
                    : "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop"
                }')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080906] via-[#080906]/70 to-[#080906]/20" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 h-full flex flex-col justify-between p-12 xl:p-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={16} className="text-[#C9944A]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-bold">
                {success ? "Confirmed" : "Your Selection"}
              </span>
            </div>
            <h2 className="font-serif text-4xl xl:text-5xl text-white font-light mb-6 leading-[1.05] drop-shadow-lg">
              {selectedService ? selectedService.title : "Begin Your Ritual."}
            </h2>
            {!selectedService ? (
              <p className="text-[#E3D9C9]/70 text-sm leading-relaxed max-w-sm font-light">
                Select a ritual from the menu to begin curating your
                personalized longevity experience.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="px-3 py-1.5 rounded-full bg-[#C9944A]/15 border border-[#C9944A]/30 text-[10px] uppercase tracking-[0.2em] text-[#C9944A] font-semibold">
                  {selectedService.category}
                </span>
                <span className="flex items-center gap-1.5 text-white/60 text-[11px]">
                  <Clock size={12} /> {selectedService.duration}
                </span>
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedService && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0F100D]/85 backdrop-blur-2xl border border-white/10 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C9944A] via-[#E3D9C9]/60 to-transparent" />
                <div className="p-7">
                  <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/10">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                      Booking Summary
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9944A] font-semibold">
                      Step {step} / 3
                    </span>
                  </div>

                  <div className="space-y-3.5 mb-6">
                    <SummaryRow
                      icon={CalendarDays}
                      label="Date"
                      value={
                        selectedDate
                          ? `${selectedDate.day}, ${selectedDate.month} ${selectedDate.date}`
                          : "—"
                      }
                    />
                    <SummaryRow
                      icon={Clock}
                      label="Time"
                      value={selectedTime || "—"}
                    />
                    <SummaryRow
                      icon={User}
                      label="Guests"
                      value={`${guests} ${guests > 1 ? "People" : "Person"}`}
                    />

                    {useCredits && (
                      <SummaryRow
                        icon={Zap}
                        label="Credits"
                        value={`${guests} Credit${guests > 1 ? "s" : ""} applied`}
                        valueClass="text-[#C9944A]"
                      />
                    )}

                    {!useCredits && appliedCoupon && (
                      <SummaryRow
                        icon={Tag}
                        label="Coupon"
                        value={`${appliedCoupon.code} (−${formatUSD(
                          discountAmount
                        )})`}
                        valueClass="text-green-400"
                      />
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-5 space-y-2">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Subtotal</span>
                      <span>{formatUSD(subtotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-xs text-green-400">
                        <span>
                          {useCredits ? "Credit Coverage" : "Coupon Discount"}
                        </span>
                        <span>−{formatUSD(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-end pt-3 mt-3 border-t border-white/10">
                      <span className="text-white/60 text-sm">Total</span>
                      <span className="text-white font-serif text-3xl">
                        {formatUSD(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════ RIGHT: FORM ═══════ */}
      <div className="w-full lg:w-[58%] flex flex-col p-6 md:p-12 xl:p-16 relative z-10">
        {/* Progress */}
        <div className="flex items-center justify-between mb-12 md:mb-20">
          <div className="flex items-center gap-3 md:gap-4">
            {[1, 2, 3].map((num) => {
              const labels = ["Ritual", "Schedule", "Confirm"];
              return (
                <React.Fragment key={num}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-500 border ${
                        step > num
                          ? "bg-[#C9944A] text-[#080906] border-[#C9944A]"
                          : step === num
                          ? "bg-transparent text-[#C9944A] border-[#C9944A]"
                          : "bg-transparent text-white/40 border-white/20"
                      }`}
                    >
                      {step > num ? <Check size={16} /> : `0${num}`}
                    </div>
                    <span
                      className={`hidden md:inline text-[10px] uppercase tracking-[0.25em] transition-colors ${
                        step >= num ? "text-white" : "text-white/30"
                      }`}
                    >
                      {labels[num - 1]}
                    </span>
                  </div>
                  {num !== 3 && (
                    <div className="relative w-6 md:w-12 h-[1px] bg-white/10">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: step > num ? 1 : 0 }}
                        className="absolute inset-0 bg-[#C9944A] origin-left"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">
            {step.toString().padStart(2, "0")} / 03
          </span>
        </div>

        <div className="flex-grow relative">
          <AnimatePresence mode="wait">
            {/* ═══════ STEP 1: SELECT SERVICE ═══════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-serif text-4xl md:text-5xl text-white mb-3 leading-tight">
                  Select a Ritual
                </h3>
                <p className="text-white/40 text-sm mb-10 font-light">
                  Choose the experience you wish to book today.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((svc) => (
                    <button
                      type="button"
                      key={svc.id}
                      onClick={() => {
                        setSelectedService(svc);
                        setStep(2);
                      }}
                      className={`relative text-left p-5 md:p-6 border rounded-xl transition-all duration-300 group overflow-hidden ${
                        selectedService?.id === svc.id
                          ? "border-[#C9944A] bg-[#C9944A]/10"
                          : "border-white/10 hover:border-[#C9944A]/50 bg-[#121310]"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-25 transition-opacity duration-700"
                        style={{ backgroundImage: `url('${svc.image}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#121310]/95 via-[#121310]/80 to-transparent" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] uppercase tracking-[0.25em] text-[#C9944A] font-bold">
                            {svc.category}
                          </span>
                          <span className="text-white/80 font-serif text-lg">
                            {formatUSD(svc.price)}
                          </span>
                        </div>
                        <h4 className="text-white text-lg md:text-xl font-light mb-3 group-hover:text-[#E3D9C9] transition-colors">
                          {svc.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-widest">
                          <Clock size={11} /> {svc.duration}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════ STEP 2: DATE & TIME ═══════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-serif text-4xl md:text-5xl text-white mb-3 leading-tight">
                  Select Date &amp; Time
                </h3>
                <p className="text-white/40 text-sm mb-10 font-light">
                  Choose when you'd like to visit the retreat.
                </p>

                {/* Calendar */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-5 text-[#C9944A]">
                    <CalendarDays size={16} />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold">
                      Pick a day · {dates[0]?.month}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {dates.map((d) => {
                      const isSelected = selectedDate?.id === d.id;
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => {
                            setSelectedDate(d);
                            setSelectedTime(null);
                          }}
                          className={`relative flex flex-col items-center justify-center py-3 md:py-4 border rounded-xl transition-all duration-300 ${
                            isSelected
                              ? "bg-[#C9944A] text-[#080906] border-[#C9944A] shadow-[0_0_20px_rgba(201,148,74,0.4)] scale-[1.03]"
                              : "bg-[#121310] border-white/10 text-white hover:border-[#C9944A]/50 hover:bg-[#1A1C18]"
                          }`}
                        >
                          {d.isTomorrow && !isSelected && (
                            <span className="absolute -top-1.5 -right-1 text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#C9944A] text-[#080906] font-bold">
                              Next
                            </span>
                          )}
                          {d.isToday && !isSelected && (
                            <span className="absolute -top-1.5 -right-1 text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-500 text-[#080906] font-bold">
                              Now
                            </span>
                          )}
                          <span
                            className={`text-[9px] uppercase tracking-widest mb-1 ${
                              isSelected
                                ? "text-[#080906]/70 font-bold"
                                : "text-white/40"
                            }`}
                          >
                            {d.day}
                          </span>
                          <span className="font-serif text-lg md:text-xl">
                            {d.date}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots + guests */}
                <AnimatePresence>
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-8 border-b border-white/10">
                        <div className="flex items-center gap-2 text-[#C9944A]">
                          <User size={16} />
                          <span className="text-[10px] uppercase tracking-[0.25em] font-bold">
                            Number of Guests
                          </span>
                        </div>
                        <div className="flex items-center gap-5 bg-[#121310] border border-white/10 rounded-full px-3 py-1.5 w-fit">
                          <button
                            type="button"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            disabled={guests <= 1}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <div className="w-10 text-center">
                            <motion.span
                              key={guests}
                              initial={{ y: -8, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="block text-white font-serif text-xl"
                            >
                              {guests}
                            </motion.span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setGuests(Math.min(4, guests + 1))}
                            disabled={guests >= 4}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
                        <div className="flex items-center gap-2 text-[#C9944A]">
                          <Clock size={16} />
                          <span className="text-[10px] uppercase tracking-[0.25em] font-bold">
                            Available Times
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {timeSlots.map((slot) => {
                          const past = isSlotInPast(slot.time, selectedDate);
                          const isFull = slot.status === "full" || past;
                          const isLimited =
                            slot.status === "limited" && !isFull;
                          const isSelected = selectedTime === slot.time;

                          return (
                            <button
                              type="button"
                              key={slot.time}
                              disabled={isFull}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`relative py-3 px-2 text-xs tracking-wider border rounded-full transition-all duration-300 flex items-center justify-center gap-2 ${
                                isFull
                                  ? "bg-white/[0.02] border-white/5 text-white/25 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-[#C9944A] text-[#080906] border-[#C9944A] font-bold shadow-[0_0_15px_rgba(201,148,74,0.4)]"
                                  : isLimited
                                  ? "bg-amber-500/[0.06] border-amber-500/40 text-amber-100 hover:border-amber-500 hover:bg-amber-500/10"
                                  : "bg-transparent border-white/20 text-white hover:border-[#C9944A] hover:bg-[#C9944A]/5"
                              }`}
                            >
                              {isFull ? (
                                <>
                                  <span className="opacity-60">
                                    {slot.time}
                                  </span>
                                  <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-white/10 uppercase tracking-widest font-bold">
                                    {past ? "Past" : "Full"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  {!isSelected && (
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isLimited
                                          ? "bg-amber-400"
                                          : "bg-green-500"
                                      }`}
                                    />
                                  )}
                                  {slot.time}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-12 md:mt-16 flex justify-between items-center border-t border-white/10 pt-8">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="text-white/50 hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canContinue}
                    className={`flex items-center gap-3 px-8 md:px-10 py-3.5 md:py-4 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-300 ${
                      canContinue
                        ? "bg-[#C9944A] text-[#080906] hover:bg-[#E3D9C9] shadow-[0_0_30px_rgba(201,148,74,0.3)]"
                        : "bg-white/5 text-white/30 cursor-not-allowed"
                    }`}
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════ STEP 3: CONFIRM ═══════ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="font-serif text-4xl md:text-5xl text-white mb-3 leading-tight">
                  Confirm Details
                </h3>
                <p className="text-white/40 text-sm mb-8 font-light">
                  Review your booking and enter your details below.
                </p>

                {/* Form */}
                <div className="space-y-6 mb-10">
                  <FloatInput
                    id="name"
                    label="Full Name"
                    value={name}
                    onChange={setName}
                    type="text"
                  />
                  <FloatInput
                    id="email"
                    label="Email Address"
                    value={email}
                    onChange={setEmail}
                    type="email"
                  />
                  <FloatInput
                    id="phone"
                    label="Phone Number"
                    value={phone}
                    onChange={setPhone}
                    type="tel"
                  />
                </div>

                {/* ═══════ COUPON SECTION ═══════ */}
                {!useCredits && (
                  <div className="mb-8">
                    <label className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3 block">
                      Promo Code
                    </label>

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
                                : formatUSD(appliedCoupon.discountValue)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-white/40 hover:text-white"
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
                              e.key === "Enter" && applyPromo()
                            }
                            placeholder="Enter code manually"
                            className={`flex-1 bg-transparent border rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors ${
                              promoError
                                ? "border-red-500/50"
                                : "border-white/15 focus:border-[#C9944A]"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => applyPromo()}
                            disabled={isValidatingPromo}
                            className="px-5 py-3 rounded-xl bg-white/[0.05] border border-white/15 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#C9944A] hover:text-[#080906] hover:border-[#C9944A] transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center min-w-[80px]"
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
                        {availableCoupons.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[9px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
                              <Ticket size={10} /> Available Offers
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {availableCoupons.map((coupon) => (
                                <button
                                  key={coupon._id || coupon.code}
                                  type="button"
                                  onClick={() => applyPromo(coupon.code)}
                                  disabled={isValidatingPromo}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-[#C9944A]/10 border border-[#C9944A]/30 rounded-lg text-[10px] text-[#C9944A] hover:bg-[#C9944A] hover:text-[#080906] transition-colors group disabled:opacity-50 disabled:cursor-wait"
                                >
                                  <span className="font-mono font-bold">
                                    {coupon.code}
                                  </span>
                                  <span className="opacity-70 group-hover:opacity-100">
                                    {coupon.discountType === "percentage"
                                      ? `${coupon.discountValue}% off`
                                      : `${formatUSD(
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
                )}

                {/* ═══════ CREDIT OPTION ═══════ */}
                {(user?.credits ?? 0) >= guests && (
                  <div className="mb-8 p-6 rounded-2xl border border-[#C9944A]/30 bg-[#C9944A]/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#C9944A]/20 flex items-center justify-center">
                          <Zap className="text-[#C9944A]" size={20} />
                        </div>
                        <div>
                          <h3 className="text-white font-serif text-lg">
                            Use Credits
                          </h3>
                          <p className="text-[10px] uppercase tracking-widest text-[#C9944A]">
                            You have {user.credits} credits available
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseCredits(!useCredits)}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                          useCredits ? "bg-[#C9944A]" : "bg-white/10"
                        }`}
                      >
                        <motion.div
                          animate={{ x: useCredits ? 24 : 2 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full"
                        />
                      </button>
                    </div>
                    {useCredits && (
                      <p className="text-xs text-white/60 mt-3">
                        By using {guests} credit(s), your total due today is{" "}
                        <strong className="text-white">{formatUSD(0)}</strong>.
                      </p>
                    )}
                  </div>
                )}

                {/* ═══════ PAYMENT METHOD ═══════ */}
                {!useCredits && (
                  <div className="mb-8">
                    <label className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-3 block">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((pm) => {
                        const Icon = pm.icon;
                        const active = paymentMethod === pm.id;
                        return (
                          <button
                            type="button"
                            key={pm.id}
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`relative p-3 md:p-4 rounded-xl border text-center transition-all duration-300 ${
                              active
                                ? "bg-[#C9944A]/10 border-[#C9944A]"
                                : "bg-transparent border-white/15 hover:border-white/30"
                            }`}
                          >
                            <Icon
                              size={18}
                              className={`mx-auto mb-2 ${
                                active ? "text-[#C9944A]" : "text-white/50"
                              }`}
                            />
                            <div
                              className={`text-[11px] font-semibold ${
                                active ? "text-white" : "text-white/60"
                              }`}
                            >
                              {pm.label}
                            </div>
                            {active && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#C9944A] flex items-center justify-center"
                              >
                                <Check
                                  size={10}
                                  className="text-[#080906]"
                                  strokeWidth={3}
                                />
                              </motion.div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ═══════ TERMS ═══════ */}
                <label className="flex items-start gap-3 mb-8 cursor-pointer group">
                  <div
                    onClick={() => setAgreed(!agreed)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                      agreed
                        ? "bg-[#C9944A] border-[#C9944A]"
                        : "border-white/30 group-hover:border-white/50"
                    }`}
                  >
                    {agreed && (
                      <Check
                        size={12}
                        className="text-[#080906]"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                  <span className="text-[11px] text-white/50 leading-relaxed">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      className="text-[#C9944A] underline underline-offset-2 hover:text-[#E3D9C9]"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/cancellation"
                      className="text-[#C9944A] underline underline-offset-2 hover:text-[#E3D9C9]"
                    >
                      Cancellation Policy
                    </a>
                    .
                  </span>
                </label>

                {/* ═══════ SUBMIT ═══════ */}
                <div className="flex justify-between items-center border-t border-white/10 pt-8 mt-8">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="text-white/50 hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={useCredits ? handleCreditBooking : handleSubmit}
                    disabled={submitting}
                    className="flex items-center justify-center gap-3 bg-[#C9944A] text-[#080906] px-10 py-4 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-colors disabled:opacity-70 disabled:cursor-wait shadow-[0_0_40px_rgba(201,148,74,0.2)]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Processing…
                      </>
                    ) : useCredits ? (
                      <>
                        Confirm Booking (Free) <Check size={16} />
                      </>
                    ) : (
                      <>
                        Pay {formatUSD(total)} <ShieldCheck size={16} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════ */

function SummaryRow({ icon: Icon, label, value, valueClass = "text-white" }) {
  return (
    <div className="flex justify-between items-center text-sm font-light">
      <span className="text-white/50 flex items-center gap-2">
        <Icon size={14} /> {label}
      </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function FloatInput({ id, label, value, onChange, type = "text" }) {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full bg-transparent border-b border-white/20 py-4 text-white placeholder-transparent outline-none focus:border-[#C9944A] transition-colors"
      />
      <label
        htmlFor={id}
        className="absolute left-0 top-4 text-white/40 text-sm transition-all peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-[#C9944A] peer-valid:-top-2 peer-valid:text-[10px] cursor-text uppercase tracking-widest"
      >
        {label}
      </label>
    </div>
  );
}

function SuccessOverlay({ bookingRef, service, date, time, guests, total, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyDetails = () => {
    const text = `Booking: ${bookingRef}\n${service?.title}\n${date?.full} at ${time}\n${guests} guest${
      guests > 1 ? "s" : ""
    }\nTotal: ${formatUSD(total)}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 2,
        color: ["#C9944A", "#E3D9C9", "#F5F0E8"][Math.floor(Math.random() * 3)],
        size: 6 + Math.random() * 6,
      })),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#080906]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: "110vh", opacity: 0, rotate: 720 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "easeIn",
            }}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-[#121310] border border-[#C9944A]/30 rounded-3xl p-8 md:p-10 overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9944A] to-transparent" />

        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.6,
              type: "spring",
              bounce: 0.5,
            }}
            className="w-20 h-20 rounded-full bg-[#C9944A]/15 border-2 border-[#C9944A] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Check size={36} className="text-[#C9944A]" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <PartyPopper size={14} className="text-[#C9944A]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9944A] font-bold">
              Booking Confirmed
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-white font-light mb-3">
            Your ritual awaits.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
            We've sent the confirmation to your email.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#080906] border border-white/10 mb-6">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-1">
              Booking Reference
            </div>
            <div className="font-mono text-[#C9944A] text-lg tracking-wider">
              {bookingRef}
            </div>
          </div>
          <button
            type="button"
            onClick={copyDetails}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#C9944A] hover:text-[#080906] text-white/60 flex items-center justify-center transition-all"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={copyDetails}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-white text-[10px] uppercase tracking-widest font-semibold hover:border-[#C9944A] hover:text-[#C9944A] transition-all"
          >
            <CalendarCheck size={14} /> Add to Calendar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#C9944A] text-[#080906] text-[10px] uppercase tracking-widest font-bold hover:bg-[#E3D9C9] transition-all"
          >
            <Home size={14} /> Dashboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}