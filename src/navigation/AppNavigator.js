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
import ProfileScreen from "../screens/ProfileScreen";
import CoinHistoryScreen from "../screens/CoinHistoryScreen";
import GameModeScreen from "../screens/GameModeScreen";
import PnpRoleRevealScreen from "../screens/PnpRoleRevealScreen";
import PnpDiscussionScreen from "../screens/PnpDiscussionScreen";

// Offline screens
import OfflineWaitingLobbyScreen from "../screens/OfflineWaitingLobbyScreen";
import OfflineRoleRevealScreen from "../screens/OfflineRoleRevealScreen";
import OfflineTurnScreen from "../screens/OfflineTurnScreen";
import OfflineRoundEndScreen from "../screens/OfflineRoundEndScreen";
import OfflineVotingScreen from "../screens/OfflineVotingScreen";
import OfflineResultScreen from "../screens/OfflineResultScreen";

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
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="CoinHistory" component={CoinHistoryScreen} />
            <Stack.Screen name="GameMode" component={GameModeScreen} />
            <Stack.Screen name="PnpRoleReveal" component={PnpRoleRevealScreen} />
            <Stack.Screen name="PnpDiscussion" component={PnpDiscussionScreen} />

            {/* ── Offline Mode Screens ── */}
            <Stack.Screen name="OfflineWaitingLobby" component={OfflineWaitingLobbyScreen} />
            <Stack.Screen name="OfflineRoleReveal" component={OfflineRoleRevealScreen} />
            <Stack.Screen name="OfflineTurn" component={OfflineTurnScreen} />
            <Stack.Screen name="OfflineRoundEnd" component={OfflineRoundEndScreen} />
            <Stack.Screen name="OfflineVoting" component={OfflineVotingScreen} />
            <Stack.Screen name="OfflineResult" component={OfflineResultScreen} />
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
