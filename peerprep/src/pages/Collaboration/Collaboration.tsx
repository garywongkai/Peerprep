import Editor from '@monaco-editor/react';
import { editor as monacoEditor } from 'monaco-editor';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MonacoBinding } from 'y-monaco';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
import '../../styles/Collaboration.css';
import UserHeader from '../../components/UserHeader';
import { CircularProgress } from '@mui/material';
import { socket as collabSocket, URL as collabURL } from "./collabSocket";
import { socket as codeSocket } from "./codeSocket";
import { getStylizedLanguageName } from './utils';

/*
This page would cause the error:
Module Warning 
Failed to parse source map from ...

This is caused by CRA (Create-React-App) with Webpack 5.x
More info in the link below:
https://stackoverflow.com/questions/70599784/failed-to-parse-source-map
*/

const initialContent = `// Start collaborating and write your code
console.log("Hello World!");`

const Collaboration_Service: React.FC = () => {
  const [first, setFirst] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<{ message: string; username: string; timestamp: string }[]>([]);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [editor, setEditor] = useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [language, setLanguage] = useState("javascript"); // Language to set editor
  const [languages, setLanguages] = useState<string[]>([]); // All supported languages list
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [userLeft, setUserLeft] = useState(false);
  const [isIntentionalLeave, setIsIntentionalLeave] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [memoryUsed, setMemoryUsed] = useState<number | null>(null);
  const maxReconnectAttempts = 5;
  const url =
    process.env.REACT_APP_ENV === "development"
      ? "http://localhost:5001/saveCodeAttempt"
      : "https://user-service-327190433280.asia-southeast1.run.app/saveCodeAttempt";
  const location = useLocation();
  const navigate = useNavigate();
  const { socketId, roomId, difficulty, category, question } = location.state || {};
  const accessToken = localStorage.getItem("accessToken");
  const displayName = localStorage.getItem("displayName");
  const uid = localStorage.getItem("uid");

  useEffect(() => {
    updateSessionState(true);

    collabSocket.emit('joinRoom', roomId, ({ init, expiryTimestamp, remainingTime, totalTime }: any) => {
      setFirst(init); // Server told this client to init Y.Doc
      const sessionInfo = {
        roomId,
        questionTitle: question?.questionTitle,
        questionDescription: question?.questionDescription,
        category: question?.questionCategory,
        difficulty,
        timestamp: new Date().toISOString(),
        expiryTimestamp: expiryTimestamp,
        remainingTime: remainingTime,
        totalTime: totalTime
      };
      localStorage.setItem('activeSession', JSON.stringify(sessionInfo));
    });


    codeSocket.emit('get_available_languages', (languages: string[]) => {
      setLanguages(languages);
    });

    collabSocket.on('receive_message', ({ message, username, timestamp }) => {
      setMessageList((prevList: { message: string; username: string; timestamp: string }[]) => [
        ...prevList,
        { message, username, timestamp } // Store the message object
      ]);
    });

    collabSocket.on('user_left', handleUserLeft);

    collabSocket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      setIsReconnecting(true);
      setReconnectAttempts(prev => prev + 1);
    });

    collabSocket.on('disconnect', (reason: string) => {
      console.log('User disconnected:', reason);
      setIsReconnecting(true);

      // If the disconnection wasn't intentional, try to reconnect
      if (reason === 'io server disconnect') {
        collabSocket.connect();
      }
      updateSessionState(false);
    });

    collabSocket.on('room_expired', (message) => {
      alert(message);
      // Save work and redirect
      saveCodeAttempt().then(() => {
        localStorage.removeItem('activeSession');
        navigate('/dashboard');
      });
    });

    collabSocket.on('language_updated', (newLanguage: string) => {
      setLanguage(newLanguage);
    });

    // Handle time remaining updates
    collabSocket.on('time_remaining', ({ remainingTime, totalTime, expiryTimestamp }) => {
      const existingSession = localStorage.getItem('activeSession');
      if (existingSession) {
        const session = JSON.parse(existingSession);
        const updatedSession = {
          ...session,
          expiryTimestamp: expiryTimestamp,
          remainingTime: remainingTime,
          totalTime: totalTime,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('activeSession', JSON.stringify(updatedSession));
      }

      // Show warning when less than 5 minutes remain
      if (remainingTime <= 5 * 60 * 1000) {
        window.confirm(`⚠️ Session expires in ${Math.ceil(remainingTime / 60000)} minutes`);
      }
    });

    return () => {
      collabSocket.off('receive_message');
      collabSocket.off('user_left', handleUserLeft);
      collabSocket.off('connect_error');
      collabSocket.off('disconnect');
      collabSocket.off('language_updated');
      collabSocket.off('room_expired');
      collabSocket.off('room_joined');
      collabSocket.off('time_remaining');
    }
  }, []);

  const formatExecutionTime = (time: number | null | string) => {
    console.log('Raw execution time:', time); // Debug log
    if (time === null) return 'N/A';
    const numTime = typeof time === 'string' ? parseFloat(time) : time;
    if (isNaN(numTime)) return 'N/A';
    
    // Handle very small numbers
    if (numTime < 0.001) {
      return '< 0.001 sec';
    }
    return `${numTime.toFixed(3)} sec`;
  };
  
  const formatMemoryUsage = (memory: number | null) => {
    if (memory === null || typeof memory !== 'number') return 'N/A';
    return `${(Number(memory) / 1024).toFixed(2)} MB`;
  };
  

  useEffect(() => {
    let _doc: Y.Doc;
    let provider: SocketIOProvider;
    let binding: MonacoBinding;

    if (roomId && editor) {
      _doc = new Y.Doc();

      provider = new SocketIOProvider(collabURL, roomId, _doc, {
        autoConnect: true,
        // resyncInterval: 5000,
        // disableBc: false
      });
      binding = new MonacoBinding(
        _doc.getText('monaco'),
        editor.getModel()!,
        new Set([editor]),
        provider.awareness
      );
      setDoc(_doc)
    }

    return () => {
      doc?.destroy();
      provider?.destroy();
      binding?.destroy();
    }
  }, [roomId, editor]);

  useEffect(() => {
    if (first && doc && editor) {
      doc.getText('monaco').insert(0, initialContent);
      const update = Y.encodeStateAsUpdate(doc);
      Y.applyUpdate(doc, update);
    }
  }, [first, doc, editor]);

  const handleUserLeft = (username: string) => {
    setUserLeft(true);
    setMessageList(prevList => [
      ...prevList,
      { message: `${username} has left the session.`, username: 'Console', timestamp: new Date().toISOString() }
    ]);
  };

  const sendMessage = () => {
    if (message.trim()) {
      const timestamp = new Date().toISOString();
      collabSocket.emit('send_message', { message, username: displayName, timestamp, roomId });
      setMessageList((prevList: { message: string; username: string; timestamp: string }[]) => [
        ...prevList,
        { message, username: "Me", timestamp }
      ]);
      setMessage(""); // Clear the input field after sending
    }
  };

  const saveCodeAttempt = async () => {
    const codeAttempt = editor?.getValue() || doc?.getText();
    const dateLogged = new Date().toISOString();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(
          {
            code: codeAttempt,
            date: dateLogged,
            roomId: roomId,
            questionDescription: question.questionDescription,
            questionTitle: question.questionTitle,
            questionCategory: question.questionCategory,
            difficulty: difficulty,
          }),
      });

      if (response.status === 400) {
        alert('Code is empty. Attempt will not be saved.');
        navigate('/dashboard');
      } else if (response.ok) {
        alert('Code attempt saved successfully.');
        navigate('/dashboard');
      } else {
        console.error('Failed to save code attempt.');
      }
    } catch (error) {
      console.error('Error saving code attempt:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  // Add confirmation dialog when user tries to navigate away
  useEffect(() => {
    const handleLocationChange = (e: PopStateEvent) => {
      if (!isIntentionalLeave) {
        const confirmLeave = window.confirm(
          'Are you sure you want to leave? Do you want to end your session and save your code?.'
        );

        if (!confirmLeave) {
          e.preventDefault();
          window.history.pushState(null, '', window.location.pathname);
        } else {
          endSession();
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      if (!isIntentionalLeave) {
        updateSessionState(false);
      }
    };
  }, [isIntentionalLeave]);

  const updateSessionState = (isConnected: boolean, timeRemaining?: number) => {
    const existingSession = localStorage.getItem('activeSession');
    if (existingSession) {
      const session = JSON.parse(existingSession);
      const updatedSession = {
        ...session,
        isConnected,
        lastUpdated: new Date().toISOString(),
        lastCode: editor?.getValue() || doc?.getText(),
        timeRemaining
      };
      localStorage.setItem('activeSession', JSON.stringify(updatedSession));
    }
  };

  const endSession = async () => {
    try {
      setIsIntentionalLeave(true);
      await saveCodeAttempt();

      collabSocket.emit('leave_session', roomId, displayName);
      collabSocket.disconnect();
      localStorage.removeItem('activeSession');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to save your code attempt. Please try again.');
      setIsIntentionalLeave(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const runCode = () => {
    const code = editor?.getValue();
    if (code !== "") {
      codeSocket.emit('run_code', language, code, (result: any) => {
        setLoading(false);
        
        if (result.error) {
          setOutput(result.error || 'Execution failed');
          return;
        }
  
        // Only show the actual program output
        setOutput(result.output || '');
        setExecutionTime(result.executionTime);
        setMemoryUsed(result.memoryUsed);
      });
      setOutput(`Running code in ${language}`);
      setLoading(true);
    }
  };

  return (
    <>
      <UserHeader />
      <div className="collaboration-container">
        {isReconnecting && (
          <div className="reconnecting-overlay">
            <div className="reconnecting-message">
              <CircularProgress size={24} />
              <span>
                {reconnectAttempts < maxReconnectAttempts
                  ? `Reconnecting... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`
                  : 'Connection lost. Please rejoin from dashboard.'}
              </span>
            </div>
          </div>
        )}
        <div className="question-section">
          <h2 className="question-title">
            {question.questionTitle}
          </h2>
          <div className="question-meta">
            <span className="badge category">Category: {question.questionCategory}</span>
            <span className="badge difficulty">Difficulty: {difficulty}</span>
          </div>
          <div className="question-description">
            <p>{question.questionDescription}</p>
          </div>
        </div>
        <div className="workspace">
          <div className="editor-section">
            <Editor
              height="70vh"
              theme="vs-dark"
              language={language}
              onMount={editor => { setEditor(editor) }}
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                automaticLayout: true,
              }}
            />
            <div className="editor-actions">
            <select
              id="language-select"
              value={language}
              onChange={(e) => {  
                  const newLanguage = e.target.value;
                  setLanguage(newLanguage);
                  // Emit language change to other users
                  collabSocket.emit('language_change', {
                      language: newLanguage,
                      roomId: roomId
                  });
              }}
              className="language-select"
              disabled={loading}
          >
              {languages.map((lang) => (
                  <option key={lang} value={lang}>
                      {getStylizedLanguageName[lang] || lang}
                  </option>
              ))}
          </select>
              <button
                className="btn-save"
                onClick={runCode}
                disabled={loading}
              >
                {loading ? 'Running...' : 'Run Code'}
              </button>
              <button
                className="btn-save"
                onClick={endSession}
              >
                End Session
              </button>
            </div>
          </div>
          <div className="chat-section">
            <div className="chat-messages" id="chat-messages">
              {userLeft && (
                <div className="system-message fade-out">
                  An user has left the session. You can continue coding or end your session.
                </div>
              )}
              {messageList.map((msg, index) => (
                <div key={index} className="message">
                  <strong>{msg.username}</strong>: {msg.message} <span className="timestamp">({new Date(msg.timestamp).toLocaleTimeString()})</span>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
      {/* Output Section */}
  <div className="output-section">
    <div className="output-header">
      <div className="output-title">
        <i className="fas fa-terminal"></i>
        Output
      </div>
      <div className="header-actions">
      <div className="execution-metrics">
        {executionTime !== null && (
          <span className="metric">
            <i className="fas fa-clock"></i>
            {formatExecutionTime(executionTime)}
          </span>
        )}
        {memoryUsed !== null && (
          <span className="metric">
            <i className="fas fa-memory"></i>
            {formatMemoryUsage(memoryUsed)}
          </span>
          )}
        </div>
        <div className={`status-indicator ${loading ? 'running' : ''}`}>
          {loading ? (
            <>
              <CircularProgress size={16} />
              <span>Running code...</span>
            </>
          ) : (
            <span>Ready</span>
          )}
        </div>
        <button 
          className="copy-button"
          onClick={copyOutput}
          title="Copy to clipboard"
        >
          <i className="fas fa-copy"></i>
        </button>
            </div>
          </div>
          <div className="output-content">
            <pre>
        <code className={output.includes('Error') ? 'error-output' : 'success-output'}>
                {output || 'Run your code to see output here'}
              </code>
            </pre>
          </div>
        </div>
      </>
    );
  }

export default Collaboration_Service;
