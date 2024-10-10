import React, { useState, useEffect } from "react";
import { getCookie, setCookie } from "../utils/cookieUtils"; // Assume you have a utility to get cookies
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

const Profile = () => {
  const [displayName, setDisplayName] = useState(
    getCookie("displayName") || ""
  );
  const [photoURL, setPhotoURL] = useState(getCookie("photoURL") || "");
  const [loading, setLoading] = useState(false); // Not loading initially
  const [message, setMessage] = useState("");
  const [confirmText, setConfirmText] = useState(""); // For account deletion confirmation
  const [openDialog, setOpenDialog] = useState(false); // For the delete account dialog
  const email = getCookie("email");

  const [user, loadingUser] = useAuthState(auth); // Get the current user
  const navigate = useNavigate(); // For navigation

  // Form submission to update the profile
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = process.env.REACT_APP_ENV === "development"
      ? "http://localhost:5001/update-profile"
      : "https://user-service-327190433280.asia-southeast1.run.app/update-profile";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent for authentication
        body: JSON.stringify({
          displayName,
          photoURL,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCookie("displayName", displayName);
        setCookie("photoURL", photoURL);
        setMessage(data.message); // Profile updated successfully
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText === "confirm" && user) {
      try {
        const response = await fetch("http://localhost:5001/delete-account", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user.getIdToken()}`, // Send the user's ID token for authentication
          },
          credentials: "include",
          body: JSON.stringify({ uid: user.uid }), // Optionally send the user's UID if your backend needs it
        });

        if (response.ok) {
          alert("User deleted successfully");
          navigate("/signin");
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete account");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred. Please try again");
      }
      setOpenDialog(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      alert("User email not found!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Use the logged-in user's email
      });

      if (response.ok) {
        alert("Password reset email sent successfully!");
        navigate("/profile"); // Redirect to the sign-in page after sending the email
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      alert("An error occurred while sending the password reset email");
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
    // Check for access_token in cookies
    const token = getCookie("access_token");
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
              <img src={photoURL} alt="Avatar" className="avatar" />
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
              <input type="email" value={email} placeholder="Email" disabled />
              {/* <textarea
                className="biofield"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
              /> */}
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
            <button onClick={handleResetPassword}>Reset Password</button>
            {message && <p>{message}</p>}
            <button className="delete" onClick={handleClickOpen}>
              Delete Account
            </button>
            <Dialog open={openDialog} onClose={handleClose}>
              <DialogTitle>Confirm Account Deletion</DialogTitle>
              <DialogContent>
                <p>
                  To delete your account, please type <strong>confirm</strong>{" "}
                  below:
                </p>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Type confirm"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
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
