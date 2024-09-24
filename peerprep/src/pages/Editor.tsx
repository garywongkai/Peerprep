import React, { useState, useEffect } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, theme } from '../firebase'; // Firebase setup
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import '../styles/Editor.css';
import UserHeader from '../components/UserHeader';
import { ThemeProvider } from '@mui/material';
import { response } from 'express';
import { set } from 'mongoose';
interface MatchData {
    userName1: string;
    userName2: string;
    userId1: string;
    userId2: string;
    difficulty: string;
    date: string;
    question: any;
    matchId: string;
}

const Editor = () => {
    const [user, loading, error] = useAuthState(auth);
    const location = useLocation();
    const { matchData } = location.state || {};
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState('// Start coding here...');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [bothSubmitted, setBothSubmitted] = useState(false);
    const [questionData, setQuestionData] = useState<any>({});
    const codeRef = doc(db, 'sessions', matchId!);
    const baseurl = 'https://service-327190433280.asia-southeast1.run.app/question';
const fetchQuestions = async () => {
    const questionId = matchData.question
    try {
      let url = `${baseurl}/getQuestionById`;
      const params = new URLSearchParams();
  
      if (questionId) {
        params.append('questionId', questionId);
      }
  
      // Only append query parameters if they exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
        fetch(url, {
            method: 'GET'
        }).then(response => response.json()).then((data) => setQuestionData(data));
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again');
    }
  };
  fetchQuestions();
    // Ensure user is defined before creating the document reference
    const submitStatusRef = user ? doc(db, 'sessions', matchId!, 'submitStatus', user.uid) : null;
    useEffect(() => {
        if (loading) return; // Do nothing while loading

        if (!user) return navigate("/signin");
    }, [user, loading]);
    useEffect(() => {
        const unsubscribe = onSnapshot(codeRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const { code } = docSnapshot.data() || {};
                if (code !== undefined && code !== null) {
                    setCode(code);
                }
            }
        });
        return () => unsubscribe();
    }, [matchId]);

    const handleCodeChange = (editor: any, data: any, value: string) => {
        setCode(value);
        setDoc(codeRef, { code: value }); // Ensure you save the updated code
    };

    const handleSubmit = async () => {
        if (!user || !submitStatusRef) return; // Ensure user is authenticated and ref is defined

        setHasSubmitted(true);
        await setDoc(submitStatusRef, { submitted: true }, { merge: true }); // Store submission status

        // Listen for submit status updates
        const unsubscribe = onSnapshot(doc(db, 'sessions', matchId!, 'submitStatus'), (snapshot) => {
            const submitStatus = snapshot.data() || {};
            const bothUsersSubmitted = submitStatus[matchData.userId1]?.submitted && submitStatus[matchData.userId2]?.submitted;
            if (bothUsersSubmitted) {
                setBothSubmitted(true);
                unsubscribe(); // Stop listening once both have submitted
            }
        });
    };

    useEffect(() => {
        if (bothSubmitted) {
            alert('Both users have submitted. The session is ending.');
        }
    }, [bothSubmitted]);

    return (
        <ThemeProvider theme={theme}>
        <UserHeader/>
        <div className="editor-container">
            <h3>Collaborative Coding Session</h3>
            <h4>Question: {questionData.questionTitle}</h4>
            <CodeMirror
                value={code}
                options={{
                    mode: 'javascript',
                    theme: 'material',
                    lineNumbers: true,
                }}
                onBeforeChange={(editor, data, value) => {
                    setCode(value);
                }}
                onChange={handleCodeChange}
            />
            <button onClick={handleSubmit} disabled={hasSubmitted}>
                {hasSubmitted ? 'Waiting for other user...' : 'Submit'}
            </button>
            {bothSubmitted && <div className="session-ended">Session has ended!</div>}
        </div>
        </ThemeProvider>
    );
};

export default Editor;
