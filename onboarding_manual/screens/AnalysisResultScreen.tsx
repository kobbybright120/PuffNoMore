import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { darkTheme } from "../../src/theme/theme";
import GradientBackground from "../components/GradientBackground";
import { Svg, Path, Circle } from "react-native-svg";

const { height } = Dimensions.get("window");

const AnalysisResultScreen: React.FC<any> = ({ navigation, onNext }) => {
  const userScore = 52;
  const averageScore = 13;
  const difference = userScore - averageScore;

  // Animation values
  const userBarAnim = useRef(new Animated.Value(0)).current;
  const avgBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate bars upward
    Animated.stagger(150, [
      Animated.spring(userBarAnim, {
        toValue: userScore,
        useNativeDriver: false,
        tension: 40,
        friction: 8,
      }),
      Animated.spring(avgBarAnim, {
        toValue: averageScore,
        useNativeDriver: false,
        tension: 40,
        friction: 8,
      }),
    ]).start();
  }, []);

  // Calculate bar heights (max height for the chart area)
  const maxHeight = 400;
  const userMaxHeight = maxHeight * 1.2; // make user's bar taller
  const userBarHeight = userBarAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, userMaxHeight],
  });
  const avgMaxHeight = maxHeight * 1.2; // increase average bar height as well
  const avgBarHeight = avgBarAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, avgMaxHeight],
  });

  // Icons
  const CheckCircleIcon = () => (
    <Svg width={32} height={32} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill="#10b981" />
      <Path
        d="M9 12l2 2 4-4"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );

  const FileTextIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <GradientBackground>
      <View style={styles.wrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Main Content */}
            <View style={styles.content}>
              {/* Title with checkmark */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Analysis Complete</Text>
                <View style={styles.iconSpacing}>
                  <CheckCircleIcon />
                </View>
              </View>

              {/* Subtitle */}
              <Text style={styles.subtitle}>
                We've got some news to break to you...
              </Text>

              {/* Main message */}
              <Text style={styles.message}>
                Your Responses indicate a clear dependence on cigarettes*
              </Text>

              {/* Bar Chart */}
              <View style={styles.chartContainer}>
                {/* User Score Bar */}
                <View style={styles.barWrapper}>
                  <Animated.View
                    style={[
                      styles.bar,
                      styles.userBar,
                      { height: userBarHeight },
                    ]}
                  >
                    <Text style={styles.barText}>{userScore}%</Text>
                  </Animated.View>
                  <Text style={styles.barLabel}>Your Score</Text>
                </View>

                {/* Average Bar */}
                <View style={styles.barWrapper}>
                  <Animated.View
                    style={[
                      styles.bar,
                      styles.avgBar,
                      { height: avgBarHeight },
                    ]}
                  >
                    <Text style={styles.barText}>{averageScore}%</Text>
                  </Animated.View>
                  <Text style={styles.barLabel}>Average</Text>
                </View>
              </View>

              {/* Comparison text */}
              <View style={styles.comparisonContainer}>
                <Text style={styles.comparisonNumber}>{difference}%</Text>
                <Text style={styles.comparisonText}>
                  higher dependence on cigarettes
                </Text>
                <FileTextIcon />
              </View>

              {/* Disclaimer */}
              <Text style={styles.disclaimer}>
                *This result is an indication only, not a medical diagnosis.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (typeof onNext === "function") onNext();
              else if (navigation && navigation.navigate)
                navigation.navigate("Symptoms");
            }}
            style={{ width: "100%" }}
          >
            <LinearGradient
              colors={[
                darkTheme.colors.secondaryGreen,
                darkTheme.colors.primaryGreen,
              ]}
              start={[0, 0]}
              end={[0, 1]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Check your symptoms</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 160,
  },
  wrapper: { flex: 1, position: "relative" },
  container: {
    minHeight: height,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: "100%",
    maxWidth: 450,
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  iconSpacing: { marginLeft: 12 },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 18,
    marginBottom: 32,
    textAlign: "center",
    fontFamily: "Inter",
  },
  message: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 48,
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "Inter",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 420,
    marginBottom: 48,
  },
  barWrapper: {
    alignItems: "center",
    marginHorizontal: 16,
  },
  bar: {
    width: 80,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingTop: 16,
    alignItems: "center",
  },
  userBar: {
    backgroundColor: "#ef4444",
  },
  avgBar: {
    backgroundColor: "#10b981",
  },
  barText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  barLabel: {
    color: "white",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter",
  },
  comparisonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  comparisonNumber: {
    color: "#ef4444",
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 8,
    fontFamily: "Inter",
  },
  comparisonText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginRight: 8,
    fontFamily: "Inter",
  },
  disclaimer: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginBottom: 32,
    textAlign: "center",
    fontFamily: "Inter",
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    zIndex: 30,
  },
});

export default AnalysisResultScreen;
