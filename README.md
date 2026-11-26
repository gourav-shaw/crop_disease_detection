# CropGuard AI — Crop Disease Detection

A full-stack web application that identifies crop diseases from a leaf photograph. A user uploads a leaf image, a deep-learning model classifies it into one of **38 disease/healthy classes across 14 crops**, and the app shows the prediction with confidence, disease information and treatment suggestions. Past predictions are stored and can be browsed in a history dashboard.

> College project — B.Tech CSE (AI & ML), IEM Kolkata.

## Features

- 📷 Upload a leaf photo and get an instant disease prediction with confidence score
- 🌿 38 classes covering 14 crops (apple, corn, grape, potato, tomato, and more)
- 💊 Disease details with treatment and prevention suggestions
- 🕘 Prediction history saved in MongoDB
- 🛟 **Demo mode** — the ML service falls back to sample predictions when no model file is present, so the full app can be tried without the model weights
- 🚀 Deployment-ready: Render blueprint (`render.yaml`) and a step-by-step guide in `DEPLOY.md`

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express, Mongoose |
| ML service | Python, Flask, ONNX Runtime (a TensorFlow/Keras variant is also included) |
| Database | MongoDB (Atlas or local) |
| Model | EfficientNetB3, 224×224 input, trained on the PlantVillage dataset |

## Architecture

```
[ React frontend ]  ──HTTP──▶  [ Express backend ]  ──HTTP──▶  [ Flask ML service ]
                                   │                                 │
                                   ▼                                 ▼
                              [ MongoDB ]              [ EfficientNetB3 (ONNX) ]
```

## The model

- **Architecture:** EfficientNetB3 (transfer learning), input size 224×224, raw 0–255 pixel values
- **Classes:** 38 (see `ml-service/classes.json` — the class order is fixed and must not be reordered)
- **Training notebooks:** in the [`notebook/`](notebook/) folder. The main notebook reports 99.71% accuracy on its random test split.
- **Known limitation:** PlantVillage images are lab-condition photos (single leaf, plain background). Accuracy on real field photos is noticeably lower — this domain shift is the main limitation of the project and a direction for future work (field-image fine-tuning and data augmentation).
- **Model files are not in this repo** (they are ~45 MB). The ML service runs in demo mode without them; see [`ml-service/model/README.md`](ml-service/model/README.md) for where to place `model.keras` / `model.onnx`.

## Run it locally

You need Node.js, Python 3.11/3.12 and MongoDB (a free [Atlas](https://www.mongodb.com/atlas) cluster works).

**1. ML service** (port 5001)

```bash
cd ml-service
pip install -r requirements-onnx.txt   # ONNX version (lightweight, recommended)
python app_onnx.py
# or, for the TensorFlow version:  pip install -r requirements.txt  &&  python app.py
```

**2. Backend** (port 5000)

```bash
cd backend
cp .env.example .env        # fill in MONGODB_URI and ML_SERVICE_URL
npm install
npm start
```

**3. Frontend** (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Health check: `GET http://localhost:5001/health` reports whether the real model is loaded or the service is in demo mode.

## Deployment

The repo includes a Render blueprint (`render.yaml`) that creates both the ML service and the web app, plus a free-tier deployment walkthrough in [`DEPLOY.md`](DEPLOY.md).

## Project structure

```
├── frontend/     React + Vite + Tailwind UI
├── backend/      Express API (routes, uploads, history)
├── ml-service/   Flask inference service (ONNX + TF variants)
├── notebook/     Model training notebooks (Colab)
├── render.yaml   Render deployment blueprint
└── DEPLOY.md     Free-tier deployment guide
```

## Author

**Gourav Shaw** — B.Tech CSE (AI & ML), Institute of Engineering & Management, Kolkata
GitHub: [@gourav-shaw](https://github.com/gourav-shaw)
