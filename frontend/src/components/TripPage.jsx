import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TripMap from "./TripMap";
import Arrow from "../assets/arrow.svg";

const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY;

// Format minutes into hours and minutes
const formatDuration = (minutes) => {
  if (!minutes || typeof minutes !== "number" || minutes <= 0) {
    return "0 minutes";
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} ${mins === 1 ? "minute" : "minutes"}`;
  }
  if (mins === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} ${mins === 1 ? "minute" : "minutes"}`;
};

export default function TripPage() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [startLocation, setStartLocation] = useState("");
  const [startLocationCoords, setStartLocationCoords] = useState(null);
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

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState("today");

  const [userLoc, setUserLoc] = useState(null);
  
  const [autoSuggestions, setAutoSuggestions] = useState([]);
  const [autoSuggestionsLoading, setAutoSuggestionsLoading] = useState(false);
  const [suggestionSource, setSuggestionSource] = useState(null);

  // 🗓️ Handle date tab selection
  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const daysUntilSaturday = 6 - dayOfWeek;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    switch(tab) {
      case "today":
        setStartDate(formatDate(today));
        setEndDate(formatDate(today));
        break;
      case "tomorrow":
        setStartDate(formatDate(tomorrow));
        setEndDate(formatDate(tomorrow));
        break;
      case "weekend":
        setStartDate(formatDate(saturday));
        setEndDate(formatDate(saturday));
        break;
    }
  };

  // 🧭 Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc([pos.coords.longitude, pos.coords.latitude]),
        () => setUserLoc([-122.009, 37.3349])
      );
    } else setUserLoc([-122.009, 37.3349]);
  }, []);

  // 🔍 Shared text search
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
    const id = setTimeout(
      () => searchText(startQuery, setStartSuggestions, setStartLoading),
      180
    );
    return () => clearTimeout(id);
  }, [startQuery, userLoc]);

  useEffect(() => {
    const id = setTimeout(
      () => searchText(stopQuery, setStopSuggestions, setStopLoading),
      180
    );
    return () => clearTimeout(id);
  }, [stopQuery, userLoc]);

  const useCurrentStart = async () => {
    if (!userLoc) return alert("Unable to get current location");
    const label = `Current Location (${userLoc[1].toFixed(
      4
    )}, ${userLoc[0].toFixed(4)})`;
    setStartLocation(label);
    setStartLocationCoords(userLoc);
    setStartQuery(label);
    setStartSuggestions([]);
  };

  const addStop = (place) => {
    setPlaces((p) => [...p, place]);
    setStopQuery("");
    setStopSuggestions([]);
  };
  const removeStop = (idx) => setPlaces((p) => p.filter((_, i) => i !== idx));

  // 💡 Fetch auto smart suggestions based on selected location
  const fetchAutoSuggestions = async (biasPosition = null, sourceName = null) => {
    setAutoSuggestionsLoading(true);
    try {
      const position = biasPosition || userLoc || [-122.009, 37.3349];
      
      // Fetch popular places based on provided location
      const res = await fetch(`/places/v2/search-text?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          QueryText: "popular attractions, restaurants, landmarks, museums, parks",
          BiasPosition: position,
          MaxResults: 8,
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
      
      setAutoSuggestions(results);
      setSuggestionSource(sourceName);
    } catch (err) {
      console.error("Error fetching auto suggestions:", err);
      setAutoSuggestions([]);
    } finally {
      setAutoSuggestionsLoading(false);
    }
  };

  // Update suggestions when start location changes
  useEffect(() => {
    if (startLocationCoords) {
      fetchAutoSuggestions(startLocationCoords, startLocation);
    }
  }, [startLocationCoords, startLocation]);

  // Initial load with user location
  useEffect(() => {
    if (userLoc && !startLocationCoords) {
      fetchAutoSuggestions(null, "Your Location");
    }
  }, [userLoc]);

  const initializeTrip = async () => {
    if (!startLocation || places.length === 0) {
      alert("Add a start location and at least one stop.");
      return;
    }
    setLoading(true);
    try {
      const stops = places.map((p) => [p.title, p.placeId]);
      const token = sessionStorage.getItem("access_token");
      const toISO = (d) =>
        d ? new Date(`${d}T09:00:00`).toISOString() : new Date().toISOString();
      const body = {
        startLocation,
        ...(startLocationCoords && { startLocationCoords }),
        startTime: toISO(startDate),
        endTime: toISO(endDate),
        mode,
        stops,
      };
      console.log("🚀 Sending trip init request with start coords:", body);
      const res = await fetch(`/api/prod/trip/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setTripResponse(res.ok ? data : null);
      
      // If trip initialized successfully, save it to the API
      if (res.ok && data.tripId) {
        try {
          const email = "user@example.com"; // TODO: Get actual user email
          
          const saveData = {
            tripId: data.tripId,
            email: email,
            userId: "test-user-123" // TODO: Get actual user ID
          };

          await fetch("/api/prod/trip/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(saveData)
          });
        } catch (saveError) {
          console.error("Error saving trip to API:", saveError);
          // Don't fail the whole operation if save fails
        }
      }
    } catch {
      setTripResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // 🎫 Fetch events when trip is initialized
  const fetchEvents = async () => {
    if (!tripResponse?.itinerary || !startLocation) {
      console.log("⚠️ Cannot fetch events - missing tripResponse or startLocation");
      return;
    }
    
    console.log("🔍 Fetching events for:", startLocation);
    setEventsLoading(true);
    try {
      const url = `/serpapi/search.json?engine=google_events&q=Events+in+San+Francisco&gl=us&hl=en&api_key=${import.meta.env.VITE_SERPAPI_KEY || ""}`;
      console.log("🌐 Fetching from:", url.replace(/api_key=[^&]+/, "api_key=***"));
      
      const res = await fetch(url);
      const data = await res.json();
      console.log("🎫 Events response:", data);
      
      if (data.events_results && data.events_results.length > 0) {
        console.log("✅ Found", data.events_results.length, "events");
        setEvents(data.events_results);
      } else {
        console.log("⚠️ No events found in response");
        setEvents([]);
      }
    } catch (err) {
      console.error("❌ Error fetching events:", err);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (tripResponse?.itinerary && startLocation) {
      fetchEvents();
    }
  }, [tripResponse, startLocation]);

  // 📍 Add event to itinerary
  const addEventToItinerary = async (event) => {
    // Extract event location details
    const eventTitle = event.title || "Untitled Event";
    const eventAddress = Array.isArray(event.address) ? event.address[0] : event.address;
    
    // Check if event has location data
    if (event.location?.latitude && event.location?.longitude) {
      const coords = [event.location.longitude, event.location.latitude];
      const place = {
        title: eventTitle,
        placeId: event.event_id || `event_${Date.now()}`,
        coordinates: coords,
        address: eventAddress || "",
        isEvent: true,
      };
      
      addStop(place);
      console.log("✅ Added event to itinerary:", place);
    } else if (eventAddress) {
      // Search for the address to get coordinates
      console.log("🔍 Searching for event location:", eventAddress);
      
      try {
        const res = await fetch(`/places/v2/search-text?key=${API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            QueryText: eventAddress,
            BiasPosition: userLoc || [-122.009, 37.3349],
            MaxResults: 1,
          }),
        });
        
        const data = await res.json();
        const results = data.ResultItems || [];
        
        if (results.length > 0 && results[0].Position) {
          const place = {
            title: eventTitle,
            placeId: event.event_id || `event_${Date.now()}`,
            coordinates: results[0].Position,
            address: results[0].Address?.Label || eventAddress,
            isEvent: true,
          };
          
          addStop(place);
          console.log("✅ Added event to itinerary after search:", place);
        } else {
          console.log("⚠️ No location found for:", eventAddress);
          alert(`Could not find location for "${eventTitle}". Please search for it manually.`);
        }
      } catch (err) {
        console.error("❌ Error searching for event location:", err);
        alert(`Could not search for "${eventTitle}". Please try again.`);
      }
    } else {
      alert(`Event "${eventTitle}" - No location data available`);
    }
  };

  // 🎟️ Book tickets
  const bookTickets = (event) => {
    if (event.ticket_info?.extensions?.link) {
      window.open(event.ticket_info.extensions.link, "_blank");
    } else if (event.link) {
      window.open(event.link, "_blank");
    } else {
      alert("No booking link available for this event");
    }
  };

  const mapPlaces = tripResponse?.itinerary
    ? [
        ...(startLocationCoords
          ? [
              {
                title: startLocation,
                coordinates: startLocationCoords,
                address: "Start",
                isStart: true,
              },
            ]
          : []),
        ...tripResponse.itinerary.map((it) => ({
          title: it.spotname,
          coordinates: [it.coordinates.lon, it.coordinates.lat],
          address: it.reason,
        })),
      ]
    : places;

  return (
    <div className="min-h-screen w-screen bg-black text-white">
      <div className="pt-24 px-5">
        <div className="flex gap-5">
          {/* 🌍 Left - Map */}
          <div className="w-1/2">
            <div className="h-[calc(100vh-6rem)] rounded-2xl overflow-hidden sticky top-24">
              <TripMap places={mapPlaces} className="w-full h-full" />
            </div>
          </div>

          {/* 🧩 Right Panel (scrollable) */}
          <div className="w-1/2 flex flex-col gap-5 h-[calc(100vh-6rem)] overflow-y-auto pb-10">
            {/* TOP ROW: Trip Details + Add Stops */}
            <div className="flex gap-5">
              {/* Trip Details */}
              <div className="w-1/2">
                <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl">
                  <div className="p-5 flex flex-col gap-5">
                    <h2 className="text-lg font-semibold text-white">
                      Trip Details
                    </h2>

                    {/* Date Tabs */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTabSelect("today")}
                        className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          activeTab === "today"
                            ? "bg-white text-black"
                            : "bg-white/10 text-white border border-white/30"
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => handleTabSelect("tomorrow")}
                        className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          activeTab === "tomorrow"
                            ? "bg-white text-black"
                            : "bg-white/10 text-white border border-white/30"
                        }`}
                      >
                        Tomorrow
                      </button>
                      <button
                        onClick={() => handleTabSelect("weekend")}
                        className={`flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          activeTab === "weekend"
                            ? "bg-white text-black"
                            : "bg-white/10 text-white border border-white/30"
                        }`}
                      >
                        Weekend
                      </button>
                    </div>

                    <Field label="Start Date">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 hover:bg-white/15 transition-all"
                      />
                    </Field>

                    <Field label="End Date">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 hover:bg-white/15 transition-all"
                      />
                    </Field>

                    <Field label="Start Time">
                      <div className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5">
                        09:00 (default)
                      </div>
                    </Field>

                    <Field label="End Time">
                      <div className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5">
                        18:00 (default)
                      </div>
                    </Field>

                    <Field label="Travel Mode">
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full bg-white/10 text-white border border-white/30 rounded-lg px-4 py-2.5 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 hover:bg-white/15 transition-all cursor-pointer"
                      >
                        <option value="driving">Driving</option>
                        <option value="walking">Walking</option>
                        <option value="cycling">Cycling</option>
                      </select>
                    </Field>

                    <div className="flex justify-end">
                      <button
                        onClick={initializeTrip}
                        disabled={loading || !startLocation || places.length === 0}
                        className="rounded-full bg-white text-black px-6 py-2 font-semibold hover:bg-white/90 disabled:opacity-50"
                      >
                        {loading ? "Initializing…" : "Initialize Trip"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Stops */}
              <div className="w-1/2">
                <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl">
                  <div className="p-5 flex flex-col gap-5">
                    <h2 className="text-lg font-semibold text-white">
                      Add Stops
                    </h2>

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
                      {startSuggestions.length > 0 && (
                        <ul className="absolute z-50 mt-2 w-full bg-black/90 border border-white/20 rounded-md max-h-60 overflow-auto">
                          {startSuggestions.map((s, i) => (
                            <li
                              key={`${s.placeId ?? s.title}-${i}`}
                              className="px-3 py-2 hover:bg-white/10 cursor-pointer"
                              onClick={() => {
                                setStartLocation(s.title);
                                setStartLocationCoords(s.coordinates);
                                setStartQuery(s.title);
                                setStartSuggestions([]);
                              }}
                            >
                              <div className="text-sm">{s.title}</div>
                              {s.address && (
                                <div className="text-xs text-white/60 truncate">
                                  {s.address}
                                </div>
                              )}
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
                      {stopSuggestions.length > 0 && (
                        <ul className="absolute z-50 mt-2 w-full bg-black/90 border border-white/20 rounded-md max-h-60 overflow-auto">
                          {stopSuggestions.map((s, i) => (
                            <li
                              key={`${s.placeId ?? s.title}-${i}`}
                              className="px-3 py-2 hover:bg-white/10 cursor-pointer"
                              onClick={() => addStop(s)}
                            >
                              <div className="text-sm">{s.title}</div>
                              {s.address && (
                                <div className="text-xs text-white/60 truncate">
                                  {s.address}
                                </div>
                              )}
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
                        <div key={`${p.placeId}-${i}`} className="inline-flex items-center gap-2 mr-2 mb-2">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
                            #{i + 1} {p.title}
                          </span>
                          <button
                            className="text-xs text-white/70 hover:text-white bg-white/5 px-2 py-1 rounded border border-white/20 hover:bg-white/10"
                            onClick={() => fetchAutoSuggestions(p.coordinates, p.title)}
                            title="Get suggestions nearby"
                          >
                            💡
                          </button>
                          <button
                            className="text-white/70 hover:text-white"
                            onClick={() => removeStop(i)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Auto Smart Suggestions */}
                    <div>
                      <label className="text-[11px] uppercase tracking-wide text-white/70 mb-2 block">
                        💡 Popular Places Nearby
                        {suggestionSource && (
                          <span className="lowercase font-normal"> (near {suggestionSource})</span>
                        )}
                      </label>
                      {autoSuggestionsLoading ? (
                        <div className="text-xs text-white/50 py-3">Loading suggestions...</div>
                      ) : autoSuggestions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {autoSuggestions.map((suggestion) => {
                            const isAlreadyAdded = places.some(p => p.placeId === suggestion.placeId);
                            return (
                              <button
                                key={suggestion.placeId}
                                onClick={() => !isAlreadyAdded && addStop(suggestion)}
                                className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                                  isAlreadyAdded
                                    ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
                                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40'
                                }`}
                                disabled={isAlreadyAdded}
                              >
                                + {suggestion.title}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    {/* Events Box */}
                    <div
                      onClick={() => navigate("/events")}
                      className="mt-3 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-6 cursor-pointer hover:bg-black/90 transition-all relative"
                    >
                      <h3 className="text-[48px] font-semibold text-white mb-2">
                        Events
                      </h3>
                      <img
                        src={Arrow}
                        alt=""
                        className="absolute bottom-6 right-6 w-6 h-6 rotate-45"
        />
      </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ TRIP ITINERARY BELOW */}
            {tripResponse?.itinerary && (
              <div className="rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Trip Itinerary
                  </h3>
                  <div className="flex gap-6 text-sm text-white/70">
                    {tripResponse.tripId && (
                      <div>
                        <span className="text-white/60">Trip ID:</span>{" "}
                        <span className="text-white font-mono">
                          {tripResponse.tripId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tripResponse.itinerary.map((item, idx) => (
                    <div
                      key={`${item.spotname}-${idx}`}
                      className="bg-black/40 border border-white/20 rounded-lg p-4 hover:bg-black/60 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-black border-2 border-white flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            #{idx + 1}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-white">
                          {item.spotname}
                        </h4>
                      </div>
                      {item.reason && (
                        <p className="text-sm text-white/70 mb-3">
                          {item.reason}
                        </p>
                      )}
                      {item.reachtime && (
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <span className="font-medium">Arrival Time:</span>
                          <span className="text-white/80 font-mono">
                            {item.reachtime}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Save Button at Bottom */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={async () => {
                      console.log("Save itinerary button clicked", { tripResponse });
                      try {
                        const token = sessionStorage.getItem("access_token");
                        const email = sessionStorage.getItem("user_email") || "123@test.com";
                        
                        console.log("Attempting to save trip to API...");
                        // Save to API
                        const saveData = {
                          tripId: tripResponse.tripId,
                          email: email,
                          userId: "test-user-123" // TODO: Get actual user ID
                        };

                        console.log("Sending save request:", saveData);
          const response = await fetch("/api/prod/trip/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(saveData)
          });

                        console.log("Response status:", response.status);
                        if (response.ok) {
                          console.log("Trip saved successfully to API");
                          // Also save to localStorage
                          const itineraryData = {
                            itinerary: tripResponse.itinerary,
                            tripId: tripResponse.tripId,
                            duration: tripResponse.tripDurationMinutes,
                            savedAt: new Date().toISOString(),
                          };
                          localStorage.setItem("savedItinerary", JSON.stringify(itineraryData));
                          console.log("Itinerary saved to localStorage:", itineraryData);
                          alert("Itinerary saved to Memories!");
                        } else {
                          const error = await response.json();
                          console.error("Failed to save trip:", error);
                          alert(`Failed to save: ${error.message || "Unknown error"}`);
                        }
                      } catch (error) {
                        console.error("Error saving trip:", error);
                        alert("Failed to save trip. Please try again.");
                      }
                    }}
                    className="flex items-center gap-2 rounded-full bg-white text-black px-6 py-2 text-sm font-semibold hover:bg-white/90 transition-all"
                  >
                    <span className="text-xl">+</span>
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wide text-white/70">
        {label}
      </label>
      {children}
    </div>
  );
}
