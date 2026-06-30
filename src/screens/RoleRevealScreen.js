import React, { useState } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext";

export default function RoleRevealScreen({ route, navigation }) {
  const { colors, typography } = useTheme();
  const { roomCode, course, players, topic, imposterIndex, isHost, isDemoMode, gameId } = route.params || {};
  const playerList = Array.isArray(players) ? players : [];

  const gamePlayers = playerList.map((p, i) => ({
    id: p.uid || i,
    name: p.name || `Player ${i + 1}`,
    role: i === imposterIndex ? "IMPOSTER" : "PLAYER",
  }));

  const currentUid = auth.currentUser?.uid;
  const isSoloMode = isDemoMode || !gamePlayers.some((p) => p.id === currentUid);
  const myPlayer = isSoloMode ? null : (gamePlayers.find((p) => p.id === currentUid) || gamePlayers[0]);
  const isImposter = myPlayer?.role === "IMPOSTER";

  const [revealed, setRevealed] = useState(false);
  const [soloIndex, setSoloIndex] = useState(0);

  const soloPlayer = gamePlayers[soloIndex];
  const soloIsImposter = soloPlayer?.role === "IMPOSTER";
  const activePlayer = isSoloMode ? soloPlayer : myPlayer;
  const activeIsImposter = isSoloMode ? soloIsImposter : isImposter;

  const clueList = topic?.clues ? topic.clues : (topic?.clue ? [topic.clue] : []);

  const goNext = () => {
    const nextParams = { roomCode, course, players: gamePlayers, topic, imposterIndex, isHost, isDemoMode, gameId };
    if (isSoloMode) {
      if (soloIndex < gamePlayers.length - 1) {
        setSoloIndex(soloIndex + 1);
        setRevealed(false);
      } else {
        navigation.navigate("Discussion", nextParams);
      }
    } else {
      navigation.navigate("Discussion", nextParams);
    }
  };

  const isLastSolo = isSoloMode && soloIndex === gamePlayers.length - 1;

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: "transparent" }]}>
          <Ionicons name="card-outline" size={18} color={colors.primary} />
          <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>ROLE REVEAL</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {!revealed ? (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <View style={[styles.courseBadge, { borderColor: colors.border, backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : colors.primaryLight }]}>
                  <Ionicons name="school-outline" size={11} color={colors.primary} />
                  <Text style={[styles.courseBadgeText, typography.sub8, { color: colors.primary }]}>{course}</Text>
                </View>
                {isSoloMode && (
                  <View style={styles.dotRow}>
                    {gamePlayers.map((_, idx) => (
                      <View key={idx} style={[styles.dot, { backgroundColor: colors.border }, idx < soloIndex && { backgroundColor: "rgba(20,101,241,0.4)" }, idx === soloIndex && { backgroundColor: colors.primary }]} />
                    ))}
                  </View>
                )}
              </View>

              <View style={[styles.avatarLarge, { backgroundColor: colors.primaryLight, shadowColor: colors.primary }]}>
                <Text style={[styles.avatarLargeText, typography.h2, { color: colors.primary }]}>
                  {activePlayer?.name?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>

              <Text style={[styles.playerNameLarge, typography.h3, { color: colors.textPrimary }]}>{activePlayer?.name}</Text>
              <Text style={[styles.hiddenSub, typography.body2, { color: colors.textSecondary }]}>
                {isSoloMode
                  ? "Hand the device — then tap to reveal your card"
                  : "Tap to view your secret role. Keep it hidden!"}
              </Text>

              <TouchableOpacity onPress={() => setRevealed(true)} activeOpacity={0.85} style={styles.revealBtnWrap}>
                <LinearGradient colors={colors.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.revealBtn}>
                  <Ionicons name="eye-outline" size={20} color="#FFF" />
                  <Text style={[styles.revealBtnText, typography.btn1]}>Reveal My Card</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[
              styles.card,
              activeIsImposter ? styles.cardRed : styles.cardGreen,
              {
                backgroundColor: activeIsImposter
                  ? (colors.isDark ? "rgba(211,47,47,0.12)" : "#FEF2F2")
                  : (colors.isDark ? "rgba(0,185,111,0.12)" : "#ECFDF5"),
                borderColor: activeIsImposter ? colors.error : colors.success
              }
            ]}>
              <View style={styles.cardTop}>
                <Text style={[styles.playerNameSmall, typography.sub7, { color: colors.textSecondary }]}>{activePlayer?.name}</Text>
                {isSoloMode && <Text style={[styles.stepLabel, typography.body3, { color: colors.textSecondary }]}>{soloIndex + 1} / {gamePlayers.length}</Text>}
              </View>

              {activeIsImposter ? (
                <View style={styles.roleWrap}>
                  <View style={styles.imposterIconWrap}>
                    <Ionicons name="alert-circle" size={52} color={colors.error} />
                  </View>
                  <Text style={[styles.youAre, typography.sub2, { color: colors.textSecondary }]}>YOU ARE THE</Text>
                  <Text style={[styles.roleTitleRed, typography.h1, { color: colors.error }]}>IMPOSTER</Text>
                  {clueList.length > 0 && (
                    <>
                      <Text style={[styles.clueIntro, typography.body2, { color: colors.textSecondary }]}>
                        {clueList.length > 1 ? "Guess the topic using these clues:" : "Guess the topic using this clue:"}
                      </Text>
                      <View style={styles.clueList}>
                        {clueList.map((clue, i) => (
                          <View key={i} style={[styles.clueItem, { backgroundColor: colors.isDark ? "#000000" : "#FFFFFF", borderColor: colors.border }]}>
                            <View style={[styles.clueNumber, { backgroundColor: colors.isDark ? "rgba(211,47,47,0.15)" : "#FEF2F2" }]}>
                              <Text style={[styles.clueNumberText, typography.btn2, { color: colors.error }]}>{String(i + 1).padStart(2, "0")}</Text>
                            </View>
                            <Text style={[styles.clueText, typography.body1, { color: colors.textPrimary }]}>{clue}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.roleWrap}>
                  <Ionicons name="checkmark-circle" size={52} color={colors.success} style={{ marginBottom: 12 }} />
                  <Text style={[styles.youAre, typography.sub2, { color: colors.textSecondary }]}>YOUR SECRET TOPIC IS</Text>
                  <LinearGradient colors={colors.isDark ? ["rgba(0,185,111,0.15)", "rgba(0,185,111,0.02)"] : ["#ECFDF5", "#F0FDF4"]} style={[styles.topicBox, { borderColor: colors.isDark ? "rgba(0,185,111,0.25)" : "rgba(16,185,129,0.2)" }]}>
                    <Text style={[styles.topicAnswer, typography.h2, { color: colors.success }]}>{topic?.answer}</Text>
                  </LinearGradient>
                  <Text style={[styles.topicHint, typography.body2, { color: colors.textSecondary }]}>
                    Describe it in <Text style={{ color: colors.success, fontWeight: "bold" }}>one word</Text>. Don't let the imposter guess it.
                  </Text>
                </View>
              )}

              <TouchableOpacity onPress={goNext} activeOpacity={0.85} style={styles.nextBtnWrap}>
                {isSoloMode ? (
                  <View style={[styles.nextBtnGhost, { backgroundColor: colors.isDark ? "rgba(20,101,241,0.12)" : colors.primaryLight, borderColor: colors.border }]}>
                    <Ionicons name={isLastSolo ? "people" : "phone-portrait-outline"} size={18} color={colors.primary} />
                    <Text style={[styles.nextBtnGhostText, typography.btn2, { color: colors.primary }]}>
                      {isLastSolo ? "Start Discussion" : "Hide & Pass Device"}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </View>
                ) : (
                  <LinearGradient colors={colors.gradientSuccess} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nextBtn}>
                    <Ionicons name="checkmark-done-outline" size={18} color="#FFF" />
                    <Text style={[styles.nextBtnText, typography.btn1]}>Proceed to Discussion</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 18, borderBottomWidth: 1, borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: { fontSize: 15, fontWeight: "900", color: "#0F172A", letterSpacing: 2.5 },
  scroll: { padding: 20, flexGrow: 1, justifyContent: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E2E8F0",
    borderRadius: 24, padding: 24, alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardRed: { backgroundColor: "#FEF2F2", borderColor: "rgba(239,68,68,0.25)" },
  cardGreen: { backgroundColor: "#ECFDF5", borderColor: "rgba(16,185,129,0.2)" },
  cardTop: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    width: "100%", marginBottom: 24,
  },
  courseBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderColor: "rgba(37,99,235,0.15)",
    backgroundColor: "#EFF6FF",
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 10,
  },
  courseBadgeText: { color: "#2563EB", fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  dotRow: { flexDirection: "row", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#E2E8F0" },
  dotPast: { backgroundColor: "rgba(37,99,235,0.4)" },
  dotActive: { backgroundColor: "#2563EB" },
  playerNameSmall: { fontSize: 12, fontWeight: "700", color: "#64748B", letterSpacing: 1, textTransform: "uppercase" },
  stepLabel: { fontSize: 11, fontWeight: "700", color: "#64748B" },

  avatarLarge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#EFF6FF",
    justifyContent: "center", alignItems: "center", marginBottom: 18,
    shadowColor: "#2563EB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  avatarLargeText: { color: "#2563EB", fontSize: 34, fontWeight: "900" },
  playerNameLarge: { fontSize: 30, fontWeight: "900", color: "#0F172A", letterSpacing: 0.5, marginBottom: 10 },
  hiddenSub: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 18, marginBottom: 32 },

  revealBtnWrap: { borderRadius: 16, overflow: "hidden", width: "100%" },
  revealBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 17 },
  revealBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800", letterSpacing: 1 },

  roleWrap: { alignItems: "center", width: "100%" },
  imposterIconWrap: { marginBottom: 8 },
  youAre: { fontSize: 11, fontWeight: "700", color: "#64748B", letterSpacing: 2, marginBottom: 8 },
  roleTitleRed: { fontSize: 46, fontWeight: "900", color: "#EF4444", letterSpacing: 4, marginBottom: 16 },
  clueIntro: { fontSize: 12, color: "#64748B", marginBottom: 16, letterSpacing: 0.5, textTransform: "uppercase" },
  clueList: { width: "100%", gap: 8, marginBottom: 24 },
  clueItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(239,68,68,0.15)",
    borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16,
  },
  clueNumber: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "#FEF2F2", justifyContent: "center", alignItems: "center",
  },
  clueNumberText: { color: "#EF4444", fontSize: 11, fontWeight: "900" },
  clueText: { color: "#374151", fontSize: 14, fontWeight: "600", flex: 1 },

  topicBox: {
    borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", borderRadius: 18,
    width: "100%", paddingVertical: 26, paddingHorizontal: 20, alignItems: "center", marginBottom: 14, marginTop: 8,
  },
  topicAnswer: { fontSize: 34, fontWeight: "900", color: "#10B981", letterSpacing: 1, textAlign: "center" },
  topicHint: { fontSize: 13, color: "#4B5563", textAlign: "center", lineHeight: 18, marginBottom: 24 },

  nextBtnWrap: { width: "100%", borderRadius: 16, overflow: "hidden" },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  nextBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800", letterSpacing: 0.8 },
  nextBtnGhost: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "rgba(37,99,235,0.15)",
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18,
  },
  nextBtnGhostText: { flex: 1, color: "#2563EB", fontSize: 14, fontWeight: "700" },
});
