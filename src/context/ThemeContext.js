import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const themeColors = {
  light: {
    isDark: false,
    primary: "#1465F1",
    primaryHover: "#1053c2",
    primaryLight: "#e3f0ff",
    secondary: "#3bb6e5",
    background: "#FFFFFF",
    surface: "#f7f9fc",
    border: "#e0e0e0",
    textPrimary: "#1A1A1A",
    textSecondary: "#4A4A4A",
    textDisabled: "#9E9E9E",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(0, 0, 0, 0.4)",
    primaryOverlay: "rgba(20, 101, 241, 0.15)",
    placeholder: "#e2e2e2",
    success: "#00B96F",
    warning: "#FFA000",
    error: "#D32F2F",
    gradientBg: ["#FFFFFF", "#F7F9FC", "#E0E0E0"],
    gradientBtn: ["#1465F1", "#3E88FC"],
    gradientPlayBtn: ["#1465F1", "#0F46A6"],
    playBtnBorder: "#1D4ED8",
    playBtnText: "#FFFFFF",
    gradientSuccess: ["#00B96F", "#10B981"],
    gradientDanger: ["#D32F2F", "#EF4444"],
  },
  dark: {
    isDark: true,
    primary: "#1465F1",
    primaryHover: "#3E88FC",
    primaryLight: "#235CEB",
    secondary: "#3bb6e5",
    background: "#000000",
    surface: "#0a0a0a",
    border: "#1f1f1f",
    textPrimary: "#ffffff",
    textSecondary: "#cccccc",
    textDisabled: "#777777",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(0, 0, 0, 0.8)",
    primaryOverlay: "rgba(20, 101, 241, 0.15)",
    placeholder: "#121212",
    success: "#00B96F",
    warning: "#FFA000",
    error: "#D32F2F",
    gradientBg: ["#051532", "#000000", "#000000"],
    gradientBtn: ["#1465F1", "#3E88FC"],
    gradientPlayBtn: ["#1E3A8A", "#0F172A"],
    playBtnBorder: "#3b82f6",
    playBtnText: "#FFFFFF",
    gradientSuccess: ["#00B96F", "#10B981"],
    gradientDanger: ["#D32F2F", "#EF4444"],
  }
};

export const typography = {
  h1: { fontFamily: "Outfit-ExtraBold", fontSize: 32, fontWeight: "normal" },
  h2: { fontFamily: "Outfit-ExtraBold", fontSize: 28, fontWeight: "normal" },
  h3: { fontFamily: "Outfit-Bold", fontSize: 24, fontWeight: "normal" },
  h4: { fontFamily: "Outfit-Bold", fontSize: 20, fontWeight: "normal" },
  h5: { fontFamily: "Outfit-Bold", fontSize: 18, fontWeight: "normal" },
  h6: { fontFamily: "Outfit-SemiBold", fontSize: 16, fontWeight: "normal" },
  h7: { fontFamily: "Outfit-Medium", fontSize: 14, fontWeight: "normal" },
  h8: { fontFamily: "Outfit-Bold", fontSize: 12, fontWeight: "normal" },
  sub1: { fontFamily: "Outfit-SemiBold", fontSize: 18, fontWeight: "normal" },
  sub2: { fontFamily: "Outfit-Bold", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: "normal" },
  sub3: { fontFamily: "Outfit-Regular", fontSize: 12, fontWeight: "normal" },
  sub4: { fontFamily: "Outfit-Bold", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: "normal" },
  sub5: { fontFamily: "Outfit-Regular", fontSize: 12, fontWeight: "normal" },
  sub6: { fontFamily: "Outfit-Regular", fontSize: 15, fontWeight: "normal" },
  sub7: { fontFamily: "Outfit-Medium", fontSize: 14, fontWeight: "normal" },
  sub8: { fontFamily: "Outfit-ExtraBold", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontWeight: "normal" },
  body1: { fontFamily: "Outfit-Regular", fontSize: 15, fontWeight: "normal" },
  body2: { fontFamily: "Outfit-Regular", fontSize: 14, fontWeight: "normal" },
  body3: { fontFamily: "Outfit-Regular", fontSize: 13, fontWeight: "normal" },
  body4: { fontFamily: "Outfit-Regular", fontSize: 11, fontWeight: "normal" },
  body5: { fontFamily: "Outfit-Regular", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: "normal" },
  btn1: { fontFamily: "Outfit-ExtraBold", fontSize: 16, letterSpacing: 1, fontWeight: "normal" },
  btn2: { fontFamily: "Outfit-Bold", fontSize: 14, letterSpacing: 1, fontWeight: "normal" },
  btn3: { fontFamily: "Outfit-Regular", fontSize: 12, fontWeight: "normal" },
  btnPlay: { fontFamily: "Outfit-Bold", fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },
  score: { fontFamily: "Outfit-Black", fontSize: 64, fontWeight: "normal" },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Load stored theme on startup
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("@app_theme");
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (e) {
        console.log("Failed to load theme preference", e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const nextTheme = theme === "light" ? "dark" : "light";
      setTheme(nextTheme);
      await AsyncStorage.setItem("@app_theme", nextTheme);
    } catch (e) {
      console.log("Failed to save theme preference", e);
    }
  };

  const colors = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, typography }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
