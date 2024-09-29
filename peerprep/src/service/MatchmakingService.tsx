import { db, auth } from '../firebase';
import { collection, doc, setDoc, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
const baseurl = 'https://service-327190433280.asia-southeast1.run.app/question';

const fetchQuestions = async (difficulty: string) => {
    try {
      let url = `${baseurl}/randomQuestion`;
      const params = new URLSearchParams();
  
      if (difficulty) {
        params.append('difficulty', difficulty);
      }
  
      // Only append query parameters if they exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

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

    async initiateMatch(difficulty: string, name: string): Promise<void> {
        if (!this.user) throw new Error("User not authenticated");

        const waitingUserRef = doc(collection(db, "waiting_users"), this.user.uid);
        await setDoc(waitingUserRef, {
            userName: name,
            difficulty,
            timestamp: new Date().toISOString(),
            userId: this.user.uid,
        });
    }

    async findMatch(difficulty: string): Promise<MatchData | null> {
        if (!this.user) throw new Error("User not authenticated");

        const q = query(collection(db, "waiting_users"), where("difficulty", "==", difficulty), where("userId", "!=", this.user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const matchedUser = querySnapshot.docs[0];
            const matchRef = doc(collection(db, "matches"));
            const newMatchId = `${matchedUser.id}_${this.user.uid}`;
            this.question = await fetchQuestions(difficulty);
            
            const matchData: MatchData = {
                userName1: matchedUser.data().userName,
                userName2: this.user.displayName || '',
                userId1: matchedUser.id,
                userId2: this.user.uid,
                difficulty,
                date: new Date().toISOString(),
                matchId: newMatchId,
                status: "pending",
                questionName: this.question.questionTitle,
                question: this.question._id, // Add the actual question data here
            };

            await setDoc(matchRef, matchData);
            return matchData;
        }

        return null;
    }

    async cancelMatch(): Promise<void> {
        if (!this.user) throw new Error("User not authenticated");

        const waitingUserRef = doc(collection(db, "waiting_users"), this.user.uid);
        await deleteDoc(waitingUserRef);
    }

    async confirmMatch(matchId: string): Promise<void> {
        if (!this.user) throw new Error("User not authenticated");

        const q = query(collection(db, "matches"), where("matchId", "==", matchId));
        const currentMatch = (await getDocs(q)).docs[0].ref;

        await updateDoc(currentMatch, { [`${this.user.uid}_confirmed`]: true });

        const currentMatchSnapshot = await getDocs(q);
        const matchStatus = currentMatchSnapshot.docs[0].data();

        if (matchStatus[`${matchStatus.userId1}_confirmed`] && matchStatus[`${matchStatus.userId2}_confirmed`]) {
            await updateDoc(currentMatch, {
                status: "active",
            });
        }
    }

    async declineMatch(matchId: string): Promise<void> {
        if (!this.user) throw new Error("User not authenticated");

        const q = query(collection(db, "matches"), where("matchId", "==", matchId));
        const currentMatch = (await getDocs(q)).docs[0].ref;

        await updateDoc(currentMatch, {
            status: "canceled",
        });
    }
}

export const createMatchmakingService = (user: User | null) => new MatchmakingService(user);