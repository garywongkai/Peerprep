import './Tiptap.scss';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Collaboration from '@tiptap/extension-collaboration';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Editor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import { all, createLowlight } from 'lowlight';
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { SocketIOProvider } from 'y-socket.io';
import * as Y from 'yjs';
import CodeBlockComponent from './CodeBlockComponent';
import { socket } from "./socket";

const initialText = `
<pre><code class="language-javascript">
// Start collaborating and write your code
console.log("Hello World!");
</code></pre>`;

const url =
  process.env.REACT_APP_ENV === "development"
    ? "http://localhost:5003"
    : "https://collaboration-service-327190433280.asia-southeast1.run.app";

const Collaboration_Service: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<string[]>([]);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);

  const location = useLocation();
  const { socketId, roomId, difficulty, category, question } = location.state || {};

  useEffect(() => {
    if (!doc) {
      const _doc = new Y.Doc();
      setDoc(_doc);
    }
  }, [doc]);

  useEffect(() => {
    if (doc && !editor) {// Only initialise editor once doc is defined
      const lowlight = createLowlight(all);
      const _editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          CodeBlockLowlight
            .extend({
              addNodeView() {
                return ReactNodeViewRenderer(CodeBlockComponent);
              },
            })
            .configure({ lowlight }),
          Collaboration.configure({
            document: doc
          }),
        ]
      });
      setEditor(_editor);
    }
  }, [doc, editor]);

  useEffect(() => {
    if (doc && roomId && editor && !provider) {
      const _socketIOProvider = new SocketIOProvider(url, roomId, doc, {
        autoConnect: false,
        resyncInterval: 5000,
        disableBc: false
      });
      _socketIOProvider.on('sync', (isSynced : boolean) => {
        doc.transact(() => {
          if (isSynced && editor && !doc.getMap('config').get('initialContentLoaded')) {
            doc.getMap('config').set('initialContentLoaded', true);
            editor.commands.setContent(initialText);
          }
        });
      });
      setProvider(_socketIOProvider);
      _socketIOProvider.connect();
    }
  }, [doc, roomId, editor, provider]);

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

  if (!provider) return <h1>Initializing provider...</h1>;

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
      {editor ? <EditorContent editor={editor} /> : <p>Loading editor...</p>}
    </div>
  );
}

export default Collaboration_Service;
