"use client";
import { useState } from "react";
import { FaPlay, FaPause, FaStop, FaBackward, FaCircle } from "react-icons/fa";
import styles from "./Playback.module.css";

export default function PlaybackPanel() {
  const [tab, setTab] = useState("record");
  const [testSetName, setTestSetName] = useState("");

  // Dummy Data (for UI-only)
  const devices = [
    { id: "DEV-001", name: "Device Alpha" },
    { id: "DEV-002", name: "Device Bravo" },
  ];

  const dummyTestSets = [
    { _id: "TS-111", name: "Route Test 1", date: "2025-02-01", start_time: Date.now(), end_time: Date.now() },
    { _id: "TS-222", name: "Highway Test", date: "2025-02-03", start_time: Date.now(), end_time: Date.now() },
  ];

  const [device, setDevice] = useState("");
  const [selectedTestSet, setSelectedTestSet] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeControl, setActiveControl] = useState(null);

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
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              >
                <option value="">Select device...</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </div>

            <label className={styles.label}>Test Set Name</label>
            <input
              className={styles.input}
              value={testSetName}
              onChange={(e) => setTestSetName(e.target.value)}
              placeholder="Enter test set name"
              disabled={isRecording}
            />

            {/* Record Buttons */}
            <div className={styles.recordButtons}>
              <button
                className={styles.button}
                disabled={!device || !testSetName || isRecording}
                onClick={() => setIsRecording(true)}
              >
                <FaCircle style={{ marginRight: "6px", color: "red" }} /> Start Record
              </button>

              <button
                className={styles.button}
                disabled={!isRecording}
                onClick={() => setIsRecording(false)}
              >
                <FaStop style={{ marginRight: "6px" }} /> Stop
              </button>
            </div>

            {isRecording && (
              <p className={styles.recordingIndicator}>
                <FaCircle style={{ color: "red", marginRight: "6px" }} /> Recording...
              </p>
            )}
          </div>
        )}

        {/* PLAYBACK TAB */}
        {tab === "playback" && (
          <div className={styles.page}>
            <h2 className={styles.subHeading}>Playback</h2>

            <label className={styles.label}>Device</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.input}
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              >
                <option value="">Select device...</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Set Selector */}
            <label className={styles.label}>Test Set</label>
            <select
              className={styles.input}
              value={selectedTestSet?._id || ""}
              onChange={(e) =>
                setSelectedTestSet(dummyTestSets.find((t) => t._id === e.target.value))
              }
              disabled={!device}
            >
              <option value="">Select Test Set...</option>
              {dummyTestSets.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Metadata Display */}
            {selectedTestSet && (
              <div className={styles.detailsBox}>
                <p><strong>Date:</strong> {selectedTestSet.date}</p>
                <p><strong>Start:</strong> {new Date(selectedTestSet.start_time).toLocaleTimeString()}</p>
                <p><strong>End:</strong> {new Date(selectedTestSet.end_time).toLocaleTimeString()}</p>
              </div>
            )}

            {/* Playback Controls */}
            <div className={styles.playbackControls}>
              <div className={styles.buttons}>
                <button className={styles.controlButton}>
                  <FaBackward />
                </button>

                <button
                  className={`${styles.controlButton} ${activeControl === "pause" ? styles.pauseActive : ""}`}
                  disabled={!isPlaying}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveControl("pause");
                  }}
                >
                  <FaPause />
                </button>

                <button
                  className={`${styles.controlButton} ${activeControl === "play" ? styles.playActive : ""}`}
                  disabled={!selectedTestSet}
                  onClick={() => {
                    setIsPlaying(true);
                    setActiveControl("play");
                  }}
                >
                  <FaPlay />
                </button>

                <button
                  className={`${styles.controlButton} ${activeControl === "stop" ? styles.stopActive : ""}`}
                  disabled={!isPlaying}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveControl("stop");
                  }}
                >
                  <FaStop />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
