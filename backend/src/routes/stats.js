const express = require("express");
const Prediction = require("../models/Prediction");
const { memoryStore } = require("./predictions");
const { DISEASES, isHealthy } = require("../utils/diseaseInfo");
const { isConnected } = require("../config/db");

const router = express.Router();
// One accent colour per crop (matches frontend src/data/diseases.js); healthy classes are green.
const CROP_COLORS = {
  Apple: "#dc2626",
  Blueberry: "#2563eb",
  "Bell Pepper": "#16a34a",
  Cherry: "#db2777",
  "Corn (Maize)": "#ca8a04",
  Grape: "#7c3aed",
  Orange: "#f97316",
  Peach: "#ea580c",
  Potato: "#92400e",
  Raspberry: "#9f1239",
  Soybean: "#4d7c0f",
  Squash: "#65a30d",
  Strawberry: "#e11d48",
  Tomato: "#b91c1c",
};
const colorFor = (d) => (d.healthy ? "#22c55e" : CROP_COLORS[d.crop] || "#22c55e");

// GET /api/stats
router.get("/", async (req, res) => {
  try {
    let items = [];
    if (isConnected()) items = await Prediction.find().lean();
    else items = memoryStore || []; // in-memory fallback store (same records as GET /api/predictions)

    const total = items.length;
    // Healthy = ANY of the 12 healthy classes, not a single "Healthy" class.
    const healthy = items.filter((p) => {
      const meta = DISEASES[p.predictedClass];
      return (
        isHealthy(meta) ||
        /- Healthy$/.test(p.diseaseName || "") ||
        /-HLTY$/.test(p.diseaseCode || "")
      );
    }).length;
    const diseased = total - healthy;
    const avgConfidence = total ? items.reduce((s, p) => s + (p.confidence || 0), 0) / total : 0;

    const byDisease = DISEASES.map((d) => ({
      classIndex: d.classIndex, code: d.code, name: d.name, crop: d.crop,
      healthy: d.healthy,
      count: items.filter((p) => p.predictedClass === d.classIndex).length,
      color: colorFor(d),
    }));
    const mostCommon = total
      ? [...byDisease].sort((a, b) => b.count - a.count)[0]
      : null;

    // Last 7 days series
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day); next.setDate(next.getDate() + 1);
      const count = items.filter((p) => {
        const c = new Date(p.createdAt);
        return c >= day && c < next;
      }).length;
      last7Days.push({ date: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), count });
    }

    res.json({ total, healthy, diseased, avgConfidence, byDisease, mostCommon, last7Days });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
