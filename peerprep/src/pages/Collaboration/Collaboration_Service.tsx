import React, { useState, useEffect } from "react";
//import { EditorContent, useEditor } from '@tiptap/react';
//import StarterKit from '@tiptap/starter-kit';
//import Collaboration from '@tiptap/extension-collaboration';
//import { HocuspocusProvider } from '@hocuspocus/provider';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';
//import * as Y from 'yjs';
//import { FormControl, MenuItem, Select } from "@mui/material";


//const ydoc = new Y.Doc();
//const provider = new HocuspocusProvider({
//    url: 'ws://localhost:5004', // Hocuspocus server URL
//    name: 'my-shared-document', // Unique identifier for the document
//    document: ydoc,
//  });

const Collaboration_Service: React.FC = () => {
    const socket = io("http://localhost:5003");
    const [message, setMessage] = useState("");
    const [messageList, setMessageList] = useState<string[]>([]);

    const location = useLocation();
    const { socketId, roomId, difficulty, category, question } = location.state || {};

    //const editor = useEditor({
    //    extensions: [
    //        StarterKit, // Basic editor setup with formatting options
    //        Collaboration.configure({
    //            document: ydoc, // Use Y.js document to sync Tiptap editor content
    //        }),
    //    ],
    //});

    /*
    useEffect(() => {

        socket.on('document-update', (update: Uint8Array) => {
            Y.applyUpdate(ydoc, new Uint8Array(update));
        });

        provider.on('update', ({ roomId, update }: { roomId: string; update: Uint8Array }) => {
            socket.emit('client-update', { roomId, update: Array.from(update) });
        });
    }, [editor]);
    */
    useEffect(() => {
        socket.on('connect', () => {
            socket.emit('joinRoom', roomId)
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

export default Collaboration_Service;

