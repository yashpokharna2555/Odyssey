import GridRow1 from "./GridRow1";
import GridRow2 from "./GridRow2";
import GridRow3 from "./GridRow3";
import GridRow4 from "./GridRow4";

const PANEL_WIDTH = 900;

export default function RightGrid() {
  return (
    <div className="shrink-0" style={{ width: PANEL_WIDTH }}>
      <div className="flex flex-col gap-2 overflow-x-hidden">
        <GridRow2 />
        <GridRow1 />
        <GridRow3 />
        <GridRow4 />
      </div>
    </div>
  );
}