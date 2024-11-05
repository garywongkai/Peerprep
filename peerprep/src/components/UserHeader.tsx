import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    ThemeProvider,
} from "@mui/material";
import Stack from "@mui/material/Stack";
import theme from "../theme/theme";

const UserHeader: React.FC = () => {
    const navigate = useNavigate();

    const [notification, setNotification] = React.useState<{
        type: string;
        message: string;
    } | null>(null);

    const handleLogout = async () => {
        try {
            const url =
                process.env.REACT_APP_ENV === "development"
                    ? "http://localhost:5001/logout"
                    : "https://user-service-327190433280.asia-southeast1.run.app/logout";
            const response = await fetch(url, {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                // Clear any localStorage, sessionStorage, etc. if you are using them to store tokens
                localStorage.removeItem("accessToken");
                localStorage.removeItem("displayName");
                localStorage.removeItem("selectedCategory");
                localStorage.removeItem("selectedDifficulty");
                localStorage.removeItem("uid");

                setNotification({
                    type: "success",
                    message: "Logging you out...",
                });
                setTimeout(() => {
                    navigate("/signin");
                }, 1000);
            } else {
                const errorData = await response.json();
                setNotification({
                    type: "error",
                    message:
                        errorData.error || "Logout failed. Please try again.",
                });
            }
        } catch (error) {
            console.error("Error logging out:", error);
            setNotification({
                type: "error",
                message: "An error occurred during logout.",
            });
        }
    };

    const handleCloseNotification = () => {
        setNotification(null); // Clear notification
    };

    return (
        <ThemeProvider theme={theme}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        <a
                            href="/dashboard"
                            style={{ textDecoration: "none", color: "white" }}
                        >
                            <img
                                src="https://i.ibb.co/DRGcDJG/logo.png"
                                alt="Peerprep"
                                width="42"
                                height="42"
                            />
                        </a>
                    </Typography>
                    <Stack spacing={2} direction="row" justifyContent="left">
                        <Button
                            component={RouterLink}
                            to="/question"
                            variant="contained"
                            color="primary"
                        >
                            Question List
                        </Button>
                    </Stack>
                    <Stack spacing={2} direction="row" justifyContent="left">
                        <Button
                            component={RouterLink}
                            to="/match"
                            variant="contained"
                            color="primary"
                        >
                            Match
                        </Button>
                    </Stack>
                    <Stack spacing={2} direction="row" justifyContent="center">
                        <Button
                            component={RouterLink}
                            to="/profile"
                            variant="contained"
                            color="primary"
                        >
                            Profile
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleLogout}
                        >
                            Sign out
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {notification && (
                <div
                    style={{
                        position: "fixed",
                        top: "3em",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor:
                            notification.type === "success"
                                ? "#74B573"
                                : "#CA5E5B",
                        color: "white",
                        padding: "15px 25px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        zIndex: 1000,
                        textAlign: "center",
                    }}
                >
                    {notification.message}
                    <button
                        onClick={handleCloseNotification}
                        style={{
                            marginLeft: "15px",
                            background: "none",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                        }}
                    >
                        ×
                    </button>
                </div>
            )}
        </ThemeProvider>
    );
};
export default UserHeader;
