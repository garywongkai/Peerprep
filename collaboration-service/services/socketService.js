const rooms = new Set();

exports.handleSocketConnection = async (socket) => {
  socket.on('send_message', (message, roomId) => {
    console.log(`Message sent in room ${roomId}: ${message}`);
    socket.to(roomId).emit('receive_message', message);
  });

  socket.on('joinRoom', (roomId, callback) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) { // New room, ask client to init
      console.log(`New room started: ${roomId}`);
      rooms.add(roomId);
      callback(true);
    }
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });
};