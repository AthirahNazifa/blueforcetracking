"use client";
import { useState } from "react";
import { FaPlay, FaPause, FaStop, FaBackward, FaCircle } from "react-icons/fa";
import styles from "./Playback.module.css";

export default function PlaybackPanel() {
  const [tab, setTab] = useState("record");
  const [device, setDevice] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [testSetName, setTestSetName] = useState("");
  const [selectedTestSet, setSelectedTestSet] = useState(null);

  const testSetsByDevice = {
    device_1: [
      { id: "a1", name: "Device1 - Test Set A", date: "2025-12-05", start_time: "2025-12-05T08:30:00Z", end_time: "2025-12-05T08:45:00Z" },
      { id: "b1", name: "Device1 - Test Set B", date: "2025-12-06", start_time: "2025-12-06T10:00:00Z", end_time: "2025-12-06T10:20:00Z" },
    ],
    device_2: [
      { id: "a2", name: "Device2 - Test Set A", date: "2025-12-07", start_time: "2025-12-07T09:00:00Z", end_time: "2025-12-07T09:30:00Z" },
      { id: "b2", name: "Device2 - Test Set B", date: "2025-12-08", start_time: "2025-12-08T11:00:00Z", end_time: "2025-12-08T11:20:00Z" },
    ],
  };
  const testSets = device ? testSetsByDevice[device] || [] : [];

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

      {/* Page Content */}
      <div className={styles.pageContent}>
        {tab === "record" && (
          <div className={styles.page}>
            <h2 className={styles.subHeading}>Record Session</h2>

            <label className={styles.label}>Device</label>
            <select
              className={styles.input}
              value={device}
              onChange={(e) => setDevice(e.target.value)}
            >
              <option value="">Select device...</option>
              <option value="device_1">Device 1</option>
              <option value="device_2">Device 2</option>
              <option value="device_3">Device 3</option>
            </select>

            <label className={styles.label}>Test Set Name</label>
            <input
              className={styles.input}
              value={testSetName}
              onChange={(e) => setTestSetName(e.target.value)}
              placeholder="Enter test set name"
            />

            <div className={styles.recordButtons}>
              <button
                className={styles.button}
                onClick={() => setIsRecording(true)}
                disabled={!device || isRecording}
              >
                <FaCircle style={{ marginRight: "6px", color: "red" }} />
                Start Record
              </button>
              <button
                className={styles.button}
                onClick={() => setIsRecording(false)}
                disabled={!isRecording}
              >
                <FaStop style={{ marginRight: "6px" }} />
                Stop
              </button>
            </div>

            {isRecording && (
              <p className={styles.recordingIndicator}>
                <FaCircle style={{ color: "red", marginRight: "6px" }} /> Recording...
              </p>
            )}
          </div>
        )}

        {tab === "playback" && (
          <div className={styles.page}>
            <h2 className={styles.subHeading}>Playback</h2>

            <label className={styles.label}>Device</label>
            <select
              className={styles.input}
              value={device}
              onChange={(e) => {
                setDevice(e.target.value);
                setSelectedTestSet(null);
              }}
            >
              <option value="">Select device...</option>
              <option value="device_1">Device 1</option>
              <option value="device_2">Device 2</option>
              <option value="device_3">Device 3</option>
            </select>

            <label className={styles.label}>Test Set</label>
            <select
              className={styles.input}
              onChange={(e) => {
                const set = testSets.find((t) => t.id === e.target.value);
                setSelectedTestSet(set);
              }}
              value={selectedTestSet?.id || ""}
              disabled={!device}
            >
              <option value="">Select Test Set...</option>
              {testSets.map((ts) => (
                <option key={ts.id} value={ts.id}>
                  {ts.name}
                </option>
              ))}
            </select>

            {selectedTestSet && (
              <div className={styles.detailsBox}>
                <p><strong>Date:</strong> {selectedTestSet.date}</p>
                <p><strong>Start:</strong> {new Date(selectedTestSet.start_time).toLocaleTimeString()}</p>
                <p><strong>End:</strong> {new Date(selectedTestSet.end_time).toLocaleTimeString()}</p>
              </div>
            )}

            <button
              className={styles.button}
              disabled={!selectedTestSet}
              onClick={() => alert("Test set loaded")}
            >
              Load Test Set
            </button>

            <div className={styles.playbackControls}>
              <div className={styles.timeline}>
                <span>00:00</span>
                <input type="range" min="0" max="100" value="0" className={styles.slider} />
                <span>15:00</span>
              </div>
              <div className={styles.buttons}>
                <button className={styles.controlButton}><FaBackward /></button>
                <button className={styles.controlButton}><FaPause /></button>
                <button className={styles.controlButton}><FaPlay /></button>
                <button className={styles.controlButton}><FaStop /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
