import React, { useState, useEffect } from "react";
import { auth } from "../firebase"; // Import your Firebase authentication setup
import { useAuthState } from "react-firebase-hooks/auth"; // Import the hook for user state
import { useNavigate } from "react-router-dom"; // Import the navigation hook
import { ThemeProvider } from "react-bootstrap";
import UserHeader from "../components/UserHeader";
import theme from "../theme/theme";
import "../styles/Profile.css";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material"; // Import Material-UI components

interface ProfileProps {
    successNotification: (message: string, type?: "success") => void;
    errorNotification: (message: string, type?: "error") => void;
}
const Profile: React.FC<ProfileProps> = ({
    successNotification,
    errorNotification,
}) => {
    const [displayName, setDisplayName] = useState(
        localStorage.getItem("displayName") || ""
    );
    const [photoURL, setPhotoURL] = useState(
        localStorage.getItem("photoURL") || ""
    );
    const email = localStorage.getItem("email") || "";
    const [loading, setLoading] = useState(false); // Not loading initially
    const [message, setMessage] = useState("");
    const [confirmText, setConfirmText] = useState(""); // For account deletion confirmation
    const [openDialog, setOpenDialog] = useState(false); // For the delete account dialog
    // const accessToken = localStorage.getItem("accessToken");   
    const [user, loadingUser] = useAuthState(auth); // Get the current user

    const navigate = useNavigate(); // For navigation
     
    const getAccessToken = () => {
        const token = localStorage.getItem("accessToken");
        return token;
    };

    // Form submission to update the profile
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        const accessToken = getAccessToken();
        try {
            const url =
                process.env.REACT_APP_ENV === "development"
                    ? "http://localhost:5001/update-profile"
                    : "https://user-service-327190433280.asia-southeast1.run.app/update-profile";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    displayName,
                    photoURL,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("displayName", displayName);
                localStorage.setItem("photoURL", photoURL);
                successNotification(data.message); // Profile updated successfully
            } else if (response.status === 401) {
                // Handle 401 error (not authenticated)
                errorNotification(
                    "User not authenticated, please sign in again."
                );
                localStorage.clear(); // Clear local storage
                navigate("/signin"); // Redirect to sign-in page
            }  else {
                console.log(response.status);
                const errorData = await response.json();
                errorNotification(
                    errorData.error || "Failed to update profile"
                );
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            errorNotification("An error occurred while updating profile");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const accessToken = getAccessToken();
        if (confirmText === "confirm" && email) {
            try {
                const url =
                    process.env.REACT_APP_ENV === "development"
                        ? "http://localhost:5001/delete-account"
                        : "https://user-service-327190433280.asia-southeast1.run.app/delete-account";
                const response = await fetch(url, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ email }), // Send the email directly
                });

                if (response.ok) {
                    localStorage.clear();
                    successNotification(
                        "Your account has been deleted successfully."
                    );
                    navigate("/signin");
                } else {
                    const errorData = await response.json();
                    errorNotification(
                        errorData.error || "Failed to delete account"
                    );
                }
            } catch (err) {
                console.error(err);
                errorNotification("An error occurred. Please try again");
            }
            setOpenDialog(false);
        } else {
            errorNotification("Error!");
        }
    };

    const handleResetPassword = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email) {
            errorNotification("User email not found!");
            return;
        }

        try {
            const url =
                process.env.REACT_APP_ENV === "development"
                    ? "http://localhost:5001/reset-password"
                    : "https://user-service-327190433280.asia-southeast1.run.app/reset-password";
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }), // Use the logged-in user's email
            });

            if (response.ok) {
                successNotification("Password reset email sent successfully!");
                navigate("/profile"); // Redirect to the sign-in page after sending the email
            } else {
                const errorData = await response.json();
                errorNotification(
                    errorData.error || "Failed to send reset email"
                );
            }
        } catch (error) {
            console.error("Error during password reset:", error);
            errorNotification(
                "An error occurred while sending the password reset email"
            );
        }
    };

    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setConfirmText(""); // Reset the confirm text on close
    };

    useEffect(() => {
        // Check for accessToken in localStorage
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/signin");
        }
    }, [navigate]);

    return (
        <ThemeProvider theme={theme}>
            <UserHeader />
            <div className="profile">
                <h1>Profile</h1>
                <div className="profile__container">
                    <div className="profile__avatar">
                        {photoURL ? (
                            <img
                                src={photoURL}
                                alt="Avatar"
                                className="avatar"
                            />
                        ) : (
                            <div className="avatar-placeholder">No Avatar</div>
                        )}
                    </div>
                    <div className="profile__info">
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Display Name"
                                required
                            />
                            <input
                                type="email"
                                value={email}
                                placeholder="Email"
                                disabled
                            />
                            <input
                                type="text"
                                value={photoURL}
                                onChange={(e) => setPhotoURL(e.target.value)}
                                placeholder="Photo URL"
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? "Updating..." : "Update Profile"}
                            </button>
                        </form>
                        <button onClick={handleResetPassword}>
                            Reset Password
                        </button>
                        {message && <p>{message}</p>}
                        <button className="delete" onClick={handleClickOpen}>
                            Delete Account
                        </button>
                        <Dialog open={openDialog} onClose={handleClose}>
                            <DialogTitle>Confirm Account Deletion</DialogTitle>
                            <DialogContent>
                                <p>
                                    To delete your account, please type{" "}
                                    <strong>confirm</strong> below:
                                </p>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Type confirm"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={confirmText}
                                    onChange={(e) =>
                                        setConfirmText(e.target.value)
                                    }
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="primary">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteAccount}
                                    color="error"
                                    disabled={confirmText !== "confirm"}
                                >
                                    Delete Account
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default Profile;
