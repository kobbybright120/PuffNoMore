import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const WelcomeScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PuffNoMore</Text>
      <Text style={styles.text}>This is a lightweight onboarding flow.</Text>
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Get started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  text: { fontSize: 16, color: "#444", marginBottom: 20, textAlign: "center" },
  button: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});

export default WelcomeScreen;
