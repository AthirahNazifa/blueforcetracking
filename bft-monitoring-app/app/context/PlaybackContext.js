"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";

const PlaybackContext = createContext();

export function PlaybackProvider({ children }) {
  // --- Sessions & Logs ---
  const [testSets, setTestSets] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [playbackLogs, setPlaybackLogs] = useState({}); 
  // { device_id: [logs sorted by timestamp] }

  // --- Playback State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentIndex, setCurrentIndex] = useState({}); 
  const [currentPositions, setCurrentPositions] = useState({}); 

  // --- Recording State ---
  const [isRecording, setIsRecording] = useState(false);
  const [deviceRecord, setDeviceRecord] = useState("all"); // selected device for playback/recording

  const intervalRef = useRef(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  // --- Fetch sessions ---
  const fetchTestSets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/playback/sessions`);
      setTestSets(res.data);
    } catch (err) {
      console.error("Failed to load sessions:", err.message);
    }
  };

  useEffect(() => {
    fetchTestSets();
  }, []);

  // --- Load logs for selected session ---
  const loadSessionLogs = async (sessionId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/playback/logs?session_id=${sessionId}`);
      const grouped = {};
      res.data.forEach((log) => {
        if (!grouped[log.device_id]) grouped[log.device_id] = [];
        grouped[log.device_id].push(log);
      });
      Object.keys(grouped).forEach((id) => {
        grouped[id].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
      setPlaybackLogs(grouped);

      // Initialize indexes & positions
      const initIndex = {};
      const initPos = {};
      Object.keys(grouped).forEach((id) => {
        initIndex[id] = 0;
        initPos[id] = grouped[id][0] || null;
      });
      setCurrentIndex(initIndex);
      setCurrentPositions(initPos);
    } catch (err) {
      console.error("Failed to load session logs:", err.message);
    }
  };

  useEffect(() => {
    if (selectedSession) {
      loadSessionLogs(selectedSession._id);
      stopPlayback();
    }
  }, [selectedSession]);

  // --- Playback Controls ---
  const play = () => {
    console.log("▶️ Starting playback");
    if (!Object.keys(playbackLogs).length) return;
    setIsPlaying(true);
    setIsPaused(false);
    startInterval();
  };

  const pause = () => {
    console.log("⏸ Pausing playback");
    setIsPlaying(false);
    setIsPaused(true);
    clearInterval(intervalRef.current);
  };

  const stopPlayback = () => {
    console.log("⏹ Stopping playback");
    setIsPlaying(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);

    const resetIndex = {};
    const resetPos = {};

    // Reset only the selected device if specified, otherwise reset all
    const devicesToReset = deviceRecord && deviceRecord !== "all"
      ? [deviceRecord]
      : Object.keys(playbackLogs);

    devicesToReset.forEach((id) => {
      resetIndex[id] = 0;
      resetPos[id] = playbackLogs[id][0] || null;
    });

    setCurrentIndex(resetIndex);
    setCurrentPositions(resetPos);
  };

  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const nextIndex = { ...currentIndex };
      const nextPositions = { ...currentPositions };
      let anyUpdate = false;

      // Respect device selection: if a single device is chosen, only update that device
      const devicesToUpdate = deviceRecord && deviceRecord !== "all"
        ? [deviceRecord]
        : Object.keys(playbackLogs);

      devicesToUpdate.forEach((id) => {
        const logs = playbackLogs[id];
        if (!logs || logs.length === 0) return;

        if (nextIndex[id] + 1 < logs.length) {
          nextIndex[id] += 1;
          nextPositions[id] = logs[nextIndex[id]];
          anyUpdate = true;
        }
      });

      // Stop playback if selected device has reached the end
      if (!anyUpdate) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        return;
      }

      setCurrentIndex(nextIndex);
      setCurrentPositions(nextPositions);
    }, 1000 / speed);
  };

  const setPlaybackSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    if (isPlaying) startInterval();
  };

  // --- Recording Controls ---
  const startRecording = async (device_id, testSetName) => {
    if (!testSetName) {
      alert("Please enter a test set name");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/playback/start`, {
        device_id,
        testSetName,
      });
      if (res.data.success) {
        console.log("✅ Recording started:", { device_id, testSetName });
        setIsRecording(true);
        fetchTestSets();
      }
    } catch (err) {
      console.error("Failed to start recording:", err.message);
    }
  };

  const stopRecording = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/playback/stop`);
      if (res.data.success) {
        console.log("✅ Recording stopped");
        setIsRecording(false);
        fetchTestSets();
      }
    } catch (err) {
      console.error("Failed to stop recording:", err.message);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <PlaybackContext.Provider
      value={{
        testSets,
        selectedSession,
        setSelectedSession,
        playbackLogs,
        currentPositions,
        currentIndex,
        isPlaying,
        isPaused,
        speed,
        isRecording,
        deviceRecord,
        setDeviceRecord,
        play,
        pause,
        stopPlayback,
        startRecording,
        stopRecording,
        setPlaybackSpeed,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

// Hook
export const usePlayback = () => useContext(PlaybackContext);
