import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const CompleteScreen: React.FC = () => {
  const nav = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're all set</Text>
      <Text style={styles.text}>Thanks — enjoy PuffNoMore.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          try {
            nav.reset({ index: 0, routes: [{ name: "RootTabs" }] });
          } catch {
            try {
              nav.navigate("RootTabs");
            } catch {}
          }
        }}
      >
        <Text style={styles.buttonText}>Go to app</Text>
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

export default CompleteScreen;
