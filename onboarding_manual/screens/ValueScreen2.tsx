import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  // Dimensions not needed (width/height unused)
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

// dimensions unused; dropped to satisfy linter
// const { width, height } = Dimensions.get('window');

const ValueScreen2 = ({ navigation, route, onNext }: any) => {
  const valueIndex = route?.params?.valueIndex ?? 1;
  const totalScreens = 7; // adjust when you add more value screens
  // Arrow Icon
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
                  source={animations.hero}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>
                    Character Animation
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>
              Welcome to <Text style={styles.titleBold}>PuffNoMore</Text>
            </Text>
            <Text style={styles.description}>
              With over <Text style={styles.semiBold}>1,000,000 users</Text>,
              PuffNoMore is <Text style={styles.semiBold}>class-leading</Text>{" "}
              and based on{" "}
              <Text style={styles.semiBold}>years of research</Text> and
              user-interaction.
            </Text>

            {/* Brand Logos */}
            <View style={styles.brandsContainer}>
              {/* Forbes */}
              <Text style={styles.forbesLogo}>Forbes</Text>

              {/* PC Weekly */}
              <View style={styles.weeklyContainer}>
                <View style={styles.pcBox}>
                  <Text style={styles.pcText}>PC</Text>
                </View>
                <Text style={styles.weeklyText}>WEEKLY</Text>
              </View>

              {/* Tech Times */}
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
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 48,
    paddingBottom: 120,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    marginTop: 32,
  },
  logo: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
    fontFamily: "Inter",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animationWrapper: {
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: 280,
    height: 280,
  },
  // Placeholder styles (remove when Lottie is added)
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
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    fontFamily: "Inter",
  },
  titleBold: {
    fontWeight: "900",
    fontFamily: "Inter",
  },
  description: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Inter",
  },
  semiBold: {
    fontWeight: "600",
    fontFamily: "Inter",
  },
  brandsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 32,
  },
  forbesLogo: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    fontStyle: "italic",
    fontFamily: "Inter",
  },
  weeklyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  techTimesContainer: {
    alignItems: "flex-start",
  },
  techTimesText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 14,
    fontFamily: "Inter",
  },
  paginationContainer: {
    flexDirection: "row",
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: "white",
  },
  dotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  nextButton: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    backgroundColor: "#ffffff",
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
});

export default ValueScreen2;
