const WebSocket = require("ws");
const Device = require("../models/Device");
const DeviceLog = require("../models/DeviceLog");
const { markCacheUpdated } = require("../controllers/deviceController");


function initWebSocketDevice(broadcast) {
  
  //const WS_URL = "ws://localhost:8080";
  const WS_URL = "ws://192.168.0.183:8080";

  const ws = new WebSocket(WS_URL);

  // --- CONNECTION OPENED ---
  ws.on("open", () => {
    console.log("✅ WebSocket connection established:", WS_URL);
    broadcast({ type: "source-status", status: "online" });
  });

  // --- MESSAGE RECEIVED ---
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received data", data);
      if (data.type !== "position" || !data.device_id) return;
      // --- UPDATE MAIN DEVICE TABLE ---
      const updated = await Device.findOneAndUpdate(
        { id: data.device_id },
        {
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      markCacheUpdated();

      // --- LOG EVERY UPDATE ---
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      await DeviceLog.create({
        device_id: data.device_id,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(),
        session_date: today,
      });

      // --- BROADCAST TO FRONTEND ---
      if (broadcast) {
        broadcast({
          type: "position",
          device_id: updated.id,
          latitude: updated.latitude,
          longitude: updated.longitude,
          timestamp: updated.timestamp,
        });
      }
    } catch (err) {
      console.error("⚠️ WebSocket message error:", err);
    }
  });

  // --- CONNECTION CLOSED ---
  ws.on("close", () => {
    console.log("⚠️ WebSocket disconnected, retrying in 5s...");
    broadcast({ type: "source-status", status: "offline" });
    setTimeout(() => initWebSocketDevice(broadcast), 5000); // auto reconnect
  });

  // --- ERROR HANDLING ---
  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
    broadcast({ type: "source-status", status: "offline" });
  });
}

module.exports = initWebSocketDevice;
