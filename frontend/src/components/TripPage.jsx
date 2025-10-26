import React, { useEffect, useState } from "react";
import TripMap from "./TripMap";

const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY;

export default function TripPage() {
  const [places, setPlaces] = useState([]);
  const [startLocation, setStartLocation] = useState("");
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
    try {
      const res = await fetch(`/places/v2/search-position?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Position: userLoc }),
      });
      const data = await res.json();
      const label = data.Result?.Place?.Label || "Current Location";
      setStartLocation(label);
      setStartQuery(label);
      setStartSuggestions([]);
    } catch {
      setStartLocation("Current Location");
      setStartQuery("Current Location");
    }
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
        startTime: toISO(startDate, startTime),
        endTime: toISO(endDate, endTime),
        mode,
        stops,
      };
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

  const mapPlaces = tripResponse?.itinerary
    ? tripResponse.itinerary.map((it) => ({
        title: it.spotname,
        coordinates: [it.coordinates.lon, it.coordinates.lat],
        address: it.reason,
      }))
    : places;

  return (
    <div className="min-h-screen w-screen bg-black text-white flex flex-col">
      {/* MAP */}
      <div className="px-5 pt-5">
        <div className="h-[65vh] min-h-[360px] rounded-2xl overflow-hidden">
          <TripMap places={mapPlaces} className="w-full h-full" />
        </div>
      </div>

      {/* FORM CARD */}
      <div className="px-5 pb-5">
        <div className="mt-20 mx-auto w-full max-w-3xl rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl">
          <div className="p-5 flex flex-col gap-5">
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

            {/* Start Date */}
            <Field label="Start Date">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 px-0 py-2"
              />
            </Field>

            {/* Start Time */}
            <Field label="Start Time">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 px-0 py-2"
              />
            </Field>

            {/* End Date */}
            <Field label="End Date">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 px-0 py-2"
              />
            </Field>

            {/* End Time */}
            <Field label="End Time">
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 px-0 py-2"
              />
            </Field>

            {/* Mode */}
            <Field label="Mode">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 px-0 py-2"
              >
                <option className="bg-black" value="driving">Driving</option>
                <option className="bg-black" value="walking">Walking</option>
                <option className="bg-black" value="cycling">Cycling</option>
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

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {places.map((p, i) => (
                <span
                  key={`${p.placeId ?? p.title}-${i}`}
                  className="inline-flex items-center gap-2 rounded-full bg-black/50 border border-white/15 px-3 py-1 text-sm"
                >
                  #{i + 1} {p.title}
                  <button className="text-white/70 hover:text-white" onClick={() => removeStop(i)}>
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TRIP ITINERARY — shows after Initialize Trip */}
      {tripResponse?.itinerary && (
        <div className="px-5 pb-8">
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl">
            <div className="p-5">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white">Trip Itinerary</h3>
                <div className="mt-1 text-sm text-white/70 flex flex-wrap gap-4">
                  {tripResponse.tripId && (
                    <span>
                      Trip ID: <span className="text-white font-mono">{tripResponse.tripId}</span>
                    </span>
                  )}
                  {typeof tripResponse.tripDurationMinutes === "number" && (
                    <span>
                      Duration:{" "}
                      <span className="text-white">{tripResponse.tripDurationMinutes} minutes</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {tripResponse.itinerary.map((item, idx) => (
                  <div
                    key={`${item.spotname}-${idx}`}
                    className="bg-black/40 border border-white/20 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl font-bold text-white/60">#{idx + 1}</span>
                          <h4 className="text-lg font-semibold text-white">{item.spotname}</h4>
                        </div>
                        {item.reason && (
                          <p className="text-sm text-white/70 mb-2">{item.reason}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-white/60">
                          {item.reachtime && (
                            <span>
                              Arrive by:{" "}
                              <span className="text-white/80 font-medium">{item.reachtime}</span>
                            </span>
                          )}
                          {item.coordinates && (
                            <span>
                              Coordinates:{" "}
                              <span className="text-white/80 font-mono">
                                {Number(item.coordinates.lat).toFixed(5)},{" "}
                                {Number(item.coordinates.lon).toFixed(5)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}
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
