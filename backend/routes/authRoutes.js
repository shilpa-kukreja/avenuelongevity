import express from "express";
import {
  registerUser,
  verifyEmailOtp,
  resendEmailOtp,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUserByAdmin,
} from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/verify-otp", verifyEmailOtp);
router.post("/resend-otp", resendEmailOtp);
router.post("/login", loginUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

// Private User Routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("avatar"), updateUserProfile);

// Private Admin Routes
router.get("/users", protect, admin, getAllUsers);
router.put("/users/:id", protect, admin, updateUserByAdmin);

export default router;