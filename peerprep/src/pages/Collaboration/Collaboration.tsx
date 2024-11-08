import Editor from '@monaco-editor/react';
import { editor as monacoEditor } from 'monaco-editor';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MonacoBinding } from 'y-monaco';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
import '../../styles/Collaboration.css';

const Collaboration_Service: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<string[]>([]);
  const [handshakeConfirmed, setHandshakeConfirmed] = useState(false);
  const [editorContent, setEditorContent] = useState("Your code here...");
  const doc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [editor, setEditor] = useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const [userLeft, setUserLeft] = useState(false);
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

    useEffect(() => {
      socketRef.current = io(URL, {
          query: {
              token: accessToken,
              displayName: displayName,
              uid: uid,
          },
      });
      const socket = socketRef.current;
      socket.on('connect', () => {
          socket.emit('joinRoom', roomId); // Emit joinRoom only once on connect
      });
  
      return () => {
          socket.disconnect(); // Clean up the socket connection on unmount
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

  useEffect(() => {
    const socket = socketRef?.current;
    if (socket) {
    socket.on('receive_message', (message: string) => {
      setMessageList((prevList: string[]) => [...prevList, message]);
    });
    socket.on('handshake_request', () => {
      // Notify the user about the handshake request
      const userResponse = window.confirm("Another user has requested to end the session. Do you agree?");
      if (userResponse) {
        confirmHandshake(); // Automatically confirm if the user agrees
      }
    });

    socket.on('user_left', handleUserLeft);
    socket.on('handshake_response', (confirmed: boolean) => {
      if (confirmed) {
        setHandshakeConfirmed(true);
        saveCodeAttempt();
      }
    }
    );
    
    return () => {
      socket.off('receive_message'); // Clean up listener
      socket.off('handshake_request');
      socket.off('handshake_response');
      socket.off('user_left', handleUserLeft);
    };
  }
  }, []);

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
    setMessageList(prevList => [...prevList, `${username} has left the session.`]);
  };

  const sendMessage = () => {
    const socket = socketRef.current;
    if (message !== "" && socket) { // server socket
      socket.emit("send_message", message, roomId);
      console.log(`Message send to room : ${message}`);
      setMessageList((prevList: string[]) => [...prevList, message]); // Update your own message list
      setMessage(""); // Clear the input after sending
    }
  };

  const initiateHandshake = () => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit("handshake_request", roomId);
      console.log(`Session end requested for ${roomId}`);
    }
  };

  const confirmHandshake = () => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit("handshake_response", true, roomId);
      setHandshakeConfirmed(true);
      console.log(`Session ended for ${roomId}`);
      saveCodeAttempt();
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
      // Save the code attempt first
      await saveCodeAttempt();
      
      // Notify others that you're leaving
      socket.emit('leave_session', roomId, displayName);
      
      // Disconnect and navigate away
      socket.disconnect();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to save your code attempt. Please try again.');
    }
  };

  return (
    <div className="collaboration-container">
      <div className="question-section">
        <h2 className="question-title">
          {question.questionId}. {question.questionTitle}
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
            }}
          />
          <div className="editor-actions">
            <button 
              className="btn-save" 
              onClick={endSession}
              disabled={handshakeConfirmed}
            >
              End Session
            </button>
          </div>
        </div>

        <div className="chat-section">
          <div className="chat-messages" id="chat-messages">
            {userLeft && (
              <div className="system-message">
                Another user has left the session. You can continue coding or end your session.
              </div>
            )}
            {messageList.map((msg, index) => (
              <div key={index} className="message">
                {msg}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>

      {handshakeConfirmed && (
        <div className="confirmation-message">
          Session ended and code attempt saved.
        </div>
      )}
    </div>
  );
}

export default Collaboration_Service;
