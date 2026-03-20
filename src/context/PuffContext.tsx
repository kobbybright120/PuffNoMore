import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { Alert, Vibration, Platform, ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NotificationHelper,
  MOTIVATION_KEY,
  MOTIVATION_MORNING_KEY,
  MOTIVATION_AFTERNOON_KEY,
  MOTIVATION_EVENING_KEY,
  PROGRESS_KEY,
  PROGRESS_WEEKLY_KEY,
  CRAVING_KEY,
} from "../utils/notifications";
const motivations: any = require("../data/motivations.json");

// Haptics handled via utils/haptics when needed

interface PuffContextType {
  puffsUsed: number;
  totalPuffs: number;
  setTotalPuffs: (n: number) => Promise<void>;
  notificationPrefs: {
    motivation: boolean;
    craving: boolean;
    progress: boolean;
  };
  setNotificationPrefs: (v: {
    motivation: boolean;
    craving: boolean;
    progress: boolean;
  }) => Promise<void>;
  notificationTimes: {
    motivation: { hour: number; minute: number };
    progress: { hour: number; minute: number };
  };
  setNotificationTime: (
    which: "motivation" | "progress",
    hour: number,
    minute: number,
  ) => Promise<void>;
  preferredCravingTools: string[];
  setPreferredCravingTools: (arr: string[]) => Promise<void>;
  smokingTimes: Array<{
    time: string;
    delayMinutes?: number | null;
    enabled?: boolean;
  }>;
  setSmokingTimes: (
    arr: Array<{
      time: string;
      delayMinutes?: number | null;
      enabled?: boolean;
    }>,
  ) => Promise<void>;
  hapticsEnabled: boolean;
  setHapticsEnabled: (v: boolean) => Promise<void>;

  nextSmokeDelayMinutes: number | null;
  setNextSmokeDelayMinutes: (n: number | null) => Promise<void>;
  nextSmokeIntervalMinutes: number | null;
  attemptLogSmoke: () => Promise<void>;
  logSmoke: () => Promise<void>;
  weeklyCounts: number[]; // length 7, 0=Sun..6=Sat
  events: string[]; // ISO timestamps of each logged puff
  baseHistory: Array<{ ts: string; base: number }>;
  resetData: () => Promise<void>;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (v: boolean) => Promise<void>;
  onboardingResponses: Record<string, any>;
  saveOnboardingAnswer: (key: string, value: any) => Promise<void>;
  currentCigs: number | null;
  setCurrentCigs: (n: number | null) => Promise<void>;
}

const PuffContext = createContext<PuffContextType | undefined>(undefined);

export const usePuff = () => {
  const context = useContext(PuffContext);
  if (!context) {
    throw new Error("usePuff must be used within a PuffProvider");
  }
  return context;
};

