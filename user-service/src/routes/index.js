const express = require("express");
const router = express.Router();

const firebaseAuthController = require("../controllers/auth-controller");
const verifyToken = require("../middleware/verifyToken");
const authenticateUser = require("../middleware/verifyAuth");

router.post("/register", firebaseAuthController.registerUser);
router.post("/login", firebaseAuthController.loginUser);
router.post("/logout", firebaseAuthController.logoutUser);
router.post("/reset-password", firebaseAuthController.resetPassword);
router.post("/update-profile", firebaseAuthController.updateUserProfile);
router.delete("/delete-account", firebaseAuthController.deleteUserAccount);

module.exports = router;
