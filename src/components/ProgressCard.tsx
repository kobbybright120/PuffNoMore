import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import CircularProgressRing from "./CircularProgressRing";
import StatusBadge from "./StatusBadge";

interface ProgressCardProps {
  used: number;
  total: number;
  status?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ used, total, status }) => {
  const theme = useTheme();
  const progress = used / total;
  const remaining = Math.max(0, total - used);
  const isOver =
    typeof used === "number" && typeof total === "number"
      ? used > total
      : false;

  // derive a sensible status label when none is provided
  const statusToShow =
    status !== undefined
      ? status
      : typeof used === "number" && typeof total === "number"
      ? used <= total
        ? "On Track"
        : "Exceeded"
      : "On Track";

  // responsive ring size based on screen width to allow further increases
  const screenWidth = theme.dimensions.screenWidth || 360;
  // slightly reduced size for a more balanced look
  const ringSize = Math.min(220, Math.max(130, Math.floor(screenWidth * 0.42)));
  const ringStroke = Math.max(9, Math.round(ringSize * 0.082));

  const styles = StyleSheet.create({
    container: {
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      marginHorizontal: 0,
      ...theme.shadows.medium,
      alignItems: "center",
    },
    content: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    ringContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
    },

    textContainer: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    topLabel: {
      fontSize: theme.fonts.size.xlarge,
      color: theme.colors.primaryBackground,
      fontFamily: theme.fonts.family.bold,
      textAlign: "center",
      marginBottom: theme.spacing.md,
      letterSpacing: 0.4,
    },
    statusContainer: {
      width: "100%",
      alignItems: "center",
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    progressText: {
      fontSize: Math.round(ringSize * 0.24),
      fontWeight: theme.fonts.weight.bold,
      color: theme.colors.primaryBackground,
      fontFamily: theme.fonts.family.bold,
    },
    remainingText: {
      fontSize: Math.round(ringSize * 0.1),
      color: theme.colors.primaryBackground,
      fontFamily: theme.fonts.family.regular,
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <LinearGradient
      colors={[theme.colors.primaryGreen, theme.colors.secondaryGreen]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.topLabel}>Today's Target</Text>
        <View style={styles.ringContainer}>
          {/* show warning gradient only when exceeded, otherwise use default green */}
          <CircularProgressRing
            progress={progress}
            size={ringSize}
            strokeWidth={ringStroke}
            overrideColors={
              isOver ? ["#F6C84C", "#F7B733", "#FF8C00"] : undefined
            }
            showSeparator={false}
            showMarker="end"
          />
          <View style={styles.textContainer}>
            <Text style={styles.progressText}>
              {used}/{total}
            </Text>
            <Text style={styles.remainingText}>{remaining} remaining</Text>
          </View>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <StatusBadge status={statusToShow} />
      </View>
    </LinearGradient>
  );
};

export default ProgressCard;
