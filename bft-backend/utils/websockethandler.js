const WebSocket = require("ws");
const Device = require("../models/Device");
const DeviceLog = require("../models/DeviceLog");
const { markCacheUpdated } = require("../controllers/deviceController");


function initWebSocketDevice(broadcast) {

  const WS_URL = "ws://192.168.0.183:8080";

  const ws = new WebSocket(WS_URL);

  // connection established
  ws.on("open", () => {
    console.log("✅ WebSocket connection established:", WS_URL);
    broadcast({ type: "source-status", status: "online" });
  });

  // message received
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received data", data);

      if (data.type !== "position" || !data.device_id) return;

      if (
        typeof data.latitude !== "number" ||
        typeof data.longitude !== "number" ||
        data.latitude < -90 || data.latitude > 90 ||
        data.longitude < -180 || data.longitude > 180
      ) {
        console.warn(`⚠️ Invalid coordinates from device ${data.device_id}`);
        return; // stop here, skip invalid message
      }

      // update device info in DB
      const updated = await Device.findOneAndUpdate(
        { id: data.device_id },
        {
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp:
            data.timestamp ? new Date(data.timestamp) : new Date(),
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      markCacheUpdated();

      // device log entry
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      try {
        await DeviceLog.create({
          device_id: data.device_id,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date(),
          session_date: today,
        });
      } catch (dbErr) {
        console.error("⚠️ Failed to write DeviceLog:", dbErr.message);
      }

      // broadcast to frontend clients
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

  //disconnection handling
  ws.on("close", () => {
    console.log("⚠️ WebSocket disconnected, retrying in 5s...");
    broadcast({ type: "source-status", status: "offline" });
    setTimeout(() => initWebSocketDevice(broadcast), 5000); // auto reconnect
  });

  // error handling
  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
    broadcast({ type: "source-status", status: "offline" });
  });
}

module.exports = initWebSocketDevice;
