const express = require("express");
const router = express.Router();
const PlaybackSession = require("../models/PlaybackSession");
const DeviceLog = require("../models/DeviceLog");

// Start a recording session
router.post("/start", async (req, res) => {
  try {
    const { device_id, testSetName } = req.body;

    const session = await PlaybackSession.create({
      name: testSetName,
      device_id: device_id || "all",
      is_active: true,
      start_time: new Date(),
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stop recording
router.post("/stop", async (req, res) => {
  try {
    const activeSessions = await PlaybackSession.updateMany(
      { is_active: true },
      { is_active: false, end_time: new Date() }
    );

    res.json({ success: true, updated: activeSessions.nModified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// List all sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await PlaybackSession.find().sort({ start_time: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch logs by session_id 
router.get("/logs", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) return res.status(400).json({ error: "session_id is required" });

    const logs = await DeviceLog.find({ session_id }).sort({ timestamp: 1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
