# Imposter Game (ACCA & CMA Revision Mobile App)

An interactive, gamified learning mobile application designed to help accounting and finance students revise for their **ACCA** (Association of Chartered Certified Accountants) and **CMA** (Certified Management Accountant) examinations. By blending the mechanics of "Imposter" / "Spyfall" social party games with academic review, the application transforms studying into an engaging, collaborative experience.

---

## 📖 Game Overview

In **Imposter Game**, players are divided into two teams: **Students** and the **Imposter**.
- **Students** are given a secret accounting, finance, or banking concept (e.g., *IAS 16*, *Basel III*, *GDP*).
- The **Imposter** is kept in the dark and only receives a vague clue.
- During the turn rounds, everyone describes the topic using exactly **one word**. Students try to prove they know the topic without giving it away, while the Imposter attempts to blend in by bluffing.
- Finally, players discuss and vote. If the Imposter is caught, they get one last bonus chance to guess the secret topic. If they guess correctly—or if they avoid being voted out—they escape and win!

---

## ✨ Key Features

1. **🔒 Secure Authentication**
   - Built on **Firebase Authentication** supporting registration and login validation.
   - Saves personalized user gameplay profiles.

2. **🎮 Multiple Game Modes**
   - **Solo Mode (Local Pass & Play):** Play with friends using a single mobile device. The screen prompts players to hand over the phone to reveal roles and proceed sequentially through local discussion and voting.
   - **Offline Connected Mode:** Host creates a local room connected to Firestore. Multiple players join on their own devices using a shared room code. The UI flow (roles, turn-taking, round ending, and voting) is synchronized in real-time across screens.
   - **Online Multiplayer Mode:** Fully connected multiplayer game with real-time Firestore synchronization, clue turn queues, customizable clue timers (1 min, 2 min, or no limit), live discussion boards, voting tallies, and automated payouts.

3. **🤖 AI-Powered Topic Generation**
   - Integrates with the **Google Gemini API** (`gemini-2.5-flash` via `@google/genai`) to generate diverse and dynamic revision topics and clues across multiple categories:
     - **ACCA / CMA:** Accounting standards, ratios, business valuations, costing.
     - **Banking:** Risk terms, interbank rates, trade finance, regulations.
     - **General:** Everyday items, places, economics concepts.
     - **Movie:** Pop culture movies, characters, film terms (for casual play).
   - **Automatic Fallback:** Gracefully falls back to a curated local database of 100+ topics if the Gemini API key is missing or encounters rate limits.

4. **📚 Interactive Study Center**
   - A dedicated revision guide displaying the game’s core syllabus database.
   - Features real-time search queries and category filters (All, ACCA Financial, CMA Banking, Economics General) to help students review terms outside of matches.

5. **💰 In-Game Economy & Daily Rewards**
   - **Coin System:** Players pay an entry fee of 50 coins to participate.
   - **Daily Rewards:** Claim free coins daily with built-in countdown clocks to prevent premature claims.
   - **Coin Ledger:** Review a detailed history of won matches, entry fees, and daily claims on the Coin History ledger.

6. **🏆 Global Ranking Leaderboard**
   - Real-time global ranking ladder pulling player stats from Firestore.
   - Showcases the top players globally with customized badge tags (`LEGEND`, `ELITE`) and medals for podium ranks.

7. **🌓 Theme Engine**
   - Light and Dark modes available across all screens.
   - Theme selections are persisted locally using `AsyncStorage`.

---

