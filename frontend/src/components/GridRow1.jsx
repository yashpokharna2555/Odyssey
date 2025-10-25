import { ImgTile, BlankTile } from "./tiles";

export default function GridRow1() {
  return (
    <div className="flex gap-2 justify-end">
      <ImgTile delay={0.0} />
      <BlankTile />
      <BlankTile />
      <BlankTile />
      
    </div>
  );
}
