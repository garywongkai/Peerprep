exports.handleSocketConnection = async (socket) => {
    socket.on('send_message', (message, roomId) => {
        console.log(`Server heard this message in room ${roomId}: ${message}`);
        socket.to(roomId).emit('receive_message', message);
        console.log(`Server relayed message to everyone in room`);
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        socket.roomId = roomId;
        console.log(`Socket join room ${roomId}`);
    });
};