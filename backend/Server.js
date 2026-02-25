// 1. Sabse pehle Dotenv load karein
require("dotenv").config();

// 2. Packages import karein
const express = require("express");
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
const connectDB = require("./config/db");

// 3. Apne routes aur controllers import karein
const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const stockRoutes = require("./routes/stockRoutes");

// Naye AI imports
const authMiddleware = require("./middleware/authMiddleware");
const { getMarketInsights } = require("./controllers/aiController");

// 4. Express app setup karein
const app = express();
app.use(cors());
app.use(express.json());

// 5. Database connect karein
connectDB();

// 6. Saare Routes lagayein
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/stock", stockRoutes);

// 👉 AI wala route yahan add kiya hai
app.get("/api/ai/insights", authMiddleware, getMarketInsights);

// 7. Server start karein
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});