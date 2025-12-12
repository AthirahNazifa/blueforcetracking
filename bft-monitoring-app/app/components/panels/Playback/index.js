"use client";
import { useState } from "react";
import { FaPlay, FaPause, FaStop, FaBackward, FaCircle } from "react-icons/fa";
import styles from "./Playback.module.css";
import { usePlayback } from "@context/PlaybackContext";
import { useDevices } from "@context/DeviceContext";

export default function PlaybackPanel() {
  const {
    testSets,
    selectedSession,
    setSelectedSession,
    playbackLogs,
    currentPositions,
    currentIndex,
    isPlaying,
    isPaused,
    isRecording,
    deviceRecord,
    setDeviceRecord,
    play,
    pause,
    stopPlayback,
    startRecording,
    stopRecording,
    speed,
    setPlaybackSpeed,
  } = usePlayback();

  const { devices: liveDevices } = useDevices(); // get live devices for recording

  const [tab, setTab] = useState("record");
  const [recordingName, setRecordingName] = useState(""); // bind to input

  const handleSessionChange = (e) => {
    const session = testSets.find((s) => s._id === e.target.value);
    setSelectedSession(session);
  };

  return (
    <div className={`${styles.panel} ${styles.open}`}>
      {/* Tab Bar */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${tab === "record" ? styles.active : ""}`}
          onClick={() => setTab("record")}
        >
          RECORD
        </button>
        <button
          className={`${styles.tabButton} ${tab === "playback" ? styles.active : ""}`}
          onClick={() => setTab("playback")}
        >
          PLAYBACK
        </button>
      </div>

      <div className={styles.pageContent}>
        {/* RECORD TAB */}
        {tab === "record" && (
          <div className={styles.page}>
            <h2 className={styles.subHeading}>Record Session</h2>

            {/* Device Selector */}
            <label className={styles.label}>Device</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.input}
                value={deviceRecord}
                onChange={(e) => setDeviceRecord(e.target.value)}
              >
                <option value="all">All Devices</option>
                {liveDevices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Set Name */}
            <label className={styles.label}>Test Set Name</label>
            <input
              className={styles.input}
              placeholder="Enter test set name"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              disabled={isRecording}
            />

            {/* Record Buttons */}
            <div className={styles.recordButtons}>
              <button
                className={styles.button}
                onClick={() => startRecording(deviceRecord, recordingName)}
                disabled={isRecording}
              >
                <FaCircle style={{ marginRight: "6px", color: "red" }} /> Start Record
              </button>
              <button
                className={styles.button}
                onClick={stopRecording}
                disabled={!isRecording}
              >
                <FaStop style={{ marginRight: "6px" }} /> Stop
              </button>
            </div>
          </div>
        )}

        {/* PLAYBACK TAB */}
        {tab === "playback" && (
          <div className={styles.page}>
            <h2 className={styles.subHeading}>Playback</h2>

            {/* Device Selector */}
            <label className={styles.label}>Device</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.input}
                value={deviceRecord}
                onChange={(e) => setDeviceRecord(e.target.value)}
              >
                <option value="all">All Devices</option>
                {Object.keys(playbackLogs).map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Set Selector */}
            <label className={styles.label}>Test Set</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.input}
                value={selectedSession?._id || ""}
                onChange={handleSessionChange}
              >
                <option value="">Select Test Set...</option>
                {testSets.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Playback Controls */}
            <div className={styles.playbackControls}>
              <div className={styles.buttons}>
                {/* Rewind button */}
                <button
                  className={styles.controlButton}
                  disabled={!selectedSession}
                  onClick={() => {
                    // Reset index and positions for selected device or all
                    const resetIndex = { ...currentIndex };
                    const resetPos = { ...currentPositions };
                    const devicesToReset =
                      deviceRecord && deviceRecord !== "all"
                        ? [deviceRecord]
                        : Object.keys(playbackLogs);

                    devicesToReset.forEach((id) => {
                      resetIndex[id] = 0;
                      resetPos[id] = playbackLogs[id][0] || null;
                    });

                    setCurrentIndex(resetIndex);
                    setCurrentPositions(resetPos);
                  }}
                >
                  <FaBackward />
                </button>

                {/* Pause button */}
                <button
                  className={`${styles.controlButton} ${isPaused ? styles.pauseActive : ""}`}
                  disabled={!isPlaying && !isPaused}
                  onClick={pause}
                >
                  <FaPause />
                </button>

                {/* Play button */}
                <button
                  className={`${styles.controlButton} ${isPlaying ? styles.playActive : ""}`}
                  disabled={!selectedSession}
                  onClick={play}
                >
                  <FaPlay />
                </button>

                {/* Stop button */}
                <button
                  className={styles.controlButton}
                  disabled={!isPlaying && !isPaused}
                  onClick={stopPlayback}
                >
                  <FaStop />
                </button>
              </div>

              {/* Speed Control */}
              <div style={{ marginTop: "10px" }}>
                <label className={styles.label}>Speed:</label>
                <input
                  type="number"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                />
                <span> x</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
