const mongoose = require("mongoose");

const topPredictionSchema = new mongoose.Schema(
  {
    classIndex: Number,
    code: String,
    name: String,
    probability: Number,
  },
  { _id: false }
);

const predictionSchema = new mongoose.Schema({
  image: { type: String, required: true }, // filename in uploads/
  originalName: String,
  predictedClass: { type: Number, required: true },
  diseaseCode: String,
  diseaseName: String,
  confidence: { type: Number, required: true }, // 0..1
  topPredictions: [topPredictionSchema],
  isDemo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Prediction", predictionSchema);
