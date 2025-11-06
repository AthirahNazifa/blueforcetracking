# BlueForceTracking Project

## Overview

**BlueForceTracking** is a comprehensive real-time tracking system designed to manage, monitor, and visualize multiple GPS-enabled devices.
The project consists of **three main components** and an optional **Martin Tile Server** for map rendering.

### Components

1. **bft-backend** – Node.js backend server that handles WebSocket communication, device management, and data processing.
2. **bft-map** – A Next.js-based web application that visualizes live positions and movement on a map.
3. **bft-monitoring-app** – A control panel for monitoring connected devices and managing their states.
4. **Martin Tile Server** *(External)* – A lightweight and fast tile server for serving map tiles (`.mbtiles`).

---

## Prerequisites

Before starting, ensure the following are installed and working on your system:

* **Martin Tile Server** – installed and running on **Linux Ubuntu**
* **Node.js** (version ≥ 18.x)
* **npm** (Node Package Manager)
* **Visual Studio Code** or any preferred code editor
* **Git** (optional, for version control)

---

## Setup Instructions

### 1. Run Martin Tile Server (Ubuntu)

The Martin server serves your map tiles and must be started first.

1. Open **Ubuntu Terminal**.
2. Navigate to your Martin directory:

   ```bash
   cd martin
   ```
3. Run the Martin server with your configuration:

   ```bash
   ./martin --config config.yaml --listen-addresses 0.0.0.0:4000
   ```

   * `config.yaml` should define your `.mbtiles` source and server settings.
   * You can verify it’s running by visiting:

     ```
     http://<your-server-ip>:4000
     ```
4. Keep this terminal running.

> 💡 *Martin serves the map tiles locally, replacing the need for an external MapTiler or online service.*

---

### 2. Open Project in Visual Studio Code

1. Launch **VS Code**.
2. Open the main folder:

   ```
   C:\Users\User\BFT\Martin\blueforcetracking
   ```
3. You’ll see subfolders for `bft-backend`, `bft-map`, `bft-monitoring-app`, and `server`.

---

### 3. Choose Your Server Mode

You can either simulate GPS data using a **dummy server** or connect to a **real GPS data source**.

#### (A) Using Dummy Server (Testing Mode)

1. Open a new terminal in VS Code.
2. Navigate to the `server` folder:

   ```bash
   cd server
   ```
3. Start the dummy server:

   ```bash
   node dummyServer
   ```

   This will simulate multiple GPS devices sending random coordinates to your backend.

#### (B) Using Real Server (Production Mode)

1. Open `websockethandler.js` in the `bft-backend` directory.
2. Locate and update the WebSocket connection line:

   ```js
   // const WS_URL = "ws://localhost:8080";
   const WS_URL = "ws://192.168.0.183:8080";
   ```

   Replace `192.168.0.183` with your actual server IP.

---

### 4. Run the Backend Server

The backend handles WebSocket data flow and API endpoints.

1. Open a **new terminal** in VS Code.
2. Navigate to the backend folder:

   ```bash
   cd bft-backend
   ```
3. Install dependencies (first time only):

   ```bash
   npm install
   ```
4. Start the server:

   ```bash
   node server.js
   ```

   Once running, it should show:

   ```
   Server running on http://localhost:3000
   WebSocket listening on ws://localhost:8080
   ```

---

### 5. Run the Map Application (Frontend)

The map app visualizes real-time locations from the backend.

1. Open another terminal:

   ```bash
   cd bft-map
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the app:

   ```bash
   npm run dev
   ```
4. Open your browser and visit:

   ```
   http://localhost:3001
   ```

   You should see a map rendered from the **Martin Tile Server** with live tracking points.

---

### 6. Run the Monitoring Application

This app provides a dashboard view of connected devices and their status.

1. Open a new terminal:

   ```bash
   cd bft-monitoring-app
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the app:

   ```bash
   npm run dev
   ```
4. Visit:

   ```
   http://localhost:3000
   ```

   You’ll see device details, logs, and connection indicators.

---

## Notes & Best Practices

* Always run each service (Martin, backend, frontend, monitoring) in **separate terminals**.
* Keep `.env` files properly configured for each app (especially for WebSocket URLs and ports).
* Restart the relevant service when making code changes.
* Dummy device logs appear in the terminal running `dummyServer.js`.
* When deploying to production, make sure ports (`4000`, `8080`, `3000`, `3001`) are open in your firewall.

---

## Example Martin `config.yaml`

```yaml
sources:
  world:
    type: mbtiles
    path: /home/user/maps/world.mbtiles

tilesets:
  world:
    source: world

webserver:
  bind_address: 0.0.0.0
  port: 4000
```

---

## Troubleshooting

| Issue                           | Possible Cause                                | Solution                                                      |
| ------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| **Map not loading**             | Martin not running or incorrect URL           | Verify Martin is active and accessible on port 4000           |
| **Backend not responding**      | Missing dependencies or MongoDB not connected | Reinstall with `npm install` and check `.env` database URI    |
| **No live GPS updates**         | Dummy server or WebSocket misconfigured       | Confirm dummy server is active or correct `WS_URL` in backend |
| **Port already in use**         | Another service using same port               | Change port in `.env` or `config.yaml`                        |
| **Frontend showing stale data** | Browser cache or hot reload issue             | Clear cache or restart the frontend server                    |

---

## License

This project is licensed under [Your License].

---

## Author

Developed by **BlueForceTracking Team**
For internal and research use.
