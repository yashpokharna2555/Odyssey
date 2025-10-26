import React, { useState, useEffect } from "react";

const AWS_REGION = "us-east-2";
const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY;

export default function TripPlanner({ places = [], onAddPlace, onRemovePlace }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // 🔍 Fetch suggestions (using your /search-text response shape)
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
      const results =
        data.ResultItems?.map((r) => ({
          title: r.Title,
          placeId: r.PlaceId,
          address: r.Address?.Label || "",
          coordinates: r.Position, // [lon, lat]
        })) || [];

      setSuggestions(results);
    } catch (err) {
      console.error("❌ Suggest API error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 📍 Add selected suggestion to parent 'places'
  const handleSelect = async (place) => {
    setQuery("");
    setSuggestions([]);
    onAddPlace({
      title: place.title,
      coordinates: place.coordinates,
      address: place.address,
      placeId: place.placeId,
    });
  };

  // 🗑️ Remove by index -> tell parent
  const handleRemove = (index) => {
    onRemovePlace?.(index);
  };

  return (
    <div className="w-[80%] max-w-2xl mt-10 text-white relative z-[9999] space-y-8">
      {/* 🔍 Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search nearby places..."
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            fetchSuggestions(value);
          }}
          className="w-full p-3 rounded-full bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-all"
        />

        {loading && (
          <p className="absolute right-4 top-3 text-white/50 text-sm animate-pulse">
            Searching...
          </p>
        )}

        {/* ✨ Dropdown */}
        {suggestions.length > 0 && (
          <ul
            className="
              absolute left-0 top-[110%]
              bg-black/90 text-white
              border border-white/30
              rounded-xl shadow-2xl backdrop-blur-xl
              overflow-hidden z-[99999]
              animate-fadeIn
            "
            style={{ width: "100%" }}
          >
            {suggestions.map((s, i) => (
              <li
                key={`${s.placeId ?? s.title}-${i}`}
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

      {/* 🧭 Trip Plan List (driven by parent 'places') */}
      <div className="bg-white/10 border border-white/30 rounded-xl p-4 backdrop-blur-md shadow-md">
        <h2 className="text-lg font-semibold mb-3">Your Trip Plan</h2>

        {places.length === 0 ? (
          <p className="text-white/60 text-sm">
            No locations added yet — search and add places to your plan.
          </p>
        ) : (
          <ul className="space-y-2">
            {places.map((place, index) => (
              <li
                key={`${place.placeId ?? place.title}-${index}`}
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
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
