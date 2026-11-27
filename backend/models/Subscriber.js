import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Subscribed", "Unsubscribed"], default: "Subscribed" },
  },
  { timestamps: true }
);
export const Subscriber = mongoose.model("Subscriber", subscriberSchema);