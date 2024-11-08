// To define controller functions that will manage the requests to actions such as register, login, or logout users.
const {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	sendEmailVerification,
	sendPasswordResetEmail,
	updateProfile,
} = require("../config/firebase");

// Each of the authentication methods takes a number of parameters, including a mandatory auth object that needs to be included and passed alongside the requests.
// This ensure that the operations are performed within the correct authentication context, preventing unauthorized access or manipulation of user data.
const auth = getAuth();
const admin = require("firebase-admin");
const { dbAdmin } = require("../config/firebase");
const registerUser = (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		return res.status(422).json({
			name: "Name is required",
			email: "Email is required",
			password: "Password is required",
		});
	}

	createUserWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			// Set the display name
			return updateProfile(userCredential.user, { displayName: name }); // Use the correct updateProfile function
		})
		.then(() => {
			sendEmailVerification(auth.currentUser)
				.then(() => {
					res.status(201).json({
						message: "Verification email sent! User created successfully!",
					});
				})
				.catch((error) => {
					console.error(error);
					res.status(500).json({
						error: "Error sending email verification",
					});
				});
		})
		.catch((error) => {
			const errorMessage =
				error.message || "An error occurred while registering user";
			res.status(500).json({ error: errorMessage });
		});
};

const loginUser = (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(422).json({
			email: "Email is required",
			password: "Password is required",
		});
	}

	signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			if (!userCredential.user.emailVerified) {
				return res.status(403).json({
					error:
						"Email is not verified. Please verify your email before logging in.",
				});
			}
			const idToken = userCredential._tokenResponse.idToken;
			const uid = userCredential.user.uid;
			const email = userCredential.user.email;
			const displayName = userCredential.user.displayName || ""; // Get displayName
			const photoURL = userCredential.user.photoURL || ""; // Get photoURL
			if (idToken && uid) {
				res.status(200).json({
					message: "User logged in successfully",
					accessToken: idToken,
					uid,
					email,
					displayName,
					photoURL,
				});
			} else {
				res.status(500).json({ error: "Internal Server Error" });
			}
		})
		.catch((error) => {
			console.error(error);
			const errorMessage =
				error.message || "An error occurred while logging in";
			res.status(500).json({ error: errorMessage });
		});
};

const logoutUser = (req, res) => {
	signOut(auth)
		.then(() => {
			res.status(200).json({ message: "User logged out successfully" });
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json({ error: "Internal Server Error" });
		});
};

const resetPassword = (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(422).json({
			email: "Email is required",
		});
	}

	sendPasswordResetEmail(auth, email)
		.then(() => {
			res.status(200).json({
				message: "Password reset email sent successfully!",
			});
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json({ error: "Internal Server Error" });
		});
};

const updateUserProfile = (req, res) => {
	const { displayName, photoURL } = req.body; // Get displayName and photoURL from the request body

	// Check if displayName is provided
	if (!displayName) {
		return res.status(422).json({ error: "Display name is required" });
	}

	const user = auth.currentUser; // Get the current user
	console.log("Current user:", auth.currentUser);

	if (!user) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	updateProfile(user, {
		displayName,
		photoURL: photoURL || null,
	})
		.then(() => {
			res.status(200).json({ message: "Profile updated successfully" });
		})
		.catch((error) => {
			console.error("Error updating user profile:", error);
			res.status(500).json({ error: "Failed to update profile" });
		});
};

const deleteUserAccount = (req, res) => {
	const user = auth.currentUser;

	if (!user) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	user
		.delete()
		.then(() => {
			res.status(200).json({
				message: "User account deleted successfully",
			});
		})
		.catch((error) => {
			console.error("Error deleting user account:", error);
			res.status(500).json({ error: "Failed to delete account" });
		});
};

const saveQuestionAttempt = async (req, res) => {
	const { questionId, codeAttempt, dateLogged } = req.body; // Extract data from the request body
	const user = auth.currentUser; // Get the current user

	if (!user) {
		return res.status(401).json({ error: "User not authenticated" });
	}

	if (!questionId || !codeAttempt || !dateLogged) {
		return res.status(422).json({
			questionId: "Question ID is required",
			codeAttempt: "Code attempt is required",
			dateLogged: "Date logged is required",
		});
	}

	try {
		// Create a reference to the user's collection of question attempts
		const userDocRef = doc(db, "users", user.uid); // Assuming you have a 'users' collection
		if (!userDocRef) {
			const userDocRef = dbAdmin.collection("users").doc(auth.currentUser.uid);
			return userDocRef.set({
				name: name,
				email: email,
				createdAt: admin.firestore.FieldValue.serverTimestamp(),
			});
		}
		const attemptsRef = doc(userDocRef, "questionAttempts", questionId); // Create a sub-collection for question attempts

		// Save the question attempt
		await setDoc(attemptsRef, {
			codeAttempt,
			dateLogged,
			questionId,
			userId: user.uid, // Optionally store the user ID
		});

		res.status(201).json({ message: "Question attempt saved successfully!" });
	} catch (error) {
		console.error("Error saving question attempt:", error);
		res.status(500).json({ error: "Failed to save question attempt" });
	}
};

const saveCodeAttempt = async (req, res) => {
	const { code, date, roomId } = req.body;
	const idToken = req.headers.authorization?.split(" ")[1]; // Extract ID token from Authorization header

	// Check if the required fields are present
	if (!code || !date || !roomId) {
		return res.status(400).json({
			error: "Code, date and roomId are required fields.",
		});
	}

	if (!idToken) {
		return res.status(401).json({ error: "Authentication token is missing" });
	}

	try {
		// console.log("ID Token:", idToken);
		// Verify the ID token to check if the user is authenticated
		// const decodedToken = await admin.getAuth().verify
		const decodedToken = await admin.auth().verifyIdToken(idToken);
		const uid = decodedToken.uid; // User ID from the decoded token (useful for referencing the user if needed)

		// Reference to Firestore collection
		const codeAttemptsRef = dbAdmin.collection("codeAttempts");

		// Save the code attempt data into Firestore
		await codeAttemptsRef.add({
			code: code,
			date: date,
			roomId: roomId,
			createdAt: admin.firestore.FieldValue.serverTimestamp(), // Store server timestamp
			userId: uid, // Optionally store the user's UID for tracking
		});

		// Respond with success message
		return res.status(200).json({
			message: "Code attempt saved successfully.",
		});
	} catch (error) {
		console.error("Error saving code attempt:", error); // Log more detailed error message
		return res.status(500).json({
			error: `Failed to save code attempt: ${error.message}`, // Include error message in response
		});
	}
};

// Exporting individual handler functions
module.exports = {
	registerUser,
	loginUser,
	logoutUser,
	resetPassword,
	updateUserProfile,
	deleteUserAccount,
	saveQuestionAttempt,
	saveCodeAttempt,
};
