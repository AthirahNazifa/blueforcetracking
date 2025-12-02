const mongoose = require("mongoose");

const PlaybackSessionSchema = new mongoose.Schema({
    name: String, //optional
    device_id: { type: String, required: true},
    start_time: { type: Date, required: true},
    end_time: { type: Date, require: true},
    created_at: { type: Date, default: Date.now}
});

module.exports = mongoose.model("PlaybackSession", PlaybackSessionSchema);
