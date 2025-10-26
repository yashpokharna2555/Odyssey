import { useMemo } from "react";
import { ImgTile, BlankTile } from "./tiles";

export default function GridRow3() {
  const TILE_COUNT = 6; // total tiles in row
  const IMAGE_COUNT = 2; // number of images (keeps visual balance)

  // 🎲 Randomize once per render
  const tileTypes = useMemo(() => {
    const positions = Array.from({ length: TILE_COUNT }, () => "blank");
    const imgPositions = new Set();

    while (imgPositions.size < IMAGE_COUNT) {
      imgPositions.add(Math.floor(Math.random() * TILE_COUNT));
    }

    imgPositions.forEach((pos) => (positions[pos] = "image"));
    return positions;
  }, []);

  return (
    <div className="flex gap-2 justify-end">
      {tileTypes.map((type, i) =>
        type === "image" ? (
          <ImgTile key={i} delay={i * 0.2} />
        ) : (
          <BlankTile key={i} />
        )
      )}
    </div>
  );
}
