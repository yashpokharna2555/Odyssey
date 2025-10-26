// components/StarBackground.jsx
import React from "react";

const StarBackground = ({ count = 200 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {[...Array(count)].map((_, i) => (
        <span
          key={i}
          className="absolute w-[3px] h-[3px] bg-white/80 rounded-full animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random(),
          }}
        ></span>
      ))}

      {/* bottom fade for subtle depth */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent"></div>
    </div>
  );
};

export default StarBackground;
