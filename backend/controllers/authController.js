import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

const createAndAttachOtp = (user) => {
  const otp = String(crypto.randomInt(100000, 1000000));
  user.emailOtpHash = hashOtp(otp);
  user.emailOtpExpire = new Date(Date.now() + OTP_EXPIRY_MS);
  user.emailOtpLastSentAt = new Date();
  user.emailOtpAttempts = 0;
  return otp;
};

const formatAuthResponse = (user) => ({
  success: true,
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role,
  avatar: user.avatar,
  membershipTier: user.membershipTier,
  membershipStatus: user.membershipStatus,
  credits: user.credits ?? 0,
  isEmailVerified: user.isEmailVerified,
  token: generateToken(user._id),
});

// @desc    Register a new user & send Email OTP (does NOT log in until verified)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const phone = req.body.phone ? String(req.body.phone).trim() : undefined;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please add all required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists. Please login." });
      }

      // Unverified account exists -> update details & resend fresh OTP
      existingUser.name = name;
      existingUser.password = password;
      if (phone) existingUser.phone = phone;
      const otp = createAndAttachOtp(existingUser);
      await existingUser.save();

      res.status(200).json({
        success: true,
        requiresVerification: true,
        email: existingUser.email,
        message: "Verification OTP sent to your email.",
      });

      sendEmail({
        type: "email_otp",
        email: existingUser.email,
        name: existingUser.name,
        otp,
      }).catch((err) => console.log("OTP email failed:", err.message));

      return;
    }

    const user = new User({
      name,
      email,
      password,
      phone,
      isEmailVerified: false,
    });

    const otp = createAndAttachOtp(user);
    await user.save();

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: user.email,
      message: "Verification OTP sent to your email.",
    });

    sendEmail({
      type: "email_otp",
      email: user.email,
      name: user.name,
      otp,
    }).catch((err) => console.log("OTP email failed:", err.message));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Email OTP & issue JWT token
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyEmailOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and 6-digit OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    if (user.isEmailVerified) {
      return res.status(200).json(formatAuthResponse(user));
    }

    if (!user.emailOtpHash || !user.emailOtpExpire) {
      return res.status(400).json({
        success: false,
        message: "No active OTP found. Please request a new code.",
      });
    }

    if (user.emailOtpExpire.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new code.",
      });
    }

    if ((user.emailOtpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    const isMatch = hashOtp(otp) === user.emailOtpHash;
    if (!isMatch) {
      user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${Math.max(
          0,
          MAX_OTP_ATTEMPTS - user.emailOtpAttempts
        )} attempts remaining.`,
      });
    }

    user.isEmailVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpire = undefined;
    user.emailOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(formatAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend Email OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendEmailOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified. Please login.",
      });
    }

    if (
      user.emailOtpLastSentAt &&
      Date.now() - user.emailOtpLastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      const waitSec = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS -
          (Date.now() - user.emailOtpLastSentAt.getTime())) /
          1000
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec}s before requesting another OTP.`,
      });
    }

    const otp = createAndAttachOtp(user);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "A new verification OTP has been sent to your email.",
    });

    sendEmail({
      type: "email_otp",
      email: user.email,
      name: user.name,
      otp,
    }).catch((err) => console.log("Resend OTP email failed:", err.message));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate a user & get token (blocks unverified users)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please add email and password" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Block login if email is not verified yet, and send a fresh OTP
    if (!user.isEmailVerified) {
      const otp = createAndAttachOtp(user);
      await user.save({ validateBeforeSave: false });

      res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: "Please verify your email first. We sent a new OTP to your inbox.",
      });

      sendEmail({
        type: "email_otp",
        email: user.email,
        name: user.name,
        otp,
      }).catch((err) => console.log("Login OTP email failed:", err.message));

      return;
    }

    return res.json(formatAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      if (req.file) {
        user.avatar = `/uploads/${req.file.filename}`;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json(formatAuthResponse(updatedUser));
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "There is no user with that email" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    res.status(200).json({ success: true, message: "Reset link sent to your email" });

    sendEmail({
      type: "password_reset",
      email: user.email,
      resetUrl,
    }).catch((err) => console.log("Password reset email failed:", err.message));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.isEmailVerified = true; // Proved ownership of email via reset link
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details (Admin)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.membershipTier = req.body.membershipTier ?? user.membershipTier;
    user.membershipStatus = req.body.membershipStatus ?? user.membershipStatus;
    user.credits =
      req.body.credits !== undefined ? req.body.credits : user.credits;

    const updatedUser = await user.save();

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};