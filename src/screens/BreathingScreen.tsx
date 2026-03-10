import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Vibration,
  PanResponder,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
  ToastAndroid,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import AppHeader from "../components/AppHeader";
import { useNavigation } from "@react-navigation/native";

const BreathingScreen: React.FC = () => {
  const theme = useTheme();
  const [running, setRunning] = useState(false);
  const [
    ,/* filled */
    /* setFilled */
  ] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const scale = useRef(new Animated.Value(0.85)).current;
  const depth = useRef(new Animated.Value(0)).current;
  const rewardAnim = useRef(new Animated.Value(0)).current;
  const dotAnimRefs = useRef<Animated.Value[]>([]);
  const visibleFilledRef = useRef<number>(0);
  const [visibleFilled, setVisibleFilled] = useState<number>(0);
  useEffect(() => {
    visibleFilledRef.current = visibleFilled;
  }, [visibleFilled]);
  // sessionStartRef removed (not used)
  const finalCycleRef = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiAnimsRef = useRef<
    Array<{
      startX: number;
      size: number;
      x: Animated.Value;
      y: Animated.Value;
      opacity: Animated.Value;
      rot: Animated.Value;
      scale: Animated.Value;
      color: string;
    }>
  >([]);

  // layout constants used for the action circle positioning
  const circleSize = 220;
  const bottomOffset = 40;
  const extraBottomSpace = 8;

  const isPressedRef = useRef(false);
  const cycleIdRef = useRef(0);
  const timersRef = useRef<Array<number | null>>([]);
  const intervalRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold" | "exhale">(
    "idle"
  );

  const cycleStartRef = useRef<number | null>(null);
  const navigation = useNavigation();

  // Bottom sheet states & animations
  const [sheetVisible, setSheetVisible] = useState(false);
  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;
  const sheetHeight = Math.min(520, Math.round(screenHeight * 0.58));
  const sheetAnim = useRef(new Animated.Value(sheetHeight)).current; // translateY: 0 = visible, sheetHeight = hidden
  const overlayAnim = useRef(new Animated.Value(0)).current; // 0..1
  const scrollOffsetRef = useRef(0);

  const openSheet = () => {
    setSheetVisible(true);
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(sheetAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerCelebration = () => {
    try {
      setShowConfetti(true);
      const colors = [
        theme.colors.primaryGreen,
        theme.colors.secondaryGreen,
        "#FFD166",
        "#FF6B6B",
        "#6BCBFF",
        "#C78CFF",
      ];

      const pieces = new Array(40).fill(0).map((_, i) => {
        const size = 8 + Math.round(Math.random() * 14); // 8..22
        return {
          startX: Math.round(Math.random() * screenWidth),
          size,
          x: new Animated.Value(0),
          y: new Animated.Value(0),
          opacity: new Animated.Value(1),
          rot: new Animated.Value(0),
          scale: new Animated.Value(0.6 + Math.random() * 0.8),
          color: colors[i % colors.length],
        };
      });

      confettiAnimsRef.current = pieces;

      // Animate pieces with staggered start, drifting outward and falling
      Animated.stagger(
        12,
        pieces.map((p) =>
          Animated.parallel([
            Animated.timing(p.x, {
              toValue: (Math.random() - 0.5) * (screenWidth * 0.6),
              duration: 1600 + Math.random() * 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(p.y, {
              toValue: screenHeight * (0.55 + Math.random() * 0.25),
              duration: 1600 + Math.random() * 600,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 1600 + Math.random() * 600,
              useNativeDriver: true,
            }),
            Animated.timing(p.rot, {
              toValue: Math.random() * 720,
              duration: 1600 + Math.random() * 600,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(p.scale, {
                toValue: 1.05,
                duration: 220,
                useNativeDriver: true,
              }),
              Animated.timing(p.scale, {
                toValue: 0.95 + Math.random() * 0.2,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
          ])
        )
      ).start(() => {
        setTimeout(() => {
          setShowConfetti(false);
          try {
            const _title = "You did it 🎉👏";
            const _body =
              "Each breath helps your body reset, reducing stress, restoring balance, and reminding you that you're stronger than the craving.";
            Alert.alert(
              _title,
              _body,
              [
                {
                  text: "🔁 Do it again",
                  onPress: () => {
                    try {
                      // reset visible fills and restart the exercise
                      setVisibleFilled(0);
                      visibleFilledRef.current = 0;
                      setPhase("idle");
                      setTimeout(() => start(), 120);
                    } catch {}
                  },
                },
                {
                  text: "😊 I feel calmer",
                  onPress: () => {
                    try {
                      // close sheet if open and return to previous screen
                      try {
                        closeSheet(0);
                      } catch {}
                      setTimeout(() => {
                        try {
                          (navigation as any).goBack();
                        } catch {}
                      }, 180);
                    } catch {}
                  },
                  style: "default",
                },
              ],
              { cancelable: true }
            );
            try {
              if (Platform.OS === "android")
                ToastAndroid.show(_body, ToastAndroid.LONG);
            } catch {}
          } catch {}
        }, 600);
      });
    } catch {}
  };

  const closeSheet = (velocity = 0) => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetAnim, {
        toValue: sheetHeight,
        duration: Math.max(200, Math.min(420, 300 + velocity * 50)),
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSheetVisible(false);
    });
  };

  const pan = useRef(
    PanResponder.create({
      // only become the pan responder when the gesture indicates a
      // downward pull from the top of the sheet (i.e. content is scrolled
      // to top). While the ScrollView content is scrolled, allow native
      // scrolling to handle vertical gestures.
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gesture) => {
        const dy = gesture.dy;
        const dx = gesture.dx;
        // prefer horizontal gestures to not interfere
        if (Math.abs(dx) > Math.abs(dy)) return false;
        // if the sheet content is scrolled (scrollOffset > 0), don't
        // steal the gesture — let the ScrollView handle it
        if (scrollOffsetRef.current > 0) return false;
        // only start when user is pulling down enough
        return dy > 6;
      },
      onPanResponderMove: (_, gesture) => {
        const dy = Math.max(0, gesture.dy);
        sheetAnim.setValue(dy);
        const t = Math.max(0, Math.min(1, 1 - dy / sheetHeight));
        overlayAnim.setValue(t);
      },
      onPanResponderRelease: (_, gesture) => {
        const shouldClose = gesture.dy > sheetHeight * 0.28 || gesture.vy > 0.8;
        if (shouldClose) closeSheet(Math.abs(gesture.vy));
        else {
          Animated.parallel([
            Animated.timing(overlayAnim, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(sheetAnim, {
              toValue: 0,
              duration: 220,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const start = () => {
    if (running) return;
    // mark pressed and start a new cycle
    isPressedRef.current = true;
    cycleIdRef.current += 1;
    const myCycle = cycleIdRef.current;
    setRunning(true);

    // helper to run a single inhale-hold-exhale cycle as a Promise
    const runOne = () =>
      new Promise<boolean>((resolve) => {
        if (!isPressedRef.current) return resolve(false);
        setPhase("inhale");
        cycleStartRef.current = Date.now();
        const inhale = Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.6,
            duration: 4000,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(depth, {
            toValue: 1.1,
            duration: 4000,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
        ]);
        const exhale = Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.85,
            duration: 4000,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(depth, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
        ]);

        // schedule countdown updates for inhale (4s) + hold (4s) + exhale (4s)
        setCountdown(4);
        const t0 = setTimeout(() => setCountdown(3), 1000);
        const t1 = setTimeout(() => setCountdown(2), 2000);
        const t2 = setTimeout(() => setCountdown(1), 3000);
        const t3 = setTimeout(() => {
          setPhase("hold");
          setCountdown(4);
        }, 4000);
        const t4 = setTimeout(() => setCountdown(3), 5000);
        const t5 = setTimeout(() => setCountdown(2), 6000);
        const t6 = setTimeout(() => setCountdown(1), 7000);
        const t7 = setTimeout(() => {
          setPhase("exhale");
          setCountdown(4);
        }, 8000);
        const t8 = setTimeout(() => setCountdown(3), 9000);
        const t9 = setTimeout(() => setCountdown(2), 10000);
        const t10 = setTimeout(() => setCountdown(1), 11000);
        const t11 = setTimeout(() => setCountdown(null), 12000);
        timersRef.current.push(
          t0 as unknown as number,
          t1 as unknown as number,
          t2 as unknown as number,
          t3 as unknown as number,
          t4 as unknown as number,
          t5 as unknown as number,
          t6 as unknown as number,
          t7 as unknown as number,
          t8 as unknown as number,
          t9 as unknown as number,
          t10 as unknown as number,
          t11 as unknown as number
        );

        // run inhale -> hold -> exhale (smooth 4s inhale, 4s hold, 4s exhale)
        Animated.sequence([inhale, Animated.delay(4000), exhale]).start(
          ({ finished }) => {
            resolve(
              Boolean(
                finished &&
                  isPressedRef.current &&
                  myCycle === cycleIdRef.current
              )
            );
          }
        );
      });
    (async () => {
      while (isPressedRef.current && visibleFilledRef.current < 5) {
        cycleStartRef.current = Date.now();
        const ok = await runOne();
        if (!ok) break;
        try {
          Vibration.vibrate(100);
        } catch {}
        setVisibleFilled((prev) => {
          const next = Math.min(5, prev + 1);
          visibleFilledRef.current = next;
          if (next === 5) finalCycleRef.current = true;
          const anim = dotAnimRefs.current[next - 1];
          if (anim) {
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1.4,
                duration: 180,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }),
              Animated.timing(anim, {
                toValue: 1,
                duration: 220,
                easing: Easing.in(Easing.quad),
                useNativeDriver: false,
              }),
            ]).start();
          }

          // small reward burst animation (particles + halo) when a dot fills
          try {
            Animated.sequence([
              Animated.timing(rewardAnim, {
                toValue: 1,
                duration: 220,
                useNativeDriver: false,
              }),
              Animated.timing(rewardAnim, {
                toValue: 0,
                duration: 420,
                useNativeDriver: false,
              }),
            ]).start();
          } catch {}
          return next;
        });
        // small gap before potentially repeating
        await new Promise((r) => setTimeout(r, 180));
      }
      // After loop finishes: if a final cycle was requested and the user
      // is still pressing, run one more inhale-hold-exhale cycle then
      // celebrate.
      if (finalCycleRef.current && isPressedRef.current) {
        // a final run that doesn't rely on cycle equality
        const runOneFinal = () =>
          new Promise<boolean>((resolve) => {
            if (!isPressedRef.current) return resolve(false);
            const inhaleF = Animated.parallel([
              Animated.timing(scale, {
                toValue: 1.6,
                duration: 4000,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
              }),
              Animated.timing(depth, {
                toValue: 1.1,
                duration: 4000,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
              }),
            ]);
            const exhaleF = Animated.parallel([
              Animated.timing(scale, {
                toValue: 0.85,
                duration: 4000,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
              }),
              Animated.timing(depth, {
                toValue: 0,
                duration: 4000,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
              }),
            ]);
            Animated.sequence([inhaleF, Animated.delay(4000), exhaleF]).start(
              ({ finished }) => {
                resolve(Boolean(finished && isPressedRef.current));
              }
            );
          });

        const finalOk = await runOneFinal();
        if (finalOk) triggerCelebration();
      }

      // finished or cancelled
      finalCycleRef.current = false;
      setPhase("idle");
      setRunning(false);
      if (intervalRef.current != null)
        clearInterval(intervalRef.current as number);
      intervalRef.current = null;
      setCountdown(null);
    })();
  };

  const cancel = () => {
    // Mark press as released and invalidate current cycle
    isPressedRef.current = false;
    cycleIdRef.current += 1;
    try {
      scale.stopAnimation();
    } catch {}
    try {
      depth.stopAnimation();
    } catch {}
    // clear scheduled timers and gently reset visuals
    timersRef.current.forEach((t) => {
      if (t != null) clearTimeout(t as number);
    });
    timersRef.current = [];
    if (intervalRef.current != null)
      clearInterval(intervalRef.current as number);
    intervalRef.current = null;
    // clear any pending countdown timers
    timersRef.current.forEach((t) => {
      if (t != null) clearTimeout(t as number);
    });
    timersRef.current = [];

    // clear any visible or committed fills when user releases
    setVisibleFilled(0);
    visibleFilledRef.current = 0;
    setPhase("idle");
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(depth, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(() => setRunning(false));
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.primaryBackground },
      ]}
    >
      <AppHeader
        title="Breathe With Me"
        onBack={() => (navigation as any).goBack()}
        onAlert={openSheet}
      />
      {/* Global confetti layer so celebration can appear regardless of sheet state */}
      {showConfetti ? (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            zIndex: 999,
            elevation: 999,
            pointerEvents: "none",
          }}
        >
          {confettiAnimsRef.current.map((p, i) => (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                left: p.startX - p.size / 2,
                top: -20,
                width: p.size,
                height: Math.round(p.size * 1.4),
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  {
                    rotate: p.rot.interpolate({
                      inputRange: [0, 360],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                  { scale: p.scale },
                ],
                borderRadius: Math.max(2, Math.round(p.size * 0.12)),
                zIndex: 999,
                elevation: 999,
              }}
            />
          ))}
        </View>
      ) : null}
      <View
        style={[
          styles.center,
          { paddingBottom: circleSize + bottomOffset + extraBottomSpace + 16 },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {phase === "idle"
            ? "Tap & hold to begin"
            : `${phase.charAt(0).toUpperCase() + phase.slice(1)} ${
                countdown ? `• ${countdown}s` : ""
              }`}
        </Text>

        <View style={styles.dotRow} pointerEvents="none">
          {Array.from({ length: 5 }).map((_, i) => {
            if (!dotAnimRefs.current[i])
              dotAnimRefs.current[i] = new Animated.Value(1);
            const anim = dotAnimRefs.current[i];
            const filledDot = i < visibleFilled;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    transform: [{ scale: anim }],
                    backgroundColor: filledDot
                      ? theme.colors.primaryGreen
                      : "transparent",
                    borderWidth: filledDot ? 0 : 1,
                    borderColor: theme.colors.textSecondary,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* circle placeholder removed from here so text/dots stay centered */}
      </View>

      {/* action circle placed near bottom for easy thumb reach (only the circle moves) */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: bottomOffset,
          alignItems: "center",
        }}
        pointerEvents="box-none"
      >
        <View
          style={{
            width: circleSize + 48,
            height: circleSize + 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pressable
            onPressIn={start}
            onPressOut={cancel}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <Animated.View
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                alignItems: "center",
                justifyContent: "center",
                transform: [
                  { scale },
                  {
                    rotate: depth.interpolate({
                      inputRange: [0, 1.1],
                      outputRange: ["0deg", "4deg"],
                    }),
                  },
                ],
                shadowRadius: depth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, 16],
                }),
                zIndex: 60,
                elevation: 22,
                borderWidth: 2,
                borderColor: theme.colors.primaryBackground,
              }}
            >
              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  // pulsing halo behind the main fill — grows/fades with `scale`
                  width: circleSize + 36,
                  height: circleSize + 36,
                  left: -(36 / 2),
                  top: -(36 / 2),
                  borderRadius: (circleSize + 36) / 2,
                  backgroundColor: theme.colors.primaryGreen,
                  opacity: scale.interpolate({
                    inputRange: [0.85, 1.02, 1.6],
                    outputRange: [0.02, 0.06, 0.18],
                  }),
                  transform: [
                    {
                      scale: scale.interpolate({
                        inputRange: [0.85, 1.02, 1.6],
                        outputRange: [0.98, 1.02, 1.08],
                      }),
                    },
                  ],
                }}
              />

              {/* outer animated ring: subtle rotate + bob for extra motion */}
              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  width: circleSize + 80,
                  height: circleSize + 80,
                  left: -(80 / 2),
                  top: -(80 / 2),
                  borderRadius: (circleSize + 80) / 2,
                  borderWidth: 2,
                  borderColor: theme.colors.primaryGreen,
                  opacity: depth.interpolate({
                    inputRange: [0, 1.1],
                    outputRange: [0, 0.12],
                  }),
                  transform: [
                    {
                      scale: depth.interpolate({
                        inputRange: [0, 1.1],
                        outputRange: [0.98, 1.06],
                      }),
                    },
                    {
                      rotate: depth.interpolate({
                        inputRange: [0, 1.1],
                        outputRange: ["0deg", "6deg"],
                      }),
                    },
                    {
                      translateY: depth.interpolate({
                        inputRange: [0, 1.1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                }}
              />

              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: circleSize / 2,
                  backgroundColor: theme.colors.primaryGreen,
                  opacity: scale.interpolate({
                    inputRange: [0.85, 1.02, 1.25],
                    outputRange: [0.25, 0.75, 1],
                  }),
                }}
              />

              <View
                style={[
                  styles.circle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    backgroundColor: "transparent",
                  },
                ]}
              />
            </Animated.View>
          </Pressable>
        </View>

        {/* bottom sheet removed */}
      </View>
      {/* Bottom sheet overlay + sheet */}
      {sheetVisible ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                // keep overlay consistent with theme (works for light/dark)
                backgroundColor: theme.colors.primaryBackground,
                opacity: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.56],
                }),
                zIndex: 80,
              },
            ]}
          >
            <Pressable style={{ flex: 1 }} onPress={() => closeSheet(0)} />
          </Animated.View>

          <Animated.View
            {...pan.panHandlers}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: sheetHeight,
              zIndex: 90,
              transform: [{ translateY: sheetAnim }],
              backgroundColor: theme.colors.primaryBackground,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 18,
              paddingTop: 12,
              paddingHorizontal: 16,
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 6,
                  borderRadius: 4,
                  backgroundColor: theme.colors.textSecondary,
                  opacity: 0.28,
                }}
              />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 28 }}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={(e) => {
                scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.primaryBackground,
                  borderRadius: 14,
                  padding: 18,
                  marginHorizontal: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 14,
                    bottom: 14,
                    width: 6,
                    borderTopLeftRadius: 14,
                    borderBottomLeftRadius: 14,
                    backgroundColor: theme.colors.primaryGreen,
                  }}
                />

                <View style={{ marginLeft: 14 }}>
                  <View style={{ marginBottom: 14 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 6,
                          backgroundColor: theme.colors.primaryGreen,
                        }}
                      />
                      <Text
                        style={{
                          color: theme.colors.primaryGreen,
                          fontSize: theme.fonts.size.large,
                          marginLeft: 12,
                          fontFamily: theme.fonts.family.bold,
                        }}
                      >
                        How this exercise works
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: theme.colors.text,
                        opacity: 0.98,
                        lineHeight: 24,
                      }}
                    >
                      Take slow, deep breaths: inhale gently through your nose,
                      letting your belly expand, then exhale slowly through your
                      mouth. Aim for an easy 4 second inhale, a brief pause, and
                      a 4 second exhale. Focus on a steady rhythm and the
                      feeling of air moving in and out, this anchors attention
                      and calms the mind.
                    </Text>
                  </View>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.textSecondary,
                      opacity: 0.06,
                      marginVertical: 12,
                    }}
                  />

                  <View style={{ marginBottom: 14 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 6,
                          backgroundColor: theme.colors.primaryGreen,
                        }}
                      />
                      <Text
                        style={{
                          color: theme.colors.primaryGreen,
                          fontSize: theme.fonts.size.large,
                          marginLeft: 12,
                          fontFamily: theme.fonts.family.bold,
                        }}
                      >
                        How it helps reduce cravings
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: theme.colors.text,
                        opacity: 0.98,
                        lineHeight: 24,
                      }}
                    >
                      Controlled breathing activates the body’s calming response
                      and reduces stress, a common driver of cravings. Taking a
                      pause to breathe interrupts the automatic urge, helping
                      you feel more centered and able to choose a different
                      action.
                    </Text>
                  </View>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.textSecondary,
                      opacity: 0.06,
                      marginVertical: 12,
                    }}
                  />

                  <View style={{ marginBottom: 14 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 6,
                          backgroundColor: theme.colors.primaryGreen,
                        }}
                      />
                      <Text
                        style={{
                          color: theme.colors.primaryGreen,
                          fontSize: theme.fonts.size.large,
                          marginLeft: 12,
                          fontFamily: theme.fonts.family.bold,
                        }}
                      >
                        How it supports your body during cravings
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: theme.colors.text,
                        opacity: 0.98,
                        lineHeight: 24,
                      }}
                    >
                      Deep, steady breaths improve oxygen flow and help lower
                      your heart rate. That physical calming makes it easier for
                      urges to pass and gives you a small but reliable sense of
                      control in the moment.
                    </Text>
                  </View>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.textSecondary,
                      opacity: 0.06,
                      marginVertical: 12,
                    }}
                  />

                  <View style={{ marginBottom: 6 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 6,
                          backgroundColor: theme.colors.primaryGreen,
                        }}
                      />
                      <Text
                        style={{
                          color: theme.colors.primaryGreen,
                          fontSize: theme.fonts.size.large,
                          marginLeft: 12,
                          fontFamily: theme.fonts.family.bold,
                        }}
                      >
                        Encouragement
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: theme.colors.text,
                        opacity: 0.98,
                        lineHeight: 24,
                        marginBottom: 12,
                      }}
                    >
                      This is a quick, accessible tool you can use anywhere.
                      Even one or two mindful breaths can change the direction
                      of a craving, be kind to yourself; each pause is progress.
                    </Text>

                    <Text
                      style={{
                        color: theme.colors.text,
                        fontSize: 14,
                        marginBottom: 6,
                      }}
                    >
                      Quick practice
                    </Text>
                    <View style={{ marginLeft: 6 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 6,
                            backgroundColor: theme.colors.primaryGreen,
                            marginTop: 6,
                          }}
                        />
                        <Text
                          style={{
                            color: theme.colors.text,
                            marginLeft: 10,
                            lineHeight: 20,
                          }}
                        >
                          Find a comfortable, seated position and close your
                          eyes if you can.
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 6,
                            backgroundColor: theme.colors.primaryGreen,
                            marginTop: 6,
                          }}
                        />
                        <Text
                          style={{
                            color: theme.colors.text,
                            marginLeft: 10,
                            lineHeight: 20,
                          }}
                        >
                          Try 4 4 breathing: inhale for 4 counts, pause briefly,
                          exhale for 4 counts. Repeat 3 times.
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 6,
                            backgroundColor: theme.colors.primaryGreen,
                            marginTop: 6,
                          }}
                        />
                        <Text
                          style={{
                            color: theme.colors.text,
                            marginLeft: 10,
                            lineHeight: 20,
                          }}
                        >
                          Use this as a short reset, you can repeat whenever an
                          urge comes.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, marginBottom: 12 },
  circle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "transparent",
  },
  dotRow: {
    flexDirection: "row",
    marginTop: 18,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 20, height: 20, borderRadius: 10, marginHorizontal: 8 },
});

export default BreathingScreen;
