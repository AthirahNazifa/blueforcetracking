const WebSocket = require("ws");
const simulateMovement = require("./simulateMovement");
const Device = require("./models/Device");
const mongoose = require("mongoose");
const { type } = require("os");

mongoose.connect("mongodb://localhost:27017/deviceDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB for dummy server");
});

const createDummyDevices = async () => {
    const count = await Device.countDocuments();
    if(count === 0) {
        await Device.deleteMany({});
        const devices = [];
        for (let i = 1; i <= 1; i++) {
            devices.push({
              id: `device_${i}`,
              latitude: 3.110972, //3.111184 + (Math.random() - 0.5) * 0.002,   // ~±100m around center
              longitude:  101.583055, //101.583174 + (Math.random() - 0.5) * 0.002, // ~±100m around center
              speed: 0,
              direction: 0,
              timestamp: new Date(),
            });
          }          
        await Device.insertMany(devices);
        console.log("Dummy devices created");
    }
};

const wss = new WebSocket.Server({ port: 8080 }, () => {
    console.log("Dummy WebSocket server started on ws://localhost:8080");
});

wss.broadcast = (data) => {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

const startSimulation = async () => {
    await createDummyDevices();

    setInterval(async () => {
        await simulateMovement();

        const devices = await Device.find({status: "active"});
        devices.forEach((device) => {
            const message = {
                type: "position",
                device_id: device.id,
                latitude: device.latitude,
                longitude: device.longitude,
                speed: device.speed,
                direction: device.direction,
                timestamp: device.timestamp,
            };
            wss.broadcast(message);
        });
    },2000); // every 2 seconds
};

wss.on("connection", (ws) => {
console.log("Client connected");

ws.on("message", (msg) => {
    console.log("Received from client:", msg);
});

    ws.on("close", () => {
    console.log("Client disconnected");
    });
});

startSimulation();