import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  AccessibilityInfo,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import ElegantBackground from "../components/ElegantBackground";

let LottieView: any = null;
try {
  const mod = require("lottie-react-native");
  LottieView = mod && (mod.default || mod);
} catch (_) {
  LottieView = null;
}

const { width, height } = Dimensions.get("window");

// calculate responsive Lottie size
const lottieWidth = Math.min(width - 32, 540);
const lottieHeight = Math.round(lottieWidth * 0.78);
const buttonWidth = Math.min(lottieWidth, 360);
// header height responsive to screen height
const headerHeight = Math.min(72, Math.round(height * 0.08));

interface Props {
  onNext?: () => void;
}

type Star = { x: number; y: number; size: number; opacity: number };
type Particle = { x: number; y: number; size: number };

const WelcomeScreen: React.FC<Props> = ({ onNext }) => {
  // Background visuals are now provided by ElegantBackground.
  // Button press animation
  const buttonScale = useRef(new Animated.Value(1)).current;
  // Lottie entrance animation refs
  const lottieOpacity = useRef(new Animated.Value(0)).current;
  const lottieScale = useRef(new Animated.Value(0.96)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  // Respect reduced motion preference and run a subtle Lottie entrance animation
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(Boolean(enabled));
    });
  }, []);

  useEffect(() => {
    if (!reduceMotion) {
      Animated.parallel([
        Animated.timing(lottieOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.spring(lottieScale, {
          toValue: 1,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      lottieOpacity.setValue(1);
      lottieScale.setValue(1);
    }
  }, [reduceMotion]);

  // Attempt several likely literal filenames (avoid dynamic/template requires).
  let lottieSrc: any = null;
  try {
    // Preferred: exact capitalization with space
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    lottieSrc = require("../../assets/animations/extracted/animations/Rocket Booster.json");
  } catch (e) {}

  if (!lottieSrc) {
    try {
      // fallback variants
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      lottieSrc = require("../../assets/animations/extracted/animations/Rocket booster.json");
    } catch (e) {}
  }

  if (!lottieSrc) {
    try {
      // CamelCase no space
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      lottieSrc = require("../../assets/animations/extracted/animations/RocketBooster.json");
    } catch (e) {}
  }

  if (!lottieSrc) {
    try {
      // underscore
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      lottieSrc = require("../../assets/animations/extracted/animations/rocket_booster.json");
    } catch (e) {}
  }

  if (!lottieSrc) {
    try {
      // dash
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      lottieSrc = require("../../assets/animations/extracted/animations/rocket-booster.json");
    } catch (e) {}
  }

  return (
    <View style={styles.container}>
      <ElegantBackground>
        {/* Status bar removed per request */}

        {/* Header: stick the logo to the top */}
        <View style={[styles.content, { paddingTop: 24 }]}>
          {/* Welcome Section */}
          <View
            style={[
              styles.welcomeSection,
              {
                marginBottom:
                  height < 700 ? 10 : styles.welcomeSection.marginBottom,
              },
            ]}
          >
            <Text style={styles.welcomeTitle}>CONGRATULATIONS!</Text>
            <Text style={styles.welcomeSubtitle}>
              You are about to take the most fruitful journey of your life
            </Text>
          </View>

          {/* Laurel and Stars */}
          <View style={styles.laurelContainer}>
            {/* laurel graphics removed per design */}
          </View>

          {/* Lottie: Rocket Booster - render directly without wrapper */}
          {LottieView && lottieSrc ? (
            <Animated.View
              style={[
                styles.lottieAnimation,
                { opacity: lottieOpacity, transform: [{ scale: lottieScale }] },
              ]}
            >
              <LottieView
                source={lottieSrc}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            </Animated.View>
          ) : (
            <View style={styles.animationPlaceholder}>
              <Text style={styles.placeholderText}>Rocket Booster</Text>
            </View>
          )}

          {/* Divider + Quote */}
          <View style={styles.dividerContainer}>
            <View style={styles.hr} />
          </View>

          <View style={styles.quoteContainer}>
            <Text style={styles.quoteMark}>“</Text>
            <Text style={styles.quoteText}>
              The only impossible journey is the one you never begin
            </Text>
            <Text style={styles.quoteAuthor}>— Tony Robbins</Text>
          </View>

          {/* spacing at bottom provided by paddingBottom */}
        </View>

        {/* Fixed bottom area for Start Quiz and Sign in */}
        <View style={styles.bottomButtonArea} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.startButton,
              {
                transform: [{ scale: buttonScale }],
                width: Math.min(buttonWidth, 280),
              },
              styles.startButtonRaised,
              { height: 44 },
            ]}
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Start the onboarding quiz"
              activeOpacity={0.9}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => onNext && onNext()}
              style={[styles.buttonGradient, { paddingHorizontal: 16 }]}
            >
              <Text style={[styles.startButtonLabel, { fontSize: 15 }]}>
                I WANT TO BE FREE
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={{ width: "100%", alignItems: "center", marginTop: 2 }}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert("Sign in", "Sign in functionality coming soon!");
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                fontFamily: "Inter",
                opacity: 0.85,
                textDecorationLine: "underline",
              }}
            >
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </ElegantBackground>
    </View>
  );
};

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  statusBar: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 50,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  /* status icons removed: statusIcons, signalBars, bar, battery */
  star: {
    position: "absolute",
    backgroundColor: "#ffffff",
    borderRadius: 50,
  },
  particle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
  },
  /* background rings removed */
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 100,
  },
  radialSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  lightBeam: {
    position: "absolute",
    top: 0,
    height: height,
    width: 2,
    zIndex: 0,
  },
  lightBeamGradient: {
    width: 2,
    height: "100%",
  },
  logoContainer: {
    marginTop: 6,
    marginBottom: 0,
    alignItems: "center",
    position: "relative",
  },
  welcomeSection: {
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  welcomeTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter",
    marginBottom: 6,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  welcomeSubtitle: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 18,
    lineHeight: 26,
    maxWidth: 420,
    textAlign: "center",
    fontFamily: "Inter",
  },
  laurelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  /* starsRow removed */
  logoGlow: {
    position: "absolute",
    width: 200,
    height: 100,
    backgroundColor: "#90b855",
    borderRadius: 50,
    opacity: 0.3,
    shadowColor: "#90b855",
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 8,
  },
  landscapeContainer: {
    width: Dimensions.get("window").width - 48,
    maxWidth: 448,
    height: 320,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 32,
    position: "relative",
    alignSelf: "center",
  },
  landscapeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  landscapeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  atmosphericGlow: {
    position: "absolute",
    top: 80,
    left: "50%",
    marginLeft: -96,
    width: 192,
    height: 192,
    backgroundColor: "#fef3c7",
    borderRadius: 96,
    opacity: 0.4,
    shadowColor: "#fef3c7",
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 6,
  },
  sun: {
    position: "absolute",
    top: 80,
    left: "50%",
    marginLeft: -56,
    width: 112,
    height: 112,
    borderRadius: 56,
    shadowColor: "#fef3c7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  sunGradient: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  lightRay: {
    position: "absolute",
    top: 128,
    width: 2,
    backgroundColor: "rgba(254, 243, 199, 0.4)",
    opacity: 0.9,
  },
  skyStar: {
    position: "absolute",
    backgroundColor: "#ffffff",
    borderRadius: 50,
  },
  mountainFar: {
    position: "absolute",
    bottom: 128,
    left: 0,
  },
  mountainMid: {
    position: "absolute",
    bottom: 96,
    left: 0,
  },
  mountainFront: {
    position: "absolute",
    bottom: 48,
    left: 0,
  },
  waterReflection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 96,
    overflow: "hidden",
  },
  shimmer: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  treeLeft: {
    position: "absolute",
    bottom: 0,
    left: 40,
  },
  treeRight: {
    position: "absolute",
    bottom: 0,
    right: 32,
  },
  treeSmall: {
    position: "absolute",
    bottom: 0,
    left: 128,
  },
  bird1: {
    position: "absolute",
    top: 64,
    right: 80,
    opacity: 0.6,
  },
  bird2: {
    position: "absolute",
    top: 80,
    right: 128,
    opacity: 0.5,
  },
  startButton: {
    borderRadius: 25,
    marginBottom: 6,
    shadowColor: "#90b855",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderRadius: 28,
    gap: 8,
  },
  startButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  startButtonLabel: {
    color: "#0f1720",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter",
    letterSpacing: 0.6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  // joinedButton styles removed
  // homeIndicator styles removed
  /* branding removed */
  bottomButtonArea: {
    position: "absolute",
    bottom: 8,
    left: 24,
    right: 24,
    alignItems: "center",
    zIndex: 20,
  },
  startButtonRaised: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: "center",
    maxWidth: 360,
    height: 56,
  },
  lottieContainer: {
    width: Dimensions.get("window").width - 32,
    maxWidth: 540,
    height: 420,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 28,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  lottieAnimation: {
    width: lottieWidth,
    height: lottieHeight,
  },
  animationPlaceholder: {
    width: lottieWidth,
    height: lottieHeight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
  },
  placeholderText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 18,
  },
  hr: {
    width: Math.min(lottieWidth, 420),
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 1,
  },
  quoteContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 12,
  },
  /* quoteCard removed to keep quote background-free */
  quoteMark: {
    fontSize: 34,
    color: "rgba(255,255,255,0.14)",
    marginBottom: -6,
    lineHeight: 34,
  },
  quoteText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
    maxWidth: Math.min(lottieWidth, 420),
  },
  quoteAuthor: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },
  /* startMicrocopy removed */
});

export default WelcomeScreen;
