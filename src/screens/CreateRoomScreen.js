import React, { useState } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  SafeAreaView, Alert, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext";

export default function CreateRoomScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [course, setCourse] = useState("ACCA");
  const [players, setPlayers] = useState(4);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLoading(true);
    try {
      await setDoc(doc(db, "rooms", roomCode), {
        roomCode, course, players: Number(players),
        started: false, createdAt: Date.now(),
        playerList: [{ uid: auth.currentUser.uid, name: auth.currentUser.email || "Host" }],
      });
      navigation.navigate("WaitingRoom", { roomCode, course, players: Number(players), isHost: true, isDemoMode: false });
    } catch (e) {
      Alert.alert("Offline Demo Mode", `Failed to create room: ${e.message}\n\nContinue in local demo mode?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Go Offline", onPress: () => navigation.navigate("WaitingRoom", { roomCode, course, players: Number(players), isHost: true, isDemoMode: true }) },
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
            {/* Course */}
            <View style={styles.sectionLabelRow}>
              <Ionicons name="school-outline" size={14} color={colors.success} />
              <Text style={[styles.sectionLabel, typography.sub2, { color: colors.success }]}>COURSE</Text>
            </View>
            <View style={styles.pillRow}>
              {["ACCA", "CMA"].map((item) => (
                <TouchableOpacity key={item} onPress={() => setCourse(item)} activeOpacity={0.8} style={{ flex: 1 }}>
                  {course === item ? (
                    <LinearGradient colors={colors.gradientSuccess} style={styles.pillActive}>
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
  pillRow: { flexDirection: "row", gap: 12 },
  pillActive: { height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  pillInactive: {
    height: 50, borderRadius: 14, borderWidth: 1,
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
  countCircleActive: { backgroundColor: "#059669", borderColor: "#10B981" },
  countText: { color: "#64748B", fontSize: 15, fontWeight: "700" },
  countTextActive: { color: "#FFF" },
  btnWrap: { borderRadius: 16, overflow: "hidden", marginTop: 28 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 17 },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "900", letterSpacing: 1.5 },
});
