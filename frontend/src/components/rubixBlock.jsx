// components/AlternatingSweepBox.jsx
import { useEffect, useState } from "react";
import { motion as Motion, useAnimationControls } from "motion/react";
import SF_GGB from "../assets/SF_GGB.png";
import Taj from "../assets/Taj.png";
import Christ from "../assets/Christ.png";
import Colosseum from "../assets/Colosseum.png";
import Giza from "../assets/Giza.png";
import Greatwall from "../assets/Greatwall.png";
import StatueOfLiberty from "../assets/StatueOfLiberty.png";

export default function AlternatingSweepBox({ delay = 0, size = 120, className = "" }) {
  const IMAGES = [SF_GGB, Taj, Christ, Colosseum, Giza, Greatwall, StatueOfLiberty];
  const [image, setImage] = useState(IMAGES[Math.floor(Math.random() * IMAGES.length)]);
  const controls = useAnimationControls();

  useEffect(() => {
    let current = image;
    const pickNewImage = () => {
      let next = current;
      while (next === current) next = IMAGES[Math.floor(Math.random() * IMAGES.length)];
      current = next;
      setImage(next);
    };

    const run = async () => {
      if (delay > 0) await new Promise((r) => setTimeout(r, delay * 1000));
      while (true) {
        const duration = 3 + Math.random() * 3;
        await controls.start({ width: ["0%", "100%"], transition: { duration: duration / 2, ease: "easeInOut" } });
        pickNewImage();
        await controls.start({ width: ["100%", "0%"], transition: { duration: duration / 2, ease: "easeInOut" } });
        await new Promise((r) => setTimeout(r, 300));
      }
    };
    run();
  }, [controls, delay]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-lg border-2 border-white ${className}`}
      style={{
        width: size, height: size,
        backgroundImage: `url(${image})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }}
    >
      <Motion.div animate={controls} className="absolute left-0 top-0 h-full bg-black rounded-lg" />
    </div>
  );
}
