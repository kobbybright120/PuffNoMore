import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const { width } = Dimensions.get("window");

type Props = { onFinish?: () => void };

const CompleteScreen: React.FC<Props> = ({ onFinish }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>You're All Set</Text>
        <Text style={styles.subtitle}>Welcome — your plan is ready.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onFinish && onFinish()}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#071b12",
    padding: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    minWidth: Math.min(360, width - 48),
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginBottom: 18,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#63a96a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#09210f",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default CompleteScreen;
