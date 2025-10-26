import { useMemo } from "react";
import { ImgTile, BlankTile } from "./tiles";

export default function GridRow3() {
  const TILE_COUNT = 3;      // total number of tiles
  const IMAGE_COUNT = 1;     // only one image tile for balance


  const tileTypes = useMemo(() => {
    const positions = Array.from({ length: TILE_COUNT }, () => "blank");
    const randomIndex = Math.floor(Math.random() * TILE_COUNT);
    positions[randomIndex] = "image";
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
