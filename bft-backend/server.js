require("dotenv").config();

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const initWebSocketDevice = require("./utils/websockethandler");
const deviceRoutes = require("./routes/deviceRoutes");
const cors = require("cors");
const app = express(); 
const server = http.createServer(app);
//const wss = new WebSocket.Server({ server });

const io = new Server(server, {
  cors: {
    origin: "*", 
  }
});

// declare middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api", deviceRoutes);

io.on("connection", (socket) => {
  //console.log("Frontend connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Frontend disconnected:", socket.id);
  });
});

// broadcast to clients: frontend users
function broadcast(data) {
 io.emit("device-update", data);
}

connectDB()
  .then(() => {
    initWebSocketDevice(broadcast);

    const PORT = 5000;
    server.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
