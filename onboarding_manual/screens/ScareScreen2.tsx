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

  // Arrow Icon
  const ArrowIcon = ({
    color = "#000000",
    size = 20,
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
      title: "Porn destroys relationships",
      description:
        "Porn reduces your hunger for a real relationship and replaces it with the hunger for more porn.",
      illustration: "heart",
    },
    {
      title: "Slide 3 Title",
      description: "Slide 3 description goes here.",
      illustration: "placeholder",
    },
    {
      title: "Slide 4 Title",
      description: "Slide 4 description goes here.",
      illustration: "placeholder",
    },
    {
      title: "Slide 5 Title",
      description: "Slide 5 description goes here.",
      illustration: "placeholder",
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
            <View style={styles.animationWrapper}>
              {LottieView ? (
                <LottieView
                  source={animations.brainThinking}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                />
              ) : (
                <View style={styles.placeholder}>
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
    paddingHorizontal: 32,
    paddingVertical: 48,
    paddingBottom: 120,
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    marginTop: responsiveSize(16, 8),
  },
  logo: {
    color: "white",
    fontSize: 36,
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
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: 300,
    height: 300,
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
    marginBottom: 32,
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    fontFamily: "Inter",
  },
  description: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center",
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

export default ScareScreen2;
