import AsyncStorage from "@react-native-async-storage/async-storage";

const MOTIVATION_KEY = "puff:notif:motivation";
const MOTIVATION_MORNING_KEY = "puff:notif:motivation:morning";
const MOTIVATION_AFTERNOON_KEY = "puff:notif:motivation:afternoon";
const MOTIVATION_EVENING_KEY = "puff:notif:motivation:evening";
const PROGRESS_KEY = "puff:notif:progress";
const PROGRESS_WEEKLY_KEY = "puff:notif:progress:weekly";
const CRAVING_KEY = "puff:notif:craving";

let Notifications: any = null;
try {
  // Avoid requiring `expo-notifications` when running inside Expo Go because
  // the package will log a runtime warning about limited support. Use a
  // development build (dev-client) or a standalone app for push features.
  let Constants: any = null;
  try {
    Constants = require("expo-constants");
  } catch {}

  const appOwnership =
    Constants?.appOwnership || Constants?.manifest?.appOwnership;
  if (appOwnership && String(appOwnership).toLowerCase() === "expo") {
    // Running in Expo Go — skip loading expo-notifications to avoid noisy warnings.
    Notifications = null;
  } else {
    Notifications = require("expo-notifications");
  }
} catch {}

const safe = {
  async requestPermissions() {
    try {
      if (!Notifications) return false;
      const res = await Notifications.getPermissionsAsync();
      if (!res.granted) {
        const ask = await Notifications.requestPermissionsAsync();
        return !!ask.granted;
      }
      return true;
    } catch {
      return false;
    }
  },

  async scheduleDaily(
    key: string,
    hour: number,
    minute: number,
    title: string,
    body: string
  ) {
    try {
      if (!Notifications) return;
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: { hour, minute, repeats: true },
      });
      await AsyncStorage.setItem(key, id);
    } catch {}
  },

  async scheduleAtTs(key: string, ts: number, title: string, body: string) {
    try {
      if (!Notifications) return;
      const triggerDate = new Date(ts);
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: triggerDate,
      });
      await AsyncStorage.setItem(key, id);
    } catch {}
  },

  async cancelStored(key: string) {
    try {
      if (!Notifications) return;
      const id = await AsyncStorage.getItem(key);
      if (id) {
        await Notifications.cancelScheduledNotificationAsync(id);
        await AsyncStorage.removeItem(key);
      }
    } catch {}
  },
};

export {
  safe as NotificationHelper,
  MOTIVATION_KEY,
  MOTIVATION_MORNING_KEY,
  MOTIVATION_AFTERNOON_KEY,
  MOTIVATION_EVENING_KEY,
  PROGRESS_KEY,
  PROGRESS_WEEKLY_KEY,
  CRAVING_KEY,
};
