import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Platform } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

interface CircularProgressRingProps {
  progress: number; // 0 to 1
  size: number;
  strokeWidth: number;
  // optional override for the gradient colors (start, mid?, end?)
  overrideColors?: string[];
  // marker: show a small indicator at start/end/both
  showMarker?: "start" | "end" | "both" | "none";
  // whether to render the subtle inner separator ring (defaults to true)
  showSeparator?: boolean;
}

const AnimatedCircle: any = Animated.createAnimatedComponent(Circle);
const AnimatedView: any = Animated.createAnimatedComponent(View);

const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  progress,
  size,
  strokeWidth,
  overrideColors,
  showMarker = "none",
  showSeparator = true,
}) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Animated value for stroke dashoffset
  const anim = useRef(
    new Animated.Value(circumference - clampedProgress * circumference)
  ).current;

  // (we drive the marker from the stroke anim value to keep them in sync)
  // helper to convert polar coords to cartesian for marker placement
  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angleRad: number
  ) => {
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const cx = size / 2;
  const cy = size / 2;
  const markerRadius = Math.max(2, Math.min(6, strokeWidth * 0.9));
  const startAngle = -Math.PI / 2; // top (because we rotate -90)

  // mount animation for scale/opacity and glow
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = circumference - clampedProgress * circumference;

    Animated.parallel([
      Animated.timing(anim, {
        toValue,
        duration: 700,
        useNativeDriver: false,
      }),
      Animated.spring(mountAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    // No per-frame JS listener: derive marker position from `progress` instead
  }, [clampedProgress, circumference, anim, mountAnim]);

  const strokeDasharray = `${circumference}`;

  const bg = (theme.colors.primaryBackground || "").toLowerCase();

  const gradientId = "grad";

  // helper: darken a hex color by a percentage (0-1)
  const darkenHex = (hex: string, amount = 0.12) => {
    const h = hex.replace("#", "");
    const num = parseInt(h, 16);
    const r = Math.max(
      0,
      Math.min(255, Math.floor(((num >> 16) & 0xff) * (1 - amount)))
    );
    const g = Math.max(
      0,
      Math.min(255, Math.floor(((num >> 8) & 0xff) * (1 - amount)))
    );
    const b = Math.max(
      0,
      Math.min(255, Math.floor((num & 0xff) * (1 - amount)))
    );
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const midColor = darkenHex(theme.colors.primaryGreen, 0.14);
  const primary = theme.colors.primaryGreen;
  const secondary = theme.colors.secondaryGreen;
  const gradStart = overrideColors?.[0] ?? primary;
  const gradMid = overrideColors?.[1] ?? midColor;
  const gradEnd = overrideColors?.[2] ?? secondary;

  // pick a subtle contrasting background stroke based on ring mid color luminance
  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
  };
  const luminance = (hex: string) => {
    try {
      const { r, g, b } = hexToRgb(hex);
      const Rs = r / 255;
      const Gs = g / 255;
      const Bs = b / 255;
      const [R, G, B] = [Rs, Gs, Bs].map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    } catch (e) {
      return 0.5;
    }
  };

  const baseForContrast = gradMid || primary || "#90b855";
  const backgroundStroke =
    luminance(baseForContrast) > 0.55
      ? "rgba(0,0,0,0.12)"
      : "rgba(255,255,255,0.12)";

  // visual lift: small upward translate and shadow to make the ring appear raised
  const isDark = bg === "#0f0f0f";
  const raiseOffset = Math.max(2, Math.round(size * 0.03));
  const shadowColor = isDark ? "#ffffff" : "#000000";
  // stronger light shadow on dark mode for iOS; Android will use a halo instead
  const shadowOpacity = Platform.OS === "ios" ? (isDark ? 0.14 : 0.18) : 0.18;
  const shadowRadius = Math.max(1, Math.round(size * 0.03));
  const elevation =
    Platform.OS === "android"
      ? Math.max(1, Math.round(size * 0.06))
      : Math.max(1, Math.round(size * 0.03));

  // interpolations
  const scale = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const glowOpacity = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.12],
  });

  // compute start position and end position directly from progress
  const startPos = polarToCartesian(cx, cy, radius, startAngle);
  const progressFraction = clampedProgress;
  const endAngle = startAngle + progressFraction * Math.PI * 2;
  const endPos = polarToCartesian(cx, cy, radius, endAngle);

  return (
    <AnimatedView
      style={[
        styles.container,
        {
          transform: [{ scale }, { translateY: -raiseOffset }],
          opacity: mountAnim,
          shadowColor,
          shadowOffset: {
            width: 0,
            height: Math.max(1, Math.round(raiseOffset / 2)),
          },
          shadowOpacity,
          shadowRadius,
          elevation,
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={gradStart} stopOpacity="1" />
            <Stop offset="55%" stopColor={gradMid} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradEnd} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundStroke}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* subtle separator ring to increase contrast against complicated backgrounds */}
        {showSeparator ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={Math.max(0, radius - Math.min(3, strokeWidth * 0.35))}
            stroke={backgroundStroke}
            strokeWidth={Math.max(1, Math.round(strokeWidth * 0.45))}
            strokeOpacity={0.6}
            fill="none"
          />
        ) : null}

        {/* Android dark-mode halo to simulate lift (Android shadow is dark and invisible on dark bg) */}
        {Platform.OS === "android" && isDark && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius + Math.min(4, Math.round(strokeWidth * 0.6))}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={Math.max(2, Math.round(strokeWidth * 0.6))}
            fill="none"
          />
        )}

        {/* subtle glow behind the active stroke (animated) */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.primaryGreen}
          strokeWidth={strokeWidth + 8}
          strokeOpacity={glowOpacity}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius + 2}
          stroke={theme.colors.primaryGreen}
          strokeWidth={strokeWidth + 14}
          strokeOpacity={glowOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.04],
          })}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* animated progress stroke using gradient */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={anim}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* optional start marker (static at top) */}
        {showMarker === "start" && (
          <Circle
            cx={startPos.x}
            cy={startPos.y}
            r={markerRadius}
            fill={`url(#${gradientId})`}
          />
        )}

        {/* end marker positioned at computed end point (matches progress) */}
        {showMarker === "end" || showMarker === "both" ? (
          <Circle
            cx={endPos.x}
            cy={endPos.y}
            r={markerRadius}
            fill={`url(#${gradientId})`}
          />
        ) : null}
      </Svg>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(CircularProgressRing);
