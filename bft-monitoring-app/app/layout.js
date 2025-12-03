"use client";
import { useState } from "react";
import { MapProvider } from "@context/MapContext";
import { DeviceProvider } from "@context/DeviceContext";
import Topbar from "@components/Topbar";
import Sidebar from "@components/Sidebar";
import SearchPanel from "@components/panels/Search";
import DevicePanel from "@components/panels/Device";
import Playback from "@components/panels/Playback";
// import AddDevicePanel from "@components/panels/AddDevice";
import "./globals.css";

export default function RootLayout({ children }) {
  const [activePanel, setActivePanel] = useState(null);

  return (
    <html lang="en">
      <body className="app-root">
        {/* ✅ Wrap entire app in providers once */}
        <MapProvider>
          <DeviceProvider setActivePanel={setActivePanel}>
            {/* Topbar always fixed at top */}
            <Topbar />

            {/* Sidebar fixed on the left */}
            <Sidebar setActivePanel={setActivePanel} />

            {/* Main content area */}
            <div className="mainContent">
              {children}

              {/* Panels slide in under Topbar */}
              {activePanel === "Search" && (
                <div className="panel open">
                  <SearchPanel />
                </div>
              )}

              {activePanel === "Devices" && (
                <div className="panel open">
                  <DevicePanel />
                </div>
              )}

              {activePanel === "Record Playback" && (
                <div className="panel open">
                  <Playback />
                </div>
              )}
              
              {/* Uncomment when AddDevicePanel is ready */}
              {/* {activePanel === "Add Device" && (
                <div className="panel open">
                  <AddDevicePanel />
                </div>
              )} */}
            </div>
          </DeviceProvider>
        </MapProvider>
      </body>
    </html>
  );
}
