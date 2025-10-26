import { useEffect, useState } from "react";
import { motion as Motion, useAnimationControls } from "motion/react";

// 🏞️ Landmark images
import SF_GGB from "../assets/SF_GGB.png";
import Taj from "../assets/Taj.png";
import Christ from "../assets/Christ.png";
import Colosseum from "../assets/Colosseum.png";
import Giza from "../assets/Giza.png";
import Greatwall from "../assets/Greatwall.png";
import StatueOfLiberty from "../assets/StatueOfLiberty.png";

const AlternatingSweepBox = ({ delay = 0 }) => {
  const IMAGES = [SF_GGB, Taj, Christ, Colosseum, Giza, Greatwall, StatueOfLiberty];
  const [image, setImage] = useState(() => IMAGES[Math.floor(Math.random() * IMAGES.length)]);
  const controls = useAnimationControls();

  useEffect(() => {
    let current = image;
    let mounted = true;

    const pickNewImage = () => {
      let next = current;
      while (next === current) next = IMAGES[Math.floor(Math.random() * IMAGES.length)];
      current = next;
      setImage(next);
    };

    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    const run = async () => {
      if (delay > 0) await sleep(delay * 1000);

      while (mounted) {
        const duration = 4; // consistent smooth loop

        // Sweep in (cover)
        await controls.start({
          width: ["0%", "100%"],
          transition: { duration: duration / 2, ease: "easeInOut" },
        });

        // Change image at full cover
        pickNewImage();

        // Sweep out (reveal)
        await controls.start({
          width: ["100%", "0%"],
          transition: { duration: duration / 2, ease: "easeInOut" },
        });

        // Short natural pause
        await sleep(500);
      }
    };

    run();

    return () => {
      mounted = false;
    };
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
      {/* The black sweep layer */}
      <Motion.div
        animate={controls}
        initial={{ width: "0%" }}
        className="absolute top-0 left-0 h-full bg-black rounded-lg"
      />
    </div>
  );
};

export default AlternatingSweepBox;
