import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";
import "../../styles/Match.css";
// import UserHeader from "../../components/UserHeader";
import { difficultyLevels, iconCategories } from "./constant";
import { CircularProgress, FormControl, MenuItem, Select } from "@mui/material"; // Import MUI components
import UserHeader from "../../components/UserHeader";

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

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <><UserHeader /><div className="matching-container">
            <div className="matching-card">
                <h2 className="matching-title">Find Your Coding Peer!</h2>

                <div className="matching-content">
                    <div className="selection-section">
                        <div className="selection-group">
                            <label className="selection-label">
                                Category
                            </label>
                            <FormControl variant="outlined" fullWidth>
                                <Select
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryClick(e.target.value)}
                                    disabled={isMatching}
                                    className="custom-select"
                                >
                                    {iconCategories.map((category) => (
                                        <MenuItem key={category.label} value={category.label}>
                                            <div className="category-option">
                                                {category.label}
                                            </div>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <div className="selection-group">
                            <label className="selection-label">
                                Difficulty
                            </label>
                            <FormControl variant="outlined" fullWidth>
                                <Select
                                    value={selectedDifficulty}
                                    onChange={(e) => handleDifficultyClick(e.target.value)}
                                    disabled={isMatching}
                                    className="custom-select"
                                >
                                    {difficultyLevels.map((level) => (
                                        <MenuItem key={level.label} value={level.label}>
                                            <div className={`difficulty-option ${level.label.toLowerCase()}`}>
                                                {level.label}
                                            </div>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </div>

                    <div className="action-section">
                        {isMatching ? (
                            <div className="matching-status">
                                <CircularProgress
                                    variant="determinate"
                                    value={(secondsLeft / 30) * 100}
                                    className="progress-circle" />
                                <div className="timer-display">
                                    {secondsLeft}s
                                </div>
                                <p className="status-text">Finding your perfect match...</p>
                                <button
                                    className="cancel-button"
                                    onClick={handleCancelMatch}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="button-group">
                                <button
                                    className="match-button"
                                    onClick={handleMatchClick}
                                    disabled={!selectedCategory || !selectedDifficulty}
                                >
                                    Start Matching
                                </button>
                                <button
                                    className="reset-button"
                                    onClick={handleReset}
                                >
                                    Reset
                                </button>
                            </div>
                        )}

                        {isTimedOut && (
                            <div className="timeout-message">
                                No match found. Please try again!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div></>
    );
};

export default Matchmaking;
