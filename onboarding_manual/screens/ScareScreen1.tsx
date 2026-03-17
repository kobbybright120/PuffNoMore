import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
let LottieView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("lottie-react-native");
  LottieView = mod && (mod.default || mod);
} catch (e) {
  LottieView = null;
}

const { width, height } = Dimensions.get("window");

// Responsive calculation helper — scales proportionally based on screen size
const responsiveSize = (baseSize: number, minSize?: number) => {
  const baseWidth = 375;
  const baseHeight = 812;
  const scale = Math.min(width / baseWidth, height / baseHeight);
  const result = baseSize * scale;
  return minSize ? Math.max(minSize, result) : result;
};

type Props = {
  onNext?: () => void;
  onBack?: () => void;
  navigation?: any;
};

const ScareScreen1: React.FC<Props & { scareIndex?: number }> = ({
  onNext,
  navigation,
  scareIndex = 1,
}) => {
  const ArrowIcon = () => (
    <Ionicons name="chevron-forward" size={18} color="#000000" />
  );
  const totalSlides = 4;
  const animSize = Math.round(responsiveSize(260, 180));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>PuffNoMore</Text>
        </View>

        <View style={styles.illustrationContainer}>
          <View
            style={[
              styles.animationWrapper,
              { width: animSize, height: animSize },
            ]}
          >
            {LottieView ? (
              <LottieView
                source={require("../../assets/animations/extracted/animations/brain thinking.json")}
                autoPlay
                loop
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View
                style={[
                  styles.placeholder,
                  {
                    width: Math.round(animSize * 0.7),
                    height: Math.round(animSize * 0.7),
                    borderRadius: Math.round(animSize * 0.35),
                  },
                ]}
              >
                <Text style={styles.placeholderText}>Lottie Animation</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Smoking is a drug</Text>
          <Text style={styles.description}>
            Lighting up releases a chemical in your brain called dopamine.
            That’s the same “feel‑good” signal that makes smoking feel rewarding
            in the moment
          </Text>
        </View>

        <View style={styles.paginationContainer}>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === scareIndex - 1
                  ? styles.dotActive
                  : styles.dotInactive,
                index !== totalSlides - 1 && { marginRight: 12 },
              ]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        activeOpacity={0.8}
        onPress={() => {
          if (typeof onNext === "function") onNext();
          else if (navigation && navigation.navigate)
            navigation.navigate("NextScreen");
          else console.log("Onboarding complete");
        }}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <View style={{ width: 8 }} />
        <ArrowIcon />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#dc2626",
  },
  container: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingHorizontal: 20,
    paddingVertical: 28,
    paddingBottom: 80,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logoContainer: {
    marginTop: responsiveSize(16, 8),
  },
  logo: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animationWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: 300,
    height: 300,
  },
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
    fontFamily: "Inter",
  },
  contentContainer: {
    alignItems: "center",
    maxWidth: 400,
    marginBottom: 120,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Inter",
  },
  description: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "Inter",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 96,
    alignSelf: "center",
    flexDirection: "row",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "white",
  },
  dotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
});

export default ScareScreen1;
