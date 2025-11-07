"use client";
import { createContext, useContext, useEffect, useState } from "react";

const DeviceContext = createContext();

export const DeviceProvider = ({ children, setActivePanel }) => {
  const [devices, setDevices] = useState([]);
  const [messageData, setMessageData] = useState(null); // 🆕 Store message data

  const fetchDevices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/devices");
      if (!res.ok) throw new Error("Failed to fetch devices");

      const data = await res.json();
      //console.log("📡 Backend returned:", data); // ✅ debug log

      const normalized = Array.isArray(data) ? data : [data];
      setDevices(normalized);

    } catch (err) {
      console.error("❌ Failed to fetch devices:", err);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🆕 Add global message listener
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:3001") return;

      const { type, payload } = event.data || {};
      if (type === "DEVICE_CLICKED" && payload?.device_id) {
        console.log("📩 Message received in DeviceContext:", { type, payload }); // 🐛 Debugging log
        setMessageData({ type, payload }); // Store the message data

        // 🆕 Automatically activate the Devices panel
        if (setActivePanel) {
          console.log("🧩 Activating Devices panel via setActivePanel");
          setActivePanel("Devices");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setActivePanel]);

  return (
    <DeviceContext.Provider value={{ devices, fetchDevices, messageData }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevices = () => {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevices must be used within a DeviceProvider");
  return ctx;
};
