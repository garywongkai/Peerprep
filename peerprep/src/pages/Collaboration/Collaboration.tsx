import Editor from '@monaco-editor/react';
import { editor as monacoEditor } from 'monaco-editor';
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from 'react-router-dom';
import { MonacoBinding } from 'y-monaco';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
import { socket, URL } from "./socket";

const languages = [
  "javascript", "typescript", "python", "html", "css", "json", "markdown",
  "cpp", "java", "csharp", "php", "ruby", "swift", "go", "kotlin", "r",
  "yaml", "sql", "dockerfile", "shell", "rust"
  // Add other languages as needed
];

const Collaboration_Service: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<string[]>([]);
  const doc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [editor, setEditor] = useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const [language, setLanguage] = useState("javascript");

  const location = useLocation();
  const { socketId, roomId, difficulty, category, question } = location.state || {};

  useEffect(() => {
    if (doc && roomId && !provider) {
      const _socketIOProvider = new SocketIOProvider(URL, roomId, doc, {
        autoConnect: false,
        resyncInterval: 5000,
        disableBc: false
      });
      setProvider(_socketIOProvider);

      _socketIOProvider.awareness.on('change', () => {
        doc.transact(() => {
          const yMap = doc.getMap('editorMeta');
          if (yMap.get('initialized')) {
            return;
          }
          const clientStates = _socketIOProvider.awareness.getStates();
          const clientIDs = Array.from(clientStates.keys()) as number[];
          const smallestClientID = Math.min(...clientIDs);
          // Let client with smallest clientID initialise Text, only when both clients are loaded
          if (clientIDs.length === 2 && doc.clientID === smallestClientID) {
            doc.getText('monaco').insert(0, '// Start collaborating and write your code\nconsole.log("Hello World!");');
            yMap.set('initialized', true);
          }
        });
      });
      _socketIOProvider.connect();
      _socketIOProvider.awareness.setLocalStateField("lastUpdated", Date.now()); // Trigger awareness update
    }

    return () => {
      provider?.destroy();
      doc.destroy();
    }
  }, [doc, roomId]);

  useEffect(() => {
    if (provider && editor) {
      const _binding = new MonacoBinding(doc.getText('monaco'), editor.getModel()!, new Set([editor]), provider.awareness);
      setBinding(_binding);
    }
    return () => {
      binding?.destroy();
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

  const handleLanguageChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setLanguage(event.target.value);
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
      <label htmlFor="language-select">Select Language: </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        style={{ marginBottom: '10px' }}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()}
          </option>
        ))}
      </select>
      <Editor
        height="60vh"
        theme="vs-dark"
        language={language}
        onMount={editor => { setEditor(editor) }}
      />
    </div>
  );
}

export default Collaboration_Service;
