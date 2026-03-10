import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // or 'react-native-linear-gradient'
import Svg, { Path } from "react-native-svg";
import { usePuff } from "../context/PuffContext";

const PlanCard: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const boxWidth = Math.max(280, Math.min(Math.floor(screenWidth * 0.85), 720));

  const { onboardingResponses } = usePuff();
  const userName =
    onboardingResponses &&
    (onboardingResponses.fullName || onboardingResponses.name);
  // derive plan length from baseline cigarettes per day entered during onboarding
  const rawBaseline =
    onboardingResponses?.cigarettesPerDay ??
    onboardingResponses?.cigarettesPerDay;
  const baseline = Number(rawBaseline) || 0;
  const totalWeeks = baseline >= 1 ? Math.max(1, Math.round(baseline)) : 8; // default to 8 weeks

  // start date: prefer explicit quitTargetDate or onboarding start; fallback to today
  const rawStart =
    onboardingResponses?.quitTargetDate || onboardingResponses?.startDate;
  const startDate = rawStart ? new Date(rawStart) : new Date();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const fmt = (d: Date) =>
    `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  const quitDate = new Date(
    startDate.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000
  );
  const quitLabel = fmt(quitDate);
  const reductionStreak = Number(onboardingResponses?.reductionStreakDays) || 0;
  const daysRemaining = (() => {
    const today = new Date();
    const diff = Math.ceil(
      (quitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? `${diff} days` : `Today`;
  })();

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

            {/* Streak Info */}
            <View style={styles.streakInfo}>
              <Text style={styles.streakLabel}>Reduction streak</Text>
              <Text style={styles.streakValue}>{reductionStreak} days</Text>
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>Name</Text>
              <Text style={styles.footerValue}>{userName}</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.footerLabel}>Quit Date</Text>
              <Text style={styles.footerValue}>{daysRemaining}</Text>
              <Text style={styles.footerSmall}>{quitLabel}</Text>
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
    fontSize: 12,
    marginBottom: 2,
  },
  footerValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "500",
  },
  footerSmall: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 4,
  },
  footerRight: {
    alignItems: "flex-end",
  },
});

export default PlanCard;
