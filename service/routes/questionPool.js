const express = require("express");
const QuestionController = require("../../peerprep/src/controllers/Question");
const router = express.Router();
router.get("/", QuestionController.findAll);
router.get("/:id", QuestionController.findOne);
router.post("/", QuestionController.create);
router.patch("/:id", QuestionController.update);
router.delete("/:id", QuestionController.destroy);
module.exports = router;
