import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { usePuff } from "../context/PuffContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

let Haptics: any;
try {
  Haptics = require("expo-haptics");
} catch {
  Haptics = {
    impactAsync: async (_: any) => {},
    ImpactFeedbackStyle: { Light: "light" },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

const formatSeconds = (s: number) => {
  if (s <= 0) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
  return `${m}:${pad(sec)}`;
};

const formatTo12HourFromDate = (d: Date) => {
  let hh = d.getHours();
  const mm = d.getMinutes();
  const period = hh >= 12 ? "pm" : "am";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(mm).padStart(2, "0")}${period}`;
};

interface CountdownTimerProps {
  textStyle?: any;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ textStyle }) => {
  const theme = useTheme();
  const { nextSmokeDelayMinutes, puffsUsed, totalPuffs, hapticsEnabled } =
    usePuff();

  const initial =
    nextSmokeDelayMinutes != null
      ? Math.max(0, Math.floor(nextSmokeDelayMinutes * 60))
      : 0;
  const [secondsLeft, setSecondsLeft] = useState<number>(initial);
  const expiredRef = useRef(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setSecondsLeft(
      nextSmokeDelayMinutes != null
        ? Math.max(0, Math.floor(nextSmokeDelayMinutes * 60))
        : 0
    );
    expiredRef.current = false;
    setExpired(false);
  }, [nextSmokeDelayMinutes]);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 0) return 0;
        const next = s - 1;
        if (next === 0 && !expiredRef.current) {
          expiredRef.current = true;
          try {
            if (hapticsEnabled && Haptics.impactAsync)
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [hapticsEnabled]);

  // If there is no live remaining minutes, check persisted absolute target.
  useEffect(() => {
    (async () => {
      try {
        if (nextSmokeDelayMinutes != null) {
          setExpired(false);
          return;
        }
        const raw = await AsyncStorage.getItem("puff:nextSmokeTarget");
        if (!raw) {
          setExpired(false);
          return;
        }
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed <= Date.now()) setExpired(true);
        else setExpired(false);
      } catch {
        setExpired(false);
      }
    })();
  }, [nextSmokeDelayMinutes, secondsLeft]);

  const status =
    typeof puffsUsed === "number" &&
    typeof totalPuffs === "number" &&
    totalPuffs > 0 &&
    puffsUsed > totalPuffs
      ? "Exceeded"
      : "On Track";
  const statusIsGood = status === "On Track";

  const targetAt =
    secondsLeft > 0
      ? formatTo12HourFromDate(new Date(Date.now() + secondsLeft * 1000))
      : null;

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.sm,
    },
    timer: {
      fontSize: theme.fonts.size.xlarge + 6,
      fontFamily: theme.fonts.family.bold,
      color: theme.colors.text,
      textAlign: "center",
    },
    small: {
      color: theme.colors.textSecondary,
      fontSize: theme.fonts.size.small,
      fontFamily: theme.fonts.family.regular,
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Next smoke timer: ${formatSeconds(secondsLeft)}`}
    >
      <Text style={[styles.timer, textStyle]}>
        {secondsLeft > 0
          ? formatSeconds(secondsLeft)
          : expired
          ? "Break finished"
          : "No timer set"}
      </Text>
    </View>
  );
};

export default CountdownTimer;
