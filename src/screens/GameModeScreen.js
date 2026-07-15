import React, { useState } from "react";
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
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getLocalTopic } from "../services/generateTopic";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");
const scale = Math.max(0.65, Math.min(1.0, height / 844));

const CATEGORIES = [
  { id: "acca", label: "ACCA (Finance)", icon: "📈" },
  { id: "cma", label: "CMA (Finance)", icon: "📊" },
  { id: "easy_words", label: "Easy Words", icon: "📝" },
  { id: "everyday_things", label: "Everyday Things", icon: "🛋️" },
  { id: "animals_and_nature", label: "Animals & Nature", icon: "🦁" },
  { id: "sports_and_leisure", label: "Sports & Leisure", icon: "⚽" },
  { id: "food_and_drinks", label: "Food & Drinks", icon: "🍕" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "around_the_world", label: "Around the World", icon: "🌍" },
  { id: "celebrations", label: "Celebrations", icon: "🎉" },
  { id: "professions", label: "Professions", icon: "💼" },
  { id: "entertainment", label: "Entertainment", icon: "🎭" },
  { id: "trends", label: "Trends", icon: "📈" },
  { id: "school", label: "School", icon: "🎒" },
  { id: "celebrities", label: "Celebrities", icon: "🌟" },
  { id: "household", label: "Household", icon: "🏠" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "movies", label: "Movies", icon: "🎬" },
  { id: "financial", label: "Financial", icon: "📊" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "anime", label: "Anime", icon: "🍥" },
  { id: "bank", label: "Bank", icon: "🏦" },
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

  const [mode, setMode] = useState("passplay");
  const [playerCount, setPlayerCount] = useState(3);
  const [playerNames, setPlayerNames] = useState(DEFAULT_NAMES(3));
  const [editingIdx, setEditingIdx] = useState(null);
  const [imposterCount, setImposterCount] = useState(1);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);
  const [duration, setDuration] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState("acca");
  const [loading, setLoading] = useState(false);

  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showImpostersModal, setShowImpostersModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);

  const maxImposters = Math.max(1, Math.floor((playerCount - 1) / 2));
  const safeImposterCount = Math.min(imposterCount, maxImposters);
  const categoryLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label || "ACCA (Finance)";
  const categoryIcon = CATEGORIES.find((c) => c.id === selectedCategory)?.icon || "📈";

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
      const shuffledIndices = [...Array(players.length).keys()];
      for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
      }
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

  // ── Setting row — clean HomeScreen-matched theme ──
  const renderRow = ({ emoji, label, value, onPress, isToggle, toggleValue, onToggle, isLast, disabled }) => (
    <TouchableOpacity
      onPress={isToggle ? undefined : onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={disabled}
      style={[
        styles.settingRow,
        { borderBottomColor: isLast ? "transparent" : colors.border, opacity: disabled ? 0.35 : 1 },
      ]}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIconBadge,
            {
              backgroundColor: colors.isDark ? "rgba(20,101,241,0.12)" : colors.primaryLight,
              borderColor: colors.isDark ? "rgba(20,101,241,0.25)" : "rgba(20,101,241,0.2)",
            },
          ]}
        >
          <Text style={styles.settingEmoji}>{emoji}</Text>
        </View>
        <Text style={[styles.settingLabel, typography.body1, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.border}
        />
      ) : (
        <View style={styles.settingRight}>
          <Text style={[styles.settingValue, { color: colors.primary }]}>{value}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
        </View>
      )}
    </TouchableOpacity>
  );

  // ── Generic picker modal ──
  const renderPickerModal = ({ visible, onClose, title, items, selected, onSelect, renderLabel }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.pickerOverlay}>
        <View style={[styles.pickerSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.pickerHandle, { backgroundColor: colors.primary }]} />
          <Text style={[styles.pickerTitle, typography.h5, { color: colors.textPrimary }]}>{title.toUpperCase()}</Text>
          <ScrollView style={{ marginTop: 8 }}>
            {items.map((item, i) => {
              const val = typeof item === "object" ? (item.value ?? item.id) : item;
              const lbl = renderLabel ? renderLabel(item) : String(item);
              const isSel = val === selected;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => { onSelect(val); onClose(); }}
                  style={[
                    styles.pickerOption,
                    { borderColor: "transparent" },
                    isSel && {
                      backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : "#EFF6FF",
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    {typeof item === "object" && item.icon && (
                      <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                    )}
                    <Text style={[styles.pickerOptionText, typography.body1, { color: isSel ? colors.primary : colors.textPrimary }]}>
                      {lbl}
                    </Text>
                  </View>
                  {isSel && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.pickerCancelBtn, { backgroundColor: colors.isDark ? "#1E1E1E" : "#F1F5F9" }]}
          >
            <Text style={[typography.btn1, { color: colors.textSecondary, letterSpacing: 1 }]}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header — clean, matches HomeScreen nav bar */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: "transparent" }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backBtn,
              {
                backgroundColor: colors.isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={[styles.headerDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>PLAY GAME</Text>
            <View style={[styles.headerDot, { backgroundColor: colors.primary }]} />
          </View>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.mainContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>

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
                      ? (colors.isDark ? "rgba(20,101,241,0.12)" : "#EFF6FF")
                      : (colors.isDark ? "#111" : "#F8FAFC"),
                    borderWidth: mode === "passplay" ? 1.5 : 1,
                    shadowColor: colors.primary,
                    shadowOpacity: mode === "passplay" ? 0.18 : 0.04,
                    shadowRadius: mode === "passplay" ? 10 : 4,
                    shadowOffset: { width: 0, height: 2 },
                  },
                ]}
              >
                <View style={[
                  styles.modeCheck,
                  {
                    borderColor: mode === "passplay" ? colors.primary : colors.border,
                    backgroundColor: mode === "passplay" ? colors.primary : "transparent"
                  },
                ]}>
                  {mode === "passplay" && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <Ionicons
                  name="phone-portrait-outline"
                  size={26}
                  color={mode === "passplay" ? colors.primary : colors.textDisabled}
                  style={{ marginBottom: 6 }}
                />
                <Text style={[styles.modeCardTitle, { color: mode === "passplay" ? colors.textPrimary : colors.textSecondary }]}>
                  PASS THE PHONE
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
                      ? (colors.isDark ? "rgba(20,101,241,0.12)" : "#EFF6FF")
                      : (colors.isDark ? "#111" : "#F8FAFC"),
                    borderWidth: mode === "online" ? 1.5 : 1,
                    shadowColor: colors.primary,
                    shadowOpacity: mode === "online" ? 0.18 : 0.04,
                    shadowRadius: mode === "online" ? 10 : 4,
                    shadowOffset: { width: 0, height: 2 },
                  },
                ]}
              >
                <View style={[
                  styles.modeCheck,
                  {
                    borderColor: mode === "online" ? colors.primary : colors.border,
                    backgroundColor: mode === "online" ? colors.primary : "transparent"
                  },
                ]}>
                  {mode === "online" && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                </View>
                <Ionicons
                  name="wifi"
                  size={26}
                  color={mode === "online" ? colors.primary : colors.textDisabled}
                  style={{ marginBottom: 6 }}
                />
                <View style={styles.titleRow}>
                  <Text style={[styles.modeCardTitle, { color: mode === "online" ? colors.textPrimary : colors.textSecondary, marginBottom: 0 }]}>
                    PLAY ONLINE
                  </Text>
                  <View style={[styles.betaBadge, {
                    backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : colors.primaryLight,
                    borderColor: colors.isDark ? "rgba(20,101,241,0.3)" : "rgba(20,101,241,0.25)"
                  }]}>
                    <Text style={[styles.betaText, { color: colors.primary }]}>BETA</Text>
                  </View>
                </View>
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
                <View style={styles.settingsCardHeader}>
                  <View style={[styles.settingsCardHeaderDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.settingsCardHeaderText, { color: colors.textDisabled }]}>MATCH SETTINGS</Text>
                </View>
                {renderRow({ emoji: "☝️", label: "Players", value: `${playerCount}`, onPress: () => { setEditingIdx(null); setShowPlayersModal(true); } })}
                {renderRow({ emoji: "🤖", label: "Imposters", value: `${safeImposterCount}`, onPress: () => setShowImpostersModal(true) })}
                {renderRow({ emoji: "🔍", label: "Hints for Imposter", isToggle: true, toggleValue: hintsEnabled, onToggle: setHintsEnabled })}
                {renderRow({
                  emoji: categoryIcon,
                  label: "Categories",
                  // value: `${categoryLabel.split(" ")[0]} +${CATEGORIES.length - 1}`,
                  value: categoryLabel,
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

          {/* Start Game Button */}
          <TouchableOpacity
            onPress={handleStart}
            disabled={loading}
            activeOpacity={0.92}
            style={[
              styles.startBtnWrap,
              {
                borderWidth: 1,
                borderColor: colors.playBtnBorder,
                borderRadius: Math.round(12 * scale),
                marginTop: 12 * scale,
                marginBottom: 12 * scale,
                shadowColor: colors.playBtnBorder,
              }
            ]}
          >
            <LinearGradient
              colors={loading ? [colors.textDisabled, colors.textDisabled] : colors.gradientPlayBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtn}
            >
              {loading ? (
                <><ActivityIndicator size="small" color="rgba(255,255,255,0.7)" /><Text style={[styles.startBtnText, typography.btnPlay, { color: colors.playBtnText, fontSize: Math.round(typography.btnPlay.fontSize * scale) }]}>GENERATING…</Text></>
              ) : (
                <><Ionicons name="play-circle" size={Math.round(22 * scale)} color={colors.playBtnText} /><Text style={[styles.startBtnText, typography.btnPlay, { color: colors.playBtnText, fontSize: Math.round(typography.btnPlay.fontSize * scale) }]}>START GAME</Text></>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>

        {/* ── Players Modal ── */}
        <Modal visible={showPlayersModal} transparent animationType="slide" onRequestClose={() => setShowPlayersModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={styles.pickerOverlay}>
              <View style={[styles.playersSheet, { backgroundColor: colors.isDark ? "#111" : "#FFFFFF", borderTopWidth: 1, borderColor: colors.border }]}>
                <View style={[styles.pickerHandle, { backgroundColor: colors.primary }]} />
                <Text style={[styles.pickerTitle, typography.h5, { color: colors.textPrimary }]}>NUMBER OF PLAYERS</Text>

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
                            ? { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 5 }
                            : { backgroundColor: colors.isDark ? "#000" : "#F1F5F9", borderColor: colors.border },
                        ]}
                      >
                        <Text style={[typography.h5, { color: playerCount === n ? "#FFFFFF" : colors.textSecondary, fontWeight: "800" }]}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <View style={[styles.namesHeader, { borderBottomColor: colors.border }]}>
                  <Ionicons name="people-outline" size={15} color={colors.primary} />
                  <Text style={[typography.sub2, { color: colors.primary, letterSpacing: 1 }]}>PLAYER NAMES</Text>
                </View>

                {/* Player name list */}
                <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {playerNames.slice(0, playerCount).map((name, i) => (
                    <View key={i} style={[styles.nameRow, { borderBottomColor: colors.border }]}>
                      <LinearGradient
                        colors={colors.gradientPlayBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.nameAvatar}
                      >
                        <Text style={[typography.btn2, { color: "#FFFFFF", fontWeight: "800" }]}>
                          {name.trim() ? name.trim()[0].toUpperCase() : `${i + 1}`}
                        </Text>
                      </LinearGradient>

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
                            { borderColor: colors.primary, color: colors.textPrimary, backgroundColor: colors.isDark ? "rgba(20,101,241,0.06)" : "#EFF6FF" },
                          ]}
                        />
                      ) : (
                        <Text style={[typography.body1, { color: colors.textPrimary, flex: 1, paddingVertical: 4 }]}>
                          {name || `Player ${i + 1}`}
                        </Text>
                      )}

                      <TouchableOpacity
                        onPress={() => setEditingIdx(editingIdx === i ? null : i)}
                        style={[styles.editBtn, { backgroundColor: editingIdx === i ? colors.primaryLight : (colors.isDark ? "#222" : "#F1F5F9") }]}
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
                  <Text style={[typography.btn1, { color: "#FFFFFF", letterSpacing: 1, fontWeight: "800" }]}>DONE</Text>
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
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12, borderWidth: 1,
    justifyContent: "center", alignItems: "center",
  },
  headerTitleWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { letterSpacing: 3, fontWeight: "800" },
  headerDot: { width: 5, height: 5, borderRadius: 3 },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10 * scale,
    justifyContent: "space-between",
  },

  // Start Button
  startBtnWrap: {
    borderRadius: 12, overflow: "hidden", marginBottom: 12 * scale,
    shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 * scale },
  startBtnText: { textAlign: "center", marginBottom: 0 },

  // Mode cards
  modeRow: { flexDirection: "row", gap: 12, marginBottom: 10 * scale, marginTop: 4 * scale },
  modeCard: { flex: 1, borderRadius: 14, padding: 12 * scale, position: "relative" },
  modeCheck: {
    position: "absolute", top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center", zIndex: 2,
  },
  modeCardTitle: { fontSize: 13, marginBottom: 2, fontWeight: "800", letterSpacing: 0.5 },
  modeCardSub: { fontSize: 11, lineHeight: 15 },

  // Description
  descText: { fontSize: 13, lineHeight: 18, textAlign: "center", marginBottom: 10 * scale, paddingHorizontal: 8, fontStyle: "italic" },

  // Settings card
  settingsCard: {
    borderWidth: 1, borderRadius: 16, overflow: "hidden",
    shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
    marginBottom: 8 * scale,
  },
  settingsCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingTop: 12 * scale, paddingBottom: 6 * scale },
  settingsCardHeaderDot: { width: 6, height: 6, borderRadius: 3 },
  settingsCardHeaderText: { fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  settingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12 * scale, paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingIconBadge: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    justifyContent: "center", alignItems: "center",
  },
  settingEmoji: { fontSize: 17 },
  settingLabel: { fontSize: 15, fontWeight: "600" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  settingValue: { fontSize: 14, fontWeight: "700" },

  // Picker modal (generic)
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  pickerSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36, maxHeight: "70%", borderTopWidth: 1 },
  playersSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36, maxHeight: "85%" },
  pickerHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  pickerTitle: { fontWeight: "800", textAlign: "center", marginBottom: 16, letterSpacing: 2 },
  pickerOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 2, borderWidth: 1,
  },
  pickerOptionText: { fontSize: 15, fontWeight: "600" },
  pickerCancelBtn: { marginTop: 12, borderRadius: 14, paddingVertical: 14, alignItems: "center" },

  // Players modal specific
  countCircle: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  namesHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  nameAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  nameInput: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15 },
  editBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  betaBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  betaText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});