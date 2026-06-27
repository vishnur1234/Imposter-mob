import React, { useState, useEffect } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  SafeAreaView, Alert, ActivityIndicator, Modal, FlatList, TextInput,
} from "react-native";
import topics from "../data/demoData";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext";

export default function CreateRoomScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [course, setCourse] = useState("ACCA");
  const [players, setPlayers] = useState(4);
  const [rounds, setRounds] = useState(3);
  const [clueTimer, setClueTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState(null); 
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [hostPlayerName, setHostPlayerName] = useState("");

  useEffect(() => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return;
    const unsub = onSnapshot(doc(db, "user_stats", myUid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserCoins(data.highScore || 0);
        setHostPlayerName(data.playerName || data.name || (auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "Host"));
      } else {
        setHostPlayerName(auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "Host");
      }
    });
    return () => unsub();
  }, []);



  const handleCourseChange = (newCourse) => {
    setCourse(newCourse);
    setSelectedTopic(null);
  };

  const handleCreate = async () => {
    if (userCoins < 50) {
      Alert.alert("Insufficient Coins", "You need at least 50 coins to play. Claim your Daily Reward or play again later.");
      return;
    }
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLoading(true);
    const emailPrefix = auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "Host";
    try {
      await setDoc(doc(db, "rooms", roomCode), {
        roomCode,
        hostId: auth.currentUser.uid,
        category: course,
        playersRequired: Number(players),
        totalRounds: Number(rounds),
        clueTimer: Number(clueTimer),
        currentRound: 1,
        gameStatus: "waiting",
        createdAt: Date.now(),
        players: [{ uid: auth.currentUser.uid, name: hostPlayerName || emailPrefix, score: 0 }],
        votes: {},
        hints: [],
        readyPlayers: [],
        gameData: {},
        selectedTopic: selectedTopic,
      });
      navigation.navigate("WaitingRoom", { roomCode, course, players: Number(players), isHost: true, isDemoMode: false, selectedTopic, clueTimer: Number(clueTimer) });
    } catch (e) {
      Alert.alert("Offline Demo Mode", `Failed to create room: ${e.message}\n\nContinue in local demo mode?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Go Offline", onPress: () => navigation.navigate("WaitingRoom", { roomCode, course, players: Number(players), isHost: true, isDemoMode: true, selectedTopic, clueTimer: Number(clueTimer) }) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9", borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>CREATE ROOM</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Select Course Dropdown */}
            <View style={styles.sectionLabelRow}>
              <Ionicons name="school-outline" size={14} color={colors.success} />
              <Text style={[styles.sectionLabel, typography.sub2, { color: colors.success }]}>COURSE</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowCourseModal(true)}
              activeOpacity={0.8}
              style={[styles.dropdownTrigger, { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }]}
            >
              <Text style={[styles.dropdownText, typography.body1, { color: colors.textPrimary }]}>{course}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Select Game Category Dropdown */}
            <View style={[styles.sectionLabelRow, { marginTop: 20 }]}>
              <Ionicons name="bulb-outline" size={14} color={colors.success} />
              <Text style={[styles.sectionLabel, typography.sub2, { color: colors.success }]}>SPECIFIC TOPIC (OPTIONAL)</Text>
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

            {/* Players */}
            <View style={[styles.sectionLabelRow, { marginTop: 24 }]}>
              <Ionicons name="people-outline" size={14} color={colors.success} />
              <Text style={[styles.sectionLabel, typography.sub2, { color: colors.success }]}>MAX PLAYERS</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setPlayers(n)}
                    style={[
                      styles.countCircle,
                      players === n
                        ? { backgroundColor: colors.success, borderColor: colors.success }
                        : { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }
                    ]}
                  >
                    <Text style={[styles.countText, typography.h5, { color: players === n ? "#FFFFFF" : colors.textSecondary }]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Rounds */}
            <View style={[styles.sectionLabelRow, { marginTop: 24 }]}>
              <Ionicons name="repeat-outline" size={14} color={colors.success} />
              <Text style={[styles.sectionLabel, typography.sub2, { color: colors.success }]}>NUMBER OF ROUNDS</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setRounds(n)}
                  style={[
                    styles.countCircle,
                    rounds === n
                      ? { backgroundColor: colors.success, borderColor: colors.success }
                      : { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }
                  ]}
                >
                  <Text style={[styles.countText, typography.h5, { color: rounds === n ? "#FFFFFF" : colors.textSecondary }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clue Timer */}
            <View style={[styles.sectionLabelRow, { marginTop: 24 }]}>
              <Ionicons name="time-outline" size={14} color={colors.success} />
              <Text style={[styles.sectionLabel, typography.sub2, { color: colors.success }]}>CLUE TIMER</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { label: "1 Min", val: 60 },
                { label: "2 Min", val: 120 },
                { label: "No Limit", val: 0 }
              ].map((t) => (
                <TouchableOpacity
                  key={t.val}
                  onPress={() => setClueTimer(t.val)}
                  style={[
                    styles.countCircle,
                    { width: t.val === 0 ? 90 : 70 },
                    clueTimer === t.val
                      ? { backgroundColor: colors.success, borderColor: colors.success }
                      : { backgroundColor: colors.isDark ? "#000000" : "#F8FAFC", borderColor: colors.border }
                  ]}
                >
                  <Text style={[styles.countText, typography.h7, { color: clueTimer === t.val ? "#FFFFFF" : colors.textSecondary, fontWeight: "600" }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleCreate} disabled={loading} activeOpacity={0.85} style={styles.btnWrap}>
              <LinearGradient colors={loading ? [colors.textDisabled, colors.textDisabled] : colors.gradientSuccess} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                {loading
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <><Ionicons name="add-circle-outline" size={20} color="#FFF" /><Text style={[styles.btnText, typography.btn1]}>CREATE ROOM</Text></>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
                      course === item && { backgroundColor: colors.isDark ? "rgba(16,185,129,0.15)" : "#ECFDF5" }
                    ]}
                  >
                    <Text style={[styles.modalItemText, typography.body1, { color: course === item ? colors.success : colors.textPrimary }]}>{item}</Text>
                    {course === item && <Ionicons name="checkmark" size={18} color={colors.success} />}
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
                        isSelected && { backgroundColor: colors.isDark ? "rgba(16,185,129,0.15)" : "#ECFDF5" }
                      ]}
                    >
                      <Text style={[styles.modalItemText, typography.body1, { color: isSelected ? colors.success : colors.textPrimary }]}>
                        {item.answer}
                      </Text>
                      {isSelected && <Ionicons name="checkmark" size={18} color={colors.success} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  scroll: { padding: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E2E8F0",
    borderRadius: 24, padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: "700", color: "#059669", letterSpacing: 1.5 },
  dropdownTrigger: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    height: 52, marginTop: 8,
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
  countCircleActive: { backgroundColor: "#059669", borderColor: "#10B981" },
  countText: { color: "#64748B", fontSize: 15, fontWeight: "700" },
  countTextActive: { color: "#FFF" },
  btnWrap: { borderRadius: 16, overflow: "hidden", marginTop: 28 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 17 },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "900", letterSpacing: 1.5 },
});
