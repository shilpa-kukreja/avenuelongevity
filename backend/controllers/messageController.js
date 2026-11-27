import Message from "../models/Message.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Create a new contact message
// @route   POST /api/messages
// @access  Public
export const createMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }

    // 1. Save to Database
    const newMessage = await Message.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    // 2. Send Email to Admin
    try {
      await sendEmail({
        email: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL, // Send to admin
        type: "contact_admin",
        message: newMessage,
      });
    } catch (err) {
      console.error("Admin email failed", err);
    }

    // 3. Send Email to User
    try {
      await sendEmail({
        email: newMessage.email,
        type: "contact_user",
        message: newMessage,
      });
    } catch (err) {
      console.error("User email failed", err);
    }

    res.status(201).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all messages (Admin)
// @route   GET /api/messages
// @access  Private/Admin
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update message status (Admin)
// @route   PUT /api/messages/:id
// @access  Private/Admin
export const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    message.status = status;
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};