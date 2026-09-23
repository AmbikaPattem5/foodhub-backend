# 🍔 FoodHub Backend (Node.js & Express)

A complete, beginner-friendly REST API server built with **Node.js**, **Express.js**, and lightweight JSON file storage for the **FoodHub** application.

---

## 🚀 Quick Start Guide

### 1. Open Terminal and Navigate to Backend
```bash
cd backend
```

### 2. Install Dependencies (Already installed, run if needed)
```bash
npm install
```

### 3. Start the Server

#### Development Mode (Auto-reloads on file changes):
```bash
npm run dev
```

#### Production / Standard Start:
```bash
npm start
```

The server will start at: **`http://localhost:5000`**

---

## 🛠️ Environment Configuration (`.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```
*Note: CORS is pre-configured to allow requests from your React Vite dev server.*

---

## 📁 Project Structure

```
backend/
├── .env                  # Environment settings (PORT, etc.)
├── .env.example          # Template for environment variables
├── package.json          # Node dependencies & scripts
├── server.js             # Express app entry point & routes registration
├── README.md             # This backend documentation
├── data/
│   ├── initialData.js    # Seed data (restaurants, menu, coupons)
│   ├── db.js             # Database helpers & JSON file persistence
│   └── database.json     # Auto-persisting local database
└── routes/
    ├── authRoutes.js       # Register, Login, Forgot Password
    ├── restaurantRoutes.js # List, Filter, Search, Menu by Restaurant
    ├── menuRoutes.js       # Menu items & categories
    ├── couponRoutes.js     # Coupons & discount calculation
    ├── orderRoutes.js      # Create Order, Order History, Status tracking
    └── favoriteRoutes.js   # Favorites listing and toggling
```

---

## 🔌 API Endpoints Summary

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Log in existing user |
| `POST` | `/api/auth/forgot-password` | Send password reset instructions |
| `GET` | `/api/auth/users` | List registered users (safe view) |

### 2. Restaurants (`/api/restaurants`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/restaurants` | Get all restaurants (supports `?search=...`, `?cuisine=...`, `?sortBy=...`) |
| `GET` | `/api/restaurants/cuisines` | Get list of unique available cuisines |
| `GET` | `/api/restaurants/:id` | Get single restaurant details |
| `GET` | `/api/restaurants/:id/menu` | Get restaurant menu (supports `?category=...`) |

### 3. Menu Items (`/api/menu`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/menu` | Get all menu items (supports `?restaurantId=...`, `?category=...`, `?isVeg=true`) |
| `GET` | `/api/menu/:id` | Get single menu item |

### 4. Coupons & Deals (`/api/coupons`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/coupons` | Get all active coupons |
| `POST` | `/api/coupons/apply` | Validate coupon and calculate discount |

### 5. Orders (`/api/orders`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders` | Place a new order |
| `GET` | `/api/orders` | Get all orders (supports `?user=...`) |
| `GET` | `/api/orders/:orderId` | Get order details by ID |
| `PATCH` | `/api/orders/:orderId/status` | Update order delivery status |

### 6. Favorites (`/api/favorites`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/favorites` | Get saved favorite restaurant IDs |
| `POST` | `/api/favorites/toggle` | Toggle favorite restaurant ID |

---

## 💾 How Data Persistence Works
- All changes (new users, new orders, toggled favorites) are automatically written to `data/database.json`.
- When the backend restarts, your data remains intact!
- If you ever want to reset to clean mock data, you can delete `database.json` and restart the server; it will automatically recreate itself with the default seeds.
