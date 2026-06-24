import React from "react";
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold, Outfit_900Black } from "@expo-google-fonts/outfit";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import AppNavigator from "../src/navigation/AppNavigator";

export default function AppRoutes() {
  const [fontsLoaded] = useFonts({
    "Outfit-Regular": Outfit_400Regular,
    "Outfit-Medium": Outfit_500Medium,
    "Outfit-SemiBold": Outfit_600SemiBold,
    "Outfit-Bold": Outfit_700Bold,
    "Outfit-ExtraBold": Outfit_800ExtraBold,
    "Outfit-Black": Outfit_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000" }}>
        <ActivityIndicator size="large" color="#1465F1" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
