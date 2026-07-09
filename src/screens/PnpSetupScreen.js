import React, { useState } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  SafeAreaView, Alert, TextInput, ActivityIndicator, Modal, Switch,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getLocalTopic } from "../services/generateTopic";
import { useTheme } from "../context/ThemeContext";

const CATEGORIES = [
  { id: "ACCA", label: "ACCA (Finance)" },
  { id: "CMA", label: "CMA (Finance)" },
  { id: "general", label: "General" },
  { id: "bank", label: "Bank" },
  { id: "movie", label: "Movie" },
  { id: "sports", label: "Sports" },
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
  { id: "food", label: "Food" },
  { id: "music", label: "Music" },
];

const DURATIONS = [
  { value: 0, label: "No limit" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 180, label: "3 minutes" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
];

export default function PnpSetupScreen({ navigation }) {
  const { colors, typography } = useTheme();

  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);
  const [imposterCount, setImposterCount] = useState(1);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
  const [duration, setDuration] = useState(180);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);

  const maxImposters = Math.max(1, Math.floor((playerCount - 1) / 2));
  const safeImposters = Math.min(imposterCount, maxImposters);

  const handlePlayerCountChange = (n) => {
    setPlayerCount(n);
    setPlayerNames((prev) => {
      const updated = [...prev];
      while (updated.length < n) updated.push("");
      return updated.slice(0, n);
    });
    if (imposterCount > Math.max(1, Math.floor((n - 1) / 2))) {
      setImposterCount(1);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const topic = getLocalTopic(selectedCategory);
      const players = playerNames.slice(0, playerCount).map((name, i) => ({
        uid: `pnp-${i}`,
        name: name.trim() || `Player ${i + 1}`,
      }));

      // Pick imposter indices randomly
      const shuffledIndices = [...Array(players.length).keys()].sort(() => Math.random() - 0.5);
      const imposterIndices = shuffledIndices.slice(0, safeImposters);

      navigation.navigate("PnpRoleReveal", {
        players,
        topic,
        imposterIndices,
        hintsEnabled,
        timeLimitEnabled,
        duration: timeLimitEnabled ? duration : 0,
        selectedCategory,
      });
    } catch (e) {
      Alert.alert("Error", "Failed to generate topic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoryLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label || "General";
  const durationLabel = DURATIONS.find((d) => d.value === duration)?.label || "3 minutes";

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>PASS & PLAY SETUP</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Info badge */}
            <View style={[styles.infoBadge, { backgroundColor: colors.isDark ? "rgba(20,101,241,0.1)" : "#EFF6FF", borderColor: colors.isDark ? "rgba(20,101,241,0.3)" : "rgba(37,99,235,0.15)" }]}>
              <Ionicons name="phone-portrait-outline" size={16} color={colors.primary} />
              <Text style={[typography.body3, { color: colors.primary, flex: 1 }]}>
                Everyone sits together. Pass the phone around — each player secretly views their role.
              </Text>
            </View>

            {/* ── Number of Players ── */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>☝️</Text>
                <Text style={[styles.sectionTitle, typography.sub2, { color: colors.primary }]}>NUMBER OF PLAYERS</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <TouchableOpacity
                      key={n}
                      onPress={() => handlePlayerCountChange(n)}
                      style={[
                        styles.countCircle,
                        playerCount === n
                          ? { backgroundColor: colors.primary, borderColor: colors.primary }
                          : { backgroundColor: colors.isDark ? "#000" : "#F8FAFC", borderColor: colors.border },
                      ]}
                    >
                      <Text style={[typography.h5, { color: playerCount === n ? "#FFF" : colors.textSecondary }]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* ── Player Names ── */}
            <View style={[styles.section, { backgroundColor: colors.isDark ? "rgba(20,101,241,0.06)" : "rgba(37,99,235,0.04)", borderColor: colors.isDark ? "rgba(20,101,241,0.25)" : "rgba(37,99,235,0.12)" }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>👤</Text>
                <Text style={[styles.sectionTitle, typography.sub2, { color: colors.primary }]}>PLAYER NAMES</Text>
              </View>
              {playerNames.slice(0, playerCount).map((name, i) => (
                <View key={i} style={styles.nameRow}>
                  <View style={[styles.nameAvatar, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[typography.btn2, { color: colors.isDark ? "#FFF" : colors.primary }]}>
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
                    maxLength={20}
                    style={[
                      styles.nameInput, typography.body2,
                      { backgroundColor: colors.isDark ? "#000" : "#FFF", borderColor: colors.border, color: colors.textPrimary },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* ── Settings Card ── */}
            <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>

              {/* Imposters */}
              <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingEmoji}>🤖</Text>
                  <Text style={[styles.settingLabel, typography.body1, { color: colors.textPrimary }]}>Imposters</Text>
                </View>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    onPress={() => setImposterCount(Math.max(1, safeImposters - 1))}
                    style={[styles.stepBtn, { borderColor: colors.border, backgroundColor: colors.isDark ? "#1a1a1a" : "#F1F5F9" }]}
                  >
                    <Ionicons name="remove" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={[styles.stepValue, typography.h5, { color: colors.textPrimary }]}>{safeImposters}</Text>
                  <TouchableOpacity
                    onPress={() => setImposterCount(Math.min(maxImposters, safeImposters + 1))}
                    style={[styles.stepBtn, { borderColor: colors.border, backgroundColor: colors.isDark ? "#1a1a1a" : "#F1F5F9" }]}
                  >
                    <Ionicons name="add" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category */}
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                style={[styles.settingRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingEmoji}>👀</Text>
                  <Text style={[styles.settingLabel, typography.body1, { color: colors.textPrimary }]}>Category</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{categoryLabel}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
                </View>
              </TouchableOpacity>

              {/* Hints for Imposter */}
              <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingEmoji}>🔍</Text>
                  <Text style={[styles.settingLabel, typography.body1, { color: colors.textPrimary }]}>Hints for Imposter</Text>
                </View>
                <Switch
                  value={hintsEnabled}
                  onValueChange={setHintsEnabled}
                  trackColor={{ false: colors.border, true: "#34C759" }}
                  thumbColor="#FFF"
                  ios_backgroundColor={colors.border}
                />
              </View>

              {/* Time Limit */}
              <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingEmoji}>⏰</Text>
                  <Text style={[styles.settingLabel, typography.body1, { color: colors.textPrimary }]}>Time Limit</Text>
                </View>
                <Switch
                  value={timeLimitEnabled}
                  onValueChange={setTimeLimitEnabled}
                  trackColor={{ false: colors.border, true: "#34C759" }}
                  thumbColor="#FFF"
                  ios_backgroundColor={colors.border}
                />
              </View>

              {/* Duration */}
              <TouchableOpacity
                onPress={timeLimitEnabled ? () => setShowDurationModal(true) : undefined}
                style={[styles.settingRow, { borderBottomColor: "transparent", opacity: timeLimitEnabled ? 1 : 0.4 }]}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingEmoji}>🕐</Text>
                  <Text style={[styles.settingLabel, typography.body1, { color: colors.textPrimary }]}>Duration</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{durationLabel}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Start Button */}
            <TouchableOpacity onPress={handleStart} disabled={loading} activeOpacity={0.85} style={styles.startWrap}>
              <LinearGradient
                colors={loading ? [colors.textDisabled, colors.textDisabled] : colors.gradientBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.startBtn}
              >
                {loading
                  ? <><ActivityIndicator size="small" color="rgba(255,255,255,0.7)" /><Text style={[typography.btn1, { color: "#FFF" }]}>GENERATING…</Text></>
                  : <><Ionicons name="play-circle-outline" size={22} color="#FFF" /><Text style={[typography.btn1, { color: "#FFF" }]}>START GAME</Text></>
                }
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>

          {/* Category Modal */}
          <Modal visible={showCategoryModal} transparent animationType="slide" onRequestClose={() => setShowCategoryModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
                <Text style={[styles.modalTitle, typography.h5, { color: colors.textPrimary }]}>Select Category</Text>
                <ScrollView style={{ marginTop: 8 }}>
                  {CATEGORIES.map((cat) => {
                    const isSel = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => { setSelectedCategory(cat.id); setShowCategoryModal(false); }}
                        style={[styles.modalOption, isSel && { backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : "#EFF6FF" }]}
                      >
                        <Text style={[styles.modalOptionText, typography.body1, { color: isSel ? colors.primary : colors.textPrimary }]}>
                          {cat.label}
                        </Text>
                        {isSel && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={[styles.modalCancel, { backgroundColor: colors.isDark ? "#1E1E1E" : "#F1F5F9" }]}>
                  <Text style={[typography.btn1, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Duration Modal */}
          <Modal visible={showDurationModal} transparent animationType="slide" onRequestClose={() => setShowDurationModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
                <Text style={[styles.modalTitle, typography.h5, { color: colors.textPrimary }]}>Discussion Duration</Text>
                <ScrollView style={{ marginTop: 8 }}>
                  {DURATIONS.map((d) => {
                    const isSel = duration === d.value;
                    return (
                      <TouchableOpacity
                        key={d.value}
                        onPress={() => { setDuration(d.value); setShowDurationModal(false); }}
                        style={[styles.modalOption, isSel && { backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : "#EFF6FF" }]}
                      >
                        <Text style={[styles.modalOptionText, typography.body1, { color: isSel ? colors.primary : colors.textPrimary }]}>
                          {d.label}
                        </Text>
                        {isSel && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity onPress={() => setShowDurationModal(false)} style={[styles.modalCancel, { backgroundColor: colors.isDark ? "#1E1E1E" : "#F1F5F9" }]}>
                  <Text style={[typography.btn1, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: { letterSpacing: 1.5 },
  scroll: { padding: 20, paddingBottom: 48 },
  infoBadge: {
    flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1,
    borderRadius: 14, padding: 14, marginBottom: 18,
  },
  section: { borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionEmoji: { fontSize: 16 },
  sectionTitle: { letterSpacing: 1 },
  countCircle: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  nameAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  nameInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  settingsCard: { borderWidth: 1, borderRadius: 22, overflow: "hidden", marginBottom: 20 },
  settingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingEmoji: { fontSize: 18, width: 26, textAlign: "center" },
  settingLabel: { fontSize: 15, fontWeight: "500" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  settingValue: { fontSize: 14 },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  stepValue: { minWidth: 24, textAlign: "center" },
  startWrap: { borderRadius: 18, overflow: "hidden" },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 18 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36, maxHeight: "70%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontWeight: "700", textAlign: "center", marginBottom: 8 },
  modalOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 2,
  },
  modalOptionText: { fontSize: 15, fontWeight: "500" },
  modalCancel: { marginTop: 12, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
});
