const express = require("express");
const router = express.Router();

const firebaseAuthController = require("../controllers/auth-controller");

router.post("/register", firebaseAuthController.registerUser);
router.post("/login", firebaseAuthController.loginUser);
router.post("/logout", firebaseAuthController.logoutUser);
router.post("/reset-password", firebaseAuthController.resetPassword);
router.post("/update-profile", firebaseAuthController.updateUserProfile);
router.post("/save-code-attempt", firebaseAuthController.saveCodeAttempt);
router.delete("/delete-account", firebaseAuthController.deleteUserAccount);

module.exports = router;
