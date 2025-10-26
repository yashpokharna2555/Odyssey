import { useState, useCallback } from "react";
import GridRow1 from "./GridRow1";
import GridRow2 from "./GridRow2";
import GridRow3 from "./GridRow3";
import GridRow4 from "./GridRow4";

const PANEL_WIDTH = 900;

export default function RightGrid() {
  const [refreshKey, setRefreshKey] = useState(0);

  // 👇 Function to reshuffle grid (called by child when animation ends)
  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1); // re-renders with new randoms
  }, []);

  return (
    <div className="shrink-0" style={{ width: PANEL_WIDTH }}>
      <div key={refreshKey} className="flex flex-col gap-2 overflow-x-hidden">
        <GridRow2 onRefresh={triggerRefresh} />
        <GridRow1 onRefresh={triggerRefresh} />
        <GridRow3 onRefresh={triggerRefresh} />
        <GridRow4 onRefresh={triggerRefresh} />
      </div>
    </div>
  );
}
