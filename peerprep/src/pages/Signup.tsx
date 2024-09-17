// import * as React from 'react';
// import Header from '../components/Header';
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Container,
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   CardMedia,
//   CardActions,
//   CssBaseline,
//   ThemeProvider,
//   createTheme,
//   Switch,
//   Dialog,
// } from '@mui/material';
// import app from '../firebaseConfig';

// const email = document.getElementById('signup-email') as HTMLInputElement;
// const password = document.getElementById('signup-password') as HTMLInputElement;
// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#04060a', // Customize your primary color
//     },
//     secondary: {
//       main: '#8992a1', // Customize your secondary color
//     },
//   },
// });
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";
import {
  auth,
  registerWithEmailAndPassword,
} from "../firebaseConfig";
import "./Signup.css";
import Landing from "./Landing";
import { ThemeProvider } from "react-bootstrap";
import Header from "../components/Header";
function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, loading, error] = useAuthState(auth);;
  const register = () => {
    if (!name) alert("Please enter name");
    registerWithEmailAndPassword(name, email, password);
  };
  useEffect(() => {
    if (loading) return;
  }, [user, loading]);
  return (
    <ThemeProvider>
    <Header />
    <div className="register">
      <div className="register__container">
        <input
          type="text"
          className="register__textBox"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />
        <input
          type="text"
          className="register__textBox"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
        />
        <input
          type="password"
          className="register__textBox"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="register__btn" onClick={register}>
          Register
        </button>
        <button
          className="register__btn register__google"
          onClick={() => alert("Google Sign-in coming soon")}
        >
          Register with Google
        </button>
        <div>
          Already have an account? <Link to="/">Login</Link> now.
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}
export default Signup;