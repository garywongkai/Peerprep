import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "react-bootstrap";
import theme from "../theme/theme";
import UserHeader from "../components/UserHeader";
import { CircularProgress } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SignalWifiStatusbar4BarIcon from '@mui/icons-material/SignalWifiStatusbar4Bar';
import SignalWifiConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiConnectedNoInternet4';

interface ActiveSession {
    roomId: string;
    questionTitle: string;
    questionDescription: string;
    category: string;
    difficulty: string;
    timestamp: string;
    lastUpdated?: string;
    isConnected?: boolean;
    lastCode?: string;
    expiryTimestamp: number;
    remainingTime: number;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [displayName, setDisplayName] = useState(
        localStorage.getItem("displayName") || ""
    );

    const getActiveSession = () => {
        const savedSession = localStorage.getItem('activeSession');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                const now = Date.now();
                
                // Check if session has expired
                if (session.expiryTimestamp && now > session.expiryTimestamp) {
                    localStorage.removeItem('activeSession');
                    return null;
                }
                
                // Calculate remaining time
                const remainingTime = session.expiryTimestamp - now;
                return {
                    ...session,
                    remainingTime
                };
            } catch (error) {
                console.error('Error parsing active session:', error);
                localStorage.removeItem('activeSession');
                return null;
            }
        }
        return null;
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        // Check for active session
        const session = getActiveSession();
        setActiveSession(session);

        // Set up periodic check for expiry
        const checkInterval = setInterval(() => {
            const updatedSession = getActiveSession();
            setActiveSession(updatedSession);
        }, 60000); // Check every minute

        return () => clearInterval(checkInterval);
    }, []);

    const formatTimeRemaining = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        if (minutes < 1) return 'Less than a minute';
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    const handleRejoinSession = async () => {
        if (!activeSession) return;
        
        setIsLoading(true);
        try {
            navigate(`/collaboration/${activeSession.roomId}`, {
                state: {
                    roomId: activeSession.roomId,
                    difficulty: activeSession.difficulty,
                    category: activeSession.category,
                    question: {
                        questionTitle: activeSession.questionTitle,
                        questionDescription: activeSession.questionDescription,
                        questionCategory: activeSession.category
                    }
                }
            });
        } catch (error) {
            console.error('Error rejoining session:', error);
            alert('Failed to rejoin session. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <UserHeader />
            <div className="dashboard">
            <div className="welcome-section">
                    <h1>Welcome to Peerprep, {displayName}!</h1>
            </div>
            {activeSession && (
                <div className="active-session-card">
                    <div className="card-header">
                        <div className="header-content">
                            <h3>Resume Active Session</h3>
                            <div className={`session-time-remaining ${activeSession.remainingTime < 300000 ? 'warning' : ''}`}>
                                <AccessTimeIcon />
                                <span>{formatTimeRemaining(activeSession.remainingTime)}</span>
                            </div>
                        </div>
                        <div className="connection-status">
                            {activeSession.isConnected ? (
                                <>
                                    <SignalWifiStatusbar4BarIcon className="status-icon connected" />
                                    <span>Connected</span>
                                </>
                            ) : (
                                <>
                                    <SignalWifiConnectedNoInternet4Icon className="status-icon disconnected" />
                                    <span>Disconnected</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="question-info">
                            <h4>"Question: "{activeSession.questionTitle}</h4>
                            <div className="tags">
                                <span className="badge category">{activeSession.category}</span>
                                <p></p>
                                <span className={`badge difficulty ${activeSession.difficulty.toLowerCase()}`}>
                                    {activeSession.difficulty}
                                </span>
                            </div>
                        </div>

                        <div className="session-meta">
                            <div className="timestamp">
                                <span className="label">Started: </span>
                                <span>{new Date(activeSession.timestamp).toLocaleString()}</span>
                            </div>
                            {activeSession.lastUpdated && (
                                <div className="timestamp">
                                    <span className="label">Last active: </span>
                                    <span>{new Date(activeSession.lastUpdated).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        <span/>
                        <button 
                            className="rejoin-button"
                            onClick={handleRejoinSession}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <CircularProgress size={20} color="inherit" />
                                    <span>Rejoining Session...</span>
                                </>
                            ) : (
                                'Resume Coding'
                            )}
                        </button>
                    </div>
                </div>
            )}
            </div>

        </ThemeProvider>
    );
};

export default Dashboard;
