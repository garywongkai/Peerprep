const express = require("express");
const matchingController = require("../controllers/matching-controller");
const router = express.Router();

router.post("/initiate", matchingController.initiateMatch);
router.get("/find", matchingController.findMatch);
router.delete("/cancel", matchingController.cancelMatch);
router.post("/confirm", matchingController.confirmMatch);
router.post("/decline", matchingController.declineMatch);
router.get("/checkDeclined", matchingController.checkAndHandleDeclinedMatch);
router.get("/history", matchingController.getQuestionHistory);

module.exports = router;

