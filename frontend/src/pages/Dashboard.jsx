import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend } from "recharts";
import { getStats } from "../api";
import { DISEASES } from "../data/diseases";

// Placeholder sample used only when there are no predictions yet.
// Covers all 38 classes (healthy total 84, diseased total 157, grand total 241 for the cards/pie).
const SAMPLE_COUNTS = [8, 6, 4, 10, 6, 5, 5, 7, 8, 5, 9, 6, 4, 5, 8, 3, 7, 6, 7, 7, 9, 8, 8, 3, 4, 5, 6, 6, 8, 7, 9, 5, 6, 4, 5, 7, 3, 12];
const SAMPLE = {
  total: 0, healthy: 0, diseased: 0, avgConfidence: 0,
  byDisease: DISEASES.map((d, i) => ({ classIndex: d.id, code: d.code, name: d.name, crop: d.crop, healthy: d.healthy, count: SAMPLE_COUNTS[i] || 0, color: d.color })),
  last7Days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({ date: day, count: [3, 5, 2, 6, 4, 7, 5][i] })),
  mostCommon: null, isSample: true,
};
const SAMPLE_HEALTHY = DISEASES.reduce((s, d, i) => s + (d.healthy ? SAMPLE_COUNTS[i] || 0 : 0), 0); // 84
const SAMPLE_TOTAL = SAMPLE_COUNTS.reduce((s, c) => s + c, 0); // 241

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getStats()
      .then((s) => setStats(s && s.total > 0 ? s : SAMPLE))
      .catch(() => { setStats(SAMPLE); setErr("Backend not reachable — showing sample data."); });
  }, []);

  if (!stats) return <div className="max-w-7xl mx-auto px-6 py-16 text-center font-bold text-emerald-700">Loading dashboard… 🌿</div>;

  const pieData = [
    { name: "Healthy", value: stats.healthy || 0, color: "#22c55e" },
    { name: "Diseased", value: stats.diseased || 0, color: "#ef4444" },
  ];
  if (stats.isSample) { pieData[0].value = SAMPLE_HEALTHY; pieData[1].value = SAMPLE_TOTAL - SAMPLE_HEALTHY; }
  const totalForCards = stats.isSample ? SAMPLE_TOTAL : stats.total;

  const cards = [
    ["📊", "Total Predictions", totalForCards],
    ["✅", "Healthy", stats.isSample ? SAMPLE_HEALTHY : stats.healthy],
    ["🦠", "Diseased", stats.isSample ? SAMPLE_TOTAL - SAMPLE_HEALTHY : stats.diseased],
    ["🎯", "Avg Confidence", `${((stats.isSample ? 0.91 : stats.avgConfidence || 0) * 100).toFixed(1)}%`],
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="font-display text-4xl md:text-5xl font-black text-emerald-950">Dashboard 📈</h1>
      <p className="text-emerald-900/60 mt-2">Live analytics from all stored predictions in MongoDB.</p>
      {(err || stats.isSample) && <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-sm font-semibold">ℹ️ {err || "No predictions yet — showing sample/placeholder data. Run a few detections to see your real stats."}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map(([icon, label, value]) => (
          <div key={label} className="bg-white rounded-3xl border border-emerald-100 card-shadow p-6">
            <div className="text-3xl">{icon}</div>
            <div className="font-display text-3xl font-black text-emerald-950 mt-3">{value}</div>
            <div className="text-sm font-semibold text-emerald-900/50">{label}</div>
          </div>
        ))}
      </div>
      {stats.mostCommon && !stats.isSample && (
        <div className="mt-4 bg-white rounded-2xl border border-emerald-100 px-5 py-4 font-semibold text-emerald-900">Most common diagnosis: <b className="text-emerald-700">{stats.mostCommon.name} ({stats.mostCommon.code})</b> — {stats.mostCommon.count} cases</div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-3xl border border-emerald-100 card-shadow p-6">
          <h3 className="font-bold text-lg text-emerald-950">Healthy vs Diseased</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={3} label>
                  {pieData.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-emerald-100 card-shadow p-6">
          <h3 className="font-bold text-lg text-emerald-950">Predictions per Class <span className="text-emerald-900/40 text-sm font-semibold">(all 38)</span></h3>
          <div className="h-72 overflow-y-auto pr-1">
            <div style={{ height: Math.max(288, (stats.byDisease || []).length * 22) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byDisease} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} fontSize={11} />
                  <YAxis type="category" dataKey="code" width={86} fontSize={10} fontWeight={700} />
                  <Tooltip formatter={(v, n, item) => [v, item?.payload?.name || "Count"]} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={12}>
                    {(stats.byDisease || []).map((d, i) => <Cell key={i} fill={d.color || DISEASES[i]?.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-100 card-shadow p-6 mt-6">
        <h3 className="font-bold text-lg text-emerald-950">Predictions — Last 7 Days</h3>
        <div className="h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.last7Days}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} /><stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2.5} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
