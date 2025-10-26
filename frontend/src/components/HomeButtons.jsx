// src/components/HomeButtons.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "motion/react";
import Arrow from "../assets/arrow.svg";

const HomeButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row gap-4">
      <Button text="Learn More" onClick={() => navigate("/about")} />
      <Button text="Start A Trip" onClick={() => navigate("/trip")} />
    </div>
  );
};

// Reusable button with arrow motion
const Button = ({ text, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center gap-3 w-[150px] h-[50px] bg-black text-white rounded-lg border-2 border-white hover:bg-white hover:text-black transition-all duration-300 overflow-hidden group"
      aria-label={text}
    >
      <span className="text-sm font-medium tracking-wide">{text}</span>

      <Motion.img
        src={Arrow}
        alt=""
        className="w-4 h-4 rotate-45"
        animate={{ x: [0, 6, 0, -6, 0], y: [0, -6, 0, 6, 0] }}
        transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
      />
    </button>
  );
};

export default HomeButtons;
