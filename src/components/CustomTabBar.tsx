import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { usePuff } from "../context/PuffContext";
import * as SafeHaptics from "../utils/haptics";

const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const { attemptLogSmoke } = usePuff();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.colors.primaryBackground,
      paddingBottom: 5,
      paddingTop: 5,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: theme.colors.secondaryGreen,
      marginHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    logButton: {
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 10,
      backgroundColor: theme.colors.primaryGreen,
      borderRadius: 25,
      width: 50,
      height: 50,
      elevation: 5, // for Android shadow
      shadowColor: "#000", // for iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    label: {
      fontSize: 10,
      fontFamily: theme.fonts.family.regular,
      marginTop: 2,
    },
  });

  const tabs: React.JSX.Element[] = [];

  state.routes.forEach((route: any, index: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;

    const onPress = async () => {
      try {
        await SafeHaptics.impactAsync(SafeHaptics.ImpactFeedbackStyle.Light);
      } catch {}
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    let iconName: keyof typeof Ionicons.glyphMap = "home";

    if (route.name === "Home") {
      iconName = isFocused ? "home" : "home-outline";
    } else if (route.name === "Stats") {
      iconName = isFocused ? "stats-chart" : "stats-chart-outline";
    } else if (route.name === "Support") {
      iconName = isFocused ? "heart" : "heart-outline";
    } else if (route.name === "Settings") {
      iconName = isFocused ? "settings" : "settings-outline";
    }

    tabs.push(
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tab}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={isFocused ? theme.colors.primaryGreen : "gray"}
        />
        <Text
          style={[
            styles.label,
            { color: isFocused ? theme.colors.primaryGreen : "gray" },
          ]}
        >
          {route.name}
        </Text>
      </TouchableOpacity>
    );

    if (index === 1) {
      // After Stats tab: special logger button with distinct haptic
      const onLogPress = async () => {
        try {
          await SafeHaptics.impactAsync(SafeHaptics.ImpactFeedbackStyle.Heavy);
        } catch {}
        attemptLogSmoke();
      };

      tabs.push(
        <TouchableOpacity
          key="log"
          style={styles.logButton}
          onPress={onLogPress}
        >
          <Ionicons
            name="add"
            size={40}
            color={theme.colors.primaryBackground}
          />
        </TouchableOpacity>
      );
    }
  });

  return (
    <View style={{ backgroundColor: theme.colors.primaryBackground }}>
      <View style={styles.container}>{tabs}</View>
    </View>
  );
};

export default CustomTabBar;
