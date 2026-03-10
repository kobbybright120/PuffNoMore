import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

interface SmallCircularProgressRingProps {
  progress: number; // 0..1
  size: number;
  strokeWidth: number;
  overrideColors?: string[];
  showMarker?: "start" | "end" | "both" | "none";
}

const SmallCircularProgressRing: React.FC<SmallCircularProgressRingProps> = ({
  progress,
  size,
  strokeWidth,
  overrideColors,
  showMarker = "none",
}) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.max(0, Math.min(1, progress));

  const primary = theme.colors.primaryGreen;
  const mid = overrideColors?.[1] ?? primary;
  const secondary = theme.colors.secondaryGreen;
  const gradStart = overrideColors?.[0] ?? primary;
  const gradMid = overrideColors?.[1] ?? mid;
  const gradEnd = overrideColors?.[2] ?? secondary;

  // Animated stroke offset for smooth updates
  const AnimatedCircle: any = Animated.createAnimatedComponent(Circle);
  const initialOffset = circumference - clamped * circumference;
  const anim = useRef(new Animated.Value(initialOffset)).current;

  useEffect(() => {
    const toValue =
      circumference - Math.max(0, Math.min(1, progress)) * circumference;
    Animated.timing(anim, {
      toValue,
      duration: 420,
      useNativeDriver: false,
    }).start();
  }, [progress, circumference, anim]);

  const dashoffset = anim; // animated value

  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -Math.PI / 2;
  const polarToCartesian = (
    cx2: number,
    cy2: number,
    r: number,
    angleRad: number
  ) => ({
    x: cx2 + r * Math.cos(angleRad),
    y: cy2 + r * Math.sin(angleRad),
  });
  const startPos = polarToCartesian(cx, cy, radius, startAngle);
  const endAngle = startAngle + clamped * Math.PI * 2;
  const endPos = polarToCartesian(cx, cy, radius, endAngle);

  const gradientId = `small-grad-${Math.round(size)}-${Math.round(
    strokeWidth
  )}`;

  return (
    <Svg width={size} height={size} style={styles.container}>
      <Defs>
        <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gradStart} stopOpacity="1" />
          <Stop offset="60%" stopColor={gradMid} stopOpacity="1" />
          <Stop offset="100%" stopColor={gradEnd} stopOpacity="1" />
        </SvgLinearGradient>
      </Defs>

      {/* background track */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={
          theme.colors.primaryBackground === "#ffffff" ? "#F0F0F0" : "#333333"
        }
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* progress */}
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference}`}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        fill="none"
      />

      {/* optional markers */}
      {showMarker === "start" || showMarker === "both" ? (
        <Circle
          cx={startPos.x}
          cy={startPos.y}
          r={Math.max(1, Math.round(strokeWidth * 0.6))}
          fill={gradStart}
        />
      ) : null}
      {showMarker === "end" || showMarker === "both" ? (
        <Circle
          cx={endPos.x}
          cy={endPos.y}
          r={Math.max(1, Math.round(strokeWidth * 0.6))}
          fill={gradEnd}
        />
      ) : null}
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});

export default React.memo(SmallCircularProgressRing);
