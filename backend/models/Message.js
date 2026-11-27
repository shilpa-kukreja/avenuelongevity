import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }, // Optional
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["Unread", "Replied", "Resolved"], 
      default: "Unread" 
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;