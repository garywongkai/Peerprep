require("dotenv").config({ path: "./.env" });
//const { Server } = require("@hocuspocus/server");
//const { HocuspocusProvider  } = require("@hocuspocus/provider");
const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");
const collaborationService = require("./service/collaboration-service");


const SOCKET_MATCHING_PORT = 5003;
const HOCUSPOCUS_PORT = 5004;

const io = socketIo(server, {
  cors: {
      origin: [
          "http://localhost:3000",
          "http://localhost:5000",
          "https://peerprep-327190433280.asia-southeast1.run.app",
          "https://peerprep-327190433280.asia-southeast1.run.app:3000",
          "https://peerprep-327190433280.asia-southeast1.run.app:5000",
      ], // Allow only these origins
      optionsSuccessStatus: 200, // For older browsers},
  },
});

server.listen(SOCKET_MATCHING_PORT, () => {
    console.log(`Collaboration server is listening on port ${SOCKET_MATCHING_PORT}`);
});

//const hocuspocusServer = Server.configure({
//    extensions: [
//      new WebSocketServer(),
//    ],
//  });

//hocuspocusServer.listen(3003);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json({ message: "Peerprep user-service" });
});

io.on("connection", async (socket) => {
    //console.log(`${socket.id} connected to collaboration server`);
    collaborationService.handleCollaboration(socket);
});