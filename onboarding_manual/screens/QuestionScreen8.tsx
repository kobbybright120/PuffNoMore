import React, { useState } from "react";
import ElegantSlider from "../components/ElegantSlider";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GreenGradientBackground from "../components/GreenGradientBackground";
import { usePuff } from "../../src/context/PuffContext";

const { height } = Dimensions.get("window");

const QuestionScreen8: React.FC<any> = ({
  questionNumber = "Question 8",
  onNext,
  onBack,
  current = 8,
  total = 10,
}) => {
  const puff = usePuff();
  const [sliderValue, setSliderValue] = useState(3); // Default to middle value

  const handleContinue = async () => {
    await puff.saveOnboardingAnswer("confidence", sliderValue);
    onNext && onNext();
  };

  return (
    <GreenGradientBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => (onBack ? onBack() : null)}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
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

          <Text style={styles.questionTitle}>{questionNumber}</Text>
          <Text
            style={[styles.questionText, { fontSize: 20, fontWeight: "500" }]}
          >
            How ready are you to gradually cut down until you quit for
            good?
          </Text>
          <Text style={styles.questionSubtitle}>
            Your readiness today is the seed. We’ll help it grow into freedom.
          </Text>

          <View
            style={{ alignItems: "center", marginVertical: 32, width: "100%" }}
          >
            <Text style={{ color: "#fff", fontSize: 16, marginBottom: 12 }}>
              Select your confidence level:
            </Text>
            <ElegantSlider
              min={1}
              max={5}
              step={1}
              value={sliderValue}
              onValueChange={(v: number) => setSliderValue(v)}
              width={300}
            />
          </View>
        </View>

        <View style={styles.bottomTab}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GreenGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    minHeight: height,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: { flex: 1, paddingHorizontal: 12 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#63a96a" },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  langText: { color: "#fff", fontWeight: "700" },
  questionTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
  },
  questionText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 6,
    marginBottom: 8,
    textAlign: "left",
    alignSelf: "stretch",
  },
  questionSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 12,
  },
  bottomTab: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  continueButton: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  continueText: { color: "#63a96a", fontSize: 18, fontWeight: "700" },
});

export default QuestionScreen8;
