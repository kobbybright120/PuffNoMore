import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface GreetingSectionProps {
  greeting: string;
  name: string;
  info?: string;
}

const GreetingSection: React.FC<GreetingSectionProps> = ({
  greeting,
  name,
  info,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.md,
    },
    greeting: {
      fontSize: theme.fonts.size.large,
      fontWeight: theme.fonts.weight.normal,
      color: theme.colors.text,
      fontFamily: theme.fonts.family.regular,
    },
    info: {
      marginTop: theme.spacing.xs,
      fontSize: theme.fonts.size.medium,
      color: theme.colors.textSecondary,
      fontFamily: theme.fonts.family.regular,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {greeting}, {name}
      </Text>
      {info ? <Text style={styles.info}>{info}</Text> : null}
    </View>
  );
};

export default GreetingSection;
