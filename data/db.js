import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  initialRestaurants,
  initialMenuItems,
  initialCoupons,
  initialUsers,
  initialFavorites,
  initialOrders,
} from "./initialData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "database.json");

// In-memory cache
let databaseCache = null;

// Initialize or load database
export function initDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      databaseCache = JSON.parse(raw);
    } else {
      databaseCache = {
        restaurants: initialRestaurants,
        menuItems: initialMenuItems,
        coupons: initialCoupons,
        users: initialUsers,
        favorites: initialFavorites,
        orders: initialOrders,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(databaseCache, null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Error reading database file, using default seeds:", error);
    databaseCache = {
      restaurants: initialRestaurants,
      menuItems: initialMenuItems,
      coupons: initialCoupons,
      users: initialUsers,
      favorites: initialFavorites,
      orders: initialOrders,
    };
  }
  return databaseCache;
}

export function getDb() {
  if (!databaseCache) {
    return initDatabase();
  }
  return databaseCache;
}

export function saveDb(updatedData) {
  databaseCache = { ...databaseCache, ...updatedData };
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(databaseCache, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database.json:", error);
  }
  return databaseCache;
}

// Helper methods for clean route handlers:
export const db = {
  // Restaurants
  getRestaurants: () => getDb().restaurants,
  getRestaurantById: (id) => getDb().restaurants.find((r) => r.id === Number(id)),

  // Menu items
  getMenuItems: () => getDb().menuItems,
  getMenuByRestaurantId: (restaurantId) =>
    getDb().menuItems.filter((item) => item.restaurantId === Number(restaurantId)),
  getMenuItemById: (id) => getDb().menuItems.find((item) => item.id === Number(id)),

  // Coupons
  getCoupons: () => getDb().coupons,
  getCouponByCode: (code) =>
    getDb().coupons.find((c) => c.code.trim().toUpperCase() === code.trim().toUpperCase()),

  // Users
  getUsers: () => getDb().users,
  findUserByEmailOrUsername: (identifier) =>
    getDb().users.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.name.toLowerCase() === identifier.toLowerCase()
    ),
  addUser: (user) => {
    const current = getDb();
    const updatedUsers = [...current.users, user];
    saveDb({ users: updatedUsers });
    return user;
  },

  // Orders
  getOrders: (user) => {
    const orders = getDb().orders || [];
    if (user) {
      return orders.filter((o) => o.user.toLowerCase() === user.toLowerCase());
    }
    return orders;
  },
  getOrderById: (orderId) => (getDb().orders || []).find((o) => o.id === orderId),
  addOrder: (order) => {
    const current = getDb();
    const updatedOrders = [...(current.orders || []), order];
    saveDb({ orders: updatedOrders });
    return order;
  },
  updateOrderStatus: (orderId, newStatus) => {
    const current = getDb();
    const orders = current.orders || [];
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;
    orders[index] = { ...orders[index], status: newStatus };
    saveDb({ orders });
    return orders[index];
  },

  // Favorites
  getFavorites: () => getDb().favorites || [],
  getFavoriteRestaurants: () => {
    const current = getDb();
    const favIds = (current.favorites || []).map(Number);
    const restaurants = current.restaurants || [];
    return restaurants.filter((r) => favIds.includes(Number(r.id)));
  },
  toggleFavorite: (restaurantId) => {
    const current = getDb();
    const id = Number(restaurantId);
    let favs = current.favorites || [];
    if (favs.includes(id)) {
      favs = favs.filter((f) => f !== id);
    } else {
      favs = [...favs, id];
    }
    saveDb({ favorites: favs });
    return favs;
  },
};
