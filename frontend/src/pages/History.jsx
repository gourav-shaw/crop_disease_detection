import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHistory, deletePrediction } from "../api";

export default function History() {
  const [items, setItems] = useState(null);

  const load = () => getHistory().then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this prediction?")) return;
    try { await deletePrediction(id); load(); } catch { alert("Delete failed — is the backend running?"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl font-black text-emerald-950">Prediction History 🗂️</h1>
      <p className="text-emerald-900/60 mt-2">Every detection is saved in MongoDB with its image, result and confidence.</p>

      {items === null && <div className="py-16 text-center font-bold text-emerald-700">Loading… 🌿</div>}
      {items && items.length === 0 && (
        <div className="mt-10 bg-white rounded-3xl border border-dashed border-emerald-200 p-14 text-center">
          <div className="text-6xl">🍃</div>
          <h2 className="font-display text-2xl font-black mt-4 text-emerald-950">No predictions yet</h2>
          <p className="text-emerald-900/55 mt-2">Upload your first leaf image to start building history.</p>
          <Link to="/detect" className="inline-block mt-6 px-6 py-3 rounded-full bg-emerald-700 text-white font-bold">Detect a Leaf →</Link>
        </div>
      )}
      {items && items.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {items.map((p) => {
            const id = p._id || p.id;
            const img = p.image ? (p.image.startsWith("http") ? p.image : `/uploads/${p.image.replace(/^.*[\\/]/, "")}`) : null;
            return (
              <div key={id} className="bg-white rounded-3xl border border-emerald-100 card-shadow overflow-hidden hover:-translate-y-1 transition">
                {img ? <img src={img} alt="" className="w-full h-44 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      : <div className="w-full h-44 bg-emerald-50 flex items-center justify-center text-5xl">🍃</div>}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-emerald-950 leading-snug">{p.diseaseName}</div>
                    {p.isDemo && <span className="shrink-0 text-[10px] font-extrabold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">DEMO</span>}
                  </div>
                  <div className="text-sm text-emerald-900/55 mt-1">{p.diseaseCode} · Confidence {(p.confidence * 100).toFixed(1)}%</div>
                  <div className="h-2 bg-emerald-100 rounded-full mt-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: `${p.confidence * 100}%` }} /></div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-semibold text-emerald-900/45">{new Date(p.createdAt).toLocaleString()}</span>
                    <button onClick={() => remove(id)} className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full hover:bg-red-100">🗑 Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
