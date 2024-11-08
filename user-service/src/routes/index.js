const express = require("express");
const router = express.Router();

const firebaseAuthController = require("../controllers/auth-controller");
const verifyToken = require("../middlewares/verifyToken");
const { generalLimiter } = require("../middleware/rateLimiters");

router.post("/register", firebaseAuthController.registerUser);
router.post("/login", firebaseAuthController.loginUser);
router.post("/logout", firebaseAuthController.logoutUser);
router.post("/reset-password", firebaseAuthController.resetPassword);
router.post(
    "/update-profile",
    verifyToken,
    generalLimiter,
    firebaseAuthController.updateUserProfile
);
router.post(
    "/save-code-attempt",
    verifyToken,
    generalLimiter,
    firebaseAuthController.saveCodeAttempt
);
router.delete(
    "/delete-account",
    verifyToken,
    generalLimiter,
    firebaseAuthController.deleteUserAccount
);

module.exports = router;
