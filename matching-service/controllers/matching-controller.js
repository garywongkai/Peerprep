const { matchingService } = require("../models/match"); // remember to add {} if it has {} when exported in '../models/match'
const { getAuth } = require("../config/firebase");
const auth = getAuth();
const isDev = process.env.REACT_APP_ENV === "development";
const initiateMatch = async (req, res) => {
    try {
        // console.log(auth); // 输出请求体以检查内容
        const { difficulty, displayName } = req.body; // variable name must be same as in req.body
        const user = auth.currentUser;
        console.log("Current user:", auth.currentUser);
        // await matchingService.initiateMatch(difficulty, displayName, user);
        res.status(200).send("Match initiated");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const findMatch = async (req, res) => {
    try {
        const { difficulty } = req.query;
        const match = await matchingService.findMatch(difficulty, req.user);
        if (match) {
            res.status(200).json(match);
        } else {
            res.status(404).send("No match found");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const cancelMatch = async (req, res) => {
    try {
        const user = req.user;
        await matchingService.cancelMatch(user);
        res.status(200).send("Match request canceled");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const confirmMatch = async (req, res) => {
    try {
        const { matchId } = req.body;
        await matchingService.confirmMatch(matchId, req.user);
        res.status(200).send("Match confirmed");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const declineMatch = async (req, res) => {
    try {
        const { matchId } = req.body;
        await matchingService.declineMatch(matchId, req.user);
        res.status(200).send("Match declined");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const checkAndHandleDeclinedMatch = async (req, res) => {
    try {
        const user = req.user;
        const wasDeclined = await matchingService.checkAndHandleDeclinedMatch(user);

        if (wasDeclined) {
            res.status(200).send("Match was previously declined and has been reset.");
        } else {
            res.status(200).send("No declined match found.");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

const getQuestionHistory = async (req, res) => {
    try {
        const history = await matchingService.getQuestionHistory(req.user);
        res.status(200).json(history);
    } catch (err) {
        res.status(500).send(err.message);
    }
};


module.exports = {
	initiateMatch,
    findMatch,
    cancelMatch,
    confirmMatch,
    declineMatch,
    checkAndHandleDeclinedMatch,
    getQuestionHistory,
};
