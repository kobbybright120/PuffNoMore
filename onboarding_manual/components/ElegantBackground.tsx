import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const ElegantBackground: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <View style={styles.container}>
    <LinearGradient
      colors={["#2b5b3d", "#0e2a1f", "#041712"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
});

export default ElegantBackground;
