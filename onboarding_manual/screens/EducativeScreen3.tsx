import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import StarryBackground from "../components/StarryBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

type Props = {
  onNext?: () => void;
  onBack?: () => void;
};

export default function EducativeScreen3({ onNext }: Props) {
  const painPoints = [
    {
      icon: "calendar-remove",
      beforeText: "No plan to ",
      highlightText: "cut down gradually",
      afterText: ".",
    },
    {
      icon: "emoticon-cry-outline",
      beforeText: "Cravings ",
      highlightText: "feel too strong",
      afterText: " without guidance.",
    },
    {
      icon: "battery-alert",
      beforeText: "",
      highlightText: "Willpower alone",
      afterText: " doesn't last.",
    },
    {
      icon: "history",
      beforeText: "Old habits keep ",
      highlightText: "pulling you back",
      afterText: ".",
    },
    {
      icon: "alert-circle",
      beforeText: "One stressful moment can ",
      highlightText: "restart smoking",
      afterText: ".",
    },
    {
      icon: "calendar-check",
      beforeText: "No daily routine to ",
      highlightText: "stay on track",
      afterText: ".",
    },
    {
      icon: "flash-alert",
      beforeText: "Life’s triggers keep tempting you to ",
      highlightText: "light up",
      afterText: ".",
    },
    {
      icon: "chart-line",
      beforeText: "Progress ",
      highlightText: "feels unclear",
      afterText: " without small goals.",
    },
    {
      icon: "account-group",
      beforeText: "Support is missing when ",
      highlightText: "motivation drops",
      afterText: ".",
    },
  ];

  return (
    <StarryBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.failHeaderBlock}>
            <Text style={styles.failHeaderTitle}>
              Why Quitting Feels So Hard for You
            </Text>
            <Text style={styles.failHeaderSubtitle}>
              The World Health Organization global report showed that without
              structured support, 96% of quitting attempts fail.
            </Text>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.whyText}>Why?</Text>

            <View style={styles.cardsContainer}>
              <View style={styles.cardsWrapper}>
                {painPoints.map((p, index) => (
                  <View key={index} style={styles.cardRow}>
                    <View style={styles.card}>
                      <View style={styles.cardContent}>
                        <LinearGradient
                          colors={["#90b855", "#7fa84d"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.iconCircle}
                        >
                          <Icon name={p.icon as any} size={20} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.cardText}>
                          {p.beforeText}
                          <Text style={styles.highlightText}>
                            {p.highlightText}
                          </Text>
                          {p.afterText}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ alignItems: "center", marginTop: 6 }}>
              <LottieView
                source={require("../../assets/animations/extracted/animations/EducativeScreen3lottie.json")}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Willpower and self-control can help you quit for a few days, but
                lasting change comes from gradual reduction and daily habits
                that guide you past cravings and triggers.
              </Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.bottomTab} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => onNext && onNext()}
            activeOpacity={0.85}
            style={[styles.continueButton, { width: Math.min(420, 360) }]}
          >
            <Text style={styles.continueButtonText}>CONTINUE</Text>
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
  whyText: {
    fontSize: 20,
    lineHeight: 28,
    color: "#f0a04b",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 12,
    textAlign: "center",
  },
  cardsContainer: {
    position: "relative",
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 24,
  },
  cardsWrapper: {
    position: "relative",
    zIndex: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#90b855",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 26,
    color: "#374151",
  },
  highlightText: {
    color: "#f0a04b",
    fontWeight: "600",
  },
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
  lottie: {
    width: "100%",
    height: 160,
    alignSelf: "center",
    marginVertical: 12,
  },
});
