import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const AWS_REGION = "us-east-2";
const MAP_STYLE = "Standard";
const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY;

export default function TripMap({ places = [], className = "" }) {
  const mapShellRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // init
  useEffect(() => {
    if (!mapShellRef.current) return;

    const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${MAP_STYLE}/descriptor?key=${API_KEY}`;
    const map = new maplibregl.Map({
      container: mapShellRef.current,
      style: styleUrl,
      center: [-122.009, 37.3349],
      zoom: 3,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

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

    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      map.remove();
    };
  }, []);

  // markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((p, i) => {
      const coords = p.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) return;
      const [lon, lat] = coords;
      if (Number.isNaN(lon) || Number.isNaN(lat)) return;

      const marker = new maplibregl.Marker({ color: i === 0 ? "#00BFFF" : "#FF4500" })
        .setLngLat([lon, lat])
        .setPopup(new maplibregl.Popup().setHTML(`<b>${p.title}</b><br/>${p.address || ""}`))
        .addTo(map);

      markersRef.current.push(marker);

      if (i === places.length - 1) {
        map.flyTo({ center: [lon, lat], zoom: 10, speed: 0.8, curve: 1.3 });
      }
    });
  }, [places]);

  // line
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const coords = places
      .map((p) => p.coordinates)
      .filter((c) => Array.isArray(c) && c.length === 2);

    const draw = () => {
      if (map.getLayer("trip-route")) map.removeLayer("trip-route");
      if (map.getSource("trip-route")) map.removeSource("trip-route");

      if (coords.length < 2) return;

      map.addSource("trip-route", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: coords } },
      });
      map.addLayer({
        id: "trip-route",
        type: "line",
        source: "trip-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#00FFFF", "line-width": 6, "line-opacity": 0.9, "line-blur": 0.3 },
      });

      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 60, duration: 1000 });
    };

    if (map.loaded()) draw();
    else map.once("load", draw);
  }, [places]);

  // Not absolute anymore — the page controls the size/placement.
  return (
    <div className={`mt-20 rounded-xl overflow-hidden ${className}`}>
      <div ref={mapShellRef} className="h-full w-full" />
    </div>
  );
}
