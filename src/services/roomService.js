import { doc, runTransaction, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebase";


// Ensure this is called within a React component or hook context
/**
 * Creates a multiplayer room with collision checking on the generated 6-character room code.
 */
export const createRoomAtomic = async (roomData) => {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomRef = doc(db, "rooms", roomCode);

    try {
      const success = await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (roomSnap.exists()) {
          // Code collision detected, return false to retry in next loop iteration
          return false;
        }

        // Write the room configuration atomically
        transaction.set(roomRef, {
          ...roomData,
          roomCode
        });
        return roomCode;
      });

      if (success) {
        return success; // Returns the generated roomCode
      }
    } catch (e) {
      console.error("Error creating room atomically:", e);
      throw e;
    }

    attempts++;
  }
  throw new Error("Failed to generate a unique room code. Please try again.");
};

/**
 * Joins a room atomically, verifying capacity and checking entry fee balance in a single transaction.
 */
export const joinRoomAtomic = async (roomCode, myUid, emailPrefix) => {
  const roomRef = doc(db, "rooms", roomCode);
  const statsRef = doc(db, "user_stats", myUid);

  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) {
      throw new Error("ROOM_NOT_FOUND");
    }

    const roomData = roomSnap.data();
    const playersList = roomData.players || [];
    const capacity = roomData.playersRequired || 4;

    // Check if user has sufficient coins for the room entry fee
    const statsSnap = await transaction.get(statsRef);
    let joinPlayerName = emailPrefix;
    const requiredCoins = roomData.bettingAmount !== undefined ? roomData.bettingAmount : 50;

    if (statsSnap.exists()) {
      const statsData = statsSnap.data();
      const scoreVal = statsData.highScore || 0;
      if (scoreVal < requiredCoins) {
        throw new Error(`INSUFFICIENT_COINS:${requiredCoins}`);
      }
      joinPlayerName = statsData.playerName || statsData.name || emailPrefix;
    } else {
      if (requiredCoins > 0) {
        throw new Error(`INSUFFICIENT_COINS:${requiredCoins}`);
      }
    }

    const alreadyInRoom = playersList.some((p) => p.uid === myUid);

    if (!alreadyInRoom && playersList.length >= capacity) {
      throw new Error("ROOM_FULL");
    }

    const playerObj = { uid: myUid, name: joinPlayerName, score: 0 };

    if (alreadyInRoom) {
      // Update their display name if it changed
      const updatedPlayers = playersList.map(p =>
        p.uid === myUid ? { ...p, name: joinPlayerName } : p
      );
      transaction.update(roomRef, {
        players: updatedPlayers
      });
    } else {
      // Append the new player atomically
      transaction.update(roomRef, {
        players: arrayUnion(playerObj),
        playerList: arrayUnion({ uid: myUid, name: joinPlayerName })
      });
    }

    return {
      category: roomData.category || roomData.course,
      playersRequired: capacity,
      hostId: roomData.hostId,
      gameMode: roomData.gameMode,
      totalRounds: roomData.totalRounds || 3,
      selectedTopic: roomData.selectedTopic || null,
      bettingAmount: requiredCoins,
      clueTimer: roomData.clueTimer !== undefined ? roomData.clueTimer : 0
    };
  });
};
