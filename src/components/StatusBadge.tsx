import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const theme = useTheme();

  // Countdown moved to Settings screen; StatusBadge remains a compact status pill
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const lower = (status || "").toLowerCase();

  const getGradient = () => {
    if (lower.includes("exceed")) return ["#F6C84C", "#F7B733", "#FF8C00"];
    if (lower.includes("reach")) return ["#4facfe", "#00f2fe"];
    // default: use theme greens
    return [theme.colors.primaryGreen, theme.colors.secondaryGreen];
  };

  const getIcon = () => {
    if (lower.includes("exceed")) return "warning";
    if (lower.includes("reach")) return "trophy";
    return "checkmark";
  };

  const gradientColors = getGradient();
  const iconName = getIcon();

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ],
          opacity: anim,
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <>
          <Ionicons
            name={iconName as any}
            size={16}
            color={theme.colors.primaryBackground}
            style={styles.icon}
          />
          <Text
            style={[styles.text, { color: theme.colors.primaryBackground }]}
          >
            {status}
          </Text>
        </>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 120,
  },
  icon: {
    marginRight: 8,
    opacity: 0.95,
  },
  text: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  smallTimer: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  smallAt: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    opacity: 0.95,
  },
});

export default StatusBadge;
