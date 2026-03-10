import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StarryBackground from "../components/StarryBackground";
import OnboardingLottie from "../../src/components/OnboardingLottie";

interface EducativeScreen1Props {
  onNext: () => void;
  onBack?: () => void;
  current?: number;
  total?: number;
}

const EducativeScreen1: React.FC<EducativeScreen1Props> = ({
  onNext,
  onBack,
  current = 0,
  total = 10,
}) => {
  const { width: deviceWidth, height: deviceHeight } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const isXs = deviceWidth < 340;
  const isSm = deviceWidth >= 340 && deviceWidth < 420;

  const lottieMaxHeight = Math.round(
    deviceHeight * (deviceHeight < 680 ? 0.22 : 0.32),
  );
  const lottieFromWidth = Math.round(deviceWidth * 0.6);
  const lottieSize = Math.min(320, lottieMaxHeight, lottieFromWidth);

  const titleFont = Math.max(16, Math.round(deviceWidth * 0.06));
  const bodyFont = Math.max(12, Math.round(deviceWidth * 0.038));
  const paragraphLineHeight = Math.round(bodyFont * 1.6);

  const progressMaxWidth = Math.max(120, Math.min(deviceWidth - 140, 360));
  const contentPadding = Math.max(12, Math.round(deviceWidth * 0.05));
  const footerHeight = 72;
  const contentPaddingBottom = Math.max(20, footerHeight + 16);

  return (
    <StarryBackground>
      <View style={styles.container}>
        <View
          style={[
            styles.content,
            {
              paddingHorizontal: contentPadding,
              paddingTop: 56,
              paddingBottom: contentPaddingBottom,
            },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => (onBack ? onBack() : null)}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View
                style={[styles.progressTrack, { maxWidth: progressMaxWidth }]}
                accessibilityLabel={`Progress: ${current}/${total}`}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        total > 0
                          ? `${Math.round((current / total) * 100)}%`
                          : "0%",
                    },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.langButton}>
              <Text style={styles.langText}>EN</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <View
              style={{
                alignSelf: "center",
                width: lottieSize,
                height: lottieSize,
                maxHeight: lottieMaxHeight,
              }}
            >
              <OnboardingLottie
                animationKey="tree"
                style={{ width: "100%", height: "100%" }}
              />
            </View>
          </Animated.View>

          <View style={styles.body}>
            <View style={{ height: isXs ? 8 : isSm ? 12 : 18 }} />

            <Text
              style={[
                styles.title,
                { fontSize: titleFont, fontFamily: "Inter_700Bold" },
              ]}
            >
              How This Program Helps You Quit
            </Text>

            <View style={{ height: 10 }} />

            <Text
              style={[
                styles.paragraph,
                {
                  fontSize: bodyFont + 2,
                  lineHeight: paragraphLineHeight,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Many smokers struggle because they try to quit all at once.
            </Text>
            <View style={{ height: 8 }} />
            <Text
              style={[
                styles.paragraph,
                {
                  fontSize: bodyFont + 2,
                  lineHeight: paragraphLineHeight,
                  fontWeight: "bold",
                  fontFamily: "Inter_700Bold",
                },
              ]}
            >
              This program works differently.
            </Text>
            <View style={{ height: 8 }} />
            <Text
              style={[
                styles.paragraph,
                {
                  fontSize: bodyFont + 1,
                  lineHeight: paragraphLineHeight,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              We help you gradually reduce your nicotine intake with a
              structured plan that slowly decreases the number of cigarettes or
              nicotine use over time.
            </Text>
            <View style={{ height: 8 }} />
            <Text
              style={[
                styles.paragraph,
                {
                  fontSize: bodyFont + 1,
                  lineHeight: paragraphLineHeight,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              This method helps your body adjust naturally, making the quitting
              process easier, more realistic, and more sustainable.
            </Text>
            <View style={{ height: 8 }} />
            <Text
              style={[
                styles.paragraph,
                {
                  fontSize: bodyFont + 1,
                  lineHeight: paragraphLineHeight,
                  fontWeight: "bold",
                  fontFamily: "Inter_700Bold",
                },
              ]}
            >
              Take it one step at a time — every reduction brings you closer to
              freedom from nicotine.
            </Text>
          </View>

          {/* footer removed from content - button is fixed to screen bottom */}
        </View>
        <View style={styles.bottomTab} pointerEvents="box-none">
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                width: isXs
                  ? deviceWidth - 40
                  : Math.min(420, deviceWidth - 48),
              },
            ]}
            onPress={onNext}
            accessibilityLabel="GOT IT"
          >
            <Text style={styles.nextButtonText}>GOT IT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
    flex: 1,
    justifyContent: "space-between",
  },
  body: {
    flex: 1,
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  iconButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    alignSelf: "center",
    marginTop: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#63a96a",
    borderRadius: 999,
  },
  langButton: {
    padding: 8,
  },
  langText: {
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    marginBottom: 32,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  paragraph: {
    color: "#fff",
    textAlign: "left",
    paddingHorizontal: 0,
    fontFamily: "Inter",
  },
  nextButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "stretch",
    maxWidth: 420,
    marginHorizontal: 0,
    minHeight: 48,
    marginTop: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    alignItems: "stretch",
    paddingVertical: 14,
  },
  bottomTab: {
    // kept for compatibility if referenced elsewhere
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    alignItems: "center",
    backgroundColor: "transparent",
  },
});

export default EducativeScreen1;
