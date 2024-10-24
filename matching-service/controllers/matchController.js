const waitingQueue = [];
const {startMatch} = require('../utils/startMatch'); // must have brackets

exports.matchUser = (socket, selectedDifficulty, selectedCategory) => {
    const userId = socket.handshake.query.uid;
    if (waitingQueue.find((user) => user.handshake.query.uid === userId)) { // 如果用户已经在队列中，不能自我匹配
        console.log(
            "User is already in the queue and cannot self-match."
        );
    } else {
        // Check if a match is found with another user
        const matchingUserIndex = waitingQueue.findIndex(
            (user) =>
                user.handshake.query.selectedDifficulty === selectedDifficulty &&
                user.handshake.query.selectedCategory === selectedCategory
        );

        if (matchingUserIndex !== -1) { // 如果找到了匹配者，则startMatch
            console.log("You have found a potential matching user!");
            const user1 = waitingQueue.splice(matchingUserIndex, 1)[0]; // 从 waitingQueue 中移除一个匹配的用户，并将其赋值给 user1 变量
            startMatch( // 开始匹配
                user1,
                socket,
                selectedDifficulty,
                selectedCategory
            );
        } else { // 如果没有匹配的用户（matchingUserIndex === -1），则将当前用户的匹配条件和身份信息添加到 waitingQueue 中。
            console.log("No user found yet. Please wait:");
            Object.assign(socket.handshake.query, {
                uid: userId,
                selectedDifficulty,
                selectedCategory
            });
            waitingQueue.push(socket);            
        }
    }
};

exports.cancelMatchByButton = (socket) => {
    const index = waitingQueue.indexOf(socket);
    if (index !== -1) { 
        waitingQueue.splice(index, 1);
        console.log("Match is canceled by button.");
        socket.emit("match canceled");
    }
};

exports.cancelMatchByTimeout = (socket) => {
    const index = waitingQueue.indexOf(socket);
    if (index !== -1) { 
        waitingQueue.splice(index, 1);
        console.log("Match is canceled because of timeout.");
        socket.emit("match canceled");
    }
};