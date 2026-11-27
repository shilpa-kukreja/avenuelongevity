import crypto from "crypto";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import { razorpayInstance } from "../utils/razorpay.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Create Razorpay Order
// @route   POST /api/bookings/order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid order amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: "Error creating order" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get User Bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment & Create Booking
// @route   POST /api/bookings/verify
// @access  Private
export const verifyPaymentAndBook = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails,
    } = req.body;

    // 1. Verify Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
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
      couponCode: bookingDetails.couponCode || null,
      totalAmount: bookingDetails.totalAmount,
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "Confirmed",
    });

    // 3. Respond immediately so the UI shows Booking Confirmed right away
    res.status(201).json({ success: true, booking });

    // 4. Fire non-blocking background tasks (coupon count + confirmation email)
    if (bookingDetails.couponCode) {
      Coupon.updateOne(
        { code: String(bookingDetails.couponCode).trim().toUpperCase() },
        { $inc: { usedCount: 1 } }
      ).catch((err) => console.log("Coupon usage update failed:", err.message));
    }

    sendEmail({
      email: booking.customerEmail,
      type: "booking_confirm",
      booking,
    }).catch((err) => console.log("Email could not be sent:", err.message));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    res.status(200).json({ success: true, booking });

    // Send status update email in background
    sendEmail({
      email: booking.customerEmail,
      type: "status_update",
      booking,
    }).catch((err) => console.log("Status update email failed:", err.message));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book Using Session Credits
// @route   POST /api/bookings/credits
// @access  Private
export const bookWithCredits = async (req, res) => {
  try {
    const { bookingDetails, guests } = req.body;
    const guestCount = Number(guests) || 1;

    // Atomic check + deduct credits in 1 DB query
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, credits: { $gte: guestCount } },
      { $inc: { credits: -guestCount } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Not enough credits. Please purchase a package.",
      });
    }

    const booking = await Booking.create({
      user: user._id,
      customerName: bookingDetails.name,
      customerEmail: bookingDetails.email,
      customerPhone: bookingDetails.phone,
      service: bookingDetails.serviceId,
      serviceName: bookingDetails.serviceName,
      date: bookingDetails.date,
      time: bookingDetails.time,
      guests: guestCount,
      originalAmount: bookingDetails.originalAmount,
      discountAmount: bookingDetails.originalAmount,
      totalAmount: 0,
      paymentStatus: "Paid",
      razorpayOrderId: "CREDITS_USED",
      razorpayPaymentId: "CREDITS_USED",
      status: "Confirmed",
    });

    // Respond immediately
    res.status(201).json({
      success: true,
      booking,
      remainingCredits: user.credits,
    });

    // Send confirmation email in background
    sendEmail({
      email: booking.customerEmail,
      type: "booking_confirm",
      booking,
    }).catch((err) => console.log("Email failed:", err.message));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};