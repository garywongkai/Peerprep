import React, { useState, useEffect, useRef } from "react";
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import MonacoEditor from "react-monaco-editor";
import * as monaco from 'monaco-editor'


const Collaboration_Service: React.FC = () => {
    const socket = io("http://localhost:5003");
    const [message, setMessage] = useState("");
    const [messageList, setMessageList] = useState<string[]>([]);
    
    const [code, setCode] = useState("// Start coding together!");
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const location = useLocation();
    const { socketId, roomId, difficulty, category, question } = location.state || {};

    useEffect(() => {
        socket.on('receive_message', (message) => {
            setMessageList((prevList:string[]) => [...prevList, message]);
        });

        return () => {
            socket.off('receive_message');
        };
    });

    useEffect(() => {
        socket.on('connect', () => {
            socket.emit('joinRoom', roomId)
        });
    });

    const onChange = (newCode: string) => {
        setCode(newCode);
        socket.emit("code-update", newCode, roomId); // Emit updated code to the server
    };

    useEffect(() => {
        // Listen for incoming changes from other users
        socket.on("code-update", (newCode: string, roomId: string) => {
          if (newCode !== code) {
            setCode(newCode);
          }
        });
    
        // Clean up on component unmount
        return () => {
          socket.off("code-update");
        };
    }, [code]);
    

    const sendMessage = () => {
        if (message !== "") { // server socket
            socket.emit("send_message", message, roomId);
            console.log(`Message send to room : ${message}`);
            setMessageList((prevList:string[]) => [...prevList, message]); // Update your own message list
            setMessage(""); // Clear the input after sending
        }
    };

    const options = {
        selectOnLineNumbers: true,
        automaticLayout: true,
      };

    return (
        <div>
            <h2>{question.questionId}.{question.questionTitle}</h2>
            <h3>Category: {question.questionCategory}</h3>
            <h3>Difficulty: {difficulty}</h3>
            <p>{question.questionDescription}</p>

                <div>
                    <h2>Collaborative Code Editor</h2>
                    <MonacoEditor
                    width="800"
                    height="600"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    options={options}
                    onChange={onChange}
                    editorDidMount={(editor: monaco.editor.IStandaloneCodeEditor) => {
                    editorRef.current = editor;
                    }}
                />
                </div>


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
        </div>
    );
}

export default Collaboration_Service;

