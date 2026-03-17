import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export const Button: React.FC<Props> = ({ label, onPress, style }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#63a96a",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default Button;
