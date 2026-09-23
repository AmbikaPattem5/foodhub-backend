import express from "express";
import crypto from "crypto";
import { db } from "../data/db.js";

const router = express.Router();

const validStatuses = ["Placed", "Preparing", "OutForDelivery", "Delivered"];

/**
 * @route   POST /api/orders
 * @desc    Create a new order (Checkout)
 * @body    { user, items, address, totalAmount, status? }
 */
router.post("/", (req, res) => {
  try {
    const { user, items, address, totalAmount, status } = req.body;

    if (!user || !address) {
      return res.status(400).json({
        success: false,
        message: "Customer name/user and delivery address are required.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must include at least one cart item.",
      });
    }

    const orderId = crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}`;
    const newOrder = {
      id: orderId,
      user: user.trim(),
      items,
      address: address.trim(),
      totalAmount: Number(totalAmount) || 0,
      status: status && validStatuses.includes(status) ? status : "Placed",
      createdAt: String(Date.now()),
    };

    db.addOrder(newOrder);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error creating order.",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders (optionally filter by ?user=...)
 */
router.get("/", (req, res) => {
  try {
    const { user } = req.query;
    const orders = db.getOrders(user);

    // Return newest orders first
    const sorted = [...orders].reverse();

    return res.status(200).json({
      success: true,
      count: sorted.length,
      orders: sorted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders.",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get specific order details by ID
 */
router.get("/:orderId", (req, res) => {
  try {
    const order = db.getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID '${req.params.orderId}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order details.",
      error: error.message,
    });
  }
});

/**
 * @route   PATCH /api/orders/:orderId/status
 * @desc    Update order status (e.g. Placed -> Preparing -> OutForDelivery -> Delivered)
 * @body    { status }
 */
router.patch("/:orderId/status", (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updatedOrder = db.updateOrderStatus(req.params.orderId, status);

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: `Order with ID '${req.params.orderId}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`,
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
});

export default router;
