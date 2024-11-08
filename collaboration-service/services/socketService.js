exports.handleSocketConnection = async (socket) => {
	socket.on("send_message", (message, roomId) => {
		console.log(`Server heard this message in room ${roomId}: ${message}`);
		socket.to(roomId).emit("receive_message", message);
		console.log(`Broadcasting message: "${message}" to room: ${roomId}`); // Log broadcast action
	});

	// Handle handshake requests
	socket.on("handshake_request", (roomId) => {
		socket.to(roomId).emit("handshake_request"); // Broadcast handshake request to the room
		console.log(`Session end requested in ${roomId}`);
	});

	// Join a room
	socket.on("joinRoom", (roomId) => {
		socket.join(roomId);
		console.log(`User joined room: ${roomId}`);
	});

	// Handle handshake responses
	socket.on("handshake_response", (confirmed, roomId) => {
		socket.to(roomId).emit("handshake_response", confirmed); // Broadcast handshake response to the room
		console.log(`Session ended in ${roomId}`);
	});
};
