import express from "express";
import { db } from "../data/db.js";

const router = express.Router();

/**
 * @route   GET /api/favorites
 * @desc    Get list of favorite restaurant IDs and full restaurant objects
 */
router.get("/", (req, res) => {
  const favorites = db.getFavorites();
  const restaurants = db.getFavoriteRestaurants();
  return res.status(200).json({
    success: true,
    count: favorites.length,
    favorites,
    restaurants,
  });
});

/**
 * @route   POST /api/favorites/toggle
 * @desc    Toggle favorite restaurant ID (add if absent, remove if present)
 * @body    { restaurantId: number }
 */
router.post("/toggle", (req, res) => {
  const { restaurantId } = req.body;

  if (restaurantId === undefined || restaurantId === null) {
    return res.status(400).json({
      success: false,
      message: "restaurantId is required.",
    });
  }

  const updatedFavorites = db.toggleFavorite(restaurantId);
  const isNowFavorite = updatedFavorites.includes(Number(restaurantId));
  const restaurants = db.getFavoriteRestaurants();

  return res.status(200).json({
    success: true,
    message: isNowFavorite
      ? `Restaurant ${restaurantId} added to favorites.`
      : `Restaurant ${restaurantId} removed from favorites.`,
    isFavorite: isNowFavorite,
    favorites: updatedFavorites,
    restaurants,
  });
});

export default router;
