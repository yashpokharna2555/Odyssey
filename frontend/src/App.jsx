import NavBar from "./components/NavBar";
import OdysseyLanding from "./components/OdysseyLanding";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed, on top */}
      <NavBar />
      {/* Offset the content so it doesn't sit under the fixed navbar */}
      <main className="pt-16"> 
        <OdysseyLanding />
      </main>
    </div>
  );
}
