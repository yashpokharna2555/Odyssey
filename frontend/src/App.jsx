import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import OdysseyLanding from "./components/OdysseyLanding";
import SignIn from "./components/Signin";
import About from "./components/About";
import TripPage from "./components/TripPage";
import StarBackground from "./components/StarsBackground"; // ⭐ import once here

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login"; // add more routes if needed

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* 🌌 Global Starry Background for Auth pages */}
      {isAuthPage && (
        <>
          <StarBackground count={250} />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
        </>
      )}

      {/* Navbar only for non-auth pages */}
      {!isAuthPage && <NavBar />}

      <Routes>
        <Route path="/" element={<OdysseyLanding />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/trip" element={<TripPage />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
