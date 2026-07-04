import React, { useState, useRef } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  SafeAreaView, Animated, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const RULES_STEPS = [
  {
    id: 1,
    emoji: "🎭",
    title: "Role Reveal",
    subtitle: "Who are you in the game?",
    accentColor: "#8B5CF6",
    bgColor: "rgba(139,92,246,0.08)",
    borderColor: "rgba(139,92,246,0.25)",
    details: [
      "At the start of each round, every player is secretly assigned a role.",
      "👤 Students receive the secret topic — a specific ACCA/CMA exam term.",
      "🕵️ The Imposter receives only a vague clue — NOT the exact topic.",
      "No one knows who the Imposter is. Keep your role secret!",
    ],
  },
  {
    id: 2,
    emoji: "📝",
    title: "Clue Round",
    subtitle: "Give one-word answers only",
    accentColor: "#0EA5E9",
    bgColor: "rgba(14,165,233,0.08)",
    borderColor: "rgba(14,165,233,0.25)",
    details: [
      "Each player takes a turn to give exactly ONE WORD as a clue about the topic.",
      "⏱️ Clue Timer: Active turns are limited to 1 Min (60s) or 2 Min (120s), set by the host.",
      "⚠️ Turn Timeout: If the timer runs out, your turn is passed ('PASS') automatically.",
      "Students describe the topic subtly. Imposters must bluff to blend in without knowing the topic.",
    ],
  },
  {
    id: 3,
    emoji: "🕵️",
    title: "Discussion & Voting",
    subtitle: "Find the Imposter among you",
    accentColor: "#F59E0B",
    bgColor: "rgba(245,158,11,0.08)",
    borderColor: "rgba(245,158,11,0.25)",
    details: [
      "After all clues are given, players debate and vote on who they believe is the Imposter.",
      "👮 Caught on Ties: In a voting tie (e.g. 1-1 in 2-player mode), the Imposter is caught!",
      "If the Imposter receives the most (or tied most) votes, they are caught and must play the Bonus Round.",
    ],
  },
  {
    id: 4,
    emoji: "🎯",
    title: "Imposter Bonus Round",
    subtitle: "The Imposter's last chance to win",
    accentColor: "#EF4444",
    bgColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.25)",
    details: [
      "If the Imposter is caught, they get ONE final chance to save themselves.",
      "They must guess the secret topic that the students were describing.",
      "Correct guess: The Imposter escapes and survives the round, stealing the pot!",
    ],
  },
  {
    id: 5,
    emoji: "🏆",
    title: "Scoring & Betting System",
    subtitle: "How coins are wagered and won",
    accentColor: "#10B981",
    bgColor: "rgba(16,185,129,0.08)",
    borderColor: "rgba(16,185,129,0.25)",
    details: [
      "🎟️ Entry Fee: Customizable by the host (default: 50 coins), deducted at the start.",
      "🛡️ Imposter Escapes: The Imposter wins the entire pot (Players * Entry Fee). Students lose their entry fee.",
      "🎯 Imposter Caught: Correct voting students divide the total pot (everyone's entry fee) equally.",
      "💰 The Pot: Pot = Sum of all players' entry fees.",
      "❌ Loser Penalty: Incorrect voters and the caught Imposter receive a 0 payout (losing their entry fee).",
    ],
  },
];

const ROLES = [
  {
    role: "Student",
    icon: "school",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    objective: "Identify the Imposter before they fool everyone. Give smart clues, discuss wisely, and vote correctly to earn 100 points.",
    tips: ["Give related but not too obvious clues", "Watch for vague or off-topic answers", "Coordinate with other students subtly"],
  },
  {
    role: "Imposter",
    icon: "person-remove",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    objective: "Stay hidden! You don't know the topic — only a vague clue. Blend in with students by giving convincing answers and avoid being voted out.",
    tips: ["Listen carefully to others' clues to infer the topic", "Stay confident — don't hesitate too long", "Use broad and plausible words to stay safe"],
  },
];

