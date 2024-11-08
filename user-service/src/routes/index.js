const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const firebaseAuthController = require("../controllers/auth-controller");

router.post("/register", firebaseAuthController.registerUser);
router.post("/login", firebaseAuthController.loginUser);
router.post("/logout", firebaseAuthController.logoutUser);
router.post("/reset-password", firebaseAuthController.resetPassword);
// router.delete("/delete-account", firebaseAuthController.deleteUserAccount);
router.post("/saveQuestionAttempt", firebaseAuthController.saveQuestionAttempt);
// router.post("/saveCodeAttempt", firebaseAuthController.saveCodeAttempt);
router.post(
	"/update-profile",
	verifyToken,
	firebaseAuthController.updateUserProfile
);
router.post(
	"/saveCodeAttempt",
	verifyToken,
	firebaseAuthController.saveCodeAttempt
);
router.delete(
	"/delete-account",
	verifyToken,
	firebaseAuthController.deleteUserAccount
);

module.exports = router;
