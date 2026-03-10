import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface ActionRowProps {
  onLogPress: () => void;
}

const ActionRow: React.FC<ActionRowProps> = ({ onLogPress }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.primaryBackground,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.secondaryGreen,
    },
    leftContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.secondaryGreen,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.md,
    },
    text: {
      fontSize: theme.fonts.size.medium,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.regular,
    },
    button: {
      backgroundColor: theme.colors.primaryGreen,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.medium,
    },
    buttonText: {
      fontSize: theme.fonts.size.medium,
      fontWeight: theme.fonts.weight.bold,
      color: theme.colors.primaryBackground,
      fontFamily: theme.fonts.family.bold,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="add" size={24} color={theme.colors.primaryGreen} />
        </View>
        <Text style={styles.text}>Log New Puff</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onLogPress}>
        <Text style={styles.buttonText}>LOG</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActionRow;
