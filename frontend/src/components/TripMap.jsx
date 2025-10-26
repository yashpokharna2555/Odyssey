import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const AWS_REGION = "us-east-2";
const MAP_STYLE = "Standard";
const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY;

export default function TripMap({ places = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // 🗺️ Initialize map once
  useEffect(() => {
    const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${MAP_STYLE}/descriptor?key=${API_KEY}`;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [-122.009, 37.3349],
      zoom: 3,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    // 🧭 Add user location marker
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          map.easeTo({ center: [longitude, latitude], zoom: 10 });
          new maplibregl.Marker({ color: "#00BFFF" })
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.Popup().setText("You are here"))
            .addTo(map);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    const resize = () => map.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      map.remove();
    };
  }, []);

  // 📍 Add markers whenever places update
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((place, i) => {
      if (!place.coordinates || place.coordinates.length !== 2) return;
      const [lon, lat] = place.coordinates;
      if (isNaN(lon) || isNaN(lat)) return;

      const marker = new maplibregl.Marker({ color: "#FF4500" })
        .setLngLat([lon, lat])
        .setPopup(
          new maplibregl.Popup().setHTML(
            `<b>${place.title}</b><br/>${place.address || ""}`
          )
        )
        .addTo(map);

      markersRef.current.push(marker);

      // Fly to last added
      if (i === places.length - 1) {
        map.flyTo({ center: [lon, lat], zoom: 10, speed: 0.8, curve: 1.3 });
      }
    });
  }, [places]);

  // 🛣️ Draw a connecting route
  useEffect(() => {
    const map = mapRef.current;
    if (!map || places.length < 2) return;

    const coords = places
      .filter((p) => Array.isArray(p.coordinates) && p.coordinates.length === 2)
      .map((p) => p.coordinates);

    if (coords.length < 2) return;

    console.log("🧭 Drawing route with coords:", coords);

    // Wait for map to be ready before adding sources/layers
    map.once("load", () => {
      // Remove old route if exists
      if (map.getLayer("trip-route")) map.removeLayer("trip-route");
      if (map.getSource("trip-route")) map.removeSource("trip-route");

      const geojson = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
      };

      map.addSource("trip-route", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "trip-route",
        type: "line",
        source: "trip-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#00FFFF",
          "line-width": 6,
          "line-opacity": 0.9,
          "line-blur": 0.3,
        },
      });

      // Fit bounds to route
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 60, duration: 1000 });
    });
  }, [places]);

  return (
    <div className="bg-black flex justify-center items-center p-6">
      <div
        ref={containerRef}
        className="h-[70vh] w-[60vw] rounded-xl overflow-hidden shadow-lg border border-white/20"
      />
    </div>
  );
}
