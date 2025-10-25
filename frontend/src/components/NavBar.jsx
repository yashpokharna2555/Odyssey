import { Link } from "react-router-dom";

export default function NavBar() {
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
            <Link to="/login" className="text-white no-underline hover:text-gray-300 transition-colors">Login</Link>
            <span>Trip</span>
            <span>About</span>
            <span>Help</span>
          </nav>
        </div>
      </header>
    );
  }