const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const { DISEASES } = require("../utils/diseaseInfo");

const ML_URL = () => process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * Demo prediction used when the ML service is down / model missing.
 * Picks a plausible class and generates probabilities that sum to ~1.
 */
function demoPrediction(seedName = "") {
  // Deterministic-ish: vary pick by filename hash so demos feel varied but stable per file
  let hash = 0;
  for (const ch of seedName) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const predictedClass = hash % DISEASES.length;
  const confidence = 0.82 + ((hash >> 3) % 14) / 100; // 0.82 – 0.95
  let remaining = 1 - confidence;
  const others = DISEASES.filter((d) => d.classIndex !== predictedClass)
    .map((d) => {
      const p = remaining * (0.25 + (((hash >> (d.classIndex + 2)) % 50) / 100));
      return { d, p };
    });
  const sumOthers = others.reduce((s, o) => s + o.p, 0) || 1;
  const topPredictions = [
    { classIndex: predictedClass, code: DISEASES[predictedClass].code, name: DISEASES[predictedClass].name, probability: +confidence.toFixed(4) },
    ...others.map((o) => ({
      classIndex: o.d.classIndex, code: o.d.code, name: o.d.name,
      probability: +((o.p / sumOthers) * remaining).toFixed(4),
    })),
  ].sort((a, b) => b.probability - a.probability);
  return { predictedClass, confidence: topPredictions[0].probability, topPredictions, isDemo: true };
}

async function predictWithML(filePath, originalName) {
  try {
    const form = new FormData();
    form.append("image", fs.createReadStream(filePath), originalName || "leaf.jpg");
    const { data } = await axios.post(`${ML_URL()}/predict`, form, {
      headers: form.getHeaders(),
      timeout: 20000,
    });
    if (data && typeof data.predictedClass === "number" && Array.isArray(data.topPredictions)) {
      // Normalise topPredictions with code/name from server metadata
      const topPredictions = data.topPredictions.map((p) => {
        const meta = DISEASES[p.classIndex] || {};
        return {
          classIndex: p.classIndex,
          code: p.code || meta.code,
          name: p.name || meta.name,
          probability: p.probability,
        };
      }).sort((a, b) => b.probability - a.probability);
      return {
        predictedClass: data.predictedClass,
        confidence: data.confidence ?? topPredictions[0]?.probability ?? 0,
        topPredictions,
        isDemo: !!data.isDemo,
      };
    }
    throw new Error("Unexpected ML service response");
  } catch (err) {
    console.warn("ML service unavailable, using DEMO prediction:", err.message);
    return demoPrediction(originalName || filePath);
  }
}

async function mlHealth() {
  try {
    const { data } = await axios.get(`${ML_URL()}/health`, { timeout: 2500 });
    return { reachable: true, ...data };
  } catch {
    return { reachable: false, modelLoaded: false };
  }
}

module.exports = { predictWithML, demoPrediction, mlHealth };