export const PuffProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const todayIndex = new Date().getDay();
  const [weeklyCounts, setWeeklyCounts] = useState<number[]>(() => {
    // initialize with zeros; in future this could load from storage
    return new Array(7).fill(0);
  });

  // user-configurable daily baseline (persisted)
  const [totalPuffs, setTotalPuffsState] = useState<number>(() => 6);
  // history of baseline changes (array of { ts: ISOstring, base: number })
  const [baseHistory, setBaseHistory] = useState<
    Array<{ ts: string; base: number }>
  >(() => []);

  // Settings: reduction pace, pause reduction, notifications, tool order

  const [notificationPrefs, setNotificationPrefsState] = useState({
    motivation: true,
    craving: true,
    progress: true,
  });
  // motivationSlots removed: always schedule morning/afternoon/evening when enabled
  const [notificationTimes, setNotificationTimesState] = useState<{
    motivation: { hour: number; minute: number };
    progress: { hour: number; minute: number };
  }>(() => ({
    motivation: { hour: 9, minute: 0 },
    progress: { hour: 21, minute: 0 },
  }));

  // Onboarding state & responses
  const ONBOARDING_KEY = "puff:onboardingResponses";
  const ONBOARDING_COMPLETE_KEY = "puff:onboardingCompleted";
  const USER_NAME_KEY = "puff:userName";
  const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(
    () => false,
  );
  const [onboardingResponses, setOnboardingResponsesState] = useState<
    Record<string, any>
  >(() => ({}));
  const [, setUserNameState] = useState<string | null>(() => null);
  const [preferredCravingTools, setPreferredCravingToolsState] = useState<
    string[]
  >(["Breathing", "Meditation", "Bubble Crusher", "Delay Timer"]);

  // App-level settings
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(() =>
    Boolean(true),
  );

  // User smoking schedule times (stored as objects: { time: 'HH:MM', delayMinutes, enabled })
  const [smokingTimes, setSmokingTimesState] = useState<
    Array<{ time: string; delayMinutes?: number | null; enabled?: boolean }>
  >(() => []);

  // Simple next-smoke tracker: minutes from now until next expected smoke
  const [nextSmokeDelayMinutes, setNextSmokeDelayMinutesState] = useState<
    number | null
  >(() => null);

  // current target (e.g. baseline minus reduction step). Persisted so Home can
  // display the live plan target independent of the original baseline.
  const [currentCigs, setCurrentCigsState] = useState<number | null>(
    () => null,
  );
  // configured interval (minutes) as chosen by the user when setting the timer
  const [nextSmokeIntervalMinutes, setNextSmokeIntervalMinutesState] = useState<
    number | null
  >(() => null);

  // Keep the absolute target timestamp in a ref (ms since epoch). This
  // avoids repeatedly reading AsyncStorage every tick and acts as the
  // single source of truth for remaining time calculations.
  const nextSmokeTargetTsRef = useRef<number | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  // Interval tracker for gradual stretching of smoking gaps
  // interval tracker removed

  const setTotalPuffs = async (n: number) => {
    setTotalPuffsState(n);
    try {
      await AsyncStorage.setItem(BASE_KEY, String(n));
      // also append to base history with current timestamp
      const entry = { ts: new Date().toISOString(), base: n };
      const next = [...baseHistory, entry];
      setBaseHistory(next);
      await AsyncStorage.setItem(BASE_HISTORY_KEY, JSON.stringify(next));
    } catch {
      // ignore persistence errors
    }
  };

  const CURRENT_CIGS_KEY = "puff:currentCigs";
  const setCurrentCigs = async (n: number | null) => {
    setCurrentCigsState(n);
    try {
      if (n == null) await AsyncStorage.removeItem(CURRENT_CIGS_KEY);
      else await AsyncStorage.setItem(CURRENT_CIGS_KEY, String(n));
    } catch {}
  };

  const setNotificationPrefs = async (v: {
    motivation: boolean;
    craving: boolean;
    progress: boolean;
  }) => {
    // If any notification type is being turned on, request permissions first
    try {
      const willEnableAny =
        (v.motivation && !notificationPrefs.motivation) ||
        (v.craving && !notificationPrefs.craving) ||
        (v.progress && !notificationPrefs.progress);
      if (willEnableAny) {
        try {
          const granted = await NotificationHelper.requestPermissions();
          if (!granted) {
            // user denied permission; do not enable notifications
            Alert.alert(
              "Notifications blocked",
              "Notifications are blocked or permissions were not granted. Please enable them in system settings to receive reminders.",
            );
            try {
              if (Platform.OS === "android")
                ToastAndroid.show(
                  "Notifications blocked. Enable them in system settings.",
                  ToastAndroid.LONG,
                );
            } catch {}
            // persist previous prefs (no change)
            try {
              await AsyncStorage.setItem(
                "puff:notificationPrefs",
                JSON.stringify(notificationPrefs),
              );
            } catch {}
            return;
          }
        } catch {}
      }
    } catch {}

    setNotificationPrefsState(v);
    try {
      await AsyncStorage.setItem("puff:notificationPrefs", JSON.stringify(v));
    } catch {}
  };

  const NOTIF_TIME_MOTIVATION_KEY = "puff:notifTime:motivation";
  const NOTIF_TIME_PROGRESS_KEY = "puff:notifTime:progress";

  const setPreferredCravingTools = async (arr: string[]) => {
    setPreferredCravingToolsState(arr);
    try {
      await AsyncStorage.setItem("puff:preferredTools", JSON.stringify(arr));
    } catch {}
  };

  // removed setMotivationSlots; slots are no longer user-configurable
  const setNotificationTime = async (
    which: "motivation" | "progress",
    hour: number,
    minute: number,
  ) => {
    const next = { ...notificationTimes, [which]: { hour, minute } } as any;
    setNotificationTimesState(next);
    try {
      const key =
        which === "motivation"
          ? NOTIF_TIME_MOTIVATION_KEY
          : NOTIF_TIME_PROGRESS_KEY;
      await AsyncStorage.setItem(key, JSON.stringify({ hour, minute }));
    } catch {}
  };

  const saveOnboardingAnswer = async (key: string, value: any) => {
    try {
      // When saving the user's baseline (cigarettesPerDay) we also want to
      // ensure the reduction start date is recorded. This makes the "Date
      // Started" display dynamic per user (the day they provided their
      // baseline) instead of relying on a hardcoded value.
      let next = { ...onboardingResponses, [key]: value } as any;
      if (key === "cigarettesPerDay") {
        // If there's no existing reductionStartDate, set it to now.
        if (!next.reductionStartDate) {
          try {
            const iso = new Date().toISOString();
            next = { ...next, reductionStartDate: iso };
          } catch {}
        }
      }
      setOnboardingResponsesState(next);
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
      // If the onboarding answer is the user's name, also persist as top-level userName
      if (key === "name") {
        try {
          setUserNameState(value ? String(value) : null);
          await AsyncStorage.setItem(USER_NAME_KEY, String(value || ""));
        } catch {}
      }
      // if user provided cigarettesPerDay during onboarding, set a live current target
      if (key === "cigarettesPerDay") {
        try {
          const n = Number(value) || 0;
          const derived = Math.max(0, Math.round(n - 2));
          await setCurrentCigs(derived);
        } catch {}
      }
      // analytics event could be emitted here
    } catch {}
  };

  // `setUserName` helper removed; callers should use `saveOnboardingAnswer`
  // or `setUserNameState` directly if needed.

  const setOnboardingCompleted = async (v: boolean) => {
    try {
      setOnboardingCompletedState(v);
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, JSON.stringify(v));
    } catch {}
  };

  // Schedule/cancel notifications when prefs or configured times change
  useEffect(() => {
    // load persisted userName and onboarding responses
    (async () => {
      try {
        const rawName = await AsyncStorage.getItem(USER_NAME_KEY);
        if (rawName) setUserNameState(rawName);
        const rawOn = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (rawOn) {
          try {
            const parsed = JSON.parse(rawOn) as Record<string, any>;
            // If a reductionStartDate is missing, persist today's date (date-only)
            if (!parsed.reductionStartDate) {
              try {
                const today = new Date();
                const isoDateOnly = today.toISOString().slice(0, 10); // YYYY-MM-DD
                const next = { ...parsed, reductionStartDate: isoDateOnly };
                setOnboardingResponsesState(next);
                await AsyncStorage.setItem(
                  ONBOARDING_KEY,
                  JSON.stringify(next),
                );
              } catch {
                // fallback to parsed if persistence fails
                setOnboardingResponsesState(parsed);
              }
            } else {
              setOnboardingResponsesState(parsed);
            }
          } catch {
            // if parsing fails, ignore and don't crash
            try {
              setOnboardingResponsesState(JSON.parse(rawOn));
            } catch {
              setOnboardingResponsesState({});
            }
          }
        }
        const rawComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (rawComplete) setOnboardingCompletedState(JSON.parse(rawComplete));
        // load persisted current target if set
        try {
          const rawCurrent = await AsyncStorage.getItem(CURRENT_CIGS_KEY);
          if (rawCurrent != null) {
            const pc = parseInt(rawCurrent, 10);
            if (!isNaN(pc)) setCurrentCigsState(pc);
          }
        } catch {}
      } catch {}
    })();

    (async () => {
      try {
        // motivation: schedule three fixed slots (morning/afternoon/evening)
        if (notificationPrefs.motivation) {
          const morningHour = 9;
          const afternoonHour = 14;
          const eveningHour = 19;

          const MOTIVATION_STATE_KEY = "@motivation_state_v1";
          const HOUR_MS = 1000 * 60 * 60;

          const getOrCreateHourlyMotivationIndex = async () => {
            const nowHour = Math.floor(Date.now() / HOUR_MS);
            try {
              const raw = await AsyncStorage.getItem(MOTIVATION_STATE_KEY);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (
                  parsed &&
                  typeof parsed.index === "number" &&
                  parsed.hour === nowHour
                ) {
                  return parsed.index as number;
                }
              }
            } catch {}
            const idx = Math.floor(Math.random() * (motivations.length || 1));
            try {
              await AsyncStorage.setItem(
                MOTIVATION_STATE_KEY,
                JSON.stringify({
                  hour: Math.floor(Date.now() / HOUR_MS),
                  index: idx,
                }),
              );
            } catch {}
            return idx;
          };

          const pickMsg = async () => {
            const idx = await getOrCreateHourlyMotivationIndex();
            return Array.isArray(motivations) && motivations.length > 0
              ? (motivations[idx] as string)
              : "Small reminder: You're making progress. Take a breath.";
          };

          // schedule all three slots when motivation notifications are enabled
          await NotificationHelper.cancelStored(MOTIVATION_MORNING_KEY);
          await NotificationHelper.scheduleDaily(
            MOTIVATION_MORNING_KEY,
            morningHour,
            0,
            "Daily motivation",
            await pickMsg(),
          );

          await NotificationHelper.cancelStored(MOTIVATION_AFTERNOON_KEY);
          await NotificationHelper.scheduleDaily(
            MOTIVATION_AFTERNOON_KEY,
            afternoonHour,
            0,
            "Daily motivation",
            await pickMsg(),
          );

          await NotificationHelper.cancelStored(MOTIVATION_EVENING_KEY);
          await NotificationHelper.scheduleDaily(
            MOTIVATION_EVENING_KEY,
            eveningHour,
            0,
            "Daily motivation",
            await pickMsg(),
          );

          // remove any legacy single motivation schedule
          await NotificationHelper.cancelStored(MOTIVATION_KEY);
        } else {
          await NotificationHelper.cancelStored(MOTIVATION_MORNING_KEY);
          await NotificationHelper.cancelStored(MOTIVATION_AFTERNOON_KEY);
          await NotificationHelper.cancelStored(MOTIVATION_EVENING_KEY);
          await NotificationHelper.cancelStored(MOTIVATION_KEY);
        }

        // progress
        if (notificationPrefs.progress) {
          const t = notificationTimes.progress;
          await NotificationHelper.cancelStored(PROGRESS_KEY);
          await NotificationHelper.scheduleDaily(
            PROGRESS_KEY,
            t.hour,
            t.minute,
            "Daily summary",
            "Review today's progress in the app.",
          );

          // Dynamic weekly scheduling anchored to the user's start date.
          // We schedule a one-time notification at the next start + n*7days
          // boundary, and compute the message from events that occurred in
          // that 7-day window so the content reflects the user's real week.
          try {
            await NotificationHelper.cancelStored(PROGRESS_WEEKLY_KEY);

            // ensure we have a start timestamp persisted
            let startRaw = await AsyncStorage.getItem(PROGRESS_START_TS_KEY);
            let startTs: number;
            if (!startRaw) {
              startTs = Date.now();
              try {
                await AsyncStorage.setItem(
                  PROGRESS_START_TS_KEY,
                  String(startTs),
                );
              } catch {}
            } else {
              startTs = parseInt(startRaw, 10) || Date.now();
            }

            const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            const n = Math.floor((now - startTs) / WEEK_MS) + 1;
            const nextTs = startTs + n * WEEK_MS;
            const weekStart = nextTs - WEEK_MS;

            const buildWeeklyMessage = async (
              fromTs: number,
              _toTs: number,
            ) => {
              try {
                const rawBase = await AsyncStorage.getItem(BASE_KEY);
                const baseToCheck = rawBase
                  ? parseInt(rawBase, 10)
                  : totalPuffs;

                // Count events per day in the 7-day window using `events` state
                const dayCounts: number[] = [];
                for (let i = 0; i < 7; i++) {
                  const d0 = new Date(fromTs + i * 24 * 60 * 60 * 1000);
                  const dayStart = new Date(
                    d0.getFullYear(),
                    d0.getMonth(),
                    d0.getDate(),
                  ).getTime();
                  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
                  const count = events.filter((e) => {
                    const ets = Date.parse(e);
                    return ets >= dayStart && ets < dayEnd;
                  }).length;
                  dayCounts.push(count);
                }

                const within = dayCounts.filter(
                  (c) =>
                    c <=
                    (typeof baseToCheck === "number"
                      ? baseToCheck
                      : totalPuffs),
                ).length;

                // longest consecutive run within target in this week
                let longest = 0;
                let cur = 0;
                for (const c of dayCounts) {
                  if (
                    c <=
                    (typeof baseToCheck === "number" ? baseToCheck : totalPuffs)
                  ) {
                    cur += 1;
                    if (cur > longest) longest = cur;
                  } else {
                    cur = 0;
                  }
                }

                const passed =
                  dayCounts.length === 7 &&
                  dayCounts.every(
                    (c) =>
                      c <=
                      (typeof baseToCheck === "number"
                        ? baseToCheck
                        : totalPuffs),
                  );

                if (passed) {
                  return {
                    title: "🎉 Weekly progress: well done!",
                    body: `You met your weekly goal and moved to the next level. Days within target: ${within}. Longest streak: ${longest} days. Keep going. Try lowering today's target by 1 to progress.`,
                  };
                }

                return {
                  title: "😔 Weekly progress: keep going",
                  body: `You didn't meet your weekly goal. Days within target: ${within} of 7. Longest streak: ${longest} days. Tip: try a 5-minute breathing break when urges hit and aim for one more within-target day this week.`,
                };
              } catch {
                return {
                  title: "Weekly progress",
                  body: "Open the app to review your weekly progress.",
                };
              }
            };

            const msg = await buildWeeklyMessage(weekStart, nextTs);

            await NotificationHelper.scheduleAtTs(
              PROGRESS_WEEKLY_KEY,
              nextTs,
              msg.title,
              msg.body,
            );

            try {
              await AsyncStorage.setItem(
                PROGRESS_WEEKLY_SCHEDULE_TS_KEY,
                String(nextTs),
              );
            } catch {}
          } catch {}
        } else {
          await NotificationHelper.cancelStored(PROGRESS_KEY);
          try {
            await NotificationHelper.cancelStored(PROGRESS_WEEKLY_KEY);
            await AsyncStorage.removeItem(PROGRESS_WEEKLY_SCHEDULE_TS_KEY);
          } catch {}
        }

        // craving: one-time at next smoke target
        if (notificationPrefs.craving && nextSmokeTargetTsRef.current) {
          await NotificationHelper.cancelStored(CRAVING_KEY);
          await NotificationHelper.scheduleAtTs(
            CRAVING_KEY,
            nextSmokeTargetTsRef.current,
            "Reminder: your break finished",
            "Your scheduled break has finished. If you decide to smoke, you can log it in the app. If you choose not to, that's a healthy choice. Every smoke free moment helps. Whatever you decide, you're making progress.",
          );
        } else if (!notificationPrefs.craving) {
          await NotificationHelper.cancelStored(CRAVING_KEY);
        }
      } catch {}
    })();
  }, [
    notificationPrefs,
    notificationTimes,
    nextSmokeDelayMinutes,
    events,
    totalPuffs,
  ]);

  const setSmokingTimes = async (
    arr: Array<{
      time: string;
      delayMinutes?: number | null;
      enabled?: boolean;
    }>,
  ) => {
    setSmokingTimesState(arr);
    try {
      await AsyncStorage.setItem("puff:smokingTimes", JSON.stringify(arr));
    } catch {}
  };

  // interval tracker removed

  const setHapticsEnabled = async (v: boolean) => {
    setHapticsEnabledState(v);
    try {
      await AsyncStorage.setItem("app:hapticsEnabled", JSON.stringify(v));
      try {
        // update global haptics helper so other modules respect toggle
        const mod = require("../utils/haptics");
        if (mod && mod.setHapticsEnabledGlobal) mod.setHapticsEnabledGlobal(v);
      } catch {}
    } catch {}
  };

  const setNextSmokeDelayMinutes = async (n: number | null) => {
    setNextSmokeDelayMinutesState(n);
    try {
      // Persist as an absolute target timestamp so the timer survives restarts
      if (n === null) {
        await AsyncStorage.removeItem(NEXT_SMOKE_TS_KEY);
        // clear in-memory ref
        try {
          nextSmokeTargetTsRef.current = null;
        } catch {}
        // also remove stored interval when user explicitly clears the timer
        try {
          await AsyncStorage.removeItem(NEXT_SMOKE_INTERVAL_KEY);
        } catch {}
        // clear configured interval state
        setNextSmokeIntervalMinutesState(null);
      } else {
        const ts = Date.now() + Math.round(n * 60 * 1000);
        await AsyncStorage.setItem(NEXT_SMOKE_TS_KEY, String(ts));
        // update in-memory ref so the ticking effect can compute remaining time
        nextSmokeTargetTsRef.current = ts;
        // Persist the chosen interval (minutes) so we can restart count after a log
        try {
          await AsyncStorage.setItem(
            NEXT_SMOKE_INTERVAL_KEY,
            String(Math.round(n)),
          );
        } catch {}
        setNextSmokeIntervalMinutesState(Math.round(n));
      }
    } catch {}
  };

  const puffsUsed = weeklyCounts[todayIndex] ?? 0;

  const logSmoke = async () => {
    // allow over-logging so we capture real usage; UI will indicate warnings
    setWeeklyCounts((prev) => {
      const copy = prev.slice();
      copy[todayIndex] = (copy[todayIndex] || 0) + 1;
      return copy;
    });
    // record a timestamped event for more detailed stats
    const ts = new Date().toISOString();
    const newEvents = [...events, ts];
    setEvents(newEvents);
    try {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(newEvents));
    } catch {}

    // trigger stronger haptic when user exceeds today's target
    try {
      const newCount = (weeklyCounts[todayIndex] || 0) + 1;
      if (
        hapticsEnabled &&
        typeof totalPuffs === "number" &&
        newCount > totalPuffs
      ) {
        try {
          Vibration.vibrate(500);
        } catch {}
        try {
          Alert.alert(
            "Daily target exceeded",
            `You've exceeded your daily target of ${totalPuffs} cigarette${
              totalPuffs === 1 ? "" : "s"
            }.`,
          );
        } catch {}
      }
    } catch {}

    // interval analytics removed
    // If there is a stored next-smoke target and it has already expired,
    // restart the next-smoke target based on the stored interval (minutes).
    try {
      const tsRaw = await AsyncStorage.getItem(NEXT_SMOKE_TS_KEY);
      if (tsRaw !== null) {
        const parsedTs = parseInt(tsRaw, 10);
        const now = Date.now();
        if (!isNaN(parsedTs) && now >= parsedTs) {
          // expired — look up interval minutes
          const intervalRaw = await AsyncStorage.getItem(
            NEXT_SMOKE_INTERVAL_KEY,
          );
          const interval = intervalRaw ? parseInt(intervalRaw, 10) : NaN;
          if (!isNaN(interval) && interval > 0) {
            // Anchor to the previous scheduled timestamp (parsedTs)
            // so intervals like 1:18 -> 2:18 -> 3:18 are preserved.
            const stepMs = Math.round(interval * 60 * 1000);
            let nextTs = parsedTs + stepMs;
            // If the user logs long after expiry, advance until in the future
            while (nextTs <= now) nextTs += stepMs;
            try {
              await AsyncStorage.setItem(NEXT_SMOKE_TS_KEY, String(nextTs));
            } catch {}
            // update in-memory ref and state so UI timers pick up the new target
            nextSmokeTargetTsRef.current = nextTs;
            setNextSmokeDelayMinutesState((nextTs - now) / 60000);
          }
        }
      }
    } catch {}
  };

  const attemptLogSmoke = async () => {
    if (nextSmokeDelayMinutes != null && nextSmokeDelayMinutes > 0) {
      // compute readable remaining time and target time
      const secs = Math.max(0, Math.floor(nextSmokeDelayMinutes * 60));
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      const parts = [] as string[];
      if (h > 0) parts.push(`${h}h`);
      if (m > 0) parts.push(`${m}m`);
      if (h === 0 && m === 0) parts.push(`${s}s`);
      // Schedule/cancel notifications when prefs or next smoke target change
      const remaining = parts.join(" ");
      const target = new Date(Date.now() + secs * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      Alert.alert(
        "Feeling an urge?",
        `Next smoke in ${remaining} (At ${target}). If you decide to smoke you can record it now; if you prefer not to, you don't need to log anything. Every smoke free moment helps. Cravings pass and you're doing important work.`,
        [
          { text: "Wait", style: "cancel" },
          {
            text: "Smoke Now",
            style: "destructive",
            onPress: async () => {
              try {
                await logSmoke();
              } catch {}
            },
          },
        ],
      );
      return;
    }
    await logSmoke();
  };

  const resetData = async () => {
    // Reset in-memory state to defaults and remove all persisted keys
    try {
      const zeros = new Array(7).fill(0);
      setWeeklyCounts(zeros);
      setEvents([]);

      // reset baseline and history
      try {
        setTotalPuffsState(6);
      } catch {}
      try {
        setBaseHistory([]);
      } catch {}

      // reset onboarding and user info
      try {
        setOnboardingResponsesState({});
        setOnboardingCompletedState(false);
        setUserNameState(null);
      } catch {}

      // reset preferences and timers
      try {
        setPreferredCravingToolsState([
          "Breathing",
          "Meditation",
          "Bubble Crusher",
          "Delay Timer",
        ]);
        setHapticsEnabledState(true);
        setSmokingTimesState([]);
        setNextSmokeDelayMinutesState(null);
        setNextSmokeIntervalMinutesState(null);
      } catch {}

      // reset current target
      try {
        setCurrentCigsState(null);
      } catch {}

      // remove persisted keys (best-effort)
      try {
        const keysToRemove = [
          STORAGE_KEY,
          LAST_UPDATED_KEY,
          EVENTS_KEY,
          BASE_KEY,
          BASE_HISTORY_KEY,
          ONBOARDING_KEY,
          ONBOARDING_COMPLETE_KEY,
          USER_NAME_KEY,
          "puff:preferredTools",
          "puff:notificationPrefs",
          "puff:smokingTimes",
          NEXT_SMOKE_KEY,
          NEXT_SMOKE_TS_KEY,
          NEXT_SMOKE_INTERVAL_KEY,
          "puff:nextSmokeTarget",
          "puff:baseIntake",
          "puff:baseHistory",
          "puff:currentCigs",
          "app:hapticsEnabled",
          "app:reduceMotion",
        ];
        for (const k of keysToRemove) {
          try {
            await AsyncStorage.removeItem(k);
          } catch {}
        }
      } catch {}
    } catch {
      // ignore any reset errors
    }
  };

  const STORAGE_KEY = "puff:weeklyCounts";
  const LAST_UPDATED_KEY = "puff:lastUpdated";
  const EVENTS_KEY = "puff:events";
  const BASE_KEY = "puff:baseIntake";
  const BASE_HISTORY_KEY = "puff:baseHistory";
  const NEXT_SMOKE_KEY = "puff:nextSmokeDelay";
  const NEXT_SMOKE_TS_KEY = "puff:nextSmokeTarget";
  const NEXT_SMOKE_INTERVAL_KEY = "puff:nextSmokeInterval";
  const PROGRESS_WEEKLY_SCHEDULE_TS_KEY = "puff:progressWeeklyNextTs";
  const PROGRESS_START_TS_KEY = "puff:progressStartTs";

  const today = new Date();

  // load persisted counts and roll forward by days passed
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const rawDate = await AsyncStorage.getItem(LAST_UPDATED_KEY);
        const rawEvents = await AsyncStorage.getItem(EVENTS_KEY);
        if (!raw) return;
        const parsed: number[] = JSON.parse(raw);

        // load persisted base intake now so we can evaluate week completion
        let parsedBase: number | null = null;
        try {
          const rawBase = await AsyncStorage.getItem(BASE_KEY);
          if (rawBase) {
            const pb = parseInt(rawBase, 10);
            if (!isNaN(pb)) parsedBase = pb;
          }
        } catch {}

        if (!rawDate) {
          // if no date stored, just use parsed
          if (mounted) setWeeklyCounts(parsed);
          return;
        }

        const last = new Date(rawDate);
        // compute number of days difference (local dates)
        const lastMid = new Date(
          last.getFullYear(),
          last.getMonth(),
          last.getDate(),
        );
        const todayMid = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        const msPerDay = 24 * 60 * 60 * 1000;
        const deltaDays = Math.floor(
          (Number(todayMid) - Number(lastMid)) / msPerDay,
        );

        let rolled = parsed.slice();

        // If days have passed, roll the array forward. Before we overwrite
        // make a best-effort evaluation of the week that just completed
        // (represented by `parsed`) against the baseline at that time
        // (`parsedBase`). If the user stayed within the baseline every day
        // of that week, reduce the baseline by 2 (min 0) to match the
        // active-target derivation used elsewhere.
        if (deltaDays > 0) {
          try {
            const baseToCheck =
              parsedBase !== null && !isNaN(parsedBase)
                ? parsedBase
                : totalPuffs;
            if (
              typeof baseToCheck === "number" &&
              baseToCheck > 0 &&
              parsed.length === 7 &&
              parsed.every((c) => c <= baseToCheck)
            ) {
              const nextBase = Math.max(0, baseToCheck - 2);
              setTotalPuffsState(nextBase);
              try {
                await AsyncStorage.setItem(BASE_KEY, String(nextBase));
              } catch {}
              try {
                const entry = { ts: lastMid.toISOString(), base: nextBase };
                const existingRaw =
                  await AsyncStorage.getItem(BASE_HISTORY_KEY);
                const existing: Array<{ ts: string; base: number }> =
                  existingRaw ? JSON.parse(existingRaw) : [];
                const next = [...existing, entry];
                setBaseHistory(next);
                await AsyncStorage.setItem(
                  BASE_HISTORY_KEY,
                  JSON.stringify(next),
                );
              } catch {}
            }
          } catch {}

          // shift left by deltaDays and append zeros
          for (let i = 0; i < deltaDays; i++) {
            rolled.shift();
            rolled.push(0);
          }
        }

        if (mounted) setWeeklyCounts(rolled);
        let loadedEvents: string[] = [];
        if (rawEvents) {
          try {
            loadedEvents = JSON.parse(rawEvents || "[]");
          } catch {}
        }
        if (loadedEvents.length === 0 && rolled.some((c) => c > 0)) {
          // generate events from weeklyCounts if no events saved
          const eventsList: string[] = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          for (let i = 0; i < 7; i++) {
            const dayDate = new Date(today);
            dayDate.setDate(today.getDate() - (6 - i));
            const count = rolled[i];
            if (count > 0) {
              const interval = (24 * 60 * 60 * 1000) / count; // ms per puff
              for (let j = 0; j < count; j++) {
                const ts = new Date(dayDate.getTime() + j * interval);
                eventsList.push(ts.toISOString());
              }
            }
          }
          loadedEvents = eventsList;
          // save the generated events
          try {
            await AsyncStorage.setItem(
              EVENTS_KEY,
              JSON.stringify(loadedEvents),
            );
          } catch {}
        }
        if (mounted) setEvents(loadedEvents);
        // load persisted base intake and history
        try {
          const rawBase = await AsyncStorage.getItem(BASE_KEY);
          if (rawBase) {
            const parsedBase = parseInt(rawBase, 10);
            if (!isNaN(parsedBase)) {
              if (mounted) setTotalPuffsState(parsedBase);
            }
          }
        } catch {}
        try {
          const rawHist = await AsyncStorage.getItem(BASE_HISTORY_KEY);
          if (rawHist) {
            const parsedHist = JSON.parse(rawHist);
            if (Array.isArray(parsedHist) && mounted)
              setBaseHistory(parsedHist);
          } else {
            // if no history, seed with current base for completeness
            const seed = { ts: new Date().toISOString(), base: totalPuffs };
            setBaseHistory([seed]);
            try {
              await AsyncStorage.setItem(
                BASE_HISTORY_KEY,
                JSON.stringify([seed]),
              );
            } catch {}
          }
        } catch {}
      } catch {
        // ignore load errors
      }
    };

    // load settings (non-blocking)
    (async () => {
      try {
        const st = await AsyncStorage.getItem("puff:smokingTimes");
        if (st) {
          try {
            const parsed = JSON.parse(st);
            // migrate old string[] -> new object shape
            if (
              Array.isArray(parsed) &&
              parsed.every((it: any) => typeof it === "string")
            ) {
              const migrated = parsed.map((t: string) => ({
                time: t,
                delayMinutes: null,
                enabled: true,
              }));
              setSmokingTimesState(migrated);
            } else if (Array.isArray(parsed)) {
              setSmokingTimesState(parsed as any);
            }
          } catch {
            // ignore parse errors
          }
        }
      } catch {}

      // interval tracker removed; nothing to load here
      try {
        const np = await AsyncStorage.getItem("puff:notificationPrefs");
        if (np) setNotificationPrefsState(JSON.parse(np));
      } catch {}
      // motivation slot persistence removed
      try {
        const mt = await AsyncStorage.getItem(NOTIF_TIME_MOTIVATION_KEY);
        if (mt) {
          const parsed = JSON.parse(mt);
          if (parsed && typeof parsed.hour === "number")
            setNotificationTimesState((s) => ({ ...s, motivation: parsed }));
        }
      } catch {}
      try {
        const pt = await AsyncStorage.getItem(NOTIF_TIME_PROGRESS_KEY);
        if (pt) {
          const parsed = JSON.parse(pt);
          if (parsed && typeof parsed.hour === "number")
            setNotificationTimesState((s) => ({ ...s, progress: parsed }));
        }
      } catch {}
      try {
        const pt = await AsyncStorage.getItem("puff:preferredTools");
        if (pt) setPreferredCravingToolsState(JSON.parse(pt));
      } catch {}
      try {
        const hh = await AsyncStorage.getItem("app:hapticsEnabled");
        if (hh !== null) {
          const parsed = JSON.parse(hh);
          setHapticsEnabledState(parsed);
          try {
            const mod = require("../utils/haptics");
            if (mod && mod.setHapticsEnabledGlobal)
              mod.setHapticsEnabledGlobal(parsed);
          } catch {}
        }
      } catch {}

      // load onboarding state
      try {
        const rawOnb = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (rawOnb) setOnboardingResponsesState(JSON.parse(rawOnb));
      } catch {}
      try {
        const rawDone = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (rawDone !== null) setOnboardingCompletedState(JSON.parse(rawDone));
      } catch {}

      try {
        // Prefer stored absolute target timestamp so the timer survives restarts.
        const tsRaw = await AsyncStorage.getItem(NEXT_SMOKE_TS_KEY);
        if (tsRaw !== null) {
          const parsedTs = parseInt(tsRaw, 10);
          if (!isNaN(parsedTs)) {
            const remainingMs = parsedTs - Date.now();
            if (remainingMs > 0) {
              const remainingMinutes = remainingMs / 60000;
              // set both the ref and the exposed minutes state
              nextSmokeTargetTsRef.current = parsedTs;
              setNextSmokeDelayMinutesState(remainingMinutes);
            } else {
              // expired: keep the persisted absolute timestamp so
              // `logSmoke()` can anchor the next target to this schedule.
              // Do not remove the persisted key here.
              nextSmokeTargetTsRef.current = null;
              setNextSmokeDelayMinutesState(null);
            }
          }
        } else {
          // migrate old minute-based key if present
          const ns = await AsyncStorage.getItem(NEXT_SMOKE_KEY);
          if (ns !== null) {
            const parsed = parseInt(ns, 10);
            if (!isNaN(parsed)) {
              const ts = Date.now() + parsed * 60000;
              try {
                await AsyncStorage.setItem(NEXT_SMOKE_TS_KEY, String(ts));
                await AsyncStorage.removeItem(NEXT_SMOKE_KEY);
              } catch {}
              nextSmokeTargetTsRef.current = ts;
              setNextSmokeDelayMinutesState(parsed);
              // migrated minute value is also the configured interval
              setNextSmokeIntervalMinutesState(parsed);
            }
          }
        }
      } catch {}
    })();

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // persist weeklyCounts and lastUpdated date whenever counts change
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(weeklyCounts));
        await AsyncStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
      } catch {
        // ignore save errors
      }
    };
    save();
  }, [weeklyCounts]);

  // Tick the next-smoke target every second so `nextSmokeDelayMinutes` stays
  // accurate across screens. Uses the in-memory absolute timestamp ref to
  // avoid AsyncStorage reads on every tick.
  useEffect(() => {
    const id = setInterval(() => {
      const ts = nextSmokeTargetTsRef.current;
      if (ts == null) {
        if (nextSmokeDelayMinutes !== null) setNextSmokeDelayMinutesState(null);
        return;
      }
      const remainingMs = ts - Date.now();
      if (remainingMs > 0) {
        const minutes = remainingMs / 60000;
        setNextSmokeDelayMinutesState(minutes);
      } else {
        // target expired: keep persisted absolute timestamp so `logSmoke()`
        // can read the original scheduled time and compute the anchored
        // next target (e.g. 1:18 -> 2:18). Clear in-memory ref/state so
        // UI shows expiry but do not remove storage.
        nextSmokeTargetTsRef.current = null;
        setNextSmokeDelayMinutesState(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <PuffContext.Provider
      value={{
        puffsUsed,
        totalPuffs,
        smokingTimes,
        setSmokingTimes,

        notificationPrefs,
        setNotificationPrefs,
        notificationTimes,
        setNotificationTime,
        preferredCravingTools,
        setPreferredCravingTools,
        hapticsEnabled,
        setHapticsEnabled,
        nextSmokeDelayMinutes,
        nextSmokeIntervalMinutes,
        setNextSmokeDelayMinutes,
        attemptLogSmoke,
        baseHistory,
        setTotalPuffs,
        logSmoke,
        weeklyCounts,
        events,
        resetData,
        onboardingCompleted,
        setOnboardingCompleted,
        onboardingResponses,
        saveOnboardingAnswer,
        currentCigs,
        setCurrentCigs,
      }}
    >
      {children}
      {/* Native alert used for early-log confirmation */}
    </PuffContext.Provider>
  );
};
