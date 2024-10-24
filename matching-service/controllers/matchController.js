const waitingQueue = [];
const {startMatch} = require('../utils/startMatch'); // must have brackets

exports.matchUser = (socket, selectedDifficulty, selectedCategory) => {
    console.log("--------waiting list before trying to match--------");
    console.log('waitingQueue length:', waitingQueue.length);

    const userId = socket.handshake.query.uid;
    if (waitingQueue.find((user) => user.handshake.query.uid === userId)) { 
        // If the user is already in the queue, they cannot self-match
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

        if (matchingUserIndex !== -1) { 
            // If a match is found, startMatch is called
            console.log("You have found a potential matching user!");
            const user1 = waitingQueue.splice(matchingUserIndex, 1)[0]; 
            // Remove a matching user from the waitingQueue and assign them to the user1 variable
            startMatch( // Start the match
                user1,
                socket,
                selectedDifficulty,
                selectedCategory
            );
        } else { 
            // If no matching user is found (matchingUserIndex === -1), 
            // add the current user's matching criteria and identity to the waitingQueue
            console.log("No user found yet. Please wait:");
            Object.assign(socket.handshake.query, {
                uid: userId,
                selectedDifficulty,
                selectedCategory
            });
            waitingQueue.push(socket);            
        }
    }

    console.log("--------waiting list after trying to match--------");
    console.log('waitingQueue length:', waitingQueue.length);

};

exports.cancelMatchByButton = (socket) => {
    console.log("--------waiting list before cancel--------");
    console.log('waitingQueue length:', waitingQueue.length);

    const index = waitingQueue.indexOf(socket);
    if (index !== -1) { 
        // If the user is found in the queue, remove them from the queue
        waitingQueue.splice(index, 1);
        console.log("Match is canceled by button.");
        console.log("--------waiting list after cancel--------");
        console.log('waitingQueue length:', waitingQueue.length);
    }
};

exports.cancelMatchByTimeout = (socket) => {
    console.log("--------waiting list before cancel--------");
    console.log('waitingQueue length:', waitingQueue.length);

    const index = waitingQueue.indexOf(socket);
    if (index !== -1) { 
        // If the user is found in the queue, remove them from the queue
        waitingQueue.splice(index, 1);
        console.log("Match is canceled because of timeout.");
        console.log("--------waiting list after cancel--------");
        console.log('waitingQueue length:', waitingQueue.length);
    }
};
