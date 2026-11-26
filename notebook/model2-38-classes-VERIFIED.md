# Model 2 — verified 38-class order (from the uploaded notebook)

Source notebook: `plant-village-disease-classification-acc-99-6.ipynb`
(uploaded by Gourav 2026-11-07 09:26 UTC; copy kept in this project's `notebook/` folder)
Verified 2026-11-07 by reading the notebook JSON directly — class order taken from the
classification-report output (cell 33), which lists `test_gen.class_indices` keys in order.
`flow_from_dataframe` sorts classes alphabetically, so this IS the model's output order.
Never reorder: output index N must map to class N below, in `ml-service/classes.json`,
`frontend/src/data/diseases.js` and `backend/src/utils/diseaseInfo.js` alike.

## Model facts (all from the notebook itself)
- Architecture: EfficientNetB3 (ImageNet, include_top=False, pooling='max') -> BatchNormalization
  -> Dense(256, relu, L2 0.016 / L1 0.006) -> Dropout(0.45) -> Dense(38, softmax)
- Optimizer: Adamax, lr 0.001; 10 epochs; training took 2h 33m (Kaggle)
- Input: 224x224 RGB. Preprocessing: RAW 0-255 pixels, NO rescaling, NO /255
  (`ImageDataGenerator(preprocessing_function=scalar)` where scalar returns the image unchanged;
  only horizontal_flip=True augmentation on train). So PREPROCESS_SCALE must stay "none".
- Dataset: Kaggle `plantvillage-dataset/color` (full PlantVillage, colour version)
- Split: random stratified 80/10/10, seed 123 — train 43,444 / val 5,430 / test 5,431 (total 54,305)
- Scores (notebook outputs, cell 29): test accuracy 0.99705 (99.71%), test loss 0.1268,
  validation 0.99632 (99.63%), train 0.99949. Classification report rounds to 1.00 per class.
- Saved files: `efficientnetb3-Plant Village Disease-99.71.h5` (cell 35, full model)
  + `efficientnetb3-Plant Village Disease-weights.h5` (weights ONLY — do not load as a model)
  + `model.keras` (cell 38, `model.save("model.keras")`) — preferred file; see warning below.
- Notebook environment: `!pip install tensorflow==2.9.1`, Python 3.7 era. The .keras file was
  saved by Keras 2.9 — TEST that it loads under the laptop's modern TensorFlow (Python 3.12)
  before trusting it; if `load_model("model.keras")` fails, fall back to the .h5 file.

## ⚠️ Do NOT compare 99.71% directly with Model 1's 96.10%
Model 1 was scored on the FIXED Plant Village Test folder (1,358 images); Model 2 on its own
random 80/10/10 split (5,431 test images, seed 123). Different test sets — say so in the viva,
or a teacher will catch it. Model 2 also covers 5 more crops, so the task is broader.

## The 38 classes, in exact model-output order
Folder-name spelling is kept verbatim (note the quirks — they are the folder names).

| idx | folder name (verbatim) | display name |
|----:|------------------------|--------------|
| 0 | Apple___Apple_scab | Apple — Apple Scab |
| 1 | Apple___Black_rot | Apple — Black Rot |
| 2 | Apple___Cedar_apple_rust | Apple — Cedar Apple Rust |
| 3 | Apple___healthy | Apple — Healthy |
| 4 | Blueberry___healthy | Blueberry — Healthy |
| 5 | Cherry_(including_sour)___Powdery_mildew | Cherry — Powdery Mildew |
| 6 | Cherry_(including_sour)___healthy | Cherry — Healthy |
| 7 | Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot | Corn (Maize) — Cercospora Leaf Spot / Gray Leaf Spot |
| 8 | Corn_(maize)___Common_rust_ | Corn (Maize) — Common Rust |
| 9 | Corn_(maize)___Northern_Leaf_Blight | Corn (Maize) — Northern Leaf Blight |
| 10 | Corn_(maize)___healthy | Corn (Maize) — Healthy |
| 11 | Grape___Black_rot | Grape — Black Rot |
| 12 | Grape___Esca_(Black_Measles) | Grape — Esca (Black Measles) |
| 13 | Grape___Leaf_blight_(Isariopsis_Leaf_Spot) | Grape — Leaf Blight (Isariopsis Leaf Spot) |
| 14 | Grape___healthy | Grape — Healthy |
| 15 | Orange___Haunglongbing_(Citrus_greening) | Orange — Huanglongbing (Citrus Greening) |
| 16 | Peach___Bacterial_spot | Peach — Bacterial Spot |
| 17 | Peach___healthy | Peach — Healthy |
| 18 | Pepper,_bell___Bacterial_spot | Bell Pepper — Bacterial Spot |
| 19 | Pepper,_bell___healthy | Bell Pepper — Healthy |
| 20 | Potato___Early_blight | Potato — Early Blight |
| 21 | Potato___Late_blight | Potato — Late Blight |
| 22 | Potato___healthy | Potato — Healthy |
| 23 | Raspberry___healthy | Raspberry — Healthy |
| 24 | Soybean___healthy | Soybean — Healthy |
| 25 | Squash___Powdery_mildew | Squash — Powdery Mildew |
| 26 | Strawberry___Leaf_scorch | Strawberry — Leaf Scorch |
| 27 | Strawberry___healthy | Strawberry — Healthy |
| 28 | Tomato___Bacterial_spot | Tomato — Bacterial Spot |
| 29 | Tomato___Early_blight | Tomato — Early Blight |
| 30 | Tomato___Late_blight | Tomato — Late Blight |
| 31 | Tomato___Leaf_Mold | Tomato — Leaf Mold |
| 32 | Tomato___Septoria_leaf_spot | Tomato — Septoria Leaf Spot |
| 33 | Tomato___Spider_mites Two-spotted_spider_mite | Tomato — Spider Mites (Two-spotted Spider Mite) |
| 34 | Tomato___Target_Spot | Tomato — Target Spot |
| 35 | Tomato___Tomato_Yellow_Leaf_Curl_Virus | Tomato — Tomato Yellow Leaf Curl Virus |
| 36 | Tomato___Tomato_mosaic_virus | Tomato — Tomato Mosaic Virus |
| 37 | Tomato___healthy | Tomato — Healthy |

## What changed vs Model 1 (29 classes, 9 crops)
- 5 NEW crops (1 class each, all Healthy except where noted): Blueberry, Orange
  (Huanglongbing — diseased), Raspberry, Soybean, Squash (Powdery Mildew — diseased).
- 4 NEW Tomato diseases: Leaf Mold, Spider Mites, Target Spot, Mosaic Virus.
- Order flips vs Model 1 (alphabetical now wins): Cherry Powdery Mildew BEFORE Healthy;
  Potato Healthy AFTER Late Blight (was between Early and Late); Grape Healthy AFTER
  Leaf Blight; Corn Healthy AFTER Northern Leaf Blight; Strawberry Leaf Scorch BEFORE Healthy.
- Renames: "Bell Pepper" is now folder `Pepper,_bell`; Corn Cercospora folder carries the
  suffix `Gray_leaf_spot`; Orange folder misspells it `Haunglongbing` (display as Huanglongbing).

## Integration checklist (state at verification, 2026-11-07 ~09:29 UTC)
- DONE by the main agent: notebook copied to `notebook/`; Model 1 files backed up as
  `classes.model1-29.json`, `diseases.model1-29.js`, `diseaseInfo.model1-29.js`;
  `ml-service/app.py` rewritten for Model 2 (model.keras first, .h5 backup, input size
  auto-detected from the model, output-size safety check vs classes.json).
- STILL TO DO at that check: replace `ml-service/classes.json` (still 29 classes),
  `frontend/src/data/diseases.js`, `backend/src/utils/diseaseInfo.js`, frontend pages
  (Home/Detect/Dashboard/Diseases/About still say 29 classes / 96.10% / 192), README, and
  rebuild the zip. Keep Model 1 numbers on the About page as a comparison table, not overwritten.
- STILL MISSING: the model file itself. `ml-service/model/` holds only a README — no
  .keras or .h5 yet. Gourav said (09:28 UTC) he has the .keras file; he needs to upload
  `model.keras` (preferred) or the .h5 here before the app can be tested end-to-end.
  Keep EXACTLY ONE model file in `ml-service/model/` (never the weights-only file).
- After upload: start the ML service, check `localhost:8000/health` shows
  `modelLoaded: true`, 38 classes, inputSize 224 — then test one dataset Test-folder image
  and one of his Google field photos, and compare Top-5 before calling it done.
