const express = require("express");
const router = express.Router();
const PlaybackSession = require("../models/PlaybackSession");
const DeviceLog = require("../models/DeviceLog");

router.post("/playback/session", async (req, res) => {
    try {
        const {
            name,
            device_id,
            start_time,
            end_time
        } = req.body;

        const session = await PlaybackSession.create({
            name,
            device_id,
            start_time,
            end_time,
        });

        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ error: "Session not found" });
    }
});

router.get("/playback/session/:id", async (req, res) => {
    try {
        const session = await PlaybackSession.findById(req.params.id);
        if (!session)
            return res.status(404).json({ error: "Session not found" });

        const frames = await DeviceLog.find({
            device_id: session.device_id,
            timestamp: { $gte: session.start_time, $lte: session.end_time }
        }).sort({ timestamp: 1 });

        res.json({ session, frames });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/playback/sessions", async (req, res) => {
    try {
        const sessions = (await PlaybackSession.find()).sort({ created_at: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;