import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * Saves a user's match score (or entry fee) to history and updates their total balance atomically.
 */
export const saveUserScoreToHistory = async (uid, name, roomCode, gameId, score, isEntryFee = false) => {
  if (!uid || uid === "guest") return;
  const matchId = `${gameId}_${isEntryFee ? "fee" : "score"}`;
  const statsRef = doc(db, "user_stats", uid);
  const historyRef = doc(db, "user_stats", uid, "history", matchId);

  try {
    await runTransaction(db, async (transaction) => {
      const historySnap = await transaction.get(historyRef);
      if (historySnap.exists()) {
        // Already recorded this scoring event, prevent duplicates
        return;
      }

      const statsSnap = await transaction.get(statsRef);
      let currentHighScore = 0;
      let currentTotalMatches = 0;
      let currentName = name;

      if (statsSnap.exists()) {
        const data = statsSnap.data();
        currentHighScore = data.highScore || 0;
        currentTotalMatches = data.totalMatches || 0;
        currentName = data.playerName || data.name || name;
      }

      const newHighScore = currentHighScore + score;
      const newTotalMatches = isEntryFee ? currentTotalMatches : currentTotalMatches + 1;

      // Write the match history record to subcollection
      transaction.set(historyRef, {
        roomCode,
        gameId,
        score,
        isEntryFee,
        timestamp: Date.now()
      });

      // Update total coins balance (highScore) and total matches atomically
      transaction.set(statsRef, {
        uid,
        name: currentName,
        playerName: currentName,
        highScore: newHighScore,
        totalMatches: newTotalMatches,
        lastUpdated: Date.now()
      }, { merge: true });
    });
  } catch (error) {
    console.error("Error saving user match score via transaction:", error);
  }
};

/**
 * Claims the daily reward atomically. Checks if 24 hours have elapsed.
 */
export const claimDailyReward = async (uid, name) => {
  if (!uid || uid === "guest") return;
  const dayInMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const gameId = "DAILY_" + Math.random().toString(36).substring(2, 6).toUpperCase();
  const matchId = `${gameId}_score`;
  const statsRef = doc(db, "user_stats", uid);
  const historyRef = doc(db, "user_stats", uid, "history", matchId);

  try {
    return await runTransaction(db, async (transaction) => {
      const statsSnap = await transaction.get(statsRef);
      let currentHighScore = 0;
      let lastClaimed = 0;
      let currentName = name;

      if (statsSnap.exists()) {
        const data = statsSnap.data();
        currentHighScore = data.highScore || 0;
        lastClaimed = data.lastDailyRewardClaimed || 0;
        currentName = data.playerName || data.name || name;
      }

      if (now - lastClaimed < dayInMs) {
        throw new Error("Daily reward is not claimable yet.");
      }

      const newHighScore = currentHighScore + 500;

      // Write claim event to history subcollection
      transaction.set(historyRef, {
        roomCode: "DAILY",
        gameId,
        score: 500,
        isEntryFee: false,
        timestamp: now
      });

      // Update stats document
      transaction.set(statsRef, {
        uid,
        name: currentName,
        playerName: currentName,
        highScore: newHighScore,
        lastDailyRewardClaimed: now,
        lastUpdated: now
      }, { merge: true });

      return true;
    });
  } catch (error) {
    console.error("Error claiming daily reward:", error);
    throw error;
  }
};
