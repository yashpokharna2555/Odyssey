import React, { useEffect, useState } from "react";
import TripMap from "./TripMap";

const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY;

export default function TripPage() {
  const [places, setPlaces] = useState([]);
  const [startLocation, setStartLocation] = useState("");
  const [startLocationCoords, setStartLocationCoords] = useState(null); // Store start coordinates
  const [startQuery, setStartQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [startLoading, setStartLoading] = useState(false);

  const [stopQuery, setStopQuery] = useState("");
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [stopLoading, setStopLoading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mode, setMode] = useState("driving");
  const [loading, setLoading] = useState(false);
  const [tripResponse, setTripResponse] = useState(null);

  const [userLoc, setUserLoc] = useState(null);

  // Geolocate once
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc([pos.coords.longitude, pos.coords.latitude]),
        () => setUserLoc([-122.009, 37.3349])
      );
    } else setUserLoc([-122.009, 37.3349]);
  }, []);

  // Shared text search
  const searchText = async (text, setResults, setBusy) => {
    if (text.trim().length < 3 || !userLoc) {
      setResults([]);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/places/v2/search-text?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          QueryText: text,
          BiasPosition: userLoc,
          MaxResults: 6,
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
      setResults(results);
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => searchText(startQuery, setStartSuggestions, setStartLoading), 180);
    return () => clearTimeout(id);
  }, [startQuery, userLoc]);

  useEffect(() => {
    const id = setTimeout(() => searchText(stopQuery, setStopSuggestions, setStopLoading), 180);
    return () => clearTimeout(id);
  }, [stopQuery, userLoc]);

  const useCurrentStart = async () => {
    if (!userLoc) return alert("Unable to get current location");
    
    // Simple approach: just use coordinates as the label
    const label = `Current Location (${userLoc[1].toFixed(4)}, ${userLoc[0].toFixed(4)})`;
    setStartLocation(label);
    setStartLocationCoords(userLoc); // Store coordinates [lon, lat]
    setStartQuery(label);
    setStartSuggestions([]);
    
    console.log("✅ Using current location:", label, "Coords:", userLoc);
  };

  const addStop = (place) => {
    setPlaces((p) => [...p, place]);
    setStopQuery("");
    setStopSuggestions([]);
  };
  const removeStop = (idx) => setPlaces((p) => p.filter((_, i) => i !== idx));

  const initializeTrip = async () => {
    if (!startLocation || places.length === 0) {
      alert("Add a start location and at least one stop.");
      return;
    }
    setLoading(true);
    try {
      const stops = places.map((p) => [p.title, p.placeId]);
      const token = sessionStorage.getItem("access_token");
      const toISO = (d, t) => (d && t ? new Date(`${d}T${t}`).toISOString() : new Date().toISOString());
      const body = {
        startLocation,
        ...(startLocationCoords && { startLocationCoords }), // Include coords if available
        startTime: toISO(startDate, startTime),
        endTime: toISO(endDate, endTime),
        mode,
        stops,
      };
      console.log("🚀 Sending trip init request with start coords:", body);
      const res = await fetch(`/api/prod/trip/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setTripResponse(res.ok ? data : null);
    } catch {
      setTripResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // Build map places - include start location if we have trip response
  const mapPlaces = tripResponse?.itinerary
    ? [
        // Add start location as first point
        ...(startLocationCoords ? [{
          title: startLocation,
          coordinates: startLocationCoords, // [lon, lat]
          address: "Start",
          isStart: true,
        }] : []),
        // Then add all itinerary stops
        ...tripResponse.itinerary.map((it) => ({
          title: it.spotname,
          coordinates: [it.coordinates.lon, it.coordinates.lat],
          address: it.reason,
        }))
      ]
    : places;

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      <div className="flex pt-24 px-5 gap-5 h-[calc(100vh-6rem)]">
        {/* MAP - Left 50% (Fixed) */}
        <div className="w-1/2">
          <div className="h-full rounded-2xl overflow-hidden sticky top-24">
            <TripMap places={mapPlaces} className="w-full h-full" />
          </div>
        </div>

        {/* RIGHT SIDE - 50% split into two columns */}
        <div className="w-1/2 flex gap-5 overflow-y-auto">
          {/* Trip Details - 25% of screen */}
          <div className="w-1/2">
            <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl">
              <div className="p-5 flex flex-col gap-5">
                <h2 className="text-lg font-semibold text-white">Trip Details</h2>

                {/* Start Date */}
                <Field label="Start Date">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 hover:bg-white/15 transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </Field>

                {/* Start Time */}
                <Field label="Start Time (24h)">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    step="900"
                    className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 hover:bg-white/15 transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </Field>

                {/* End Date */}
                <Field label="End Date">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 hover:bg-white/15 transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </Field>

                {/* End Time */}
                <Field label="End Time (24h)">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    step="900"
                    className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 hover:bg-white/15 transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </Field>

                {/* Mode */}
                <Field label="Travel Mode">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 hover:bg-white/15 transition-all cursor-pointer"
                  >
                    <option className="bg-gray-900 text-white" value="driving">Driving</option>
                    <option className="bg-gray-900 text-white" value="walking">Walking</option>
                    <option className="bg-gray-900 text-white" value="cycling">Cycling</option>
                  </select>
                </Field>

                {/* Initialize */}
                <div className="flex justify-end">
                  <button
                    onClick={initializeTrip}
                    disabled={loading || !startQuery || places.length === 0}
                    className="rounded-full bg-white text-black px-6 py-2 font-semibold hover:bg-white/90 disabled:opacity-50"
                  >
                    {loading ? "Initializing…" : "Initialize Trip"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Stops - 25% of screen */}
          <div className="w-1/2">
            <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl">
              <div className="p-5 flex flex-col gap-5">
                <h2 className="text-lg font-semibold text-white">Add Stops</h2>
                
                {/* Start Location */}
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <label className="text-[11px] uppercase tracking-wide text-white/70">
                      Start Location
                    </label>
                    <button
                      className="text-xs underline text-white/80 hover:text-white"
                      onClick={useCurrentStart}
                    >
                      Use Current
                    </button>
                  </div>
                  <input
                    value={startQuery}
                    onChange={(e) => setStartQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 px-0 py-2 placeholder-white/60"
                  />
                  {startLoading && (
                    <span className="absolute right-0 -bottom-5 text-[11px] text-white/70">
                      Searching…
                    </span>
                  )}
                  {startSuggestions.length > 0 && (
                    <ul className="absolute z-50 mt-2 w-full bg-black/90 border border-white/20 rounded-md max-h-60 overflow-auto">
                      {startSuggestions.map((s, i) => (
                        <li
                          key={`${s.placeId ?? s.title}-${i}`}
                          className="px-3 py-2 hover:bg-white/10 cursor-pointer"
                          onClick={() => {
                            setStartLocation(s.title);
                            setStartLocationCoords(s.coordinates); // Store coordinates [lon, lat]
                            setStartQuery(s.title);
                            setStartSuggestions([]);
                          }}
                        >
                          <div className="text-sm">{s.title}</div>
                          {s.address && <div className="text-xs text-white/60 truncate">{s.address}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Add Stop */}
                <div className="relative">
                  <label className="text-[11px] uppercase tracking-wide text-white/70">
                    Add Stop
                  </label>
                  <input
                    value={stopQuery}
                    onChange={(e) => setStopQuery(e.target.value)}
                    placeholder="Search a place to add…"
                    className="w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 px-0 py-2 placeholder-white/60"
                  />
                  {stopLoading && (
                    <span className="absolute right-0 -bottom-5 text-[11px] text-white/70">
                      Searching…
                    </span>
                  )}
                  {stopSuggestions.length > 0 && (
                    <ul className="absolute z-50 mt-2 w-full bg-black/90 border border-white/20 rounded-md max-h-60 overflow-auto">
                      {stopSuggestions.map((s, i) => (
                        <li
                          key={`${s.placeId ?? s.title}-${i}`}
                          className="px-3 py-2 hover:bg-white/10 cursor-pointer"
                          onClick={() => addStop(s)}
                        >
                          <div className="text-sm">{s.title}</div>
                          {s.address && <div className="text-xs text-white/60 truncate">{s.address}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Your Stops */}
                <div>
                  <label className="text-[11px] uppercase tracking-wide text-white/70 mb-2 block">
                    Your Stops ({places.length})
                  </label>
                  {places.map((p, i) => (
                    <span
                      key={`${p.placeId}-${i}`}
                      className="inline-flex items-center gap-2 px-3 py-1 mr-2 mb-2 rounded-full bg-white/10 border border-white/20 text-sm"
                    >
                      #{i + 1} {p.title}
                      <button className="text-white/70 hover:text-white" onClick={() => removeStop(i)}>
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* TRIP ITINERARY */}
                {tripResponse?.itinerary && (
                  <div className="mt-3">
                    <h3 className="text-lg font-semibold text-white mb-3">Trip Itinerary</h3>
                    <div className="text-sm text-white/70 mb-4">
                      {tripResponse.tripId && (
                        <div>Trip ID: <span className="text-white font-mono text-xs">{tripResponse.tripId}</span></div>
                      )}
                      {typeof tripResponse.tripDurationMinutes === "number" && (
                        <div>Duration: <span className="text-white">{tripResponse.tripDurationMinutes} min</span></div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {tripResponse.itinerary.map((item, idx) => (
                        <div
                          key={`${item.spotname}-${idx}`}
                          className="bg-black/40 border border-white/20 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-white/60">#{idx + 1}</span>
                            <h4 className="text-sm font-semibold text-white">{item.spotname}</h4>
                          </div>
                          {item.reason && (
                            <p className="text-xs text-white/70 mb-1">{item.reason}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-white/60">
                            {item.reachtime && (
                              <span>Arrive: <span className="text-white/80">{item.reachtime}</span></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wide text-white/70">{label}</label>
      {children}
    </div>
  );
}
