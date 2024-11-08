const express = require("express");
const router = express.Router();

const firebaseAuthController = require("../controllers/auth-controller");
const verifyToken = require("../middlewares/verifyToken"); // Import the token verification middleware

router.post("/register", firebaseAuthController.registerUser);
router.post("/login", firebaseAuthController.loginUser);
router.post("/logout", firebaseAuthController.logoutUser);
router.post("/reset-password", firebaseAuthController.resetPassword);
router.post(
    "/update-profile",
    verifyToken,
    firebaseAuthController.updateUserProfile
);
router.post(
    "/save-code-attempt",
    verifyToken,
    firebaseAuthController.saveCodeAttempt
);
router.delete(
    "/delete-account",
    verifyToken,
    firebaseAuthController.deleteUserAccount
);

module.exports = router;
