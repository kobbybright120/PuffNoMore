import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../src/context/ThemeContext";
import GreenGradientBackground from "../components/GreenGradientBackground";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const steps = 5;

export default function QuitSureWelcomeScreen({
  onContinue,
  onBack,
}: {
  onContinue?: () => void;
  onBack?: () => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation: any = useNavigation();

  // CTA press scale animation & refs
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const handleContinue = () => {
    if (onContinue) return onContinue();
    navigation.navigate("OnboardingFlow", { startStep: 1 });
  };

  // Lottie dynamic import and safe asset require
  let LottieView: any = null;
  try {
    // require at runtime so bundlers that don't include lottie won't fail
    const mod = require("lottie-react-native");
    LottieView = mod && (mod.default || mod);
  } catch (e) {
    LottieView = null;
  }

  // responsive Lottie sizing (use theme spacing to compute comfortable width)
  const screenW = Dimensions.get("window").width;
  const lottieWidth = Math.min(screenW - theme.spacing.lg * 2, 440);
  const lottieHeight = Math.round(lottieWidth * 0.7);

  // entrance animation refs
  const lottieOpacity = useRef(new Animated.Value(0)).current;
  const lottieScale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (!LottieView) {
      lottieOpacity.setValue(1);
      lottieScale.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(lottieOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(lottieScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [LottieView, lottieOpacity, lottieScale]);

  // attempt to locate a local animation asset
  let lottieSrc: any = null;
  try {
    lottieSrc = require("../../assets/animations/extracted/animations/Free Thinking Animation.json");
  } catch {}
  if (!lottieSrc) {
    try {
      lottieSrc = require("../../assets/animations/extracted/animations/RocketBooster.json");
    } catch {}
  }
  if (!lottieSrc) {
    try {
      lottieSrc = require("../../assets/animations/growBars.json");
    } catch {}
  }

  return (
    <GreenGradientBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Lottie animation (placed above title/subtitle) */}
          <Animated.View
            style={[
              styles.lottieContainer,
              { opacity: lottieOpacity, transform: [{ scale: lottieScale }] },
            ]}
          >
            {LottieView && lottieSrc ? (
              <LottieView
                source={lottieSrc}
                style={[
                  styles.lottieAnimation,
                  { width: lottieWidth, height: lottieHeight },
                ]}
                autoPlay
                loop
              />
            ) : (
              <View
                style={[
                  styles.lottiePlaceholder,
                  { width: lottieWidth, height: lottieHeight },
                ]}
              >
                <Text style={styles.placeholderText}>Animation</Text>
              </View>
            )}
          </Animated.View>

          <Text style={styles.title}>You can become a happy non-smoker.</Text>
          <Text style={styles.subtitle}>
            First let’s explore your unique challenges and understand your
            smoking journey. This will help us create a plan that fits you.
          </Text>

          {/* spacer so content doesn't hide behind bottom tab */}
          <View style={styles.optionsSpacing} />
        </View>

        <SafeAreaView
          style={styles.safeArea}
          edges={Platform.OS === "ios" ? ["bottom"] : (["bottom"] as any)}
        >
          <View style={styles.bottomTab} pointerEvents="box-none">
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.9}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={handleContinue}
                accessibilityLabel="Continue to onboarding questionnaire"
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
              >
                <LinearGradient
                  colors={[
                    theme.colors.primaryGreen,
                    theme.colors.secondaryGreen,
                  ]}
                  style={styles.buttonInner}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.colors.primaryBackground },
                    ]}
                  >
                    CONTINUE
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    </GreenGradientBackground>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    headerBg: {
      paddingTop: 36,
      paddingBottom: 18,
      alignItems: "center",
      borderBottomLeftRadius: theme.borderRadius.xlarge,
      borderBottomRightRadius: theme.borderRadius.xlarge,
    },
    headerTitle: {
      color: "#fff",
      fontSize: theme.fonts.size.medium,
      fontFamily: theme.fonts.family.bold,
      fontWeight: theme.fonts.weight.bold,
      letterSpacing: 0.4,
      marginBottom: 12,
    },
    progressRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    progressStep: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: theme.colors.textSecondary,
      backgroundColor: theme.colors.textSecondary,
      opacity: 0.28,
      marginHorizontal: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    progressStepActive: {
      opacity: 1,
      borderColor: theme.colors.secondaryGreen,
      backgroundColor: theme.colors.secondaryGreen,
    },
    checkIcon: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#fff",
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.xl,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    title: {
      color: theme.colors.primaryBackground,
      fontSize: theme.fonts.size.xxlarge,
      fontFamily: theme.fonts.family.bold,
      fontWeight: theme.fonts.weight.bold,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    italic: {
      fontStyle: "italic",
      fontWeight: theme.fonts.weight.bold,
      color: theme.colors.primaryBackground,
    },
    subtitle: {
      color: "rgba(255,255,255,0.9)",
      fontSize: theme.fonts.size.medium,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
      maxWidth: Math.min(640, width - theme.spacing.lg * 2),
    },
    imageCard: {
      width: Math.min(width - theme.spacing.xl, 520),
      height: 200,
      borderRadius: theme.borderRadius.xlarge,
      overflow: "hidden",
      marginBottom: theme.spacing.xl,
      backgroundColor: theme.colors.primaryBackground,
      ...theme.shadows.medium,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    optionsSpacing: { height: 80 },
    bottomTab: {
      position: "absolute",
      left: 24,
      right: 24,
      bottom: 28,
      alignItems: "center",
      backgroundColor: "transparent",
    },
    lottieContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    lottieAnimation: {
      // size applied inline for responsiveness
    },
    lottiePlaceholder: {
      backgroundColor: theme.colors.primaryBackground,
      borderRadius: theme.borderRadius.large,
      alignItems: "center",
      justifyContent: "center",
      ...theme.shadows.small,
    },
    placeholderText: {
      color: theme.colors.primaryBackground,
      fontFamily: theme.fonts.family.regular,
    },
    button: {
      width: Math.min(width - theme.spacing.lg * 2, 520),
      maxWidth: 520,
      height: 54,
      borderRadius: theme.borderRadius.xlarge,
      overflow: "hidden",
      ...theme.shadows.medium,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.06)",
    },
    buttonInner: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: theme.colors.primaryBackground,
      fontSize: theme.fonts.size.medium,
      fontFamily: theme.fonts.family.bold,
      fontWeight: theme.fonts.weight.bold,
      letterSpacing: 0.4,
    },
    safeArea: {
      backgroundColor: "transparent",
    },
  });
}
