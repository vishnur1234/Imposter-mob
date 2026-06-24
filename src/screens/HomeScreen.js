import React, { useEffect, useRef } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const { theme, toggleTheme, colors, typography } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

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
    { isAvatar: false, source: require("../../assets/store.png"), w: 84, h: 68 },
    { isAvatar: true, source: require("../../assets/avatarbottom.png") },
    // { isAvatar: true, source: require("../../assets/avatarbottom.png") },
    { isAvatar: true, source: require("../../assets/cricketavatar.png") },
    { isAvatar: true, source: require("../../assets/girltopleft.png") },
  ];

  const middleItems = [
    { isAvatar: false, source: require("../../assets/war.png"), w: 81, h: 71 },
    { isAvatar: false, source: require("../../assets/msg.png"), w: 87, h: 58 },
  ];

  const innerItems = [
    { isAvatar: false, source: require("../../assets/image 8.png"), w: 65, h: 74 },
    { isAvatar: false, source: require("../../assets/image 10.png"), w: 71, h: 65 },
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
          const itemSize = item.isAvatar ? 64 : 92;

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
              {item.isAvatar ? (
                <View style={[styles.avatarBubble, { borderColor: colors.isDark ? "#FFFFFF" : "#000000" }]}>
                  <Image source={item.source} style={styles.orbitalImageAvatar} resizeMode="cover" />
                </View>
              ) : (
                <View style={styles.iconBubble}>
                  <Image source={item.source} style={{ width: item.w, height: item.h }} resizeMode="contain" />
                </View>
              )}
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
      <SafeAreaView style={styles.safe}>

        <View style={[styles.navBar, { borderBottomColor: colors.border, backgroundColor: colors.isDark ? "#0A0A0A" : "#FFFFFF" }]}>
          <View style={styles.navBrand}>
            <Image
              source={require("../../assets/elance.png")}
              style={[styles.logoImage, colors.isDark && { tintColor: "#FFFFFF" }]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
              <Feather name={theme === "light" ? "moon" : "sun"} size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.8}>
              <Feather name="log-out" size={16} color={colors.textSecondary} />
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

                  <View style={[styles.liveBadge, { backgroundColor: colors.isDark ? "rgba(0,185,111,0.15)" : "#ECFDF5", borderColor: colors.isDark ? "rgba(0,185,111,0.2)" : "rgba(16,185,129,0.15)" }]}>
                    <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.liveText, typography.sub8, { color: colors.success }]}>2,841 online</Text>
                  </View>
                </View>
              </View>

            
              <View style={styles.orbitalWrap}>
  
                <View style={[styles.orbitTrack, { width: 300, height: 300, borderRadius: 150, borderColor: colors.isDark ? "rgba(255,255,255,0.08)" : "rgba(37,99,235,0.06)" }]} />
                <View style={[styles.orbitTrack, { width: 220, height: 220, borderRadius: 110, borderColor: colors.isDark ? "rgba(255,255,255,0.08)" : "rgba(37,99,235,0.06)" }]} />
                <View style={[styles.orbitTrack, { width: 140, height: 140, borderRadius: 70, borderColor: colors.isDark ? "rgba(255,255,255,0.08)" : "rgba(37,99,235,0.06)" }]} />

               
                {renderOrbitalRing(150, outerItems, spinOuter, spinOuterInverse)}
                {renderOrbitalRing(110, middleItems, spinMiddle, spinMiddleInverse)}
                {renderOrbitalRing(70, innerItems, spinInner, spinInnerInverse)}

            
                <View style={styles.radarCenter}>
                  <View style={styles.logoNodeContainer}>
                    <View style={[styles.logoNodeMain, { backgroundColor: colors.textPrimary }]} />
                    <View style={[styles.logoNodeSub1, { backgroundColor: colors.textPrimary }]} />
                    <View style={[styles.logoNodeSub2, { backgroundColor: colors.textPrimary }]} />
                  </View>
                </View>
              </View>
            </View>


            <View style={styles.cardsSection}>

              <TouchableOpacity
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
              </TouchableOpacity>


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
                  { icon: "trophy-outline", label: "Boost Marks", color: colors.warning },
                  { icon: "trending-up-outline", label: "Score Higher", color: colors.success },
                  { icon: "ribbon-outline", label: "Top Rank", color: colors.primary },
                ].map(({ icon, label, color }) => (
                  <View key={label} style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.statIcon, { borderColor: `${color}22`, backgroundColor: `${color}11` }]}>
                      <Ionicons name={icon} size={20} color={color} />
                    </View>
                    <Text style={[styles.statLabel, typography.sub8, { color: colors.textSecondary }]}>{label}</Text>
                  </View>
                ))}
              </View>

              
              <View style={styles.footerRow}>
                <Ionicons name="book-outline" size={12} color={colors.textDisabled} />
                <Text style={[styles.footerText, typography.sub2, { color: colors.textSecondary }]}>Study • Play • Compete</Text>
                <Ionicons name="book-outline" size={12} color={colors.textDisabled} />
              </View>
            </View>
          </Animated.View>
        </ScrollView>
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
  navBrand: { flexDirection: "row", alignItems: "center" },
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
    marginTop:4
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
});

