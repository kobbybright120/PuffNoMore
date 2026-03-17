import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import StarryBackground from "../components/StarryBackground";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface EducativeScreenProps {
  current?: number;
  total?: number;
  onNext?: () => void;
  onBack?: () => void;
}

export default function EducativeScreen2({
  current: _current = 0,
  total: _total = 10,
  onNext,
  onBack: _onBack,
}: EducativeScreenProps) {
  const chartData = {
    labels: ["Cold-\nturkey", "NRTs", "Meds", "Other\napps", "PuffNoMore"],
    data: [3, 7, 12, 8, 35],
  };

  const maxValue = Math.max(...chartData.data, 1);
  const chartInnerHeight = 220;

  const handleContinue = () => {
    if (onNext) onNext();
  };

  return (
    <StarryBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.failHeaderBlock}>
            <Text style={styles.failHeaderTitle}>
              Why do those methods often fail?
            </Text>
            <Text style={styles.failHeaderSubtitle}>
              Most methods push for instant quitting. But lasting change comes
              from gradual reduction, emotional support, and feeling in control.
            </Text>
          </View>

          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { textAlign: "left" }]}>
              Quitting Success Rates (%)
            </Text>

            <View style={[styles.chart, { height: chartInnerHeight + 40 }]}>
              {/* Increased height for labels */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  height: chartInnerHeight,
                }}
              >
                {chartData.data.map((val, i) => {
                  const isHighlight = i === chartData.data.length - 1;
                  const minBar = 36;
                  let barHeight = Math.max(
                    minBar,
                    Math.round((val / maxValue) * (chartInnerHeight - 16)),
                  );
                  const barWidth = 48;
                  // Decrease height for Cold-turkey bar
                  if (i === 0) {
                    barHeight = Math.round(barHeight * 0.6); // Reduce to 60% of original
                  }
                  return (
                    <View key={i} style={{ flex: 1, alignItems: "center" }}>
                      {/* Show '3 - 10X' label above Puff NoMore bar */}
                      {isHighlight && (
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: "bold",
                            marginBottom: 4,
                          }}
                        >
                          3 - 10X
                        </Text>
                      )}
                      <View
                        style={{
                          width: barWidth,
                          height: chartInnerHeight,
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        {isHighlight ? (
                          <LinearGradient
                            colors={["#63a96a", "#166534"]}
                            start={[0, 0]}
                            end={[0, 1]}
                            style={{
                              height: barHeight,
                              width: barWidth,
                              borderRadius: 4,
                              marginBottom: 8, // Shift up
                            }}
                          />
                        ) : (
                          <View
                            style={[
                              styles.bar,
                              {
                                height: barHeight,
                                width: barWidth,
                                backgroundColor: "#d1d5db",
                              },
                            ]}
                          />
                        )}
                      </View>
                      {/* X-axis label directly below bar */}
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 10,
                          marginTop: 4,
                          textAlign: "center",
                          maxWidth: 60,
                        }}
                      >
                        {String(chartData.labels[i]).replace(/\n/g, " ")}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.legend}>
                <Text
                  style={[
                    styles.legendText,
                    { textAlign: "left", marginLeft: 0 },
                  ]}
                >
                  Source: WHO reports and UCSF study
                </Text>
              </View>
            </View>
          </View>

          {/* Added informational text below the chart */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              PuffNoMore is clinically proven and 100% digital, built on gradual
              reduction, helping you cut down step by step until quitting feels
              natural.
            </Text>
          </View>
          {/* spacer so content isn't hidden behind fixed bottom button */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* fixed bottom tab with Continue CTA */}
        <View style={styles.bottomTab} pointerEvents="box-none">
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              { width: Math.min(420, width - 48) },
            ]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 140,
  },
  header: {
    marginBottom: 24,
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    lineHeight: 22,
  },
  chartContainer: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    // subtle frosted-glass look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 14,
    textAlign: "center",
  },
  chart: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
  },
  barContainer: {
    alignItems: "center",
    width: (width - 80 - 20) / 5,
  },
  barArea: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "80%",
    borderRadius: 4,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  barLabelInBar: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  barLabelInBarHighlight: {
    color: "#ffffff",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: "#63a96a",
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#b0b3b8",
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
  bottomTab: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    alignItems: "center",
  },
  infoContainer: {
    marginTop: 0,
    marginBottom: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "rgba(34,197,94,0.13)", // subtle green tint
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
});
