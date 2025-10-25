import { ImgTile, BlankTile } from "./tiles";

export default function GridRow3() {
  return (
    <div className="flex gap-2 justify-end">
      <BlankTile />
      <ImgTile delay={0.0} />
      <BlankTile />
      
      

    </div>
  );
}
