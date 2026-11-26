# Place your trained model here — EXACTLY ONE file

**Rule: this folder holds exactly ONE model file at a time.** Two model files side by
side make the loader's choice ambiguous. Park any spare model in a `model-backups/`
folder OUTSIDE this folder (project root works).

## ACTIVE — Model 2 (EfficientNetB3, 38 classes) ✅

Copy the Model 2 file here, keeping its name:

```
model.keras                                        ← PREFERRED (from the Kaggle notebook's Output)
efficientnetb3-Plant Village Disease-99.71.h5      ← backup option (spaces in the name are fine)
```

Download it from the Kaggle notebook
(`notebook/plant-village-disease-classification-acc-99-6.ipynb`) → **Output / Files**
panel of the run. Then restart the ML service and check
`http://localhost:8000/health` → `modelLoaded: true`, `inputSize: 224`.

## Swap-back — Model 1 (EfficientNetV2B0, 29 classes)

```
plant_effnetv2b0_final.keras   (best-epoch checkpoint: plant_effnetv2b0_best.keras)
```

A model swap ALSO needs the matching class/data files — `classes.json` here in
`ml-service/`, `backend/src/utils/diseaseInfo.js` and `frontend/src/data/diseases.js`.
The Model 1 versions are kept next to each as `*.model1-29.*` backups.
Full steps: see the project README → "Switching models".

## How the loader picks a file

1. `$MODEL_PATH` env var, if set
2. `model.keras` ← Model 2, preferred
3. `efficientnetb3-Plant Village Disease-99.71.h5` ← Model 2, backup
4. `plant_effnetv2b0_final.keras`, `plant_mobilenetv2_final.keras`, `plant_effnetv2b0_best.keras`
5. otherwise the first `*.keras` / `*.h5` in this folder (files with `weights` in the
   name are skipped — a weights-only file is not a full model)

After loading, the service **auto-detects the input size** from the model
(224 = Model 2, 192 = Model 1) and **validates the model's output size against
classes.json** — on mismatch it refuses to serve predictions and falls back to
demo mode with a loud `MODEL/CLASS MISMATCH` warning in the log.
