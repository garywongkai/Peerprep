import Editor, { loader } from '@monaco-editor/react';
import { editor as monacoEditor, languages} from 'monaco-editor';
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { MonacoBinding } from 'y-monaco';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
import { socket as collabSocket, URL as collabURL } from "./collabSocket";
import { socket as codeSocket } from "./codeExecuteSocket";

const initialText = `// Start collaborating and write your code
console.log("Hello World!");`

const Collaboration_Service: React.FC = () => {
  const initialized = useRef<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<string[]>([]);
  const doc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [editor, setEditor] = useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const [language, setLanguage] = useState("javascript"); // Language to set editor
  const [languages, setLanguages] = useState<languages.ILanguageExtensionPoint[]>([]); // All supported languages list
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const location = useLocation();
  const { socketId, roomId, difficulty, category, question } = location.state || {};

  useEffect(() => {
    if (!initialized.current) {
      // Fetch the list of languages dynamically from monaco.languages
      loader.init().then(monacoInstance => {
        setLanguages(monacoInstance.languages.getLanguages());
      });

      collabSocket.emit('joinRoom', roomId);
      collabSocket.on('receive_message', (message) => {
        setMessageList((prevList: string[]) => [...prevList, message]);
      });
      codeSocket.on('code_result', (output) => {
        setOutput(output);
        setLoading(false);
      });

      initialized.current = true;
    }
    return () => {
      collabSocket.off('receive_message');
      codeSocket.off('code_result');
    }
  }, []);

  useEffect(() => {
    if (doc && roomId && !provider) {
      const _socketIOProvider = new SocketIOProvider(collabURL, roomId, doc, {
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
            doc.getText('monaco').insert(0, initialText);
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

  const sendMessage = () => {
    if (message !== "") { // server socket
      collabSocket.emit('send_message', message, roomId);
      // console.log(`Message send to room : ${message}`);
      setMessageList((prevList: string[]) => [...prevList, message]); // Update your own message list
      setMessage(""); // Clear the input after sending
    }
  };

  const handleLanguageChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setLanguage(event.target.value);
  };

  const runCode = () => {
    const code = editor?.getValue();
    if (code !== "") {
      codeSocket.emit('run_code', codeSocket.id, 'javascript', code);
      setOutput("running...");
      setLoading(true);
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
      <label htmlFor="language-select">Select Language: </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        style={{ marginBottom: '10px' }}
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.aliases ? lang.aliases[0] : lang.id}
          </option>
        ))}
      </select>
      <Editor
        height="60vh"
        theme="vs-dark"
        language={language}
        defaultValue={initialText}
        onMount={editor => { setEditor(editor) }}
      />
      <div>
        <button onClick={runCode} disabled={loading}>
          {loading ? 'Running...' : 'Run Code'}
        </button>
      </div>
      <div>
        <h2>Output:</h2>
        <pre id="output-window" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {output}
        </pre>
      </div>
    </div>
  );
}

export default Collaboration_Service;
