import React, { useState } from "react";
import TripPlanner from "./TripPlanner";
import TripMap from "./TripMap";

export default function TripPage() {
  const [places, setPlaces] = useState([]);

  const handleAddPlace = (place) => {
    setPlaces((prev) => [...prev, place]);
  };

  const handleRemovePlace = (index) => {
    setPlaces((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col lg:flex-row bg-black text-white h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <TripPlanner
          places={places}                 // 👈 pass places down
          onAddPlace={handleAddPlace}
          onRemovePlace={handleRemovePlace} // 👈 pass remover
        />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <TripMap places={places} />
      </div>
    </div>
  );
}
