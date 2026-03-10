import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import SmallCircularProgressRing from "./SmallCircularProgressRing";
import { usePuff } from "../context/PuffContext";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// values are provided by context (weeklyCounts) and daily target comes from context

interface WeeklyProgressRowProps {
  activeDayIndex: number; // 0-6
}

const WeeklyProgressRow: React.FC<WeeklyProgressRowProps> = ({
  activeDayIndex,
}) => {
  const theme = useTheme();
  const { weeklyCounts, totalPuffs } = usePuff();

  // compute responsive sizes so all 7 items fit inside the container
  const screenWidth = theme.dimensions.screenWidth;
  const containerHorizontalMargin = theme.spacing.md; // matches marginHorizontal
  const containerPadding = theme.spacing.md; // matches paddingHorizontal
  const totalSideSpace = containerHorizontalMargin * 2 + containerPadding * 2; // left+right margins + paddings
  const availableWidth = Math.max(200, screenWidth - totalSideSpace);

  // allocate width per day (allow some internal spacing)
  const perDayAvailable = availableWidth / 7;
  // increase scale so circles are larger and more legible on most screens
  // slightly increase the circle size for better legibility without
  // growing the stroke thickness proportionally
  const circleSize = Math.min(
    78,
    Math.max(36, Math.floor(perDayAvailable * 0.82))
  );
  // use a reduced multiplier so thickness stays visually similar
  const strokeWidth = Math.max(3, Math.round(circleSize * 0.075));
  const isDark =
    (theme.colors.primaryBackground || "").toLowerCase() === "#0f0f0f";
  const isLight = !isDark;
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
      flexDirection: "column",
      justifyContent: "flex-start",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.large,
      backgroundColor: cardBackground,
      borderWidth: isLight ? 0 : 1,
      borderColor: cardBorderColor,
      ...cardShadow,
    },
    title: {
      fontSize: theme.fonts.size.medium,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.regular,
      fontWeight: theme.fonts.weight.normal,
      marginBottom: theme.spacing.sm,
      alignSelf: "flex-start",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dayContainer: {
      alignItems: "center",
      position: "relative",
      paddingHorizontal: theme.spacing.xs,
    },
    circleContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      width: circleSize,
      height: circleSize,
    },
    valueText: {
      position: "absolute",
      fontSize: Math.max(10, Math.round(circleSize * 0.32)),
      color: theme.colors.text,
      fontFamily: theme.fonts.family.bold,
    },
    dayText: {
      fontSize: theme.fonts.size.small,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.regular,
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Week Progress</Text>
      <View style={styles.row}>
        {days.map((day, index) => {
          const value =
            weeklyCounts && weeklyCounts[index] ? weeklyCounts[index] : 0;
          const progress = totalPuffs > 0 ? Math.min(1, value / totalPuffs) : 0;
          const isOver = totalPuffs > 0 ? value > totalPuffs : false;
          const warningColors = ["#F6C84C", "#F7B733", "#FF8C00"];

          return (
            <View
              key={day}
              style={[
                styles.dayContainer,
                { width: Math.floor(perDayAvailable) },
              ]}
            >
              <View style={styles.circleContainer}>
                <SmallCircularProgressRing
                  progress={progress}
                  size={circleSize}
                  strokeWidth={strokeWidth}
                  overrideColors={isOver ? warningColors : undefined}
                />
                <Text style={styles.valueText}>{value}</Text>
              </View>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default WeeklyProgressRow;
