import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
  { value: 1, label: "1 minute" },
  { value: 2, label: "2 minutes" },
  { value: 3, label: "3 minutes" },
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
];

const DEFAULT_NAMES = (n) => Array.from({ length: n }, (_, i) => `Player ${i + 1}`);

export default function GameModeScreen({ navigation }) {
  const { colors, typography } = useTheme();

  // Mode selection
  const [mode, setMode] = useState("passplay");

  // Pass & Play settings
  const [playerCount, setPlayerCount] = useState(3);
  const [playerNames, setPlayerNames] = useState(DEFAULT_NAMES(3));
  const [editingIdx, setEditingIdx] = useState(null); // which name is being edited inline in modal
  const [imposterCount, setImposterCount] = useState(1);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);
  const [duration, setDuration] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState("ACCA");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showImpostersModal, setShowImpostersModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);

  const maxImposters = Math.max(1, Math.floor((playerCount - 1) / 2));
  const safeImposterCount = Math.min(imposterCount, maxImposters);
  const categoryLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label || "ACCA";

  const handlePlayerCountChange = (n) => {
    setPlayerCount(n);
    setPlayerNames((prev) => {
      const updated = [...prev];
      while (updated.length < n) updated.push(`Player ${updated.length + 1}`);
      return updated.slice(0, n);
    });
    if (imposterCount > Math.max(1, Math.floor((n - 1) / 2))) setImposterCount(1);
  };

  const handleStart = async () => {
    if (mode === "online") {
      navigation.navigate("MultiplayerLobby");
      return;
    }
    setLoading(true);
    try {
      const topic = getLocalTopic(selectedCategory);
      const players = playerNames.slice(0, playerCount).map((name, i) => ({
        uid: `pnp-${i}`,
        name: name.trim() || `Player ${i + 1}`,
      }));
      const shuffledIndices = [...Array(players.length).keys()].sort(() => Math.random() - 0.5);
      const imposterIndices = shuffledIndices.slice(0, safeImposterCount);

      navigation.navigate("PnpRoleReveal", {
        players,
        topic,
        imposterIndices,
        hintsEnabled,
        timeLimitEnabled,
        duration: timeLimitEnabled ? duration * 60 : 0,
        selectedCategory,
      });
    } catch (e) {
      Alert.alert("Error", "Failed to generate game topic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Setting row ──
  const renderRow = ({ emoji, label, value, onPress, isToggle, toggleValue, onToggle, isLast, disabled }) => (
    <TouchableOpacity
      onPress={isToggle ? undefined : onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={disabled}
      style={[
        styles.settingRow,
        { borderBottomColor: isLast ? "transparent" : colors.border, opacity: disabled ? 0.4 : 1 },
      ]}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingEmoji}>{emoji}</Text>
        <Text style={[styles.settingLabel, typography.body1, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: "#34C759" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.border}
        />
      ) : (
        <View style={styles.settingRight}>
          <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
        </View>
      )}
    </TouchableOpacity>
  );

  // ── Generic picker modal ──
  const renderPickerModal = ({ visible, onClose, title, items, selected, onSelect, renderLabel }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.pickerOverlay}>
        <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.pickerHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.pickerTitle, typography.h5, { color: colors.textPrimary }]}>{title}</Text>
          <ScrollView style={{ marginTop: 8 }}>
            {items.map((item, i) => {
              const val = typeof item === "object" ? (item.value ?? item.id) : item;
              const lbl = renderLabel ? renderLabel(item) : String(item);
              const isSel = val === selected;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => { onSelect(val); onClose(); }}
                  style={[styles.pickerOption, isSel && { backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : "#EFF6FF" }]}
                >
                  <Text style={[styles.pickerOptionText, typography.body1, { color: isSel ? colors.primary : colors.textPrimary }]}>
                    {lbl}
                  </Text>
                  {isSel && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.pickerCancelBtn, { backgroundColor: colors.isDark ? "#1E1E1E" : "#F1F5F9" }]}
          >
            <Text style={[typography.btn1, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>PLAY GAME</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Start Game Button */}
          <TouchableOpacity
            onPress={handleStart}
            disabled={loading}
            activeOpacity={0.88}
            style={styles.startBtnWrap}
          >
            <LinearGradient
              colors={loading ? [colors.textDisabled, colors.textDisabled] : colors.gradientBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtn}
            >
              {loading
                ? <><ActivityIndicator size="small" color="rgba(255,255,255,0.7)" /><Text style={[typography.btn1, { color: "#FFF" }]}>GENERATING…</Text></>
                : <><Ionicons name="play-circle" size={22} color="#FFF" /><Text style={[typography.btn1, { color: "#FFF" }]}>START GAME</Text></>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Mode Selector Cards */}
          <View style={styles.modeRow}>
            {/* Pass the phone */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setMode("passplay")}
              style={[
                styles.modeCard,
                {
                  borderColor: mode === "passplay" ? colors.primary : colors.border,
                  backgroundColor: mode === "passplay"
                    ? (colors.isDark ? "rgba(20,101,241,0.08)" : "#FFFFFF")
                    : (colors.isDark ? "#121212" : "#F8FAFC"),
                  borderWidth: mode === "passplay" ? 1.5 : 1,
                },
              ]}
            >
              <View style={[
                styles.modeCheck,
                { borderColor: mode === "passplay" ? colors.primary : colors.border, backgroundColor: mode === "passplay" ? colors.primary : "transparent" },
              ]}>
                {mode === "passplay" && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <Ionicons name="phone-portrait-outline" size={28} color={mode === "passplay" ? colors.textPrimary : colors.textDisabled} style={{ marginBottom: 6 }} />
              <Text style={[styles.modeCardTitle, { color: mode === "passplay" ? colors.textPrimary : colors.textSecondary, fontWeight: "700" }]}>
                Pass the phone
              </Text>
              <Text style={[styles.modeCardSub, { color: colors.textDisabled }]}>Everyone uses one screen</Text>
            </TouchableOpacity>

            {/* Play online */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate("MultiplayerLobby")}
              style={[
                styles.modeCard,
                {
                  borderColor: mode === "online" ? colors.primary : colors.border,
                  backgroundColor: mode === "online"
                    ? (colors.isDark ? "rgba(20,101,241,0.08)" : "#FFFFFF")
                    : (colors.isDark ? "#121212" : "#F8FAFC"),
                  borderWidth: mode === "online" ? 1.5 : 1,
                },
              ]}
            >
              <View style={[
                styles.modeCheck,
                { borderColor: mode === "online" ? colors.primary : colors.border, backgroundColor: mode === "online" ? colors.primary : "transparent" },
              ]}>
                {mode === "online" && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
              <Ionicons name="wifi" size={28} color={mode === "online" ? colors.textPrimary : colors.textDisabled} style={{ marginBottom: 6 }} />
              <Text style={[styles.modeCardTitle, { color: mode === "online" ? colors.textPrimary : colors.textSecondary, fontWeight: "700" }]}>
                Play online
              </Text>
              <Text style={[styles.modeCardSub, { color: colors.textDisabled }]}>Play together from anywhere</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={[styles.descText, { color: colors.textSecondary }]}>
            {mode === "passplay"
              ? "Explain the rules, then pass the phone around. Each player secretly views their role — then the suspicion begins."
              : "Create or join a room. Every player uses their own phone to play together online in real time."}
          </Text>

          {/* Settings — Pass the phone mode */}
          {mode === "passplay" && (
            <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {renderRow({ emoji: "☝️", label: "Players", value: `${playerCount}`, onPress: () => { setEditingIdx(null); setShowPlayersModal(true); } })}
              {renderRow({ emoji: "🤖", label: "Imposters", value: `${safeImposterCount}`, onPress: () => setShowImpostersModal(true) })}
              {renderRow({ emoji: "🔍", label: "Hints for Imposter", isToggle: true, toggleValue: hintsEnabled, onToggle: setHintsEnabled })}
              {renderRow({
                emoji: "👀",
                label: "Categories",
                value: `${categoryLabel.split(" ")[0]} +${CATEGORIES.length - 1}`,
                onPress: () => setShowCategoriesModal(true),
              })}
              {renderRow({ emoji: "⏰", label: "Time Limit", isToggle: true, toggleValue: timeLimitEnabled, onToggle: setTimeLimitEnabled })}
              {renderRow({
                emoji: "🕐",
                label: "Duration",
                value: `${duration} ${duration === 1 ? "minute" : "minutes"}`,
                onPress: timeLimitEnabled ? () => setShowDurationModal(true) : undefined,
                isLast: true,
                disabled: !timeLimitEnabled,
              })}
            </View>
          )}

        </ScrollView>

        {/* ── Players Modal: Count picker + editable names ── */}
        <Modal visible={showPlayersModal} transparent animationType="slide" onRequestClose={() => setShowPlayersModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={styles.pickerOverlay}>
              <View style={[styles.playersSheet, { backgroundColor: colors.isDark ? "#1A1A1A" : "#FFFFFF" }]}>
                <View style={[styles.pickerHandle, { backgroundColor: colors.border }]} />
                <Text style={[styles.pickerTitle, typography.h5, { color: colors.textPrimary }]}>Number of Players</Text>

                {/* Count selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 4 }}>
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <TouchableOpacity
                        key={n}
                        onPress={() => handlePlayerCountChange(n)}
                        style={[
                          styles.countCircle,
                          playerCount === n
                            ? { backgroundColor: colors.primary, borderColor: colors.primary }
                            : { backgroundColor: colors.isDark ? "#000" : "#F1F5F9", borderColor: colors.border },
                        ]}
                      >
                        <Text style={[typography.h5, { color: playerCount === n ? "#FFF" : colors.textSecondary }]}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <View style={[styles.namesHeader, { borderBottomColor: colors.border }]}>
                  <Ionicons name="people-outline" size={15} color={colors.primary} />
                  <Text style={[typography.sub2, { color: colors.primary, letterSpacing: 1 }]}>PLAYER NAMES</Text>
                </View>

                {/* Player name list with edit icons */}
                <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {playerNames.slice(0, playerCount).map((name, i) => (
                    <View
                      key={i}
                      style={[styles.nameRow, { borderBottomColor: colors.border }]}
                    >
                      <View style={[styles.nameAvatar, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[typography.btn2, { color: colors.isDark ? "#FFF" : colors.primary }]}>
                          {name.trim() ? name.trim()[0].toUpperCase() : `${i + 1}`}
                        </Text>
                      </View>

                      {editingIdx === i ? (
                        <TextInput
                          autoFocus
                          value={name}
                          onChangeText={(v) => {
                            const u = [...playerNames];
                            u[i] = v;
                            setPlayerNames(u);
                          }}
                          onBlur={() => setEditingIdx(null)}
                          onSubmitEditing={() => setEditingIdx(null)}
                          placeholder={`Player ${i + 1}`}
                          placeholderTextColor={colors.textDisabled}
                          maxLength={20}
                          returnKeyType="done"
                          style={[
                            styles.nameInput, typography.body1,
                            { borderColor: colors.primary, color: colors.textPrimary, backgroundColor: colors.isDark ? "#000" : "#F8FAFC" },
                          ]}
                        />
                      ) : (
                        <Text style={[typography.body1, { color: colors.textPrimary, flex: 1, paddingVertical: 4 }]}>
                          {name || `Player ${i + 1}`}
                        </Text>
                      )}

                      <TouchableOpacity
                        onPress={() => setEditingIdx(editingIdx === i ? null : i)}
                        style={[styles.editBtn, { backgroundColor: editingIdx === i ? colors.primary + "22" : (colors.isDark ? "#222" : "#F1F5F9") }]}
                      >
                        <Ionicons name={editingIdx === i ? "checkmark" : "pencil"} size={14} color={editingIdx === i ? colors.primary : colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => { setEditingIdx(null); setShowPlayersModal(false); }}
                  style={[styles.pickerCancelBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                >
                  <Text style={[typography.btn1, { color: "#FFF" }]}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Imposters Modal */}
        {renderPickerModal({
          visible: showImpostersModal,
          onClose: () => setShowImpostersModal(false),
          title: "Number of Imposters",
          items: Array.from({ length: maxImposters }, (_, i) => ({ value: i + 1, id: i + 1 })),
          selected: safeImposterCount,
          onSelect: setImposterCount,
          renderLabel: (item) => `${item.value} ${item.value === 1 ? "Imposter" : "Imposters"}`,
        })}

        {/* Categories Modal */}
        {renderPickerModal({
          visible: showCategoriesModal,
          onClose: () => setShowCategoriesModal(false),
          title: "Select Category",
          items: CATEGORIES,
          selected: selectedCategory,
          onSelect: setSelectedCategory,
          renderLabel: (item) => item.label,
        })}

        {/* Duration Modal */}
        {renderPickerModal({
          visible: showDurationModal,
          onClose: () => setShowDurationModal(false),
          title: "Discussion Duration",
          items: DURATIONS,
          selected: duration,
          onSelect: setDuration,
          renderLabel: (item) => item.label,
        })}

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
  headerTitle: { letterSpacing: 2 },
  scroll: { padding: 20, paddingBottom: 48 },

  // Start Button
  startBtnWrap: { borderRadius: 18, overflow: "hidden", marginBottom: 20 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 18 },

  // Mode cards
  modeRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  modeCard: {
    flex: 1, borderRadius: 16, padding: 14, position: "relative",
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  modeCheck: {
    position: "absolute", top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center",
  },
  modeCardTitle: { fontSize: 14, marginBottom: 2 },
  modeCardSub: { fontSize: 11, lineHeight: 15 },

  // Description
  descText: { fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 20, paddingHorizontal: 8 },

  // Settings card
  settingsCard: {
    borderWidth: 1, borderRadius: 22, overflow: "hidden",
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  settingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 17, paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingEmoji: { fontSize: 20, width: 28, textAlign: "center" },
  settingLabel: { fontSize: 16, fontWeight: "500" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  settingValue: { fontSize: 15, fontWeight: "400" },

  // Picker modal (generic)
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  pickerSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36, maxHeight: "70%" },
  playersSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36, maxHeight: "85%" },
  pickerHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  pickerTitle: { fontWeight: "700", textAlign: "center", marginBottom: 16 },
  pickerOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 2,
  },
  pickerOptionText: { fontSize: 15, fontWeight: "500" },
  pickerCancelBtn: { marginTop: 12, borderRadius: 14, paddingVertical: 14, alignItems: "center" },

  // Players modal specific
  countCircle: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  namesHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 4 },
  nameRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nameAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  nameInput: {
    flex: 1, borderWidth: 1.5, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 15,
  },
  editBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center" },
});
