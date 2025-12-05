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

  const filteredDevices = devices.filter((device) =>
    (device.device_id || device.id || device._id || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!selectedDevice) return;

    const latitude = Number(selectedDevice.latitude);
    const longitude = Number(selectedDevice.longitude);

    setMapCenter({ lat: latitude, lng: longitude, accuracy: 100 });

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
      .then(res => res.json())
      .then(data => { if (data?.display_name) setAddress(data.display_name); });

    const iframe = document.getElementById("bft-map-iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: "FLY_TO_DEVICE", payload: { lat: latitude, lng: longitude } },
        "http://localhost:3001"
      );
    }
  }, [selectedDevice, setMapCenter]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:3001") return;
      const { type, payload } = event.data || {};

      if (type === "DEVICE_CLICKED" && payload?.device_id) {
        const device = devices.find(d =>
          d.device_id === payload.device_id ||
          d.id === payload.device_id ||
          d._id === payload.device_id
        );
        if (device) setSelectedDevice(device);
        else setPendingDeviceId(payload.device_id);
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

  useEffect(() => {
    if (!messageData) return;
    const { type, payload } = messageData;

    if (type === "DEVICE_CLICKED" && payload?.device_id) {
      const device = devices.find(d =>
        d.device_id === payload.device_id ||
        d.id === payload.device_id ||
        d._id === payload.device_id
      );
      if (device) setSelectedDevice(device);
      else setPendingDeviceId(payload.device_id);
    }

    if (type === "CLEAR_DEVICE_SELECTION") {
      setSelectedDevice(null);
      setPendingDeviceId(null);
      setAddress("");
    }
  }, [messageData, devices]);

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setPendingDeviceId(null);
  };

  return (
    <div className={`${styles.panel} ${styles.open}`}>
      {!selectedDevice ? (
        <>
          <div className={styles.searchHeader}>
            <h2>Device List</h2>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search devices..."
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
