import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    membershipTier: {
      type: String,
      enum: ["None", "Essential", "Signature", "Sanctuary"],
      default: "None",
    },

    membershipStatus: {
      type: String,
      enum: ["Active", "Inactive", "Past Due"],
      default: "Inactive",
    },

    credits: {
      type: Number,
      default: 0,
    },

    // Email OTP Verification fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtpHash: {
      type: String,
    },
    emailOtpExpire: {
      type: Date,
    },
    emailOtpLastSentAt: {
      type: Date,
    },
    emailOtpAttempts: {
      type: Number,
      default: 0,
    },

    // Password Reset fields (matched to controller)
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;