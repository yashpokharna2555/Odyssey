import { ImgTile, BlankTile } from "./tiles";

export default function GridRow4() {
  return (
    <div className="flex gap-2 justify-end">
      <ImgTile delay={0.15} />
      <BlankTile />
      <ImgTile delay={0.15} />
      <BlankTile />
      <BlankTile />
      <ImgTile delay={0.75} />
    </div>
  );
}
