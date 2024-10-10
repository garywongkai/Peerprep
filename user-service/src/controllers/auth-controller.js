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
const isDev = process.env.REACT_APP_ENV === "development";
const domain = isDev ? undefined : "peerprep-327190433280.asia-southeast1.run.app";
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
					res.status(500).json({ error: "Error sending email verification" });
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
				// Store all essential user details in cookies
				res.cookie("access_token", idToken, {
					httpOnly: false,
					secure: !isDev,
					sameSite: isDev ? "Lax" : "None",
					domain: domain,
				});
				res.cookie("uid", uid, {
					httpOnly: false,
					secure: !isDev,
					sameSite: isDev ? "Lax" : "None",
					domain: domain,
				});
				res.cookie("email", email, {
					httpOnly: false,
					secure: !isDev,
					sameSite: isDev ? "Lax" : "None",
					domain: domain,
				});
				res.cookie("displayName", displayName, {
					httpOnly: false,
					secure: !isDev,
					sameSite: isDev ? "Lax" : "None",
					domain: domain,
				});
				res.cookie("photoURL", photoURL, {
					httpOnly: false,
					secure: !isDev,
					sameSite: isDev ? "Lax" : "None",
					domain: domain,
				});

				res.status(200).json({
					message: "User logged in successfully",
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
			res.clearCookie("access_token");
			res.clearCookie("uid");
			res.clearCookie("email");
			res.clearCookie("displayName");
			res.clearCookie("photoURL");
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
			res
				.status(200)
				.json({ message: "Password reset email sent successfully!" });
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
			// Clear user cookies if needed
			res.clearCookie("access_token");
			res.clearCookie("uid");
			res.clearCookie("email");
			res.clearCookie("displayName");
			res.clearCookie("photoURL");

			res.status(200).json({ message: "User account deleted successfully" });
		})
		.catch((error) => {
			console.error("Error deleting user account:", error);
			res.status(500).json({ error: "Failed to delete account" });
		});
};

// Exporting individual handler functions
module.exports = {
	registerUser,
	loginUser,
	logoutUser,
	resetPassword,
	updateUserProfile,
	deleteUserAccount,
};
