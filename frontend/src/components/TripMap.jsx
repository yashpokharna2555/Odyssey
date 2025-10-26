import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";             
import "maplibre-gl/dist/maplibre-gl.css";

const AWS_REGION = "us-east-2";
const MAP_STYLE = "Monochrome";               
const API_KEY = import.meta.env.VITE_AWS_MAPS_API_KEY; 

export default function TripMap() {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
  
    useEffect(() => {
      const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${MAP_STYLE}/descriptor?key=${API_KEY}`;
  
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: styleUrl,
        center: [25.24, 36.31],
        zoom: 2,
      });
  
      map.addControl(new maplibregl.NavigationControl(), "top-right");
      mapRef.current = map;
  
      // Ensure the canvas matches the final container size
      const resizeOnce = () => map.resize();
      // 1) after map loads
      map.once("load", resizeOnce);
      // 2) after this render cycle
      requestAnimationFrame(resizeOnce);
      // 3) on window resizes
      const onWindowResize = () => map.resize();
      window.addEventListener("resize", onWindowResize);
  
      // Geolocation pin (optional)
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { longitude, latitude } = pos.coords;
            map.easeTo({ center: [longitude, latitude], zoom: 10 });
            new maplibregl.Marker({ color: "#ff4757" })
              .setLngLat([longitude, latitude])
              .setPopup(new maplibregl.Popup().setText("You are here"))
              .addTo(map);
          },
          () => {}, // ignore errors
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
  
      return () => {
        window.removeEventListener("resize", onWindowResize);
        map.remove();
      };
    }, []);
  
    return (
      <div className="bg-black min-h-[calc(100vh-80px)] pt-25 px-6">
        <div
          ref={containerRef}
          className="mx-auto h-[80vh] w-[90vw] max-w-[1200px] rounded-xl overflow-hidden shadow-lg"
        />
      </div>
    );
  }
