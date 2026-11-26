require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB, isConnected } = require("./config/db");
const { mlHealth } = require("./services/mlService");
const predictionsRouter = require("./routes/predictions");
const statsRouter = require("./routes/stats");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", async (req, res) => {
  const ml = await mlHealth();
  res.json({
    status: "ok",
    service: "crop-disease-backend",
    db: isConnected() ? "connected" : "disconnected (in-memory fallback for new predictions)",
    mlService: ml,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/predictions", predictionsRouter);
app.use("/api/stats", statsRouter);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Error handler (incl. Multer errors)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 500;
  res.status(status).json({ message: err.message || "Server error" });
});

connectDB().finally(() => {
  app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
});
