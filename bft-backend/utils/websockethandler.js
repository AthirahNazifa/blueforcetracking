const WebSocket = require("ws");
const Device = require("../models/Device");
const DeviceLog = require("../models/DeviceLog");
const PlaybackSession = require("../models/PlaybackSession");
const { markCacheUpdated } = require("../controllers/deviceController");

function initWebSocketDevice(broadcast) {
  const WS_URL = "ws://192.168.0.183:8080";
  const WS_URL_LOCAL = "ws://localhost:8080";
  const ws = new WebSocket(WS_URL_LOCAL);

  // --- WS CONNECTED ---
  ws.on("open", () => {
    console.log("✅ WebSocket connected:", WS_URL);
    broadcast?.({ type: "source-status", status: "online" });
  });

  // --- WS MESSAGE ---
  ws.on("message", async (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage);
      console.log("Received:", data);

      // Only handle device position messages
      if (data.type !== "position" || !data.device_id) return;

      const { latitude, longitude } = data;

      // Validate coordinates
      const validLat = typeof latitude === "number" && latitude >= -90 && latitude <= 90;
      const validLon = typeof longitude === "number" && longitude >= -180 && longitude <= 180;
      if (!validLat || !validLon) {
        console.warn(`⚠️ Invalid GPS from device ${data.device_id}`);
        return;
      }

      const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

      // --- Update device latest info ---
      const updatedDevice = await Device.findOneAndUpdate(
        { id: data.device_id },
        { latitude, longitude, timestamp },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      // Mark cache for frontend
      markCacheUpdated();

      // --- Determine session_id if active session exists ---
      let session_id = null;
      try {
        const activeSession = await PlaybackSession.findOne({ is_active: true });
        if (activeSession && (activeSession.device_id === "all" || activeSession.device_id === data.device_id)) {
          session_id = activeSession._id;
        }
      } catch (err) {
        console.error("⚠️ PlaybackSession check error:", err.message);
      }

      // --- Always log device position ---
      try {
        await DeviceLog.create({
          device_id: data.device_id,
          latitude,
          longitude,
          timestamp,
          session_date: timestamp.toISOString().split("T")[0],
          session_id, // null if no active session
        });
      } catch (logErr) {
        console.error("⚠️ DeviceLog error:", logErr.message);
      }

      // --- Broadcast to frontend ---
      broadcast?.({
        type: "position",
        device_id: updatedDevice.id,
        latitude: updatedDevice.latitude,
        longitude: updatedDevice.longitude,
        timestamp: updatedDevice.timestamp,
      });

    } catch (err) {
      console.error("⚠️ WebSocket JSON parse error:", err);
    }
  });

  // --- WS CLOSED ---
  ws.on("close", () => {
    console.log("⚠️ WebSocket disconnected. Reconnecting in 5s...");
    broadcast?.({ type: "source-status", status: "offline" });
    setTimeout(() => initWebSocketDevice(broadcast), 5000);
  });

  // --- WS ERROR ---
  ws.on("error", (err) => {
    console.error("❌ WebSocket error:", err.message);
    broadcast?.({ type: "source-status", status: "offline" });
  });
}

module.exports = initWebSocketDevice;
