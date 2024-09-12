import * as React from 'react';
import Link from '@mui/material/Link';
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Form } from 'react-bootstrap';
import Header from '../components/Header';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Switch,
  Dialog,
} from '@mui/material';
var email, password;


const firebaseConfig = {
  apiKey: "AIzaSyAEe9vRfbX5As71Q-K3rO3en5wQ8iYti1M",
  authDomain: "peerprep-5a1fa.firebaseapp.com",
  databaseURL: "https://peerprep-5a1fa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "peerprep-5a1fa",
  storageBucket: "peerprep-5a1fa.appspot.com",
  messagingSenderId: "327190433280",
  appId: "1:327190433280:web:1b126ea64b85e732e612e5",
  measurementId: "G-4S67BK0WNH"
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#04060a', // Customize your primary color
    },
    secondary: {
      main: '#8992a1', // Customize your secondary color
    },
  },
});


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

  const signupbtn = document.getElementById('signup');

function Signup() {
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
      <Header/>
      <Grid container spacing={2}>
            <Grid item xs={12}>
                <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
                >
                    <input id = "signup-email" type="text" placeholder="Email" />
                    <input id = "signup-password"  type="password" placeholder="Password" />
                    <button id='signup' type="submit">Sign up</button>

                </Box>
            </Grid>
            </Grid>
        </ThemeProvider>
    </React.Fragment>
  );
}

signupbtn?.addEventListener('click', () => {
    const email = document.getElementById('signup-email') as HTMLInputElement;
    const password = document.getElementById('signup-password') as HTMLInputElement;

      var isVerified = true;
  
      if(email.value == "") {
        isVerified = false;
        window.alert("Email cannot be empty.");
      }

      if(password.value == "") {
        isVerified = false;
        window.alert("Password cannot be empty.");
      }

      // check firebase data if email already exists
      // checkuserEmail(auth, email.value).then((result) => {
      //   if(result) {
      //     isVerified = false;
      //     window.alert("Email already exists.");
      //   }
      // });
      
      if(isVerified) {
        createUserWithEmailAndPassword(auth, email.value, password.value)
          .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          // ...
          console.log("Success! Account created.");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
          window.alert("Error occurred. Try again.");
        });
      }
});

export default Signup;