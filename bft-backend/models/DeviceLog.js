const mongoose = require("mongoose");

const DeviceLogSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
    index: true, // faster filtering by device
  },

  latitude: {
    type: Number,
    required: true,
  },

  longitude: {
    type: Number,
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true, // useful for playback or historical queries
  },

  // For playback sessions (optional)
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlaybackSession",
    default: null,
    index: true,
  },

  // Daily grouping
  session_date: {
    type: String, // format "YYYY-MM-DD"
    required: true,
  },
});

module.exports = mongoose.model("DeviceLog", DeviceLogSchema);
