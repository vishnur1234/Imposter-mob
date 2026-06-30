import React, { useState, useRef } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, TextInput,
  Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext";

export default function MultiplayerLobbyScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const CODE_LENGTH = 6;
  const chars = roomCode.toUpperCase().split("");
  const codeChars = [...chars, ...Array(CODE_LENGTH).fill("")].slice(0, CODE_LENGTH);

  const handleJoinRoom = async () => {
    if (roomCode.length < CODE_LENGTH) {
      Alert.alert("Error", "Please enter a 6-character room code.");
      return;
    }
    setLoading(true);
    try {
      const code = roomCode.toUpperCase();
      const roomRef = doc(db, "rooms", code);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        Alert.alert("Error", "Room not found.");
        setLoading(false);
        return;
      }
      const data = snap.data();
      const playersList = data.players || [];
      const capacity = data.playersRequired || data.players || 4;
      const myUid = auth.currentUser?.uid || "guest";
      const alreadyInRoom = playersList.some((p) => p.uid === myUid);

      if (!alreadyInRoom && playersList.length >= capacity) {
        Alert.alert("Error", "Room is full.");
        setLoading(false);
        return;
      }

      const emailPrefix = auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "Guest";
      const playerObj = { uid: myUid, name: emailPrefix, score: 0 };

      if (!alreadyInRoom) {
        await updateDoc(roomRef, {
          players: arrayUnion(playerObj),
          playerList: arrayUnion({ uid: myUid, name: emailPrefix }), // compatibility
        });
      }

      navigation.navigate("WaitingRoom", {
        roomCode: code,
        course: data.category || data.course,
        players: capacity,
        isHost: data.hostId === myUid,
        isDemoMode: false,
      });
    } catch (e) {
      Alert.alert("Error", e.message);
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
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>MULTIPLAYER</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Create Room */}
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.panelHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.isDark ? "rgba(0,185,111,0.08)" : "#ECFDF5", borderColor: colors.isDark ? "rgba(0,185,111,0.3)" : "rgba(16,185,129,0.15)" }]}>
                  <Ionicons name="satellite-outline" size={22} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.panelTitle, typography.h6, { color: colors.textPrimary }]}>Create Room</Text>
                  <Text style={[styles.panelSub, typography.sub3, { color: colors.textSecondary }]}>Generate a code & invite friends</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("CreateRoom")} activeOpacity={0.85} style={styles.emeraldBtnWrap}>
                <LinearGradient colors={colors.gradientSuccess} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emeraldBtn}>
                  <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                  <Text style={[styles.emeraldBtnText, typography.btn2]}>Create Room</Text>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" style={{ marginLeft: "auto" }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divRow}>
              <View style={[styles.divLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.divLabel, typography.sub2, { color: colors.textDisabled }]}>OR JOIN EXISTING</Text>
              <View style={[styles.divLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Join Room */}
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.panelHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.isDark ? "rgba(20,101,241,0.08)" : "#EFF6FF", borderColor: colors.isDark ? "rgba(20,101,241,0.3)" : "rgba(37,99,235,0.15)" }]}>
                  <Ionicons name="key-outline" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.panelTitle, typography.h6, { color: colors.textPrimary }]}>Join Room</Text>
                  <Text style={[styles.panelSub, typography.sub3, { color: colors.textSecondary }]}>Enter the 6-character access code</Text>
                </View>
              </View>

              <Text style={[styles.codeLabel, typography.sub2, { color: colors.primary }]}>ROOM CODE</Text>
              {/* 6-block code input */}
              <TouchableOpacity onPress={() => inputRef.current?.focus()} activeOpacity={1} style={styles.codeWrapper}>
                {codeChars.map((char, i) => {
                  const filled = char !== "";
                  const cursor = i === roomCode.length;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.codeBlock,
                        {
                          backgroundColor: colors.isDark ? "#000000" : "#F8FAFC",
                          borderColor: colors.border,
                        },
                        filled && {
                          backgroundColor: colors.isDark ? "rgba(20,101,241,0.1)" : "#EFF6FF",
                          borderColor: colors.primary,
                        },
                        cursor && {
                          borderColor: colors.primary,
                        }
                      ]}
                    >
                      <Text style={[styles.codeBlockChar, typography.h3, { color: colors.primary }]}>{char}</Text>
                      {cursor && <View style={[styles.codeCaret, { backgroundColor: colors.primary }]} />}
                    </View>
                  );
                })}
                <TextInput
                  ref={inputRef}
                  value={roomCode}
                  onChangeText={(v) => setRoomCode(v.toUpperCase().slice(0, CODE_LENGTH))}
                  onSubmitEditing={handleJoinRoom}
                  style={styles.hiddenInput}
                  maxLength={CODE_LENGTH}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleJoinRoom}
                disabled={loading || roomCode.length < CODE_LENGTH}
                activeOpacity={0.85}
                style={[styles.violetBtnWrap, roomCode.length < CODE_LENGTH && { opacity: 0.45 }]}
              >
                <LinearGradient colors={colors.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.violetBtn}>
                  {loading
                    ? <ActivityIndicator size="small" color="#FFF" />
                    : <><Ionicons name="enter-outline" size={18} color="#FFF" /><Text style={[styles.violetBtnText, typography.btn2]}>Join Room</Text><Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" style={{ marginLeft: "auto" }} /></>
                  }
                </LinearGradient>
              </TouchableOpacity>

              {roomCode.length > 0 && roomCode.length < CODE_LENGTH && (
                <Text style={[styles.codeHint, typography.body3, { color: colors.primary }]}>{CODE_LENGTH - roomCode.length} more character{CODE_LENGTH - roomCode.length !== 1 ? "s" : ""} needed</Text>
              )}
            </View>
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
  scroll: { padding: 20 },

  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22, borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden", marginBottom: 16, padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  panelTopLine: { marginBottom: 16 },
  panelHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  iconBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  iconBoxEmerald: { backgroundColor: "#ECFDF5", borderColor: "rgba(16,185,129,0.15)" },
  iconBoxViolet: { backgroundColor: "#EFF6FF", borderColor: "rgba(37,99,235,0.15)" },
  panelTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A", letterSpacing: 0.4 },
  panelSub: { fontSize: 12, color: "#64748B", marginTop: 2 },

  emeraldBtnWrap: { borderRadius: 14, overflow: "hidden" },
  emeraldBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, paddingHorizontal: 18 },
  emeraldBtnText: { color: "#FFF", fontSize: 14, fontWeight: "800", letterSpacing: 0.8 },

  divRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  divLabel: { fontSize: 10, color: "#94A3B8", letterSpacing: 1.5, fontWeight: "700" },

  codeLabel: { fontSize: 10, fontWeight: "700", color: "#2563EB", letterSpacing: 1.5, marginBottom: 12 },
  codeWrapper: { flexDirection: "row", gap: 8, height: 58, marginBottom: 16, position: "relative" },
  codeBlock: {
    flex: 1, height: 58, borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1, borderColor: "#E2E8F0",
    justifyContent: "center", alignItems: "center",
  },
  codeBlockFilled: { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
  codeBlockCursor: { borderColor: "#2563EB" },
  codeBlockChar: { color: "#2563EB", fontSize: 20, fontWeight: "900" },
  codeCaret: { width: 2, height: 20, backgroundColor: "#2563EB", position: "absolute" },
  hiddenInput: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0 },

  violetBtnWrap: { borderRadius: 14, overflow: "hidden", marginBottom: 8 },
  violetBtn: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, paddingHorizontal: 18 },
  violetBtnText: { color: "#FFF", fontSize: 14, fontWeight: "800", letterSpacing: 0.8 },

  codeHint: { textAlign: "center", fontSize: 11, color: "#2563EB", letterSpacing: 0.5 },
});
