import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  Alert,
  TextInput,
} from "react-native";

import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const { theme, toggleTheme, colors, typography } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const [stats, setStats] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [gamingName, setGamingName] = useState("");

  useEffect(() => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return;

    const unsub = onSnapshot(doc(db, "user_stats", myUid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats(data);
        if (!data.playerName) {
          setGamingName(auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "Player");
          setShowNameModal(true);
        } else {
          setShowNameModal(false);
        }
      } else {
        setGamingName(auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : "Player");
        setShowNameModal(true);
      }
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log(e);
    }
  };


  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000, // Smooth 20s rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spinOuter = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const spinOuterInverse = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });

  const spinMiddle = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"], // Counter-clockwise
  });
  const spinMiddleInverse = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-360deg", "0deg"],
  });

  const spinInner = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const spinInnerInverse = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });

  const outerItems = [
    { name: "trophy", color: "#FBBF24", size: 24, itemSize: 52 },
    { name: "people", color: "#10B981", size: 24, itemSize: 52 },
    { name: "book", color: "#3B82F6", size: 24, itemSize: 52 },
    { name: "ribbon", color: "#EC4899", size: 24, itemSize: 52 },
  ];

  const middleItems = [
    { name: "game-controller", color: "#8B5CF6", size: 20, itemSize: 44 },
    { name: "chatbubble-ellipses", color: "#EF4444", size: 20, itemSize: 44 },
  ];

  const innerItems = [
    { name: "shield-checkmark", color: "#06B6D4", size: 18, itemSize: 38 },
    { name: "help-circle", color: "#F59E0B", size: 18, itemSize: 38 },
  ];

  const renderOrbitalRing = (radius, items, rotation, rotationInverse) => {
    const size = radius * 2;
    return (
      <Animated.View
        style={[
          styles.orbitalRingContainer,
          {
            width: size,
            height: size,
            borderRadius: radius,
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        {items.map((item, index) => {
          const angle = (index * 2 * Math.PI) / items.length - Math.PI / 2;
          const x = radius + radius * Math.cos(angle);
          const y = radius + radius * Math.sin(angle);
          const itemSize = item.itemSize;

          return (
            <Animated.View
              key={index}
              style={[
                styles.orbitalItemWrap,
                {
                  left: x - itemSize / 2,
                  top: y - itemSize / 2,
                  width: itemSize,
                  height: itemSize,
                  transform: [{ rotate: rotationInverse }],
                },
              ]}
            >
              <View
                style={[
                  styles.iconBubble,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: itemSize / 2,
                    shadowColor: item.color,
                    shadowOpacity: 0.15,
                    shadowRadius: 5,
                    elevation: 3,
                  },
                ]}
              >
                <Ionicons name={item.name} size={item.size} color={item.color} />
              </View>
            </Animated.View>
          );
        })}
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={colors.gradientBg}
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.isDark ? "#0A0A0A" : "#FFFFFF" }]}>

        <View style={[styles.navBar, { borderBottomColor: colors.border, backgroundColor: colors.isDark ? "#0A0A0A" : "#FFFFFF" }]}>
          <View style={styles.navBrand}>
            <Image
              source={require("../../assets/elanceIcon.png")}
              style={styles.brandIcon}
              resizeMode="contain"
            />
            <Text style={[styles.brandText, { color: colors.isDark ? "#FFFFFF" : "#0F172A" }]}>
              ELANCE
            </Text>
          </View>

          <View style={styles.headerRight}>
            {/* Clickable Score Pill */}
            <TouchableOpacity
              onPress={() => setHistoryModalVisible(true)}
              activeOpacity={0.8}
              style={[styles.tokenPill, { backgroundColor: colors.isDark ? "#121212" : "#F8FAFC", borderColor: colors.border, marginRight: 4 }]}
            >
              <Ionicons name="trophy" size={13} color="#FBBF24" />
              <Text style={[styles.tokenText, typography.body4, { color: colors.textPrimary, fontWeight: "bold" }]}>
                {stats?.highScore ?? 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={[styles.themeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
              <Feather name="user" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
              <Feather name={theme === "light" ? "moon" : "sun"} size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
              <Feather name="log-out" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeIn, flex: 1, width: "100%", justifyContent: "space-between", alignItems: "center" }}>

            <View style={styles.topGroup}>

              <View style={styles.titleBlock}>
                <Text style={[styles.mainTitle, typography.h1, { color: colors.textPrimary }]}>IMPOSTER</Text>
                <View style={styles.tagRow}>
                  <View style={[styles.tag, { borderColor: colors.border, backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : colors.primaryLight }]}>
                    <Ionicons name="school-outline" size={10} color={colors.primary} />
                    <Text style={[styles.tagText, typography.sub2, { color: colors.primary }]}>ACCA • CMA REVISION</Text>
                  </View>

                  {/* <View style={[styles.liveBadge, { backgroundColor: colors.isDark ? "rgba(0,185,111,0.15)" : "#ECFDF5", borderColor: colors.isDark ? "rgba(0,185,111,0.2)" : "rgba(16,185,129,0.15)" }]}>
                    <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.liveText, typography.sub8, { color: colors.success }]}>2,841 online</Text>
                  </View> */}
                </View>
              </View>


              <View style={styles.orbitalWrap}>

                <View style={[styles.orbitTrack, { width: 300, height: 300, borderRadius: 150, borderColor: colors.isDark ? "rgba(255,255,255,0.08)" : "rgba(37,99,235,0.06)" }]} />
                <View style={[styles.orbitTrack, { width: 220, height: 220, borderRadius: 110, borderColor: colors.isDark ? "rgba(255,255,255,0.08)" : "rgba(37,99,235,0.06)" }]} />
                <View style={[styles.orbitTrack, { width: 140, height: 140, borderRadius: 70, borderColor: colors.isDark ? "rgba(255,255,255,0.08)" : "rgba(37,99,235,0.06)" }]} />


                {renderOrbitalRing(150, outerItems, spinOuter, spinOuterInverse)}
                {renderOrbitalRing(110, middleItems, spinMiddle, spinMiddleInverse)}
                {renderOrbitalRing(70, innerItems, spinInner, spinInnerInverse)}


                <View
                  style={[
                    styles.radarCenter,
                    {
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1.5,
                      shadowColor: colors.primary,
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 4,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="gamepad-variant" size={32} color={colors.primary} />
                </View>
              </View>
            </View>


            <View style={styles.cardsSection}>

              {/* <TouchableOpacity
                onPress={() => navigation.navigate("SoloSetup")}
                activeOpacity={0.88}
                style={[styles.modeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.modeCardBody}>
                  <View style={[styles.modeIconBox, { backgroundColor: colors.isDark ? "rgba(20,101,241,0.15)" : colors.primaryLight, borderColor: colors.isDark ? "rgba(20,101,241,0.3)" : "rgba(37,99,235,0.15)" }]}>
                    <Ionicons name="game-controller-outline" size={24} color={colors.primary} />
                  </View>

                  <View style={styles.modeTextWrap}>
                    <Text style={[styles.modeTitle, typography.h5, { color: colors.textPrimary }]}>Offline</Text>
                    <Text style={[styles.modeSub, typography.body2, { color: colors.textSecondary }]}>Pass & Play • 3–10 Players • 1 Device</Text>
                  </View>

                  <View style={[styles.modeArrow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity> */}


              <TouchableOpacity
                onPress={() => navigation.navigate("MultiplayerLobby")}
                activeOpacity={0.88}
                style={[styles.modeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.modeCardBody}>
                  <View style={[styles.modeIconBox, { backgroundColor: colors.isDark ? "rgba(0,185,111,0.15)" : "#ECFDF5", borderColor: colors.isDark ? "rgba(0,185,111,0.3)" : "rgba(16,185,129,0.15)" }]}>
                    <Ionicons name="wifi-outline" size={24} color={colors.success} />
                  </View>

                  <View style={styles.modeTextWrap}>
                    <Text style={[styles.modeTitle, typography.h5, { color: colors.textPrimary }]}>Online</Text>
                    <Text style={[styles.modeSub, typography.body2, { color: colors.textSecondary }]}>Online • Real-Time • Challenge Friends</Text>
                  </View>

                  <View style={[styles.modeArrow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="chevron-forward" size={18} color={colors.success} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>


            <View style={styles.bottomGroup}>

              <View style={styles.statsStrip}>
                {[
                  { icon: "gift-outline", label: "Daily Reward", color: colors.warning },
                  { icon: "information-circle-outline", label: "Game Rules", color: colors.success },
                  { icon: "ribbon-outline", label: "Top Rank", color: colors.primary },
                ].map(({ icon, label, color }) => {
                  const isTopRank = label === "Top Rank";
                  const isDailyReward = label === "Daily Reward";
                  const isGameRules = label === "Game Rules";
                  const CardComponent = (isTopRank || isDailyReward || isGameRules) ? TouchableOpacity : View;

                  const getPressAction = () => {
                    if (isTopRank) return () => navigation.navigate("GlobalRanking");
                    if (isDailyReward) return () => navigation.navigate("DailyReward");
                    if (isGameRules) return () => navigation.navigate("GameRules");
                    return undefined;
                  };

                  return (
                    <CardComponent
                      key={label}
                      onPress={getPressAction()}
                      activeOpacity={(isTopRank || isDailyReward || isGameRules) ? 0.8 : undefined}
                      style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <View style={[styles.statIcon, { borderColor: `${color}22`, backgroundColor: `${color}11` }]}>
                        <Ionicons name={icon} size={20} color={color} />
                      </View>
                      <Text style={[styles.statLabel, typography.sub8, { color: colors.textSecondary }]}>{label}</Text>
                    </CardComponent>
                  );
                })}
              </View>


              <View style={styles.footerRow}>
                <Ionicons name="book-outline" size={12} color={colors.textDisabled} />
                <Text style={[styles.footerText, typography.sub2, { color: colors.textSecondary }]}>Study • Play • Compete</Text>
                <Ionicons name="book-outline" size={12} color={colors.textDisabled} />
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Coin History Modal */}
        <Modal
          visible={historyModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setHistoryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={[styles.modalIconBox, { backgroundColor: colors.isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7" }]}>
                    <Ionicons name="trophy" size={20} color="#FBBF24" />
                  </View>
                  <View>
                    <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: "bold" }]}>Coin History</Text>
                    <Text style={[typography.body3, { color: colors.textSecondary }]}>Your match records</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setHistoryModalVisible(false)} style={[styles.closeBtn, { backgroundColor: colors.isDark ? "#121212" : "#F1F5F9" }]}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Total Balance */}
              <View style={[styles.balanceSection, { backgroundColor: colors.isDark ? "#0A0A0A" : "#F8FAFC", borderColor: colors.border }]}>
                <Text style={[typography.sub7, { color: colors.textSecondary }]}>TOTAL COINS ACCUMULATED</Text>
                <Text style={[typography.h1, { color: colors.textPrimary, marginTop: 4, fontWeight: "900" }]}>
                  {stats?.highScore ?? 0} <Text style={[typography.body2, { color: colors.textSecondary }]}>coins</Text>
                </Text>
              </View>

              {/* History List */}
              <ScrollView style={styles.historyList} contentContainerStyle={{ paddingBottom: 24, gap: 10 }}>
                {stats?.matchHistory && stats.matchHistory.length > 0 ? (
                  [...stats.matchHistory]
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .map((item, idx) => {
                      const dateStr = item.timestamp
                        ? new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "Unknown Date";
                      const earned = item.score ?? 0;
                      return (
                        <View key={item.gameId || idx} style={[styles.historyRowItem, { borderColor: colors.border, backgroundColor: colors.isDark ? "#080808" : "#FFFFFF" }]}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              <Text style={[typography.body1, { color: colors.textPrimary, fontWeight: "bold" }]}>Room: {item.roomCode || "N/A"}</Text>
                              <View style={[styles.gameIdBadge, { backgroundColor: colors.isDark ? "#1E1E1E" : "#F1F5F9" }]}>
                                <Text style={[typography.sub8, { color: colors.textSecondary, fontSize: 8 }]}>ID: {item.gameId || "N/A"}</Text>
                              </View>
                            </View>
                            <Text style={[typography.body3, { color: colors.textSecondary, marginTop: 2 }]}>{dateStr}</Text>
                          </View>
                          <View style={styles.earnedPointsWrap}>
                            <Text style={[typography.body1, { color: earned > 0 ? colors.success : colors.textSecondary, fontWeight: "bold" }]}>
                              {earned > 0 ? `+${earned}` : `+0`}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color={colors.textDisabled} style={{ marginBottom: 12 }} />
                    <Text style={[typography.body2, { color: colors.textSecondary, textAlign: "center" }]}>No matches played yet.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showNameModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => { }} // Non-dismissable
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border, maxHeight: 320 }]}>
                  {/* Header */}
                  <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={[styles.modalIconBox, { backgroundColor: colors.isDark ? "rgba(139,92,246,0.15)" : "#F5F3FF" }]}>
                        <Ionicons name="game-controller" size={20} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={[typography.h4, { color: colors.textPrimary, fontWeight: "bold" }]}>Choose Gaming Tag</Text>
                        <Text style={[typography.body3, { color: colors.textSecondary }]}>Set your display name</Text>
                      </View>
                    </View>
                  </View>

                  {/* Form Content */}
                  <View style={{ padding: 20, gap: 16 }}>
                    <Text style={[typography.body3, { color: colors.textSecondary }]}>
                      Please choose a gaming name before you play. Other players will see this name.
                    </Text>

                    <View style={{ width: "100%", marginBottom: 16 }}>
                      <TextInput
                        value={gamingName}
                        onChangeText={setGamingName}
                        placeholder="Enter gaming tag..."
                        placeholderTextColor={colors.textDisabled}
                        maxLength={18}
                        style={[
                          typography.body1,
                          {
                            backgroundColor: colors.isDark ? "#000000" : "#F8FAFC",
                            borderColor: colors.border,
                            color: colors.textPrimary,
                            height: 48,
                            borderWidth: 1,
                            borderRadius: 10,
                            paddingHorizontal: 16,
                          }
                        ]}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={async () => {
                        const cleanName = gamingName.trim();
                        if (!cleanName) {
                          Alert.alert("Input Required", "Please enter a valid gaming name.");
                          return;
                        }
                        try {
                          const myUid = auth.currentUser?.uid;
                          if (!myUid) return;

                          const statsRef = doc(db, "user_stats", myUid);
                          await setDoc(statsRef, {
                            playerName: cleanName,
                            name: cleanName // for standard compatibility
                          }, { merge: true });

                          setShowNameModal(false);
                        } catch (e) {
                          Alert.alert("Error", `Failed to save name: ${e.message}`);
                        }
                      }}
                      style={{ backgroundColor: colors.primary, height: 48, borderRadius: 10, justifyContent: "center", alignItems: "center" }}
                      activeOpacity={0.8}
                    >
                      <Text style={[typography.btn1, { color: "#FFF", fontWeight: "bold" }]}>SAVE AND CONTINUE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const RING_SIZE = 136;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  /* Nav */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  navBrand: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandIcon: {
    width: 20,
    height: 20,
  },
  brandText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#0F172A",
  },
  logoImage: {
    width: 90,
    height: 24,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Scroll */
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  topGroup: {
    width: "100%",
    alignItems: "center",
  },
  bottomGroup: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },

  /* Orbital Animation */
  orbitalWrap: {
    width: 340,
    height: 340,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    position: "relative",
  },
  orbitTrack: {
    position: "absolute",
    borderWidth: 1.2,
    borderColor: "rgba(37,99,235,0.06)",
  },
  orbitalRingContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  orbitalItemWrap: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBubble: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    borderWidth: 1.2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  orbitalImageAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
  },
  iconBubble: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  radarCenter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  logoNodeContainer: {
    width: 40,
    height: 40,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  logoNodeMain: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
  },
  logoNodeSub1: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    top: 4,
    right: 4,
  },
  logoNodeSub2: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    top: -1,
    right: -1,
  },

  /* Title */
  titleBlock: { alignItems: "center", marginBottom: 14 },
  mainTitle: {
    fontSize: 40,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 6,
  },
  tagRow: { marginTop: 12, flexDirection: "row", gap: 8, alignItems: "center" },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.15)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#EFF6FF",
  },
  tagText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#2563EB",
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.15)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
  },
  liveText: { fontSize: 9, color: "#059669", fontWeight: "600" },


  cardsSection: { width: "100%", gap: 8 },
  modeCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  modeCardBody: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  modeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  modeIconViolet: {
    backgroundColor: "#EFF6FF",
    borderColor: "rgba(37,99,235,0.15)",
  },
  modeIconEmerald: {
    backgroundColor: "#ECFDF5",
    borderColor: "rgba(16,185,129,0.15)",
  },
  modeTextWrap: { flex: 1 },
  modeTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modeSub: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
  },
  modeArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  modeArrowEmerald: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },


  statsStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
    marginTop: 4
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingVertical: 12,
    gap: 6,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "center",
  },

  /* Footer */
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 11,
    color: "#94A3B8",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreCard: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  scoreCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  scoreCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  scoreStatsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginBottom: 12,
  },
  scoreStatBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  historySection: {
    width: "100%",
    marginTop: 6,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tokenRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  tokenPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
  },
  tokenText: {
    fontSize: 11,
  },
  liveCameraWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginRight: 6,
    width: 34,
    height: 34,
  },
  liveCameraCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  liveCameraBadge: {
    position: "absolute",
    bottom: -2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  liveCameraBadgeText: {
    color: "#FFFFFF",
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    borderWidth: 1,
    height: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceSection: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
  },
  historyList: {
    flex: 1,
  },
  historyRowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  gameIdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  earnedPointsWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
});

