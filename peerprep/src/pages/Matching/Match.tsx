import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";
import "../../styles/Match.css";
// import UserHeader from "../../components/UserHeader";
import { difficultyLevels, iconCategories } from "./constant";
import { FormControl, MenuItem, Select } from "@mui/material"; // Import MUI components

const Matchmaking: React.FC = () => {
    const [secondsLeft, setSecondsLeft] = useState(30);
    const [isMatching, setIsMatching] = useState<boolean>(false); // Indicates whether the user is in the process of matching
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>(""); // User-selected difficulty level
    const [selectedCategory, setSelectedCategory] = useState<string>(""); // User-selected category
    const navigate = useNavigate(); // Function provided by React Router, used to navigate to a new page when a match is found
    const timerRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);
    const [isTimedOut, setIsTimedOut] = useState(false);

    useEffect(() => {

        function matchFound(roomId: string, msg: string, question: any) {
            setTimeout(() => {
                setIsMatching(false);
                // redirect to collaboration room
                navigate(`/collaboration/${roomId}`, {
                    state: {
                        socketId: socket.id,
                        roomId: roomId,
                        difficulty: selectedDifficulty,
                        category: selectedCategory,
                        question: question
                    },
                });
            }, 2000); // 2 seconds delay
        }


        // When the WebSocket server sends a "match found" event, the matchFound function is called to handle the match success logic
        socket.on("match found", matchFound); 
        return () => {
            socket.off("match found", matchFound);
        };
    }, [selectedDifficulty, selectedCategory]); // Rerun the effect when dependencies ([selectedDifficulty, selectedCategory]) change

    const clearTimers = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsMatching(false);
        setIsTimedOut(false);
        setSecondsLeft(30); // Reset seconds
    };

    const handleMatchClick = () => {
        clearTimers();
        setIsMatching(true);

        socket.emit("start match", selectedDifficulty, selectedCategory);
        timerRef.current = window.setTimeout(() => {
            socket.emit("cancel match by timeout"); // Emit a cancel signal to the server
            setIsTimedOut(true);
            setIsMatching(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current); // Clear interval update after timeout
            }
        }, 30000);

        intervalRef.current = window.setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);
    };

    const handleCancelMatch = () => {
        socket.emit("cancel match by button");
        clearTimers();
    };

    const handleReset = () => {
        setSelectedCategory("");
        setSelectedDifficulty("");
        socket.emit("cancel match by button");
        clearTimers();
    };

    const handleDifficultyClick = (difficulty: string) => {
        setSelectedDifficulty(difficulty);
    };

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
    };

    return (
        <div className="container my-4">
            <div className="row">
                <div className="col-xl-8 col-lg-6 col-md-6">
                    <div className="form-group">
                        <label htmlFor="topics" className="category-header">
                            Select Preferred Category:
                        </label>
                        <FormControl variant="outlined" fullWidth>
                            <Select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryClick(e.target.value)}
                                disabled={isMatching}
                            >
                                {iconCategories.map((category) => (
                                    <MenuItem key={category.label} value={category.label}>
                                        {category.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </div>
    
                <div className="col-xl-4 col-lg-6 col-md-6">
                    <div className="form-group">
                        <label className="difficulty-header">
                            Select Preferred Difficulty:
                        </label>
                        <FormControl variant="outlined" fullWidth>
                            <Select
                                value={selectedDifficulty}
                                onChange={(e) => handleDifficultyClick(e.target.value)}
                                disabled={isMatching}
                            >
                                {difficultyLevels.map((level) => (
                                    <MenuItem key={level.label} value={level.label}>
                                        {level.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
    
                    <div className="button-container mt-3">
                        <button className="custom-match-button" onClick={handleMatchClick} disabled={isMatching}>
                            {isMatching ? `Waiting... (${secondsLeft}s)` : "Match"}
                        </button>
                        {isMatching && (
                            <button className="custom-match-button" onClick={handleCancelMatch}>Cancel Match</button>
                        )}
                        {isTimedOut && <p>Match timeout, please try again!</p>}
                        <button className="custom-match-button" onClick={handleReset}>Reset</button>
                    </div>
                </div>
            </div>
        </div>
    );
    
};

export default Matchmaking;
