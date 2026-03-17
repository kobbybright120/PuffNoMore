import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import StarryBackground from "../components/StarryBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingLottie from "../../src/components/OnboardingLottie";
import { Ionicons } from "@expo/vector-icons";

interface EducativeScreen5Props {
  onNext: () => void;
  onBack?: () => void;
}

const EducativeScreen5: React.FC<EducativeScreen5Props> = ({
  onNext,
  onBack,
}) => {
  const { width: deviceWidth, height: deviceHeight } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <StarryBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow} />

          <View style={styles.failHeaderBlock}>
            <Text style={styles.failHeaderTitle}>CREATED TO BREAK HABITS</Text>
            <Text style={styles.failHeaderSubtitle}>
              Our founder smoked and vaped heavily for more than 15 years. Out
              of that struggle, he designed PuffNoMore’s tools to gently break
              unhealthy habits and thought patterns step by step, guiding you
              toward gradual reduction and lasting freedom from nicotine.
            </Text>
          </View>

          <Animated.View style={[styles.chartContainer, { opacity: fadeAnim }]}>
            <View style={{ alignItems: "center", marginBottom: 12 }}>
              <OnboardingLottie
                animationKey="light,idea,create"
                style={{ width: 180, height: 180 }}
              />
            </View>

            <Text style={styles.chartTitle}>Our Approach</Text>
            <Text style={styles.infoText}>
              Thousands of nicotine users like you have successfully quit using our clinically proven methodology!
            </Text>
          </Animated.View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Start your first gentle step today because lasting freedom begins
              with progress, not pressure.
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.bottomTab} pointerEvents="box-none">
          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              { width: Math.min(420, deviceWidth - 48) },
            ]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </StarryBackground>
  );
};

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
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
  chartTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 14,
    textAlign: "center",
  },
  infoContainer: {
    marginTop: 0,
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
});

export default EducativeScreen5;
