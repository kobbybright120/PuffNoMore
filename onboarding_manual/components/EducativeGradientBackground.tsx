import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: "soft" | "green";
};

const EducativeGradientBackground: React.FC<Props> = ({
  children,
  style,
  variant = "soft",
}) => {
  const colors =
    variant === "green"
      ? (["#0f3324", "#166534", "#63a96a"] as const)
      : (["#071426", "#0b3b3f", "#1f7a6b"] as const);

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

export default EducativeGradientBackground;
