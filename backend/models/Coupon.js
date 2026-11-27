import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { 
      type: String, 
      enum: ["percentage", "fixed"], 
      required: true 
    },
    discountValue: { type: Number, required: true }, // e.g., 20 for 20% or 500 for ₹500
    minPurchaseAmount: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: null }, // null means unlimited
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;