function AccordionStep({ step, colors, typography }) {
  const [expanded, setExpanded] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    if (expanded) {
      Animated.parallel([
        Animated.timing(animHeight, { toValue: 0, duration: 220, useNativeDriver: false }),
        Animated.timing(animOpacity, { toValue: 0, duration: 150, useNativeDriver: false }),
      ]).start(() => setExpanded(false));
    } else {
      setExpanded(true);
      Animated.parallel([
        Animated.timing(animHeight, { toValue: 1, duration: 280, useNativeDriver: false }),
        Animated.timing(animOpacity, { toValue: 1, duration: 250, useNativeDriver: false }),
      ]).start();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggle}
      style={[
        styles.stepCard,
        {
          backgroundColor: expanded ? step.bgColor : colors.surface,
          borderColor: expanded ? step.accentColor : colors.border,
        }
      ]}
    >
      {/* Step Header */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepNumBadge, { backgroundColor: step.bgColor, borderColor: step.borderColor }]}>
          <Text style={styles.stepEmoji}>{step.emoji}</Text>
        </View>
        <View style={styles.stepTitleGroup}>
          <Text style={[typography.h5, { color: colors.textPrimary, fontWeight: "800" }]}>{step.title}</Text>
          <Text style={[typography.sub8, { color: colors.textSecondary, marginTop: 2 }]}>{step.subtitle}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={expanded ? step.accentColor : colors.textSecondary}
        />
      </View>

      {/* Expandable Details */}
      {expanded && (
        <Animated.View style={{ opacity: animOpacity }}>
          <View style={[styles.stepDivider, { borderColor: step.borderColor }]} />
          {step.details.map((detail, i) => (
            <View key={i} style={styles.detailRow}>
              <View style={[styles.detailDot, { backgroundColor: step.accentColor }]} />
              <Text style={[typography.body1, { color: colors.textPrimary, flex: 1, lineHeight: 22 }]}>
                {detail}
              </Text>
            </View>
          ))}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

export default function GameRulesScreen({ navigation }) {
  const { colors, typography } = useTheme();

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: "transparent" }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>GAME RULES</Text>
            <Text style={[styles.headerSubtitle, typography.sub8, { color: colors.textSecondary }]}>How to Play the Imposter Game</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Intro Card */}
          <LinearGradient
            colors={colors.isDark ? ["#1E1B4B", "#312E81"] : ["#EEF2FF", "#E0E7FF"]}
            style={[styles.introCard, { borderColor: "rgba(99,102,241,0.3)" }]}
          >
            <MaterialCommunityIcons name="gamepad-variant" size={40} color="#6366F1" />
            <Text style={[typography.h3, { color: colors.isDark ? "#E0E7FF" : "#312E81", fontWeight: "900", textAlign: "center", marginTop: 10 }]}>
              Welcome to the Imposter Game!
            </Text>
            <Text style={[typography.body1, { color: colors.isDark ? "#A5B4FC" : "#4338CA", textAlign: "center", marginTop: 8, lineHeight: 22 }]}>
              A multiplayer detective game where ACCA & CMA students test their knowledge while hiding or finding the Imposter in their group.
            </Text>
            <View style={styles.introStats}>
              {[
                { icon: "people", val: "3–8", label: "Players" },
                { icon: "time", val: "Adjustable", label: "Turn Timer" },
                { icon: "star", val: "100", label: "Max Points" },
              ].map((s, i) => (
                <View key={i} style={[styles.introStat, { backgroundColor: colors.isDark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.2)" }]}>
                  <Ionicons name={s.icon} size={18} color="#6366F1" />
                  <Text numberOfLines={1} adjustsFontSizeToFit style={[{ color: colors.isDark ? "#E0E7FF" : "#312E81", fontWeight: "900", textAlign: "center", fontSize: 11, width: "100%" }]}>{s.val}</Text>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={[{ color: colors.isDark ? "#A5B4FC" : "#6366F1", textAlign: "center", fontSize: 8.5, width: "100%" }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Section title */}
          <View style={styles.sectionLabel}>
            <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
            <Text style={[typography.sub2, { color: colors.textSecondary, letterSpacing: 1.5, paddingHorizontal: 10 }]}>GAME PHASES</Text>
            <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Accordion Steps */}
          {RULES_STEPS.map((step) => (
            <AccordionStep key={step.id} step={step} colors={colors} typography={typography} />
          ))}

          {/* Role Cards Section */}
          <View style={styles.sectionLabel}>
            <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
            <Text style={[typography.sub2, { color: colors.textSecondary, letterSpacing: 1.5, paddingHorizontal: 10 }]}>ROLES</Text>
            <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
          </View>

          {ROLES.map((r) => (
            <View key={r.role} style={[styles.roleCard, { backgroundColor: r.bg, borderColor: r.border }]}>
              <View style={styles.roleHeader}>
                <View style={[styles.roleIconCircle, { backgroundColor: r.bg, borderColor: r.border }]}>
                  <Ionicons name={r.icon} size={22} color={r.color} />
                </View>
                <Text style={[typography.h4, { color: r.color, fontWeight: "900" }]}>{r.role}</Text>
              </View>
              <Text style={[typography.body1, { color: colors.textPrimary, lineHeight: 22, marginTop: 8 }]}>
                {r.objective}
              </Text>
              <View style={[styles.tipsDivider, { borderColor: r.border }]} />
              <Text style={[typography.sub8, { color: r.color, letterSpacing: 1, marginBottom: 8 }]}>PRO TIPS</Text>
              {r.tips.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={15} color={r.color} />
                  <Text style={[typography.body2, { color: colors.textSecondary, flex: 1 }]}>{tip}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Footer */}
          <View style={[styles.footerBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="game-controller" size={20} color={colors.primary} />
            <Text style={[typography.body2, { color: colors.textSecondary, flex: 1, lineHeight: 20 }]}>
              Good luck! Remember — the best players combine sharp knowledge with keen observation.
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    borderWidth: 1, justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 15, fontWeight: "900", letterSpacing: 2.5 },
  headerSubtitle: { fontSize: 9, letterSpacing: 1, marginTop: 1, textAlign: "center" },

  scrollContent: { padding: 20, gap: 14, paddingBottom: 40 },

  introCard: {
    borderRadius: 20, borderWidth: 1.5,
    padding: 24, alignItems: "center",
  },
  introStats: { flexDirection: "row", gap: 10, marginTop: 18, width: "100%" },
  introStat: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    padding: 12, alignItems: "center", justifyContent: "center", gap: 4,
  },

  sectionLabel: {
    flexDirection: "row", alignItems: "center",
    marginTop: 4, marginBottom: -2,
  },
  sectionLine: { flex: 1, height: 1 },

  stepCard: {
    borderRadius: 16, borderWidth: 1.5,
    padding: 16, overflow: "hidden",
  },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNumBadge: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.5, justifyContent: "center", alignItems: "center",
  },
  stepEmoji: { fontSize: 20 },
  stepTitleGroup: { flex: 1 },
  stepDivider: { borderTopWidth: 1, marginTop: 14, marginBottom: 12 },
  detailRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  detailDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },

  roleCard: {
    borderRadius: 16, borderWidth: 1.5, padding: 18,
  },
  roleHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  roleIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.5, justifyContent: "center", alignItems: "center",
  },
  tipsDivider: { borderTopWidth: 1, marginVertical: 12 },
  tipRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 },

  footerBanner: {
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    borderRadius: 14, borderWidth: 1, padding: 16,
    marginTop: 6,
  },
});
