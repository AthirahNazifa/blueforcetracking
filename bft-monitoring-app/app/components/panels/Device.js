"use client";
import { useState, useEffect } from "react";
import styles from "./Device.module.css";
import { useDevices } from "@context/DeviceContext";
import { useMap } from "@context/MapContext";
import { MdArrowBackIos } from "react-icons/md";

export default function DevicePanel() {
  const { devices, messageData } = useDevices();
  const { setMapCenter } = useMap();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [pendingDeviceId, setPendingDeviceId] = useState(null);
  const [address, setAddress] = useState("");

  // Filter devices
  const filteredDevices = devices.filter((device) =>
    (device.id || device._id || device.device_id || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Handle setting selected device and updating map/address
  useEffect(() => {
    if (!selectedDevice) return;
    console.log("📍 selectedDevice updated:", selectedDevice);

    const latitude = Number(selectedDevice.latitude);
    const longitude = Number(selectedDevice.longitude);

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.display_name) setAddress(data.display_name);
      });

    setMapCenter({ lat: latitude, lng: longitude, accuracy: 100 });
    console.log("🗺️ FLY_TO_DEVICE sending to iframe:", { latitude, longitude });

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
      console.log("📩 Message received:", event.origin, event.data);
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
          console.log("📩 DEVICE_CLICKED -> Selecting device:", payload.device_id);
          setSelectedDevice(device);
        } else {
          console.warn("Device not found yet, storing pending ID:", payload.device_id);
          setPendingDeviceId(payload.device_id);
        }
      }
      
    };
  
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [devices]);

  useEffect(() => {
    if (messageData?.type === "DEVICE_CLICKED" && messageData.payload?.device_id) {
      const device = devices.find(
        (d) =>
          d.device_id === messageData.payload.device_id ||
          d.id === messageData.payload.device_id ||
          d._id === messageData.payload.device_id
      );

      if (device) {
        console.log("📩 DEVICE_CLICKED -> Selecting device:", messageData.payload.device_id);
        setSelectedDevice(device);
      } else {
        console.warn("Device not found yet, storing pending ID:", messageData.payload.device_id);
        setPendingDeviceId(messageData.payload.device_id);
      }
    }
  }, [messageData, devices]);

  return (
    <div className={`${styles.panel}`}>
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
            <button className={styles.backButton} onClick={() => setSelectedDevice(null)}>
              <MdArrowBackIos size={20} />
            </button>
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
            
          <div className={styles.infoRow}>
            <span className={styles.label}>Address</span>
            <span className={styles.value}>{address || "Resolving..."}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Latitude</span>
            <span className={styles.value}>{selectedDevice.latitude}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Longitude</span>
            <span className={styles.value}>{selectedDevice.longitude}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Device ID</span>
            <span className={styles.value}>{selectedDevice.id}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Last Updated</span>
            <span className={styles.value}>
              {new Date(selectedDevice.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        </div>
      )}
    </div>
  );
}
