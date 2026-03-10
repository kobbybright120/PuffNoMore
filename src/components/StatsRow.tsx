import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface StatsRowProps {
  label: string;
  value: string;
}

const StatsRow: React.FC<StatsRowProps> = ({ label, value }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    label: {
      fontSize: theme.fonts.size.medium,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.regular,
    },
    value: {
      fontSize: theme.fonts.size.medium,
      fontWeight: theme.fonts.weight.bold,
      color: theme.colors.primaryGreen,
      fontFamily: theme.fonts.family.bold,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

export default StatsRow;
