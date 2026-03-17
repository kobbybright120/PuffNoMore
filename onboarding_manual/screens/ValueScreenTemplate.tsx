/**
 * ValueScreen Template
 *
 * This is a template for creating new ValueScreens that follow the consistent design pattern.
 * Copy this template and update the content-specific parts (title, description, animation, etc.)
 *
 * Design Pattern Requirements:
 * - White background (#ffffff) for safeArea and container
 * - Container padding: horizontal 32, vertical 48, bottom 120
 * - Logo: black color (#000000)
 * - Text colors: black (#000000) for all text
 * - Pagination dots: black active (#000000), semi-transparent inactive (rgba(0, 0, 0, 0.3))
 * - Next button: absolutely positioned at bottom 28, white background, black text/icon
 * - Arrow icon: Ionicons chevron-forward with black color
 * - Lottie animations from animationIndex
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
let LottieView: any = null;
try {
  const mod = require("lottie-react-native");
  LottieView = mod && (mod.default || mod);
} catch (_) {
  LottieView = null;
}
import animations from "../../src/onboarding/animationIndex";

const ValueScreenTemplate = ({ navigation, route, onNext }: any) => {
  const valueIndex = route?.params?.valueIndex ?? 0;
  const totalScreens = 7; // adjust as you add/remove
  // Arrow Icon - Always use Ionicons chevron-forward with black color
  const ArrowIcon = () => (
    <Ionicons name="chevron-forward" size={20} color="#000000" />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo - Always black */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>PuffNoMore</Text>
        </View>

        {/* Character Illustration - Lottie Animation */}
        <View style={styles.illustrationContainer}>
          <View style={styles.animationWrapper}>
            {LottieView ? (
              <LottieView
                source={animations.yourAnimation} // Replace with your animation
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Character Animation</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content - Update title and description */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            Your <Text style={styles.titleBold}>Title</Text> Here
          </Text>
          <Text style={styles.description}>
            Your description text here. Update with your specific content.
          </Text>

          {/* Add any additional content like brand logos if needed */}
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
                  index === valueIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Next Button - Always absolutely positioned */}
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
              navigation.navigate("NextScreen"); // or "Complete" depending on flow
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
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    marginTop: 16,
  },
  logo: {
    color: "#000000",
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
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#000000",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter",
  },
  contentContainer: {
    alignItems: "center",
    maxWidth: 400,
    marginBottom: 120,
    paddingHorizontal: 16,
  },
  title: {
    color: "#000000",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Inter",
  },
  titleBold: {
    fontWeight: "900",
    fontFamily: "Inter",
  },
  description: {
    color: "#000000",
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
    backgroundColor: "#000000",
  },
  dotInactive: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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

export default ValueScreenTemplate;
