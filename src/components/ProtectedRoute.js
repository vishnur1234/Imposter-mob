import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigation = useNavigation();
  const { colors } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [user, loading, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? children : null;
}
