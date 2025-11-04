import React, { useState, useEffect } from "react";

const AWS_REGION = "us-east-2";
const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY;

export default function TripPlanner({
  places = [],
  onAddPlace = () => {},
  onRemovePlace = () => {},
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🧭 Get user location once
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
        () => setUserLocation([-122.009, 37.3349]) // Cupertino fallback
      );
    } else {
      setUserLocation([-122.009, 37.3349]);
    }
  }, []);

  // 🔍 Fetch nearby place suggestions
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
          coordinates: r.Position,
        })) || [];

      setSuggestions(results);
    } catch (err) {
      console.error("Suggest API error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // ✨ Fetch recommended events or nearby attractions
  useEffect(() => {
    if (!userLocation) return;
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`/places/v2/search-text?key=${API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            QueryText: "tourist attractions",
            BiasPosition: userLocation,
            MaxResults: 6,
          }),
        });
        const data = await res.json();
        const recs =
          data.ResultItems?.map((r) => ({
            title: r.Title,
            address: r.Address?.Label || "",
            placeId: r.PlaceId,
          })) || [];
        setRecommendations(recs);
      } catch (err) {
        console.error("Recommendations error:", err);
      }
    };
    fetchRecommendations();
  }, [userLocation]);

  const handleSelect = (place) => {
    setQuery("");
    setSuggestions([]);
    onAddPlace({
      title: place.title,
      coordinates: place.coordinates,
      address: place.address,
      placeId: place.placeId,
    });
  };

  const handleRemove = (index) => {
    onRemovePlace(index);
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-start gap-6 mt-[80px] px-6 text-white relative z-[9999]">
      {/* 🗺️ Left: Trip Plan List */}
      <div className="flex-1 bg-black/70 border border-white/30 rounded-xl p-4 backdrop-blur-md shadow-md max-w-2xl">
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
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🧭 Right: Add Stops & Events */}
      <div className="flex flex-col gap-6 w-full md:w-[350px]">
        {/* Add Stops Box */}
        <div className="bg-black/70 border border-white/30 rounded-xl p-4 backdrop-blur-md shadow-md">
          <h2 className="text-lg font-semibold mb-4">Add Stops</h2>

          <input
            type="text"
            placeholder="Search for a place..."
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              fetchSuggestions(value);
            }}
            className="w-full bg-transparent text-white placeholder-white/60
                       border-0 border-b border-white/40 pb-2
                       focus:border-white focus:outline-none focus:ring-0 mb-3"
          />

          {loading && (
            <p className="text-xs text-white/60 animate-pulse mb-2">
              Searching...
            </p>
          )}

          {suggestions.length > 0 && (
            <ul className="bg-black/90 text-white border border-white/30 rounded-xl
                           shadow-2xl backdrop-blur-xl overflow-hidden animate-fadeIn">
              {suggestions.map((s, i) => (
                <li
                  key={`${s.placeId ?? s.title}-${i}`}
                  onClick={() => handleSelect(s)}
                  className="p-2 hover:bg-white/20 cursor-pointer transition-colors"
                >
                  <span className="font-medium text-sm">{s.title}</span>
                  <p className="text-xs text-white/60 truncate">{s.address}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ✨ Recommended Events Box */}
        <div className="bg-black/70 border border-white/30 rounded-xl p-4 backdrop-blur-md shadow-md flex-1 h-[300px]">
          <h2 className="text-lg font-semibold mb-3">Nearby Attractions</h2>
          {recommendations.length === 0 ? (
            <p className="text-white/60 text-sm">Loading nearby spots...</p>
          ) : (
            <div className="overflow-y-auto max-h-[230px] pr-1 space-y-2">
              {recommendations.map((rec, i) => (
                <div
                  key={`${rec.placeId}-${i}`}
                  className="p-2 bg-white/5 rounded-lg border border-white/10"
                >
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-white/50">{rec.address}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
