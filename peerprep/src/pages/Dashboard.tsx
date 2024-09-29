import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { auth, db, theme } from "../firebase";
import { doc, query, collection, getDocs, where, deleteDoc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { ThemeProvider } from "react-bootstrap";
import { updateProfile } from "firebase/auth";
import UserHeader from "../components/UserHeader";
import { MatchmakingService, MatchData } from '../service/MatchmakingService';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/material.css';
const baseurl = 'https://service-327190433280.asia-southeast1.run.app/question';

function Dashboard() {
  const [alert, setAlert] = useState(false);
  const [alertContent, setAlertContent] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [matchedUserName, setMatchedUserName] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openMatchDialog, setOpenMatchDialog] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [matchmakingService, setMatchmakingService] = useState<MatchmakingService | null>(null);
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
      setAlertContent("An error occurred. Please try again");
      setAlert(true);
    }
  };

  const handleSelect = (e: any) => {
    setDifficulty(e.target.value);
  };

  const handleMatch = async () => {
    if (!difficulty) {
      setAlertContent("Please select a difficulty level.");
      setAlert(true);
      return;
    }
    if (matchmakingService) {
      await matchmakingService.initiateMatch(difficulty, name);
      const match = await matchmakingService.findMatch(difficulty);
      if (match) {
        setMatchData(match);
        setOpenMatchDialog(true);
      } else {
        setOpenDialog(true);
      }
    }
};
  const handleCancel = async () => {
    try {
      if (matchmakingService) {
        await matchmakingService.cancelMatch();
        setAlertContent('You have canceled matchmaking.');
        setAlert(true);
        window.location.reload();
      }
    } catch (err) {
      console.error("Error removing user from queue: ", err);
      setAlertContent("Failed to cancel matchmaking. Please try again.");
      setAlert(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleCancel(); // Cancel matchmaking on dialog close
  };

  const handleConfirmMatch = async (confirm: boolean) => {
    if (matchData && matchmakingService) {
      if (confirm) {
        await matchmakingService.confirmMatch(matchData.matchId);
      } else {
        await matchmakingService.declineMatch(matchData.matchId);
        setOpenMatchDialog(false);
        setIsMatched(false);
        handleCancel();
      }
    }
  };

  useEffect(() => {
    if (loading) return; // Do nothing while loading
   
    if (user) {
        fetchUserName();
        setMatchmakingService(new MatchmakingService(user));
    }
    if (!user) return navigate("/signin");
    
    const matchQuery1 = query(
      collection(db, "matches"),
      where("userId1", "==", user.uid),  where("status", "in", ["active", "pending", "canceled"])
    );
    const matchQuery2 = query(
      collection(db, "matches"),
      where("userId2", "==", user.uid),  where("status", "in", ["active", "pending", "canceled"])
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
                    questionName: match.questionName,
                }
            } 
        });
        } else if (match.status === "canceled") {
          setOpenMatchDialog(false);
          setIsMatched(false);
          setOpenDialog(true);
          setDoc(snapshot.docs[0].ref, { status: "deleted" });
        } else if (match.status === "deleted") {
          deleteDoc(snapshot.docs[0].ref);
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
                    questionName: match.questionName,
                }
            }
        });
        }
        else if (match.status === "canceled") {          
          setOpenMatchDialog(false);
          setIsMatched(false);
          setOpenDialog(true);
          setDoc(snapshot.docs[0].ref, { status: "deleted" });
        }
      }
    });
    const clearAlert = setTimeout(() => {
      setAlert(false);
    }, 3000)

    return () => {
      unsubscribe1();
      unsubscribe2();
      if (alert) {
        clearTimeout(clearAlert);
      }
    }
    // Optionally store the unsubscribe function for future cleanup
  }, [user, loading, alert]);
  
  return ( 
    <ThemeProvider theme={theme}>
        <UserHeader/>
        <div className="dashboard-container">
      <h2>Welcome to PeerPrep, {name}</h2>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <div className="matchmaking-container">
        <h3>Select a Difficulty:</h3>
        <select value={difficulty} onChange={handleSelect}>
          <option value="">--Select--</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <Button variant="contained" onClick={handleMatch}>Match</Button>
        </div>
        </Box>
      {alert ? <><div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 999 }}><Alert severity='info'>{alertContent}</Alert> </div></> : <></>}
     </div>
     
     {!isMatched ? (
        <div>
        </div>
      ) : (
        <div>
          <h2>Match Found!</h2>
          <p>Matched with User: {matchedUser}</p>
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
        <p>Your question is : {matchData?.questionName}</p>
        <p>You have been matched for a {matchData?.difficulty} level problem.</p>
        <p>Your collaborator: {matchedUserName}</p>
        <p>Do you want to proceed with this match?</p>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => handleConfirmMatch(true)} color="primary">
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