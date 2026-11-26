import { NavLink, Link } from "react-router-dom";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/detect", label: "Detect" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
  { to: "/diseases", label: "Diseases" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 glass border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-lime-500 flex items-center justify-center text-xl shadow-lg shadow-emerald-600/25">🌱</span>
          <span className="font-display font-bold text-xl text-emerald-950">CropGuard <span className="text-lime-600">AI</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) =>
              `px-3.5 py-2 rounded-full text-sm font-semibold transition ${isActive ? "bg-emerald-700 text-white shadow" : "text-emerald-900/70 hover:bg-emerald-50"}`}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/detect" className="ml-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 hover:opacity-90">Scan Leaf →</Link>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden text-2xl text-emerald-900">☰</button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1 bg-white/90">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg font-semibold text-emerald-900 hover:bg-emerald-50">{l.label}</NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
