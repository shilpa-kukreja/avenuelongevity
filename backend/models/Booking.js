import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    serviceName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, default: 1 },
    
    // --- PRICING & COUPON DETAILS ---
    originalAmount: { type: Number, required: true }, // e.g., 3000
    discountAmount: { type: Number, default: 0 },     // e.g., 600 (if 20% off)
    couponCode: { type: String, default: null },      // e.g., "VIP20"
    totalAmount: { type: Number, required: true },    // e.g., 2400 (Final amount paid)
    
    // Payment Details
    paymentStatus: { 
      type: String, 
      enum: ["Pending", "Paid", "Failed"], 
      default: "Pending" 
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    
    // Booking Status
    status: { 
      type: String, 
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"], 
      default: "Pending" 
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;