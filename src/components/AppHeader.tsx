import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  titleSize?: number;
  transparent?: boolean;
  titleColor?: string;
  onAlert?: () => void;
  animateLetters?: boolean;
  animationDelay?: number; // ms per character
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onBack,
  onAlert,
  titleSize,
  transparent,
  titleColor,
  animateLetters,
  animationDelay = 50,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.lg,
      alignItems: "center",
      backgroundColor: transparent
        ? "transparent"
        : theme.colors.primaryBackground,
      zIndex: 10,
      position: "relative",
      justifyContent: "center",
    },
    title: {
      fontWeight: theme.fonts.weight.bold,
      color: titleColor
        ? titleColor
        : transparent
          ? theme.colors.text
          : theme.colors.primaryGreen,
      fontFamily: theme.fonts.family.bold,
    },
    back: {
      color: theme.colors.primaryGreen,
      fontSize: theme.fonts.size.xlarge,
      lineHeight: theme.fonts.size.xlarge,
    },
    backTouch: {
      position: "absolute",
      left: theme.spacing.md,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    alertTouch: {
      position: "absolute",
      right: theme.spacing.md,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    gradientCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
  });

  const [displayedTitle, setDisplayedTitle] = useState(title);

  useEffect(() => {
    if (!animateLetters) {
      setDisplayedTitle(title);
      return;
    }

    let mounted = true;
    setDisplayedTitle("");
    let idx = 0;
    let timer: any = null;

    const step = () => {
      if (!mounted) return;
      idx += 1;
      setDisplayedTitle(title.slice(0, idx));
      if (idx < title.length) {
        timer = setTimeout(step, animationDelay);
      }
    };

    timer = setTimeout(step, animationDelay);
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [title, animateLetters, animationDelay]);

  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={styles.backTouch}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[theme.colors.primaryGreen, theme.colors.secondaryGreen]}
            style={styles.gradientCircle}
          >
            <Ionicons
              name="chevron-back"
              size={theme.fonts.size.xlarge}
              color={theme.colors.primaryBackground}
            />
          </LinearGradient>
        </Pressable>
      ) : null}
      {onAlert ? (
        <Pressable
          onPress={onAlert}
          style={styles.alertTouch}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[theme.colors.primaryGreen, theme.colors.secondaryGreen]}
            style={styles.gradientCircle}
          >
            <Ionicons
              name="alert-circle-outline"
              size={theme.fonts.size.xlarge}
              color={theme.colors.primaryBackground}
            />
          </LinearGradient>
        </Pressable>
      ) : null}
      <Text
        style={[
          styles.title,
          { fontSize: titleSize ?? theme.fonts.size.xlarge },
        ]}
      >
        {displayedTitle}
      </Text>
    </View>
  );
};

export default AppHeader;
