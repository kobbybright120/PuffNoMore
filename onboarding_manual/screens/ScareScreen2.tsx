import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
let LottieView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("lottie-react-native");
  LottieView = mod && (mod.default || mod);
} catch (e) {
  LottieView = null;
}
import animations from "../../src/onboarding/animationIndex";

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
  scareIndex?: number; // 1-based index for the current scare screen
};

const ScareScreen2 = ({ onNext, scareIndex }: Props) => {
  const totalSlides = 4;
  const currentSlide = Math.max(0, (scareIndex ?? 1) - 1);
  const animSize = Math.round(responsiveSize(260, 180));

  // Arrow Icon
  const ArrowIcon = ({
    color = "#000000",
    size = 18,
  }: {
    color?: string;
    size?: number;
  }) => <Ionicons name="chevron-forward" size={size} color={color} />;

  // Slide content data
  const slides = [
    {
      title: "Porn is a drug",
      description:
        "Using porn releases a chemical in the brain called dopamine. This chemical makes you feel good - it's why you feel pleasure when you watch porn.",
      illustration: "lottie",
    },
    {
      title: "Health impact",
      description:
        "Smoking weakens your lungs and heart. That quick relief feels calming, but it’s the same damage that makes breathing harder and risks disease.",
      illustration: "heart",
    },

  ];

  const currentSlideData = slides[currentSlide];

  const handleNext = () => {
    if (onNext) return onNext();
    // fallback behaviour
    console.log("Next pressed (no onNext provided)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>PuffNoMore</Text>
        </View>

        {/* Illustration Container */}
        <View style={styles.illustrationContainer}>
          {/* Slide 1: Lottie Animation */}
          {currentSlideData.illustration === "lottie" && (
            <View
              style={[
                styles.animationWrapper,
                { width: animSize, height: animSize },
              ]}
            >
              {LottieView ? (
                <LottieView
                  source={animations.brainThinking}
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
          )}

          {/* Health impact: use covid19 Lottie */}
          {currentSlideData.illustration === "heart" && (
            <View
              style={[
                styles.animationWrapper,
                { width: animSize, height: animSize },
              ]}
            >
              {LottieView ? (
                <LottieView
                  source={animations.covid19}
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
          )}

          {/* Slides 3-5: Placeholder */}
          {currentSlideData.illustration === "placeholder" && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Slide {currentSlide + 1}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{currentSlideData.title}</Text>
          <Text style={styles.description}>{currentSlideData.description}</Text>
        </View>

        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.dotActive : styles.dotInactive,
                index !== totalSlides - 1 && { marginRight: 12 },
              ]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        activeOpacity={0.8}
        onPress={handleNext}
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
  heartWrapper: {
    justifyContent: "center",
    alignItems: "center",
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
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
});

export default ScareScreen2;
