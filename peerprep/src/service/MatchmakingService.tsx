import { db, auth} from "../firebase";
import {
    collection,
    doc,
    setDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    updateDoc,
    orderBy,
    QuerySnapshot,
} from "firebase/firestore";
import { User } from "firebase/auth";
const baseurl = "https://service-327190433280.asia-southeast1.run.app/question";

const fetchQuestions = async (difficulty: string) => {
    try {
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

export interface QuestionHistoryItem {
    date: string;
    questionName: string;
    difficulty: string;
    matchId: string;
    collaborator: string;
}

export interface MatchData {
    userName1: string;
    userName2: string;
    userId1: string;
    userId2: string;
    difficulty: string;
    date: string;
    question: any;
    matchId: string;
    status: string;
    questionName: string;
    endTime?: string;
}

export class MatchmakingService {
    private user: User | null;
    private question: any;
    constructor(user: User | null) {
        this.user = user;
    }

    async initiateMatch(difficulty: string, name: string): Promise<void> { // add a user to waiting list
        if (!this.user) throw new Error("User not authenticated");

        const waitingUserRef = doc( // the reference of a waiting user in waiting_users
            collection(db, "waiting_users"),
            this.user.uid
        );
        await setDoc(waitingUserRef, {
            userName: name,
            difficulty,
            timestamp: new Date().toISOString(),
            userId: this.user.uid,
        });
    }

    async findMatch(difficulty: string): Promise<MatchData | null> {
        if (!this.user) throw new Error("User not authenticated");

        const q = query(
            collection(db, "waiting_users"),
            where("difficulty", "==", difficulty), // same difficulty level
            where("userId", "!=", this.user.uid) // excluding itself
        );
        const querySnapshot = await getDocs(q); // including all the valid queries

        if (!querySnapshot.empty) {
            const matchedUser = querySnapshot.docs[0]; // first valid user
            const matchRef = doc(collection(db, "matches")); // a ref of collection to store match data
            const newMatchId = `${matchedUser.id}_${this.user.uid}`; // concatenate to a new id
            this.question = await fetchQuestions(difficulty); // fetch a valid question from question pool

            const matchData: MatchData = {
                userName1: matchedUser.data().userName,
                userName2: this.user.displayName || "",
                userId1: matchedUser.id,
                userId2: this.user.uid,
                difficulty,
                date: new Date().toISOString(),
                matchId: newMatchId,
                status: "pending",
                questionName: this.question.questionTitle,
                question: this.question._id, // Add the actual question data here
            };

            await setDoc(matchRef, matchData); // store match data to matches data
            return matchData;
        }

        return null;
    }

    async cancelMatch(): Promise<void> { // cancel the match request of current user
        if (!this.user) throw new Error("User not authenticated");

        const waitingUserRef = doc(
            collection(db, "waiting_users"),
            this.user.uid
        );
        await deleteDoc(waitingUserRef);
    }

    async confirmMatch(matchId: string): Promise<void> {
        if (!this.user) throw new Error("User not authenticated");

        const q = query( // search matching current matchId from all the matches
            collection(db, "matches"),
            where("matchId", "==", matchId)
        );
        const currentMatch = (await getDocs(q)).docs[0].ref; // get the first match

        await updateDoc(currentMatch, { [`${this.user.uid}_confirmed`]: true }); // update current match status to true

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

    async declineMatch(matchId: string): Promise<void> {
        if (!this.user) throw new Error("User not authenticated");

        const matchesQuery = query(
            collection(db, "matches"),
            where("matchId", "==", matchId)
        );
        const matchSnapshot = await getDocs(matchesQuery);
        const matchDoc = matchSnapshot.docs[0];
        const matchData = matchSnapshot.docs[0].data() as MatchData;

        // Delete the match
        // Update the match status to 'canceled'
        await updateDoc(matchDoc.ref, { status: "canceled" }); // updata status to 'canceled'

        // Determine the other user's ID
        const otherUserId =
            matchData.userId1 === this.user.uid
                ? matchData.userId2
                : matchData.userId1;

        // Notify the other user that the match was declined (you might want to implement a notification system)
        // For now, we'll just update a field in the user's document
        const otherUserRef = doc(collection(db, "users"), otherUserId);
        await updateDoc(otherUserRef, { // record the declined match info in other user
            lastMatchDeclined: true,
            lastMatchDeclinedAt: new Date().toISOString(),
        });

        await deleteDoc(doc(collection(db, "waiting_users"), this.user.uid)); // delete current user from waiting list
        // await deleteDoc(doc(collection(db, "waiting_users"), otherUserId));
    }

    async checkAndHandleDeclinedMatch(): Promise<boolean> {
        if (!this.user) throw new Error("User not authenticated");

        const userRef = doc(collection(db, "users"), this.user.uid);
        const userDoc = await getDocs(
            query(collection(db, "users"), where("uid", "==", this.user.uid))
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

    async getQuestionHistory(): Promise<QuestionHistoryItem[]> {
        if (!this.user) throw new Error("User not authenticated");
        
        // search matched record of the user, both as user1 and user2
        const matchesQuery = query(
            collection(db, "matches"),
            where("status", "==", "finished"),
            where("userId1", "==", this.user.uid),
            orderBy("date", "desc")
        );

        const matchesQuery2 = query(
            collection(db, "matches"),
            where("status", "==", "finished"),
            where("userId2", "==", this.user.uid),
            orderBy("date", "desc")
        );

        const [snapshot1, snapshot2] = await Promise.all([ // do search in parrellel
            getDocs(matchesQuery),
            getDocs(matchesQuery2),
        ]);

        const history: QuestionHistoryItem[] = []; // to store ultimate match history

        const processSnapshot = (snapshot: QuerySnapshot) => {
            snapshot.forEach((doc) => { // for every match:
                const data = doc.data();
                history.push({ // add match data to history
                    date: data.date || "Unknown Date",
                    questionName: data.questionName || "Unknown Question",
                    difficulty: data.difficulty || "Unknown Difficulty",
                    matchId: data.matchId || doc.id,
                    collaborator:
                        this.user!.uid === data.userId1
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

export const createMatchmakingService = (user: User | null) =>
    new MatchmakingService(user);
