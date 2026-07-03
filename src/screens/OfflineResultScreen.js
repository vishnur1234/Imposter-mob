import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView, Animated, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { doc, onSnapshot, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext";

const AVATAR_COLORS = [
  "#F59E0B", "#10B981", "#3B82F6", "#EC4899",
  "#8B5CF6", "#EF4444", "#06B6D4", "#84CC16",
];

const RANK_ICONS = ["🥇", "🥈", "🥉"];

const saveUserScoreToHistory = async (uid, name, roomCode, gameId, score, isEntryFee = false) => {
  if (uid === "guest") return;
  try {
    const statsRef = doc(db, "user_stats", uid);
    const snap = await getDoc(statsRef);
    let matchHistory = [];
    let highScore = 0;
    let totalMatches = 0;

    if (snap.exists()) {
      const statsData = snap.data();
      matchHistory = statsData.matchHistory || [];
      highScore = statsData.highScore || 0;
      totalMatches = statsData.totalMatches || 0;
    }

    if (matchHistory.some(m => m.gameId === gameId && (m.isEntryFee ?? false) === isEntryFee)) {
      return;
    }

    const newMatch = {
      roomCode,
      gameId,
      score,
      isEntryFee,
      timestamp: Date.now()
    };

    matchHistory.push(newMatch);
    highScore = matchHistory.reduce((sum, m) => sum + (m.score || 0), 0);
    if (!isEntryFee) {
      totalMatches = totalMatches + 1;
    }

    await setDoc(statsRef, {
      uid,
      name,
      highScore,
      totalMatches,
      matchHistory
    }, { merge: true });
  } catch (error) {
    console.error("Error saving user match score:", error);
  }
};

export default function OfflineResultScreen({ route, navigation }) {
  const { colors, typography } = useTheme();
  const { course, players, topic, imposterIndex, votes, tally, imposterCaught, scores, roomCode, isHost } = route.params || {};

  const [dbRoom, setDbRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const playerList = Array.isArray(players) ? players : [];
  const imposterPlayer = playerList[imposterIndex];

  const myUid = auth.currentUser?.uid || "guest";
  const recordedGamesRef = useRef([]);

  // Listen to Firestore for play again resets
  useEffect(() => {
    if (!roomCode) return;
    const unsub = onSnapshot(doc(db, "rooms", roomCode), (snap) => {
      if (!snap.exists()) {
        navigation.navigate("Home");
        return;
      }
      const data = snap.data();
      setDbRoom(data);

      if (data.gameStatus === "waiting") {
        // Go home to restart or rejoin
        navigation.navigate("Home");
      }
    });
    return () => unsub();
  }, [roomCode]);

  const finalScores = dbRoom?.scores || scores || {};
  const finalTally = dbRoom?.tally || tally || {};
  const finalImposterCaught = dbRoom?.imposterCaught ?? imposterCaught ?? false;

  useEffect(() => {
    if (!roomCode || myUid === "guest" || !dbRoom) return;
    if (dbRoom.gameStatus !== "offline_result") return;

    const myPlayerObj = playerList.find(p => p.uid === myUid);
    if (myPlayerObj) {
      const myScore = finalScores[myUid] || 0;
      const gameId = dbRoom.startedAt ? `${roomCode}_${dbRoom.startedAt}` : roomCode;
      if (!recordedGamesRef.current.includes(gameId)) {
        recordedGamesRef.current.push(gameId);
        saveUserScoreToHistory(myUid, myPlayerObj.name, roomCode, gameId, myScore);
      }
    }
  }, [dbRoom?.gameStatus, finalScores, myUid]);

  const scoreboard = [...playerList]
    .map((p) => ({ ...p, score: finalScores[p.uid] || 0 }))
    .sort((a, b) => b.score - a.score);

  // Animation
  const revealAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(revealAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePlayAgain = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Disband or reset room to waiting
      await updateDoc(doc(db, "rooms", roomCode), {
        gameStatus: "waiting",
        readyPlayers: [],
        votes: {},
        tally: {},
        scores: {},
      });
    } catch (e) {
      console.log("Failed to restart:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuit = () => {
    navigation.navigate("Home");
  };

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>

          <Animated.View style={{ opacity: revealAnim, transform: [{ scale: scaleAnim }] }}>
            <LinearGradient
              colors={finalImposterCaught
                ? (colors.isDark ? ["rgba(0,185,111,0.15)", "rgba(0,185,111,0.05)"] : ["#ECFDF5", "#F0FDF4"])
                : (colors.isDark ? ["rgba(211,47,47,0.15)", "rgba(211,47,47,0.05)"] : ["#FEF2F2", "#FFF1F2"])}
              style={[styles.resultBanner, {
                borderColor: finalImposterCaught
                  ? (colors.isDark ? "rgba(0,185,111,0.3)" : "rgba(16,185,129,0.3)")
                  : (colors.isDark ? "rgba(211,47,47,0.3)" : "rgba(239,68,68,0.3)"),
              }]}
            >
              <Text style={{ fontSize: 54, marginBottom: 10 }}>
                {finalImposterCaught ? "🎉" : "🕵️"}
              </Text>
              <Text style={[typography.sub2, { color: finalImposterCaught ? colors.success : colors.error, marginBottom: 8, letterSpacing: 2 }]}>
                {finalImposterCaught ? "IMPOSTER CAUGHT!" : "IMPOSTER ESCAPED!"}
              </Text>
              <Text style={[typography.h2, { color: colors.textPrimary, textAlign: "center", marginBottom: 8 }]}>
                {imposterPlayer?.name || "?"} was the Imposter
              </Text>
              <View style={[styles.topicReveal, {
                backgroundColor: colors.isDark ? "rgba(255,255,255,0.05)" : "#FFF",
                borderColor: colors.border,
              }]}>
                <Text style={[typography.body3, { color: colors.textSecondary }]}>The secret topic was</Text>
                <Text style={[typography.h4, { color: finalImposterCaught ? colors.success : colors.error, textAlign: "center" }]}>
                  {topic?.answer || "Unknown"}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
          <View style={[styles.legendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.legendRow}>
              <Ionicons name="information-circle-outline" size={15} color={colors.primary} />
              <Text style={[typography.sub2, { color: colors.textSecondary, letterSpacing: 1.5 }]}>SCORING RULES</Text>
            </View>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[typography.body3, { color: colors.textSecondary, flex: 1 }]}>
                  Imposter Caught → <Text style={{ color: colors.success, fontWeight: "700" }}>Correct voters split the pot</Text> (entry fee pot + penalty fees from losers).
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={[typography.body3, { color: colors.textSecondary, flex: 1 }]}>
                  Imposter Escaped → <Text style={{ color: colors.error, fontWeight: "700" }}>Imposter wins the entire pot</Text>.
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.textDisabled }]} />
                <Text style={[typography.body3, { color: colors.textSecondary, flex: 1 }]}>
                  Losers penalty → All losers receive <Text style={{ fontWeight: "700" }}>-100 pts</Text> (includes 50 entry fee + 50 penalty).
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.scoreHeader}>
              <Ionicons name="trophy" size={18} color={colors.warning} />
              <Text style={[typography.sub2, { color: colors.textSecondary }]}>FINAL SCOREBOARD</Text>
            </View>

            {scoreboard.map((p, idx) => {
              const isImp = p.uid === imposterPlayer?.uid;
              const ac = AVATAR_COLORS[playerList.findIndex((pl) => pl.uid === p.uid) % AVATAR_COLORS.length];
              const isWinner = idx === 0;
              return (
                <View
                  key={p.uid}
                  style={[
                    styles.scoreRow,
                    idx < scoreboard.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    isWinner && { backgroundColor: colors.isDark ? "rgba(251,191,36,0.08)" : "#FFFBEB" },
                  ]}
                >
                  <Text style={{ fontSize: idx < 3 ? 22 : 14, width: 30, textAlign: "center" }}>
                    {idx < 3 ? RANK_ICONS[idx] : `#${idx + 1}`}
                  </Text>
                  <View style={[styles.scoreAvatar, { backgroundColor: ac + "22", borderColor: ac, borderWidth: 1.5 }]}>
                    <Text style={[typography.btn2, { color: ac }]}>{(p.name || "?")[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body1, { color: colors.textPrimary, fontWeight: isWinner ? "800" : "400" }]} numberOfLines={1}>{p.name}</Text>
                    {isImp && (
                      <Text style={{ color: colors.error, fontSize: 10, fontWeight: "700" }}>🕵️ IMPOSTER</Text>
                    )}
                  </View>
                  <View style={[styles.scoreChip, {
                    backgroundColor: p.score > 0
                      ? (colors.isDark ? "rgba(0,185,111,0.15)" : "#ECFDF5")
                      : (colors.isDark ? "#1a1a1a" : "#F8FAFC"),
                    borderColor: p.score > 0 ? colors.success : colors.border,
                  }]}>
                    <Text style={[typography.h5, { color: p.score > 0 ? colors.success : colors.textDisabled }]}>
                      {p.score}
                    </Text>
                    <Text style={{ color: p.score > 0 ? colors.success : colors.textDisabled, fontSize: 9, fontWeight: "700" }}>PTS</Text>
                  </View>
                </View>
              );
            })}
          </View>
          {finalTally && (
            <View style={[styles.tallyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.scoreHeader}>
                <Ionicons name="bar-chart-outline" size={16} color={colors.primary} />
                <Text style={[typography.sub2, { color: colors.textSecondary }]}>VOTE TALLY</Text>
              </View>
              {playerList.map((p) => {
                const voteCount = finalTally[p.uid] || 0;
                const isImp = p.uid === imposterPlayer?.uid;
                const maxV = Math.max(...Object.values(finalTally), 1);
                return (
                  <View key={p.uid} style={styles.tallyRow}>
                    <Text style={[typography.body3, { color: colors.textPrimary, width: 90 }]} numberOfLines={1}>{p.name}</Text>
                    <View style={styles.tallyBar}>
                      <View style={[styles.tallyFill, {
                        width: `${(voteCount / maxV) * 100}%`,
                        backgroundColor: isImp ? colors.error : colors.primary,
                        opacity: voteCount === 0 ? 0 : 1,
                      }]} />
                    </View>
                    <Text style={[typography.body3, { color: isImp ? colors.error : colors.textSecondary, width: 28, textAlign: "right", fontWeight: isImp ? "800" : "400" }]}>
                      {voteCount}
                    </Text>
                    {isImp && <Ionicons name="alert-circle" size={14} color={colors.error} />}
                  </View>
                );
              })}
            </View>
          )}
          <View style={styles.actionRow}>
            {isHost ? (
              <>
                <TouchableOpacity
                  onPress={handleQuit}
                  activeOpacity={0.85}
                  style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.error, borderWidth: 1, flex: 1 }]}
                >
                  <Ionicons name="exit-outline" size={20} color={colors.error} />
                  <Text style={[typography.btn2, { color: colors.error }]}>QUIT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePlayAgain}
                  disabled={loading}
                  activeOpacity={0.85}
                  style={[styles.actionBtnWrap, { flex: 2 }]}
                >
                  <LinearGradient colors={colors.gradientSuccess} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionGradBtn}>
                    {loading ? <ActivityIndicator size="small" color="#FFF" /> :
                      <><Ionicons name="refresh-circle-outline" size={20} color="#FFF" /><Text style={[typography.btn2, { color: "#FFF" }]}>PLAY AGAIN</Text></>}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ width: "100%", gap: 10 }}>
                <View style={[styles.waitBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[typography.body2, { color: colors.textSecondary }]}>Waiting for host to play again…</Text>
                </View>
                <TouchableOpacity
                  onPress={handleQuit}
                  activeOpacity={0.85}
                  style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.error, borderWidth: 1, width: "100%" }]}
                >
                  <Ionicons name="exit-outline" size={20} color={colors.error} />
                  <Text style={[typography.btn2, { color: colors.error }]}>QUIT GAME</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  resultBanner: { borderWidth: 1.5, borderRadius: 28, padding: 28, alignItems: "center", marginBottom: 14 },
  topicReveal: { borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, alignItems: "center", gap: 4, marginTop: 8, width: "100%" },
  legendCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 14 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  legendItems: { gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  scoreCard: { borderWidth: 1, borderRadius: 22, padding: 18, marginBottom: 14 },
  scoreHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 4 },
  scoreAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  scoreChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: "center", minWidth: 48 },
  tallyCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 14 },
  tallyRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  tallyBar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.05)", overflow: "hidden" },
  tallyFill: { height: "100%", borderRadius: 4 },
  actionRow: { flexDirection: "row", gap: 10, width: "100%" },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 16, paddingVertical: 15 },
  actionBtnWrap: { borderRadius: 16, overflow: "hidden" },
  actionGradBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15 },
  waitBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderWidth: 1, borderRadius: 18, padding: 18, width: "100%" },
});
