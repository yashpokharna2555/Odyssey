import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import OdysseyLanding from "./components/OdysseyLanding";
import SignIn from "./components/Signin";
import About from "./components/About";
import Help from "./components/Help";
import TripPage from "./components/TripPage";
import EventsPage from "./components/EventsPage";
import MemoriesPage from "./components/MemoriesPage";
import StarBackground from "./components/StarsBackground"; // ⭐ import once here

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login"; // add more routes if needed

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* 🌌 Global Starry Background for all pages */}
      <StarBackground count={250} />
      
      {/* Auth page overlay - lighter to show stars */}
      {isAuthPage && (
        <>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5"></div>
        </>
      )}

      {/* Navbar only for non-auth pages */}
      {!isAuthPage && <NavBar />}

      <Routes>
        <Route path="/" element={<OdysseyLanding />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/trip" element={<TripPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/memories" element={<MemoriesPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
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
