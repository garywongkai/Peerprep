const Match = require("../models/match");
const criteriaUtils = require("../utils/criteriaUtils");
const Question = require("../../service/models/question");

class MatchingService {
    /**
     * Finds potential matches based on given criteria.
     * @param {Object} criteria - The matching criteria (e.g., category, difficulty).
     * @returns {Array} Array of potential matches that satisfy the criteria.
     */
    async findPotentialMatches(criteria) {
        try {
            // Use the criteria to filter matches
            const matches = await Match.find({
                category: criteria.category,
                difficulty: criteria.difficulty,
                status: "pending",
            });
            return matches;
        } catch (error) {
            console.error("Error finding potential matches:", error);
            throw new Error("Could not find potential matches");
        }
    }

    /**
     * Initiates a match between two users based on a specific question.
     * @param {String} user1Id - The ID of the first user.
     * @param {String} user2Id - The ID of the second user.
     * @param {Object} question - The question data containing category and difficulty.
     * @returns {Object} The newly created match document.
     */
    async initiateMatch(user1Id, user2Id, question) {
        try {
            const isMatch = criteriaUtils.matchCriteria(
                user1Id,
                user2Id,
                question
            ); // ID or object??
            if (!isMatch) {
                throw new Error("Users do not meet matching criteria");
            }

            // Set expiresAt to 30 seconds from now
            const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds

            const match = new Match({
                user1Id,
                user2Id,
                questionId: question._id,
                category: question.category,
                difficulty: question.difficulty,
                status: "pending",
                expiresAt,
            });

            const savedMatch = await match.save();

            // Set a timeout to automatically cancel the match after 30 seconds if it is still pending
            setTimeout(async () => {
                const currentMatch = await Match.findById(savedMatch._id);
                if (currentMatch && currentMatch.status === "pending") {
                    currentMatch.status = "canceled";
                    await currentMatch.save();
                    console.log(
                        `Match ${savedMatch._id} has been automatically canceled due to timeout.`
                    );
                }
            }, 30 * 1000);

            return savedMatch;
        } catch (error) {
            console.error("Error initiating match:", error);
            throw new Error("Could not initiate match");
        }
    }

    /**
     * Updates the status of a match.
     * @param {String} matchId - The ID of the match to update.
     * @param {String} status - The new status for the match (e.g., 'pending', 'matched', 'canceled').
     * @returns {Object} The updated match document.
     */
    async updateMatchStatus(matchId, status) {
        try {
            const updatedMatch = await Match.findByIdAndUpdate(
                matchId,
                { status },
                { new: true, useFindAndModify: false }
            );

            if (!updatedMatch) {
                throw new Error("Match not found");
            }

            return updatedMatch;
        } catch (error) {
            console.error("Error updating match status:", error);
            throw new Error("Could not update match status");
        }
    }

    /**
     * Cancels a match by updating its status to 'canceled'.
     * @param {String} matchId - The ID of the match to cancel.
     * @returns {Object} The canceled match document.
     */
    async cancelMatch(matchId) {
        return await this.updateMatchStatus(matchId, "canceled");
    }

    /**
     * Retrieves all matches from the database.
     * @returns {Array} Array of all matches.
     */
    async getAllMatches() {
        try {
            const matches = await Match.find();
            return matches;
        } catch (error) {
            console.error("Error retrieving matches:", error);
            throw new Error("Could not retrieve matches");
        }
    }
}

module.exports = new MatchingService();
