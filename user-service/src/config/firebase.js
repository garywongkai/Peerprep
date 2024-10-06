// To initialize Firebase in your Node.js (Express) application
require("dotenv").config();
const firebase = require("firebase/app");

// The Firebase SDK provides methods attached to the "firebase/auth" module to handle various authentication workflows.
// The following codes is to access the "auth" module and its methods based on what you need
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} = require("firebase/auth");

// This code initializes the Firebase Admin SDK in the Node.js app, providing administrative access to Firebase services, using the service account credentials loaded from the JSON file.
const admin = require("firebase-admin");
// Firebase Admin Initialization
const serviceAccount = require("../firebaseService.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firebase Client SDK Initialization
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

module.exports = {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  admin,
  updateProfile,
};
