import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Detect from "./pages/Detect.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/History.jsx";
import Diseases from "./pages/Diseases.jsx";
import About from "./pages/About.jsx";

function PageWrap({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBEB]">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrap><Home /></PageWrap>} />
            <Route path="/detect" element={<PageWrap><Detect /></PageWrap>} />
            <Route path="/dashboard" element={<PageWrap><Dashboard /></PageWrap>} />
            <Route path="/history" element={<PageWrap><History /></PageWrap>} />
            <Route path="/diseases" element={<PageWrap><Diseases /></PageWrap>} />
            <Route path="/about" element={<PageWrap><About /></PageWrap>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
