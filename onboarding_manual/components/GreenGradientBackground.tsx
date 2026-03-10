import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { lightTheme, darkTheme } from "../../src/theme/theme";

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: "light" | "dark";
};

const GreenGradientBackground: React.FC<Props> = ({
  children,
  style,
  variant = "light",
}) => {
  const themeColors = variant === "dark" ? darkTheme.colors : lightTheme.colors;
  // Slightly deeper green: darker start, app primaryGreen as finish
  const colors = ["#14532d", themeColors.primaryGreen ?? "#90b855"] as const;

  return (
    <LinearGradient
      colors={colors}
      start={[0, 0]}
      end={[1, 1]}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
});

export default GreenGradientBackground;
