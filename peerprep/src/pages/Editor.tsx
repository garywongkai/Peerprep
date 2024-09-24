import React, { useState, useEffect } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { db } from '../firebase'; // Firebase setup
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import { useParams, useLocation } from 'react-router-dom';

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
    const location = useLocation();
    const { matchData, user } = location.state as { matchData: MatchData; user: any };
   // If you stored the question as a string, you might want to parse it back
    const question = matchData ? JSON.parse(matchData.question) : null;
  const { matchId } = useParams();

  const [code, setCode] = useState('// Start coding here...');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [bothSubmitted, setBothSubmitted] = useState(false);

  const codeRef = doc(db, 'sessions', matchId!);
  const submitStatusRef = doc(db, 'sessions', matchId!, 'submitStatus');

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
    setDoc(codeRef, { code });
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);
    await setDoc(submitStatusRef, { [user.uid]: true }, { merge: true });

    onSnapshot(submitStatusRef, (docSnapshot) => {
      const submitStatus = docSnapshot.data() || {};
      const bothUsersSubmitted = submitStatus[matchData.userId1] && submitStatus[matchData.userId2];
      if (bothUsersSubmitted) {
        setBothSubmitted(true);
      }
    });
  };

  useEffect(() => {
    if (bothSubmitted) {
      alert('Both users have submitted. The session is ending.');
    }
  }, [bothSubmitted]);

  return (
    <div>
      <h3>Collaborative Coding Session</h3>
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
      {bothSubmitted && <div>Session has ended!</div>}
    </div>
  );
};

export default Editor;
