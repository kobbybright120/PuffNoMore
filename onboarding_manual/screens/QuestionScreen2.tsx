import React, { useState, useRef } from "react";
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

const { width, height } = Dimensions.get("window");

const QuestionScreen2: React.FC<any> = ({
  questionNumber = "Question 2",
  question,
  subtitle,
  onNext,
  onBack,
  current = 1,
  total = 10,
}) => {
  const puff = usePuff();
  const [selected, setSelected] = useState<string | null>(null);

  const options = ["Male", "Female", "Other"];

  const savingRef = useRef(false);

  const handleSelect = async (opt: string) => {
    if (savingRef.current) return;
    setSelected(opt);
    savingRef.current = true;
    try {
      await puff.saveOnboardingAnswer("gender", opt);
    } catch {}
    savingRef.current = false;
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

            <TouchableOpacity style={styles.langButton}>
              <Text style={styles.langText}>EN</Text>
            </TouchableOpacity>
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

          <View style={{ marginTop: 8 }}>
            {options.map((opt, idx) => {
              const isSelected = selected === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.9}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(opt)}
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
                  <Text style={styles.optionText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 120 }} />
        </View>

        {/* Continue button removed: option tap advances */}
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
  progressContainer: { flex: 1, paddingHorizontal: 0 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    overflow: "hidden",
    marginRight: 6,
  },
  progressFill: { height: "100%", backgroundColor: "#63a96a" },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginLeft: 8,
  },
  langText: { color: "#fff", fontWeight: "700", fontFamily: "Inter" },
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
    fontFamily: "Inter",
    fontWeight: "400",
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
  optionIndexTextSelected: { color: "#111827" },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  skipButton: { paddingVertical: 14, alignItems: "center" },
  bottomTab: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter",
  },
});

export default QuestionScreen2;
