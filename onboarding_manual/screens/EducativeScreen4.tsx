import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import StarryBackground from "../components/StarryBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

type Props = {
  onNext?: () => void;
  onBack?: () => void;
};

export default function EducativeScreen4({ onNext }: Props) {
  const { width: deviceWidth, height: deviceHeight } = useWindowDimensions();

  const lottieMaxHeight = Math.round(
    deviceHeight * (deviceHeight < 680 ? 0.22 : 0.32),
  );
  const lottieFromWidth = Math.round(deviceWidth * 0.6);
  const lottieSize = Math.min(320, lottieMaxHeight, lottieFromWidth);

  return (
    <StarryBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.failHeaderBlock}>
            <Text style={styles.failHeaderTitle}>
              Quitting Doesn’t Mean Losing Much
            </Text>
            <Text style={styles.failHeaderSubtitle}>
              As ex-smokers ourselves, we know quitting can feel like giving up
              too much. But it doesn’t have to mean losing your lifestyle or
              friends.
            </Text>
          </View>

          <View style={styles.chartContainer}>
            <View style={{ alignItems: "center", marginBottom: 12 }}>
              <LottieView
                source={require("../../assets/animations/extracted/animations/FriendLottie.json")}
                autoPlay
                loop
                style={{ width: lottieSize, height: lottieSize }}
              />
            </View>
            <Text style={styles.chartTitle}>
              Keep Your Life. Lose the Habit.
            </Text>
            <Text style={styles.infoText}>
              PuffNoMore helps you cut back gradually with daily habits that fit
              your life, so you can enjoy every moment while moving toward
              freedom.
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              You’ll move forward in small, steady steps that fit into your
              everyday life, keeping the routines and relationships you care
              about while gradually leaving nicotine behind.
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.bottomTab} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => onNext && onNext()}
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              { width: Math.min(420, deviceWidth - 48) },
            ]}
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
  chartTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 14,
    textAlign: "center",
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
});
