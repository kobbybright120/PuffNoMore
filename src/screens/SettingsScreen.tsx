import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Platform,
  ToastAndroid,
} from "react-native";
import AppHeader from "../components/AppHeader";
import CountdownTimer from "../components/CountdownTimer";
import { useTheme, useThemeSetter } from "../context/ThemeContext";
import { usePuff } from "../context/PuffContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
// craving tools removed per request

let Haptics: any;
try {
  Haptics = require("expo-haptics");
} catch {
  Haptics = {
    impactAsync: async (_style: any) => {},
    ImpactFeedbackStyle: { Light: "light" },
  };
}

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const {
    totalPuffs,
    setTotalPuffs,
    notificationPrefs,
    setNotificationPrefs,
    hapticsEnabled,
    setHapticsEnabled,
    smokingTimes,
    setSmokingTimes,
    preferredCravingTools,
    setPreferredCravingTools,
    resetData,
    nextSmokeDelayMinutes,
    nextSmokeIntervalMinutes,
    notificationTimes,
    setNotificationTime,
    setNextSmokeDelayMinutes,
    setCurrentCigs,
  } = usePuff();

  const [localBaseline, setLocalBaseline] = useState<number>(totalPuffs ?? 0);

  const isDark =
    (theme.colors.primaryBackground || "").toLowerCase() === "#0f0f0f";
  const isLight = !isDark;
  const cardBackground = isLight ? theme.colors.primaryBackground : "#0f1a1d";
  const cardBorderColor = isLight
    ? theme.colors.primaryGreen + "10"
    : "rgba(255,255,255,0.12)";
  const cardShadow = isLight
    ? theme.shadows.medium
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.36,
        shadowRadius: 12,
        elevation: 8,
      };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.primaryBackground },
    content: { padding: theme.spacing.md, paddingBottom: 48 },
    section: { marginBottom: theme.spacing.lg },
    card: {
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primaryGreen + "14",
    },
    title: {
      fontSize: theme.fonts.size.medium,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.bold,
      marginBottom: theme.spacing.sm,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.sm,
    },
    label: {
      color: theme.colors.text,
      fontFamily: theme.fonts.family.regular,
      fontSize: theme.fonts.size.small,
    },
    smallLabel: {
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.family.regular,
      fontSize: theme.fonts.size.small,
    },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: 96,
    },
    stepBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primaryGreen + "08",
      borderWidth: 1,
      borderColor: theme.colors.primaryGreen + "22",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    stepBtnText: {
      color: theme.colors.primaryGreen,
      fontFamily: theme.fonts.family.bold,
      fontSize: theme.fonts.size.large + 2,
      lineHeight: theme.fonts.size.large + 6,
    },
    baselineValue: {
      fontSize: theme.fonts.size.xlarge + 8,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.bold,
      textAlign: "center",
      marginHorizontal: theme.spacing.xs,
    },
    segWrap: {
      flexDirection: "row",
      backgroundColor: "transparent",
      borderRadius: theme.borderRadius.xlarge,
    },
    segBtn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.xlarge,
      marginRight: theme.spacing.xs,
    },
    toolRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.xs,
    },
    timeText: {
      color: theme.colors.text,
      fontFamily: theme.fonts.family.regular,
    },
    addBtn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
      width: "86%",
      backgroundColor: theme.colors.primaryBackground,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.md,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.primaryGreen + "22",
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.small,
      color: theme.colors.text,
      marginTop: theme.spacing.sm,
    },
    danger: { color: "#d9534f", fontFamily: theme.fonts.family.bold },
  });

  const themeSetter = useThemeSetter();

  const saveBaseline = async (n: number) => {
    const val = Math.max(0, Math.min(50, Math.round(n)));
    setLocalBaseline(val);
    await setTotalPuffs(val);
    try {
      // keep the live current target in sync so Home updates immediately
      if (typeof setCurrentCigs === "function") {
        await setCurrentCigs(Math.max(0, Math.round(val - 2)));
      }
    } catch {}
  };

  const toggleNotification = async (key: keyof typeof notificationPrefs) => {
    const next = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    await setNotificationPrefs(next);
  };

  const doFullReset = () => {
    Alert.alert(
      "Reset all data",
      "This will remove your usage history and app settings. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetData();
              const keysToRemove = [
                "puff:baseIntake",
                "puff:baseHistory",
                "puff:preferredTools",
                "puff:notificationPrefs",
                "app:hapticsEnabled",
                "app:reduceMotion",
              ];
              for (const k of keysToRemove) await AsyncStorage.removeItem(k);
              Alert.alert("Reset complete", "App data has been cleared.");
              try {
                if (Platform.OS === "android")
                  ToastAndroid.show("Reset complete", ToastAndroid.SHORT);
              } catch {}
            } catch {
              Alert.alert("Reset failed", "Could not clear all data.");
              try {
                if (Platform.OS === "android")
                  ToastAndroid.show("Reset failed", ToastAndroid.LONG);
              } catch {}
            }
          },
        },
      ],
    );
  };

  const toggleTool = async (tool: string) => {
    const has = preferredCravingTools.includes(tool);
    let next: string[] = [];
    if (has) next = preferredCravingTools.filter((t) => t !== tool);
    else next = [...preferredCravingTools, tool];
    await setPreferredCravingTools(next);
  };

  const moveTool = async (index: number, dir: -1 | 1) => {
    const arr = [...preferredCravingTools];
    if (index < 0 || index >= arr.length) return;
    const to = index + dir;
    if (to < 0 || to >= arr.length) return;
    const tmp = arr[to];
    arr[to] = arr[index];
    arr[index] = tmp;
    await setPreferredCravingTools(arr);
  };

  // Smoking times modal state
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timeModalValue, setTimeModalValue] = useState("");
  const [timeModalDelay, setTimeModalDelay] = useState<string>("");
  const [timeModalEnabled, setTimeModalEnabled] = useState(true);
  const [timeModalIndex, setTimeModalIndex] = useState<number | null>(null);

  const openAddTime = () => {
    setTimeModalValue("");
    setTimeModalDelay("");
    setTimeModalEnabled(true);
    setTimeModalIndex(null);
    setTimeModalVisible(true);
  };

  const openEditTime = (idx: number) => {
    const obj = smokingTimes[idx] ?? {
      time: "",
      delayMinutes: null,
      enabled: true,
    };
    setTimeModalValue(obj.time ?? "");
    setTimeModalDelay(obj.delayMinutes != null ? String(obj.delayMinutes) : "");
    setTimeModalEnabled(obj.enabled !== false);
    setTimeModalIndex(idx);
    setTimeModalVisible(true);
  };

  const validHHMM = (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);

  const saveTimeFromModal = async () => {
    const val = timeModalValue.trim();
    if (!validHHMM(val)) {
      Alert.alert("Invalid time", "Please enter a time in HH:MM (24h) format.");
      try {
        if (Platform.OS === "android")
          ToastAndroid.show("Invalid time format", ToastAndroid.SHORT);
      } catch {}
      return;
    }
    const delay =
      timeModalDelay.trim() === ""
        ? null
        : Math.max(0, Math.min(24 * 60, parseInt(timeModalDelay, 10) || 0));
    const entry = { time: val, delayMinutes: delay, enabled: timeModalEnabled };
    const next = [...smokingTimes];
    if (timeModalIndex === null) next.push(entry as any);
    else next[timeModalIndex] = entry as any;
    // sort by time string
    next.sort((a: any, b: any) =>
      a.time > b.time ? 1 : a.time < b.time ? -1 : 0,
    );
    await setSmokingTimes(next as any);
    setTimeModalVisible(false);
  };

  const removeTime = async (idx: number) => {
    const next = [...smokingTimes];
    next.splice(idx, 1);
    await setSmokingTimes(next);
  };

  // helpers for time math
  const minutesFromHHMM = (hhmm: string) => {
    const [hh, mm] = hhmm.split(":").map((s) => parseInt(s, 10));
    return (hh || 0) * 60 + (mm || 0);
  };

  const hhmmFromMinutes = (mins: number) => {
    const m = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const formatTo12Hour = (hhmm: string) => {
    const parts = hhmm.split(":");
    const hh = parseInt(parts[0], 10) || 0;
    const mm = parseInt(parts[1], 10) || 0;
    const period = hh >= 12 ? "pm" : "am";
    let h = hh % 12;
    if (h === 0) h = 12;
    return `${h}:${String(mm).padStart(2, "0")}${period}`;
  };

  const formatDuration = (mins: number) => {
    if (mins <= 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const minutesToNext =
    nextSmokeDelayMinutes != null ? nextSmokeDelayMinutes : 0;
  // Show the configured interval hours in Settings so the big number remains
  // stable while the live countdown displays remaining minutes. If there is
  // no configured interval but a live timer exists, show the live remaining
  // hours and the target clock time instead of 'Not set'.
  const configuredHours =
    nextSmokeIntervalMinutes != null
      ? Math.round(nextSmokeIntervalMinutes / 60)
      : null;

  const liveHours = minutesToNext > 0 ? Math.round(minutesToNext / 60) : null;

  const displayHours =
    configuredHours != null
      ? configuredHours
      : liveHours != null
        ? liveHours
        : null;

  const nextSmokeAt =
    minutesToNext > 0
      ? hhmmFromMinutes(
          new Date().getHours() * 60 + new Date().getMinutes() + minutesToNext,
        )
      : null;

  const nextSmokeAtFormatted = nextSmokeAt ? formatTo12Hour(nextSmokeAt) : null;
  const [persistedNextSmokeAt, setPersistedNextSmokeAt] = useState<
    string | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("puff:nextSmokeTarget");
        if (!raw) {
          setPersistedNextSmokeAt(null);
          return;
        }
        const ts = parseInt(raw, 10);
        if (isNaN(ts)) {
          setPersistedNextSmokeAt(null);
          return;
        }
        const d = new Date(ts);
        const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes(),
        ).padStart(2, "0")}`;
        setPersistedNextSmokeAt(formatTo12Hour(hhmm));
      } catch {
        setPersistedNextSmokeAt(null);
      }
    })();
  }, [nextSmokeDelayMinutes]);

  return (
    <View style={styles.container}>
      <AppHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorderColor,
                ...cardShadow,
              },
            ]}
          >
            <Text style={styles.title}>Reduction Plan</Text>
            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Daily baseline</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: theme.spacing.xs,
                  }}
                >
                  <Text style={styles.baselineValue}>{localBaseline}</Text>
                  <Text
                    style={[
                      styles.smallLabel,
                      { marginLeft: theme.spacing.xs, flexShrink: 0 },
                    ]}
                  >
                    cigarettes
                  </Text>
                </View>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      if (hapticsEnabled && Haptics.impactAsync)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    saveBaseline(Math.max(0, localBaseline - 2));
                  }}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      if (hapticsEnabled && Haptics.impactAsync)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    saveBaseline(localBaseline + 1);
                  }}
                  style={[styles.stepBtn, { marginLeft: theme.spacing.sm }]}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Next smoke control moved to its own card below */}

            {/* Smoking times removed from Reduction Plan card */}
          </View>
        </View>

        <View style={styles.section}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorderColor,
                ...cardShadow,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.title}>Next smoke</Text>
              <View style={{ marginRight: theme.spacing.sm }}>
                <CountdownTimer textStyle={styles.title} />
              </View>
            </View>

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Hours until next smoke</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: theme.spacing.xs,
                  }}
                >
                  <Text style={styles.baselineValue}>
                    {displayHours != null ? displayHours : "-"}
                  </Text>
                  <Text
                    style={[
                      styles.smallLabel,
                      { marginLeft: theme.spacing.xs, flexShrink: 1 },
                    ]}
                    numberOfLines={1}
                  >
                    {displayHours != null
                      ? `hours${
                          nextSmokeAtFormatted || persistedNextSmokeAt
                            ? ` At ${
                                nextSmokeAtFormatted || persistedNextSmokeAt
                              }`
                            : ""
                        }`
                      : "Not set"}
                  </Text>
                </View>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      if (hapticsEnabled && Haptics.impactAsync)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    const cur =
                      nextSmokeDelayMinutes != null
                        ? Math.round(nextSmokeDelayMinutes / 60)
                        : 0;
                    const next = Math.max(0, cur - 1);
                    setNextSmokeDelayMinutes(next === 0 ? null : next * 60);
                  }}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      if (hapticsEnabled && Haptics.impactAsync)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    const cur =
                      nextSmokeDelayMinutes != null
                        ? Math.round(nextSmokeDelayMinutes / 60)
                        : 0;
                    const next = Math.min(48, cur + 1);
                    setNextSmokeDelayMinutes(next * 60);
                  }}
                  style={[styles.stepBtn, { marginLeft: theme.spacing.sm }]}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorderColor,
                ...cardShadow,
              },
            ]}
          >
            <Text style={styles.title}>Notifications</Text>
            {(["motivation", "craving", "progress"] as const).map((k) => (
              <View key={k} style={styles.row}>
                <View>
                  <Text style={styles.label}>
                    {k[0].toUpperCase() + k.slice(1)}
                  </Text>
                  <Text style={styles.smallLabel}>
                    Receive {k} notifications
                  </Text>
                  {/* Slots removed: motivations now follow the main Motivation toggle */}
                </View>
                <Switch
                  value={notificationPrefs[k]}
                  onValueChange={() => toggleNotification(k)}
                  thumbColor={theme.colors.primaryBackground}
                  trackColor={{ true: theme.colors.primaryGreen }}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorderColor,
                ...cardShadow,
              },
            ]}
          >
            <Text style={styles.title}>App Behavior</Text>
            <View
              style={{
                height: 1,
                backgroundColor: theme.colors.primaryGreen + "12",
                marginVertical: theme.spacing.sm,
              }}
            />

            <View style={styles.row}>
              <Text style={styles.label}>Haptics</Text>
              <Switch
                value={hapticsEnabled}
                onValueChange={async (v) => await setHapticsEnabled(v)}
                thumbColor={theme.colors.primaryBackground}
                trackColor={{ true: theme.colors.primaryGreen }}
              />
            </View>

            <View style={styles.row}>
              <View>
                <Text style={styles.label}>Theme</Text>
                <Text style={styles.smallLabel}>App appearance</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {(
                  [
                    { key: "light", label: "Light" },
                    { key: "dark", label: "Dark" },
                    { key: "system", label: "System" },
                  ] as const
                ).map((opt) => {
                  const selected = themeSetter.themeName === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => themeSetter.setThemeName(opt.key as any)}
                      style={[
                        styles.segBtn,
                        {
                          backgroundColor: selected
                            ? theme.colors.primaryGreen
                            : "transparent",
                          borderWidth: selected ? 0 : 1,
                          borderColor: selected
                            ? "transparent"
                            : theme.colors.primaryGreen + "22",
                          paddingVertical: theme.spacing.xs,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: selected ? "#fff" : theme.colors.text,
                          fontFamily: theme.fonts.family.bold,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Reduce motion removed */}
          </View>
        </View>

        <View style={styles.section}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBackground,
                borderColor: cardBorderColor,
                ...cardShadow,
              },
            ]}
          >
            <Text style={styles.title}>Data & Privacy</Text>
            <View
              style={{
                height: 1,
                backgroundColor: theme.colors.primaryGreen + "12",
                marginVertical: theme.spacing.sm,
              }}
            />

            <View style={styles.row}>
              <Text style={[styles.label, styles.danger]}>
                Reset all app data
              </Text>
              <TouchableOpacity onPress={doFullReset}>
                <Text
                  style={[styles.danger, { fontSize: theme.fonts.size.small }]}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      <Modal visible={timeModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>
              {timeModalIndex === null ? "Add time" : "Edit time"}
            </Text>
            <Text style={styles.smallLabel}>
              Enter time in 24h HH:MM format
            </Text>
            <TextInput
              value={timeModalValue}
              onChangeText={setTimeModalValue}
              placeholder="e.g. 10:00"
              style={styles.input}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
            <Text style={[styles.smallLabel, { marginTop: theme.spacing.sm }]}>
              Craving delay (minutes)
            </Text>
            <TextInput
              value={timeModalDelay}
              onChangeText={setTimeModalDelay}
              placeholder="e.g. 120"
              style={styles.input}
              keyboardType="numeric"
              maxLength={4}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: theme.spacing.sm,
              }}
            >
              <Text
                style={[styles.smallLabel, { marginRight: theme.spacing.md }]}
              >
                Enabled
              </Text>
              <Switch
                value={timeModalEnabled}
                onValueChange={setTimeModalEnabled}
                thumbColor={theme.colors.primaryBackground}
                trackColor={{ true: theme.colors.primaryGreen }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: theme.spacing.md,
              }}
            >
              <TouchableOpacity
                onPress={() => setTimeModalVisible(false)}
                style={{ marginRight: theme.spacing.md }}
              >
                <Text style={styles.smallLabel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveTimeFromModal}>
                <Text
                  style={{
                    color: theme.colors.primaryGreen,
                    fontFamily: theme.fonts.family.bold,
                  }}
                >
                  {timeModalIndex === null ? "Add" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;
