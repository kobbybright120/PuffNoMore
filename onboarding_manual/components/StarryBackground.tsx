import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

const StarryBackground: React.FC<Props> = ({ children, style }) => {
  // Deep rich green gradient
  const colors = ["#0a2d1f", "#164a2e"] as const;

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

export default StarryBackground;
