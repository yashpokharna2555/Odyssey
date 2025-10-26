import React, { useState, useEffect } from "react";

const AWS_REGION = "us-east-2";
const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY;

export default function TripPlanner({ onAddPlace }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tripList, setTripList] = useState([]);

  // 🧭 Get user location once
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
        () => setUserLocation([-122.009, 37.3349]) // fallback Cupertino
      );
    } else {
      setUserLocation([-122.009, 37.3349]);
    }
  }, []);

  // 🔍 Step 1: Fetch AWS Places suggestions (returns PlaceId, Address, Position)
  const fetchSuggestions = async (text) => {
    if (text.trim().length < 3 || !userLocation) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/places/v2/search-text?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          QueryText: text,
          BiasPosition: userLocation, // [lon, lat]
          MaxResults: 5,
        }),
      });

      const data = await res.json();
      console.log("✅ AWS suggestions returned:", data);


      const results =
        data.ResultItems?.map((r) => ({
          title: r.Title,
          placeId: r.PlaceId,
          address: r.Address?.Label || "",
          coordinates: r.Position, // [lon, lat]
        })) || [];

      console.log("Parsed suggestions:", results);
      setSuggestions(results);
    } catch (err) {
      console.error("Suggest API error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 📍 When a user selects a place from the dropdown
  const handleSelect = async (place) => {
    console.log("📍 Selected:", place);
    setQuery("");
    setSuggestions([]);
    setLoading(true);

    try {
      // ✅ Use coordinates directly from API response
      const selected = {
        title: place.title,
        coordinates: place.coordinates, // [lon, lat]
        address: place.address,
        placeId: place.placeId,
      };

      // Add to trip list and map
      setTripList((prev) => [...prev, selected]);
      onAddPlace(selected);

      console.log("Added place:", selected);
    } catch (err) {
      console.error("Handle select error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (index) => {
    const updated = tripList.filter((_, i) => i !== index);
    setTripList(updated);
  };

  return (
    <div className="w-[70%] max-w-2xl ml-15 mt-25 text-white relative z-[9999] space-y-8">

      <div className="relative">
        <input
          type="text"
          placeholder="SEARCH NEARBY PLACES..."
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            fetchSuggestions(value);
          }}
          className="
      w-full
      bg-transparent
      text-white
      placeholder-white/60
      border-0
      border-b
      border-white/40
      focus:border-white
      focus:outline-none
      focus:ring-0
      pb-3
    "
        />

        {loading && (
          <p className="absolute right-0 top-0 translate-y-[-1.4rem] md:translate-y-0 md:right-2 md:top-2 text-white/50 text-sm animate-pulse">
            Searching...
          </p>
        )}

        {suggestions.length > 0 && (
          <ul
            className="
        absolute left-0 right-0
        mt-3
        bg-black/90 text-white
        border border-white/30
        rounded-xl shadow-2xl backdrop-blur-xl
        overflow-hidden z-[99999]
        animate-fadeIn
      "
          >
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSelect(s)}
                className="p-3 hover:bg-white/20 cursor-pointer transition-colors"
              >
                <span className="font-medium">{s.title}</span>
                {s.address && (
                  <p className="text-xs text-white/60 truncate">{s.address}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* Trip Plan List */}
      <div className="bg-black border border-white/30 rounded-xl p-4 backdrop-blur-md shadow-md">
        <h2 className="text-lg font-semibold mb-3">Your Trip Plan</h2>

        {tripList.length === 0 ? (
          <p className="text-white/60 text-sm">
            No locations added yet — search and add places to your plan.
          </p>
        ) : (
          <ul className="space-y-2">
            {tripList.map((place, index) => (
              <li
                key={index}
                className="p-3 bg-white/5 rounded-lg border border-white/20 flex justify-between items-start"
              >
                <div>
                  <p className="font-medium">{place.title}</p>
                  <p className="text-xs text-white/60">{place.address}</p>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
