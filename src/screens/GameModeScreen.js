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

// Gaming HUD "signal" colors — fixed accent identity, layered on top of the app theme.
// These stay constant across light/dark so the arcade feel never washes out.
const SIGNAL = {
  cyan: "#00E5FF",
  magenta: "#FF2E9A",
  purple: "#B026FF",
  green: "#39D97E",
  amber: "#FFA726",
};

const ROW_ACCENTS = {
  players: SIGNAL.cyan,
  imposters: SIGNAL.magenta,
  hints: SIGNAL.purple,
  categories: SIGNAL.green,
  timeLimit: SIGNAL.amber,
  duration: SIGNAL.amber,
};

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
  const [selectedCategory, setSelectedCategory] = useState("acca");
  const [loading, setLoading] = useState(false);

  // Modal states
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

  // ── HUD corner brackets — the signature sci-fi accent on active surfaces ──
  const CornerBrackets = ({ color }) => (
    <>
      <View style={[styles.bracket, styles.bracketTL, { borderColor: color }]} />
      <View style={[styles.bracket, styles.bracketTR, { borderColor: color }]} />
      <View style={[styles.bracket, styles.bracketBL, { borderColor: color }]} />
      <View style={[styles.bracket, styles.bracketBR, { borderColor: color }]} />
    </>
  );

  // ── Setting row (HUD style, colored indicator per setting, theme-aware surfaces) ──
  const renderRow = ({ emoji, label, value, onPress, isToggle, toggleValue, onToggle, isLast, disabled, accent }) => (
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
              borderColor: accent,
              shadowColor: accent,
              backgroundColor: colors.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
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
          trackColor={{ false: colors.border, true: accent }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.border}
        />
      ) : (
        <View style={styles.settingRight}>
          <Text style={[styles.settingValue, { color: accent }]}>{value}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
        </View>
      )}
    </TouchableOpacity>
  );

  // ── Generic picker modal (HUD glass sheet, theme-aware) ──
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

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backBtn,
              {
                backgroundColor: colors.isDark ? "#121212" : "#F1F5F9",
                borderColor: colors.border,
                shadowColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={[styles.headerDot, { backgroundColor: colors.primary, shadowColor: colors.primary }]} />
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>PLAY GAME</Text>
            <View style={[styles.headerDot, { backgroundColor: colors.primary, shadowColor: colors.primary }]} />
          </View>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Mode Selector Cards */}
          <View style={styles.modeRow}>
            {/* Pass the phone */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setMode("passplay")}
              style={[
                styles.modeCard,
                {
                  borderColor: mode === "passplay" ? SIGNAL.cyan : colors.border,
                  backgroundColor: mode === "passplay"
                    ? (colors.isDark ? "rgba(0,229,255,0.08)" : "#FFFFFF")
                    : (colors.isDark ? "#121212" : "#F8FAFC"),
                  borderWidth: mode === "passplay" ? 1.5 : 1,
                  shadowColor: mode === "passplay" ? SIGNAL.cyan : "#000",
                  shadowOpacity: mode === "passplay" ? 0.4 : 0.05,
                  shadowRadius: mode === "passplay" ? 14 : 6,
                  shadowOffset: { width: 0, height: mode === "passplay" ? 0 : 2 },
                },
              ]}
            >
              {mode === "passplay" && <CornerBrackets color={SIGNAL.cyan} />}
              <View style={[
                styles.modeCheck,
                { borderColor: mode === "passplay" ? SIGNAL.cyan : colors.border, backgroundColor: mode === "passplay" ? SIGNAL.cyan : "transparent" },
              ]}>
                {mode === "passplay" && <Ionicons name="checkmark" size={12} color="#0A0A0A" />}
              </View>
              <Ionicons
                name="phone-portrait-outline"
                size={28}
                color={mode === "passplay" ? SIGNAL.cyan : colors.textDisabled}
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
                  borderColor: mode === "online" ? SIGNAL.magenta : colors.border,
                  backgroundColor: mode === "online"
                    ? (colors.isDark ? "rgba(255,46,154,0.08)" : "#FFFFFF")
                    : (colors.isDark ? "#121212" : "#F8FAFC"),
                  borderWidth: mode === "online" ? 1.5 : 1,
                  shadowColor: mode === "online" ? SIGNAL.magenta : "#000",
                  shadowOpacity: mode === "online" ? 0.4 : 0.05,
                  shadowRadius: mode === "online" ? 14 : 6,
                  shadowOffset: { width: 0, height: mode === "online" ? 0 : 2 },
                },
              ]}
            >
              {mode === "online" && <CornerBrackets color={SIGNAL.magenta} />}
              <View style={[
                styles.modeCheck,
                { borderColor: mode === "online" ? SIGNAL.magenta : colors.border, backgroundColor: mode === "online" ? SIGNAL.magenta : "transparent" },
              ]}>
                {mode === "online" && <Ionicons name="checkmark" size={12} color="#0A0A0A" />}
              </View>
              <Ionicons
                name="wifi"
                size={28}
                color={mode === "online" ? SIGNAL.magenta : colors.textDisabled}
                style={{ marginBottom: 6 }}
              />
              <Text style={[styles.modeCardTitle, { color: mode === "online" ? colors.textPrimary : colors.textSecondary }]}>
                PLAY ONLINE
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
            <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.primary }]}>
              <View style={styles.settingsCardHeader}>
                <View style={[styles.settingsCardHeaderDot, { backgroundColor: SIGNAL.green, shadowColor: SIGNAL.green }]} />
                <Text style={[styles.settingsCardHeaderText, { color: colors.textDisabled }]}>MATCH SETTINGS</Text>
              </View>
              {renderRow({ emoji: "☝️", label: "Players", value: `${playerCount}`, accent: ROW_ACCENTS.players, onPress: () => { setEditingIdx(null); setShowPlayersModal(true); } })}
              {renderRow({ emoji: "🤖", label: "Imposters", value: `${safeImposterCount}`, accent: ROW_ACCENTS.imposters, onPress: () => setShowImpostersModal(true) })}
              {renderRow({ emoji: "🔍", label: "Hints for Imposter", isToggle: true, accent: ROW_ACCENTS.hints, toggleValue: hintsEnabled, onToggle: setHintsEnabled })}
              {renderRow({
                emoji: categoryIcon,
                label: "Categories",
                value: `${categoryLabel.split(" ")[0]} +${CATEGORIES.length - 1}`,
                accent: ROW_ACCENTS.categories,
                onPress: () => setShowCategoriesModal(true),
              })}
              {renderRow({ emoji: "⏰", label: "Time Limit", isToggle: true, accent: ROW_ACCENTS.timeLimit, toggleValue: timeLimitEnabled, onToggle: setTimeLimitEnabled })}
              {renderRow({
                emoji: "🕐",
                label: "Duration",
                value: `${duration} ${duration === 1 ? "minute" : "minutes"}`,
                accent: ROW_ACCENTS.duration,
                onPress: timeLimitEnabled ? () => setShowDurationModal(true) : undefined,
                isLast: true,
                disabled: !timeLimitEnabled,
              })}
            </View>
          )}

          {/* Start Game Button */}
          <TouchableOpacity
            onPress={handleStart}
            disabled={loading}
            activeOpacity={0.88}
            style={[styles.startBtnWrap, { marginTop: 24, marginBottom: 12, shadowColor: SIGNAL.cyan }]}
          >
            <LinearGradient
              colors={loading ? [colors.textDisabled, colors.textDisabled] : [SIGNAL.green, SIGNAL.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtn}
            >
              {loading ? (
                <><ActivityIndicator size="small" color="rgba(255,255,255,0.7)" /><Text style={styles.startBtnText}>GENERATING…</Text></>
              ) : (
                <><Ionicons name="play-circle" size={22} color="#0A0A0A" /><Text style={styles.startBtnText}>START GAME</Text></>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>

        {/* ── Players Modal: Count picker + editable names ── */}
        <Modal visible={showPlayersModal} transparent animationType="slide" onRequestClose={() => setShowPlayersModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={styles.pickerOverlay}>
              <View style={[styles.playersSheet, { backgroundColor: colors.isDark ? "#1A1A1A" : "#FFFFFF" }]}>
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
                            ? { backgroundColor: SIGNAL.cyan, borderColor: SIGNAL.cyan, shadowColor: SIGNAL.cyan, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 5 }
                            : { backgroundColor: colors.isDark ? "#000" : "#F1F5F9", borderColor: colors.border },
                        ]}
                      >
                        <Text style={[typography.h5, { color: playerCount === n ? "#0A0A0A" : colors.textSecondary, fontWeight: "800" }]}>{n}</Text>
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
                    <View key={i} style={[styles.nameRow, { borderBottomColor: colors.border }]}>
                      <LinearGradient
                        colors={[SIGNAL.cyan, SIGNAL.purple]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.nameAvatar}
                      >
                        <Text style={[typography.btn2, { color: "#0A0A0A", fontWeight: "800" }]}>
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
                            { borderColor: SIGNAL.cyan, color: colors.textPrimary, backgroundColor: colors.isDark ? "rgba(0,229,255,0.06)" : "#F0FBFF" },
                          ]}
                        />
                      ) : (
                        <Text style={[typography.body1, { color: colors.textPrimary, flex: 1, paddingVertical: 4 }]}>
                          {name || `Player ${i + 1}`}
                        </Text>
                      )}

                      <TouchableOpacity
                        onPress={() => setEditingIdx(editingIdx === i ? null : i)}
                        style={[styles.editBtn, { backgroundColor: editingIdx === i ? SIGNAL.cyan + "22" : (colors.isDark ? "#222" : "#F1F5F9") }]}
                      >
                        <Ionicons name={editingIdx === i ? "checkmark" : "pencil"} size={14} color={editingIdx === i ? SIGNAL.cyan : colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => { setEditingIdx(null); setShowPlayersModal(false); }}
                  style={[styles.pickerCancelBtn, { backgroundColor: SIGNAL.cyan, marginTop: 16, shadowColor: SIGNAL.cyan, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 5 }]}
                >
                  <Text style={[typography.btn1, { color: "#0A0A0A", letterSpacing: 1, fontWeight: "800" }]}>DONE</Text>
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
  backBtn: {
    width: 38, height: 38, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center",
    shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
  headerTitleWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { letterSpacing: 3, fontWeight: "800" },
  headerDot: { width: 5, height: 5, borderRadius: 3, shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  scroll: { padding: 20, paddingBottom: 48 },

  // Start Button
  startBtnWrap: {
    borderRadius: 18, overflow: "hidden", marginBottom: 20,
    shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 18 },
  startBtnText: { color: "#0A0A0A", fontWeight: "800", fontSize: 16, letterSpacing: 2 },

  // Mode cards
  modeRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  modeCard: { flex: 1, borderRadius: 16, padding: 14, position: "relative" },
  modeCheck: {
    position: "absolute", top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center", zIndex: 2,
  },
  modeCardTitle: { fontSize: 13, marginBottom: 2, fontWeight: "800", letterSpacing: 0.5 },
  modeCardSub: { fontSize: 11, lineHeight: 15 },

  // Corner brackets — HUD signature accent
  bracket: { position: "absolute", width: 12, height: 12 },
  bracketTL: { top: 4, left: 4, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 6 },
  bracketTR: { top: 4, right: 4, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 6 },
  bracketBL: { bottom: 4, left: 4, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 6 },
  bracketBR: { bottom: 4, right: 4, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 6 },

  // Description
  descText: { fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 20, paddingHorizontal: 8, fontStyle: "italic" },

  // Settings card
  settingsCard: {
    borderWidth: 1, borderRadius: 22, overflow: "hidden",
    shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
  settingsCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10 },
  settingsCardHeaderDot: { width: 6, height: 6, borderRadius: 3, shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  settingsCardHeaderText: { fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  settingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 15, paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingIconBadge: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.2,
    justifyContent: "center", alignItems: "center",
    shadowOpacity: 0.5, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
  },
  settingEmoji: { fontSize: 16 },
  settingLabel: { fontSize: 16, fontWeight: "600" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  settingValue: { fontSize: 15, fontWeight: "700" },

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
});