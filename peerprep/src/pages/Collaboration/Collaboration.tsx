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

const Collaboration_Service: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<{ message: string; username: string; timestamp: string }[]>([]);
  const [editorContent, setEditorContent] = useState("Your code here...");
  const doc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [editor, setEditor] = useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const [userLeft, setUserLeft] = useState(false);
  const [isIntentionalLeave, setIsIntentionalLeave] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const url =
            process.env.REACT_APP_ENV === "development"
                ? "http://localhost:5001/saveCodeAttempt"
                : "https://user-service-327190433280.asia-southeast1.run.app/saveCodeAttempt";
  const location = useLocation();
  const navigate = useNavigate();
  const { socketId, roomId, difficulty, category, question } = location.state || {};
  const URL = process.env.REACT_APP_ENV === "development"
		? "http://localhost:5003"
		: "https://collaboration-service-327190433280.asia-southeast1.run.app";
  const accessToken = localStorage.getItem("accessToken");
  const displayName = localStorage.getItem("displayName");
  const uid = localStorage.getItem("uid");
  const socketRef = useRef<Socket | null>(null);

  // useEffect(() => {
  //   const sessionInfo = {
  //       roomId,
  //       questionTitle: question?.questionTitle,
  //       questionDescription: question?.questionDescription,
  //       category: question?.questionCategory,
  //       difficulty,
  //       timestamp: new Date().toISOString(),
  //   };
  //   localStorage.setItem('activeSession', JSON.stringify(sessionInfo));
  // }, [roomId, question, difficulty]);

  useEffect(() => {
      const connectSocket = () => {
      socketRef.current = io(URL, {
          query: {
              token: accessToken,
              displayName: displayName,
              uid: uid,
          },
          reconnection: true,
          reconnectionAttempts: maxReconnectAttempts,
          reconnectionDelay: 1000,
      });
      const socket = socketRef.current;
      socket.on('connect', () => {
          socket.emit('joinRoom', roomId); // Emit joinRoom only once on connect
          updateSessionState(true);
      });
     
    }
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Clean up the socket connection on unmount
      }
    };
  }, [URL, accessToken, displayName, uid, roomId]);
    
  useEffect(() => {
    const _socketIOProvider = new SocketIOProvider(URL, roomId, doc, {
      autoConnect: false,
      resyncInterval: 5000,
      disableBc: false
    });
    setProvider(_socketIOProvider);
    _socketIOProvider.connect();

    _socketIOProvider.on('sync', (isSynced: boolean) => {
      if (isSynced) {
        console.log('Document synced successfully');
      }
    });

    _socketIOProvider.on('connection-error', (error: Error) => {
      console.error('Provider connection error:', error);
    });

    return () => {
      _socketIOProvider.destroy();
      doc.destroy();
    }
  }, [doc, roomId]);

  useEffect(() => {
    if (provider && editor) {
      const _binding = new MonacoBinding(doc.getText(), editor.getModel()!, new Set([editor]), provider?.awareness);
      setBinding(_binding);
      return () => {
        _binding.destroy();
      }
    }
  }, [doc, provider, editor]);

  // useEffect(() => {
  //   const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
  //     if (!isIntentionalLeave) {
  //       e.preventDefault();
  //       e.returnValue = '';
        
  //       try {          
  //         // Notify others that you're leaving
  //         socketRef.current?.emit('leave_session', roomId, displayName);
  
  //         // Store session info for potential rejoin
  //         const sessionInfo = {
  //           roomId,
  //           questionTitle: question.questionTitle,
  //           questionDescription: question.questionDescription,
  //           category: question.questionCategory,
  //           difficulty,
  //           timestamp: new Date().toISOString(),
  //           lastCode: editor?.getValue() || doc.getText()
  //         };
  //         setIsIntentionalLeave(false);
  //         localStorage.setItem('activeSession', JSON.stringify(sessionInfo));
  //       } catch (error) {
  //         console.error('Error handling page close:', error);
  //       }
  //     }
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);

  //   return () => {
  //       window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, [isIntentionalLeave, question, roomId, displayName, editor, doc]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (socket) {
      socket.on('receive_message', ({ message, username, timestamp }: { message: string; username: string; timestamp: string }) => {
        setMessageList((prevList: { message: string; username: string; timestamp: string }[]) => [
            ...prevList,
            { message, username, timestamp } // Store the message object
        ]);
    });

    socket.on('user_left', handleUserLeft);
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsReconnecting(true);
      setReconnectAttempts(prev => prev + 1);
    });

    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', reason);
      setIsReconnecting(true);
      
      // If the disconnection wasn't intentional, try to reconnect
      if (reason === 'io server disconnect') {
        socket.connect();
      }
      updateSessionState(false);
    });

    socket.on('user_joined', (username: string) => {
      setMessageList(prevList => [...prevList, { message: `${username} has joined the session.`, username: "System", timestamp: new Date().toISOString() }]);
    });

    socket.on('reconnect_failed', () => {
      console.log('Reconnection failed');
      alert('Unable to reconnect to the session. Please try rejoining from the dashboard.');
      navigate('/dashboard');
    });

    socket.on('room_expired', ({ message }) => {
      alert(message);
      // Save work and redirect
      saveCodeAttempt().then(() => {
          localStorage.removeItem('activeSession');
          navigate('/dashboard');
      });
    });

    socket.on('room_joined', ({ expiryTimestamp, remainingTime, totalTime }) => {
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

    // Handle time remaining updates
    socket.on('time_remaining', ({ remainingTime, totalTime, expiryTimestamp }) => {
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
      socket.off('receive_message'); // Clean up listener
      socket.off('user_left', handleUserLeft);
      socket.off('user_joined');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('reconnect_failed');
      socket.off('room_expired');
      socket.off('room_joined');
      socket.off('time_remaining');
    };
  }
  }, []);

  // Helper function to update session state
  const updateSessionState = (isConnected: boolean, timeRemaining?: number) => {
    const existingSession = localStorage.getItem('activeSession');
    if (existingSession) {
        const session = JSON.parse(existingSession);
        const updatedSession = {
            ...session,
            isConnected,
            lastUpdated: new Date().toISOString(),
            lastCode: editor?.getValue() || doc.getText(),
            timeRemaining // Adds this field
        };
        localStorage.setItem('activeSession', JSON.stringify(updatedSession));
    }
};

  useEffect(() => {
    const socket = socketRef.current;
    if (socket){
    socket.on('connect', () => {
      socket.emit('joinRoom', roomId)
    });
  }
  });

  const handleUserLeft = (username: string) => {
    setUserLeft(true);
    setMessageList(prevList => [
      ...prevList, 
      { message: `${username} has left the session.`, username: '', timestamp: new Date().toISOString() } // Ensure the object structure is correct
  ]);
  };

  const sendMessage = () => {
    const socket = socketRef.current;
    if (socket && message.trim()) {
      const timestamp = new Date().toISOString(); // Get the current timestamp
      // const newMessage = { message, username: displayName, timestamp };
      socket.emit('send_message', { message, username: displayName, timestamp, roomId }); // Emit message with username and timestamp
      setMessageList((prevList: { message: string; username: string; timestamp: string }[]) => [
        ...prevList,
        { message, username: "Me", timestamp } // Store the message object
    ]);
      setMessage(""); // Clear the input field after sending
    }
  };

  const saveCodeAttempt = async () => {
    const codeAttempt = editor?.getValue() || doc.getText();
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

      if (response.ok) {
        console.log('Code attempt saved successfully.');
        navigate('/dashboard');
      } else {
        console.error('Failed to save code attempt.');
      }
    } catch (error) {
      console.error('Error saving code attempt:', error);
    }
  };

   // End session handler
   const endSession = async () => {
    const socket = socketRef.current;
    if (!socket) return;

    try {
      setIsIntentionalLeave(true); // Mark this as intentional leave
      // Save the code attempt first
      await saveCodeAttempt();
      
      // Notify others that you're leaving
      socket.emit('leave_session', roomId, displayName);
      
      // Disconnect and navigate away
      socket.disconnect();
      localStorage.removeItem('activeSession');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to save your code attempt. Please try again.');
      setIsIntentionalLeave(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
        if (!isIntentionalLeave) {
            updateSessionState(false);
        }
    };
  }, [isIntentionalLeave]);

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
    };
  }, [isIntentionalLeave]);

  return (
    <><UserHeader /><div className="collaboration-container">
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
            defaultValue='// Start collaborating and write your code\nconsole.log("Hello World!");'
            defaultLanguage="javascript"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              automaticLayout: true,
            }}
            onMount={editor => {
              setEditor(editor);
              setEditorContent(editor.getValue());
            } } />
          <div className="editor-actions">
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
    </div></>
  );
}

export default Collaboration_Service;
