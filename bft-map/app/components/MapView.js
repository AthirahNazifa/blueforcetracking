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
  const markerRef = useRef(null);
  const devicePopupRef = useRef(null);
  const { mapCenter, setMapCenter } = useMap();
  const { devices } = useDevices?.() || { devices: [] };
  const pathCoordsRef = useRef(new Map());

  const [measureMode, setMeasureMode] = useState(false);
  const [geojson, setGeojson] = useState({ type: "FeatureCollection", features: [] });
  const [distance, setDistance] = useState(0);
  const [isSatelliteVisible, setSatelliteVisible] = useState(false);

  const isValidCoord = (lat, lng) => typeof lat === "number" && typeof lng === "number";

  const clearMeasure = () => {
    setGeojson({ type: "FeatureCollection", features: [] });
    setDistance(0);
  };

  const removeMarker = () => {
    if (!markerRef.current) return;
    markerRef.current.remove();
    markerRef.current = null;
  };

  // Initialize map
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

    map.on("load", () => {
      map.dragRotate.enable();
      map.touchZoomRotate.enable();
      map.setMaxPitch(85);

      const nav = new maplibregl.NavigationControl({ visualizePitch: true });
      map.addControl(nav, "bottom-right");

      // Measure layers
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
    });

    // Remove popup on blank click & notify panel to clear selection
    map.on("click", (e) => {
      const target = e.originalEvent.target;
      const isMarker = target.closest(".maplibregl-marker");

      // Remove any open popup if click is not on a marker
      if (!isMarker && devicePopupRef.current) {
        devicePopupRef.current.remove();
        devicePopupRef.current = null;
      }

      // Notify DevicePanel to clear selected device
      if (!isMarker) {
        window.parent.postMessage({ type: "CLEAR_DEVICE_SELECTION" }, "*");
      }
    });

  }, []);

  // Device Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !devices?.length) return;

    if (!map.__deviceMarkers) map.__deviceMarkers = new Map();

    devices.forEach((device) => {
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

        el.addEventListener("mouseenter", () => {
          if (!popup._isPinned) popup.addTo(map);
        });
        el.addEventListener("mouseleave", () => {
          if (!popup._isPinned) popup.remove();
        });
        el.addEventListener("click", (e) => {
          e.stopPropagation();

          // Remove previously pinned popup if it's not this one
          if (devicePopupRef.current && devicePopupRef.current !== popup) {
            devicePopupRef.current._isPinned = false;
            devicePopupRef.current.remove();
          }

          // Toggle current popup
          popup._isPinned = true;
          popup.addTo(map);
          devicePopupRef.current = popup;

          // Notify DevicePanel about new device selection
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
            "*"
          );
        });


        map.__deviceMarkers.set(device.device_id, { marker, popup });
      } else {
        markerEntry.marker.setLngLat([device.longitude, device.latitude]);
      }
    });
  }, [devices]);

  // Measure mode click
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (!measureMode) return;

      const newGeojson = { ...geojson };
      if (newGeojson.features.length > 1) newGeojson.features.pop();

      newGeojson.features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [e.lngLat.lng, e.lngLat.lat] },
        properties: { id: String(Date.now()) },
      });

      if (newGeojson.features.length > 1) {
        const line = {
          type: "Feature",
          geometry: { type: "LineString", coordinates: newGeojson.features.map((f) => f.geometry.coordinates) },
        };
        newGeojson.features.push(line);
        setDistance(turf.length(line).toFixed(3));
      } else {
        setDistance(0);
      }

      setGeojson(newGeojson);
    };

    map.on("click", handleMapClick);
    return () => map.off("click", handleMapClick);
  }, [measureMode, geojson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("measure");
    if (source) source.setData(geojson);
  }, [geojson]);

  const toggleSatellite = () => {
    const map = mapRef.current;
    if (!map) return;
    const newVisible = !isSatelliteVisible;
    setSatelliteVisible(newVisible);
    if (map.getLayer("satellite-layer")) {
      map.setLayoutProperty("satellite-layer", "visibility", newVisible ? "visible" : "none");
    }
  };

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
            <div className={styles.measureDistanceBox}>Distance: {distance} km</div>
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
