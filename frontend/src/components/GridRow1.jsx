import { ImgTile, BlankTile } from "./tiles";

export default function GridRow1() {
  // Configuration
  const TILE_COUNT = 4; // number of tiles in this row
  const IMAGE_PROBABILITY = 0.5; // 0.5 = 50% chance of being an ImgTile

  // Generate an array of randomized tile types
  const tiles = Array.from({ length: TILE_COUNT }, () =>
    Math.random() < IMAGE_PROBABILITY ? "image" : "blank"
  );

  return (
    <div className="flex gap-2 justify-end">
      {tiles.map((type, i) =>
        type === "image" ? (
          <ImgTile key={i} delay={i * 0.2} />
        ) : (
          <BlankTile key={i} />
        )
      )}
    </div>
  );
}
