const mongoose = require("mongoose");

let connected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/crop-disease";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    connected = true;
    console.log("✅ MongoDB connected:", uri);
  } catch (err) {
    connected = false;
    console.warn("⚠️  MongoDB not available — server will keep running, DB routes will return graceful errors.");
    console.warn("   Reason:", err.message);
    console.warn("   Start Mongo with: docker compose up -d mongo  (from project root)");
  }
  mongoose.connection.on("disconnected", () => { connected = false; });
  mongoose.connection.on("connected", () => { connected = true; });
}

module.exports = { connectDB, isConnected: () => connected && mongoose.connection.readyState === 1 };
