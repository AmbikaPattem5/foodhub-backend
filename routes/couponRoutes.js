import express from "express";
import { db } from "../data/db.js";

const router = express.Router();

/**
 * @route   GET /api/coupons
 * @desc    Get coupons (active by default, or all if ?all=true)
 */
router.get("/", (req, res) => {
  const { all } = req.query;
  const coupons = db.getCoupons();

  const result = all === "true" ? coupons : coupons.filter((c) => c.isActive === true);

  return res.status(200).json({
    success: true,
    count: result.length,
    coupons: result,
  });
});

/**
 * @route   POST /api/coupons/apply
 * @desc    Validate and calculate coupon discount
 * @body    { code: string, cartTotal: number }
 */
router.post("/apply", (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Coupon code is required.",
      });
    }

    const coupon = db.getCouponByCode(code.trim());

    if (!coupon) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Coupon code '${code}' is invalid.`,
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Coupon '${code}' has expired or is inactive.`,
      });
    }

    const total = Number(cartTotal) || 0;

    if (total < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon. Your cart is ₹${total}.`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "FLAT") {
      discount = coupon.discountValue;
    } else if (coupon.discountType === "PERCENTAGE") {
      discount = Math.round((total * coupon.discountValue) / 100);
    }

    // Discount cannot exceed cart total
    discount = Math.min(discount, total);
    const newTotal = Math.max(0, total - discount);

    return res.status(200).json({
      success: true,
      valid: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon,
      discount,
      newTotal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      valid: false,
      message: "Server error validating coupon.",
      error: error.message,
    });
  }
});

export default router;
