import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, Rect, RadialGradient, Stop } from "react-native-svg";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

type Star = {
  x: number; // 0-100
  y: number; // 0-100
  size: number;
  opacity: number;
  delay: number;
  duration: number;
  color?: string;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function CommitmentBackground202({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { width, height } = useWindowDimensions();

  const stars = useMemo<Star[]>(() => {
    const arr: Star[] = [];
    const palette = ["#FFFFFF", "#E6FFE8", "#F0FFEA", "#FFF9E6"];
    for (let i = 0; i < 100; i++) {
      arr.push({
        x: parseFloat(rand(0, 100).toFixed(2)),
        y: parseFloat(rand(0, 100).toFixed(2)),
        size: parseFloat(rand(0.5, 2.5).toFixed(2)),
        opacity: parseFloat(rand(0.3, 1).toFixed(2)),
        delay: parseFloat(rand(0, 3).toFixed(2)),
        duration: Math.round(rand(2000, 4000)),
        color: palette[Math.floor(rand(0, palette.length))],
      });
    }
    return arr;
  }, []);

  const pulse = useRef(new Animated.Value(0)).current;
  const slowPulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 3600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(slowPulse, {
          toValue: 1,
          duration: 9000,
          useNativeDriver: true,
        }),
        Animated.timing(slowPulse, {
          toValue: 0,
          duration: 9000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // nebula orbs removed
  }, [pulse]);

  return (
    <View style={{ flex: 1 }}>
      <View pointerEvents="none" style={styles.container}>
        <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
          <Defs>
            <RadialGradient
              id="bgRadial"
              cx="50%"
              cy="30%"
              rx="60%"
              ry="60%"
              fx="50%"
              fy="30%"
            >
              <Stop offset="0%" stopColor="#3d5a48" stopOpacity="1" />
              <Stop offset="40%" stopColor="#2d4a38" stopOpacity="1" />
              <Stop offset="75%" stopColor="#1a3a28" stopOpacity="1" />
              <Stop offset="100%" stopColor="#0d2818" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="url(#bgRadial)"
          />
        </Svg>

        {/* animated subtle overlay */}
        {/* layered animated overlays for richer feel */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(144,184,85,0.06)",
              opacity: slowPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.04, 0.14],
              }),
            },
          ]}
        />

        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(99,169,106,0.06)",
              opacity: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.04, 0.16],
              }),
            },
          ]}
        />

        {/* soft gradient overlay matching the web prompt */}
        <LinearGradient
          colors={[
            "rgba(144,184,85,0.18)",
            "transparent",
            "rgba(99,169,106,0.28)",
          ]}
          style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
        />

        {/* nebula orbs removed */}

        {/* stars */}
        {stars.map((s, i) => (
          <StarView key={i} star={s} parentW={width} parentH={height} />
        ))}
      </View>

      {/* render children above the background */}
      {children}
    </View>
  );
}

function StarView({
  star,
  parentW,
  parentH,
}: {
  star: Star;
  parentW: number;
  parentH: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.delay(star.delay * 1000),
      Animated.timing(anim, {
        toValue: 1,
        duration: star.duration,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: star.duration,
        useNativeDriver: true,
      }),
    ]);
    const loop = Animated.loop(sequence);
    loop.start();
    return () => loop.stop();
  }, [anim, star.delay, star.duration]);

  const left = (star.x / 100) * parentW;
  const top = (star.y / 100) * parentH;

  // soft glow behind star for nicer look
  return (
    <Animated.View style={{ position: "absolute", left, top }}>
      <Animated.View
        style={{
          position: "absolute",
          left: -star.size * 1.5,
          top: -star.size * 1.5,
          width: star.size * 4,
          height: star.size * 4,
          borderRadius: (star.size * 4) / 2,
          backgroundColor: "rgba(255,255,255,0.08)",
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.06, 0.18],
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1.25],
              }),
            },
          ],
          shadowColor: "#fff",
          shadowRadius: 8,
          shadowOpacity: 0.6,
        }}
      />

      <Animated.View
        style={{
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: star.color || "#FFFFFF",
          opacity: star.opacity,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1.15],
              }),
            },
          ],
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: -1,
  },
  orb: {
    position: "absolute",
    width: 256,
    height: 256,
    borderRadius: 128,
    shadowColor: "#000",
    shadowRadius: 40,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
});
