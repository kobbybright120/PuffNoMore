import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient"; // or 'react-native-linear-gradient'
import Svg, { Path } from "react-native-svg";
import { usePuff } from "../context/PuffContext";

const PlanCard: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const boxWidth = Math.max(280, Math.min(Math.floor(screenWidth * 0.85), 720));

  const { onboardingResponses, totalPuffs } = usePuff();
  const userName =
    onboardingResponses &&
    (onboardingResponses.fullName || onboardingResponses.name);
  // (removed unused baseline/startDate computations)

  // Always show the live current local date (user requested).
  const formattedReductionStart = React.useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
    });
  }, []);

  // Daily reduction values: startingCigs is baseline entered during onboarding;
  // currentCigs can be provided by onboardingResponses.currentCigs, else derive
  // a simple fallback that reduces by 1 cigarette per 2-week reduction cycle.
  const onboardBaselineRaw = onboardingResponses?.cigarettesPerDay;
  const providedCurrent = onboardingResponses?.currentCigs;

  // Displayed starting value: prefer onboarding baseline, else fall back to
  // `totalPuffs` from context so the UI reflects an existing app target.
  const startingCigs =
    typeof onboardBaselineRaw === "number" && !isNaN(onboardBaselineRaw)
      ? onboardBaselineRaw
      : typeof totalPuffs === "number"
        ? totalPuffs
        : 0;

  // derive current cigarettes for display: priority:
  // 1. explicit `onboardingResponses.currentCigs`
  // 2. onboarding baseline - 2 (rounded, min 0)
  // 3. fallback to `totalPuffs`
  const derivedFromBaseline = Math.max(0, Math.round(startingCigs - 2));
  const currentCigs =
    typeof providedCurrent === "number" && !isNaN(providedCurrent)
      ? providedCurrent
      : typeof onboardBaselineRaw === "number" && !isNaN(onboardBaselineRaw)
        ? derivedFromBaseline
        : typeof totalPuffs === "number"
          ? totalPuffs
          : 0;

  // animate number changes (subtle fade-in on update)
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [startingCigs, currentCigs]);

  return (
    <View style={styles.container}>
      {/* Heading removed per request */}

      {/* Card */}
      <View style={[styles.cardWrapper, { width: boxWidth }]}>
        <LinearGradient
          colors={["#4a8a5a", "#63a96a", "#90b855"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Glassmorphic overlay */}
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.2)",
              "rgba(255,255,255,0)",
              "rgba(0,0,0,0.2)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glassOverlay}
          />

          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerTop}>
              {/* Logo */}
              <View style={styles.logo}>
                <Text style={styles.logoText}>PNM</Text>
              </View>

              {/* Icon */}
              <View style={styles.iconContainer}>
                <Svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                >
                  <Path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>

            {/* Daily Reduction Progress (replaces Reduction Streak) */}
            <View style={styles.reductionProgress}>
              <Text style={styles.reductionTitle}>Weekly Reduction Plan</Text>
              <Animated.View style={[styles.reductionRow, { opacity: anim }]}>
                <Text style={styles.reductionNumbers}>
                  <Text style={styles.reductionArrow}>↓</Text>
                  <Text style={styles.reductionNumber}>{startingCigs}</Text>
                  <Text style={styles.reductionArrow}>→</Text>
                  <Text style={styles.reductionNumber}>{currentCigs}</Text>
                </Text>
                <Text style={styles.reductionUnit}>cigarettes/day</Text>
              </Animated.View>
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>Name</Text>
              <Text style={styles.footerValue}>{userName}</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.footerLabel}>Date Started</Text>
              <Text style={styles.footerValue}>
                {formattedReductionStart || "—"}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Don't use full height here to avoid pushing content off-screen on mobile
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  heading: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 64,
    maxWidth: 300,
  },
  cardWrapper: {
    width: "100%",

    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginVertical: 8,
    maxWidth: 520,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    width: "100%",
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardHeader: {
    padding: 18,
    paddingBottom: 48,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  logo: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  streakInfo: {
    marginTop: 8,
  },
  streakLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 4,
  },
  streakValue: {
    color: "#ffffff",
    fontSize: 48,
    fontWeight: "bold",
  },
  reductionProgress: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  reductionTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginBottom: 6,
  },
  reductionRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  reductionNumbers: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
  },
  reductionNumber: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
  },
  reductionArrow: {
    color: "#ffffff",
    fontSize: 24,
    marginHorizontal: 6,
  },
  reductionUnit: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginLeft: 6,
  },

  streakSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 6,
  },
  cardFooter: {
    backgroundColor: "rgba(17, 24, 39, 0.8)",
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },
  footerValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  footerRight: {
    alignItems: "flex-end",
  },
});

export default PlanCard;
