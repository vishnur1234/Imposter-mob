import React, { useState, useEffect } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator, Dimensions, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { doc, collection, query, limit, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function GlobalRankingScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [rankings, setRankings] = useState([]);

  const myUid = auth.currentUser?.uid || "guest";

  const getAvatarColor = (uid, name) => {
    const colorsList = ["#3B82F6", "#10B981", "#EC4899", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"];
    const charSum = (name || uid || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorsList[charSum % colorsList.length];
  };

  useEffect(() => {
    let unsubUser = () => { };
    let unsubRankings = () => { };

    // 1. Listen to current user stats in real-time
    if (myUid !== "guest") {
      unsubUser = onSnapshot(doc(db, "user_stats", myUid), (snap) => {
        if (snap.exists()) {
          setUserStats(snap.data());
        }
      });
    }

    // 2. Listen to top scores from Firestore in real-time (Real Player Data)
    const q = query(collection(db, "user_stats"), orderBy("highScore", "desc"), limit(50));
    unsubRankings = onSnapshot(q, (snap) => {
      const firestoreRankings = [];
      snap.forEach((doc) => {
        const data = doc.data();
        firestoreRankings.push({
          ...data,
          uid: data.uid || doc.id,
          avatarColor: getAvatarColor(data.uid || doc.id, data.name)
        });
      });
      setRankings(firestoreRankings);
      setLoading(false);
    }, (err) => {
      console.error("Error loading rankings:", err);
      setLoading(false);
    });

    return () => {
      unsubUser();
      unsubRankings();
    };
  }, [myUid]);

  if (loading) {
    return (
      <LinearGradient colors={colors.gradientBg} style={styles.centerBg}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body2, { color: colors.textSecondary, marginTop: 12 }]}>Loading Rankings...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>

        {/* Banner Header */}
        <LinearGradient colors={["#1E40AF", "#3B82F6"]} style={styles.bannerHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.bannerContent}>
            <View style={styles.shieldWrapper}>
              <View style={styles.circleBehindShield} />
              <Ionicons name="shield-checkmark" size={64} color="#E2E8F0" />
              <Ionicons name="trophy" size={26} color="#FBBF24" style={styles.trophyOverlay} />
            </View>
            <Text style={[styles.bannerTitle, typography.h2, { color: "#FFFFFF" }]}>
              Global Ranking
            </Text>
          </View>
        </LinearGradient>

        {/* Dropdown Filter Bar */}
        <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.filterPill, { backgroundColor: colors.isDark ? "#0A0A0A" : "#F1F5F9", borderColor: colors.border }]} activeOpacity={0.8}>
            <Text style={[styles.filterPillText, typography.body2, { color: colors.textPrimary }]}>Weekly</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        {/* Scrollable list */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {rankings.map((player, index) => {
            const rank = index + 1; // Ranks start at 1
            const isRank1 = rank === 1;
            const isRank2 = rank === 2;
            const isRank3 = rank === 3;
            const isTopRank = isRank1 || isRank2 || isRank3;
            const isMe = player.uid === myUid;

            // Determine badge color/style
            let badgeBg = "transparent";
            let badgeIconColor = colors.textSecondary;
            if (isRank1) { badgeBg = "#F59E0B"; badgeIconColor = "#FFF"; } // Gold
            else if (isRank2) { badgeBg = "#94A3B8"; badgeIconColor = "#FFF"; } // Silver
            else if (isRank3) { badgeBg = "#D97706"; badgeIconColor = "#FFF"; } // Bronze

            // Display score string
            let scoreStr = player.scoreText || player.highScore;
            if (typeof player.highScore === "number" && player.highScore >= 1000 && !player.scoreText) {
              scoreStr = `${(player.highScore / 1000).toFixed(0)}K`;
            }

            // Avatar initial and colors
            const initial = player.name ? player.name[0].toUpperCase() : "?";
            const avatarBg = player.avatarColor || colors.primaryLight;

            return (
              <View
                key={player.uid || index}
                style={[
                  styles.rankingRow,
                  {
                    backgroundColor: isMe
                      ? (colors.isDark ? "rgba(20, 101, 241, 0.15)" : "#E3F0FF")
                      : (colors.isDark ? "rgba(255, 255, 255, 0.03)" : "#FFFFFF"),
                    borderColor: isMe ? colors.primary : (colors.isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0"),
                    borderWidth: 1.2,
                    borderRadius: 16,
                    marginVertical: 4,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    shadowColor: isMe ? colors.primary : "#000",
                    shadowOpacity: isMe ? 0.15 : 0.02,
                    shadowRadius: isMe ? 8 : 4,
                    elevation: isMe ? 3 : 1,
                  }
                ]}
              >
                {/* Rank Badge */}
                <View style={styles.rankWrapper}>
                  {isTopRank ? (
                    <View style={[styles.shieldBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.shieldBadgeText, typography.btn2]}>{rank}</Text>
                    </View>
                  ) : (
                    <View style={styles.circleBadge}>
                      <Text style={[styles.circleBadgeText, typography.body3, { color: colors.textSecondary }]}>{rank}</Text>
                    </View>
                  )}
                </View>

                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                  <Text style={[styles.avatarText, typography.btn2, { color: colors.isDark ? "#FFF" : colors.primary }]}>
                    {initial}
                  </Text>
                  {isTopRank && (
                    <View style={styles.miniCrown}>
                      <Ionicons name="ribbon" size={10} color="#FBBF24" />
                    </View>
                  )}
                </View>

                {/* Name */}
                <View style={styles.nameContainer}>
                  <Text
                    style={[
                      styles.playerName,
                      typography.body1,
                      {
                        color: isMe ? colors.primary : colors.textPrimary,
                        fontWeight: isMe ? "900" : "700"
                      }
                    ]}
                    numberOfLines={1}
                  >
                    {player.name || "Player"}
                  </Text>
                  {isMe && (
                    <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.youBadgeText}>YOU</Text>
                    </View>
                  )}
                </View>

                {/* Score */}
                <Text style={[styles.playerScore, typography.h5, { color: isMe ? colors.primary : colors.textSecondary }]}>
                  {scoreStr}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Sticky bottom panel */}
        <View style={[styles.currentUserPanel, { backgroundColor: colors.isDark ? "#0A0A0A" : "#FFFFFF", borderTopColor: colors.border }]}>
          <View style={styles.currentUserLeft}>
            <View style={[styles.avatarMini, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarMiniText, typography.btn2, { color: colors.primary }]}>
                {auth.currentUser?.email?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
            <Text style={[styles.currentUserName, typography.body1, { color: colors.textPrimary }]} numberOfLines={1}>
              {userStats?.playerName || userStats?.name || "Player"} (You)
            </Text>
          </View>
          <Text style={[styles.currentUserScore, typography.h3, { color: colors.textPrimary }]}>
            {userStats?.highScore ?? 0}
          </Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  centerBg: { flex: 1, justifyContent: "center", alignItems: "center" },
  bannerHeader: {
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerContent: {
    alignItems: "center",
    marginTop: 10,
  },
  shieldWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  circleBehindShield: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  trophyOverlay: {
    position: "absolute",
    bottom: 2,
    right: 2,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  filterBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90, // room for sticky panel
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rankWrapper: {
    width: 36,
    alignItems: "flex-start",
  },
  shieldBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  shieldBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  circleBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  circleBadgeText: {
    fontWeight: "bold",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "900",
  },
  miniCrown: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#FBBF24",
    justifyContent: "center",
    alignItems: "center",
  },
  playerName: {
    flex: 1,
    fontWeight: "700",
  },
  nameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  youBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  youBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  playerScore: {
    fontWeight: "bold",
  },

  // Sticky bottom panel styles
  currentUserPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  currentUserLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarMiniText: {
    fontSize: 15,
    fontWeight: "900",
  },
  currentUserName: {
    fontWeight: "900",
    fontSize: 15,
    marginLeft: 12,
  },
  currentUserScore: {
    fontWeight: "900",
  },
});
