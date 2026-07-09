import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldBadge: true,
  }),
});

/**
 * Requests push notification permissions from the user.
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    // console.log("Must use physical device for Push Notifications");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-reward", {
      name: "Daily Rewards",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7A",
    });
  }

  return true;
}

/**
 * Schedules a local notification to remind the user about their Daily Reward.
 * @param {number} secondsInFuture - Time in seconds when the notification should fire.
 */
export async function scheduleDailyRewardNotification(secondsInFuture) {
  try {
    // 1. Cancel any previously scheduled daily reward notifications to prevent duplicates
    await cancelAllDailyRewardNotifications();

    // 2. Schedule the new reminder
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎁 Daily Reward Ready!",
        body: "Your daily treasure chest has recharged! Open the app now to claim your 500 coins.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { screen: "DailyReward" },
      },
      trigger: {
        type: "timeInterval",
        seconds: secondsInFuture,
        channelId: "daily-reward",
      },
    });

    console.log("Scheduled daily reward notification with ID:", identifier);
    return identifier;
  } catch (error) {
    console.error("Failed to schedule daily reward notification:", error);
    return null;
  }
}

/**
 * Cancels all scheduled daily reward reminders.
 */
export async function cancelAllDailyRewardNotifications() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.screen === "DailyReward") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error("Failed to cancel scheduled notifications:", error);
  }
}
