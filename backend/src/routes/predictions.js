const express = require("express");
const fs = require("fs");
const path = require("path");
const Prediction = require("../models/Prediction");
const upload = require("../middleware/upload");
const { predictWithML } = require("../services/mlService");
const { DISEASES, getDisease } = require("../utils/diseaseInfo");
const { isConnected } = require("../config/db");

const router = express.Router();

// Simple in-memory fallback store when MongoDB is down (demo resilience)
const memoryStore = [];
let memId = 1;

// POST /api/predictions — upload + predict + save
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded. Send multipart field 'image'." });

    const result = await predictWithML(req.file.path, req.file.originalname);
    const meta = getDisease(result.predictedClass);

    const docData = {
      image: req.file.filename,
      originalName: req.file.originalname,
      predictedClass: result.predictedClass,
      diseaseCode: meta.code,
      diseaseName: meta.name,
      confidence: result.confidence,
      topPredictions: result.topPredictions,
      isDemo: result.isDemo,
      createdAt: new Date(),
    };

    let saved;
    if (isConnected()) {
      saved = await Prediction.create(docData);
    } else {
      saved = { _id: `mem-${memId++}`, ...docData };
      memoryStore.unshift(saved);
    }
    res.status(201).json({ prediction: saved, ...result, diseaseCode: meta.code, diseaseName: meta.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Prediction failed" });
  }
});

// GET /api/predictions
router.get("/", async (req, res) => {
  try {
    if (isConnected()) {
      const items = await Prediction.find().sort({ createdAt: -1 }).limit(100);
      return res.json(items);
    }
    return res.json(memoryStore);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/predictions/:id
router.get("/:id", async (req, res) => {
  try {
    if (String(req.params.id).startsWith("mem-")) {
      const found = memoryStore.find((p) => p._id === req.params.id);
      return found ? res.json(found) : res.status(404).json({ message: "Not found" });
    }
    const item = await Prediction.findById(req.params.id);
    return item ? res.json(item) : res.status(404).json({ message: "Not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/predictions/:id
router.delete("/:id", async (req, res) => {
  try {
    let item = null;
    if (String(req.params.id).startsWith("mem-")) {
      const idx = memoryStore.findIndex((p) => p._id === req.params.id);
      if (idx >= 0) item = memoryStore.splice(idx, 1)[0];
    } else if (isConnected()) {
      item = await Prediction.findByIdAndDelete(req.params.id);
    }
    if (!item) return res.status(404).json({ message: "Not found" });
    // Best-effort: remove uploaded file
    const fp = path.join(__dirname, "../../uploads", item.image);
    fs.unlink(fp, () => {});
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
// Shared with the stats route so /api/stats also works on the in-memory fallback (no Mongo)
module.exports.memoryStore = memoryStore;
