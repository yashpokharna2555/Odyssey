import React from "react";
import { motion as Motion } from "motion/react";
import RightGrid from "./RightGrid";
import HomeButtons from "./HomeButtons";
import StarBackground from "./StarsBackground"; // ✨ import the star background

export default function OdysseyLanding() {
  return (
    <div className="relative w-screen min-h-screen bg-black overflow-hidden flex items-center justify-center text-white">
      {/* 🌌 Star Background */}
      <StarBackground />

      {/* Main Content */}
      <div
        className="relative z-10 mx-auto max-w-[1600px] grid lg:grid-cols-[1fr_900px] md:grid-cols-1 items-center px-6"
        style={{
          minHeight: "calc(100vh - 80px)", // Adjust for navbar height
          marginTop: "10px",
        }}
      >
        {/* Left Column — Text Section */}
        <div className="pl-10 lg:pl-16 flex flex-col items-start justify-center py-10">
          {/* Hero Title */}
          <Motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-vogue text-[8rem] md:text-[6rem] sm:text-[4rem] leading-none tracking-tight"
          >
            Odyssey
          </Motion.h1>

          {/* Subheading */}
          <Motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="mt-4 text-xl md:text-lg sm:text-base text-white/70 tracking-wide"
          >
            Your journey, perfectly mapped.
          </Motion.p>

          {/* Buttons Section */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            className="mt-10"
          >
            <HomeButtons />
          </Motion.div>
        </div>

        {/* Right Column — Grid Section */}
        <div className="w-full lg:w-[900px] md:mt-16 flex items-center justify-center">
          <RightGrid />
        </div>
      </div>
    </div>
  );
}
