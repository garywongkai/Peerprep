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
// const serviceAccount = require("../firebaseService.json");

const firebaseService = {
  type: process.env.USER_SERVICE_TYPE,
  project_id: process.env.USER_SERVICE_PROJECT_ID,
  private_key_id: process.env.USER_SERVICE_PRIVATE_KEY_ID,
  private_key: process.env.USER_SERVICE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle multiline private key
  client_email: process.env.USER_SERVICE_CLIENT_EMAIL,
  client_id: process.env.USER_SERVICE_CLIENT_ID,
  auth_uri: process.env.USER_SERVICE_AUTH_URI,
  token_uri: process.env.USER_SERVICE_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.USER_SERVICE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.USER_SERVICE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.USER_SERVICE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseService),
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
  firebaseService,
};
