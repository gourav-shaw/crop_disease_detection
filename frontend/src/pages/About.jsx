import { DISEASES, CROPS, MODEL_INFO } from "../data/diseases";

const COMPARE_ROWS = [
  ["Architecture", "EfficientNetB3 + BatchNorm + Dense 256 + Dropout 0.45"],
  ["Input size", "224 × 224"],
  ["Classes / crops", "38 classes · 14 crops"],
  ["Parameters", "11.19M"],
  ["Test accuracy", "99.71% (notebook-reported)"],
  ["Test split", "Random stratified 10% of the same image pool"],
  ["Dataset images", "54,305 (full PlantVillage, color)"],
  ["Trained with", "TensorFlow 2.9.1 on Kaggle · Adamax, 10 epochs"],
  ["Model file", "model.keras (backup: efficientnetb3-Plant Village Disease-99.71.h5)"],
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl font-black text-emerald-950">About This Project</h1>
      <p className="text-emerald-900/60 mt-3 leading-relaxed">CropGuard AI is a full-stack college project that classifies leaf images from 14 crops into 38 health categories (26 diseases + 12 healthy) using a trained EfficientNetB3 Keras model, served through a modern 3-service architecture. The active model EfficientNetB3 reached <b className="text-emerald-800">99.71% test accuracy</b> (notebook-reported) on the full PlantVillage dataset.</p>

      {/* Architecture */}
      <section className="bg-white rounded-3xl border border-emerald-100 card-shadow p-7 mt-8">
        <h2 className="font-display text-2xl font-black text-emerald-950">System Architecture</h2>
        <p className="text-sm text-emerald-900/60 mt-2">A <b>Keras model cannot run in Node.js</b> — it needs Python/TensorFlow. So the system is split into three parts that talk over HTTP:</p>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-6 text-center">
          {[
            ["⚛️ React Frontend", "Port 5173\nUpload · Results · Charts"],
            ["🟢 Node.js API", "Port 5000\nExpress · Multer · Mongoose"],
            ["🐍 Python ML Service", "Port 8000\nFlask · TensorFlow/Keras"],
            ["🍃 MongoDB", "Port 27017\nPrediction history & stats"],
          ].map(([t, d], i, arr) => (
            <div key={t} className="flex flex-col md:flex-row items-center gap-3 flex-1">
              <div className="flex-1 w-full bg-gradient-to-br from-emerald-50 to-lime-50 border border-emerald-200 rounded-2xl px-4 py-5">
                <div className="font-extrabold text-emerald-900">{t}</div>
                <div className="text-xs text-emerald-900/55 mt-1.5 whitespace-pre-line">{d}</div>
              </div>
              {i < arr.length - 1 && <div className="text-emerald-500 font-black text-xl rotate-90 md:rotate-0">→</div>}
            </div>
          ))}
        </div>
        <ol className="list-decimal pl-5 mt-6 space-y-1.5 text-sm text-emerald-950/75">
          <li>User uploads a leaf image in React.</li>
          <li>Node backend saves the image (Multer), forwards it to the Python ML service.</li>
          <li>ML service resizes the image to the model's own input size (auto-detected at startup — 224×224 for Model 2), feeds it as raw 0–255 pixels (the model preprocesses internally) and runs <code>model.keras</code>, returning all 38 class probabilities.</li>
          <li>Backend stores the prediction in MongoDB and returns the full result to React.</li>
          <li>If the ML service/model is unavailable — or the loaded model's output size doesn't match the 38 classes — the backend returns a clearly-flagged <b>demo prediction</b> so the showcase never breaks or mislabels.</li>
        </ol>
      </section>

      {/* Model + Dataset */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <section className="bg-white rounded-3xl border border-emerald-100 card-shadow p-7">
          <h2 className="font-display text-2xl font-black text-emerald-950">🧠 EfficientNetB3 Model — active</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><b>Model file:</b> {MODEL_INFO.fileName} → place it in <code className="bg-emerald-50 px-1.5 py-0.5 rounded">ml-service/model/</code> — keep ONLY that one file in the folder. The .h5 version ({MODEL_INFO.altFileName}) is the backup if the .keras ever fails to load.</li>
            <li><b>Architecture:</b> {MODEL_INFO.architecture}</li>
            <li><b>Parameters:</b> {MODEL_INFO.params}</li>
            <li><b>Test accuracy:</b> {MODEL_INFO.testAccuracy} · <b>Validation:</b> {MODEL_INFO.validationAccuracy} · <b>Train:</b> {MODEL_INFO.trainAccuracy} · <b>Test loss:</b> {MODEL_INFO.testLoss}</li>
            <li><b>Input size:</b> {MODEL_INFO.inputSize}</li>
            <li><b>Preprocessing:</b> {MODEL_INFO.preprocessing}</li>
            <li><b>Training:</b> {MODEL_INFO.training}</li>
            <li><b>Framework:</b> {MODEL_INFO.framework}</li>
            <li><b>Classes:</b> {MODEL_INFO.classes} classes across {MODEL_INFO.crops} crops</li>
          </ul>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs leading-relaxed text-amber-800">
            <b>Preprocessing trap (classic viva question):</b> this model must be fed <b>raw 0–255 pixels</b>. EfficientNetB3 already contains its own rescaling/normalisation layers, so dividing by 255 in the ML service would silently <i>reduce</i> accuracy. Training used an identity preprocessing function with no rescale — inference must match training exactly.
          </div>
        </section>
        <section className="bg-white rounded-3xl border border-emerald-100 card-shadow p-7">
          <h2 className="font-display text-2xl font-black text-emerald-950">📦 The Dataset</h2>
          <p className="mt-4 text-sm leading-relaxed text-emerald-950/75">{MODEL_INFO.dataset}. It covers 14 crops — {CROPS.join(", ")} — with 38 classes: 26 diseases and 12 healthy classes. The training notebook is kept in the project at <code className="bg-emerald-50 px-1.5 py-0.5 rounded">notebook/plant-village-disease-classification-acc-99-6.ipynb</code>.</p>
          <a href="https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset/data" target="_blank" rel="noreferrer"
            className="inline-block mt-4 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800">Open Dataset on Kaggle ↗</a>
          <div className="mt-5 space-y-3 max-h-80 overflow-y-auto pr-1">
            {CROPS.map((crop) => (
              <div key={crop}>
                <div className="text-sm font-extrabold text-emerald-950">{DISEASES.find((d) => d.crop === crop).emoji} {crop}</div>
                <div className="mt-1 space-y-1">
                  {DISEASES.filter((d) => d.crop === crop).map((d) => (
                    <div key={d.id} className="flex items-center gap-2.5 text-[13px] font-semibold pl-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-emerald-950/80">{d.disease}</span>
                      {d.healthy && <span className="text-[10px] font-extrabold text-green-600">HEALTHY</span>}
                      <span className="text-emerald-900/35 text-[11px]">({d.code})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Model details */}
      <section className="bg-white rounded-3xl border border-emerald-100 card-shadow p-7 mt-6">
        <h2 className="font-display text-2xl font-black text-emerald-950">🧠 Model 2 — EfficientNetB3</h2>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-emerald-100">
                <th className="py-2 pr-3 font-extrabold text-emerald-950"> </th>
                <th className="py-2 pr-3 font-extrabold text-emerald-700">Model 2 — EfficientNetB3 ✅ active</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(([label, model]) => (
                <tr key={label} className="border-b border-emerald-50 align-top">
                  <td className="py-2 pr-3 font-bold text-emerald-950/70 whitespace-nowrap">{label}</td>
                  <td className="py-2 pr-3 text-emerald-950/85">{model}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-gradient-to-br from-emerald-700 to-[#052e16] leaf-pattern rounded-3xl text-white p-7 mt-6">
        <h2 className="font-display text-2xl font-black">🎓 Viva talking points</h2>
        <ul className="list-disc pl-5 mt-3 space-y-1.5 text-sm text-emerald-100/85">
          <li>Why 3 services? Keras/TensorFlow runs only in Python; Node handles the web API; React handles UI — separation of concerns.</li>
          <li>Transfer learning: an ImageNet-pretrained EfficientNetB3 backbone already knows textures/edges, so it reaches very high accuracy with far less data and compute than training from scratch.</li>
          <li>Model 2 regularisation: BatchNormalization after the backbone, a Dense(256) layer with L2 + L1 regularisers and Dropout 0.45 — aimed at closing the train/test gap on 54k images.</li>
          <li>Preprocessing must match training: raw 0–255 input and NO /255 — EfficientNet has preprocessing built in; double-scaling is a silent accuracy killer. Input size is read from the model itself at startup (224 vs 192), so swapping models needs no code change.</li>
          <li>Class order matters: the model's output index must match classes.json (the notebook's class_indices order), or every prediction is silently wrong. The ML service even refuses to serve a model whose output size doesn't match the class list — it falls back to demo mode instead of mislabelling.</li>
          <li>Evaluation honesty: Model 2's 99.71% is on a random split of the same pool; Model 1's 96.10% is on a separate Test folder — quoting both without that caveat would be misleading.</li>
          <li>Demo fallback guarantees the demo works even without the model file — graceful degradation.</li>
          <li>Future work: evaluate both models on one shared field-photo test set, Grad-CAM explainability, TFLite mobile app, confidence thresholding (“uncertain — consult an expert”).</li>
        </ul>
      </section>
    </div>
  );
}
