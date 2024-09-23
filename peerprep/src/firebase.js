// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	signOut,
	updateProfile,
	GoogleAuthProvider,
	signInWithPopup,
	sendEmailVerification,
	fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
	getFirestore,
	query,
	getDocs,
	collection,
	where,
	addDoc,
	setDoc,
	doc,
} from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { createTheme } from "@mui/material/styles";
import { Link, Navigate } from "react-router-dom";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// require("dotenv").config({ path: __dirname + "/./../../.env" });
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_FIREBASE_APP_ID,
	measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const firestore = getFirestore(app);
const storage = getStorage();
const realtime = getDatabase(app);
// const db = firebase.firestore();
// const storage = firebase.storage();
// const functions = firebase.functions();
// export { auth, db, storage, functions };
// export const auth = firebase.auth();
const logInWithEmailAndPassword = async (email, password) => {
	try {
		await signInWithEmailAndPassword(auth, email, password);
	} catch (err) {
		console.error(err);
		alert(err.message);
	}
};

const signInWithGoogle = async () => {
	try {
		const res = await signInWithPopup(auth, googleProvider);
		const user = res.user;
		const q = query(collection(db, "users"), where("uid", "==", user.uid));
		const docs = await getDocs(q);
		if (docs.docs.length === 0) {
			await setDoc(doc(db, "users", user.uid), {
				uid: user.uid,
				name: user.displayName,
				authProvider: "google",
				email: user.email,
			});
		}
	} catch (err) {
		console.error(err);
		alert(err.message);
	}
};

const registerWithEmailAndPassword = async (name, email, password) => {
	try {
		const res = await createUserWithEmailAndPassword(auth, email, password);
		const user = res.user;
		sendEmailVerification(user);
		alert("Email verification sent!");
		await setDoc(doc(db, "users", user.uid), {
			uid: user.uid,
			name: name,
			authProvider: "email",
			email: user.email,
		});
	} catch (err) {
		console.error(err);
		alert(err.message);
	}
	//alert("User created successfully");
};
const sendPasswordReset = async (email) => {
	try {
		const signInMethods = await fetchSignInMethodsForEmail(auth, email);
		if (signInMethods.length === 0) {
			alert("Email address is not registered");
			return;
		}
		await sendPasswordResetEmail(auth, email);
		alert("Password reset link sent!");
	} catch (err) {
		console.error(err);
		alert(err.message);
	}
};
const logout = () => {
	signOut(auth);
};

const theme = createTheme({
	palette: {
		primary: {
			main: "#04060a", // Customize your primary color
		},
		secondary: {
			main: "#8992a1", // Customize your secondary color
		},
	},
});

async function uploadimage(file, currentUser, setLoading) {
	const fileRef = ref(storage, currentUser.uid + ".png");

	setLoading(true);

	const snapshot = await uploadBytes(fileRef, file);
	const photoURL = await getDownloadURL(fileRef);

	updateProfile(currentUser, { photoURL });

	setLoading(false);
	alert("Uploaded file!");
}

export {
	auth,
	db,
	realtime,
	logInWithEmailAndPassword,
	registerWithEmailAndPassword,
	sendPasswordReset,
	logout,
	signInWithGoogle,
	theme,
	uploadimage,
};

export default app;
