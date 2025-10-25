import { useState } from 'react'
import './App.css'
import NavBar from "./components/NavBar";

function App() {
  return (
    <div className="relative min-h-screen bg-black">
      <NavBar />

      {/* Centered Odyssey text on the left side */}
      <div className="pl-40 absolute inset-0 flex items-center">
        <h1 className="font-vogue text-[10rem] tracking-tight text-white">
          Odyssey
        </h1>
      </div>
    </div>
  )
}

export default App
