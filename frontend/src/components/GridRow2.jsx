import { ImgTile, BlankTile } from "./tiles";

export default function GridRow2() {
  return (
    <div className="flex gap-2 justify-end">
      <BlankTile />
      <BlankTile />
      <ImgTile delay={0.1} />
      
      <BlankTile />
      <ImgTile delay={0.3} />
      
    </div>
  );
}
