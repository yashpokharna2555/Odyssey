import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import OdysseyLanding from "./components/OdysseyLanding";
import SignIn from "./components/Signin";

export default function App() {
  return (
    <Router>
      {/* 🌍 Navbar sits outside all route content */}
      <NavBar />

      {/* Page container (below navbar) */}
      <div className="relative min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<OdysseyLanding />} />
          <Route path="/login" element={<SignIn />} />
        </Routes>
      </div>
    </Router>
  );
}
