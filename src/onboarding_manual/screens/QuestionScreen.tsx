import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const QuestionScreen: React.FC<{ question?: string; onNext: () => void }> = ({
  question = "Do you want to continue?",
  onNext,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{question}</Text>
      <View style={{ height: 20 }} />
      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Yes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});

export default QuestionScreen;
