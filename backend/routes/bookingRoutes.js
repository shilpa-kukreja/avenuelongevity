import express from "express";
import {
  createOrder,
  verifyPaymentAndBook,
  getMyBookings,
  getAllBookings,
  updateBookingStatus, // Import this
  bookWithCredits // Import this
} from "../controllers/bookingController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/order", protect, createOrder);
router.post("/verify", protect, verifyPaymentAndBook);
router.get("/my-bookings", protect, getMyBookings);
// Add this line:
router.post("/credits", protect, bookWithCredits);

// Admin Routes
router.get("/", protect, admin, getAllBookings);
router.put("/:id/status", protect, admin, updateBookingStatus); // Add this

export default router;