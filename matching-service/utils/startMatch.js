const crypto = require('crypto');
const rooms = new Map();
const {generateQuestion} = require('./generateQuestion');

exports.startMatch = async (
    user1Socket,
    user2Socket,
    selectedDifficulty,
    selectedCategory
) => {
    generateQuestion(
        selectedDifficulty,
        selectedCategory
    )
        .then((question) => {
            if (question) {
                const roomId = crypto.randomUUID(); // generate unique room ID
                rooms.set(roomId, {
                    questionId: question._id,
                    user1Id: user1Socket.handshake.query.uid,
                    user2Id: user2Socket.handshake.query.uid,
                });

                user1Socket.emit( // send match found signal to frontend of both user
                    "match found",
                    roomId,
                    "You are matched with another user!"
                );
                user2Socket.emit(
                    "match found",
                    roomId,
                    "You are matched with another user!"
                );

                user1Socket.join(roomId);
                user2Socket.join(roomId);

            } else {
                console.error("Failed to fetch question.");
            }
        })
};
