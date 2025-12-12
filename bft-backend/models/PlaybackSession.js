const mongoose = require("mongoose");

const PlaybackSessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  device_id: { type: String, default: "all" },
  is_active: { type: Boolean, default: true },
  start_time: { type: Date, default: Date.now },
  end_time: { type: Date },
  logs: { type: Array, default: [] },
});

module.exports = mongoose.model("PlaybackSession", PlaybackSessionSchema);
