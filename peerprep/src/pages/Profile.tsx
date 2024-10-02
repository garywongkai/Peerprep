import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, ThemeProvider } from '@mui/material';
import UserHeader from '../components/UserHeader';
import '../styles/Profile.css';
import { userService, User } from '../service/UserService';
import { createTheme } from '@mui/material/styles';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await userService.verifyToken();
        setUser(userData);
        setName(userData.username);
        setEmail(userData.email);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (user) {
      try {
        const updatedUser = await userService.updateUser(user.id, { username: name });
        setUser(updatedUser);
        alert("Profile updated successfully!");
      } catch (err) {
        console.error("Error updating profile: ", err);
        alert("An error occurred while updating the profile.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText === 'confirm' && user) {
      try {
        await userService.deleteUser(user.id);
        alert("User deleted successfully");
        userService.logout();
        navigate("/signin");
      } catch (err) {
        console.error(err);
        alert("An error occurred. Please try again");
      }
      setOpenDialog(false);
    }
  };

  const handleClickOpen = () => setOpenDialog(true);
  const handleClose = () => {
    setOpenDialog(false);
    setConfirmText("");
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <ThemeProvider theme={theme}>
      <UserHeader />
      <div className="profile">
        <h1>Profile</h1>
        <div className="profile__container">
          <div className="profile__info">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <input
              type="email"
              value={email}
              placeholder="Email"
              disabled
            />
            <button onClick={handleUpdateProfile}>Update Profile</button>
            <button className='delete' onClick={handleClickOpen}>
              Delete Account
            </button>

            <Dialog open={openDialog} onClose={handleClose}>
              <DialogTitle>Confirm Account Deletion</DialogTitle>
              <DialogContent>
                <p>To delete your account, please type <strong>confirm</strong> below:</p>
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