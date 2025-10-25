import AlternatingSweepBox from "./rubixBlock";

export const TILE_SIZE = 120;

export function ImgTile({ delay = 0 }) {
  return <AlternatingSweepBox size={TILE_SIZE} delay={delay} />;
}

export function BlankTile() {
  return (
    <div
      className="rounded-lg bg-black border border-white/90"
      style={{ width: TILE_SIZE, height: TILE_SIZE }}
    />
  );
}