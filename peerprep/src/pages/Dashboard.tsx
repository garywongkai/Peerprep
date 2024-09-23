import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { auth, db, logout, realtime, theme } from "../firebase";
import { doc, query, collection, getDocs, where, deleteDoc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { ThemeProvider } from "react-bootstrap";
import { updateProfile } from "firebase/auth";
import UserHeader from "../components/UserHeader";
import { get, ref, remove, set, update } from "firebase/database";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [matchedUser, setMatchedUser] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid), where("email", "==", user?.email));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      if (user) { 
        if(user.displayName !== null) {
          setName(data.name);
        }
        if(user.displayName === null) {
          await updateProfile(user, {
            displayName: data.name
          });
          setName(data.name);
      }
    }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again");
    }
  };

  interface MatchData {
    userName1: string;
    userName2: string;
    userId1: string;
    userId2: string;
    difficulty: string;
    date: string;
  }

  const handleSelect = (e: any) => {
    setDifficulty(e.target.value);
  };

  const handleMatch = async () => {
    if (!difficulty) {
      alert("Please select a difficulty level.");
      return;
    }
    // Reference for the current user's waiting record
  const waitingUserRef = doc(collection(db, "waiting_users"), user?.uid);
  const dbRef = ref(realtime, 'waiting_users');
  // Check for existing matches with the same difficulty
  const q = query(collection(db, "waiting_users"), where("difficulty", "==", difficulty), where("userId", "!=", user?.uid));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    // If a matching user is found
    const matchedUser = querySnapshot.docs[0]; // Get the first user found
    const matchRef = doc(collection(db, "matches"));
    
    // Create the match record
    const matchData = {
      userName1: matchedUser.data().userName, // The matched user
      userName2: name, // The current user
      userId1: matchedUser.id, // The user who was waiting
      userId2: user?.uid, // The current user
      difficulty,
      date: new Date().toISOString(),
    };

    // Store the match in Firestore
    await setDoc(matchRef, matchData);

    // Remove the matched user from the waiting_users collection
    await deleteDoc(doc(collection(db, "waiting_users"), matchedUser.id));
    // Remove the current user from the waiting_users collection
    await deleteDoc(waitingUserRef);
  } else {  
    await setDoc(waitingUserRef, {
      userName: name,
      difficulty,
      timestamp: new Date().toISOString(),
      userId: user?.uid,  // Current user will be userId1
    });
    setOpenDialog(true);
  }
};
  const handleCancel = async () => {
    try {
      // Reference to the waiting user node for the current user
      const waitingUserRef = doc(collection(db, "waiting_users"), user?.uid);
      
      // Remove the current user from the waiting_users node
      await deleteDoc(waitingUserRef);
      
      // Optionally, you can update the UI or provide feedback to the user
      alert('You have canceled matchmaking.');
    } catch (err) {
      console.error("Error removing user from queue: ", err);
      alert("Failed to cancel matchmaking. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleCancel(); // Cancel matchmaking on dialog close
  };

  useEffect(() => {
    if (loading) return; // Do nothing while loading
   
    if (user) {
        fetchUserName();
    }
    if (!user) return navigate("/signin");
    
    const matchQuery1 = query(
      collection(db, "matches"),
      where("userId1", "==", user.uid)
    );
    const matchQuery2 = query(
      collection(db, "matches"),
      where("userId2", "==", user.uid)
    );
    const unsubscribe1 = onSnapshot(matchQuery1, (snapshot) => {
      if (!snapshot.empty) {
        // A match has been found
        const match = snapshot.docs[0].data() as MatchData;
        (match.userId2 === user.uid) ? setMatchedUser(match.userName1) : setMatchedUser(match.userName2);
        setIsMatched(true);
        setMatchData(match);
        setOpenDialog(false);
        alert("You've been matched!");
      }
    });
    const unsubscribe2 = onSnapshot(matchQuery2, (snapshot) => {
      if (!snapshot.empty) {
        // A match has been found
        const match = snapshot.docs[0].data() as MatchData;
        (match.userId2 === user.uid) ? setMatchedUser(match.userName1) : setMatchedUser(match.userName2);
        setIsMatched(true);
        setMatchData(match);
        setOpenDialog(false);
        alert("You've been matched!");
      }
    });

    // Optionally store the unsubscribe function for future cleanup
  }, [user, loading]);
  
  return ( 
    <ThemeProvider theme={theme}>
        <UserHeader/>
    <div className="dashboard">
       <div className="dashboard__container">
        Logged in as
         <div>{name}</div>
         <div>{user?.email}</div>
       </div>
       <select value={difficulty} onChange={handleSelect}>
      <option value="">Select Difficulty</option>
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>
    <div>
      <button onClick={handleMatch}>Match</button>
    </div>
     </div>
     {!isMatched ? (
        <div>
        </div>
      ) : (
        <div>
          <h2>Match Found!</h2>
          <p>Matched with User: {matchedUser}</p>
          {/* Display coding editor here */}
        </div>
      )}
     <div>
     </div>
     <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>You are matching for <strong>{difficulty}</strong> questions</DialogTitle>
        <DialogContent>
          <p>Click <strong>Cancel</strong> to cancel matchmaking</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
export default Dashboard;