import React from "react";
import { motion as Motion } from "motion/react";

const Help = () => {
  const technologies = [
    { name: "React", icon: "⚛️", description: "Modern UI library for building interactive components" },
    { name: "Vite", icon: "⚡", description: "Fast build tool and development server" },
    { name: "Tailwind CSS", icon: "💨", description: "Utility-first CSS framework for rapid styling" },
    { name: "AWS", icon: "☁️", description: "Cloud infrastructure for authentication, maps, and routing" },
    { name: "MapLibre GL", icon: "🗺️", description: "Open-source map rendering library" },
    { name: "SerpAPI", icon: "🔍", description: "Search engine results for events and local data" },
    { name: "Framer Motion", icon: "✨", description: "Animation library for smooth transitions" },
  ];

  const navbarItems = [
    { name: "Home", description: "Landing page with beautiful destination cards and travel inspiration" },
    { name: "Trip", description: "Plan your journey - search destinations, configure travel dates and mode, get AI-powered itinerary" },
    { name: "Memories", description: "View saved trip memories with photos, notes, and takeaways from your travels" },
    { name: "About", description: "Learn more about the Odyssey platform and our mission" },
  ];

  return (
    <div className="relative min-h-screen w-screen bg-black text-white overflow-hidden pt-24 px-5 py-8">
      {/* ✨ Subtle background stars */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(30)].map((_, i) => (
          <span
            key={i}
            className="absolute w-[2px] h-[2px] bg-white/40 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5,
            }}
          ></span>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold mb-4">Help & Documentation</h1>
          <p className="text-lg text-white/70">Everything you need to know about using Odyssey</p>
        </Motion.div>

        {/* How It Works */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold mb-4">How Odyssey Works</h2>
          <div className="space-y-4 text-white/80">
            <div className="flex gap-4">
              <div className="text-2xl">1️⃣</div>
              <div>
                <h3 className="font-semibold mb-1">Search & Plan</h3>
                <p className="text-sm">Start by searching for your destination or using your current location. Add multiple stops to your trip.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">2️⃣</div>
              <div>
                <h3 className="font-semibold mb-1">Configure Trip</h3>
                <p className="text-sm">Set your travel dates (Today, Tomorrow, or Weekend) and choose your preferred travel mode (driving, walking, or cycling).</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">3️⃣</div>
              <div>
                <h3 className="font-semibold mb-1">Get AI-Powered Itinerary</h3>
                <p className="text-sm">Our smart system generates an optimized itinerary with arrival times, best routes, and personalized recommendations.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-2xl">4️⃣</div>
              <div>
                <h3 className="font-semibold mb-1">Save & Share Memories</h3>
                <p className="text-sm">Save your itinerary, upload photos, and add personal notes to create lasting memories of your adventure.</p>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Technologies Used */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-12 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold mb-6">Technologies Used</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technologies.map((tech, idx) => (
              <Motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1, duration: 0.4 }}
                className="bg-black/40 border border-white/20 rounded-lg p-4 hover:bg-black/60 transition-all"
              >
                <div className="text-3xl mb-2">{tech.icon}</div>
                <h3 className="font-semibold mb-1">{tech.name}</h3>
                <p className="text-sm text-white/70">{tech.description}</p>
              </Motion.div>
            ))}
          </div>
        </Motion.div>

        {/* Navbar Components */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-12 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold mb-6">Navigation Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {navbarItems.map((item, idx) => (
              <Motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                className="bg-black/40 border border-white/20 rounded-lg p-4 hover:bg-black/60 transition-all"
              >
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <p className="text-sm text-white/70">{item.description}</p>
              </Motion.div>
            ))}
          </div>
        </Motion.div>

        {/* Contact */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-8 text-center"
        >
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-2xl font-bold mb-2">Need Help?</h2>
          <p className="text-white/70 mb-4">Have questions or feedback? We'd love to hear from you!</p>
          <a
            href="mailto:OdysseyTravelCompanion@gmail.com"
            className="inline-block rounded-full bg-white text-black px-8 py-3 text-sm font-semibold hover:bg-white/90 transition-all"
          >
            Contact Us
          </a>
          <p className="mt-4 text-sm text-white/60">OdysseyTravelCompanion@gmail.com</p>
        </Motion.div>
      </div>
    </div>
  );
};

export default Help;

