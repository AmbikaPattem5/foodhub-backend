import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { initDatabase } from "./data/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database with initial seeds if not already created
initDatabase();

// Middleware
app.use(
  cors({
    origin: "*", // Allows requests from any frontend port (e.g. Vite http://localhost:5173)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Logs: GET /api/restaurants 200 - 4.123 ms

// Root route - Quick overview of available endpoints
app.get("/", (req, res) => {
  res.json({
    message: "🍔 Welcome to the FoodHub Backend API!",
    status: "online",
    endpoints: {
      health: "/api/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        forgotPassword: "POST /api/auth/forgot-password",
        users: "GET /api/auth/users",
      },
      restaurants: {
        all: "GET /api/restaurants",
        filterAndSort: "GET /api/restaurants?search=biryani&cuisine=south%20indian&sortBy=rating",
        cuisines: "GET /api/restaurants/cuisines",
        single: "GET /api/restaurants/:id",
        menu: "GET /api/restaurants/:id/menu",
      },
      menu: {
        all: "GET /api/menu",
        filter: "GET /api/menu?category=Biryani&isVeg=true",
        single: "GET /api/menu/:id",
      },
      coupons: {
        all: "GET /api/coupons",
        apply: "POST /api/coupons/apply",
      },
      orders: {
        create: "POST /api/orders",
        getAll: "GET /api/orders",
        getById: "GET /api/orders/:orderId",
        updateStatus: "PATCH /api/orders/:orderId/status",
      },
      favorites: {
        get: "GET /api/favorites",
        toggle: "POST /api/favorites/toggle",
      },
    },
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "FoodHub Backend is running smoothly 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
    hint: "Check / to see the full list of available API endpoints.",
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 FoodHub Backend running on: http://localhost:${PORT}`);
  console.log(`📄 API Documentation / Health: http://localhost:${PORT}/api/health`);
  console.log(`🍽️  Restaurants Endpoint:       http://localhost:${PORT}/api/restaurants`);
  console.log(`🏷️  Coupons Endpoint:           http://localhost:${PORT}/api/coupons`);
  console.log(`📦 Orders Endpoint:            http://localhost:${PORT}/api/orders`);
  console.log(`=================================================\n`);
});
