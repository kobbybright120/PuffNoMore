import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Animated,
  Easing,
} from "react-native";
import CircularProgressRing from "../components/CircularProgressRing";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SafeHaptics from "../utils/haptics";

const DelayCravingScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const TOTAL = 5 * 60;

  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  const startScale = useRef(new Animated.Value(1)).current;
  const startOpacity = useRef(new Animated.Value(1)).current;
  const timerScale = useRef(new Animated.Value(0.9)).current;
  const timerOpacity = useRef(new Animated.Value(0)).current;

  const handleStartPress = async () => {
    // Immediate tactile feedback
    try {
      Vibration.vibrate([0, 50]);
    } catch {}
    try {
      await SafeHaptics.selectionAsync();
    } catch {}

    // Show timer immediately
    setIsRunning(true);

    // Play transition animations (non-blocking)
    Animated.parallel([
      Animated.timing(startOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(startScale, {
        toValue: 0.9,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(timerOpacity, {
        toValue: 1,
        duration: 220,
        delay: 0,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(timerScale, {
        toValue: 1,
        duration: 220,
        delay: 0,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(
        () => setSecondsLeft((s) => Math.max(0, s - 1)),
        1000
      );
    }

    if (secondsLeft === 0 && !hasCompleted) {
      setIsRunning(false);
      setHasCompleted(true);
      try {
        Vibration.vibrate([0, 400, 200, 400]);
      } catch {}
      try {
        SafeHaptics.notificationAsync(
          SafeHaptics.NotificationFeedbackType.Success
        );
      } catch {}
    }

    if (secondsLeft > 0 && hasCompleted) {
      setHasCompleted(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, hasCompleted]);

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.primaryBackground },
    header: {
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.primaryBackground,
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: theme.fonts.size.xlarge,
      fontFamily: theme.fonts.family.bold,
      color: theme.colors.primaryGreen,
    },
    backTouch: {
      position: "absolute",
      left: theme.spacing.md,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      padding: 8,
      borderRadius: 8,
    },
    headerRightTouch: {
      position: "absolute",
      right: theme.spacing.md,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      padding: 8,
      borderRadius: 8,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.lg,
    },
    ringWrap: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: theme.spacing.xl,
    },
    timerText: {
      fontFamily: theme.fonts.family.bold,
      color: theme.colors.text,
    },
    timerSub: {
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
    },
    ringInnerText: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    titleSubtitle: {
      fontSize: theme.fonts.size.small,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    controlsRow: {
      flexDirection: "row",
      marginTop: theme.spacing.lg,
      justifyContent: "center",
      gap: theme.spacing.md,
    },
    controlButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.medium,
      minWidth: 120,
      alignItems: "center",
    },
    primaryButton: { backgroundColor: theme.colors.primaryGreen },
    ghostButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.textSecondary,
    },
    controlText: {
      color: theme.colors.text,
      fontFamily: theme.fonts.family.bold,
    },
    ghostText: { color: theme.colors.textSecondary },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            try {
              SafeHaptics.selectionAsync();
            } catch {}
            try {
              navigation.goBack();
            } catch (e) {}
          }}
          style={styles.backTouch}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color={theme.colors.primaryGreen}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            try {
              SafeHaptics.selectionAsync();
            } catch {}

            if (secondsLeft === 0) {
              // restart from full
              setSecondsLeft(TOTAL);
              setHasCompleted(false);
              handleStartPress();
              return;
            }

            if (!isRunning) {
              if (secondsLeft === TOTAL) {
                // initial start (not yet started) — reuse start handler so it vibrates
                handleStartPress();
              } else {
                // resuming from pause: don't re-run the initial start animations
                setIsRunning(true);
                // ensure timer is visible quickly
                Animated.parallel([
                  Animated.timing(timerOpacity, {
                    toValue: 1,
                    duration: 160,
                    useNativeDriver: true,
                  }),
                  Animated.timing(timerScale, {
                    toValue: 1,
                    duration: 160,
                    useNativeDriver: true,
                  }),
                ]).start();
              }
            } else {
              // pause
              setIsRunning(false);
            }
          }}
          style={styles.headerRightTouch}
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={26}
            color={theme.colors.primaryGreen}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{"Delay Craving"}</Text>
      </View>

      <View style={styles.content}>
        {(() => {
          const total = TOTAL;
          const maxSize = Math.min(theme.dimensions.screenWidth * 0.82, 480);
          const ringSize = Math.max(200, Math.round(maxSize));
          const stroke = Math.max(10, Math.round(ringSize * 0.054));
          const timerFont = Math.max(28, Math.round(ringSize * 0.185));
          const subFont = Math.max(13, Math.round(ringSize * 0.06));

          return (
            <View
              style={{
                width: ringSize,
                height: ringSize,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgressRing
                progress={1 - secondsLeft / total}
                size={ringSize}
                strokeWidth={stroke}
                showMarker="end"
                showSeparator={true}
              />
              <View style={styles.ringInnerText}>
                {(() => {
                  const isAtStart = secondsLeft === total;

                  if (isAtStart) {
                    return (
                      <Animated.View
                        style={{
                          opacity: startOpacity,
                          transform: [{ scale: startScale }],
                          alignItems: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={handleStartPress}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[styles.timerText, { fontSize: timerFont }]}
                          >
                            Start
                          </Text>
                        </TouchableOpacity>
                        <Text
                          style={[
                            styles.titleSubtitle,
                            { marginTop: theme.spacing.xs },
                          ]}
                        >
                          Tap to start
                        </Text>
                      </Animated.View>
                    );
                  }

                  return (
                    <Animated.View
                      style={{
                        opacity: timerOpacity,
                        transform: [{ scale: timerScale }],
                        alignItems: "center",
                      }}
                    >
                      <Text style={[styles.timerText, { fontSize: timerFont }]}>
                        {formatTime(secondsLeft)}
                      </Text>
                      <Text style={[styles.timerSub, { fontSize: subFont }]}>
                        {secondsLeft === 0
                          ? "Completed"
                          : isRunning
                          ? "Take a walk"
                          : "Delay Craving"}
                      </Text>
                    </Animated.View>
                  );
                })()}
              </View>
            </View>
          );
        })()}

        {/* Controls removed: buttons under the timer were deleted per request */}
      </View>
    </View>
  );
};

export default DelayCravingScreen;
