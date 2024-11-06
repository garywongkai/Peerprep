import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from 'react-router-dom';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
import { socket } from "./socket";
import { MonacoBinding } from 'y-monaco';
import Editor, { MonacoDiffEditor } from '@monaco-editor/react';

const Collaboration_Service: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<string[]>([]);
  const doc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [editor, setEditor] = useState<MonacoDiffEditor | null>(null);
  const [binding, setBinding] = useState<MonacoBinding|null>(null);

  const location = useLocation();
  const { socketId, roomId, difficulty, category, question } = location.state || {};

  useEffect(() => {
    const _socketIOProvider = new SocketIOProvider("http://localhost:5003", roomId, doc, {
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
  }, [doc]);

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
    socket.on('connect', () => {
      socket.emit('joinRoom', roomId)
    });
  });

  useEffect(() => {
    socket.on('receive_message', (message) => {
      setMessageList((prevList: string[]) => [...prevList, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  });

  const sendMessage = () => {
    if (message !== "") { // server socket
      socket.emit("send_message", message, roomId);
      console.log(`Message send to room : ${message}`);
      setMessageList((prevList: string[]) => [...prevList, message]); // Update your own message list
      setMessage(""); // Clear the input after sending
    }
  };

  return (
    <div>
      <h2>{question.questionId}.{question.questionTitle}</h2>
      <h3>Category: {question.questionCategory}</h3>
      <h3>Difficulty: {difficulty}</h3>
      <p>{question.questionDescription}</p>
      <div>
        {messageList.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
      <Editor
        height="90vh"
        defaultValue='// Start collaborating and write your code\nconsole.log("Hello World!");'
        defaultLanguage="javascript"
        onMount={editor => { setEditor(editor) }}
      />
    </div>
  );
}

export default Collaboration_Service;
