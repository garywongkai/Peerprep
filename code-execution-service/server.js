require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");
const socketService = require("./services/socketService");
const { runCodeInit } = require("./controllers/runCode");

const SOCKET_MATCHING_PORT = 5004;

const io = socketIo(server, {
  cors: {
      origin: [
          "http://localhost:3000",
          "http://localhost:5000",
          "https://peerprep-327190433280.asia-southeast1.run.app",
          "https://peerprep-327190433280.asia-southeast1.run.app:3000",
          "https://peerprep-327190433280.asia-southeast1.run.app:5000",
      ], // Allow only these origins
      methods: ["GET", "POST"],
      optionsSuccessStatus: 200, // For older browsers},
    },
});

server.listen(SOCKET_MATCHING_PORT, () => {
    console.log(`Code Execution server is listening on port ${SOCKET_MATCHING_PORT}`);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json({ message: "Peerprep code-execution-service" });
});

io.on("connection", async (socket) => {
    socketService.handleSocketConnection(socket);
});

runCodeInit();