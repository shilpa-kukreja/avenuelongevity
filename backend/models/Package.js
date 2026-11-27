import mongoose from "mongoose";

// --- PACKAGE MODEL ---
const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Ritual"
    sessions: { type: Number, required: true }, // e.g. 10
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    validity: { type: String, required: true }, // e.g. "6 months"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const Package = mongoose.model("Package", packageSchema);

// --- MEMBERSHIP MODEL ---
const membershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Signature"
    monthlyPrice: { type: Number, required: true },
    yearlyPrice: { type: Number, required: true },
    perks: [{ type: String }], // Array of strings
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const Membership = mongoose.model("Membership", membershipSchema);