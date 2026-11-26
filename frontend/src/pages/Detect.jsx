import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { predictImage } from "../api";
import { getDiseaseById, severityStyles, DISEASES } from "../data/diseases";

export default function Detect() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Overview");
  const inputRef = useRef();

  const pick = (f) => {
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError("");
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const data = await predictImage(file);
      setResult(data.prediction || data);
    } catch (e) {
      setError(e?.response?.data?.message || "Prediction failed. Is the backend running on port 5000?");
    } finally { setLoading(false); }
  };

  const disease = result ? getDiseaseById(result.predictedClass) : null;
  // Chart shows only the TOP 5 of the 38 class probabilities (backend returns all 38, sorted)
  const chartData = (result?.topPredictions || []).slice(0, 5).map((p) => ({
    name: p.code, probability: +(p.probability * 100).toFixed(1),
    fill: DISEASES[p.classIndex]?.color || "#22c55e",
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl font-black text-emerald-950">Detect Disease 🔍</h1>
      <p className="text-emerald-900/60 mt-2">Upload a clear, well-lit leaf photo — the model covers 14 crops (apple, tomato, potato, grape &amp; more) and 38 classes.</p>

      <div className="grid lg:grid-cols-2 gap-8 mt-8 items-start">
        {/* Upload card */}
        <div className="bg-white rounded-3xl border border-emerald-100 card-shadow p-6">
          <div
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            className={`border-2 border-dashed rounded-3xl min-h-[320px] flex flex-col items-center justify-center cursor-pointer transition overflow-hidden ${drag ? "border-lime-500 bg-lime-50" : "border-emerald-200 bg-[#FFFBEB] hover:border-emerald-400"}`}
          >
            {preview ? (
              <img src={preview} alt="Leaf preview" className="w-full h-[320px] object-cover" />
            ) : (
              <div className="text-center p-8">
                <div className="text-6xl">🍃</div>
                <div className="font-bold text-lg mt-4 text-emerald-950">Drag & drop your leaf image</div>
                <div className="text-sm text-emerald-900/50 mt-1">or click to browse · JPG, PNG, WebP · max 8 MB</div>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0])} />
          {file && <div className="mt-3 text-sm font-semibold text-emerald-800 truncate">📄 {file.name} · {(file.size / 1024).toFixed(0)} KB</div>}
          <button onClick={analyze} disabled={!file || loading}
            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-extrabold text-lg shadow-lg shadow-emerald-600/25 disabled:opacity-40 hover:opacity-95 transition">
            {loading ? "Analysing leaf…" : "🌱 Analyze Leaf"}
          </button>
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-3 text-emerald-700 font-semibold">
              <span className="animate-bounce text-2xl">🍃</span> Running AI model… please wait
            </div>
          )}
          {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-semibold">{error}</div>}
          <div className="mt-5 bg-emerald-50 rounded-2xl p-4 text-xs text-emerald-900/70 leading-relaxed">
            <b>Tips for best accuracy:</b> one leaf per photo, plain background, no blur, daylight or bright light, leaf filling most of the frame.
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && disease ? (
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl border border-emerald-100 card-shadow p-6">
              {result.isDemo && (
                <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-2xl px-4 py-3 text-sm font-bold">
                  ⚠️ Demo Mode — ML service / model not connected, so this is a sample prediction. Start ml-service with model.keras (Model 2 — EfficientNetB3) in ml-service/model/ for real results.
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold tracking-widest text-emerald-600">PREDICTED DISEASE</div>
                  <h2 className="font-display text-3xl font-black text-emerald-950 mt-1 leading-tight">{disease.name}</h2>
                  <div className="text-sm font-semibold text-emerald-900/50 mt-1">{disease.emoji} Crop: {disease.crop} · Condition: {disease.disease}</div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold">{disease.code}</span>
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${severityStyles[disease.severity]}`}>Severity: {disease.severity}</span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <div className="font-display text-4xl font-black" style={{ color: disease.color }}>{(result.confidence * 100).toFixed(1)}%</div>
                  <div className="text-[11px] font-bold text-emerald-900/50 tracking-wider">CONFIDENCE</div>
                </div>
              </div>
              <div className="mt-4 h-3.5 bg-emerald-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence * 100}%` }} transition={{ duration: 0.9 }} className="h-full rounded-full" style={{ background: disease.color }} />
              </div>

              <h3 className="font-bold mt-7 mb-2 text-emerald-950">Top 5 predictions <span className="text-emerald-900/40 font-semibold text-sm">(of 38 classes)</span></h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={12} />
                    <YAxis type="category" dataKey="name" width={88} fontSize={11} fontWeight={700} />
                    <Tooltip formatter={(v) => [`${v}%`, "Probability"]} />
                    <Bar dataKey="probability" radius={[0, 8, 8, 0]}>
                      {chartData.map((c, i) => <Cell key={i} fill={c.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-2 mt-6 border-b border-emerald-100 overflow-x-auto">
                {["Overview", "Symptoms", "Treatment", "Prevention"].map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-bold text-sm whitespace-nowrap border-b-2 -mb-px ${tab === t ? "border-emerald-600 text-emerald-700" : "border-transparent text-emerald-900/45"}`}>{t}</button>
                ))}
              </div>
              <div className="pt-4 text-sm leading-relaxed text-emerald-950/80">
                {tab === "Overview" && <><p>{disease.description}</p><p className="mt-3"><b>Causal agent:</b> {disease.causalAgent}</p></>}
                {tab === "Symptoms" && <ul className="list-disc pl-5 space-y-1.5">{disease.symptoms.map((s) => <li key={s}>{s}</li>)}</ul>}
                {tab === "Treatment" && <ul className="list-disc pl-5 space-y-1.5">{disease.treatment.map((s) => <li key={s}>{s}</li>)}</ul>}
                {tab === "Prevention" && <ul className="list-disc pl-5 space-y-1.5">{disease.prevention.map((s) => <li key={s}>{s}</li>)}</ul>}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden lg:flex bg-gradient-to-br from-emerald-700 to-[#052e16] leaf-pattern rounded-3xl text-white p-10 min-h-[420px] flex-col justify-center">
              <div className="text-6xl">🧠</div>
              <h2 className="font-display text-3xl font-black mt-5 text-color">Your result will appear here</h2>
              <p className="text-color font-semibold mt-3 leading-relaxed">Predicted disease, confidence score, top-5 probability chart out of all 38 classes, plus symptoms, treatment and prevention — all in one panel.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
