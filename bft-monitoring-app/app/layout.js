"use client";
import { useState } from "react";
import { MapProvider } from "@context/MapContext";
import { DeviceProvider } from "@context/DeviceContext";
// Removed PanelProvider import
import Topbar from "@components/Topbar";
import Sidebar from "@components/Sidebar";
import SearchPanel from "@components/panels/Search";
import DevicePanel from "@components/panels/Device";
// import AddDevicePanel from "@components/panels/AddDevice";
import "./globals.css";

export default function RootLayout({ children }) {
  const [activePanel, setActivePanel] = useState(null);

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {/* ✅ Wrap entire app in providers once */}
        <MapProvider>
          <DeviceProvider setActivePanel={setActivePanel}>
            {/* Removed PanelProvider wrapper
            <PanelProvider>
            */}
              <Topbar />
              <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
                <Sidebar setActivePanel={setActivePanel} />

                <div style={{ flex: 1, position: "relative" }}>
                  {children}

                  {activePanel === "Search" && (
                    <div style={panelStyle}>
                      <SearchPanel />
                    </div>
                  )}

                  {activePanel === "Devices" && (
                    <div style={panelStyle}>
                      <DevicePanel />
                    </div>
                  )}

                  {/* Uncomment when AddDevicePanel is ready */}
                  {/* {activePanel === "Add Device" && (
                    <div style={panelStyle}>
                      <AddDevicePanel />
                    </div>
                  )} */}
                </div>
              </div>
            {/* Removed PanelProvider closing tag
            </PanelProvider>
            */}
          </DeviceProvider>
        </MapProvider>
      </body>
    </html>
  );
}

const panelStyle = {
  position: "absolute",
  top: 0,
  left: "0px",
  width: "400px",
  height: "100%",
  background: "#fff",
  boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
  zIndex: 10,
  overflowY: "auto",
};
