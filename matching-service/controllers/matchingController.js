const Match = require("../models/match");
const matchingService = require("../services/matchingService");
const criteriaUtils = require("../utils/criteriaUtils");

// create new matching request
exports.createMatch = async (req, res) => {
  const { user1Id, user2Id, questionId, category, difficulty } = req.body;

  if (!user1Id || !user2Id || !questionId || !category || !difficulty) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // check whether a valid match
    const isMatch = criteriaUtils.matchCriteria(user1Id, user2Id, { category, difficulty });
    if (!isMatch) {
      return res.status(400).json({ message: "Users do not meet matching criteria." });
    }

    // create new match
    const match = new Match({
      user1Id,
      user2Id,
      questionId,
      category,
      difficulty,
      status: "pending"
    });

    const savedMatch = await match.save();
    res.status(201).json({
      message: "Match created successfully.",
      match: savedMatch
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating match.", error: error.message });
  }
};

// search based on criteria
exports.findMatch = async (req, res) => {
  const { category, difficulty } = req.query;

  try {
    const criteria = { category, difficulty };
    const potentialMatches = await matchingService.findPotentialMatches(criteria);
    
    if (potentialMatches.length === 0) {
      return res.status(404).json({ message: "No matches found." });
    }

    res.status(200).json(potentialMatches);
  } catch (error) {
    res.status(500).json({ message: "Error finding matches.", error: error.message });
  }
};

// get certain matching status 
exports.getMatchStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving match.", error: error.message });
  }
};

// cancel match 
exports.cancelMatch = async (req, res) => {
  const { id } = req.params;

  try {
    const match = await Match.findByIdAndUpdate(id, { status: "canceled" }, { new: true });

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    res.status(200).json({
      message: "Match canceled successfully.",
      match
    });
  } catch (error) {
    res.status(500).json({ message: "Error canceling match.", error: error.message });
  }
};

// find all the matching records
exports.findAllMatches = async (req, res) => {
  try {
    const matches = await Match.find();
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving matches.", error: error.message });
  }
};
