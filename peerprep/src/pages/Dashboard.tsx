import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { auth, db, logout, theme } from "../firebase";
import { doc, query, collection, getDocs, where, deleteDoc, getDoc } from "firebase/firestore";
import { ThemeProvider } from "react-bootstrap";
import { updateProfile } from "firebase/auth";
import UserHeader from "../components/UserHeader";
import { Box, CircularProgress, Stack } from "@mui/material";
import { set } from "mongoose";
import { wait } from "@testing-library/user-event/dist/utils";
function Dashboard() {
  const [isLoading, setLoading] = useState(true)
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();
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
  // Current signed-in user to delete
  const deleteUser = async () => {
    try {
      if (user) {
        // const q = query(collection(db, "users"), where("uid", "==", user?.uid));
        // const doc = await getDocs(q);
        // doc.forEach(async (d) => {
        //   await deleteDoc(d.ref);
        // });
        await user.delete();
      }
      alert("User deleted successfully");
      navigate("/signin");
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again");
    }
  }
  useEffect(() => {
    if (loading) return; // Do nothing while loading
   
    if (user) {
      setTimeout(() => {
        fetchUserName();
        setLoading(false);
    }, 1000);
    };
    if (!user) return navigate("/signin");
  }, [user, loading]);
  return ( 
    isLoading ? <Stack spacing={2} direction="row" alignItems="center">
    {  
      <CircularProgress size="3rem" />
    }
  </Stack> :
    <ThemeProvider theme={theme}>
        <UserHeader/>
    <div className="dashboard">
       <div className="dashboard__container">
        Logged in as
         <div>{name}</div>
         <div>{user?.email}</div>
         <button className="dashboard__btn" onClick={deleteUser}>
          Delete Account
          </button>
       </div>
     </div>
    </ThemeProvider>
  );
}
export default Dashboard;