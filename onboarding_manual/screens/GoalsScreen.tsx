import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StarryBackground from "../components/StarryBackground";

const OPTIONS = [
  "Save Money",
  "Boost Self‑Confidence",
  "Gain More Energy & Motivation",
  "Build Stronger Relationships",
  "Improve Self‑Control",
  "Reduce Stress & Anxiety",
  "Improve Focus & Productivity",
  "Reclaim Your Lifestyle",
  "Enhance Physical Health",
];

export default function GoalsScreen({ onBack, onNext }: any) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (opt: string) => {
    setSelected((s) =>
      s.includes(opt) ? s.filter((x) => x !== opt) : [...s, opt],
    );
  };

  return (
    <StarryBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Choose your goals</Text>
          <Text style={styles.subtext}>
            Pick the goals that will guide your step‑by‑step progress toward
            quitting
          </Text>

          <View style={styles.containerCard}>
            {OPTIONS.map((o) => {
              const isSelected = selected.includes(o);
              return (
                <TouchableOpacity
                  key={o}
                  activeOpacity={0.85}
                  onPress={() => toggle(o)}
                  style={[
                    styles.option,
                    isSelected
                      ? styles.optionSelected
                      : styles.optionUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSel,
                    ]}
                  >
                    {o}
                  </Text>
                  <View
                    style={[styles.checkWrap, !isSelected && { opacity: 0 }]}
                  >
                    <Ionicons name="checkmark" size={22} color="#fff" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 12 }} />
        </ScrollView>

        <View style={styles.footer}>
          <LinearGradient colors={["#90b855", "#63a96a"]} style={styles.cta}>
            <TouchableOpacity
              style={styles.ctaTouch}
              onPress={() => onNext(selected)}
            >
              <Text style={styles.ctaText}>Continue</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
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
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    fontFamily: "Inter",
    marginBottom: 8,
  },
  subtext: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    fontFamily: "Inter",
  },
  containerCard: {
    // removed background card so options sit directly on the screen
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    marginTop: 18,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 14,
    minHeight: 72,
  },
  optionUnselected: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  optionSelected: { backgroundColor: "rgba(144,184,85,0.95)" },
  optionText: { color: "#FFFFFF", fontSize: 17, fontFamily: "Inter", flex: 1 },
  optionTextSel: { color: "#072200", fontWeight: "800", fontSize: 17 },
  checkWrap: {
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { paddingHorizontal: 20, paddingBottom: 26, paddingTop: 8 },
  cta: { borderRadius: 30, overflow: "hidden" },
  ctaTouch: { paddingVertical: 16, alignItems: "center" },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
  },
});
