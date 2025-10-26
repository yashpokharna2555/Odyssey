import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { LocationClient, CalculateRouteCommand } from "@aws-sdk/client-location";
import { fetchAuthSession } from "aws-amplify/auth";

const AWS_REGION = import.meta.env.VITE_AWS_REGION || "us-east-2";
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

      // Create custom marker - "Start" for first, then numbered
      const el = document.createElement('div');
      el.style.width = i === 0 ? '42px' : '36px';
      el.style.height = i === 0 ? '42px' : '36px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = i === 0 ? '#4CAF50' : '#FF4500';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = i === 0 ? '12px' : '16px';
      el.style.cursor = 'pointer';
      el.textContent = i === 0 ? 'Start' : i;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lon, lat])
        .setPopup(new maplibregl.Popup().setHTML(`<b>${i === 0 ? 'Start' : `#${i}`} - ${p.title}</b><br/>${p.address || ""}`))
        .addTo(map);

      markersRef.current.push(marker);

      if (i === places.length - 1) {
        map.flyTo({ center: [lon, lat], zoom: 10, speed: 0.8, curve: 1.3 });
      }
    });
  }, [places]);

  // 🛣️ Draw a connecting route with proper road routing
  useEffect(() => {
    const map = mapRef.current;
    if (!map || places.length < 2) {
      console.log("⚠️ Not drawing route - missing map or insufficient places", { map: !!map, places: places.length });
      return;
    }

    const coords = places
      .filter((p) => Array.isArray(p.coordinates) && p.coordinates.length === 2)
      .map((p) => p.coordinates);

    if (coords.length < 2) {
      console.log("⚠️ Not drawing route - insufficient valid coordinates", { coords });
      return;
    }

    console.log("🧭 Drawing route with coords:", coords);

    // Function to fetch and draw road-based route using Cognito credentials
    const drawRoute = async () => {
      try {
        console.log("🎨 Fetching road-based route with Cognito auth");
        
        // Get AWS credentials from Cognito via Amplify (including guest credentials)
        const session = await fetchAuthSession({ forceRefresh: true });
        const credentials = session.credentials;

        if (!credentials) {
          console.log("⚠️ No Cognito credentials available, using straight lines");
          console.log("Session details:", session);
          drawStraightLines();
          return;
        }

        console.log("✅ Got Cognito credentials (guest or authenticated), calling AWS Location Service");

        // Create LocationClient with Cognito credentials
        const client = new LocationClient({
          region: AWS_REGION,
          credentials: credentials,
        });

        // Calculate route
        const calculatorName = import.meta.env.VITE_ROUTE_CALCULATOR_NAME || "Esri";
        console.log("Using route calculator:", calculatorName);
        
        const command = new CalculateRouteCommand({
          CalculatorName: calculatorName,
          DeparturePosition: coords[0],
          DestinationPosition: coords[coords.length - 1],
          ...(coords.length > 2 && {
            WaypointPositions: coords.slice(1, -1),
          }),
          TravelMode: "Car",
          DistanceUnit: "Kilometers",
          IncludeLegGeometry: true,
        });

        const response = await client.send(command);
        console.log("📊 Route response:", response);

        // Remove old routes and labels if exist
        for (let i = 0; i < 20; i++) {
          if (map.getLayer(`trip-route-${i}`)) map.removeLayer(`trip-route-${i}`);
          if (map.getSource(`trip-route-${i}`)) map.removeSource(`trip-route-${i}`);
          if (map.getLayer(`trip-label-${i}`)) map.removeLayer(`trip-label-${i}`);
          if (map.getSource(`trip-label-${i}`)) map.removeSource(`trip-label-${i}`);
        }

        // Draw each leg with a different color
        if (response.Legs && response.Legs.length > 0) {
          const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#FF85A2", "#5DADE2"];
          let allCoords = [];
          
          response.Legs.forEach((leg, legIndex) => {
            if (leg.Geometry && leg.Geometry.LineString && leg.Geometry.LineString.length >= 2) {
              const legCoords = leg.Geometry.LineString;
              allCoords = allCoords.concat(legCoords);
              
              const color = colors[legIndex % colors.length];
              const geojson = {
                type: "Feature",
                geometry: { type: "LineString", coordinates: legCoords },
              };

              map.addSource(`trip-route-${legIndex}`, { type: "geojson", data: geojson });

              map.addLayer({
                id: `trip-route-${legIndex}`,
                type: "line",
                source: `trip-route-${legIndex}`,
                layout: { "line-join": "round", "line-cap": "round" },
                paint: {
                  "line-color": color,
                  "line-width": 6,
                  "line-opacity": 0.9,
                },
              });

              // Add route segment label at midpoint
              const midIndex = Math.floor(legCoords.length / 2);
              const midPoint = legCoords[midIndex];
              
              // Create a point feature for the label
              const labelFeature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: midPoint },
                properties: { label: `${legIndex + 1}` }
              };

              map.addSource(`trip-label-${legIndex}`, { 
                type: "geojson", 
                data: labelFeature 
              });

              map.addLayer({
                id: `trip-label-${legIndex}`,
                type: "symbol",
                source: `trip-label-${legIndex}`,
                layout: {
                  "text-field": ["get", "label"],
                  "text-size": 14,
                  "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                  "text-offset": [0, 0],
                  "text-anchor": "center",
                },
                paint: {
                  "text-color": "#FFFFFF",
                  "text-halo-color": color,
                  "text-halo-width": 3,
                  "text-halo-blur": 1,
                },
              });
            }
          });

          if (allCoords.length >= 2) {
            console.log(`✅ Drew ${response.Legs.length} colored route segments with road geometry`);
            const bounds = allCoords.reduce(
              (b, c) => b.extend(c),
              new maplibregl.LngLatBounds(allCoords[0], allCoords[0])
            );
            map.fitBounds(bounds, { padding: 60, duration: 1000 });
          } else {
            console.log("⚠️ No route geometry, using straight lines");
            drawStraightLines();
          }
        } else {
          console.log("⚠️ No legs in response, using straight lines");
          drawStraightLines();
        }
      } catch (error) {
        console.error("❌ Error fetching route:", error);
        console.log("⚠️ Falling back to straight lines");
        drawStraightLines();
      }
    };

    // Helper function to draw straight lines with different colors per segment
    const drawStraightLines = () => {
      // Remove old routes and labels
      for (let i = 0; i < 20; i++) {
        if (map.getLayer(`trip-route-${i}`)) map.removeLayer(`trip-route-${i}`);
        if (map.getSource(`trip-route-${i}`)) map.removeSource(`trip-route-${i}`);
        if (map.getLayer(`trip-label-${i}`)) map.removeLayer(`trip-label-${i}`);
        if (map.getSource(`trip-label-${i}`)) map.removeSource(`trip-label-${i}`);
      }

      if (coords.length < 2) return;

      // Color palette for different segments
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#FF85A2", "#5DADE2"];

      // Draw each segment with a different color
      for (let i = 0; i < coords.length - 1; i++) {
        const segmentCoords = [coords[i], coords[i + 1]];
        const color = colors[i % colors.length];

        const geojson = {
          type: "Feature",
          geometry: { type: "LineString", coordinates: segmentCoords },
        };

        map.addSource(`trip-route-${i}`, { type: "geojson", data: geojson });

        map.addLayer({
          id: `trip-route-${i}`,
          type: "line",
          source: `trip-route-${i}`,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": color,
            "line-width": 6,
            "line-opacity": 0.9,
          },
        });

        // Add label at midpoint
        const midPoint = [
          (segmentCoords[0][0] + segmentCoords[1][0]) / 2,
          (segmentCoords[0][1] + segmentCoords[1][1]) / 2,
        ];

        const labelFeature = {
          type: "Feature",
          geometry: { type: "Point", coordinates: midPoint },
          properties: { label: `${i + 1}` }
        };

        map.addSource(`trip-label-${i}`, { 
          type: "geojson", 
          data: labelFeature 
        });

        map.addLayer({
          id: `trip-label-${i}`,
          type: "symbol",
          source: `trip-label-${i}`,
          layout: {
            "text-field": ["get", "label"],
            "text-size": 14,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0],
            "text-anchor": "center",
          },
          paint: {
            "text-color": "#FFFFFF",
            "text-halo-color": color,
            "text-halo-width": 3,
            "text-halo-blur": 1,
          },
        });
      }

      // Fit bounds to show all points
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 60, duration: 1000 });
      
      console.log(`✅ Drew ${coords.length - 1} colored route segments`);
    };

    // Wait for map to be ready, then draw route
    const waitForMapAndDraw = () => {
      if (map.loaded()) {
        console.log("🗺️ Map already loaded, drawing route immediately");
        drawRoute();
      } else {
        console.log("⏳ Map not loaded yet, waiting for load event");
        const drawOnLoad = () => {
          console.log("✅ Map loaded, drawing route now");
          drawRoute();
        };
        if (map.isStyleLoaded()) {
          drawOnLoad();
        } else {
          map.on("style.load", drawOnLoad);
        }
      }
    };

    waitForMapAndDraw();
  }, [places]);

  // Not absolute anymore — the page controls the size/placement.
  return (
    <div className="bg-black flex justify-center items-center p-6 relative">
      <div
        ref={mapShellRef}
        className="h-[70vh] w-[60vw] rounded-xl overflow-hidden shadow-lg border border-white/20"
      />
    </div>
  );
}
