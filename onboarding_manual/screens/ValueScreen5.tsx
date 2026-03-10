import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import GreenGradientBackground from "../components/GreenGradientBackground";
import { Ionicons } from "@expo/vector-icons";
let LottieView: any = null;
try {
  const mod = require("lottie-react-native");
  LottieView = mod && (mod.default || mod);
} catch (_) {
  LottieView = null;
}
import animations from "../../src/onboarding/animationIndex";

const ValueScreen5 = ({ navigation, route, onNext }: any) => {
  const valueIndex = route?.params?.valueIndex ?? 4; // fifth screen
  const totalScreens = 7;

  const handleNext = () => {
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
  };

  return (
    <GreenGradientBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>QUITTR</Text>
          </View>

          {/* Lottie Animation */}
          <View style={styles.illustrationContainer}>
            {LottieView ? (
              <LottieView
                source={animations.avoidSetback}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : (
              <View style={styles.animationPlaceholder}>
                <Text style={styles.placeholderText}>
                  [LOTTIE ANIMATION HERE]
                </Text>
                <Text style={styles.placeholderSubtext}>
                  Castle with key & shield lock
                </Text>
              </View>
            )}
          </View>

          {/* Text Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.heading}>Avoid setbacks</Text>
            <Text style={styles.description}>
              QUITTR <Text style={styles.bold}>learns your habits</Text> and
              temptation triggers, providing you with{" "}
              <Text style={styles.bold}>24/7 protection</Text>.
            </Text>
          </View>

          {/* Press Logos */}
          <View style={styles.pressContainer}>
            <Text style={styles.pressForbes}>Forbes</Text>
            <Text style={styles.pressWeekly}>L:WEEKLY</Text>
            <View style={styles.pressTech}>
              <Text style={styles.pressTechText}>TECH:</Text>
              <Text style={styles.pressTechText}>TIMES</Text>
            </View>
          </View>

          {/* Pagination dots */}
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
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
          <Ionicons name="chevron-forward" size={20} color="#000000" />
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
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Placeholder styles - remove after adding Lottie
  animationPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  placeholderText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
  },
  lottieAnimation: {
    width: 300,
    height: 280,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  bold: {
    fontWeight: "700",
  },
  pressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    marginTop: 24,
  },
  pressForbes: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "serif",
  },
  pressWeekly: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  pressTech: {
    alignItems: "center",
  },
  pressTechText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  paginationContainer: {
    flexDirection: "row",
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  nextButton: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default ValueScreen5;
