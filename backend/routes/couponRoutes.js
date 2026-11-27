import express from "express";
import {
  getActiveCoupons,
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
// import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveCoupons);
router.post("/validate", validateCoupon);

// Admin routes (add protect, adminOnly once wired)
router.get("/", getAllCoupons);
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;