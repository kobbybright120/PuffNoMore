import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { usePuff } from "../context/PuffContext";
import AppHeader from "../components/AppHeader";
import WeeklyProgressRow from "../components/WeeklyProgressRow";
import GreetingSection from "../components/GreetingSection";
import ProgressCard from "../components/ProgressCard";
import NextWeekCard from "../components/NextWeekCard";
// Countdown handled inside StatusBadge

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const { puffsUsed, totalPuffs, onboardingResponses } = usePuff();
  const getGreeting = (date = new Date()) => {
    const h = date.getHours();
    if (h >= 5 && h < 12) return "Good Morning";
    if (h >= 12 && h < 17) return "Good Afternoon";
    if (h >= 17 && h < 22) return "Good Evening";
    return "Good Night";
  };

  const [greeting, setGreeting] = useState(() => getGreeting());
  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  const activeDayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // theme-aware card styles for the combined container
  const isDark =
    (theme.colors.primaryBackground || "").toLowerCase() === "#0f0f0f";
  const isLight = !isDark;
  // slightly brighter dark-card background and stronger border/shadow
  const cardBackground = isLight ? theme.colors.primaryBackground : "#0f1a1d";
  const cardBorderColor = isLight
    ? theme.colors.primaryGreen + "10"
    : "rgba(255,255,255,0.12)";
  const cardShadow = isLight
    ? theme.shadows.medium
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.36,
        shadowRadius: 12,
        elevation: 8,
      };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primaryBackground,
    },
    scrollContainer: {
      paddingBottom: theme.spacing.xl,
    },
    combinedContainer: {
      backgroundColor: cardBackground,
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.md,
      borderWidth: isLight ? 0 : 1,
      borderColor: cardBorderColor,
      ...cardShadow,
    },
  });
  return (
    <View style={styles.container}>
      <AppHeader title="PuffNoMore" titleColor={theme.colors.primaryGreen} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <WeeklyProgressRow activeDayIndex={activeDayIndex} />
        {/* compute a short info line based on progress to inform (not motivate) the user */}
        {(() => {
          const getSupportiveMessage = (used?: number, total?: number) => {
            if (
              typeof used !== "number" ||
              typeof total !== "number" ||
              total <= 0
            )
              return undefined;

            if (used === 0)
              return "Nice start, no smokes recorded today. Keep going.";

            const lowThreshold = Math.max(1, Math.floor(total * 0.6));
            if (used < lowThreshold)
              return "You're doing well, comfortably under your target.";

            if (used < total)
              return "You're on track today. Nice work, keep being mindful.";

            if (used === total)
              return "You've reached today's target, great job sticking to your plan.";

            // went over
            const overBy = used - total;
            if (overBy <= 2)
              return "You went a bit over today, that's okay. Take a breath and try a short pause.";

            return "You've had more than planned today. Small steps matter, consider a short walk or a calming activity.";
          };

          const info = getSupportiveMessage(puffsUsed, totalPuffs);

          // compute next week's goal by reducing daily target by 1 (min 0)
          const nextWeekGoal =
            typeof totalPuffs === "number" && totalPuffs > 0
              ? Math.max(0, totalPuffs - 1)
              : undefined;

          const nameProvided =
            onboardingResponses && onboardingResponses.fullName;

          return (
            <View style={styles.combinedContainer}>
              {nameProvided ? (
                <GreetingSection
                  greeting={greeting}
                  name={String(onboardingResponses.fullName)}
                  info={info}
                />
              ) : null}

              {/* countdown moved into the StatusBadge inside ProgressCard */}

              <View style={{ marginTop: theme.spacing.sm }}>
                <ProgressCard used={puffsUsed} total={totalPuffs} />
                {typeof nextWeekGoal === "number" ? (
                  <View style={{ marginTop: theme.spacing.sm }}>
                    <NextWeekCard
                      nextGoal={nextWeekGoal}
                      reduction={1}
                      currentGoal={totalPuffs}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          );
        })()}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
