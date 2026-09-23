import express from "express";
import { db } from "../data/db.js";

const router = express.Router();

/**
 * @route   GET /api/menu
 * @desc    Get all menu items across all restaurants
 * @query   restaurantId, category, isVeg
 */
router.get("/", (req, res) => {
  try {
    let items = [...db.getMenuItems()];
    const { restaurantId, category, isVeg } = req.query;

    if (restaurantId) {
      items = items.filter((item) => item.restaurantId === Number(restaurantId));
    }

    if (category && category !== "All") {
      items = items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }

    if (isVeg !== undefined) {
      const isVegBool = isVeg === "true";
      items = items.filter((item) => item.isVeg === isVegBool);
    }

    return res.status(200).json({
      success: true,
      count: items.length,
      menuItems: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu items.",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/menu/:id
 * @desc    Get single menu item by ID
 */
router.get("/:id", (req, res) => {
  const item = db.getMenuItemById(req.params.id);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: `Menu item with ID ${req.params.id} not found.`,
    });
  }
  return res.status(200).json({
    success: true,
    menuItem: item,
  });
});

export default router;
