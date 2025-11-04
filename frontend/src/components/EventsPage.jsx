import React, { useState, useEffect } from "react";
import Arrow from "../assets/arrow.svg";
import TripMap from "./TripMap";

const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY;

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [cityName, setCityName] = useState("San Francisco");

  // 🎫 Fetch events
  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const url = `/serpapi/search.json?engine=google_events&q=Events+in+${encodeURIComponent(cityName)}&gl=us&hl=en&api_key=${import.meta.env.VITE_SERPAPI_KEY || ""}`;
      console.log("🌐 Fetching events from:", url.replace(/api_key=[^&]+/, "api_key=***"));
      
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
    fetchEvents();
  }, [cityName]);

  // 📍 Add event to itinerary
  const addEventToItinerary = async (event) => {
    const eventTitle = event.title || "Untitled Event";
    const eventAddress = Array.isArray(event.address) ? event.address[0] : event.address;
    
    if (event.location?.latitude && event.location?.longitude) {
      const coords = [event.location.longitude, event.location.latitude];
      // For now, just log the event details
      console.log("✅ Event to add:", { eventTitle, coords, eventAddress });
      alert(`Event "${eventTitle}" ready to be added to itinerary`);
    } else if (eventAddress) {
      alert(`Event "${eventTitle}" - Please add manually with address: ${eventAddress}`);
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

  // Build map places from events
  const mapPlaces = events
    .filter((event) => event.location?.latitude && event.location?.longitude)
    .slice(0, 10)
    .map((event, idx) => ({
      title: event.title || "Event",
      coordinates: [event.location.longitude, event.location.latitude],
      address: Array.isArray(event.address) ? event.address[0] : event.address || "",
      isEvent: true,
      eventIndex: idx,
    }));

  return (
    <div className="min-h-screen w-screen bg-black text-white pt-24">
      <div className="px-5 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Events</h1>
          <p className="text-white/70">Discover exciting events happening near you</p>
        </div>

        <div className="flex gap-5">
          {/* Events List */}
          <div className="w-1/2 overflow-y-auto max-h-[calc(100vh-12rem)] pr-3">
            {eventsLoading && events.length === 0 ? (
              <div className="text-center py-12 text-white/70">
                <p>Loading events for {cityName}...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-white/70">
                <p>No events found for {cityName}</p>
                <p className="text-xs mt-2">Add VITE_SERPAPI_KEY to your .env file</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.slice(0, 10).map((event, idx) => (
                  <div
                    key={`${event.event_id || event.title || idx}`}
                    className="bg-black/40 border border-white/20 rounded-lg p-4 hover:bg-black/60 transition-all"
                  >
                    {/* Event Image */}
                    {event.thumbnail && (
                      <div className="w-full h-48 overflow-hidden rounded-lg mb-3">
                        <img
                          src={event.thumbnail}
                          alt={event.title || "Event"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Event Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {event.title || "Event"}
                      </h3>
                      
                      {event.date?.when && (
                        <p className="text-sm text-white/70 mb-2">
                          📅 {event.date.when}
                        </p>
                      )}
                      
                      {event.address && (
                        <p className="text-sm text-white/60 mb-3 truncate">
                          📍 {Array.isArray(event.address) ? event.address[0] : event.address}
                        </p>
                      )}

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => addEventToItinerary(event)}
                          className="flex-1 flex items-center justify-start gap-2 rounded-full bg-black border-2 border-white text-white px-4 py-2 text-sm font-semibold hover:bg-white hover:text-black transition-all"
                        >
                          <span className="text-xl">+</span>
                          Add to Itinerary
                        </button>
                        <button
                          onClick={() => bookTickets(event)}
                          className="flex-1 flex items-center justify-start gap-2 rounded-full bg-black border-2 border-white text-white px-4 py-2 text-sm font-semibold hover:bg-white hover:text-black transition-all"
                        >
                          <img src={Arrow} alt="" className="w-4 h-4 rotate-45" />
                          Book Tickets
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="w-1/2">
            <div className="h-[calc(100vh-12rem)] rounded-2xl overflow-hidden">
              <TripMap places={mapPlaces} className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

