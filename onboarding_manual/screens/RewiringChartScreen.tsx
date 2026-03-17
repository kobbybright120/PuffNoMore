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

import StarryBackground from "../components/StarryBackground";
import TwoLineGraph from "../../src/components/TwoLineGraph";

export default function RewiringChartScreen({ onContinue }: any) {
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header block styled like EducativeScreen1 */}
          <View style={styles.failHeaderBlock}>
            <Text style={styles.failHeaderTitle}>
              Freedom Comes Step by Step.
            </Text>
            <Text style={styles.failHeaderSubtitle}>
              PuffNoMore guides you to gently reduce smoking or vaping. As
              cravings fade gradually, you’ll feel calm, supported, and in
              control until you’re completely free.
            </Text>
          </View>

          {/* Chart-like block styled like EducativeScreen1 */}
          <View style={styles.chartContainer}>
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

          {/* Info block styled like EducativeScreen1 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              In clinical testing, over 80% of users reported reduced cravings
              and minimal withdrawal symptoms while tapering down with
              PuffNoMore.
            </Text>
          </View>
          {/* Spacer for bottom button */}
          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.footer} pointerEvents="box-none">
          <TouchableOpacity
            onPress={onContinue}
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              { width: Math.min(420, screenW - 48) },
            ]}
          >
            <Text style={styles.continueButtonText}>Start Your Journey</Text>
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

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  failHeaderBlock: {
    backgroundColor: "rgba(34,197,94,0.10)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  failHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22c55e",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  failHeaderSubtitle: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  chartContainer: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
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
  infoContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "rgba(34,197,94,0.13)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  infoText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 20,
  },
  continueButton: {
    backgroundColor: "#63a96a",
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
