import React, { useState, useEffect, useCallback } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, theme } from '../firebase'; // Firebase setup
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/theme/twilight.css';
import 'codemirror/theme/xq-dark.css';
import 'codemirror/mode/javascript/javascript';
import '../styles/Editor.css';
import UserHeader from '../components/UserHeader';
import { ThemeProvider } from '@mui/material';
import debounce from 'lodash.debounce';

interface MatchData {
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
  }

const Editor = () => {
    const [user, loading, error] = useAuthState(auth);
    const location = useLocation();
    const { matchData } = location.state || {};
    const { matchId } = useParams();
    const [editortheme, setEditorTheme] = useState('material');
    const navigate = useNavigate();
    const [code, setCode] = useState('// Start coding here...');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [bothSubmitted, setBothSubmitted] = useState(false);
    const [questionData, setQuestionData] = useState<any>({});
    const codeRef = doc(db, 'sessions', matchId!);
    const baseurl = 'https://service-327190433280.asia-southeast1.run.app/question';
    const fetchQuestions = async () => {
        try {
        let url = `${baseurl}/`;
        const params = new URLSearchParams();
    
        if (matchData.question) {
            params.append('', matchData.question);
        }
    
        // Only append query parameters if they exist
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        const response = await fetch(url, {
            method: 'GET'
          });
        const data = await response.json().then((data) => data[0]);
        setQuestionData(data);
        } catch (err) {
        console.error(err);
        alert('An error occurred. Please try again');
        }
    };
    const handleTheme = (e: any) => {
        setEditorTheme(e.target.value)
    };
    // Ensure user is defined before creating the document reference
    const submitStatusRef = user ? doc(db, 'sessions', matchId!, 'submitStatus', user.uid) : null;
    useEffect(() => {
        if (loading) return; // Do nothing while loading
        if (!user) return navigate("/signin");
    }, [user, loading]);
    useEffect(() => {
        if (!matchId) return; // Ensure matchId is defined
        fetchQuestions();
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
    const handleCodeChange = useCallback(
        debounce((editor, data, value) => {
            setCode(value);
            setDoc(codeRef, { code: value }, { merge: true }); // Save the updated code to Firestore
        }, 500), // 500ms delay for debouncing
        []
    );

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
            <h4>Question: {matchData.questionName}</h4>
            <h5>{questionData.questionDescription}</h5>
            <div>Select theme:   
            <select value={editortheme} onChange={handleTheme}>
                <option value="material">Material</option>
                <option value="dracula">Dracula</option>
                <option value="monokai">Monokai</option>
                <option value="solarized">Solarized</option>
                <option value="twilight">Twilight</option>
                <option value="xq-dark">XQ-Dark</option>
            </select></div>
            
            <CodeMirror
                value={code}
                options={{
                    mode: 'javascript',
                    theme: editortheme,
                    lineNumbers: true,
                    readOnly: false,
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
