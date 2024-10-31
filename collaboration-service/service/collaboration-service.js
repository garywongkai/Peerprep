//const Y = require('yjs');

exports.handleCollaboration = async (socket, yDoc) => {
    socket.on('send_message', (message, roomID) => {
        console.log(`Server heard this message in room ${roomID}: ${message}`);
        socket.to(roomID).emit('receive_message', message);
        console.log(`Server relayed message to everyone in room`);
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        socket.roomId = roomId;
        console.log(`Socket join room ${roomId}`);
    });

    socket.on('sync', (update) => {
        // Apply update to the shared Yjs document
        Y.applyUpdate(yDoc, new Uint8Array(update));
    
        // Broadcast update to other clients in the room
        socket.broadcast.emit('sync', update);
    });
};