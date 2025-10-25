export default function NavBar() {
    return (
      <header className="fixed top-3 left-0 right-0 z-50 pointer-events-none">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 py-2 backdrop-blur pointer-events-auto">

          <button aria-label="Menu" className="grid gap-3 p-2 text-white">

            <span className="block w-15 h-px bg-current"></span>
            <span className="block w-15 h-px bg-current"></span>
            <span className="block w-15 h-px bg-current"></span>
          </button>
  
          {/* Links */}
          <nav className="flex items-center gap-5 text-[12px] font-light tracking-[0.18em] text-white uppercase">
            <span>New</span>
            <span>Woman</span>
            <span>Man</span>
            <span>Kids</span>
            <span>Search</span>
            <span>Log In</span>
            <span>Help</span>
            <span>Bag (0)</span>
          </nav>
        </div>
      </header>
    );
  }
  