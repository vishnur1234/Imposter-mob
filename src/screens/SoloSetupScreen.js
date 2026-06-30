import React, { useState } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, SafeAreaView, Alert, TextInput, ActivityIndicator,
  Modal, FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { generateTopic } from "../services/generateTopic";
import { useTheme } from "../context/ThemeContext";
import topics from "../data/demoData";

export default function SoloSetupScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [course, setCourse] = useState("ACCA");
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState(Array(4).fill(""));
  const [loading, setLoading] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState(null); // null means default Course (Finance)
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);

  const handleCourseChange = (newCourse) => {
    setCourse(newCourse);
    setSelectedTopic(null);
  };

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
      let topicCategory = course; // default ACCA or CMA
      if (selectedTopic && selectedTopic.id !== "course_default") {
        topicCategory = selectedTopic.category || selectedTopic.id.replace("random_", "");
      }
      const topic = await generateTopic(topicCategory);
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
          <View style={[styles.header, { backgroundColor: "transparent", borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>PLAYERS SETUP</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

            {/* Select Course Dropdown */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="school-outline" size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, typography.sub2, { color: colors.primary }]}>SELECT COURSE</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCourseModal(true)}
                activeOpacity={0.8}
                style={[styles.dropdownTrigger, { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }]}
              >
                <Text style={[styles.dropdownText, typography.body1, { color: colors.textPrimary }]}>{course}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Select Game Category Dropdown */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="bulb-outline" size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, typography.sub2, { color: colors.primary }]}>SELECT CATEGORY</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowTopicModal(true)}
                activeOpacity={0.8}
                style={[styles.dropdownTrigger, { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }]}
              >
                <Text style={[styles.dropdownText, typography.body1, { color: colors.textPrimary }]}>
                  {selectedTopic ? selectedTopic.answer : `${course} (Finance)`}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
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

          {/* Modals for Dropdowns */}
          <Modal visible={showCourseModal} transparent animationType="fade" onRequestClose={() => setShowCourseModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, typography.h5, { color: colors.textPrimary }]}>Select Course</Text>
                  <TouchableOpacity onPress={() => setShowCourseModal(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalList}>
                  {["ACCA", "CMA"].map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        handleCourseChange(item);
                        setShowCourseModal(false);
                      }}
                      style={[
                        styles.modalItem,
                        course === item && { backgroundColor: colors.primaryLight }
                      ]}
                    >
                      <Text style={[styles.modalItemText, typography.body1, { color: course === item ? colors.primary : colors.textPrimary }]}>{item}</Text>
                      {course === item && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          <Modal visible={showTopicModal} transparent animationType="fade" onRequestClose={() => setShowTopicModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, typography.h5, { color: colors.textPrimary }]}>Select Category</Text>
                  <TouchableOpacity onPress={() => setShowTopicModal(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalList}>
                  {[
                    { id: "random_course", category: course === "CMA" ? "CMA" : "ACCA", answer: `${course} (Finance)` },
                    { id: "random_general", category: "general", answer: "General" },
                    { id: "random_bank", category: "bank", answer: "Bank" },
                    { id: "random_movie", category: "movie", answer: "Movie" }
                  ].map((item) => {
                    const isSelected = (!selectedTopic && item.id === "random_course") || (selectedTopic && selectedTopic.id === item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          if (item.id === "random_course") {
                            setSelectedTopic(null);
                          } else {
                            setSelectedTopic(item);
                          }
                          setShowTopicModal(false);
                        }}
                        style={[
                          styles.modalItem,
                          isSelected && { backgroundColor: colors.primaryLight }
                        ]}
                      >
                        <Text style={[styles.modalItemText, typography.body1, { color: isSelected ? colors.primary : colors.textPrimary }]}>
                          {item.answer}
                        </Text>
                        {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>
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

  dropdownTrigger: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    height: 52,
  },
  dropdownText: { fontSize: 15, fontWeight: "600" },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center", alignItems: "center", padding: 20,
  },
  modalCard: {
    width: "100%", maxHeight: "80%", borderRadius: 24, borderWidth: 1,
    padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalList: { marginTop: 8 },
  modalItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4,
  },
  modalItemText: { fontSize: 15, fontWeight: "600" },
  searchBar: {
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 12, height: 44, marginBottom: 12, gap: 8,
  },
  searchInput: { flex: 1, height: "100%", padding: 0 },
  categoryBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5,
  },

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
