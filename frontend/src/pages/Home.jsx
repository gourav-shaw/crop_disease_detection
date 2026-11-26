import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DISEASES, CROPS } from "../data/diseases";

// Group the 38 classes by crop, preserving notebook class order
const BY_CROP = CROPS.map((crop) => ({ crop, classes: DISEASES.filter((d) => d.crop === crop) }));

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55 } };

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#052e16] leaf-pattern text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold text-lime-300">🌿 AI for Smart Farming</span>
            <h1 className="font-display text-5xl md:text-6xl font-black leading-[1.05] mt-6">
              Detect crop disease<br />from a <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-emerald-300">single leaf photo</span>
            </h1>
            <p className="mt-5 text-emerald-100/80 text-lg leading-relaxed max-w-lg">Upload a leaf image and our EfficientNetB3 deep-learning model instantly classifies it into 38 categories across 14 crops — with confidence, symptoms, treatment and prevention guidance.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/detect" className="px-7 py-3.5 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 text-emerald-950 font-extrabold shadow-xl shadow-lime-500/20 hover:scale-[1.02] transition">🔍 Detect Disease</Link>
              <Link to="/diseases" className="px-7 py-3.5 rounded-full bg-white/10 border border-white/25 font-bold hover:bg-white/15">Browse Diseases</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="hidden md:block">
            <div className="glass rounded-[2rem] p-6 text-emerald-950 card-shadow rotate-2 hover:rotate-0 transition duration-500">
              <div className="h-52 rounded-2xl bg-gradient-to-br from-emerald-100 via-lime-100 to-amber-50 flex items-center justify-center text-8xl">🍃</div>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">Tomato — Late Blight</div>
                  <div className="text-sm text-emerald-800/60">TOM-LBLT · Severity: High</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-black text-emerald-700">96.4%</div>
                  <div className="text-xs font-semibold text-emerald-800/50">CONFIDENCE</div>
                </div>
              </div>
              <div className="mt-3 h-3 bg-emerald-100 rounded-full overflow-hidden"><div className="h-full w-[96%] bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full" /></div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="bg-emerald-50 rounded-xl py-2">Late Blight 96%</div>
                <div className="bg-emerald-50/60 rounded-xl py-2 text-emerald-900/50">Early Blight 2%</div>
                <div className="bg-emerald-50/60 rounded-xl py-2 text-emerald-900/50">Healthy 1%</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["38", "Classes (14 crops)"], ["99.71%", "Test Accuracy"], ["54,305", "Dataset Images"], ["224×224", "Model Input Size"]].map(([v, l], i) => (
            <motion.div key={l} {...fade} transition={{ delay: i * 0.08 }} className="bg-white rounded-2xl p-5 text-center card-shadow border border-emerald-100">
              <div className="font-display text-3xl font-black text-emerald-700">{v}</div>
              <div className="text-sm font-semibold text-emerald-900/50 mt-1">{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div {...fade} className="text-center">
          <h2 className="font-display text-4xl font-black text-emerald-950">How it works</h2>
          <p className="text-emerald-900/60 mt-2">Three steps from photo to diagnosis</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            ["📸", "1. Upload a leaf photo", "Drag & drop or click to upload a clear leaf image — apple, tomato, potato, grape and 10 more crops (JPG / PNG / WebP)."],
            ["🧠", "2. AI model analyses it", "The image is sent to a Python ML service that runs your trained model (.keras / .h5) and returns class probabilities."],
            ["💊", "3. Get full guidance", "See the predicted disease, confidence chart, symptoms, treatment steps and prevention tips instantly."],
          ].map(([icon, title, desc], i) => (
            <motion.div key={title} {...fade} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-7 border border-emerald-100 card-shadow hover:-translate-y-1 transition">
              <div className="text-4xl">{icon}</div>
              <h3 className="font-bold text-lg mt-4 text-emerald-950">{title}</h3>
              <p className="text-emerald-800 text-sm mt-2 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DISEASE CLASSES — grouped by crop */}
      <section className="bg-white border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div {...fade} className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-black text-emerald-950">38 classes across 14 crops</h2>
              <p className="text-emerald-900/60 mt-2">Trained on the full PlantVillage dataset (Kaggle) — 26 diseases + 12 healthy classes</p>
            </div>
            <Link to="/diseases" className="font-bold text-emerald-700 hover:underline">View full library →</Link>
          </motion.div>
          <div className="mt-10 space-y-8">
            {BY_CROP.map(({ crop, classes }, gi) => (
              <motion.div key={crop} {...fade} transition={{ delay: gi * 0.05 }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{classes[0].emoji}</span>
                  <h3 className="font-display text-xl font-black text-emerald-950">{crop}</h3>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">{classes.length} classes</span>
                  <div className="flex-1 h-px bg-emerald-100" />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {classes.map((d) => (
                    <span key={d.id} title={`${d.name} — ${d.severity} severity`}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow ${d.healthy ? "bg-green-50 border-green-200 text-green-800" : "bg-[#FFFBEB] border-emerald-100 text-emerald-950"}`}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      {d.disease}
                      {d.healthy
                        ? <span className="text-[10px] font-extrabold text-green-600">HEALTHY</span>
                        : <span className="text-[10px] font-extrabold" style={{ color: d.color }}>{d.severity.toUpperCase()}</span>}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div {...fade}>
          <h2 className="font-display text-4xl font-black text-emerald-950">Built with a modern stack</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["React 19", "Vite", "Tailwind CSS", "Framer Motion", "Recharts", "Node.js + Express", "MongoDB + Mongoose", "Python + Flask", "TensorFlow / Keras", "Multer"].map((t) => (
              <span key={t} className="px-4 py-2 rounded-full bg-white border border-emerald-200 font-semibold text-sm text-emerald-800 shadow-sm">{t}</span>
            ))}
          </div>
          <Link to="/detect" className="inline-block mt-10 px-8 py-4 rounded-full bg-emerald-700 text-white font-extrabold shadow-xl shadow-emerald-700/25 hover:bg-emerald-800">Try it now — upload a leaf 🌱</Link>
        </motion.div>
      </section>
    </div>
  );
}
