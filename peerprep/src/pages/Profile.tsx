import React, { useEffect, useState } from 'react';
import { auth, db, theme, uploadimage } from '../firebase'; // Import your Firebase setup
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, ThemeProvider } from '@mui/material';
import UserHeader from '../components/UserHeader';
import '../styles/Profile.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';

const Profile = () => {
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [photoURL, setPhotoURL] = useState("https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png");
  const [isLoading, setLoading] = useState(true)
  const [user, loading, error] = useAuthState(auth);
  const [isHovering, setIsHovering] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false); // For the delete dialog
  const [confirmText, setConfirmText] = useState("");
  const fetchUserProfile = async () => {
    if (user) {
      const storage = getStorage();
      const imageRef = ref(storage, `avatars/${user.uid}`);
      try {
        const url = await getDownloadURL(imageRef);
        setPhotoURL(url);
      } catch (err) {
        console.error("Error fetching image URL: ", err);
      }
    }
  };
  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid), where("email", "==", user?.email));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      if (user) { 
        if(user.displayName !== null) {
          setName(data.name);
          setEmail(data.email);
        }
        if(user.displayName === null) {
          await updateProfile(user, {
            displayName: data.name
          });
          setName(data.name);
        }
        setEmail(data.email);
        setBio(data.bio);
    }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again");
    }
  };

  function handleChange(e: any) {
    if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
    
        // Check if the file type is an image
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(selectedFile.type)) {
          alert("Please upload a valid image file (JPEG, PNG, GIF, SVG).");
          setIsHovering(false);
          return;
        }

        setAvatar(selectedFile);
    }
  }

  function handleClick() {
    uploadimage(avatar, user, setLoading);
    window.location.reload();
  }

  const handleUpdateProfile = async () => {
    if (user) {
      try {
        await updateProfile(user, {
          displayName: name,
        });

        // Update Firestore user data if necessary
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { name: name, bio:bio });

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
        if (user) {
            await user.delete();
          }
          alert("User deleted successfully");
          navigate("/signin");
        } catch (err) {
          console.error(err);
          alert("An error occurred. Please try again");
        }
        setOpenDialog(false); // Close the dialog
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
    if (loading) return; // Do nothing while loading
    if (user) {
        fetchUserName();
        fetchUserProfile();
      }
    if (user?.photoURL) {
        setPhotoURL(user.photoURL);
      }
    if (!user) return navigate("/signin");
  }, [user, loading]);
  return (
    <ThemeProvider theme={theme}>
      <UserHeader />
      <div className="profile">
        <h1>Profile</h1>
        <div className="profile__container">
          <div className="profile__avatar">
            {photoURL ? (
              <img onClick={() => (isHovering) ? setIsHovering(false) : setIsHovering(true)} src={photoURL} alt="Avatar" className="avatar" />
            ) : (
              <div onClick={() => (isHovering) ? setIsHovering(false) : setIsHovering(true)} className="avatar-placeholder">No Avatar</div>
            )}
            {isHovering && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ display: 'block', marginTop: '10px' }}
                />
                <button
                  disabled={loading || !avatar}
                  onClick={handleClick}
                >
                  Upload Image
                </button>
              </>
            )}
            {/* <button disabled={loading || !avatar} onClick={handleClick}>Upload Image</button> */}
          </div>
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
            <textarea
              className='biofield'
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
            />
            <button onClick={handleUpdateProfile}>Update Profile</button>
            &nbsp;
            {/* Delete Account Section */}
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
                disabled={confirmText !== "confirm"} // Enable only when user types 'confirm'
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
