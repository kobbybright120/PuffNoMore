import { Vibration, Platform } from "react-native";

let HapticsImpl: any;
try {
  HapticsImpl = require("expo-haptics");
} catch {
  HapticsImpl = null;
}

let enabled = true;

export const setHapticsEnabledGlobal = (v: boolean) => {
  enabled = Boolean(v);
};

// Small desktop/mobile-safe vibration helper for Android fallback
const vibrateFallback = (duration = 50) => {
  try {
    // On Android, Vibration.vibrate accepts number or pattern
    Vibration.vibrate(duration);
  } catch {}
};

export const selectionAsync = async () => {
  if (!enabled) return;
  if (HapticsImpl) {
    try {
      await HapticsImpl.selectionAsync();
      return;
    } catch {}
  }
  // fallback to vibration on Android
  if (Platform.OS === "android") vibrateFallback(30);
};

export const impactAsync = async (style: any) => {
  if (!enabled) return;
  if (HapticsImpl) {
    try {
      await HapticsImpl.impactAsync(style);
      return;
    } catch {}
  }
  if (Platform.OS === "android") {
    // map light/medium/heavy to short/medium/long vibration
    const dur =
      style && style === "Heavy" ? 120 : style && style === "Medium" ? 60 : 30;
    vibrateFallback(dur);
  }
};

export const notificationAsync = async (type: any) => {
  if (!enabled) return;
  if (HapticsImpl) {
    try {
      await HapticsImpl.notificationAsync(type);
      return;
    } catch {}
  }
  if (Platform.OS === "android") {
    // success: short, warning: medium, error: long
    const dur =
      type === "Error" || type === "error"
        ? 180
        : type === "Warning" || type === "warning"
        ? 90
        : 40;
    vibrateFallback(dur);
  }
};

export const ImpactFeedbackStyle = HapticsImpl
  ? HapticsImpl.ImpactFeedbackStyle
  : { Light: "light", Medium: "medium", Heavy: "heavy" };
export const NotificationFeedbackType = HapticsImpl
  ? HapticsImpl.NotificationFeedbackType
  : { Success: "success", Warning: "warning", Error: "error" };
