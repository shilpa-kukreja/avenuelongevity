"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Ticket, Check, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function CouponBox({ subtotal = 0, appliedCoupon, onApplyCoupon }) {
  const [code, setCode] = useState("");
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadActive = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/coupons/active`);
        if (data?.success) {
          setActiveCoupons(data.coupons || []);
        }
      } catch {
        // Ignore if none available
      }
    };
    loadActive();
  }, []);

  const applyCode = async (targetCode) => {
    const clean = (targetCode ?? code).trim().toUpperCase();
    if (!clean) return;

    setErrorMsg("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/coupons/validate`, {
        code: clean,
        subtotal,
      });
      if (data?.success && data?.coupon) {
        setCode(data.coupon.code);
        onApplyCoupon?.(data.coupon);
      } else {
        setErrorMsg(data?.message || "Invalid coupon.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Could not apply coupon.");
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setCode("");
    setErrorMsg("");
    onApplyCoupon?.(null);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C9944A] font-semibold">
        <Ticket size={14} />
        <span>Promo &amp; Coupon Code</span>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <Check size={14} />
            <span>
              <strong>{appliedCoupon.code}</strong> applied (−${appliedCoupon.discountAmount})
            </span>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="text-white/60 hover:text-white"
            title="Remove coupon"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 bg-transparent border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white uppercase outline-none focus:border-[#C9944A]"
          />
          <button
            type="button"
            disabled={loading || !code.trim()}
            onClick={() => applyCode()}
            className="px-4 py-2 rounded-xl bg-[#C9944A] text-[#0A0B09] text-xs font-bold uppercase tracking-wider hover:bg-[#E3D9C9] transition-colors disabled:opacity-40"
          >
            {loading ? "..." : "Apply"}
          </button>
        </div>
      )}

      {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

      {!appliedCoupon && activeCoupons.length > 0 && (
        <div className="pt-1">
          <p className="text-[11px] text-white/45 mb-1.5">Available offers:</p>
          <div className="flex flex-wrap gap-1.5">
            {activeCoupons.map((c) => (
              <button
                type="button"
                key={c._id}
                onClick={() => applyCode(c.code)}
                className="px-2.5 py-1 rounded-lg border border-white/15 text-[11px] text-white/75 hover:border-[#C9944A] hover:text-[#C9944A] transition-colors"
              >
                <span className="font-mono font-semibold text-[#C9944A]">{c.code}</span>{" "}
                ({c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}