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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { generateTopic } from "../services/generateTopic";
import { useTheme } from "../context/ThemeContext";

const CATEGORIES = [
  { id: "ACCA", label: "ACCA (Finance)" },
  { id: "CMA", label: "CMA (Finance)" },
  { id: "general", label: "General" },
  { id: "bank", label: "Bank" },
  { id: "movie", label: "Movie" },
];

const DURATIONS = [
  { value: 1, label: "1 minute" },
  { value: 2, label: "2 minutes" },
  { value: 3, label: "3 minutes" },
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
];

export default function PassAndPlaySetupScreen({ navigation }) {
  const { colors, typography } = useTheme();

  const [playerCount, setPlayerCount] = useState(3);
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

  const categoryLabel =
    CATEGORIES.find((c) => c.id === selectedCategory)?.label || "ACCA (Finance)";
  const categoryCount = CATEGORIES.length - 1;

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const topic = await generateTopic(selectedCategory);
      const players = Array.from({ length: playerCount }, (_, i) => ({
        uid: `pnp-${i}`,
        name: `Player ${i + 1}`,
      }));
      // pick imposter indices
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      const imposterIndices = shuffled
        .slice(0, safeImposterCount)
        .map((p) => players.indexOf(p));
      const imposterIndex = imposterIndices[0];

      navigation.navigate("OfflineRoleReveal", {
        course: selectedCategory,
        players,
        topic,
        imposterIndex,
        hintsEnabled,
        timeLimitEnabled,
        duration,
        imposterCount: safeImposterCount,
      });
    } catch (e) {
      Alert.alert("Error", "Failed to generate game topic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSettingRow = ({
    emoji,
    label,
    value,
    onPress,
    isToggle = false,
    toggleValue,
    onToggle,
    isLast = false,
    disabled = false,
  }) => (
    <TouchableOpacity
      onPress={isToggle ? undefined : onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={disabled}
      style={[
        styles.settingRow,
        {
          borderBottomColor: isLast ? "transparent" : colors.border,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingEmoji}>{emoji}</Text>
        <Text style={[styles.settingLabel, typography.body1, { color: colors.textPrimary }]}>
          {label}
        </Text>
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
          <Text style={[styles.settingValue, typography.body1, { color: colors.textSecondary }]}>
            {value}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPickerModal = ({
    visible,
    onClose,
    title,
    items,
    selected,
    onSelect,
    renderLabel,
  }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, typography.h5, { color: colors.textPrimary }]}>
            {title}
          </Text>
          <ScrollView style={{ marginTop: 8 }}>
            {items.map((item, i) => {
              const val = typeof item === "object" ? item.value ?? item.id : item;
              const lbl = renderLabel ? renderLabel(item) : String(item);
              const isSelected = val === selected;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    onSelect(val);
                    onClose();
                  }}
                  style={[
                    styles.modalOption,
                    isSelected && { backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : "#EFF6FF" },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      typography.body1,
                      { color: isSelected ? colors.primary : colors.textPrimary },
                    ]}
                  >
                    {lbl}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.modalCloseBtn, { backgroundColor: colors.isDark ? "#1E1E1E" : "#F1F5F9" }]}
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
          <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>
            PASS & PLAY
          </Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle */}
          <View style={[styles.heroBadge, { backgroundColor: colors.isDark ? "rgba(245,158,11,0.12)" : "#FFFBEB", borderColor: colors.isDark ? "rgba(245,158,11,0.3)" : "#FDE68A" }]}>
            <Ionicons name="phone-portrait-outline" size={16} color="#F59E0B" />
            <Text style={[typography.body3, { color: "#D97706", flex: 1 }]}>
              All players share one device — pass it around!
            </Text>
          </View>

          {/* Settings Card */}
          <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {renderSettingRow({
              emoji: "☝️",
              label: "Players",
              value: `${playerCount} >`,
              onPress: () => setShowPlayersModal(true),
            })}
            {renderSettingRow({
              emoji: "🤖",
              label: "Imposters",
              value: `${safeImposterCount} >`,
              onPress: () => setShowImpostersModal(true),
            })}
            {renderSettingRow({
              emoji: "🔍",
              label: "Hints for Imposter",
              isToggle: true,
              toggleValue: hintsEnabled,
              onToggle: setHintsEnabled,
            })}
            {renderSettingRow({
              emoji: "👀",
              label: "Categories",
              value: `${categoryLabel.split(" ")[0]} +${categoryCount} >`,
              onPress: () => setShowCategoriesModal(true),
            })}
            {renderSettingRow({
              emoji: "⏰",
              label: "Time Limit",
              isToggle: true,
              toggleValue: timeLimitEnabled,
              onToggle: setTimeLimitEnabled,
            })}
            {renderSettingRow({
              emoji: "🕐",
              label: "Duration",
              value: `${duration} ${duration === 1 ? "minute" : "minutes"} >`,
              onPress: timeLimitEnabled ? () => setShowDurationModal(true) : undefined,
              isLast: true,
              disabled: !timeLimitEnabled,
            })}
          </View>

          {/* Start Button */}
          <TouchableOpacity
            onPress={handleStartGame}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.startBtnWrap}
          >
            <LinearGradient
              colors={loading ? [colors.textDisabled, colors.textDisabled] : colors.gradientBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtn}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                  <Text style={[typography.btn1, { color: "#FFF" }]}>GENERATING…</Text>
                </>
              ) : (
                <>
                  <Ionicons name="play-circle-outline" size={22} color="#FFF" />
                  <Text style={[typography.btn1, { color: "#FFF" }]}>START GAME</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Players Modal */}
        {renderPickerModal({
          visible: showPlayersModal,
          onClose: () => setShowPlayersModal(false),
          title: "Number of Players",
          items: [3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ value: n, id: n })),
          selected: playerCount,
          onSelect: (val) => {
            setPlayerCount(val);
            if (imposterCount > Math.max(1, Math.floor((val - 1) / 2))) {
              setImposterCount(1);
            }
          },
          renderLabel: (item) => `${item.value} Players`,
        })}

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    letterSpacing: 2,
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  settingsCard: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 17,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  settingValue: {
    fontSize: 15,
    fontWeight: "400",
  },
  startBtnWrap: {
    borderRadius: 18,
    overflow: "hidden",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 2,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  modalCloseBtn: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
});
