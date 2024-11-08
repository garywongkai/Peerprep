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

	socket.on("leave_session", (roomId, username) => {
		// Notify others in the room that this user has left
		socket.to(roomId).emit("user_left", username);

		// Leave the room
		socket.leave(roomId);
	});

	socket.on("disconnect", () => {
		// Handle unexpected disconnections if needed
		const rooms = [...socket.rooms];
		const username = socket.handshake.query.displayName;

		rooms.forEach((roomId) => {
			if (roomId !== socket.id) {
				// Skip the default room
				socket.to(roomId).emit("user_left", username);
			}
		});
	});

	// Handle handshake responses
	socket.on("handshake_response", (confirmed, roomId) => {
		socket.to(roomId).emit("handshake_response", confirmed); // Broadcast handshake response to the room
		console.log(`Session ended in ${roomId}`);
	});
};
