import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePuff } from "../../src/context/PuffContext";
import GreenGradientBackground from "../components/GreenGradientBackground";

const { width, height } = Dimensions.get("window");

// removed unused local types

const QuestionScreen1: React.FC<{
  questionNumber?: string;
  question?: string;
  subtitle?: string;
  onNext: () => void;
  onBack?: () => void;
  current?: number;
  total?: number;
  selected?: number | string;
  onSelect?: (val: number | string) => void;
}> = ({
  questionNumber = "Question 1",
  question,
  subtitle,
  onNext,
  onBack,
  current = 0,
  total = 10,
  selected,
  onSelect: _onSelect,
}) => {
  const [name, setName] = useState<string>(() =>
    selected && typeof selected === "string" ? String(selected) : "",
  );
  const puff = usePuff();
  const navigateTimer = useRef<any>(null);

  useEffect(() => {
    // no-op for now: preserved lifecycle
  }, [selected]);

  useEffect(() => {
    return () => {
      if (navigateTimer.current) clearTimeout(navigateTimer.current);
    };
  }, []);

  return (
    <GreenGradientBackground>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
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

          <View style={{ width: "100%", alignItems: "flex-start" }}>
            <TextInput
              value={name}
              onChangeText={(t) => setName(t)}
              placeholder="Alex"
              autoCapitalize="words"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.nameInput}
              returnKeyType="done"
              onSubmitEditing={async () => {
                // save and continue
                try {
                  const val = name.trim();
                  if (val) {
                    await puff.saveOnboardingAnswer("name", val);
                    await puff.saveOnboardingAnswer("fullName", val);
                  }
                } catch {}
                onNext();
              }}
            />
          </View>

          <View style={styles.optionsSpacing} />
          {/* branding removed */}
        </ScrollView>

        <View style={styles.bottomTab} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.skipButton, { opacity: name.trim() ? 1 : 0.6 }]}
            onPress={async () => {
              try {
                const val = name.trim();
                if (val) {
                  await puff.saveOnboardingAnswer("name", val);
                  await puff.saveOnboardingAnswer("fullName", val);
                }
              } catch {}
              onNext();
            }}
            disabled={!name.trim()}
          >
            <Text style={styles.skipText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GreenGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  radialSvg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
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
  iconText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
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
  nameInput: {
    width: Math.min(520, width - 48),
    height: 56,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter",
    textAlign: "left",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  options: { marginBottom: 24 },
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
  optionIndexSelected: {
    backgroundColor: "#90b855",
  },
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
  optionsSpacing: { height: 80 },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter",
  },
});

export default QuestionScreen1;
