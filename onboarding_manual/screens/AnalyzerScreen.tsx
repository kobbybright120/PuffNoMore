import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import {
  useFonts,
  Inter_200ExtraLight,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import DecorativeGreenBackground from "../../src/components/DecorativeGreenBackground";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  LinearGradient as SvgLinearGradient,
  Circle,
} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);
/* header styles removed */
interface AnalyzerProps {
  onComplete?: () => void;
  isActive?: boolean;
}

const AnalyzerScreen: React.FC<AnalyzerProps> = ({ onComplete, isActive }) => {
  const [fontsLoaded] = useFonts({
    Inter_200ExtraLight,
    Inter_400Regular,
    Inter_700Bold,
  });
  const steps = useRef([
    "Building insight...",
    "Analyzing patterns...",
    "Processing data...",
    "Tracking progress...",
    "Finishing...",
  ]).current;

  const [currentStep, setCurrentStep] = useState(steps[0]);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [animationFinished, setAnimationFinished] = useState(false);

  const animatedProgress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isActive) return;

    // Animate progress from 0 -> 100 over ~9s (slower)
    const animation = Animated.timing(animatedProgress, {
      toValue: 100,
      duration: 9000,
      useNativeDriver: Platform.OS !== "web",
    });
    animation.start(({ finished }) => {
      if (finished) {
        setAnimationFinished(true);
        // Auto-advance smoothly when the animation completes
        try {
          if (typeof onComplete === "function") {
            // slight delay to allow final frame to settle visually
            setTimeout(() => {
              try {
                onComplete();
              } catch {}
            }, 160);
          }
        } catch {}
      }
    });

    // Listen for progress changes to update displayed number and status text
    const id = animatedProgress.addListener(({ value }) => {
      const rounded = Math.round(value);
      setDisplayProgress(rounded);
      const idx = Math.min(
        steps.length - 1,
        Math.floor((value / 100) * steps.length),
      );
      setCurrentStep(steps[idx]);
    });

    return () => {
      animation.stop();
      animatedProgress.removeListener(id);
    };
    // only start/stop when isActive toggles
  }, [isActive]);

  // Generate particles once
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        key: i,
        size: Math.random() * 3 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.2,
      })),
    [],
  );

  if (!fontsLoaded) return null;

  const radius = 86;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.container}>
      <DecorativeGreenBackground pointerEvents="none" />

      {/* header removed */}

      {/* Particles */}
      {particles.map((p) => (
        <View
          key={p.key}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              top: `${p.top}%`,
              left: `${p.left}%`,
              opacity: p.opacity,
            },
          ]}
        />
      ))}

      <View style={styles.content}>
        <View style={styles.ringContainer}>
          <Svg width={360} height={360} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="ringBg" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
                <Stop offset="60%" stopColor="#000000" stopOpacity="0.06" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>

              <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#63a96a" stopOpacity="1" />
                <Stop offset="100%" stopColor="#90b855" stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>

            {/* Soft radial backdrop to lift the ring off the background */}
            <Circle
              cx="100"
              cy="100"
              r={radius + strokeWidth * 0.7}
              fill="url(#ringBg)"
            />

            {/* Background ring */}
            <Circle
              cx="100"
              cy="100"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Animated progress ring */}
            <AnimatedCircle
              cx="100"
              cy="100"
              r={radius}
              stroke="url(#grad)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 100 100)"
            />
          </Svg>
          <View style={styles.centerContent} pointerEvents="none">
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{displayProgress}</Text>
              <Text style={styles.percentText}>%</Text>
            </View>
          </View>
        </View>

        <Text style={styles.calculatingText}>Calculating</Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{currentStep}</Text>
        </View>

        {/* Continue button removed — screen auto-advances when animation completes */}

        {/* pulsing dots removed */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  particle: {
    position: "absolute",
    borderRadius: 8,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  ringContainer: {
    width: 360,
    height: 360,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  centerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  progressText: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: "white",
  },
  percentText: {
    fontSize: 56,
    color: "rgba(255, 255, 255, 0.85)",
    fontFamily: "Inter_700Bold",
    marginLeft: 8,
  },
  statusContainer: {
    alignItems: "center",
    maxWidth: 320,
    marginBottom: 28,
  },
  calculatingText: {
    color: "white",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginTop: 6,
    marginBottom: 6,
    zIndex: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "300",
    color: "white",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 6,
  },
  manualContinueWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  manualContinueButton: {
    backgroundColor: "#63a96a",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  manualContinueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AnalyzerScreen;
