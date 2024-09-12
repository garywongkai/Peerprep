import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from "firebase/compat/app";

// Initialize Firebase
var firebaseConfig = {
	apiKey: "AIzaSyAEe9vRfbX5As71Q-K3rO3en5wQ8iYti1M",
	authDomain: "peerprep-5a1fa.firebaseapp.com",
	databaseURL:
		"https://peerprep-5a1fa-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "peerprep-5a1fa",
	storageBucket: "peerprep-5a1fa.appspot.com",
	messagingSenderId: "327190433280",
	appId: "1:327190433280:web:1b126ea64b85e732e612e5",
	measurementId: "G-4S67BK0WNH",
};
const app = firebase.initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
window.addEventListener("DOMContentLoaded", function (e) {
  ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  ).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
