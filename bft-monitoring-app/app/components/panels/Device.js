"use client";

import { useState, useEffect } from "react";
import styles from "./Device.module.css";
import { useDevices } from "@context/DeviceContext";
import { useMap } from "@context/MapContext";
import DeviceDetails from "./DeviceDetails";

export default function DevicePanel() {
  const { devices, messageData } = useDevices();
  const { setMapCenter } = useMap();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [pendingDeviceId, setPendingDeviceId] = useState(null);
  const [address, setAddress] = useState("");

  // Filter devices by search
  const filteredDevices = devices.filter((device) =>
    (device.device_id || device.id || device._id || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Fly to selected device & resolve address
  useEffect(() => {
    if (!selectedDevice) return;

    const latitude = Number(selectedDevice.latitude);
    const longitude = Number(selectedDevice.longitude);

    // Fly map
    setMapCenter({ lat: latitude, lng: longitude, accuracy: 100 });

    // Resolve address
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.display_name) setAddress(data.display_name);
      });

    // Post message to map iframe
    const iframe = document.getElementById("bft-map-iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: "FLY_TO_DEVICE", payload: { lat: latitude, lng: longitude } },
        "http://localhost:3001"
      );
    }
  }, [selectedDevice, setMapCenter]);

  // Handle messages from the map iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:3001") return;

      const { type, payload } = event.data || {};

      if (type === "DEVICE_CLICKED" && payload?.device_id) {
        const device = devices.find(
          (d) =>
            d.device_id === payload.device_id ||
            d.id === payload.device_id ||
            d._id === payload.device_id
        );
        if (device) {
          setSelectedDevice(device);
          setPendingDeviceId(null); // clear pending since device is found
        } else {
          setPendingDeviceId(payload.device_id);
        }
      }

      if (type === "CLEAR_DEVICE_SELECTION") {
        setSelectedDevice(null);
        setPendingDeviceId(null);
        setAddress("");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [devices]);

  // Handle messages from DeviceContext (async updates)
  useEffect(() => {
    if (!messageData) return;

    const { type, payload } = messageData;

    if (type === "DEVICE_CLICKED" && payload?.device_id) {
      const device = devices.find(
        (d) =>
          d.device_id === payload.device_id ||
          d.id === payload.device_id ||
          d._id === payload.device_id
      );

      if (device) {
        setSelectedDevice(device);
        setPendingDeviceId(null);
      } else {
        setPendingDeviceId(payload.device_id);
      }
    }

    if (type === "CLEAR_DEVICE_SELECTION") {
      setSelectedDevice(null);
      setPendingDeviceId(null);
      setAddress("");
    }
  }, [messageData, devices]);

  // Handle manual selection from list
  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setPendingDeviceId(null); // clear pending
  };

  const isOpen = !!selectedDevice || searchTerm.length > 0 || devices.length > 0;

  return (
    <div className={`${styles.panel} ${isOpen ? styles.open : ""}`}>
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
                key={device.device_id || device.id || device._id}
                className={styles.deviceItem}
                onClick={() => handleSelectDevice(device)}
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
        <DeviceDetails
          device={selectedDevice}
          address={address}
          onBack={() => {
            setSelectedDevice(null);
            setPendingDeviceId(null);
            setAddress("");
          }}
        />
      )}
    </div>
  );
}
