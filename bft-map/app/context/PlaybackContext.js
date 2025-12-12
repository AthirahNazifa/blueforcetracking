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
  // { device_id: current index in that device's log }
  const [currentPositions, setCurrentPositions] = useState({}); 
  // { device_id: {latitude, longitude, timestamp} }

  const intervalRef = useRef(null);

  // --- Load sessions ---
  const fetchTestSets = async () => {
    try {
      const res = await axios.get("/api/playback/sessions");
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
      const res = await axios.get(`/api/playback/logs?session_id=${sessionId}`);
      // Group logs by device
      const grouped = {};
      res.data.forEach((log) => {
        if (!grouped[log.device_id]) grouped[log.device_id] = [];
        grouped[log.device_id].push(log);
      });
      // Sort each device logs by timestamp
      Object.keys(grouped).forEach((id) => {
        grouped[id].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });

      setPlaybackLogs(grouped);

      // Initialize current index & position for each device
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
    if (!Object.keys(playbackLogs).length) return;
    setIsPlaying(true);
    setIsPaused(false);
    startInterval();
  };

  const pause = () => {
    setIsPlaying(false);
    setIsPaused(true);
    clearInterval(intervalRef.current);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);

    // Reset all devices to first log
    const resetIndex = {};
    const resetPos = {};
    Object.keys(playbackLogs).forEach((id) => {
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

      Object.keys(playbackLogs).forEach((id) => {
        const logs = playbackLogs[id];
        if (!logs || logs.length === 0) return;

        if (nextIndex[id] + 1 < logs.length) {
          nextIndex[id] += 1;
          nextPositions[id] = logs[nextIndex[id]];
          anyUpdate = true;
        }
      });

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
    if (isPlaying) startInterval(); // restart interval with new speed
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
        play,
        pause,
        stopPlayback,
        setPlaybackSpeed,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

// Hook
export const usePlayback = () => useContext(PlaybackContext);
