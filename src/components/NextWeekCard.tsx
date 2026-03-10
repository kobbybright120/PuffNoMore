import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface NextWeekCardProps {
  nextGoal: number;
  reduction?: number;
  currentGoal?: number;
}

const NextWeekCard: React.FC<NextWeekCardProps> = ({
  nextGoal,
  reduction = 1,
  currentGoal,
}) => {
  const theme = useTheme();
  const mount = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(mount, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [mount]);

  const previous =
    typeof currentGoal === "number"
      ? Math.max(0, currentGoal)
      : Math.max(0, nextGoal + reduction);
  const reduced = Math.max(0, previous - nextGoal);
  const fillPercent = previous > 0 ? Math.min(1, nextGoal / previous) : 0;

  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: fillPercent,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [fillPercent]);

  const percentReduced =
    previous > 0 ? Math.round((reduced / previous) * 100) : 0;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.primaryBackground,
          shadowColor: theme.colors.secondaryGreen,
          transform: [
            {
              scale: mount.interpolate({
                inputRange: [0, 1],
                outputRange: [0.99, 1],
              }),
            },
          ],
          opacity: mount,
        },
      ]}
    >
      <View
        style={[styles.accent, { backgroundColor: theme.colors.primaryGreen }]}
      />

      <View style={styles.content}>
        <Text style={[styles.header, { color: theme.colors.textSecondary }]}>
          Next Week Goal
        </Text>

        <View style={styles.row}>
          <View style={styles.valueCol}>
            <Text
              style={[styles.smallLabel, { color: theme.colors.textSecondary }]}
            >
              This Week
            </Text>
            <Text style={[styles.bigNumber, { color: theme.colors.text }]}>
              {previous}
            </Text>
          </View>

          <View style={[styles.deltaCol, { alignItems: "center" }]}>
            <Text
              style={[
                styles.deltaText,
                {
                  color: theme.colors.primaryGreen,
                  fontFamily: theme.fonts.family.bold,
                },
              ]}
            >
              {reduced > 0 ? `Reduce by ${reduced}` : "No change"}
            </Text>
            <Text
              style={[
                styles.deltaPercent,
                { color: theme.colors.textSecondary },
              ]}
            >
              {previous > 0
                ? `From ${previous} to ${nextGoal} ${percentReduced > 0 ? `(${percentReduced}% reduced)` : ""}`
                : ""}
            </Text>
          </View>

          <View style={styles.valueCol}>
            <Text
              style={[styles.smallLabel, { color: theme.colors.textSecondary }]}
            >
              Next Week
            </Text>
            <Text style={[styles.bigNumber, { color: theme.colors.text }]}>
              {nextGoal}
            </Text>
          </View>
        </View>

        <View style={styles.barWrap}>
          <View
            style={[
              styles.barTrack,
              { backgroundColor: theme.colors.textSecondary + "22" },
            ]}
          />
          <Animated.View
            style={[
              styles.barFill,
              {
                backgroundColor: theme.colors.primaryGreen,
                width: fillAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          {`Target: reduce by ${reduction} puff${reduction === 1 ? "" : "s"} this week`}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  accent: {
    width: 6,
    height: "100%",
    borderRadius: 6,
    marginRight: 12,
  },
  content: { flex: 1 },
  header: { fontSize: 12, marginBottom: 8, fontFamily: "Inter_600SemiBold" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueCol: { alignItems: "flex-start" },
  smallLabel: { fontSize: 12, marginBottom: 4, fontFamily: "Inter_500Medium" },
  bigNumber: { fontSize: 22, fontFamily: "Inter_700Bold" },
  deltaCol: { alignItems: "center", paddingHorizontal: 8 },
  deltaText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  deltaPercent: { fontSize: 12, marginTop: 4, fontFamily: "Inter_500Medium" },
  barWrap: {
    marginTop: 12,
    height: 10,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  barTrack: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  barFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  hint: { marginTop: 10, fontSize: 12, fontFamily: "Inter_500Medium" },
});

export default NextWeekCard;
