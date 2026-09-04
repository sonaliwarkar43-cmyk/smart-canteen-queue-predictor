import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { db } from "./server/db";
import { predictWaitingTime, predictPeakTimes, chatWithCanteenAI } from "./server/gemini";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// REST API ROUTES (MUST COME BEFORE VITE MIDDLEWARE)
// ----------------------------------------------------

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Smart Canteen Queue Predictor 🍔",
    timestamp: new Date().toISOString(),
  });
});

// 2. Authentication APIs
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "A user with this email already exists." });
  }

  const user = db.createUser({
    name,
    email,
    password: password || "password123",
    role: role === "admin" ? "admin" : "student",
  });

  return res.status(201).json({
    message: "Registration successful!",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // If demo logging in, create on the fly
    user = db.createUser({
      name: email.split("@")[0],
      email,
      role: role || (email.includes("admin") ? "admin" : "student"),
    });
  }

  return res.json({
    message: "Login successful!",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.get("/api/auth/users", (_req, res) => {
  res.json({ users: db.getUsers() });
});

// 3. Food Menu APIs
app.get(["/api/food", "/api/foods"], (_req, res) => {
  const items = db.getFoodItems();
  res.json({ items, foods: items });
});

app.post(["/api/food", "/api/foods"], (req, res) => {
  const { name, category, price, preparation_time, availability, image, description, popular } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: "Item name and price are required." });
  }

  const newItem = db.createFoodItem({
    name,
    category: category || "Snacks",
    price: Number(price),
    preparation_time: Number(preparation_time) || 5,
    availability: availability !== false,
    image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    description: description || "Fresh canteen specialty prepared to order.",
    popular: Boolean(popular),
  });

  res.status(201).json({ message: "Food item created successfully", item: newItem, food: newItem });
});

app.all(["/api/food/:id", "/api/foods/:id"], (req, res, next) => {
  if (req.method === "PUT" || req.method === "PATCH") {
    const id = Number(req.params.id);
    const updated = db.updateFoodItem(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Food item not found" });
    }
    return res.json({ message: "Food item updated", item: updated, food: updated });
  }
  if (req.method === "DELETE") {
    const id = Number(req.params.id);
    const deleted = db.deleteFoodItem(id);
    if (!deleted) {
      return res.status(404).json({ error: "Food item not found" });
    }
    return res.json({ message: "Food item removed successfully" });
  }
  next();
});

// 4. Orders APIs
app.get("/api/orders", (req, res) => {
  const email = req.query.email as string | undefined;
  const allOrders = db.getOrders();
  if (email) {
    const userOrders = allOrders.filter((o) => o.customer_email.toLowerCase() === email.toLowerCase());
    return res.json({ orders: userOrders });
  }
  res.json({ orders: allOrders });
});

app.get("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const order = db.getOrderById(id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Find position in queue
  const queueData = db.getQueue();
  const queueEntry = queueData.queue_entries.find((q) => q.order_id === id);

  res.json({
    order,
    queue_status: queueEntry || {
      queue_position: 0,
      estimated_time: 0,
      status: order.order_status === "Completed" ? "collected" : "ready",
    },
    live_queue_metrics: {
      total_in_queue: queueData.queue_length,
      average_prep_time: queueData.average_preparation_time,
      available_counters: queueData.available_counters,
    },
  });
});

app.post("/api/orders", (req, res) => {
  const { user_id, customer_name, customer_email, items, pickup_time, payment_method } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "At least one food item must be selected." });
  }

  const order = db.createOrder({
    user_id: user_id ? Number(user_id) : 1,
    customer_name: customer_name || "Student",
    customer_email: customer_email || "student@college.edu",
    items,
    pickup_time,
    payment_method,
  });

  const queueInfo = db.getQueue();
  const entry = queueInfo.queue_entries.find((q) => q.order_id === order.id);

  res.status(201).json({
    message: "Order placed successfully!",
    order,
    queue_entry: entry,
    current_queue_length: queueInfo.queue_length,
    estimated_wait_time: entry?.estimated_time || queueInfo.estimated_wait_time,
  });
});

app.all(["/api/orders/:id/status"], (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const validStatuses = ["Pending", "Order Placed", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  const updated = db.updateOrderStatus(id, status);
  if (!updated) {
    return res.status(404).json({ error: "Order not found" });
  }

  const updatedQueue = db.getQueue();

  res.json({
    message: `Order #${id} status updated to ${status}`,
    order: updated,
    queue: updatedQueue,
  });
});

// 5. Queue Management APIs
app.get("/api/queue", (_req, res) => {
  const queueData = db.getQueue();
  res.json(queueData);
});

app.all(["/api/queue/config", "/api/admin/counters"], (req, res) => {
  const counters = req.body.counters !== undefined ? req.body.counters : req.body.available_counters;
  const { average_preparation_time, canteen_name, is_canteen_open } = req.body;
  const updated = db.updateQueueConfig({
    ...(counters !== undefined && { available_counters: Number(counters) }),
    ...(average_preparation_time !== undefined && { average_preparation_time: Number(average_preparation_time) }),
    ...(canteen_name !== undefined && { canteen_name: String(canteen_name) }),
    ...(is_canteen_open !== undefined && { is_canteen_open: Boolean(is_canteen_open) }),
  });

  res.json({ message: "Queue configuration updated", config: updated, queue: db.getQueue() });
});

// 6. Gemini AI Predictions APIs
app.all(["/api/prediction/waiting-time", "/api/ai/predict-wait"], async (_req, res) => {
  const queueData = db.getQueue();
  const prediction = await predictWaitingTime({
    queue_length: queueData.queue_length,
    active_orders: queueData.total_active_orders,
    average_prep_time: queueData.average_preparation_time,
    available_counters: queueData.available_counters,
  });

  res.json({
    live_metrics: queueData,
    ...prediction,
    prediction,
  });
});

app.all(["/api/prediction/peak-time", "/api/ai/peak-prediction"], async (_req, res) => {
  const peakData = await predictPeakTimes();
  res.json(peakData);
});

// 7. Canteen AI Chatbot Assistant API
app.post("/api/ai/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const queueData = db.getQueue();
  const foodItems = db.getFoodItems();
  const popularItems = foodItems
    .filter((f) => f.availability)
    .slice(0, 5)
    .map((f) => ({ name: f.name, price: f.price, prepTime: f.preparation_time }));

  const reply = await chatWithCanteenAI({
    message,
    history,
    canteenContext: {
      queueLength: queueData.queue_length,
      estimatedWaitTime: queueData.estimated_wait_time,
      trafficLevel: queueData.traffic_level,
      activeOrders: queueData.total_active_orders,
      popularItems,
      recommendedTime: "11:15 AM (Before lunch peak)",
    },
  });

  res.json({ reply, timestamp: new Date().toISOString() });
});

// 8. Admin Analytics API
app.get("/api/analytics/dashboard", (_req, res) => {
  const analytics = db.getAnalytics();
  res.json(analytics);
});

// ----------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🍔 Smart Canteen Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
