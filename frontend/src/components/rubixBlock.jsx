import { useEffect, useState } from "react";
import { motion as Motion, useAnimationControls } from "motion/react";

// 🏞️ Import landmark images
import SF_GGB from "../assets/SF_GGB.png";
import Taj from "../assets/Taj.png";
import Christ from "../assets/Christ.png";
import Colosseum from "../assets/Colosseum.png";
import Giza from "../assets/Giza.png";
import Greatwall from "../assets/Greatwall.png";
import StatueOfLiberty from "../assets/StatueOfLiberty.png";

const AlternatingSweepBox = ({ delay = 0 }) => {
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
      if (delay > 0) await new Promise((res) => setTimeout(res, delay * 1000));

      while (true) {
        const duration = 3 + Math.random() * 3;

        // Sweep to cover (left → right)
        await controls.start({
          width: ["0%", "100%"],
          transition: { duration: duration / 2, ease: "easeInOut" },
        });

        // 🖼️ Change image when fully covered
        pickNewImage();

        // Sweep back (right → left)
        await controls.start({
          width: ["100%", "0%"],
          border: ["100%", "0%"],
          transition: { duration: duration / 2, ease: "easeInOut" },
        });

        await new Promise((res) => setTimeout(res, 300));
      }
    };

    run();
  }, [controls, delay]);

  return (
    <div
      className="relative w-[120px] h-[120px] overflow-hidden bg-black border-2 border-white rounded-lg shadow-lg"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 👇 You can replace bg-black with your glass class later */}
      <Motion.div
        animate={controls}
        className="absolute top-0 left-0 h-full bg-black rounded-lg"
      />
    </div>
  );
};

export default AlternatingSweepBox;
