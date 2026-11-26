import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="bg-[#052e16] text-emerald-100/80 leaf-pattern mt-0">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-display text-2xl font-bold text-white">🌱 CropGuard AI</div>
          <p className="mt-3 text-sm leading-relaxed">AI-powered leaf disease detection for farmers and students — 38 classes across 14 crops. Upload a leaf photo, get an instant diagnosis with treatment guidance.</p>
        </div>
        <div>
          <div className="font-bold text-white mb-3">Explore</div>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/detect" className="hover:text-lime-300">Detect Disease</Link>
            <Link to="/dashboard" className="hover:text-lime-300">Dashboard</Link>
            <Link to="/diseases" className="hover:text-lime-300">Disease Library</Link>
            <Link to="/history" className="hover:text-lime-300">History</Link>
          </div>
        </div>
        <div>
          <div className="font-bold text-white mb-3">Dataset</div>
          <p className="text-sm">PlantVillage Dataset (full, color)<br/>54,305 images · 38 classes · 14 crops</p>
          <a href="https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset/data" target="_blank" rel="noreferrer" className="text-lime-300 text-sm font-semibold hover:underline">View on Kaggle ↗</a>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">CropGuard AI — College Project · Built with React, Node.js, Python & TensorFlow/Keras</div>
    </footer>
  );
}
