import React, { useState } from "react";
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import topics from "../data/demoData";

const { width } = Dimensions.get("window");

export default function StudyCenterScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [expandedCards, setExpandedCards] = useState({});

  const categories = [
    { key: "all", label: "All" },
    { key: "finance", label: "Finance" },
    { key: "business", label: "Business" },
    { key: "movies", label: "Movies" },
    { key: "sports", label: "Sports" },
    { key: "anime", label: "Anime" },
    { key: "science", label: "Science" },
    { key: "history", label: "History" },
    { key: "technology", label: "Technology" },
    { key: "food", label: "Food" },
    { key: "countries", label: "Countries" },
    { key: "medicine", label: "Medicine" },
    { key: "programming", label: "Programming" },
    { key: "music", label: "Music" }
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case "finance": return colors.error;
      case "business": return colors.success;
      case "movies": return colors.primary;
      case "sports": return "#EAB308";
      case "anime": return "#EC4899";
      case "science": return "#06B6D4";
      case "history": return "#8B5CF6";
      case "technology": return "#3B82F6";
      case "food": return "#F97316";
      case "countries": return "#84CC16";
      case "medicine": return "#EF4444";
      case "programming": return "#10B981";
      case "music": return "#6366F1";
      default: return colors.textSecondary;
    }
  };

  const getCategoryLabel = (category) => {
    return category.toUpperCase();
  };

  const toggleCard = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter topics based on selected category tab and search query
  const filteredTopics = topics.filter(topic => {
    let matchesTab = selectedTab === "all";
    if (!matchesTab) {
      if (selectedTab === "finance") {
        matchesTab = topic.category === "finance" || topic.category === "financial";
      } else if (selectedTab === "business") {
        matchesTab = topic.category === "business" || topic.category === "bank";
      } else if (selectedTab === "movies") {
        matchesTab = topic.category === "movies" || topic.category === "movie";
      } else {
        matchesTab = topic.category === selectedTab;
      }
    }
    const matchesSearch = 
      topic.answer.toLowerCase().includes(searchQuery.toLowerCase()) || 
      topic.clue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <LinearGradient colors={colors.gradientBg} locations={[0, 0.4, 1]} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: "transparent" }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.headerTitle, typography.sub2, { color: colors.textPrimary }]}>STUDY CENTER</Text>
            <Text style={[styles.headerSubtitle, typography.sub8, { color: colors.textSecondary }]}>Revision Guide</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textDisabled} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search topics or definitions..."
              placeholderTextColor={colors.textDisabled}
              style={[styles.searchInput, typography.body1, { color: colors.textPrimary }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {categories.map((tab) => {
              const active = selectedTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setSelectedTab(tab.key)}
                  activeOpacity={0.8}
                  style={[
                    styles.tabButton,
                    { 
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? (colors.isDark ? "rgba(20,101,241,0.15)" : colors.primaryLight) : colors.surface
                    }
                  ]}
                >
                  <Text 
                    style={[
                      typography.body3, 
                      { 
                        color: active ? colors.primary : colors.textSecondary,
                        fontWeight: active ? "bold" : "600" 
                      }
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Topics List */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic) => {
              const isExpanded = !!expandedCards[topic.id];
              const accentColor = getCategoryColor(topic.category);
              const label = getCategoryLabel(topic.category);
              
              return (
                <TouchableOpacity
                  key={topic.id}
                  activeOpacity={0.9}
                  onPress={() => toggleCard(topic.id)}
                  style={[styles.topicCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  {/* Card Main Row */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={[styles.badge, { backgroundColor: `${accentColor}15` }]}>
                          <Text style={[typography.sub8, { color: accentColor, fontWeight: "bold" }]}>{label}</Text>
                        </View>
                        <Text style={[typography.sub8, { color: colors.textDisabled }]}>ID: #{topic.id}</Text>
                      </View>
                      <Text style={[typography.h4, { color: colors.textPrimary, marginTop: 6, fontWeight: "bold" }]}>
                        {topic.answer}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </View>

                  {/* Expandable clue description area */}
                  {isExpanded && (
                    <View style={[styles.expandedArea, { borderTopColor: colors.border }]}>
                      <Text style={[typography.sub8, { color: colors.textSecondary, letterSpacing: 1 }]}>
                        EXAM REVISION CLUE / DEFINITION
                      </Text>
                      <View style={[styles.clueBubble, { backgroundColor: colors.isDark ? "#0A0A0A" : "#F8FAFC", borderColor: colors.border }]}>
                        <Ionicons name="bulb" size={16} color="#FBBF24" style={{ marginTop: 2 }} />
                        <Text style={[typography.body1, { color: colors.textPrimary, flex: 1, lineHeight: 22 }]}>
                          {topic.clue}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.textDisabled} style={{ marginBottom: 12 }} />
              <Text style={[typography.body2, { color: colors.textSecondary, textAlign: "center" }]}>
                No revision topics found matching your query.
              </Text>
            </View>
          )}
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
  headerSubtitle: { fontSize: 9, letterSpacing: 1, marginTop: 1, textAlign: "center" },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  tabsWrapper: {
    marginBottom: 10,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 6,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  topicCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  expandedArea: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  clueBubble: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
});
