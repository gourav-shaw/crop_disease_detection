"""
CropGuard AI — Python ML Service
Loads the trained Keras model ONCE at startup and serves predictions.

ACTIVE MODEL — Model 2 (from plant-village-disease-classification-acc-99-6.ipynb):
    EfficientNetB3 (ImageNet, include_top=False, pooling='max')
    -> BatchNormalization -> Dense(256, relu) -> Dropout(0.45) -> Dense(38, softmax).
    FULL PlantVillage (color): 38 classes, 14 crops, 54,305 images, random
    80/10/10 split (seed 123). Notebook-reported: test accuracy 99.71%,
    test loss 0.1268, validation 99.63% (TensorFlow 2.9.1, trained on Kaggle).
    Primary file (PREFERRED — modern format): model.keras
    Backup file: 'efficientnetb3-Plant Village Disease-99.71.h5' (full model, .h5)

PREVIOUS MODEL — Model 1 (kept as a documented swap-back option):
    EfficientNetV2B0, 29 classes, 192x192, plant_effnetv2b0_final.keras,
    test accuracy 96.10% on the fixed Plant Village Test folder.
    Swap-back also needs the Model 1 class/data files — see README.md.

CRITICAL — PREPROCESSING (do not "fix" this):
    BOTH models were trained on RAW 0-255 pixels with NO rescaling and NO
    /255, because EfficientNet models contain their own preprocessing inside
    the model. Feeding /255-scaled images would silently HURT accuracy.
    That is why PREPROCESS_SCALE defaults to "none".

CRITICAL — INPUT SIZE IS AUTO-DETECTED:
    After a model loads, INPUT_SIZE is overridden from model.input_shape
    (Model 2 = 224, Model 1 = 192). Swapping models needs ZERO config change.

CRITICAL — CLASS ORDER:
    classes.json holds the exact class order of the ACTIVE model (Model 2,
    38 classes). Never reorder it, or every prediction maps to the wrong
    disease name. A startup safety check (below) verifies the loaded model's
    output size against classes.json and falls back to DEMO mode on mismatch,
    so a wrong-model file can never silently mislabel predictions.

CONFIG (environment variables):
    MODEL_PATH       explicit path; if unset, existing files are tried in order
                     until one loads successfully and passes the class check:
                     ./model/efficientnetb3-Plant Village Disease-99.71.h5
                                                                 (Model 2 — primary;
                     its model.keras proved incompatible, saved under TF 2.9)
                     ./model/model.keras                       (Model 2, fallback)
                     ./model/plant_effnetv2b0_final.keras      (Model 1)
                     ./model/plant_mobilenetv2_final.keras
                     ./model/plant_effnetv2b0_best.keras       (Model 1 checkpoint)
                     then every other *.keras / *.h5 in ./model/ (excluding *weights*)
                     → Keep EXACTLY ONE model file in ./model/ (see README).
    INPUT_SIZE       fallback only (default 224); overridden by the loaded model.
    PREPROCESS_SCALE default: "none" — EfficientNet preprocesses internally.
                     ("divide255" exists only for models trained WITH /255.)
    PORT             default: 8000

IMPORTANT (Windows): use Python 3.12 — Python 3.13+ / 3.15 has no TensorFlow wheels yet.
    py -3.12 -m venv .venv
"""
import os
import json
import io

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Known model filenames, in lookup order (Model 2's .h5 first — its .keras
# file was saved under TF 2.9/Keras 2 and modern Keras cannot read it).
KNOWN_MODEL_NAMES = [
    "efficientnetb3-Plant Village Disease-99.71.h5",    # Model 2 — primary (.h5)
    "model.keras",                                       # Model 2 — fallback (.keras)
    "plant_effnetv2b0_final.keras",                      # Model 1 — final
    "plant_mobilenetv2_final.keras",                     # alt notebook build
    "plant_effnetv2b0_best.keras",                       # Model 1 — best checkpoint
]


def candidate_model_paths(base_dir=None):
    """All existing model files to try, in order: $MODEL_PATH, known
    filenames, then every other *.keras/*.h5 in ./model/ (excluding
    weights-only files)."""
    base_dir = base_dir or BASE_DIR
    env_path = os.environ.get("MODEL_PATH")
    if env_path:
        return [env_path]
    model_dir = os.path.join(base_dir, "model")
    paths = []
    for name in KNOWN_MODEL_NAMES:
        path = os.path.join(model_dir, name)
        if os.path.exists(path):
            paths.append(path)
    if os.path.isdir(model_dir):
        for f in sorted(os.listdir(model_dir)):
            path = os.path.join(model_dir, f)
            if (f.endswith(".keras") or f.endswith(".h5")) and "weights" not in f.lower() \
                    and path not in paths:
                paths.append(path)
    return paths


def resolve_model_path(base_dir=None):
    """First candidate path (for display); the primary expected path when
    no model file exists yet."""
    paths = candidate_model_paths(base_dir)
    if paths:
        return paths[0]
    return os.path.join(base_dir or BASE_DIR, "model", KNOWN_MODEL_NAMES[0])


MODEL_PATH = resolve_model_path()
INPUT_SIZE = int(os.environ.get("INPUT_SIZE", "224"))  # fallback only — auto-detected from the model
# EfficientNet models have built-in preprocessing — training used raw 0-255 pixels, so "none".
PREPROCESS_SCALE = os.environ.get("PREPROCESS_SCALE", "none")  # none | divide255
PORT = int(os.environ.get("PORT", "8000"))

# Load class metadata
with open(os.path.join(BASE_DIR, "classes.json"), "r", encoding="utf-8") as f:
    CLASSES = sorted(json.load(f), key=lambda c: c["index"])


def detect_input_size(loaded_model):
    """Read H (=W) from model.input_shape, handling tuple or list shapes."""
    try:
        shape = loaded_model.input_shape
        if isinstance(shape, list):
            shape = shape[0]
        if shape and len(shape) >= 3 and shape[1]:
            return int(shape[1])
    except Exception:  # noqa: BLE001
        pass
    return None


def detect_output_size(loaded_model):
    """Read the last dimension of model.output_shape (tuple or list)."""
    try:
        shape = loaded_model.output_shape
        if isinstance(shape, list):
            shape = shape[0]
        if shape and shape[-1]:
            return int(shape[-1])
    except Exception:  # noqa: BLE001
        pass
    return None


def try_load_model(tf, path):
    """Load one model file. Legacy .h5 files (saved by old TF/Keras) often
    fail on their stored optimizer/loss config under modern Keras, so on
    failure retry with compile=False — inference does not need the
    optimizer. Returns the loaded model, or raises the last error."""
    try:
        return tf.keras.models.load_model(path)
    except Exception:  # noqa: BLE001
        return tf.keras.models.load_model(path, compile=False)


# Load model once at startup (heavy — never per-request). Every candidate
# file is tried in order; the first one that loads AND whose output size
# matches classes.json wins — a broken or wrong file never blocks the rest.
model = None
try:
    import tensorflow as tf  # imported lazily so /health still works without TF for debugging
    candidates = candidate_model_paths()
    if not candidates:
        print("⚠️  No model file found in ./model — running in DEMO mode.")
    for path in candidates:
        print(f"Trying model file: {path}")
        try:
            loaded = try_load_model(tf, path)
        except Exception as e:  # noqa: BLE001
            print(f"⚠️  Could not load {os.path.basename(path)} ({e}) — trying next file.")
            continue

        # --- SAFETY VALIDATION: model outputs must match classes.json ---
        n_out = detect_output_size(loaded)
        if n_out is not None and n_out != len(CLASSES):
            print("=" * 78)
            print(f"⚠️⚠️⚠️  MODEL/CLASS MISMATCH: {os.path.basename(path)} outputs {n_out} values "
                  f"but classes.json has {len(CLASSES)} — wrong model's file; trying next file / DEMO mode")
            print("=" * 78)
            continue

        model = loaded
        MODEL_PATH = path
        # --- AUTO-DETECT input size from the loaded model ---
        detected = detect_input_size(model)
        if detected:
            INPUT_SIZE = detected
            print(f"input size set from model: {INPUT_SIZE}")
        print(f"✅ Model loaded: {MODEL_PATH} | classes: {len(CLASSES)} | "
              f"input size: {INPUT_SIZE} | preprocess: {PREPROCESS_SCALE} (raw 0-255 pixels)")
        break
    if model is None and candidates:
        print("⚠️  No candidate model file could be loaded — running in DEMO mode.")
except Exception as e:  # noqa: BLE001
    print(f"⚠️  Could not load model ({e}) — running in DEMO mode.")
    model = None


def demo_prediction(seed: int = 0):
    """Deterministic-ish demo probabilities when no model is loaded."""
    rng = np.random.default_rng(seed % (2**32))
    predicted = int(rng.integers(0, len(CLASSES)))
    confidence = float(rng.uniform(0.82, 0.96))
    rest = rng.random(len(CLASSES))
    rest[predicted] = 0
    rest = rest / rest.sum() * (1 - confidence)
    probs = [float(rest[i]) for i in range(len(CLASSES))]
    probs[predicted] = confidence
    return build_response(probs, is_demo=True)


def build_response(probs, is_demo=False):
    probs = [float(p) for p in probs]
    predicted = int(np.argmax(probs))
    top = sorted(
        (
            {
                "classIndex": i,
                "code": CLASSES[i]["code"],
                "name": CLASSES[i]["name"],
                "probability": round(probs[i], 4),
            }
            for i in range(len(CLASSES))
        ),
        key=lambda x: x["probability"],
        reverse=True,
    )
    return {
        "predictedClass": predicted,
        "confidence": round(probs[predicted], 4),
        "topPredictions": top,
        "isDemo": is_demo,
    }


def preprocess(file_bytes: bytes):
    # Matches training exactly: resize to the model's input size (auto-detected:
    # 224 for Model 2, 192 for Model 1) and feed RAW 0-255 float pixels.
    # EfficientNet normalises internally — no /255 by default.
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img = img.resize((INPUT_SIZE, INPUT_SIZE))
    arr = np.array(img, dtype=np.float32)
    if PREPROCESS_SCALE == "divide255":
        arr = arr / 255.0
    return np.expand_dims(arr, axis=0)  # (1, H, W, 3)


@app.get("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "modelLoaded": model is not None,
            "modelPath": MODEL_PATH,
            "classes": CLASSES,
            "inputSize": INPUT_SIZE,
            "preprocessScale": PREPROCESS_SCALE,
        }
    )


@app.post("/predict")
def predict():
    if "image" not in request.files:
        return jsonify({"message": "No image file. Send multipart field 'image'."}), 400
    file_bytes = request.files["image"].read()
    if not file_bytes:
        return jsonify({"message": "Empty image file."}), 400

    if model is None:
        return jsonify(demo_prediction(seed=len(file_bytes)))

    try:
        batch = preprocess(file_bytes)
        preds = model.predict(batch, verbose=0)
        probs = np.asarray(preds)[0].tolist()
        if len(probs) != len(CLASSES):
            return jsonify({"message": f"Model outputs {len(probs)} classes but classes.json has {len(CLASSES)}"}), 500
        return jsonify(build_response(probs, is_demo=False))
    except Exception as e:  # noqa: BLE001
        return jsonify({"message": f"Prediction failed: {e}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
