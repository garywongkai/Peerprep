require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");
const collaborationService = require("./service/collaboration-service");
const Y = require('yjs');


const SOCKET_MATCHING_PORT = 5003;

let codeState = "// Start coding together!";

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
    console.log(`Collaboration server is listening on port ${SOCKET_MATCHING_PORT}`);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json({ message: "Peerprep collaboration-service" });
});


io.on("connection", async (socket) => {
    //console.log(`${socket.id} connected to collaboration server`);
    //collaborationService.handleCollaboration(socket, yDoc);
    socket.on('send_message', (message, roomID) => {
        console.log(`Server heard this message in room ${roomID}: ${message}`);
        socket.to(roomID).emit('receive_message', message);
        console.log(`Server relayed message to everyone in room`);
    });

    //socket.emit("code-update", codeState);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        socket.roomId = roomId;
        console.log(`Socket join room ${roomId}`);
        socket.to(roomId).emit("code-update", codeState);

    });

    socket.on("code-update", (newCode, roomId) => {
        codeState = newCode;
        socket.to(roomId).emit("code-update", newCode, roomId); // Broadcast to other clients
    });
        
    
});