
import Coupon from "../models/Coupon.js";

const computeDiscount = (coupon, subtotal) => {
  const amount = Number(subtotal) || 0;
  if (coupon.discountType === "percentage") {
    const raw = (amount * coupon.discountValue) / 100;
    return Number(Math.min(amount, raw).toFixed(2));
  }
  return Number(Math.min(amount, coupon.discountValue).toFixed(2));
};

// Public / Guest / User: List currently valid, active, non-expired coupons
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: now },
    })
      .select("code discountType discountValue minPurchaseAmount expiryDate usageLimit usedCount")
      .sort({ createdAt: -1 })
      .lean();

    const available = coupons.filter(
      (c) => c.usageLimit === null || c.usedCount < c.usageLimit
    );

    return res.status(200).json({ success: true, coupons: available });
  } catch (error) {
    console.error("getActiveCoupons error:", error);
    return res.status(500).json({ success: false, message: "Failed to load coupons." });
  }
};

// Public / Checkout: Validate & calculate discount for a code
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false, message: "Coupon code is required." });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon code." });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: "This coupon has expired." });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "This coupon usage limit has been reached." });
    }

    const amount = Number(subtotal) || 0;
    if (amount < (coupon.minPurchaseAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of $${coupon.minPurchaseAmount} required for ${coupon.code}.`,
      });
    }

    const discountAmount = computeDiscount(coupon, amount);
    const finalAmount = Number(Math.max(0, amount - discountAmount).toFixed(2));

    return res.status(200).json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount,
        discountAmount,
        finalAmount,
      },
    });
  } catch (error) {
    console.error("validateCoupon error:", error);
    return res.status(500).json({ success: false, message: "Error validating coupon." });
  }
};

// Optional helper when order/booking is confirmed
export const redeemCoupon = async (code) => {
  if (!code) return;
  await Coupon.findOneAndUpdate(
    { code: String(code).trim().toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
};

// Admin: Get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error("getAllCoupons error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch coupons." });
  }
};

// Admin: Create coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchaseAmount = 0,
      expiryDate,
      isActive = true,
      usageLimit = null,
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Code, discountType, discountValue, and expiryDate are required.",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const exists = await Coupon.findOne({ code: cleanCode });
    if (exists) {
      return res.status(409).json({ success: false, message: `Coupon ${cleanCode} already exists.` });
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      minPurchaseAmount: Number(minPurchaseAmount) || 0,
      expiryDate: new Date(expiryDate),
      isActive: Boolean(isActive),
      usageLimit: usageLimit === "" || usageLimit === null ? null : Number(usageLimit),
    });

    return res.status(201).json({ success: true, coupon });
  } catch (error) {
    console.error("createCoupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to create coupon." });
  }
};

// Admin: Update coupon (toggle active, edit values/expiry)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.code) updates.code = String(updates.code).trim().toUpperCase();
    if (updates.usageLimit === "") updates.usageLimit = null;

    const coupon = await Coupon.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    console.error("updateCoupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to update coupon." });
  }
};

// Admin: Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }
    return res.status(200).json({ success: true, message: "Coupon deleted." });
  } catch (error) {
    console.error("deleteCoupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete coupon." });
  }
};