## 🛠️ Technology Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo (SDK 54)](https://expo.dev/)
- **Programming Language:** JavaScript (ES6+)
- **Navigation:** [React Navigation v7](https://reactnavigation.org/) (Native Stack Navigator)
- **Database & Authentication:** [Firebase v12](https://firebase.google.com/) (Firestore Real-time Database & Auth)
- **AI Integration:** [@google/genai SDK](https://www.npmjs.com/package/@google/genai) (Google Gemini 2.5 Flash)
- **State Management:** React Context API (Auth and Theme contexts)
- **Styling:** Vanilla React Native StyleSheet, Expo Linear Gradient
- **Typography:** Outfit Google Font (loaded via `@expo-google-fonts/outfit`)

---

## 📂 Directory Structure

```
ImposterGame/
├── App.js                     # Root component; handles routing
├── index.js                   # Application entry point registered with Expo
├── app.json                   # Expo build config
├── package.json               # Dependencies, scripts, and package metadata
├── routes/
│   └── AppRoutes.js           # Font loader and global Context wrappers
└── src/
    ├── components/
    │   ├── ImposterFace.js    # Customized vector graphic asset for logos/branding
    │   ├── LoadingScreen.js   # Reusable loading indicator overlay
    │   └── ProtectedRoute.js  # Higher-order navigation guard for authentication
    ├── context/
    │   ├── AuthContext.js     # Manages Firebase Auth states
    │   └── ThemeContext.js    # Houses colors, font definitions, and theme toggling
    ├── data/
    │   └── demoData.js        # Fallback database containing 100+ ACCA, CMA, & General topics
    ├── firebase/
    │   └── firebase.js        # Initializes Firebase Firestore and Auth connections
    ├── navigation/
    │   └── AppNavigator.js    # Sets up routes for authenticated and unauthenticated users
    ├── screens/
    │   ├── LoginScreen.js             # User login portal
    │   ├── RegisterScreen.js          # New user registration screen
    │   ├── HomeScreen.js              # Central hub (orbital menu, stats, navigation links)
    │   ├── ProfileScreen.js           # Display name editor and coin balance overview
    │   ├── DailyRewardScreen.js       # Reward chest claiming dashboard
    │   ├── GameRulesScreen.js         # Interactive step-by-step game rules guide
    │   ├── GlobalRankingScreen.js     # Top players scoreboard sorted by high score
    │   ├── CoinHistoryScreen.js       # Historical ledger of coin credits and debits
    │   ├── StudyCenterScreen.js       # Revision list guide with searching and filtering
    │   │
    │   ├── SoloSetupScreen.js         # Setup players/rules for Single Device (Pass & Play)
    │   ├── RoleRevealScreen.js        # Reveals role card to local players sequentially
    │   ├── DiscussionScreen.js        # Grid of player avatars; tap to flag suspects locally
    │   │
    │   ├── MultiplayerLobbyScreen.js  # Lobby hub to Create or Join Online rooms
    │   ├── CreateRoomScreen.js        # Host panel to set room params (mode, rounds, timers)
    │   ├── JoinRoomScreen.js          # Room entry input using numerical codes
    │   ├── WaitingRoomScreen.js       # Room lobby for online matchmaking
    │   ├── GamePlayScreen.js          # Multi-phase screen (roles, turns, discussion, voting)
    │   │
    │   ├── OfflineWaitingLobbyScreen.js  # Lobby for multi-device Offline games
    │   ├── OfflineRoleRevealScreen.js    # Role card revealer for Offline mode
    │   ├── OfflineTurnScreen.js          # Turn-taking monitor for Offline mode
    │   ├── OfflineRoundEndScreen.js      # Round recap screen offering next round or voting
    │   ├── OfflineVotingScreen.js        # Private, secret voter terminal for Offline mode
    │   └── OfflineResultScreen.js        # Game statistics, tally chart, and payout totals
    └── services/
        ├── gemini.js          # Configuration interface client for GoogleGenAI
        └── generateTopic.js   # Generates questions using Gemini AI API with fallback
```

---

## 🧮 Game Mechanics & Scoring Rules

The app uses a consistent transactional economy system to penalize guessing and reward correct detection:
- **Entry Fee:** Every player contributes **50 coins** to enter a room. This is collected into a centralized **Pot**.
- **Voting Tally:**
  - **Imposter Caught:** If the Imposter receives the most votes (or is tied for most), they are caught. 
    - The caught Imposter enters the **Bonus Round** to try and guess the exact topic.
    - If the Imposter guesses incorrectly, they fail. The **Pot** (entry fees + penalty fees) is split evenly among the Students who voted for the Imposter correctly.
    - If the Imposter guesses correctly, they escape and take the **entire Pot**!
  - **Imposter Escapes (Not Voted Out):** If the students vote out an innocent student, the Imposter survives and wins the **entire Pot**.
- **Transactional Ledger:**
  - **Winners Net Profit:** `(Total Pot / Number of Winners) - 50`
  - **Losers Net Penalty:** `-100 coins` (50 Entry Fee + 50 Penalty Fee)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your development machine.

### Installation
1. Clone the repository to your local computer:
   ```bash
   git clone https://github.com/vishnur1234/Imposter-mob
   cd ImposterGame
   ```
2. Install the node dependencies:
   ```bash
   npm install
   ```

### Execution
You can start the Expo development server:
```bash
# Start development server
npx expo start

# Run on Android Emulator/Device
npm run android

# Run on iOS Simulator/Device
npm run ios

# Run on Web Browser
npm run web
```

### Environment Configuration
1. **Firebase Setup:** Replace the configuration settings inside [firebase.js](file:///Users/elance/ImposterGame/src/firebase/firebase.js) with your project’s custom configurations.
2. **Gemini API Setup:** Set your Gemini API key in [gemini.js](file:///Users/elance/ImposterGame/src/services/gemini.js) under the `apiKey` variable.
