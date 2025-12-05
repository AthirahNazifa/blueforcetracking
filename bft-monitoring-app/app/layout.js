"use client";
import { useState } from "react";
import { MapProvider } from "@context/MapContext";
import { DeviceProvider } from "@context/DeviceContext";
import Topbar from "@components/Topbar";
import Sidebar from "@components/Sidebar";
import SearchPanel from "@components/panels/Search";
import DevicePanel from "@components/panels/Device";
import Playback from "@components/panels/Playback";
import MapEmbed from "@components/MapEmbed"; // use your existing component
import "./globals.css";

export default function RootLayout({ children }) {
  const [activePanel, setActivePanel] = useState(null);

  return (
    <html lang="en">
      <body className="app-root">
        {/* MapProvider wraps everything so MapEmbed and other components can access it */}
        <MapProvider>
          <DeviceProvider setActivePanel={setActivePanel}>
            
            {/* Map sits behind UI */}
            <MapEmbed />

            {/* Topbar and Sidebar overlay */}
            <Topbar />
            <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />

            {/* Panels slide over map */}
            {activePanel === "Search" && <SearchPanel />}
            {activePanel === "Devices" && <DevicePanel />}
            {activePanel === "Record Playback" && <Playback />}

            {/* Optional children rendered over map */}
            <div className="mainContent">{children}</div>

          </DeviceProvider>
        </MapProvider>
      </body>
    </html>
  );
}
