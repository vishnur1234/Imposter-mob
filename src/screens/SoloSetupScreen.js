import React, { useState } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, SafeAreaView, Alert, TextInput, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { generateTopic } from "../services/generateTopic";
import { useTheme } from "../context/ThemeContext";

export default function SoloSetupScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [course, setCourse] = useState("ACCA");
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState(Array(4).fill(""));
  const [loading, setLoading] = useState(false);

  const handleCountChange = (n) => {
    setPlayerCount(n);
    setPlayerNames((prev) => {
      const updated = [...prev];
      while (updated.length < n) updated.push("");
      return updated.slice(0, n);
    });
  };

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const topic = await generateTopic(course);
      const players = playerNames.map((name, i) => ({
        uid: `solo-${i}`,
        name: name.trim() || `Player ${i + 1}`,
      }));
      const imposterIndex = Math.floor(Math.random() * players.length);
      navigation.navigate("RoleReveal", { course, players, topic, imposterIndex });
    } catch (e) {
      Alert.alert("Error", "Failed to generate game topic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>PLAYERS SETUP</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

            {/* Course */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="school-outline" size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, typography.sub2, { color: colors.primary }]}>SELECT COURSE</Text>
              </View>
              <View style={styles.pillRow}>
                {["ACCA", "CMA"].map((item) => (
                  <TouchableOpacity key={item} onPress={() => setCourse(item)} activeOpacity={0.8} style={{ flex: 1 }}>
                    {course === item ? (
                      <LinearGradient colors={colors.gradientBtn} style={styles.pillActive}>
                        <Text style={[styles.pillTextActive, typography.btn2]}>{item}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.pillInactive, { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }]}>
                        <Text style={[styles.pillTextInactive, typography.btn2, { color: colors.textSecondary }]}>{item}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Player count */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="people-outline" size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, typography.sub2, { color: colors.primary }]}>NUMBER OF PLAYERS</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <TouchableOpacity
                      key={n}
                      onPress={() => handleCountChange(n)}
                      style={[
                        styles.countCircle,
                        playerCount === n
                          ? { backgroundColor: colors.primary, borderColor: colors.primary }
                          : { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }
                      ]}
                    >
                      <Text style={[styles.countText, typography.h5, { color: playerCount === n ? "#FFFFFF" : colors.textSecondary }]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Names */}
            <View style={[
              styles.section,
              {
                backgroundColor: colors.isDark ? "rgba(20,101,241,0.08)" : "rgba(37,99,235,0.05)",
                borderColor: colors.isDark ? "rgba(20,101,241,0.3)" : "rgba(37,99,235,0.15)"
              }
            ]}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="person-outline" size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, typography.sub2, { color: colors.primary }]}>PLAYER NAMES</Text>
              </View>
              {playerNames.map((name, i) => (
                <View key={i} style={styles.nameRow}>
                  <View style={[styles.nameAvatar, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.nameAvatarText, typography.btn2, { color: colors.isDark ? "#ffffff" : colors.primary }]}>
                      {name.trim() ? name.trim()[0].toUpperCase() : i + 1}
                    </Text>
                  </View>
                  <TextInput
                    value={name}
                    onChangeText={(v) => {
                      const u = [...playerNames];
                      u[i] = v;
                      setPlayerNames(u);
                    }}
                    placeholder={`Player ${i + 1}`}
                    placeholderTextColor={colors.textDisabled}
                    style={[styles.nameInput, typography.body2, { backgroundColor: colors.isDark ? "#000000" : "#FFFFFF", borderColor: colors.border, color: colors.textPrimary }]}
                    maxLength={20}
                  />
                </View>
              ))}
            </View>

            {/* Start Button */}
            <TouchableOpacity onPress={handleStartGame} disabled={loading} activeOpacity={0.85} style={styles.startBtnWrap}>
              <LinearGradient colors={loading ? [colors.textDisabled, colors.textDisabled] : colors.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
                {loading
                  ? <><ActivityIndicator size="small" color="rgba(255,255,255,0.6)" /><Text style={[styles.startBtnText, typography.btn1]}>GENERATING…</Text></>
                  : <><Ionicons name="play-circle-outline" size={22} color="#FFF" /><Text style={[styles.startBtnText, typography.btn1]}>START GAME</Text></>
                }
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1, borderColor: "#E2E8F0",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 15, fontWeight: "900", color: "#0F172A", letterSpacing: 2.5 },
  scroll: { padding: 20, paddingBottom: 40 },

  section: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E2E8F0",
    borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  namesSection: {
    backgroundColor: "#EFF6FF",
    borderColor: "rgba(37,99,235,0.15)",
  },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: "700", color: "#2563EB", letterSpacing: 1.5 },

  pillRow: { flexDirection: "row", gap: 12 },
  pillActive: { height: 48, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  pillInactive: {
    height: 48, borderRadius: 13, borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    justifyContent: "center", alignItems: "center",
  },
  pillTextActive: { color: "#FFF", fontWeight: "800", letterSpacing: 1 },
  pillTextInactive: { color: "#64748B", fontWeight: "600" },

  countCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#F8FAFC",
    borderWidth: 1, borderColor: "#E2E8F0",
    justifyContent: "center", alignItems: "center",
  },
  countCircleActive: { backgroundColor: "#2563EB", borderColor: "#3B82F6" },
  countText: { color: "#64748B", fontSize: 15, fontWeight: "700" },
  countTextActive: { color: "#FFF" },

  nameRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  nameAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center",
  },
  nameAvatarText: { color: "#2563EB", fontSize: 12, fontWeight: "800" },
  nameInput: {
    flex: 1, backgroundColor: "#F8FAFC",
    borderWidth: 1, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    color: "#0F172A", fontSize: 14,
  },

  startBtnWrap: { borderRadius: 18, overflow: "hidden", marginTop: 8 },
  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 12, paddingVertical: 18,
  },
  startBtnText: { color: "#FFF", fontSize: 15, fontWeight: "900", letterSpacing: 1.5 },
});
