"use client";
import { useState, useEffect } from "react";
import styles from "./Device.module.css";
import { useDevices } from "@context/DeviceContext";
import { useMap } from "@context/MapContext";
import { MdArrowBackIos } from "react-icons/md";

export default function DevicePanel() {
  const { devices } = useDevices();
  const { setMapCenter } = useMap();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [pendingDeviceId, setPendingDeviceId] = useState(null);
  const [address, setAddress] = useState("");

  // Filter devices by search term
  const filteredDevices = devices.filter((device) =>
    (device.id || device._id || device.device_id || "") // Added device_id for searching
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Handle setting selected device and updating map / address
  useEffect(() => {
    if (!selectedDevice) return;

    const latitude = Number(selectedDevice.latitude);
    const longitude = Number(selectedDevice.longitude);

    // Reverse geocode to get address
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.display_name) setAddress(data.display_name);
      });

    // Center map
    setMapCenter({ lat: latitude, lng: longitude, accuracy: 100 });

    // Send message to embedded map iframe
    const iframe = document.getElementById("bft-map-iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "FLY_TO_DEVICE",
          payload: { lat: latitude, lng: longitude },
        },
        "http://localhost:3001" 
      );
    }
  }, [selectedDevice, setMapCenter]);

  // Handle messages from the embedded map
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'http://localhost:3001') return;
      console.log("Message received from BFT Map iframe:", event.data);
      const { type, payload } = event.data || {};

      if (type === "DEVICE_CLICKED" && payload?.device_id) {
        
        // FIX: Check against device_id, id, and _id for reliable lookup
        const device = devices.find(
          (d) => 
            d.device_id === payload.device_id || 
            d.id === payload.device_id || 
            d._id === payload.device_id
        );

        if (device) {
          console.log("DEVICE_CLICKED received. Panel showing details for:", payload.device_id);
          setSelectedDevice(device);
        } else {
          // Device not loaded yet, remember for later
          console.warn("Device clicked not found yet:", payload.device_id);
          setPendingDeviceId(payload.device_id);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [devices]);

  // Handle pending device click once devices are loaded
  useEffect(() => {
    if (pendingDeviceId && devices.length > 0) {
      // Use the corrected lookup logic here too
      const device = devices.find(
        (d) => 
          d.device_id === pendingDeviceId || 
          d.id === pendingDeviceId || 
          d._id === pendingDeviceId
      );
      if (device) {
        setSelectedDevice(device);
        setPendingDeviceId(null);
      }
    }
  }, [pendingDeviceId, devices]);

  return (
    <div className={styles.panel}>
      {!selectedDevice ? (
        <>
          <div className={styles.searchHeader}>
            <h2>Find Devices</h2>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search devices by ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.deviceList}>
            {filteredDevices.map((device) => (
              <div
                key={device.id || device._id || device.device_id}
                className={styles.deviceItem}
                onClick={() => setSelectedDevice(device)}
              >
                <strong>{device.name || device.device_id || device.id}</strong>
                <div className={styles.meta}>
                  Last updated: {new Date(device.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.details}>
          <div className={styles.detailsHeader}>
            <button
              className={styles.backButton}
              onClick={() => setSelectedDevice(null)}
            >
              <MdArrowBackIos size={20} />
            </button>
            {/* Display device_id if name is not available */}
            <h3>{selectedDevice.name || selectedDevice.device_id || selectedDevice.id}</h3> 
          </div>

          <div className={styles.imageSection}>
            <img
              src="/icons/device-placeholder.png"
              alt="device"
              className={styles.deviceImage}
            />
          </div>

          <div className={styles.infoSection}>
            <p>
              <strong>Address:</strong> {address || "Resolving..."}
            </p>
            <p>
              <strong>Latitude:</strong> {selectedDevice.latitude}
            </p>
            <p>
              <strong>Longitude:</strong> {selectedDevice.longitude}
            </p>
            <p>
              <strong>Device ID:</strong> {selectedDevice.device_id}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {new Date(selectedDevice.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}