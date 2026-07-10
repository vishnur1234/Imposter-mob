import React, { useState, useEffect, useRef } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, SafeAreaView,
  ScrollView, Alert, Animated, Platform, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { getLocalTopic } from "../services/generateTopic";
import { getAvatarByIndex } from "../services/avatarService";

export default function PnpDiscussionScreen({ route, navigation }) {
  const { colors, typography } = useTheme();
  const { players, topic, imposterIndices, hintsEnabled, timeLimitEnabled, duration, selectedCategory } = route.params;

  const [phase, setPhase] = useState("discussion"); // "discussion" | "voting" | "result"
  const [votes, setVotes] = useState({}); // { voterIdx: votedPlayerIdx }
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [selectedVote, setSelectedVote] = useState(null);
  const [timeLeft, setTimeLeft] = useState(duration || 0);
  const [revealed, setRevealed] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePlayAgain = () => {
    try {
      const newTopic = getLocalTopic(selectedCategory || "acca");
      const imposterCount = imposterIndices ? imposterIndices.length : 1;
      const allIndices = [...Array(players.length).keys()];
      const candidates = allIndices.filter(idx => !imposterIndices.includes(idx));
      const pool = candidates.length >= imposterCount ? candidates : allIndices;
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const newImposterIndices = pool.slice(0, imposterCount);

      navigation.replace("PnpRoleReveal", {
        players,
        topic: newTopic,
        imposterIndices: newImposterIndices,
        hintsEnabled: hintsEnabled ?? true,
        timeLimitEnabled,
        duration,
        selectedCategory,
      });
    } catch (e) {
      if (Platform.OS === "web") {
        alert("Failed to start a new match. Please try again.");
      } else {
        Alert.alert("Error", "Failed to start a new match. Please try again.");
      }
    }
  };

  // Discussion timer
  useEffect(() => {
    if (!timeLimitEnabled || duration <= 0 || phase !== "discussion") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("voting");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, timeLimitEnabled, duration]);

  // Pulse animation for timer when < 30s
  useEffect(() => {
    if (timeLeft > 0 && timeLeft <= 30) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timeLeft <= 30]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleVoteSubmit = () => {
    if (selectedVote === null) {
      if (Platform.OS === "web") {
        alert("Please select who you think is the imposter.");
      } else {
        Alert.alert("Select a player", "Please select who you think is the imposter.");
      }
      return;
    }
    const newVotes = { ...votes, [currentVoterIdx]: selectedVote };
    setVotes(newVotes);

    if (currentVoterIdx === players.length - 1) {
      setPhase("result");
    } else {
      setCurrentVoterIdx((prev) => prev + 1);
      setSelectedVote(null);
    }
  };

  // Tally votes
  const tally = {};
  Object.values(votes).forEach((v) => {
    tally[v] = (tally[v] || 0) + 1;
  });
  const maxVotes = Math.max(0, ...Object.values(tally));
  const accusedIdx = parseInt(Object.entries(tally).find(([_, v]) => v === maxVotes)?.[0] ?? -1);
  const imposterCaught = imposterIndices.includes(accusedIdx);

  const handleQuit = () => {
    if (Platform.OS === "web") {
      const confirmQuit = window.confirm("Are you sure you want to quit and return to the home screen?");
      if (confirmQuit) {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
    } else {
      Alert.alert("Quit", "Return to home?", [
        { text: "Cancel", style: "cancel" },
        { text: "Quit", style: "destructive", onPress: () => navigation.reset({ index: 0, routes: [{ name: "Home" }] }) },
      ]);
    }
  };

  // ── DISCUSSION PHASE ──
  if (phase === "discussion") {
    return (
      <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
              <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>DISCUSSION</Text>
            </View>
            <TouchableOpacity onPress={handleQuit} style={[styles.quitBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}>
              <Ionicons name="log-out-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Timer */}
            {timeLimitEnabled && duration > 0 && (
              <Animated.View
                style={[
                  styles.timerCard,
                  {
                    backgroundColor: timeLeft <= 30 ? (colors.isDark ? "rgba(239,68,68,0.1)" : "#FEF2F2") : (colors.isDark ? "rgba(20,101,241,0.1)" : "#EFF6FF"),
                    borderColor: timeLeft <= 30 ? colors.error : colors.primary,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Ionicons name="timer-outline" size={22} color={timeLeft <= 30 ? colors.error : colors.primary} />
                <Text style={[styles.timerText, { color: timeLeft <= 30 ? colors.error : colors.primary }]}>
                  {formatTime(timeLeft)}
                </Text>
                <Text style={[typography.body3, { color: timeLeft <= 30 ? colors.error : colors.primary }]}>remaining</Text>
              </Animated.View>
            )}

            {/* Topic card */}
            <View style={[styles.topicCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.topicCardHeader}>
                <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
                <Text style={[typography.sub2, { color: colors.primary }]}>THE MYSTERY TOPIC</Text>
              </View>
              <Text style={[typography.body2, { color: colors.textSecondary, textAlign: "center", lineHeight: 20 }]}>
                Everyone knows the topic — except the imposter(s). Give hints without being too obvious!
              </Text>
              <View style={[styles.hiddenBadge, { backgroundColor: colors.isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7", borderColor: colors.isDark ? "rgba(245,158,11,0.3)" : "#FDE68A" }]}>
                <Ionicons name="eye-off-outline" size={14} color="#D97706" />
                <Text style={[typography.body3, { color: "#D97706" }]}>Topic is secret — known only to crew members</Text>
              </View>
            </View>

            {/* Players list */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 12 }]}>PLAYERS IN THE CIRCLE</Text>
              {players.map((p, i) => (
                <View
                  key={i}
                  style={[styles.playerRow, i < players.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                >
                  <View style={[styles.playerAvatar, { backgroundColor: colors.primaryLight, overflow: "hidden" }]}>
                    <Image
                      source={getAvatarByIndex(i)}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={[typography.body1, { color: colors.textPrimary, flex: 1 }]}>{p.name}</Text>
                  <View style={[styles.playerNumBadge, { backgroundColor: colors.isDark ? "#1a1a1a" : "#F1F5F9" }]}>
                    <Text style={[typography.sub8, { color: colors.textDisabled }]}>#{i + 1}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Start Voting Button */}
            <TouchableOpacity onPress={() => setPhase("voting")} activeOpacity={0.85} style={styles.voteWrap}>
              <LinearGradient colors={colors.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.voteBtn}>
                <Ionicons name="checkmark-done-circle-outline" size={22} color="#FFF" />
                <Text style={[typography.btn1, { color: "#FFF" }]}>START VOTING</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── VOTING PHASE ──
  if (phase === "voting") {
    const currentVoter = players[currentVoterIdx];
    const votablePlayers = players.filter((_, i) => i !== currentVoterIdx);

    return (
      <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="hand-right-outline" size={18} color={colors.primary} />
              <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>VOTE</Text>
            </View>
            <Text style={[typography.body3, { color: colors.textSecondary }]}>{currentVoterIdx + 1}/{players.length}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Progress */}
            <View style={[styles.progressTrack, { backgroundColor: colors.isDark ? "#1a1a1a" : "#E2E8F0" }]}>
              <LinearGradient
                colors={colors.gradientBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${(currentVoterIdx / players.length) * 100}%` }]}
              />
            </View>

            <View style={[styles.voterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.playerAvatar, { backgroundColor: colors.primaryLight, width: 60, height: 60, borderRadius: 30, marginBottom: 8, overflow: "hidden" }]}>
                <Image
                  source={getAvatarByIndex(currentVoterIdx)}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
              <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: "700", marginBottom: 4 }]}>
                {currentVoter?.name}
              </Text>
              <Text style={[typography.body2, { color: colors.textSecondary, textAlign: "center" }]}>
                Who do you think is the Imposter?
              </Text>
            </View>

            <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 12 }]}>SELECT YOUR SUSPECT</Text>

            {players.map((p, i) => {
              if (i === currentVoterIdx) return null;
              const isSelected = selectedVote === i;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedVote(i)}
                  activeOpacity={0.8}
                  style={[
                    styles.voteOption,
                    {
                      borderColor: isSelected ? colors.error : colors.border,
                      backgroundColor: isSelected
                        ? (colors.isDark ? "rgba(239,68,68,0.12)" : "#FEF2F2")
                        : colors.surface,
                    },
                  ]}
                >
                  <View style={[styles.playerAvatar, { backgroundColor: isSelected ? "rgba(239,68,68,0.2)" : colors.primaryLight, overflow: "hidden" }]}>
                    <Image
                      source={getAvatarByIndex(i)}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={[typography.body1, { color: colors.textPrimary, flex: 1, fontWeight: isSelected ? "700" : "400" }]}>
                    {p.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.voteCheck, { backgroundColor: colors.error }]}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={handleVoteSubmit}
              disabled={selectedVote === null}
              activeOpacity={0.85}
              style={[styles.voteWrap, { opacity: selectedVote === null ? 0.5 : 1 }]}
            >
              <LinearGradient
                colors={["#DC2626", "#B91C1C"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.voteBtn}
              >
                <Ionicons name={currentVoterIdx === players.length - 1 ? "checkmark-circle-outline" : "hand-right-outline"} size={22} color="#FFF" />
                <Text style={[typography.btn1, { color: "#FFF" }]}>
                  {currentVoterIdx === players.length - 1 ? "REVEAL RESULT" : `PASS TO ${players[currentVoterIdx + 1]?.name?.toUpperCase()}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── RESULT PHASE ──
  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="trophy-outline" size={18} color={colors.primary} />
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>RESULT</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}
            style={[styles.quitBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}
          >
            <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Outcome banner */}
          <LinearGradient
            colors={imposterCaught ? ["#059669", "#10b981"] : ["#DC2626", "#B91C1C"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.outcomeBanner}
          >
            <Ionicons name={imposterCaught ? "shield-checkmark" : "skull"} size={44} color="#FFF" />
            <Text style={[styles.outcomeTitle, { color: "#FFF" }]}>
              {imposterCaught ? "IMPOSTER CAUGHT!" : "IMPOSTER WINS!"}
            </Text>
            <Text style={[typography.body2, { color: "rgba(255,255,255,0.85)", textAlign: "center" }]}>
              {imposterCaught
                ? "Great teamwork! The crew identified the imposter."
                : "The imposter fooled everyone and escaped!"}
            </Text>
          </LinearGradient>

          {/* The topic */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 8 }]}>THE SECRET TOPIC WAS</Text>
            <Text style={[styles.topicReveal, { color: colors.primary }]}>{topic?.answer}</Text>
          </View>

          {/* Imposters reveal */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 12 }]}>
              {imposterIndices.length > 1 ? "THE IMPOSTERS WERE" : "THE IMPOSTER WAS"}
            </Text>
            {imposterIndices.map((idx) => (
              <View key={idx} style={[styles.playerRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.playerAvatar, { backgroundColor: "rgba(239,68,68,0.15)", overflow: "hidden" }]}>
                  <Image
                    source={getAvatarByIndex(idx)}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
                <Text style={[typography.body1, { color: colors.textPrimary, flex: 1, fontWeight: "700" }]}>{players[idx]?.name}</Text>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
              </View>
            ))}
          </View>

          {/* Vote tally */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 12 }]}>VOTE TALLY</Text>
            {players.map((p, i) => {
              const voteCount = tally[i] || 0;
              const pct = players.length > 0 ? (voteCount / players.length) * 100 : 0;
              const isAccused = i === accusedIdx;
              const isActualImposter = imposterIndices.includes(i);
              return (
                <View key={i} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <View style={[styles.playerAvatar, { backgroundColor: isActualImposter ? "rgba(239,68,68,0.15)" : colors.primaryLight, width: 28, height: 28, borderRadius: 14, overflow: "hidden" }]}>
                      <Image
                        source={getAvatarByIndex(i)}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    </View>
                    <Text style={[typography.body2, { color: colors.textPrimary, flex: 1, marginLeft: 8 }]}>{p.name}</Text>
                    <Text style={[typography.body3, { color: colors.textSecondary }]}>{voteCount} vote{voteCount !== 1 ? "s" : ""}</Text>
                    {isActualImposter && <Ionicons name="alert-circle" size={14} color={colors.error} style={{ marginLeft: 4 }} />}
                  </View>
                  <View style={[styles.tallyTrack, { backgroundColor: colors.isDark ? "#1a1a1a" : "#F1F5F9" }]}>
                    <LinearGradient
                      colors={isAccused ? ["#DC2626", "#B91C1C"] : colors.gradientBtn}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.tallyFill, { width: `${pct}%` }]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Play Again */}
          <TouchableOpacity
            onPress={handlePlayAgain}
            activeOpacity={0.85}
            style={styles.voteWrap}
          >
            <LinearGradient colors={colors.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.voteBtn}>
              <Ionicons name="refresh-circle-outline" size={22} color="#FFF" />
              <Text style={[typography.btn1, { color: "#FFF" }]}>PLAY AGAIN</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}
            activeOpacity={0.85}
            style={[styles.homeBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="home-outline" size={18} color={colors.textSecondary} />
            <Text style={[typography.btn1, { color: colors.textSecondary }]}>HOME</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  headerTitle: { letterSpacing: 2 },
  quitBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 20, paddingBottom: 48, gap: 14 },
  timerCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 12, borderWidth: 1.5, borderRadius: 20, paddingVertical: 16,
  },
  timerText: { fontSize: 32, fontWeight: "900", letterSpacing: 2 },
  topicCard: { borderWidth: 1, borderRadius: 20, padding: 18, alignItems: "center", gap: 12 },
  topicCardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  hiddenBadge: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  card: { borderWidth: 1, borderRadius: 20, padding: 18 },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  playerAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  playerNumBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  voteWrap: { borderRadius: 18, overflow: "hidden" },
  voteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 18 },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 2 },
  voterCard: { borderWidth: 1, borderRadius: 20, padding: 20, alignItems: "center", marginBottom: 4 },
  voteOption: {
    flexDirection: "row", alignItems: "center", borderWidth: 1.5,
    borderRadius: 16, padding: 14, gap: 12,
  },
  voteCheck: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  outcomeBanner: { borderRadius: 24, padding: 28, alignItems: "center", gap: 12 },
  outcomeTitle: { fontSize: 28, fontWeight: "900", letterSpacing: 2 },
  topicReveal: { fontSize: 28, fontWeight: "900", textAlign: "center", letterSpacing: 1 },
  tallyTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  tallyFill: { height: "100%", borderRadius: 3 },
  homeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1, borderRadius: 18, paddingVertical: 16,
  },
});
