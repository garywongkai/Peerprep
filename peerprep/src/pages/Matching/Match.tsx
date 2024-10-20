import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";
import "../../styles/Match.css";
// import UserHeader from "../../components/UserHeader";
import { difficultyLevels, iconCategories } from "./constant";
import { FormControl, MenuItem, Select } from "@mui/material"; // 导入 MUI 组件

const Matchmaking: React.FC = () => {
    const [seconds, setSeconds] = useState(0); // 用于存储计时器的秒数
    const [matchStatus, setMatchStatus] = useState<string>(""); // 匹配的状态信息
    const [isMatching, setIsMatching] = useState<boolean>(false); // 表示用户是否正在匹配过程中
    const [selectedDifficulty, setSelectedDifficulty] =
        useState<string>("Easy"); // 用户选择的难度
    const [selectedCategory, setSelectedCategory] = useState<string>("Array"); // 主题
    const [isMatchFound, setMatchFound] = useState<boolean>(false); // 表示是否已经找到匹配的对手
    const navigate = useNavigate(); // React Router 提供的函数，用于在找到匹配时导航到新的页面。
    const timerId = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        function matchFound(roomId: string, msg: string) {
            setMatchFound(true); // Set match found to true
            setMatchStatus(msg);

            setTimeout(() => {
                setIsMatching(false);
                navigate(`/match/${roomId}`, {
                    state: {
                        socketId: socket.id,
                        difficulty: selectedDifficulty,
                        category: selectedCategory,
                    },
                });
            }, 2000); // 2 seconds delay
        }

        socket.on("match found", matchFound); // 当 WebSocket 服务器发送 "match found" 事件时，调用 matchFound 函数处理匹配成功逻辑。
        return () => {
            socket.off("match found", matchFound);
        };
    }, [selectedDifficulty, selectedCategory]); // 在依赖项（[selectedDifficulty, selectedCategory]）改变时重新运行

    useEffect(() => {
        function onConnect() {
            // 当 WebSocket 连接成功时（即收到 "connect" 事件），这个函数被调用。如果当前正在匹配（isMatching 为 true），则调用 setIsMatching(false) 取消匹配状态。这是为了防止在连接重新建立时仍然保留无效的匹配状态。
            if (isMatching) {
                setIsMatching(false);
            }
        }

        function onDisconnect() {
            // 当 WebSocket 断开连接时（即收到 "disconnect" 事件），这个函数被调用。逻辑: 同样，如果当前正在匹配，调用 setIsMatching(false)，取消匹配状态。这个逻辑防止在连接断开后继续保持匹配状态。
            if (isMatching) {
                setIsMatching(false);
            }
        }

        socket.on("connect", onConnect); // Listen for the 'connect' event to check the connection status
        socket.on("disconnect", onDisconnect); // Listen for the 'disconnect' event to detect disconnection

        // Unsubscribe from the events when the component unmounts
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [isMatching]); // 当isMatching状态变化时重新运行

    const startTimer = () => {
        if (timerId.current !== null) return;
        timerId.current = setInterval(() => {
            setSeconds((prevSeconds) => prevSeconds + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerId.current !== null) {
            clearInterval(timerId.current); // 停止计时器
            timerId.current = null; // 清除计时器 ID
        }
        setSeconds(0); // 重置秒数
    };

    useEffect(() => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;

        setMatchStatus(`Matching... (${formattedTime})`);
    }, [seconds]); // 每当秒数变化时，更新显示的匹配时间

    const handleMatchClick = () => {
        // start match or cancel match
        if (isMatching) {
            stopTimer();
            setMatchStatus("Matching canceled.");
            socket.emit("cancel match"); // Emit a cancel signal to the server
        } else {
            startTimer();
            setMatchStatus("Matching...");
            socket.emit("start match", selectedDifficulty, selectedCategory);
            setTimeout(() => { // Automatically cancel the match after 30 seconds
                stopTimer();
                setMatchStatus("No matches available. Try again later.");
                socket.emit("cancel match"); // Emit a cancel signal to the server
                setIsMatching(false);
            }, 30000); // 30 seconds
        }
        setIsMatching(!isMatching); // reverse setIsMatching status
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
                {/* Left section */}
                <div className="col-xl-8 col-lg-6 col-md-6">
                    {/* Topic dropdown */}
                    <div className="form-group">
                        <label htmlFor="topics" className="category-header">
                            Select Preferred Category:
                        </label>

                        <div className="col-md-12">
                            {/* Replace buttons with dropdown */}
                            <FormControl
                                variant="outlined"
                                style={{ width: "100%" }}
                            >
                                <Select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        handleCategoryClick(e.target.value)
                                    }
                                    disabled={isMatching}
                                >
                                    {iconCategories.map((category) => (
                                        <MenuItem
                                            key={category.label}
                                            value={category.label}
                                        >
                                            {category.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                </div>
                {/* End of left section */}

                {/* Right section */}
                <div className="col-xl-4 col-lg-6 col-md-6">
                    {/* Difficulty dropdown */}
                    <div className="row-md-12">
                        <div className="form-group d-flex flex-column">
                            <label className="difficulty-header">
                                Select Preferred Difficulty:
                            </label>
                            <div className="col-md-12 d-flex flex-column justify-content-center">
                                <FormControl
                                    variant="outlined"
                                    style={{ width: "100%" }}
                                >
                                    <Select
                                        value={selectedDifficulty}
                                        onChange={(e) =>
                                            handleDifficultyClick(
                                                e.target.value
                                            )
                                        }
                                        disabled={isMatching}
                                    >
                                        {difficultyLevels.map((level) => (
                                            <MenuItem
                                                key={level.label}
                                                value={level.label}
                                            >
                                                {level.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-12 text-right mt-5">
                        <div className="button-container">
                            <button
                                id="matchButton"
                                className="btn custom-match-button mt-3"
                                onClick={handleMatchClick}
                                disabled={isMatchFound}
                            >
                                {isMatching ? "Cancel Match" : "Match"}
                            </button>
                        </div>

                        <div className="d-flex align-items-center justify-content-end">
                            {/* 间距 */}
                            &nbsp;
                            {/* Match Status (Static Text) */}
                            {/* <div id="matchStatus" className="text-right">
                                {matchStatus}
                            </div> */}
                            <div className="timer-container">
                                <div id="matchStatus" className="timer-large">
                                    {matchStatus}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End of right section */}
        </div>
    );
};

export default Matchmaking;
