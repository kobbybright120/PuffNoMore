import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GreenGradientBackground from "../components/GreenGradientBackground";
let LottieView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("lottie-react-native");
  LottieView = mod && (mod.default || mod);
} catch (e) {
  LottieView = null;
}
import animations from "../../src/onboarding/animationIndex";

const ValueScreen5 = ({ navigation, route, onNext }: any) => {
  const valueIndex = route?.params?.valueIndex ?? 4;
  const totalScreens = 7;

  const ArrowIcon = () => (
    <Ionicons name="chevron-forward" size={20} color="#000000" />
  );

  return (
    <GreenGradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>PuffNoMore</Text>
          </View>

          {/* Character Illustration - Lottie Animation */}
          <View style={styles.illustrationContainer}>
            <View style={styles.animationWrapper}>
              {LottieView ? (
                <LottieView
                  source={animations.avoidSetback}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}></Text>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>
              Avoid <Text style={styles.titleBold}>Setbacks</Text>
            </Text>
            <Text style={styles.description}>
              PuffNoMore learns your smoking patterns and craving triggers,
              giving you round‑the‑clock support to stay strong and keep moving
              forward."
            </Text>

            {/* Brand Logos */}
            <View style={styles.brandsContainer}>
              <Text style={styles.forbesLogo}>Forbes</Text>
              <View style={styles.weeklyContainer}>
                <View style={styles.pcBox}>
                  <Text style={styles.pcText}>PC</Text>
                </View>
                <Text style={styles.weeklyText}>WEEKLY</Text>
              </View>
              <View style={styles.techTimesContainer}>
                <Text style={styles.techTimesText}>TECH:</Text>
                <Text style={styles.techTimesText}>TIMES</Text>
              </View>
            </View>
          </View>

          {/* Pagination dots (screen progress) */}
          <View style={styles.paginationContainer}>
            {Array.from({ length: totalScreens }).map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (navigation && navigation.navigate) {
                    const name = `ValueScreen${index + 1}`;
                    navigation.navigate(name, { valueIndex: index });
                  }
                }}
                style={{ marginRight: index !== totalScreens - 1 ? 12 : 0 }}
              >
                <View
                  style={[
                    styles.dot,
                    index === valueIndex
                      ? styles.dotActive
                      : styles.dotInactive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          activeOpacity={0.8}
          onPress={() => {
            const nextScreenIndex = valueIndex + 1;
            if (navigation && navigation.navigate) {
              if (nextScreenIndex < totalScreens) {
                const nextName = `ValueScreen${nextScreenIndex + 1}`;
                navigation.navigate(nextName, { valueIndex: nextScreenIndex });
              } else {
                navigation.navigate("Complete");
              }
            } else if (typeof onNext === "function") {
              onNext();
            } else {
              console.log("Next pressed");
            }
          }}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <ArrowIcon />
        </TouchableOpacity>
      </SafeAreaView>
    </GreenGradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    paddingBottom: 80,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: { marginTop: 16 },
  logo: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter",
  },
  illustrationContainer: {
    flex: 0.55,
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 360,
  },
  animationWrapper: { justifyContent: "center", alignItems: "center" },
  lottieAnimation: { width: 260, height: 260 },
  placeholder: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter",
  },
  contentContainer: {
    alignItems: "center",
    maxWidth: 400,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Inter",
  },
  titleBold: { fontWeight: "900", fontFamily: "Inter" },
  description: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Inter",
  },
  semiBold: { fontWeight: "600", fontFamily: "Inter" },
  brandsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  forbesLogo: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    fontStyle: "italic",
    fontFamily: "Inter",
    marginHorizontal: 12,
  },
  weeklyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  pcBox: {
    width: 24,
    height: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  pcText: {
    color: "black",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: "Inter",
  },
  weeklyText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  techTimesContainer: { alignItems: "flex-start", marginHorizontal: 12 },
  techTimesText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 14,
    fontFamily: "Inter",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 96,
    alignSelf: "center",
    flexDirection: "row",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: "white" },
  dotInactive: { backgroundColor: "rgba(255, 255, 255, 0.3)" },
  nextButton: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 36,
    backgroundColor: "#ffffff",
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
});

export default ValueScreen5;
