import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    
    // What did they buy?
    itemType: { 
      type: String, 
      enum: ["Membership", "Package", "Single Service"], 
      required: true 
    },
    itemName: { type: String, required: true }, 
    
    // --- PRICING & COUPON DETAILS ---
    originalAmount: { type: Number, required: true }, 
    discountAmount: { type: Number, default: 0 },     
    couponCode: { type: String, default: null },      
    amount: { type: Number, required: true },         // Final amount paid
    
    // Payment Info
    paymentStatus: { 
      type: String, 
      enum: ["Pending", "Paid", "Failed", "Refunded"], 
      default: "Pending" 
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    
    // If it's a membership, how long does it last?
    billingCycle: { type: String, enum: ["Monthly", "Yearly", "None"], default: "None" },
    nextRenewalDate: { type: Date },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;