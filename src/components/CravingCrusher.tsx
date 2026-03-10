import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  Easing,
  PanResponder,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

type Bubble = {
  id: number;
  x: number;
  size: number;
  animY: Animated.Value;
  animScale: Animated.Value;
  animOpacity: Animated.Value;
  colorStart?: string;
  colorEnd?: string;
  popped: boolean;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const BubbleView: React.FC<{ bubble: Bubble; onPop: () => void }> = React.memo(
  ({ bubble, onPop }) => {
    return (
      <Animated.View
        style={{
          position: "absolute",
          left: bubble.x,
          top: 0,
          width: bubble.size,
          height: bubble.size,
          borderRadius: bubble.size / 2,
          transform: [
            { translateY: bubble.animY },
            { scale: bubble.animScale },
          ],
          opacity: bubble.animOpacity,
          overflow: "hidden",
        }}
      >
        <Pressable onPress={onPop} style={{ flex: 1 }}>
          <Svg
            width={bubble.size}
            height={bubble.size}
            viewBox={`0 0 ${bubble.size} ${bubble.size}`}
          >
            <Defs>
              <RadialGradient id={`g${bubble.id}`} cx="35%" cy="30%" r="75%">
                <Stop
                  offset="0%"
                  stopColor={bubble.colorStart ?? "#A5D8FF"}
                  stopOpacity={0.95}
                />
                <Stop
                  offset="65%"
                  stopColor={bubble.colorEnd ?? "#5CC8FF"}
                  stopOpacity={0.7}
                />
              </RadialGradient>
            </Defs>
            <Circle
              cx={bubble.size / 2}
              cy={bubble.size / 2}
              r={bubble.size / 2}
              fill={`url(#g${bubble.id})`}
            />
            <Circle
              cx={bubble.size * 0.26}
              cy={bubble.size * 0.2}
              r={bubble.size * 0.22}
              fill="white"
              opacity={0.12}
            />
            <Circle
              cx={bubble.size / 2}
              cy={bubble.size / 2}
              r={bubble.size / 2 - Math.max(1, bubble.size * 0.03)}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={Math.max(1, bubble.size * 0.02)}
            />
          </Svg>
        </Pressable>
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.bubble.id === next.bubble.id &&
    prev.bubble.size === next.bubble.size &&
    prev.bubble.colorStart === next.bubble.colorStart
);

const CravingCrusher: React.FC<{
  visible: boolean;
  onClose: () => void;
  roundSeconds?: number;
}> = ({ visible, onClose, roundSeconds = 40 }) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const idRef = useRef(1);
  const spawnIntervalRef = useRef<number | null>(null);
  const roundTimeoutRef = useRef<number | null>(null);
  const [poppedCount, setPoppedCount] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const popSoundsRef = useRef<Array<any>>([]);
  const MAX_BUBBLES = 8;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@craving_high_score");
        if (!mounted) return;
        if (raw != null) {
          const val = parseInt(raw, 10);
          if (!Number.isNaN(val)) setHighScore(val);
        }
      } catch {}
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (visible) startRound();
    else stopRound();
    return () => stopRound();
  }, [visible]);

  useEffect(() => {
    let mounted = true;
    const files = [
      require("../../assets/bubble-pop-01.mp3"),
      require("../../assets/bubble-pop-02.mp3"),
    ];

    (async () => {
      let AV: any = null;
      try {
        // require at runtime to avoid TS issues if expo-av isn't installed in environment
        AV = require("expo-av");
      } catch {}

      if (AV && AV.Audio) {
        try {
          await AV.Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        } catch {}

        const loaded: Array<any> = [];
        for (let i = 0; i < files.length; i++) {
          try {
            const result = await AV.Audio.Sound.createAsync(files[i]);
            loaded.push(result.sound);
          } catch {
            loaded.push(null);
          }
        }

        if (mounted) popSoundsRef.current = loaded;
      }
    })();

    return () => {
      mounted = false;
      (async () => {
        try {
          for (const s of popSoundsRef.current) {
            if (s) await s.unloadAsync();
          }
          popSoundsRef.current = [];
        } catch {}
      })();
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dx) > 10 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx > 80 && Math.abs(gestureState.dy) < 60) {
          try {
            navigation.navigate("Support");
          } catch {}
          onClose();
        }
      },
    })
  );

  const spawnBubble = () => {
    const id = idRef.current++;
    if (bubbles.length >= MAX_BUBBLES) return;
    // increase minimum size slightly so very small bubbles are less frequent
    const size = 80 + Math.round(Math.random() * 120); // 80..200
    const x = Math.round(Math.random() * (screenWidth - size - 24)) + 12;
    const animY = new Animated.Value(screenHeight + 60);
    const animScale = new Animated.Value(1);
    const animOpacity = new Animated.Value(1);
    // make bubbles rise a little faster (previously 2200..5800)
    const duration = 1800 + Math.random() * 3200; // 1800..5000ms

    const palettes = [
      ["#A5D8FF", "#5CC8FF"],
      ["#CDE7FF", "#8FD3FF"],
      ["#D8C8FF", "#A58BFF"],
      ["#C9F0E1", "#6FE3C3"],
      ["#D7E8FF", "#B0C8FF"],
      ["#E8E6FF", "#C6B8FF"],
      ["#B9F0FF", "#7FE6F0"],
    ];
    const choice = palettes[Math.floor(Math.random() * palettes.length)];

    const bubble: Bubble = {
      id,
      x,
      size,
      animY,
      animScale,
      animOpacity,
      colorStart: choice[0],
      colorEnd: choice[1],
      popped: false,
    };
    setBubbles((prev) => [...prev, bubble]);

    Animated.timing(animY, {
      toValue: -120,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => setBubbles((prev) => prev.filter((b) => b.id !== id)));
  };

  const spawnTick = () => {
    const count = bubbles.length;
    // allow a small burst when there is room, but cap at MAX_BUBBLES
    const available = MAX_BUBBLES - count;
    if (available <= 0) return;
    // always spawn two when there's room, otherwise fill what's available
    const toSpawn = Math.min(2, available);
    for (let i = 0; i < toSpawn; i++) spawnBubble();
  };

  const startRound = () => {
    stopRound();
    setPoppedCount(0);
    // start with two bubbles for more immediate play
    for (let i = 0; i < 2; i++) spawnBubble();
    // spawn interval: slightly slower to avoid crowding
    spawnIntervalRef.current = setInterval(
      spawnTick,
      1100
    ) as unknown as number;
    // if roundSeconds is positive, schedule an end; otherwise run indefinitely
    if (roundSeconds && roundSeconds > 0) {
      roundTimeoutRef.current = setTimeout(
        () => endRound(),
        roundSeconds * 1000
      ) as unknown as number;
    } else {
      roundTimeoutRef.current = null;
    }
  };

  const stopRound = () => {
    if (spawnIntervalRef.current != null) {
      clearInterval(spawnIntervalRef.current as number);
      spawnIntervalRef.current = null;
    }
    if (roundTimeoutRef.current != null) {
      clearTimeout(roundTimeoutRef.current as number);
      roundTimeoutRef.current = null;
    }
    setBubbles([]);
  };

  const endRound = () => stopRound();

  const popBubble = async (id: number) => {
    const found = bubbles.find((b) => b.id === id);
    if (!found || found.popped) return;
    found.popped = true;
    Animated.parallel([
      Animated.timing(found.animScale, {
        toValue: 1.6,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(found.animOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setBubbles((prev) => prev.filter((b) => b.id !== id)));

    setPoppedCount((c) => {
      const next = c + 1;
      setHighScore((h) => {
        const updated = Math.max(h, next);
        try {
          AsyncStorage.setItem("@craving_high_score", String(updated));
        } catch {}
        return updated;
      });
      return next;
    });

    try {
      const pool = popSoundsRef.current;
      if (pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        const s = pool[idx];
        if (s) {
          try {
            const volume = 0.9 + Math.random() * 0.15;
            const rate = 0.96 + Math.random() * 0.18;
            if (typeof s.setStatusAsync === "function") {
              try {
                await s.setStatusAsync({
                  volume,
                  rate,
                  shouldCorrectPitch: true,
                });
              } catch {}
            }
            await s.replayAsync();
          } catch {}
        }
      }
    } catch {}

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    // no multiplier/combo behavior: each pop counts once
  };

  if (!visible) return null;

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.primaryBackground }]}
    >
      <View
        style={[
          styles.headerRow,
          {
            backgroundColor: theme.colors.primaryBackground,
            zIndex: 20,
            elevation: 20,
          },
        ]}
      >
        <Pressable
          onPress={onClose}
          style={styles.backTouch}
          accessibilityRole="button"
        >
          <Ionicons
            name="chevron-back"
            size={theme.fonts.size.xlarge}
            color={theme.colors.primaryGreen}
          />
        </Pressable>

        <Text
          style={[
            styles.title,
            {
              color: theme.colors.primaryGreen,
              fontSize: theme.fonts.size.xlarge,
              fontFamily: theme.fonts.family.bold,
            },
          ]}
        >
          Craving Crusher
        </Text>

        <Pressable
          onPress={() => {}}
          style={styles.alertTouch}
          accessibilityRole="button"
        >
          <View style={styles.scoreInline}>
            <Ionicons
              name="trophy"
              size={theme.fonts.size.xlarge}
              color={theme.colors.primaryGreen}
            />
            <Text
              style={[
                styles.scoreText,
                {
                  color: theme.colors.primaryGreen,
                  fontSize: theme.fonts.size.medium,
                  fontFamily: theme.fonts.family.bold,
                  fontWeight: theme.fonts.weight.bold,
                },
              ]}
            >
              {highScore}
            </Text>
          </View>
        </Pressable>
      </View>

      <View
        style={styles.gameArea}
        pointerEvents={visible ? "box-none" : "none"}
        {...panResponder.current.panHandlers}
      >
        {/* multiplier/combo removed */}
        <View style={styles.centerCountContainer} pointerEvents="none">
          <Text
            style={[
              styles.centerCount,
              {
                color: theme.colors.text,
                textShadowColor: "rgba(0,0,0,0.12)",
                fontFamily: theme.fonts.family.bold,
              },
            ]}
          >
            {poppedCount}
          </Text>
        </View>

        {bubbles.map((b) => (
          <BubbleView key={b.id} bubble={b} onPop={() => popBubble(b.id)} />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  title: { fontSize: 18, fontWeight: "600" },
  backTouch: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  alertTouch: {
    position: "absolute",
    right: 16,
    minWidth: 44,
    height: 44,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreInline: { flexDirection: "row", alignItems: "center" },
  scoreText: { marginLeft: 8, fontSize: 24, fontWeight: "700" },
  gameArea: { flex: 1 },
  centerCountContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
    pointerEvents: "none",
  },
  centerCount: {
    fontSize: 160,
    fontWeight: "800",
    letterSpacing: 1,
    opacity: 0.12,
    textAlign: "center",
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 10,
  },
});

export default CravingCrusher;
