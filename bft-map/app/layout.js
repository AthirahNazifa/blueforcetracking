import { MapProvider } from "@context/MapContext";
import { DeviceProvider } from "@context/DeviceContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {/* ✅ Both contexts available to all pages */}
        <MapProvider>
          <DeviceProvider>{children}</DeviceProvider>
        </MapProvider>
      </body>
    </html>
  );
}
