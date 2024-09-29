import { db } from '../firebase';
import { doc, setDoc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';

export class CollaborationService {
    private matchId: string;

    constructor(matchId: string) {
        this.matchId = matchId;
    }

    async initializeSession(initialCode: string): Promise<void> {
        const codeRef = doc(db, 'sessions', this.matchId);
        await setDoc(codeRef, { code: initialCode, status: "coding" }, { merge: true });
    }

    subscribeToCodeChanges(callback: (code: string) => void): () => void {
        const codeRef = doc(db, 'sessions', this.matchId);
        return onSnapshot(codeRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const { code } = docSnapshot.data() || {};
                if (code !== undefined && code !== null) {
                    callback(code);
                }
            }
        });
    }

    async updateCode(newCode: string): Promise<void> {
        const codeRef = doc(db, 'sessions', this.matchId);
        await setDoc(codeRef, { code: newCode }, { merge: true });
    }

    async submitCode(userId: string): Promise<void> {
        const codeRef = doc(db, 'sessions', this.matchId);
        await updateDoc(codeRef, {
            [`submitStatus.${userId}`]: { submitted: true }
        });
    }

    subscribeToSubmissionStatus(callback: (bothSubmitted: boolean) => void): () => void {
        const codeRef = doc(db, 'sessions', this.matchId);
        return onSnapshot(codeRef, (snapshot) => {
            const sessionData = snapshot.data() || {};
            const submitStatus = sessionData.submitStatus || {};
            const bothSubmitted = Object.values(submitStatus).every((status: any) => status.submitted === true);
            callback(bothSubmitted);
        });
    }

    async endSession(): Promise<void> {
        const codeRef = doc(db, 'sessions', this.matchId);
        await updateDoc(codeRef, { status: 'submitted' });
        await deleteDoc(codeRef);
    }
}

export const createCollaborationService = (matchId: string) => new CollaborationService(matchId);