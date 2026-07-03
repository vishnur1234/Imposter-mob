import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext";

export default function OfflineRoleRevealScreen({ route, navigation }) {
  const { colors, typography } = useTheme();
  const { course, players, topic, imposterIndex, rounds, roomCode, isHost, clueTimer } = route.params || {};

  const [dbRoom, setDbRoom] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadingReady, setLoadingReady] = useState(false);

  const playerList = Array.isArray(players) ? players : [];
  const currentUid = auth.currentUser?.uid;

  // Find this current player object
  const myPlayerIndex = playerList.findIndex((p) => p.uid === currentUid);
  const isImposter = myPlayerIndex === imposterIndex;
  const myPlayer = playerList[myPlayerIndex] || { name: "You" };

  const clueList = topic?.clues ? topic.clues : (topic?.clue ? [topic.clue] : []);

  // Listen to Firestore for ready status and automatic transition
  useEffect(() => {
    if (!roomCode) return;
    const unsub = onSnapshot(doc(db, "rooms", roomCode), async (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setDbRoom(data);

      const rPlayers = data.readyPlayers || [];
      const currentReady = rPlayers.includes(currentUid);
      setReady(currentReady);

      // Auto-transition when game state updates to turn
      if (data.gameStatus === "offline_turn") {
        navigation.navigate("OfflineTurn", {
          course: data.category || course,
          players: playerList,
          topic: data.topic || topic,
          imposterIndex: data.imposterIndex ?? imposterIndex,
          turnOrder: data.turnOrder || [],
          roundNumber: data.roundNumber || 1,
          rounds: data.totalRounds || rounds || 3,
          roomCode,
          isHost,
          clueTimer: data.clueTimer !== undefined ? data.clueTimer : (clueTimer || 0),
        });
      }
    });
    return () => unsub();
  }, [roomCode]);

  // Host starts the turn round when everyone is ready
  useEffect(() => {
    if (!isHost || !dbRoom || !roomCode) return;
    const rPlayers = dbRoom.readyPlayers || [];
    const allPlayers = dbRoom.players || [];
    if (rPlayers.length >= allPlayers.length && dbRoom.gameStatus === "offline_reveal") {
      const startTurns = async () => {
        try {
          // Shuffle turn order
          const shuffledUids = [...allPlayers].sort(() => Math.random() - 0.5).map(p => p.uid);
          await updateDoc(doc(db, "rooms", roomCode), {
            gameStatus: "offline_turn",
            turnOrder: shuffledUids,
            currentTurnIndex: 0,
            roundNumber: 1,
            turnStartedAt: Date.now(),
          });
        } catch (e) {
          console.log("Failed to start turn round automatically:", e.message);
        }
      };
      startTurns();
    }
  }, [dbRoom, isHost, roomCode]);

  const handleReady = async () => {
    if (ready || loadingReady) return;
    setLoadingReady(true);
    try {
      await updateDoc(doc(db, "rooms", roomCode), {
        readyPlayers: arrayUnion(currentUid),
      });
      setReady(true);
    } catch (e) {
      Alert.alert("Error", `Failed to set ready: ${e.message}`);
    } finally {
      setLoadingReady(false);
    }
  };

  const readyPlayersList = dbRoom?.readyPlayers || [];

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: "transparent" }]}>
          <Ionicons name="card-outline" size={18} color={colors.primary} />
          <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>ROLE REVEAL</Text>
          <View style={{ width: 18 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {!revealed ? (
            // HIDDEN card state (only reveals to this user)
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.avatarLarge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[typography.h2, { color: colors.primary }]}>
                  {myPlayer?.name?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>

              <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 8, textAlign: "center" }]}>
                {myPlayer?.name}
              </Text>
              <Text style={[typography.body2, { color: colors.textSecondary, textAlign: "center", marginBottom: 32 }]}>
                Tap below to reveal your secret card. Make sure no one else can see your screen!
              </Text>

              <TouchableOpacity onPress={() => setRevealed(true)} activeOpacity={0.85} style={styles.btnWrap}>
                <LinearGradient colors={colors.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                  <Ionicons name="eye-outline" size={20} color="#FFF" />
                  <Text style={[typography.btn1, { color: "#FFF" }]}>Reveal My Card</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            // REVEALED card state
            <View style={[
              styles.card,
              {
                backgroundColor: isImposter ? (colors.isDark ? "rgba(211,47,47,0.12)" : "#FEF2F2") : (colors.isDark ? "rgba(0,185,111,0.12)" : "#ECFDF5"),
                borderColor: isImposter ? colors.error : colors.success,
              }
            ]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 24 }}>
                <Text style={[typography.sub7, { color: colors.textSecondary }]}>{myPlayer?.name}</Text>
                <Text style={[typography.body3, { color: colors.textSecondary }]}>ROLE REVEALED</Text>
              </View>

              {isImposter ? (
                <View style={styles.roleWrap}>
                  <Ionicons name="alert-circle" size={52} color={colors.error} style={{ marginBottom: 8 }} />
                  <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 6 }]}>YOU ARE THE</Text>
                  <Text style={[typography.h1, { color: colors.error, letterSpacing: 4, marginBottom: 16 }]}>IMPOSTER</Text>
                  {clueList.length > 0 && (
                    <>
                      <Text style={[typography.body3, { color: colors.textSecondary, marginBottom: 12, textAlign: "center" }]}>
                        Guess the topic using {clueList.length > 1 ? "these clues" : "this clue"}:
                      </Text>
                      {clueList.map((clue, i) => (
                        <View key={i} style={[styles.clueItem, { backgroundColor: colors.isDark ? "#000" : "#FFF", borderColor: colors.isDark ? "rgba(211,47,47,0.2)" : "rgba(239,68,68,0.15)" }]}>
                          <View style={[styles.clueNum, { backgroundColor: colors.isDark ? "rgba(211,47,47,0.15)" : "#FEF2F2" }]}>
                            <Text style={[typography.btn2, { color: colors.error }]}>{String(i + 1).padStart(2, "0")}</Text>
                          </View>
                          <Text style={[typography.body1, { color: colors.textPrimary, flex: 1 }]}>{clue}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.roleWrap}>
                  <Ionicons name="checkmark-circle" size={52} color={colors.success} style={{ marginBottom: 12 }} />
                  <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 8 }]}>YOUR SECRET TOPIC IS</Text>
                  <LinearGradient colors={colors.isDark ? ["rgba(0,185,111,0.15)", "rgba(0,185,111,0.02)"] : ["#ECFDF5", "#F0FDF4"]}
                    style={[styles.topicBox, { borderColor: colors.isDark ? "rgba(0,185,111,0.25)" : "rgba(16,185,129,0.2)" }]}>
                    <Text style={[typography.h2, { color: colors.success, textAlign: "center" }]}>{topic?.answer}</Text>
                  </LinearGradient>
                  <Text style={[typography.body2, { color: colors.textSecondary, textAlign: "center", marginBottom: 24 }]}>
                    Say <Text style={{ color: colors.success, fontWeight: "bold" }}>one word</Text> about it. Don't let the imposter guess!
                  </Text>
                </View>
              )}

              {ready ? (
                <View style={[styles.btnGhost, { backgroundColor: colors.isDark ? "rgba(0,185,111,0.15)" : "#ECFDF5", borderColor: colors.success, width: "100%", justifyContent: "center" }]}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                  <Text style={[typography.btn2, { color: colors.success }]}>Ready! Waiting for others...</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={handleReady} disabled={loadingReady} activeOpacity={0.85} style={styles.btnWrap}>
                  <View style={[styles.btnGhost, { backgroundColor: colors.isDark ? "rgba(20,101,241,0.12)" : colors.primaryLight, borderColor: colors.border }]}>
                    {loadingReady ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done" size={18} color={colors.primary} />
                        <Text style={[typography.btn2, { color: colors.primary, flex: 1, textAlign: "center" }]}>
                          I'm Ready
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Lobby ready status list */}
          <View style={[styles.readyListCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}>
            <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 12 }]}>
              PLAYER STATUS ({readyPlayersList.length}/{playerList.length})
            </Text>
            {playerList.map((p) => {
              const isPlayerReady = readyPlayersList.includes(p.uid);
              return (
                <View key={p.uid} style={styles.playerStatusRow}>
                  <View style={[styles.miniAvatar, { backgroundColor: colors.primaryLight }]}>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>{p.name?.[0]?.toUpperCase()}</Text>
                  </View>
                  <Text style={[typography.body3, { color: colors.textPrimary, flex: 1 }]}>{p.name}</Text>
                  {isPlayerReady ? (
                    <View style={styles.statusBadgeReady}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                      <Text style={{ color: colors.success, fontSize: 10, fontWeight: "700" }}>READY</Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadgeWaiting}>
                      <ActivityIndicator size="small" color={colors.textDisabled} style={{ transform: [{ scale: 0.7 }] }} />
                      <Text style={{ color: colors.textDisabled, fontSize: 10 }}>READING...</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, gap: 10 },
  headerTitle: {},
  scroll: { padding: 20, flexGrow: 1, justifyContent: "center" },
  card: { borderWidth: 1, borderRadius: 24, padding: 24, alignItems: "center" },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 18 },
  roleWrap: { alignItems: "center", width: "100%", marginBottom: 8 },
  clueItem: { flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, marginBottom: 8, width: "100%" },
  clueNum: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  topicBox: { borderWidth: 1, borderRadius: 18, width: "100%", paddingVertical: 26, paddingHorizontal: 20, alignItems: "center", marginBottom: 14, marginTop: 8 },
  btnWrap: { width: "100%", borderRadius: 16, overflow: "hidden", marginTop: 12 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 17 },
  btnGhost: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18 },
  readyListCard: { borderWidth: 1, borderRadius: 20, padding: 16 },
  playerStatusRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  miniAvatar: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  statusBadgeReady: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusBadgeWaiting: { flexDirection: "row", alignItems: "center", gap: 4 },
});
