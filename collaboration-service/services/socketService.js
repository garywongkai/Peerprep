exports.handleSocketConnection = async (socket) => {
    socket.on('send_message', (message, roomID) => {
        console.log(`Server heard this message in room ${roomID}: ${message}`);
        socket.to(roomID).emit('receive_message', message);
        console.log(`Server relayed message to everyone in room`);
    });
};