"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import { useMap } from "@context/MapContext";
import { useDevices } from "@context/DeviceContext";
import styles from "./MapView.module.css";

export default function MapView() {

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null); // gray marker
  const devicePopupRef = useRef(null);
  const measureModeRef = useRef(false);
  const { mapCenter, setMapCenter } = useMap();
  const [isSatelliteVisible, setSatelliteVisible] = useState(false);
  const { devices } = useDevices?.() || { devices: [] };
  const pathCoordsRef = useRef(new Map());

  const [measureMode, setMeasureMode] = useState(false);
  const [geojson, setGeojson] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [distance, setDistance] = useState(0);

  const isValidCoord = (lat, lng) =>
    typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng);

  const clearMeasure = () => {
    setGeojson({ type: "FeatureCollection", features: [] });
    setDistance(0);
  };

  const removeMarker = () => {
    if (!markerRef.current) return;
    const el = markerRef.current.getElement();
    el.style.transition = "opacity 0.25s";
    el.style.opacity = "0";
    setTimeout(() => {
      markerRef.current.remove();
      markerRef.current = null;
    }, 250);
  };

  // Pass current MeasureMode status
  useEffect(() => {
    measureModeRef.current = measureMode;
  }, [measureMode]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "http://localhost:4000/style/malaysia-style",
      center: [101.5831753, 3.1111297],
      zoom: 16,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;
    console.log("✅ Map loaded");

    map.on("load", () => {
      map.dragRotate.enable();
      map.touchZoomRotate.enable();
      map.setMaxPitch(85);
      
      const nav = new maplibregl.NavigationControl({ visualizePitch: true });
      map.addControl(nav, "bottom-right");
      
      map.addSource("measure", { type: "geojson", data: geojson });

      map.addLayer({
        id: "measure-points",
        type: "circle",
        source: "measure",
        paint: { "circle-radius": 5, "circle-color": "#0000FF" },
        filter: ["in", "$type", "Point"],
      });

      map.addLayer({
        id: "measure-lines",
        type: "line",
        source: "measure",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#0000FF", "line-width": 2.5 },
        filter: ["in", "$type", "LineString"],
      });

      map.addSource("device-path",{
        type: "geojson",
        data:{
          type: "Feature",
          geometry:{
            type:"LineString",
            coordinates:[],
          },
        },
      });
      map.addLayer({
        id: "device-path-line",
        type: "line",
        source: "device-path",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF0000", // red line
          "line-width": 3,
        },
      });
      
    });

    window.parent.postMessage({ type: "MAP_READY" }, "*");

    // Close popup on blank area click
    map.on("click", (e) => {
      const target = e.originalEvent.target;
      const isMarker = target.closest(".maplibregl-marker");
      if (!isMarker && devicePopupRef.current) {
        devicePopupRef.current.remove();
        devicePopupRef.current = null;
      }
    });

    // Gray marker placement
    map.on("click", (e) => {
      const { lat, lng } = e.lngLat;

      // prevent marker in measure mode or if one exists
      if (markerRef.current || measureModeRef.current) {
        removeMarker();
        return;
      }

      const newMarker = new maplibregl.Marker({ color: "gray", draggable: false })
        .setLngLat([lng, lat])
        .addTo(map);

      newMarker.getElement().addEventListener("click", (ev) => {
        ev.stopPropagation();
        removeMarker();
      });

      markerRef.current = newMarker;

      map.easeTo({ center: [lng, lat], duration: 800 });
      setMapCenter({ lat, lng, accuracy: 100 });
    });
  }, []);

  // Handle FLY_TO_DEVICE from BFT_MONITORING_APP
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "FLY_TO_DEVICE" && event.data?.payload) {
        const { lat, lng } = event.data.payload;

        if (isValidCoord(lat, lng) && mapRef.current) {
          console.log("FLY_TO_DEVICE triggered:", lat, lng);
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 14,
            speed: 1.2,
            curve: 1.5,
            essential: true,
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Device Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !devices?.length) return;

    if (!map.__deviceMarkers) map.__deviceMarkers = new Map();

    devices.forEach(device => {
      if (!isValidCoord(device.latitude, device.longitude)) return;

      let markerEntry = map.__deviceMarkers.get(device.device_id);
      if (!markerEntry) {
        const el = document.createElement("div");
        el.className = styles.deviceMarker;

        const img = document.createElement("img");
        img.src = "/icons/devices/battle_tank.svg";
        img.className = styles.deviceMarker;
        el.appendChild(img);

        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: false,
          className: styles.devicePopupContainer,
        }).setHTML(`<div>${device.device_id}</div>`);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([device.longitude, device.latitude])
          .setPopup(popup)
          .addTo(map);

        // Hover popup device
        el.addEventListener("mouseenter", () => {
          if (!popup._isPinned) popup.addTo(map);
        });

        el.addEventListener("mouseleave", () => {
          if (!popup._isPinned) popup.remove();
        });

        // Click popup device
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (markerRef.current) removeMarker();

          if (devicePopupRef.current && devicePopupRef.current !== popup) {
            devicePopupRef.current._isPinned = false;
            devicePopupRef.current.remove();
          }

          popup._isPinned = !popup._isPinned;
          if (popup._isPinned) {
            popup.addTo(map);
            devicePopupRef.current = popup;
          } else {
            popup.remove();
            devicePopupRef.current = null;
          }

          map.easeTo({
            center: [device.longitude, device.latitude],
            duration: 800,
          });

          setMapCenter({
            lat: device.latitude,
            lng: device.longitude,
            accuracy: 100,
          });

          console.log("🔥 Map Click: Sending DEVICE_CLICKED message.");
          console.log("   Full Device Object:", device);
          console.log("   ID sent in payload:", device.device_id);

          window.parent.postMessage(
            {
              type: "DEVICE_CLICKED",
              payload: {
                device_id: device.device_id,
                name: device.name,
                latitude: device.latitude,
                longitude: device.longitude,
              },
            },
            "http://localhost:3000" 
          );
        });

        map.__deviceMarkers.set(device.device_id, { marker, popup });
      } else {
        markerEntry.marker.setLngLat([device.longitude, device.latitude]);
      }

      if (!pathCoordsRef.current.has(device.device_id)) {
        pathCoordsRef.current.set(device.device_id, []);
      }
    
      const path = pathCoordsRef.current.get(device.device_id);
      const currentCoord = [device.longitude, device.latitude];
    
      // Add new coordinate only if different from last
      const last = path[path.length - 1];
      if (!last || last[0] !== currentCoord[0] || last[1] !== currentCoord[1]) {
        path.push(currentCoord);
      }
    
      // Update per-device source
      const sourceId = `device-path-${device.device_id}`;
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: path },
          },
        });
        map.addLayer({
          id: `device-path-line-${device.device_id}`,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#FF0000", "line-width": 3 },
        });
      } else {
        const source = map.getSource(sourceId);
        source.setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: path },
        });
      }
    });
  }, [devices]);

  // MEASURE DISTANCE MODE
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (!measureMode) return;

      // check which features user click 
      const features = map.queryRenderedFeatures(
        e.point, { 
          layers: ["measure-points"] 
        });

      let newGeojson = { ...geojson };

      // Remove previous line before redrawing
      if (newGeojson.features.length > 1) newGeojson.features.pop();

      // Remove clicked point OR add new one
      if (features.length) {
        const id = features[0].properties.id;
        newGeojson.features = newGeojson.features.filter(
          (f) => f.properties.id !== id
        );
      } else {
        newGeojson.features.push({
          type: "Feature",
          geometry: { 
            type: "Point", 
            coordinates: [e.lngLat.lng, e.lngLat.lat] 
          },
          properties: { id: String(Date.now()) },
        });
      }

      // Draw line + calculate distance
      if (newGeojson.features.length > 1) {
        const line = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: newGeojson.features.map((f) => f.geometry.coordinates),
          },
        };
        newGeojson.features.push(line);
        const dist = turf.length(line);
        setDistance(dist.toFixed(3));
      } else {
        setDistance(0);
      }

      setGeojson(newGeojson);
    };

    map.on("click", handleMapClick);
    return () => map.off("click", handleMapClick);
  }, [measureMode, geojson]);

  // Update measure layer data
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("measure");
    if (source) source.setData(geojson);
  }, [geojson]);

  const toggleSatellite = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const newVisible = !isSatelliteVisible;
    setSatelliteVisible(newVisible);

    if (map.getLayer("satellite-layer")) {
      map.setLayoutProperty(
        "satellite-layer",
        "visibility",
        newVisible ? "visible" : "none"
      );
      console.log(newVisible ? "Satellite ON" : "Satellite OFF");
    } else {
      console.warn("⚠️ No 'satellite-layer' found in your style JSON");
    }
  };
 // UI
  return (
    <>
    <div ref={mapContainer} className={styles.mapContainer} />
  
    <div className={styles.measureControl}>
      <button
        onClick={() => {
          if (measureMode) clearMeasure();
          setMeasureMode(!measureMode);
        }}
        className={`${styles.measureButton} ${measureMode ? styles.active : ""}`}
      >
        {measureMode ? "Exit Measure Mode" : "Measure Distance"}
      </button>
  
      {measureMode && (
        <>
          <div className={styles.measureDistanceBox}>
            Distance: {distance} km
          </div>
          <button onClick={clearMeasure} className={styles.clearButton}>
            Clear All Points
          </button>
        </>
      )}
    </div>
    <button onClick={toggleSatellite} className={styles.satelliteToggle}>
        {isSatelliteVisible ? "Hide Satellite" : "Show Satellite"}
      </button>
  </>
  
  );
}
