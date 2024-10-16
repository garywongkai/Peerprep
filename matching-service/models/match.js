const { db } = require("../config/firebase");
const { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    query, 
    where, 
    deleteDoc, 
    updateDoc, 
    orderBy 
} = require("firebase/firestore");

// 你的其他逻辑代码

const fetchQuestions = async (difficulty) => {
    try {
        const baseurl = "https://service-327190433280.asia-southeast1.run.app/question";
        let url = `${baseurl}/randomQuestion`;
        const params = new URLSearchParams();

        if (difficulty) {
            params.append("difficulty", difficulty);
        }

        // Only append query parameters if they exist
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
};


class QuestionHistoryItem {
    constructor(date, questionName, difficulty, matchId, collaborator) {
        this.date = date;
        this.questionName = questionName;
        this.difficulty = difficulty;
        this.matchId = matchId;
        this.collaborator = collaborator;
    }
}

class MatchData {
    constructor(
        userName1, userName2, userId1, userId2, 
        difficulty, date, question, matchId, status, questionName, endTime
    ) {
        this.userName1 = userName1;
        this.userName2 = userName2;
        this.userId1 = userId1;
        this.userId2 = userId2;
        this.difficulty = difficulty;
        this.date = date;
        this.question = question;
        this.matchId = matchId;
        this.status = status;
        this.questionName = questionName;
        this.endTime = endTime; // This can be undefined
    }
}


class MatchingService {
    async initiateMatch(difficulty, name, user) {
        console.log("dif: ", difficulty, "name: ", name, "user: ", user);
        if (!user) throw new Error("User not authenticated");
        
        const waitingUserRef = doc(collection(db, "waiting_users"), user.uid);
        await setDoc(waitingUserRef, {
            userName: name,
            difficulty,
            timestamp: new Date().toISOString(),
            userId: user.uid,
        });
    }

    async findMatch(difficulty, user) {
        if (!user) throw new Error("User not authenticated");

        const q = query(
            collection(db, "waiting_users"),
            where("difficulty", "==", difficulty),
            where("userId", "!=", user.uid)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const matchedUser = querySnapshot.docs[0];
            const matchRef = doc(collection(db, "matches"));
            const newMatchId = `${matchedUser.id}_${user.uid}`;
            const question = await fetchQuestions(difficulty);

            const matchData = {
                userName1: matchedUser.data().userName,
                userName2: user.displayName || "",
                userId1: matchedUser.id,
                userId2: user.uid,
                difficulty,
                date: new Date().toISOString(),
                matchId: newMatchId,
                status: "pending",
                questionName: question.questionTitle,
                question: question._id,
            };

            await setDoc(matchRef, matchData);
            return matchData;
        }

        return null;
    }

    async cancelMatch(user) { // cancel the match request of current user
        if (!user) throw new Error("User not authenticated");

        const waitingUserRef = doc(
            collection(db, "waiting_users"),
            user.uid
        );
        await deleteDoc(waitingUserRef);
    }

    async confirmMatch(matchId, user) {
        if (!user) throw new Error("User not authenticated");

        const q = query( // search matching current matchId from all the matches
            collection(db, "matches"),
            where("matchId", "==", matchId)
        );
        const currentMatch = (await getDocs(q)).docs[0].ref; // get the first match

        await updateDoc(currentMatch, { [`${user.uid}_confirmed`]: true }); // update current match status to true

        const currentMatchSnapshot = await getDocs(q); // get match status again
        const matchStatus = currentMatchSnapshot.docs[0].data(); // get data of current match

        if ( // both user are confirmed
            matchStatus[`${matchStatus.userId1}_confirmed`] &&
            matchStatus[`${matchStatus.userId2}_confirmed`]
        ) {
            await updateDoc(currentMatch, { // modify 'status' from pending to active
                status: "active",
            });
        }
    }

    async declineMatch(matchId, user) {
        if (!user) throw new Error("User not authenticated");

        const matchesQuery = query(
            collection(db, "matches"),
            where("matchId", "==", matchId)
        );
        const matchSnapshot = await getDocs(matchesQuery);
        const matchDoc = matchSnapshot.docs[0];
        const matchData = matchSnapshot.docs[0].data();

        // Delete the match
        // Update the match status to 'canceled'
        await updateDoc(matchDoc.ref, { status: "canceled" }); // update status to 'canceled'

        // Determine the other user's ID
        const otherUserId =
            matchData.userId1 === user.uid
                ? matchData.userId2
                : matchData.userId1;

        // Notify the other user that the match was declined (you might want to implement a notification system)
        // For now, we'll just update a field in the user's document
        const otherUserRef = doc(collection(db, "users"), otherUserId);
        await updateDoc(otherUserRef, { // record the declined match info in other user
            lastMatchDeclined: true,
            lastMatchDeclinedAt: new Date().toISOString(),
        });

        await deleteDoc(doc(collection(db, "waiting_users"), user.uid)); // delete current user from waiting list
        // await deleteDoc(doc(collection(db, "waiting_users"), otherUserId));
    }

    async checkAndHandleDeclinedMatch(user) {
        if (!user) throw new Error("User not authenticated");

        const userRef = doc(collection(db, "users"), user.uid);
        const userDoc = await getDocs(
            query(collection(db, "users"), where("uid", "==", user.uid))
        );
        const userData = userDoc.docs[0].data();

        if (userData.matchDeclined) {
            // Reset the matchDeclined flag
            await updateDoc(userRef, {
                matchDeclined: false,
                matchDeclinedAt: null,
            });

            return true;
        }

        return false;
    }

    async getQuestionHistory(user) {
        if (!user) throw new Error("User not authenticated");
        
        // search matched record of the user, both as user1 and user2
        const matchesQuery1 = query(
            collection(db, "matches"),
            where("status", "==", "finished"),
            where("userId1", "==", user.uid),
            orderBy("date", "desc")
        );

        const matchesQuery2 = query(
            collection(db, "matches"),
            where("status", "==", "finished"),
            where("userId2", "==", user.uid),
            orderBy("date", "desc")
        );

        const [snapshot1, snapshot2] = await Promise.all([ // do search in parrellel
            getDocs(matchesQuery1),
            getDocs(matchesQuery2),
        ]);

        const history = []; // to store ultimate match history

        const processSnapshot = (snapshot) => {
            snapshot.forEach((doc) => { // for every match:
                const data = doc.data();
                history.push({ // add match data to history
                    date: data.date || "Unknown Date",
                    questionName: data.questionName || "Unknown Question",
                    difficulty: data.difficulty || "Unknown Difficulty",
                    matchId: data.matchId || doc.id,
                    collaborator:
                        user.uid === data.userId1
                            ? data.userName2
                            : data.userName1,
                });
            });
        };
        processSnapshot(snapshot1);
        processSnapshot(snapshot2);

        // Sort combined results by date
        history.sort( // sort by latest
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return history;
    }
}

const matchingService = new MatchingService();
module.exports = { matchingService };

