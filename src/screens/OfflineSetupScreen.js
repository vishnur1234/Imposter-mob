import React, { useState } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, SafeAreaView, Alert, TextInput, ActivityIndicator, Modal, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { generateTopic } from "../services/generateTopic";
import { useTheme } from "../context/ThemeContext";
import { getAvatarByIndex } from "../services/avatarService";

export default function OfflineSetupScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [course, setCourse] = useState("ACCA");
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState(Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);

  const handleCourseChange = (c) => { setCourse(c); setSelectedTopic(null); };

  const handleCountChange = (n) => {
    setPlayerCount(n);
    setPlayerNames((prev) => {
      const u = [...prev];
      while (u.length < n) u.push("");
      return u.slice(0, n);
    });
  };

  const handleStartGame = async () => {
    setLoading(true);
    try {
      let topicCategory = course;
      if (selectedTopic && selectedTopic.id !== "course_default") {
        topicCategory = selectedTopic.category || selectedTopic.id.replace("random_", "");
      }
      const topic = await generateTopic(topicCategory);
      const players = playerNames.map((name, i) => ({
        uid: `offline-${i}`,
        name: name.trim() || `Player ${i + 1}`,
      }));
      const imposterIndex = Math.floor(Math.random() * players.length);
      navigation.navigate("OfflineRoleReveal", { course, players, topic, imposterIndex });
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
          <View style={[styles.header, { backgroundColor: "transparent", borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>OFFLINE SETUP</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={[styles.offlineBadge, { backgroundColor: colors.isDark ? "rgba(255,160,0,0.12)" : "#FFF8E1", borderColor: colors.isDark ? "rgba(255,160,0,0.3)" : "#FFE082" }]}>
              <Ionicons name="phone-portrait-outline" size={16} color={colors.warning} />
              <Text style={[typography.body3, { color: colors.warning, flex: 1 }]}>Pass & Play — All players share one device</Text>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="school-outline" size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, typography.sub2, { color: colors.primary }]}>SELECT COURSE</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCourseModal(true)} activeOpacity={0.8} style={[styles.dropdownTrigger, { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }]}>
                <Text style={[typography.body1, { color: colors.textPrimary }]}>{course}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="bulb-outline" size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, typography.sub2, { color: colors.primary }]}>SELECT CATEGORY</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTopicModal(true)} activeOpacity={0.8} style={[styles.dropdownTrigger, { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }]}>
                <Text style={[typography.body1, { color: colors.textPrimary }]}>{selectedTopic ? selectedTopic.answer : `${course} (Finance)`}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="people-outline" size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, typography.sub2, { color: colors.primary }]}>NUMBER OF PLAYERS</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <TouchableOpacity key={n} onPress={() => handleCountChange(n)}
                      style={[styles.countCircle, playerCount === n ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }]}>
                      <Text style={[typography.h5, { color: playerCount === n ? "#FFFFFF" : colors.textSecondary }]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={[styles.section, { backgroundColor: colors.isDark ? "rgba(20,101,241,0.08)" : "rgba(37,99,235,0.05)", borderColor: colors.isDark ? "rgba(20,101,241,0.3)" : "rgba(37,99,235,0.15)" }]}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="person-outline" size={14} color={colors.primary} />
                <Text style={[styles.sectionLabel, typography.sub2, { color: colors.primary }]}>PLAYER NAMES</Text>
              </View>
              {playerNames.map((name, i) => (
                <View key={i} style={styles.nameRow}>
                  <View style={[styles.nameAvatar, { backgroundColor: colors.primaryLight, overflow: "hidden" }]}>
                    <Image
                      source={getAvatarByIndex(i)}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </View>
                  <TextInput value={name} onChangeText={(v) => { const u = [...playerNames]; u[i] = v; setPlayerNames(u); }}
                    placeholder={`Player ${i + 1}`} placeholderTextColor={colors.textDisabled}
                    style={[typography.body2, styles.nameInput, { backgroundColor: colors.isDark ? "#000000" : "#FFFFFF", borderColor: colors.border, color: colors.textPrimary }]}
                    maxLength={20} />
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={handleStartGame} disabled={loading} activeOpacity={0.85} style={styles.startBtnWrap}>
              <LinearGradient colors={loading ? [colors.textDisabled, colors.textDisabled] : colors.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
                {loading
                  ? <><ActivityIndicator size="small" color="rgba(255,255,255,0.6)" /><Text style={[typography.btn1, { color: "#FFF" }]}>GENERATING…</Text></>
                  : <><Ionicons name="play-circle-outline" size={22} color="#FFF" /><Text style={[typography.btn1, { color: "#FFF" }]}>START GAME</Text></>}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>

          <Modal visible={showCourseModal} transparent animationType="fade" onRequestClose={() => setShowCourseModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.modalHeader}>
                  <Text style={[typography.h5, { color: colors.textPrimary }]}>Select Course</Text>
                  <TouchableOpacity onPress={() => setShowCourseModal(false)}><Ionicons name="close" size={24} color={colors.textSecondary} /></TouchableOpacity>
                </View>
                <ScrollView>
                  {["ACCA", "CMA"].map((item) => (
                    <TouchableOpacity key={item} onPress={() => { handleCourseChange(item); setShowCourseModal(false); }}
                      style={[styles.modalItem, course === item && { backgroundColor: colors.primaryLight }]}>
                      <Text style={[typography.body1, { color: course === item ? colors.primary : colors.textPrimary }]}>{item}</Text>
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
                  <Text style={[typography.h5, { color: colors.textPrimary }]}>Select Category</Text>
                  <TouchableOpacity onPress={() => setShowTopicModal(false)}><Ionicons name="close" size={24} color={colors.textSecondary} /></TouchableOpacity>
                </View>
                <ScrollView>
                  {[
                    { id: "random_course", category: course, answer: `${course} (Finance)` },
                    { id: "random_general", category: "general", answer: "General" },
                    { id: "random_bank", category: "bank", answer: "Bank" },
                    { id: "random_movie", category: "movie", answer: "Movie" },
                  ].map((item) => {
                    const sel = (!selectedTopic && item.id === "random_course") || (selectedTopic && selectedTopic.id === item.id);
                    return (
                      <TouchableOpacity key={item.id} onPress={() => { item.id === "random_course" ? setSelectedTopic(null) : setSelectedTopic(item); setShowTopicModal(false); }}
                        style={[styles.modalItem, sel && { backgroundColor: colors.primaryLight }]}>
                        <Text style={[typography.body1, { color: sel ? colors.primary : colors.textPrimary }]}>{item.answer}</Text>
                        {sel && <Ionicons name="checkmark" size={18} color={colors.primary} />}
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: {},
  scroll: { padding: 20, paddingBottom: 40 },
  offlineBadge: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16 },
  section: { borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 14 },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  sectionLabel: {},
  dropdownTrigger: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, height: 52 },
  countCircle: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  nameAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  nameInput: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  startBtnWrap: { borderRadius: 18, overflow: "hidden", marginTop: 8 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 18 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { width: "100%", maxHeight: "80%", borderRadius: 24, borderWidth: 1, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
});
