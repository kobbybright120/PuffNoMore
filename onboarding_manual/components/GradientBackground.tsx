import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  bgColor?: string;
};

const GradientBackground: React.FC<Props> = ({
  children,
  style,
  bgColor = "#04200f",
}) => {
  // Use provided bgColor or default green gradient
  const getColorsForBg = (color: string) => {
    if (color.startsWith("#")) {
      // Single color provided, return as solid (or slight variation)
      return [color, color] as const;
    }
    return ["#04200f", "#0f4f2d"] as const;
  };

  const colors = getColorsForBg(bgColor);

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

export default GradientBackground;
