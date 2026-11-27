import crypto from "crypto";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js"; // ← add if you have this model
import { razorpayInstance } from "../utils/razorpay.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Create Razorpay Order for Cart Checkout
// @route   POST /api/transactions/order
// @access  Private
export const createTransactionOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(Number(amount) * 100), // paise
      currency: "INR",
      receipt: `txn_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Payment, Save Transactions & Update User
// @route   POST /api/transactions/verify
// @access  Private
export const verifyTransactionAndSave = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      couponCode = null,
      discountAmount = 0,
      tax = 0,
    } = req.body;

    /* ── 1. Verify signature ── */
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    /* ── 2. Validate cart & user ── */
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    /* ── 3. Compute subtotal for proportional distribution ── */
    const subtotal = cartItems.reduce(
      (sum, item) =>
        sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
      0
    );

    if (subtotal <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart total" });
    }

    // Sanitize cart-level amounts (never exceed subtotal, never negative)
    const safeDiscount = Math.min(
      Math.max(Number(discountAmount) || 0, 0),
      subtotal
    );
    const safeTax = Math.max(Number(tax) || 0, 0);

    /* ── 4. Create one Transaction per cart item ── */
    const createdTransactions = [];
    let allocatedDiscount = 0;
    let allocatedTax = 0;

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const isLast = i === cartItems.length - 1;
      const qty = Number(item.qty) || 1;
      const itemSubtotal = (Number(item.price) || 0) * qty;
      const share = itemSubtotal / subtotal;

      // Distribute discount + tax proportionally.
      // The LAST item absorbs any rounding remainder so the sum stays exact.
      const itemDiscount = isLast
        ? safeDiscount - allocatedDiscount
        : Math.round(safeDiscount * share);

      const itemTax = isLast
        ? safeTax - allocatedTax
        : Math.round(safeTax * share);

      allocatedDiscount += itemDiscount;
      allocatedTax += itemTax;

      const itemFinalAmount = Math.max(
        0,
        itemSubtotal + itemTax - itemDiscount
      );

      const billingCycle = item.billing
        ? item.billing === "yearly"
          ? "Yearly"
          : "Monthly"
        : "None";

      const transactionData = {
        user: user._id,
        customerName: user.name,
        customerEmail: user.email,

        itemType: item.type === "membership" ? "Membership" : "Package",
        itemName: item.name,

        // ✅ NOW stores real amounts
        originalAmount: itemSubtotal,
        discountAmount: itemDiscount,
        couponCode: couponCode || null,
        amount: itemFinalAmount,

        paymentStatus: "Paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,

        billingCycle,
      };

      // Compute renewal for membership
      if (billingCycle === "Yearly" || billingCycle === "Monthly") {
        const renewal = new Date();
        if (billingCycle === "Yearly") {
          renewal.setFullYear(renewal.getFullYear() + 1);
        } else {
          renewal.setMonth(renewal.getMonth() + 1);
        }
        transactionData.nextRenewalDate = renewal;
      }

      const transaction = await Transaction.create(transactionData);
      createdTransactions.push(transaction);

      /* ── 5. Update user based on item type ── */
      if (item.type === "membership") {
        user.membershipTier = item.name
          .replace(/ Membership$/i, "")
          .trim();
        user.membershipStatus = "Active";
      } else if (item.type === "package") {
        user.credits =
          (user.credits || 0) + (Number(item.sessions) || 0) * qty;
      }
    }

    await user.save();

    /* ── 6. Increment coupon usage (optional) ── */
    if (couponCode && Coupon) {
      try {
        await Coupon.updateOne(
          { code: couponCode },
          { $inc: { usedCount: 1 } }
        );
      } catch (couponErr) {
        console.log("Coupon usage increment failed:", couponErr.message);
      }
    }

    /* ── 7. Send receipt email ── */
    try {
      await sendEmail({
        email: user.email,
        type: "purchase_receipt",
        transaction: createdTransactions[0],
      });
    } catch (err) {
      console.log("Email could not be sent", err);
    }

    res.status(200).json({
      success: true,
      transactions: createdTransactions,
    });
  } catch (error) {
    console.error("verifyTransactionAndSave error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Transactions (Admin)
// @route   GET /api/transactions
// @access  Private/Admin
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user's transactions
// @route   GET /api/transactions/my-transactions
// @access  Private
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};