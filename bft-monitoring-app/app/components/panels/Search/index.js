"use client";
import { useState, useEffect } from "react";
import styles from "./Search.module.css";
import { useMap } from "@context/MapContext";

const convertToDMS = (deg, isLat) => {
  const d = Math.floor(Math.abs(deg));
  const m = Math.floor((Math.abs(deg) - d) * 60);
  const s = (((Math.abs(deg) - d) * 60 - m) * 60).toFixed(2);
  const dir = deg >= 0 ? (isLat ? "N" : "E") : (isLat ? "S" : "W");
  return { d, m, s, dir };
};

export default function SearchPanel() {
  const { mapCenter, setMapCenter } = useMap();

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [dmsLat, setDmsLat] = useState({ d: "", m: "", s: "", dir: "N" });
  const [dmsLng, setDmsLng] = useState({ d: "", m: "", s: "", dir: "E" });

  useEffect(() => {
    if (!mapCenter) return;

    const { lat, lng } = mapCenter;

    setLatitude(lat.toString());
    setLongitude(lng.toString());
    setDmsLat(convertToDMS(lat, true));
    setDmsLng(convertToDMS(lng, false));

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.display_name) {
          setAddress(data.display_name);
        }
      });
  }, [mapCenter]);

  const handleAddressSearch = async () => {
    if (!address.trim()) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    );
    const data = await res.json();
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      setMapCenter({ lat, lng, accuracy: 100 });
    }
  };

  const handleCoordinateSearch = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    setMapCenter({ lat, lng, accuracy: 100 });
  };

  const handleClear = () => {
    setAddress("");
    setLatitude("");
    setLongitude("");
    setDmsLat({ d: "", m: "", s: "", dir: "N" });
    setDmsLng({ d: "", m: "", s: "", dir: "E" });
  };

  const handleAutoCenter = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCenter({ lat, lng, accuracy: pos.coords.accuracy || 100 });
      },
      (err) => {
        alert("Failed to get location");
      }
    );
  };

  return (
   
    <div className={styles.panel}>
      
      {/* Header */}
      <div className={styles.searchHeader}>
        <h1 className={styles.heading}>Search Location</h1>
      </div>
  
      <div className={styles.section}>
        {/* Address to Coordinates */}
        <h3 className={styles.subHeading}>Address</h3>
        <input
          className={styles.input}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address..."
        />
        <button className={styles.button} onClick={handleAddressSearch}>
          Get Coordinates
        </button>
      </div>
  
      <div className={styles.section}>
        {/* Coordinates to Map */}
        <h3 className={styles.subHeading}>Coordinates</h3>
        <label className={styles.label}>Latitude:</label>
        <input
          className={styles.input}
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="e.g. 3.1390"
        />
  
        <label className={styles.label}>Longitude:</label>
        <input
          className={styles.input}
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="e.g. 101.6869"
        />
  
        <button className={styles.button} onClick={handleCoordinateSearch}>
          Show on Map
        </button>
      </div>
  
      {/* Utility Buttons */}
      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={handleClear}>
          Clear Fields
        </button>
      </div>
    </div>
  
  );
}
