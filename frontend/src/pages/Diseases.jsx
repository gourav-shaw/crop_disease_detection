import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DISEASES, CROPS, severityStyles } from "../data/diseases";

export default function Diseases() {
  const [query, setQuery] = useState("");
  const [cropFilter, setCropFilter] = useState("All");
  const [healthyOnly, setHealthyOnly] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = DISEASES.filter((d) => {
    const matchesCrop = cropFilter === "All" || d.crop === cropFilter;
    const matchesHealthy = !healthyOnly || d.healthy;
    const haystack = (d.name + " " + d.crop + " " + d.disease + " " + d.code + " " + d.causalAgent).toLowerCase();
    return matchesCrop && matchesHealthy && haystack.includes(query.toLowerCase());
  });

  // Group the filtered classes under crop headers, in class order
  const groups = CROPS
    .map((crop) => ({ crop, items: filtered.filter((d) => d.crop === crop) }))
    .filter((g) => g.items.length > 0);

  const chip = (active) =>
    `px-4 py-2 rounded-full text-sm font-bold border transition ${
      active
        ? "bg-emerald-700 text-white border-emerald-700 shadow"
        : "bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400"
    }`;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl font-black text-emerald-950">Disease Library 📚</h1>
      <p className="text-emerald-900/60 mt-2">All 38 classes from the full PlantVillage dataset — 26 diseases and 12 healthy classes across 14 crops, with symptoms, treatment and prevention.</p>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mt-7">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔎 Search by disease, crop, code or pathogen…"
          className="w-full md:w-[440px] px-5 py-3.5 rounded-full bg-white border border-emerald-200 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
        <span className="text-sm font-bold text-emerald-900/50">{filtered.length} of {DISEASES.length} classes</span>
      </div>

      {/* Crop filter chips */}
      <div className="flex flex-wrap gap-2 mt-5">
        <button onClick={() => setCropFilter("All")} className={chip(cropFilter === "All")}>🌱 All crops</button>
        {CROPS.map((crop) => {
          const sample = DISEASES.find((d) => d.crop === crop);
          return (
            <button key={crop} onClick={() => setCropFilter(crop)} className={chip(cropFilter === crop)}>
              {sample.emoji} {crop}
            </button>
          );
        })}
        <button onClick={() => setHealthyOnly((v) => !v)} className={chip(healthyOnly)}>✅ Healthy only</button>
      </div>

      {groups.map(({ crop, items }) => (
        <section key={crop} className="mt-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{items[0].emoji}</span>
            <h2 className="font-display text-2xl font-black text-emerald-950">{crop}</h2>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">{items.length} {items.length === 1 ? "class" : "classes"}</span>
            <div className="flex-1 h-px bg-emerald-100" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {items.map((d) => (
              <button key={d.id} onClick={() => setSelected(d)} className="text-left bg-white rounded-3xl border border-emerald-100 card-shadow p-6 hover:-translate-y-1 hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <span className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${d.gradient} flex items-center justify-center text-3xl`}>{d.healthy ? "✅" : d.emoji}</span>
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold ${severityStyles[d.severity]}`}>{d.healthy ? "Healthy" : d.severity}</span>
                </div>
                <h3 className="font-bold text-lg mt-4 text-emerald-950 leading-snug">{d.name}</h3>
                <div className="text-xs font-extrabold mt-1" style={{ color: d.color }}>{d.code} · {d.crop}</div>
                <p className="text-sm text-emerald-900/55 mt-2 line-clamp-3">{d.description}</p>
                <div className="mt-4 font-bold text-emerald-700 text-sm">View full details →</div>
              </button>
            ))}
          </div>
        </section>
      ))}
      {filtered.length === 0 && <div className="text-center py-14 font-semibold text-emerald-900/50">No classes match “{query}”{cropFilter !== "All" ? ` in ${cropFilter}` : ""}. Try a different search or filter.</div>}

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-emerald-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-black text-emerald-950 leading-tight">{selected.name}</h2>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold">{selected.code}</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">{selected.emoji} {selected.crop}</span>
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${severityStyles[selected.severity]}`}>Severity: {selected.severity}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-2xl leading-none bg-emerald-50 w-10 h-10 rounded-full shrink-0">✕</button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-emerald-950/80">{selected.description}</p>
              <p className="mt-3 text-sm"><b>Causal agent:</b> {selected.causalAgent}</p>
              {[["🩺 Symptoms", selected.symptoms], ["💊 Treatment", selected.treatment], ["🛡️ Prevention", selected.prevention]].map(([title, list]) => (
                <div key={title} className="mt-5">
                  <h3 className="font-bold text-emerald-950">{title}</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm text-emerald-950/75">{list.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
