import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
// import LottieView from 'lottie-react-native'; // Uncomment when adding Lottie
import GreenGradientBackground from "../components/GreenGradientBackground";
let LottieView: any = null;
try {
  const mod = require("lottie-react-native");
  LottieView = mod && (mod.default || mod);
} catch {
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

const ValueScreen1 = ({ navigation, route, onNext }: any) => {
  const valueIndex = route?.params?.valueIndex ?? 0;
  // internal slides (optional) – update these or remove if you prefer separate screens
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalScreens = 7; // update this number when you add/remove value screens

  // Broken Heart SVG Component
  const BrokenHeart = () => (
    <Svg width={280} height={260} viewBox="0 0 280 260">
      {/* Left half of broken heart */}
      <Path
        d="M140 240 L60 160 C30 130 20 90 30 60 C40 30 70 10 100 20 C120 25 130 40 140 60 L140 130 L110 100 L140 130 L140 240 Z"
        fill="#D1D5DB"
      />
      {/* Right half of broken heart */}
      <Path
        d="M140 240 L220 160 C250 130 260 90 250 60 C240 30 210 10 180 20 C160 25 150 40 140 60 L140 130 L170 100 L140 130 L140 240 Z"
        fill="#D1D5DB"
      />
      {/* Jagged break line */}
      <Path
        d="M140 60 L145 80 L135 95 L145 110 L135 125 L140 135"
        stroke="#dc2626"
        strokeWidth="4"
        fill="none"
      />
    </Svg>
  );

  // Arrow Icon
  const ArrowIcon = ({
    color = "#000000",
    size = 20,
  }: {
    color?: string;
    size?: number;
  }) => <Ionicons name="chevron-forward" size={size} color={color} />;

  // Slide content data — single value slide (Path to Freedom)
  const slides = [
    {
      title: "Path to Freedom",
      description:
        "Freedom is possible by gradually lowering nicotine. Your brain resets to its natural balance, giving you calmer moods and stronger focus.",
      illustration: "plant",
      bgColor: "#1e40af",
      descriptionBold: [],
    },
  ];
  const totalSlides = slides.length;

  const currentSlideData = slides[currentSlide];

  const handleNext = () => {
    // first advance internal slide if there are any remaining
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
      return;
    }

    // otherwise move to the next value screen (or finish)
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
      console.log("Onboarding complete");
    }
  };

  // Helper function to render description with bold text
  const renderDescription = (description: string, boldWords?: string[]) => {
    if (!boldWords || boldWords.length === 0) {
      return <Text style={styles.description}>{description}</Text>;
    }

    return (
      <Text style={styles.description}>
        {description
          .split(new RegExp(`(${boldWords.join("|")})`))
          .map((part, index) =>
            boldWords.includes(part) ? (
              <Text key={index} style={styles.boldText}>
                {part}
              </Text>
            ) : (
              <Text key={index}>{part}</Text>
            ),
          )}
      </Text>
    );
  };

  return (
    <GreenGradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>PuffNoMore</Text>
          </View>

          {/* Illustration Container */}
          <View style={styles.illustrationContainer}>
            {/* Slide 1: Brain Lottie Animation */}
            {currentSlideData.illustration === "lottie" && (
              <View style={styles.animationWrapper}>
                {/* 
                TODO: Add your Brain Lottie animation here
                Replace the placeholder below with:
                
                <LottieView
                  source={require('./path/to/brain-animation.json')}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                />
              */}
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>
                    Brain Lottie Animation
                  </Text>
                </View>
              </View>
            )}

            {/* Slide 2: Broken Heart */}
            {currentSlideData.illustration === "heart" && (
              <View style={styles.heartWrapper}>
                <BrokenHeart />
              </View>
            )}

            {/* Slide 5: Plant Lottie Animation */}
            {currentSlideData.illustration === "plant" && (
              <View style={styles.animationWrapper}>
                {LottieView ? (
                  <LottieView
                    source={animations.animatedPlantLoader}
                    autoPlay
                    loop
                    style={styles.lottieAnimation}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                      Plant Lottie Animation
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Slides 3-4: Placeholder */}
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
            {renderDescription(
              currentSlideData.description,
              currentSlideData.descriptionBold,
            )}
          </View>

          {/* Pagination dots (screen progress) */}
          <View style={styles.paginationContainer}>
            {Array.from({ length: totalScreens }).map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (navigation && navigation.navigate) {
                    if (index < totalScreens) {
                      const name = `ValueScreen${index + 1}`;
                      navigation.navigate(name, { valueIndex: index });
                    }
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
    minHeight: responsiveSize(250, 150),
  },
  animationWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: responsiveSize(300, 200),
    height: responsiveSize(300, 200),
  },
  heartWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  // Placeholder styles (remove when Lottie is added)
  placeholder: {
    width: responsiveSize(200, 120),
    height: responsiveSize(200, 120),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: responsiveSize(100, 60),
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "white",
    fontSize: responsiveSize(14, 10),
    textAlign: "center",
    fontFamily: "Inter",
  },
  contentContainer: {
    alignItems: "center",
    maxWidth: "85%",
    marginBottom: responsiveSize(120, 80),
    paddingHorizontal: responsiveSize(16, 8),
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
  boldText: {
    fontWeight: "bold",
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

export default ValueScreen1;
