import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = sessionStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    // Listen for storage changes to update login status
    window.addEventListener("storage", checkLoginStatus);
    // Custom event for login/logout
    window.addEventListener("authStatusChange", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("authStatusChange", checkLoginStatus);
    };
  }, []);

  const handleSignOut = () => {
    sessionStorage.removeItem("access_token");
    setIsLoggedIn(false);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authStatusChange"));
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 py-2 pointer-events-auto">
        <Link to="/" className="text-white no-underline">
          <button aria-label="Menu" className="grid gap-3 p-2 text-white">
            <span className="block w-15 h-px bg-current"></span>
            <span className="block w-15 h-px bg-current"></span>
            <span className="block w-15 h-px bg-current"></span>
          </button>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-5 text-[12px] font-light tracking-[0.18em] text-white uppercase">
          <Link to="/" className="text-white no-underline hover:text-gray-300 transition-colors">Home</Link>
          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="text-white no-underline hover:text-gray-300 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="text-white no-underline hover:text-gray-300 transition-colors">
              Login
            </Link>
          )}
          <Link to="/trip" className="text-white no-underline hover:text-gray-300 transition-colors">Trip</Link>
          <Link to="/about" className="text-white no-underline hover:text-gray-300 transition-colors">About</Link>
          <span>Help</span>
        </nav>
      </div>
    </header>
  );
}