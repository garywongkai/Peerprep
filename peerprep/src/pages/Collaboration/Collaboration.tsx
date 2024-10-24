import React, { useState, useEffect } from "react";
import io from 'socket.io-client';
//import { useLocation } from 'react-router-dom';
//import * as Y from 'yjs';
//import { HocuspocusProvider } from '@hocuspocus/provider';
import { FormControl, MenuItem, Select } from "@mui/material";


const Collaboration: React.FC = () => {
    const [message, setMessage] = useState("");
    const [messageList, setMessageList] = useState<string[]>([]);
    const [editorContent, setEditorContent] = useState('');

    const location = useLocation();
    const { socketId, roomId, difficulty, category, question } = location.state || {};

    //const ydoc = new Y.Doc();

    const socket = io("http://localhost:5003");

    useEffect(() => {
        socket.on('connect', () => {
            socket.emit('joinRoom', roomId);
        });
    });


    useEffect(() => {
        socket.on('receive_message', (message) => {
            setMessageList((prevList:string[]) => [...prevList, message]);
        });

        return () => {
            socket.off('receive_message');
        };
    });


    const sendMessage = () => {
        if (message !== "") { // server socket
            socket.emit("send_message", message, roomId);
            console.log(`Message send to room : ${message}`);
            setMessageList((prevList:string[]) => [...prevList, message]); // Update your own message list
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
        </div>
    );
}

export default Collaboration;

