const rooms = new Set();

const ROOM_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
const activeRooms = new Map();
let io;

exports.initialize = (socketIo) => {
	io = socketIo; // Store the io instance for global use

	// Set up the interval with access to io
	setInterval(() => {
		activeRooms.forEach((room, roomId) => {
			const elapsedTime = Date.now() - room.createdAt;
			const remainingTime = Math.max(0, ROOM_EXPIRY_TIME - elapsedTime);

			if (remainingTime > 0) {
				// Use io instead of socket.server
				io.to(roomId).emit("time_remaining", {
					remainingTime,
					totalTime: ROOM_EXPIRY_TIME,
					expiryTimestamp: room.createdAt.getTime() + ROOM_EXPIRY_TIME,
				});
			}
		});
	}, 60 * 1000); // Update every minute
};

exports.handleSocketConnection = async (socket) => {
	// Store user info from connection query
	const username = socket.handshake.query.displayName;
	const uid = socket.handshake.query.uid;

	socket.on("send_message", ({ message, username, timestamp, roomId }) => {
		console.log(`Server heard this message in room ${roomId}: ${message}`);

		// Emit the message along with the username and timestamp
		socket.to(roomId).emit("receive_message", { message, username, timestamp });

		console.log(`Broadcasting message: "${message}" to room: ${roomId}`); // Log broadcast action
	});


	// Join a room
	socket.on("joinRoom", (roomId, callback) => {
		socket.join(roomId);

		let room = activeRooms.get(roomId);
		let firstToArrive = false;
		if (!room) {
			console.log(`New room started: ${roomId}`);
			firstToArrive = true;
			room = {
				createdAt: new Date(),
				timeout: setTimeout(() => expireRoom(roomId), ROOM_EXPIRY_TIME),
				users: new Set(),
			};
			activeRooms.set(roomId, room);
		} else {
			// Clear existing timeout and set new one based on remaining time
			clearTimeout(room.timeout);
			const elapsedTime = Date.now() - room.createdAt.getTime();
			const remainingTime = Math.max(0, ROOM_EXPIRY_TIME - elapsedTime);
			room.timeout = setTimeout(() => expireRoom(roomId), remainingTime);
		}
		room.users.add(socket.id);
		console.log(`User ${socket} joined room ${roomId}`);
		// Notify room about time remaining
		callback({
			init: firstToArrive, // Tell the client to initialize if first to arrive
			expiryTimestamp: room.createdAt.getTime() + ROOM_EXPIRY_TIME,
			remainingTime: ROOM_EXPIRY_TIME - (Date.now() - room.createdAt.getTime()),
			totalTime: ROOM_EXPIRY_TIME,
		});
	});

	socket.on("leave_session", (roomId, username) => {
		handleUserLeave(socket, roomId, username);
	});

	socket.on("disconnect", () => {
		// Handle unexpected disconnections if needed
		const rooms = [...socket.rooms];
		const username = socket.handshake.query.displayName;

		rooms.forEach((roomId) => {
			if (roomId !== socket.id) {
				// Skip the default room
				handleUserLeave(socket, roomId, username);
			}
		});
	});

	// Handle connection errors
	socket.on("connect_error", (error) => {
		console.error(`Connection error for user ${username}:`, error);
		socket.emit("connect_error", error.message);
	});
};

// Helper functions
function expireRoom(roomId) {
	if (!io) return;

	io.to(roomId).emit("room_expired", {
		message: "Session has expired. Please save your work and rejoin if needed.",
	});

	io.in(roomId)
		.allSockets()
		.then((sockets) => {
			sockets.forEach((socketId) => {
				const clientSocket = io.sockets.sockets.get(socketId);
				if (clientSocket) {
					clientSocket.leave(roomId);
				}
			});
		});

	activeRooms.delete(roomId);
	console.log(`Room ${roomId} expired and cleaned up`);
}

function emitTimeRemaining(roomId) {
	if (!io) return;

	const room = activeRooms.get(roomId);
	if (room) {
		const elapsedTime = Date.now() - room.createdAt;
		const remainingTime = Math.max(0, ROOM_EXPIRY_TIME - elapsedTime);

		io.to(roomId).emit("time_remaining", {
			remainingTime,
			totalTime: ROOM_EXPIRY_TIME,
		});
	}
}

function handleUserLeave(socket, roomId, username) {
	const room = activeRooms.get(roomId);
	if (room) {
		room.users.delete(socket.id);

		// If room is empty, start a shorter timeout
		if (room.users.size === 0) {
			clearTimeout(room.timeout);
			const timeout = setTimeout(() => {
				expireRoom(roomId, socket);
			}, 5 * 60 * 1000); // 5 minutes grace period
			room.timeout = timeout;
		}
	}

	socket.to(roomId).emit("user_left", username);
	socket.leave(roomId);
}


// Helper functions
function expireRoom(roomId) {
	if (!io) return;

	io.to(roomId).emit("room_expired", {
		message: "Session has expired. Please save your work and rejoin if needed.",
	});

	io.in(roomId)
		.allSockets()
		.then((sockets) => {
			sockets.forEach((socketId) => {
				const clientSocket = io.sockets.sockets.get(socketId);
				if (clientSocket) {
					clientSocket.leave(roomId);
				}
			});
		});

	activeRooms.delete(roomId);
	console.log(`Room ${roomId} expired and cleaned up`);
}

function emitTimeRemaining(roomId) {
	if (!io) return;

	const room = activeRooms.get(roomId);
	if (room) {
		const elapsedTime = Date.now() - room.createdAt;
		const remainingTime = Math.max(0, ROOM_EXPIRY_TIME - elapsedTime);

		io.to(roomId).emit("time_remaining", {
			remainingTime,
			totalTime: ROOM_EXPIRY_TIME,
		});
	}
}

function handleUserLeave(socket, roomId, username) {
	const room = activeRooms.get(roomId);
	if (room) {
		room.users.delete(socket.id);

		// If room is empty, start a shorter timeout
		if (room.users.size === 0) {
			clearTimeout(room.timeout);
			const timeout = setTimeout(() => {
				expireRoom(roomId, socket);
			}, 5 * 60 * 1000); // 5 minutes grace period
			room.timeout = timeout;
		}
	}

	socket.to(roomId).emit("user_left", username);
	socket.leave(roomId);
}
