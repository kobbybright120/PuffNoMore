import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StarryBackground from "../components/StarryBackground";
import PlanCard from "../../src/components/PlanCard";

export default function PreferredSupportScreen({ onBack, onNext }: any) {
  return (
    <StarryBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
      

          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.titleLarge}>
            {" "}
            Now it's time to invest in yourself
          </Text>
       
        </View>
        <View style={styles.planCardContainer}>
          <PlanCard />
        </View>
        <View style={styles.footer}>
          <LinearGradient colors={["#90b855", "#63a96a"]} style={styles.cta}>
            <Text style={styles.ctaText} onPress={onNext}>
              Continue
            </Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </StarryBackground>
  );
}
const styles = StyleSheet.create({
  titleWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  titleLarge: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    fontFamily: "Inter",
  },
  subtextCenter: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Inter",
    marginTop: 8,
    marginBottom: 8,
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  planCardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  footer: {
    padding: 16,
  },
  cta: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 12,
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 14,
  },
});
// ...existing code...
