import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import StarryBackground from "../components/StarryBackground";
import TwoLineGraph from "../../src/components/TwoLineGraph";

export default function RewiringChartScreen({ onBack, onContinue }: any) {
  const cfg = {
    leftLabel: "Typical quit attempts",
    rightLabel: "PuffNoMore gradual reduction",
    leftColor: "#E53935",
    rightColor: "#90b855",
    animation: "health_steps",
  };

  const { width: screenW } = useWindowDimensions();
  // Use nearly full screen width for the chart (keep small horizontal margins)
  const graphWidth = Math.max(320, screenW - 32);
  const graphHeight = 320;

  return (
    <StarryBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rewiring Benefits</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.headerMain}>
            Quitting Overnight Feels Impossible. Reducing Gradually Works.
          </Text>

          {/* Subtext */}
          <Text style={styles.subtext}>
            PuffNoMore guides you step by step to gently reduce smoking or
            vaping. As cravings fade gradually, you’ll feel calm, supported, and
            in control until you’re completely free
          </Text>

          {/* Chart Section */}
          <View style={styles.card}>
            {/* Legend row */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendSwatch,
                    { backgroundColor: cfg.leftColor },
                  ]}
                />
                <Text style={styles.legendLabel}>{cfg.leftLabel}</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendSwatch,
                    { backgroundColor: cfg.rightColor },
                  ]}
                />
                <Text style={styles.legendLabel}>{cfg.rightLabel}</Text>
              </View>
            </View>

            <TwoLineGraph
              config={cfg}
              isOnboarding={true}
              width={graphWidth}
              height={graphHeight}
            />
          </View>

          {/* Trust Element */}
          {/* Trust Badge */}
          <View style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>
              In clinical testing, over 80% of users reported reduced cravings
              and minimal withdrawal symptoms while tapering down with
              PuffNoMore showing that gradual reduction builds lasting freedom.
            </Text>
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>

        <View style={styles.footer} pointerEvents="box-none">
          <TouchableOpacity
            onPress={onContinue}
            activeOpacity={0.9}
            style={{ width: "100%" }}
          >
            <LinearGradient colors={["#90b855", "#63a96a"]} style={styles.cta}>
              <Text style={styles.ctaText}>Start Your Journey</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    justifyContent: "center",
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
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 140,
  },
  headerMain: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    fontFamily: "Inter",
    marginBottom: 10,
    marginTop: 8,
    lineHeight: 26,
  },
  headerSub: {
    color: "#e6ffe6",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "left",
    fontFamily: "Inter",
  },
  subtext: {
    color: "#cfcfcf",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "left",
    fontFamily: "Inter",
    marginBottom: 16,
    lineHeight: 24,
  },
  chartTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Inter",
    marginBottom: 8,
  },
  trustElement: {
    color: "#fff",
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
    fontFamily: "Inter",
    marginTop: 18,
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: "400",
  },
  card: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    // subtle elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendSwatch: { width: 12, height: 12, borderRadius: 3, marginRight: 8 },
  legendLabel: { color: "#fff", fontSize: 13, fontFamily: "Inter" },
  benefitsRow: { marginBottom: 8 },
  benefitItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  benefitText: {
    color: "#e6ffe6",
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Inter",
  },
  caption: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 12,
    fontFamily: "Inter",
  },
  trustBadge: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(144,184,85,0.09)",
    borderWidth: 1,
    borderColor: "rgba(144,184,85,0.18)",
    flexDirection: "row",
    alignItems: "center",
  },
  trustBadgeText: { color: "#eafbe8", fontSize: 16, lineHeight: 22, flex: 1 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 20,
  },
  cta: {
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaTouch: { alignItems: "center" },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
  },
});
