import express from "express";
import { db } from "../data/db.js";

const router = express.Router();

/**
 * @route   GET /api/restaurants/cuisines
 * @desc    Get all unique cuisines available
 */
router.get("/cuisines", (req, res) => {
  const restaurants = db.getRestaurants();
  const cuisinesSet = new Set();
  restaurants.forEach((r) => {
    r.cuisine.forEach((c) => cuisinesSet.add(c.toLowerCase()));
  });
  return res.status(200).json({
    success: true,
    cuisines: Array.from(cuisinesSet),
  });
});

/**
 * @route   GET /api/restaurants
 * @desc    Get all restaurants with optional filtering and sorting
 * @query   search, cuisine, sortBy (rating | deliveryTime | priceLow | priceHigh)
 */
router.get("/", (req, res) => {
  try {
    const { search, cuisine, sortBy } = req.query;
    let list = [...db.getRestaurants()];

    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.restaurantName.toLowerCase().includes(q) ||
          r.cuisine.some((c) => c.toLowerCase().includes(q))
      );
    }

    // Cuisine filter
    if (cuisine && cuisine.trim()) {
      const targetCuisine = cuisine.trim().toLowerCase();
      list = list.filter((r) =>
        r.cuisine.some((c) => c.toLowerCase() === targetCuisine)
      );
    }

    // Sorting
    if (sortBy) {
      if (sortBy === "rating") {
        list.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === "deliveryTime") {
        list.sort((a, b) => a.deliveryTime - b.deliveryTime);
      } else if (sortBy === "priceLow") {
        list.sort((a, b) => Number(a.priceForTwo) - Number(b.priceForTwo));
      } else if (sortBy === "priceHigh") {
        list.sort((a, b) => Number(b.priceForTwo) - Number(a.priceForTwo));
      }
    }

    return res.status(200).json({
      success: true,
      count: list.length,
      restaurants: list,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants.",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/restaurants/:id
 * @desc    Get a single restaurant by ID
 */
router.get("/:id", (req, res) => {
  const restaurant = db.getRestaurantById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: `Restaurant with ID ${req.params.id} not found.`,
    });
  }
  return res.status(200).json({
    success: true,
    restaurant,
  });
});

/**
 * @route   GET /api/restaurants/:id/menu
 * @desc    Get menu items for a specific restaurant
 * @query   category (optional)
 */
router.get("/:id/menu", (req, res) => {
  const restaurant = db.getRestaurantById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: `Restaurant with ID ${req.params.id} not found.`,
    });
  }

  let menu = db.getMenuByRestaurantId(req.params.id);
  const { category } = req.query;

  if (category && category !== "All") {
    menu = menu.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  const categories = Array.from(new Set(db.getMenuByRestaurantId(req.params.id).map((i) => i.category)));

  return res.status(200).json({
    success: true,
    restaurantId: Number(req.params.id),
    restaurantName: restaurant.restaurantName,
    categories,
    count: menu.length,
    menu,
  });
});

export default router;
