import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import theme from "../theme/theme";
import { getCookie, setCookie } from "../utils/cookieUtils"; // Assume you have a utility to get cookies
// import "../styles/Match.css";
import UserHeader from "../components/UserHeader";
import Header from "../components/Header";
import { auth } from "../firebase";
import {
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    ThemeProvider,
} from "@mui/material";
import {
    MatchmakingService,
    MatchData,
    QuestionHistoryItem,
    createMatchmakingService,
} from "../service/MatchmakingService"; // ???

const Match = () => {
    const [user, loadingUser] = useAuthState(auth); // Get the current user
    const navigate = useNavigate(); // For navigation
    const [displayName, setDisplayName] = useState(
        getCookie("displayName") || ""
    );
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [isMatched, setIsMatched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [difficulty, setDifficulty] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");
    const baseurl =
        process.env.REACT_APP_ENV === "development"
            ? "http://localhost:5002/match"
            : "https://service-327190433280.asia-southeast1.run.app/match";
    // const matchmakingService = new MatchmakingService(user);

    // Function to start matchmaking
    const handleInitiateMatch = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            let url = `${baseurl}/initiate`;

            // Start matchmaking process (assume matchmaking logic is defined in MatchmakingService)
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // credentials: "include", // Ensure cookies are sent for authentication
                body: JSON.stringify({
                    difficulty,
                    displayName,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                setError(errorData.error || "Failed to initiate match");
            } else {
                const data = await response.json();
                console.log("Success response:", data);
                setSuccessMessage(data.message || "Match initiated successfully!");
            }

            // const match = await matchmakingService.findMatch("Easy");
            // if (match) {
            //     setMatchData(match);
            //     setIsMatched(true);
            // } else {
            //     setError("No match found. Try again later.");
            // }
        } catch (err) {
            setError("An error occurred during matchmaking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check for access_token in cookies
        const token = getCookie("access_token");
        console.log(token);
        if (!token) {
            navigate("/signin");
        }
    }, [navigate]);

    // Function to cancel matchmaking
    // const handleCancelMatch = async () => {
    //     try {
    //         if (matchmakingService) {
    //             await matchmakingService.cancelMatch();
    //             setIsMatched(false);
    //             setMatchData(null);
    //         }
    //     } catch (err) {
    //         console.error("Error during match cancellation: ", err);
    //         setError("Failed to cancel matchmaking. Please try again.");
    //     }
    // };

    // // Redirect if user is not authenticated
    // useEffect(() => {
    //     if (loading) return; // Wait for loading
    //     if (!user) return navigate("/signin");
    // }, [user, loading, navigate]);

    return (
        <div style={{ padding: "20px" }}>
            <h1>Test Match Page</h1>

            <div style={{ marginBottom: "10px" }}>
                <label>
                    Difficulty:
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        disabled={loading}
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </label>
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>
                    Display Name:
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={loading}
                    />
                </label>
            </div>

            <button onClick={handleInitiateMatch} disabled={loading}>
                {loading ? "Matching..." : "Initiate Match"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
            )}
        </div>
    );
};

export default Match;
