import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import SoloSetupScreen from "../screens/SoloSetupScreen";
import MultiplayerLobbyScreen from "../screens/MultiplayerLobbyScreen";
import CreateRoomScreen from "../screens/CreateRoomScreen";
import JoinRoomScreen from "../screens/JoinRoomScreen";
import WaitingRoomScreen from "../screens/WaitingRoomScreen";
import RoleRevealScreen from "../screens/RoleRevealScreen";
import DiscussionScreen from "../screens/DiscussionScreen";
import GamePlayScreen from "../screens/GamePlayScreen";
import GlobalRankingScreen from "../screens/GlobalRankingScreen";
import DailyRewardScreen from "../screens/DailyRewardScreen";
import StudyCenterScreen from "../screens/StudyCenterScreen";
import GameRulesScreen from "../screens/GameRulesScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SoloSetup" component={SoloSetupScreen} />
            <Stack.Screen name="MultiplayerLobby" component={MultiplayerLobbyScreen} />
            <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
            <Stack.Screen name="JoinRoom" component={JoinRoomScreen} />
            <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
            <Stack.Screen name="RoleReveal" component={RoleRevealScreen} />
            <Stack.Screen name="Discussion" component={DiscussionScreen} />
            <Stack.Screen name="GamePlay" component={GamePlayScreen} />
            <Stack.Screen name="GlobalRanking" component={GlobalRankingScreen} />
            <Stack.Screen name="DailyReward" component={DailyRewardScreen} />
            <Stack.Screen name="StudyCenter" component={StudyCenterScreen} />
            <Stack.Screen name="GameRules" component={GameRulesScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
