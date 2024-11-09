import Editor from '@monaco-editor/react';
import { editor as monacoEditor} from 'monaco-editor';
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { MonacoBinding } from 'y-monaco';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
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
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<string[]>([]);
  const [editor, setEditor] = useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [language, setLanguage] = useState("javascript"); // Language to set editor
  const [languages, setLanguages] = useState<string[]>([]); // All supported languages list
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const location = useLocation();
  const { socketId, roomId, difficulty, category, question } = location.state || {};

  useEffect(() => {
    collabSocket.emit('joinRoom', roomId, (init: boolean) => {
      setFirst(init); // Server told this client to init Y.Doc
    });
    codeSocket.emit('get_available_languages', (languages: string[]) => {
      setLanguages(languages);
    });
    collabSocket.on('receive_message', (message) => {
      setMessageList((prevList: string[]) => [...prevList, message]);
    });
    codeSocket.on('code_result', (output) => {
      setOutput(output);
      setLoading(false);
    });

    return () => {
      collabSocket.off('receive_message');
      codeSocket.off('code_result');
    }
  }, []);

  useEffect(() => {
    let doc: Y.Doc;
    let provider: SocketIOProvider;
    let binding: MonacoBinding;

    if (roomId && editor) {
      doc = new Y.Doc();

      provider = new SocketIOProvider(collabURL, roomId, doc, {
        autoConnect: true,
        // resyncInterval: 5000,
        // disableBc: false
      });
      binding = new MonacoBinding(
        doc.getText('monaco'), 
        editor.getModel()!, 
        new Set([editor]), 
        provider.awareness
      );
      // console.log(isFirst.current)
      // if (isFirst.current) {
      //   doc.getText('monaco').insert(0, initialContent);
      //   const update = Y.encodeStateAsUpdate(doc);
      //   Y.applyUpdate(doc, update);
      // }
      setDoc(doc)
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
  }, [first, doc, editor])

  const sendMessage = () => {
    if (message.trim()) {
      collabSocket.emit('send_message', message, roomId);
      setMessageList((prevList: string[]) => [...prevList, message]);
      setMessage("");
    }
  };

  const runCode = () => {
    const code = editor?.getValue();
    if (code !== "") {
      codeSocket.emit('run_code', language, code);
      setOutput(`Running code in ${language}`);
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
        onChange={(e) => setLanguage(e.target.value)}
        style={{ marginBottom: '10px' }}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {getStylizedLanguageName[lang] || lang}
          </option>
        ))}
      </select>
      <Editor
        height="60vh"
        theme="vs-dark"
        language={language}
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
