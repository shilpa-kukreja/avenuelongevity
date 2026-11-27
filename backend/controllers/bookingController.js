import crypto from "crypto";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { razorpayInstance } from "../utils/razorpay.js";
import sendEmail from "../utils/sendEmail.js"; // Reuse the email utility

// @desc    Create Razorpay Order
// @route   POST /api/bookings/order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ success: false, message: "Error creating order" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get User Bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const verifyPaymentAndBook = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails } = req.body;

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 2. Create Booking
    const booking = await Booking.create({
      user: req.user._id,
      customerName: bookingDetails.name,
      customerEmail: bookingDetails.email,
      customerPhone: bookingDetails.phone,
      service: bookingDetails.serviceId,
      serviceName: bookingDetails.serviceName,
      date: bookingDetails.date,
      time: bookingDetails.time,
      guests: bookingDetails.guests,
      originalAmount: bookingDetails.originalAmount,
      discountAmount: bookingDetails.discountAmount,
      couponCode: bookingDetails.couponCode,
      totalAmount: bookingDetails.totalAmount,
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "Confirmed",
    });

    // 3. Send Email
    try {
      await sendEmail({
        email: booking.customerEmail,
        type: "booking_confirm",
        booking: booking,
      });
    } catch (err) {
      console.log("Email could not be sent", err);
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Booking Status (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    // Send Email Notification on Status Change
    try {
      await sendEmail({
        email: booking.customerEmail,
        type: "status_update",
        booking: booking,
      });
    } catch (err) {
      console.log("Status update email failed", err);
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// @access  Private
export const bookWithCredits = async (req, res) => {
  try {
    const { bookingDetails, guests } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Check if user has enough credits
    if (user.credits < guests) {
      return res.status(400).json({ success: false, message: "Not enough credits. Please purchase a package." });
    }

    // 2. Deduct credits
    user.credits -= guests;
    await user.save();

    // 3. Create the Booking
    const booking = await Booking.create({
      user: user._id,
      customerName: bookingDetails.name,
      customerEmail: bookingDetails.email,
      customerPhone: bookingDetails.phone,
      service: bookingDetails.serviceId,
      serviceName: bookingDetails.serviceName,
      date: bookingDetails.date,
      time: bookingDetails.time,
      guests: guests,
      originalAmount: bookingDetails.originalAmount,
      discountAmount: bookingDetails.originalAmount, // Since they paid with credits, the monetary value is 0
      totalAmount: 0, // Amount paid in cash is 0
      paymentStatus: "Paid",
      razorpayOrderId: "CREDITS_USED",
      razorpayPaymentId: "CREDITS_USED",
      status: "Confirmed",
    });

    // 4. Send Confirmation Email
    try {
      await sendEmail({
        email: booking.customerEmail,
        type: "booking_confirm",
        booking: booking,
      });
    } catch (err) {
      console.log("Email failed", err);
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
