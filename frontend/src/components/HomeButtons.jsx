import React from "react";
import { motion as Motion } from "motion/react";
import Arrow from "../assets/arrow.svg"; 

const HomeButtons = () => {
  return (
    <div className="flex flex-row gap-4">
      {/* Button 1 */}
      <Button text="Learn More" />
      {/* Button 2 */}
      <Button text="Start A Trip" />
    </div>
  );
};

// Reusable button with arrow motion
const Button = ({ text }) => {
  return (
    <button className="relative flex items-center justify-center gap-3 w-[150px] h-[50px] bg-black text-white rounded-lg border-2 border-white hover:bg-white hover:text-black transition-all duration-300 overflow-hidden group">
      <span className="text-sm font-medium tracking-wide">{text}</span>

      {/* Animated arrow */}
      <Motion.img
        src={Arrow}
        alt="arrow"
        className="w-4 h-4 rotate-45"
        animate={{
          x: [0, 6, 0, -6, 0],
          y: [0, -6, 0, 6, 0],
        }}
        transition={{
          duration: 2.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </button>
  );
};

export default HomeButtons;
