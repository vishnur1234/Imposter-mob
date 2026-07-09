import React, { useState, useRef } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, SafeAreaView,
  Animated, Alert, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = 400;

export default function PnpRoleRevealScreen({ route, navigation }) {
  const { colors, typography } = useTheme();
  const { players, topic, imposterIndices, hintsEnabled, timeLimitEnabled, duration, selectedCategory } = route.params;

  // Which player is currently viewing
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [1, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [0, 1] });

  const currentPlayer = players[currentPlayerIdx];
  const isImposter = imposterIndices.includes(currentPlayerIdx);
  const isLastPlayer = currentPlayerIdx === players.length - 1;
  const clue = topic?.clue || (topic?.clues?.[0] ?? null);

  const flipToBack = () => {
    Animated.spring(flipAnim, { toValue: 180, friction: 8, tension: 10, useNativeDriver: true }).start();
    setIsFlipped(true);
    setHasSeen(true);
  };

  const flipToFront = () => {
    Animated.spring(flipAnim, { toValue: 0, friction: 8, tension: 10, useNativeDriver: true }).start();
    setIsFlipped(false);
  };

  const handlePass = () => {
    if (!hasSeen) {
      Alert.alert("Hold to Peek", "Please hold and view your role before passing the phone.");
      return;
    }
    if (isLastPlayer) {
      // All players have seen their roles — start game
      navigation.replace("PnpDiscussion", {
        players,
        topic,
        imposterIndices,
        hintsEnabled,
        timeLimitEnabled,
        duration,
        selectedCategory,
      });
    } else {
      // Reset for next player
      flipAnim.setValue(0);
      setIsFlipped(false);
      setHasSeen(false);
      setCurrentPlayerIdx((prev) => prev + 1);
    }
  };

  const handleQuit = () => {
    Alert.alert(
      "Quit Game",
      "Return to home screen?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Quit", style: "destructive", onPress: () => navigation.reset({ index: 0, routes: [{ name: "Home" }] }) },
      ]
    );
  };

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="card-outline" size={18} color={colors.primary} />
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>ROLE REVEAL</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={[typography.body3, { color: colors.textSecondary }]}>
              {currentPlayerIdx + 1} / {players.length}
            </Text>
            <TouchableOpacity onPress={handleQuit} style={[styles.quitBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}>
              <Ionicons name="log-out-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.isDark ? "#1a1a1a" : "#E2E8F0" }]}>
          <LinearGradient
            colors={colors.gradientBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${((currentPlayerIdx) / players.length) * 100}%` }]}
          />
        </View>

        <View style={styles.scroll}>

          {/* Instruction */}
          <Text style={[styles.instruction, typography.body2, { color: colors.textSecondary }]}>
            {hasSeen ? "Release to hide. Then tap Pass to hand the phone." : `Hand the phone to ${currentPlayer?.name}. They should hold the card to reveal their role.`}
          </Text>

          {/* 3D Flip Card */}
          <View style={[styles.flipContainer, { height: CARD_HEIGHT, width: CARD_WIDTH }]}>

            {/* FRONT — Hidden */}
            <Animated.View style={[
              styles.face, styles.faceFront,
              { opacity: frontOpacity, transform: [{ perspective: 1000 }, { rotateY: frontRotate }], backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
              <LinearGradient
                colors={colors.isDark ? ["rgba(20,101,241,0.12)", "rgba(20,101,241,0.03)"] : ["#EFF6FF", "#F8FAFC"]}
                style={styles.faceGradient}
              >
                <View style={styles.patternGrid}>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <View key={i} style={[styles.patternDot, { backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : "rgba(37,99,235,0.08)" }]} />
                  ))}
                </View>
                <View style={[styles.avatarLarge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[typography.h2, { color: colors.primary }]}>
                    {currentPlayer?.name?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
                <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: 6, textAlign: "center" }]}>
                  {currentPlayer?.name}
                </Text>
                <View style={[styles.secretBadge, { backgroundColor: colors.isDark ? "rgba(20,101,241,0.2)" : "#EFF6FF", borderColor: colors.primary + "40" }]}>
                  <Ionicons name="lock-closed-outline" size={12} color={colors.primary} />
                  <Text style={[typography.sub8, { color: colors.primary }]}>SECRET ROLE HIDDEN</Text>
                </View>
                <Text style={[typography.body3, { color: colors.textDisabled, marginTop: 20, textAlign: "center" }]}>
                  👋 Hold to peek • Release to hide
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* BACK — Revealed */}
            <Animated.View style={[
              styles.face, styles.faceBack,
              {
                opacity: backOpacity,
                transform: [{ perspective: 1000 }, { rotateY: backRotate }],
                backgroundColor: isImposter
                  ? (colors.isDark ? "#1a0000" : "#FEF2F2")
                  : (colors.isDark ? "#001a0d" : "#ECFDF5"),
                borderColor: isImposter ? colors.error : colors.success,
              },
            ]}>
              <LinearGradient
                colors={isImposter
                  ? (colors.isDark ? ["rgba(211,47,47,0.25)", "rgba(211,47,47,0.05)"] : ["#FEF2F2", "#FFF1F1"])
                  : (colors.isDark ? ["rgba(0,185,111,0.25)", "rgba(0,185,111,0.05)"] : ["#ECFDF5", "#F0FDF4"])
                }
                style={styles.faceGradient}
              >
                <View style={[styles.roleBadge, { backgroundColor: (isImposter ? colors.error : colors.success) + "22" }]}>
                  <Ionicons name={isImposter ? "alert-circle" : "checkmark-circle"} size={13} color={isImposter ? colors.error : colors.success} />
                  <Text style={[typography.sub8, { color: isImposter ? colors.error : colors.success, letterSpacing: 2 }]}>
                    {isImposter ? "IMPOSTER" : "PLAYER"}
                  </Text>
                </View>

                {isImposter ? (
                  <>
                    <Ionicons name="alert-circle" size={52} color={colors.error} style={{ marginBottom: 10 }} />
                    <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 4 }]}>YOU ARE THE</Text>
                    <Text style={[styles.roleTitle, { color: colors.error }]}>IMPOSTER</Text>
                    {hintsEnabled && clue ? (
                      <>
                        <Text style={[typography.body3, { color: colors.textSecondary, marginBottom: 8, textAlign: "center" }]}>
                          Your clue to guess the topic:
                        </Text>
                        <View style={[styles.clueBox, { backgroundColor: colors.isDark ? "#000" : "#FFF", borderColor: colors.isDark ? "rgba(211,47,47,0.25)" : "rgba(239,68,68,0.15)" }]}>
                          <Text style={[typography.body2, { color: colors.textPrimary, textAlign: "center" }]}>{clue}</Text>
                        </View>
                      </>
                    ) : (
                      <Text style={[typography.body3, { color: colors.textSecondary, textAlign: "center", marginTop: 8 }]}>
                        Listen carefully and try to guess the topic!
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={52} color={colors.success} style={{ marginBottom: 10 }} />
                    <Text style={[typography.sub2, { color: colors.textSecondary, marginBottom: 8 }]}>YOUR SECRET TOPIC IS</Text>
                    <LinearGradient
                      colors={colors.isDark ? ["rgba(0,185,111,0.3)", "rgba(0,185,111,0.08)"] : ["#DCFCE7", "#ECFDF5"]}
                      style={[styles.topicBox, { borderColor: colors.isDark ? "rgba(0,185,111,0.35)" : "rgba(16,185,129,0.3)" }]}
                    >
                      <Text style={[styles.topicAnswer, { color: colors.success }]}>{topic?.answer}</Text>
                    </LinearGradient>
                    <Text style={[typography.body3, { color: colors.textSecondary, textAlign: "center", marginTop: 8 }]}>
                      Say <Text style={{ fontWeight: "bold", color: colors.success }}>one word</Text> about it. Don't let the imposter guess!
                    </Text>
                  </>
                )}
                <Text style={[typography.body3, { color: colors.textDisabled, marginTop: 10 }]}>Release to hide</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Hold button */}
          <TouchableOpacity
            onPressIn={flipToBack}
            onPressOut={flipToFront}
            activeOpacity={1}
            style={[styles.holdBtn, { borderColor: isFlipped ? (isImposter ? colors.error : colors.success) : colors.primary }]}
          >
            <LinearGradient
              colors={isFlipped ? (isImposter ? ["#b91c1c", "#ef4444"] : ["#059669", "#10b981"]) : colors.gradientBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.holdBtnInner}
            >
              <Ionicons name={isFlipped ? "eye" : "eye-outline"} size={20} color="#FFF" />
              <Text style={[typography.btn1, { color: "#FFF" }]}>
                {isFlipped ? "Peeking — Release to hide" : "Hold to Flip & Reveal"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Pass Button — shown after peeking */}
          {hasSeen && (
            <TouchableOpacity onPress={handlePass} activeOpacity={0.85} style={styles.passWrap}>
              <LinearGradient
                colors={isLastPlayer ? ["#059669", "#10b981"] : ["#1465F1", "#0A4BC4"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.passBtn}
              >
                <Ionicons name={isLastPlayer ? "play-circle-outline" : "hand-right-outline"} size={22} color="#FFF" />
                <Text style={[typography.btn1, { color: "#FFF" }]}>
                  {isLastPlayer ? "PASS" : `PASS TO ${players[currentPlayerIdx + 1]?.name?.toUpperCase() || "NEXT PLAYER"}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Turn indicator dots */}
          <View style={styles.dotsRow}>
            {players.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i < currentPlayerIdx
                      ? colors.success
                      : i === currentPlayerIdx
                      ? colors.primary
                      : colors.border,
                    width: i === currentPlayerIdx ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>
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
  progressTrack: { height: 3, marginHorizontal: 0, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  scroll: { flex: 1, padding: 20, gap: 16, justifyContent: "center" },
  instruction: { textAlign: "center", lineHeight: 20, marginBottom: 4 },
  flipContainer: { alignSelf: "center" },
  face: {
    position: "absolute", width: "100%", height: "100%",
    borderRadius: 24, borderWidth: 1.5, overflow: "hidden", backfaceVisibility: "hidden",
  },
  faceFront: {},
  faceBack: {},
  faceGradient: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  patternGrid: { position: "absolute", top: 16, left: 16, right: 16, flexDirection: "row", flexWrap: "wrap", gap: 18, opacity: 0.6 },
  patternDot: { width: 10, height: 10, borderRadius: 5 },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  secretBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 10 },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 16 },
  roleTitle: { fontSize: 38, fontWeight: "900", letterSpacing: 4, marginBottom: 14 },
  clueBox: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, width: "100%", alignItems: "center" },
  topicBox: { borderWidth: 1.5, borderRadius: 16, width: "100%", paddingVertical: 18, paddingHorizontal: 16, alignItems: "center" },
  topicAnswer: { fontSize: 30, fontWeight: "900", textAlign: "center", letterSpacing: 1 },
  holdBtn: { borderRadius: 18, overflow: "hidden", borderWidth: 1.5 },
  holdBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  passWrap: { borderRadius: 18, overflow: "hidden" },
  passBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 18 },
  dotsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 },
  dot: { height: 8, borderRadius: 4 },
});
