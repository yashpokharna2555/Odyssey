import React from "react";
import { motion as Motion } from "motion/react";

const About = () => {
  return (
    <div className="relative w-screen min-h-screen flex flex-col items-center justify-center text-center text-white bg-black overflow-hidden">
      {/* ✨ Star Background Layer */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(60)].map((_, i) => (
          <span
            key={i}
            className="absolute w-[2px] h-[2px] bg-white/80 rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random(),
            }}
          ></span>
        ))}
      </div>

      {/* 🌙 Soft gradient fade at bottom for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent z-0"></div>

      {/* 📦 Main Glass Card */}
      <div className="relative z-10 max-w-3xl p-10 rounded-[2rem] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm">
        <Motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-6xl font-semibold mb-6"
        >
          About Odyssey
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="text-lg text-white/80 leading-relaxed"
        >
          Odyssey is your intelligent travel companion — helping you plan,
          personalize, and perfect every journey. From discovering hidden gems
          nearby to crafting full itineraries powered by AI and real-time data,
          we map your adventures with precision and creativity.
        </Motion.p>

        <Motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="mt-6 text-white/70 text-sm tracking-wide"
        >
          Built with love by the Odyssey team — blending technology, design,
          and wanderlust to make exploration effortless.
        </Motion.p>
      </div>
    </div>
  );
};

export default About;
