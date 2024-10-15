// MatchmakingComponent.tsx
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { createMatchmakingService, MatchData } from "../service/MatchmakingService";

const MatchmakingComponent: React.FC = () => {
  const [difficulty, setDifficulty] = useState<string>("Easy");
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const matchmakingService = createMatchmakingService(auth.currentUser);

  const initiateMatch = async () => {
    if (!auth.currentUser) {
      console.log("User not authenticated");
      return;
    }

    try {
      await matchmakingService.initiateMatch(difficulty, auth.currentUser.displayName || "Anonymous");
      console.log("Match initiated. Looking for a match...");
      const match = await matchmakingService.findMatch(difficulty);
      setMatchData(match);
      if (match) {
        console.log("Match found:", match);
      } else {
        console.log("No match found");
      }
    } catch (error) {
      console.error("Error initiating match:", error);
    }
  };

  const cancelMatch = async () => {
    try {
      await matchmakingService.cancelMatch();
      console.log("Match canceled");
      setMatchData(null);
    } catch (error) {
      console.error("Error canceling match:", error);
    }
  };

  return (
    <div>
      <h2>Matchmaking</h2>
      <label>
        Select Difficulty:
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </label>
      <button onClick={initiateMatch}>Initiate Match</button>
      <button onClick={cancelMatch}>Cancel Match</button>
      {matchData && (
        <div>
          <h3>Match Found:</h3>
          <p>Matched with: {matchData.userName1}</p>
          <p>Difficulty: {matchData.difficulty}</p>
          <p>Question: {matchData.questionName}</p>
        </div>
      )}
    </div>
  );
};

export default MatchmakingComponent;
