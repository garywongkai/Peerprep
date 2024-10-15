// routes/matchingRoutes.js

const express = require("express");
const matchingController = require("../controllers/matchingController");
const router = express.Router();

// Route to create a new match
// Example usage: POST /api/match
router.post("/match", matchingController.createMatch);

// Route to find potential matches based on category and difficulty
// Example usage: GET /api/match/find?category=Math&difficulty=Easy
router.get("/match/find", matchingController.findMatch);

// Route to get the status of a specific match by ID
// Example usage: GET /api/match/:id
router.get("/match/:id", matchingController.getMatchStatus);

// Route to cancel a match by ID
// Example usage: DELETE /api/match/:id
router.delete("/match/:id", matchingController.cancelMatch);

// Route to retrieve all matches
// Example usage: GET /api/matches
router.get("/matches", matchingController.findAllMatches);

module.exports = router;
