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
    backgroundColor: "#ffffff",
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
    color: "#000000",
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
    marginBottom: 24,
  },
  title: {
    color: "#000000",
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
    color: "#000000",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Inter",
  },
  paginationContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: "#000000",
  },
  dotInactive: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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

export default ValueScreenTemplate;
