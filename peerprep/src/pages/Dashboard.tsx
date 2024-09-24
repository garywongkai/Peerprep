import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { auth, db, logout, realtime, theme } from "../firebase";
import { doc, query, collection, getDocs, where, deleteDoc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { ThemeProvider } from "react-bootstrap";
import { updateProfile } from "firebase/auth";
import UserHeader from "../components/UserHeader";
import { get, ref, remove, set, update } from "firebase/database";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/material.css';
import { match } from "assert";
const baseurl = 'https://service-327190433280.asia-southeast1.run.app/question';

function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [matchedUserName, setMatchedUserName] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openMatchDialog, setOpenMatchDialog] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  let matchedUser:any;
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

  const fetchQuestions = async () => {
    try {
      let url = `${baseurl}/randomQuestion`;
      const params = new URLSearchParams();
  
      if (difficulty) {
        params.append('difficulty', difficulty);
      }
  
      // Only append query parameters if they exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
        fetch(url, {
            method: 'GET'
        }).then(response => response.json()).then((data) => setQuestion(data));
        console.log(question);
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again');
    }
  };

  interface MatchData {
    userName1: string;
    userName2: string;
    userId1: string;
    userId2: string;
    difficulty: string;
    date: string;
    question: any;
    matchId: string;
    status: string;
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
    await setDoc(waitingUserRef, {
      userName: name,
      difficulty,
      timestamp: new Date().toISOString(),
      userId: user?.uid,  // Current user will be userId1
    });
  // Check for existing matches with the same difficulty
  const q = query(collection(db, "waiting_users"), where("difficulty", "==", difficulty), where("userId", "!=", user?.uid));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    // If a matching user is found
    matchedUser = querySnapshot.docs[0]; // Get the first user found
    const matchRef = doc(collection(db, "matches"));
    const newmatchId = `${matchedUser.id}_${user?.uid}`;
    // Create the match record
    const matchData = {
      userName1: matchedUser.data().userName, // The matched user
      userName2: name, // The current user
      userId1: matchedUser.id, // The user who was waiting
      userId2: user?.uid, // The current user
      difficulty,
      date: new Date().toISOString(),
      matchId: newmatchId,
      status: "pending",
    };

    // Store the match in Firestore
    await setDoc(matchRef, matchData);
  } else {  
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
      window.location.reload();
    } catch (err) {
      console.error("Error removing user from queue: ", err);
      alert("Failed to cancel matchmaking. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleCancel(); // Cancel matchmaking on dialog close
  };

  const handleConfirmMatch = async (confirm: boolean) => {
    if (matchData) {
    const q = query(collection(db, "matches"), where("matchId", "==", matchData.matchId));
    const currentmatch = (await getDocs(q)).docs[0].ref;
    if (confirm) {
      // Set the user's confirmation status
      await updateDoc(currentmatch, { [`${user?.uid}_confirmed`]: true });
      
      // Check if both users have confirmed
      const currentMatchSnapshot = await getDocs(q);
      let matchStatus;
      if (!currentMatchSnapshot.empty) {
        matchStatus = currentMatchSnapshot.docs[0].data();
      }
      if (matchStatus && matchStatus[`${matchData.userId1}_confirmed`] && matchStatus[`${matchData.userId2}_confirmed`]) {
        fetchQuestions();
        console.log(question);
        // Both users confirmed, create the match
        await updateDoc(currentmatch, {
          userId1: matchData.userId1,
          userId2: matchData.userId2,
          difficulty: matchData.difficulty,
          date: new Date().toISOString(),
          matchId: matchData.matchId,
          status: "active",
          question: question,
        });
        
        // Remove the current user from the waiting_users collection

        // Remove the pending match
        //await deleteDoc(matchRef);
        // Proceed to the collaborative editor
        //navigate(`/editor/${matchData.matchId}`, { state: { matchData: { userId1: matchData.userId1, userId2: matchData.userId2, difficulty }, user } });
      }
    } else {
      // User declined the match, cancel it and return both users to the matching state
      if (currentmatch) {
        await updateDoc(currentmatch, {
          status: "canceled",
        });
      }
      setOpenMatchDialog(false);
      setIsMatched(false);
      handleCancel();
      // Optionally, return the user to matching state here
    }
  } else {
    alert("Match data not found. Please try again.");
  }
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
        (match.userId2 === user.uid) ? setMatchedUserName(match.userName1) : setMatchedUserName(match.userName2);
        setMatchData(match);
        setOpenDialog(false);
        setOpenMatchDialog(true);
        if (match.status === "active") {
          setIsMatched(true);
          const waitingUserRef = doc(collection(db, "waiting_users"), user?.uid);
          deleteDoc(waitingUserRef);
          navigate(`/editor/${match.matchId}`, { 
            state: { 
                matchData: {
                    userName1: match.userName1,
                    userName2: match.userName2,
                    userId1: match.userId1,
                    userId2: match.userId2,
                    difficulty: match.difficulty,
                    question: match.question,
                    matchId: match.matchId,
                }
            } 
        });
        } else if (match.status === "canceled") {
          // alert("The match has been canceled. You will return to the matching queue.");
          // Optionally, return the user to matching state here
          setOpenMatchDialog(false);
          setIsMatched(false);
          setOpenDialog(true);
          setDoc(snapshot.docs[0].ref, { status: "deleted" });
        }
      }
    });
    const unsubscribe2 = onSnapshot(matchQuery2, (snapshot) => {
      if (!snapshot.empty) {
        // A match has been found
        const match = snapshot.docs[0].data() as MatchData;
        (match.userId2 === user.uid) ? setMatchedUserName(match.userName1) : setMatchedUserName(match.userName2);
        setOpenDialog(false);
        setOpenMatchDialog(true);
        setMatchData(match);
        if (match.status === "active") {
          setIsMatched(true);
          const waitingUserRef = doc(collection(db, "waiting_users"), user?.uid);
          deleteDoc(waitingUserRef);
          navigate(`/editor/${match.matchId}`, { 
            state: { 
                matchData: {
                    userName1: match.userName1,
                    userName2: match.userName2,
                    userId1: match.userId1,
                    userId2: match.userId2,
                    difficulty: match.difficulty,
                    question: match.question,
                }
            }
        });
        }
        else if (match.status === "canceled") {
          // alert("The match has been canceled. You will return to the matching queue.");
          // Optionally, return the user to matching state here
          
          setOpenMatchDialog(false);
          setIsMatched(false);
          setOpenDialog(true);
          setDoc(snapshot.docs[0].ref, { status: "deleted" });
        }
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
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
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
    <Dialog open={openMatchDialog} onClose={() => handleConfirmMatch(false)}>
      <DialogTitle>Match Found!</DialogTitle>
      <DialogContent>
        <p>Your question is : {matchData?.question}</p>
        <p>You have been matched for a {matchData?.difficulty} level problem.</p>
        <p>Do you want to proceed with this match?</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleConfirmMatch(true)} color="primary">
          Confirm
        </Button>
        <Button onClick={() => handleConfirmMatch(false)} color="secondary">
          Decline
        </Button>
      </DialogActions>
    </Dialog>
    </ThemeProvider>
  );
}
export default Dashboard;