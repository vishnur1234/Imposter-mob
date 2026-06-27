import React, { useState } from "react";
import { View, StyleSheet, Text, Alert, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext";

export default function JoinRoomScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!roomCode.trim()) {
      Alert.alert("Error", "Please enter a room code.");
      return;
    }

    setLoading(true);
    const code = roomCode.trim().toUpperCase();

    try {
      const roomRef = doc(db, "rooms", code);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        Alert.alert("Error", "Room not found. Check the code.");
        setLoading(false);
        return;
      }

      const roomData = roomSnap.data();
      const playersList = roomData.players || [];
      const capacity = roomData.playersRequired || roomData.players || 4;
      const myUid = auth.currentUser?.uid || "guest";
      const emailPrefix = auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "Guest Player";

      // Enforce coin balance entry check
      const statsRef = doc(db, "user_stats", myUid);
      const statsSnap = await getDoc(statsRef);
      let joinPlayerName = emailPrefix;
      if (statsSnap.exists()) {
        const statsData = statsSnap.data();
        const scoreVal = statsData.highScore || 0;
        if (scoreVal < 50) {
          Alert.alert("Insufficient Coins", "You need at least 50 coins to play. Claim your Daily Reward or play again later.");
          setLoading(false);
          return;
        }
        joinPlayerName = statsData.playerName || statsData.name || emailPrefix;
      }

      const alreadyInRoom = playersList.some((p) => p.uid === myUid);

      if (!alreadyInRoom && playersList.length >= capacity) {
        Alert.alert("Error", "This room is full.");
        setLoading(false);
        return;
      }

      const playerObj = { uid: myUid, name: joinPlayerName, score: 0 };

      if (alreadyInRoom) {
        // Player already in room — update their name to the latest gaming tag
        const updatedPlayers = playersList.map(p =>
          p.uid === myUid ? { ...p, name: joinPlayerName } : p
        );
        await updateDoc(roomRef, {
          players: updatedPlayers,
        });
      } else {
        // New player — add them with their gaming tag
        await updateDoc(roomRef, {
          players: arrayUnion(playerObj),
          playerList: arrayUnion({ uid: myUid, name: joinPlayerName }),
        });
      }

      navigation.navigate("WaitingRoom", {
        roomCode: code,
        course: roomData.category || roomData.course,
        players: capacity,
        isHost: roomData.hostId === myUid,
        isDemoMode: false,
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", `Failed to join room: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.gradientBg} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}>
            <Text style={[styles.backBtnText, typography.btn2, { color: colors.textSecondary }]}>← BACK</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>JOIN LOBBY</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, typography.sub2, { color: colors.primary }]}>ENTER CODE</Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={roomCode}
                onChangeText={setRoomCode}
                placeholder="e.g. X94B2E"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="characters"
                style={[
                  styles.textInput,
                  typography.body1,
                  {
                    backgroundColor: colors.isDark ? "#000000" : "#F8FAFC",
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }
                ]}
              />
            </View>

            <TouchableOpacity
              onPress={handleJoin}
              disabled={loading}
              style={[styles.btnContainer, loading && styles.btnDisabled]}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={colors.gradientBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnGradient}
              >
                <View style={styles.btnContent}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.btnLabel, typography.btn1]}>Join Room</Text>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backBtnText: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 2,
    marginLeft: 20,
  },
  scrollContent: {
    padding: 20,
    justifyContent: "center",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  textInput: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#0F172A",
    fontSize: 15,
  },
  btnContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  btnGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnLabel: {
    color: "#F0F0FF",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
