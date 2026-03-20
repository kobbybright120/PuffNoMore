import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GreenGradientBackground from "../components/GreenGradientBackground";
import { usePuff } from "../../src/context/PuffContext";

const { height } = Dimensions.get("window");

const QuestionScreen9: React.FC<any> = ({
  questionNumber = "Question 9",
  question = "When you imagine life without smoking, what feels hardest?",
  subtitle = "Select all that apply",
  onNext,
  onBack,
  current = 9,
  total = 10,
}) => {
  const puff = usePuff();
  const [selected, setSelected] = useState<string[]>([]);
  const savingRef = useRef(false);

  const options = [
    "Scared of the withdrawal symptoms/cravings",
    "Worried about gaining weight",
    "Worried about changing my daily routine",
    "Afraid of losing friends",
    "Concerned about my mental health worsening",
    "Excited about regaining control",
    "Afraid stress will pull me back",
    "Worried I’ll lose focus or energy",
  ];

  const toggleOption = (opt: string) => {
    setSelected((prev) => {
      if (prev.includes(opt)) return prev.filter((p) => p !== opt);
      return [...prev, opt];
    });
  };

  const handleContinue = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      await puff.saveOnboardingAnswer("quittingConcerns", selected);
    } catch {
      // ignore save errors
    }
    savingRef.current = false;
    console.log("QuestionScreen9: Continue pressed", {
      selected,
      onNextPresent: !!onNext,
    });
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
              accessibilityLabel="Back"
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

            {/* language selector hidden on this screen */}
          </View>

          <Text style={styles.questionTitle}>{questionNumber}</Text>
          {question && (
            <Text
              style={[styles.questionText, { fontSize: 20, fontWeight: "500" }]}
            >
              {question}
            </Text>
          )}
          {subtitle && <Text style={styles.questionSubtitle}>{subtitle}</Text>}

          <View style={{ flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ marginTop: 8 }}>
                {options.map((opt, idx) => {
                  const isSelected = selected.includes(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      activeOpacity={0.9}
                      style={[
                        styles.option,
                        isSelected && styles.optionSelected,
                      ]}
                      onPress={() => toggleOption(opt)}
                    >
                      <View
                        style={[
                          styles.optionIndex,
                          isSelected && styles.optionIndexSelected,
                        ]}
                      >
                        <Text style={styles.optionIndexText}>
                          {String(idx + 1)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.optionText}>{opt}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View />
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
  /* langButton removed for screens other than QuestionScreen1 */
  questionTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Inter",
  },
  questionText: {
    color: "#fff",
    fontSize: 20,
    marginTop: 6,
    marginBottom: 16,
    textAlign: "left",
    alignSelf: "stretch",
    fontFamily: "Inter",
  },
  questionSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 12,
    textAlign: "left",
    alignSelf: "stretch",
    fontWeight: "400",
    fontFamily: "Inter",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionSelected: {
    backgroundColor: "rgba(99,169,106,0.95)",
    borderColor: "#63a96a",
  },
  optionIndex: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#63a96a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionIndexSelected: { backgroundColor: "#90b855" },
  optionIndexText: { color: "#fff", fontWeight: "800", fontFamily: "Inter" },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
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
  continueText: {
    color: "#63a96a",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
  },
});

export default QuestionScreen9;
