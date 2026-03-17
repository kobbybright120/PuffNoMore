import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GreenGradientBackground from "../components/GreenGradientBackground";
import { usePuff } from "../../src/context/PuffContext";

const QuestionScreen10: React.FC<any> = ({
  questionNumber = "Question 10",
  question = "When did you start smoking/vaping and how much do you typically consume each day?",
  subtitle = "",
  onNext,
  onBack,
  current = 10,
  total = 10,
}) => {
  const puff = usePuff();
  const [startYear, setStartYear] = useState<string>("");
  const [daily, setDaily] = useState<string>("");
  const savingRef = useRef(false);
  const scrollRef = useRef<any>(null);
  const startWrapY = useRef<number>(0);
  const dailyWrapY = useRef<number>(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = (e: any) => setKeyboardHeight(e.endCoordinates?.height || 0);
    const hide = () => setKeyboardHeight(0);
    const s1 = Keyboard.addListener("keyboardDidShow", show);
    const s2 = Keyboard.addListener("keyboardDidHide", hide);
    return () => {
      try {
        s1.remove();
      } catch {}
      try {
        s2.remove();
      } catch {}
    };
  }, []);

  const handleContinue = async () => {
    if (savingRef.current) return;
    // basic validation + flexible parsing:
    // allow either a 4-digit start year (e.g. 2008) or a "years ago" value (e.g. 5)
    const curYr = new Date().getFullYear();
    const y = parseInt(startYear, 10);
    const d = parseInt(daily, 10);

    let startYearToSave: number | null = null;
    let yearsSmoking: number | null = null;

    if (startYear) {
      if (isNaN(y)) return; // invalid
      if (y >= 1900 && y <= curYr) {
        // user entered a year
        startYearToSave = y;
        yearsSmoking = Math.max(0, curYr - y);
      } else if (y >= 0 && y <= 200) {
        // treat as "years ago"
        yearsSmoking = y;
        startYearToSave = Math.max(0, curYr - y);
      } else {
        return; // out of reasonable range
      }
    }

    if (daily && (isNaN(d) || d < 0)) {
      return;
    }

    savingRef.current = true;
    try {
      if (startYearToSave !== null) {
        await puff.saveOnboardingAnswer("startYear", startYearToSave);
      }
      if (yearsSmoking !== null) {
        await puff.saveOnboardingAnswer("yearsSmoking", yearsSmoking);
      }
      if (daily && !isNaN(d)) {
        await puff.saveOnboardingAnswer("cigarettesPerDay", d);
        try {
          await puff.setTotalPuffs(d);
        } catch {}
      }
    } catch {
      // ignore persistence errors
    }
    savingRef.current = false;
    onNext && onNext();
  };

  const canContinue = () => {
    // Enable continue as soon as both inputs have values; keep strict
    // validation in handleContinue to avoid blocking the button UX.
    return !!String(startYear).trim() && !!String(daily).trim();
  };

  return (
    <GreenGradientBackground>
      <SafeAreaView style={styles.container}>
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
            <Text style={[styles.questionText, { fontSize: 20 }]}>
              {question}
            </Text>
          )}
          {subtitle && <Text style={styles.questionSubtitle}>{subtitle}</Text>}

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ paddingBottom: 180 + keyboardHeight }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ marginTop: 8 }}>
              <Text style={styles.sectionTitle}>I started smoking/vaping</Text>
              <View
                style={styles.rowCenter}
                onLayout={(e) => {
                  startWrapY.current = e.nativeEvent.layout.y;
                }}
              >
                <TextInput
                  style={styles.numberBox}
                  keyboardType="number-pad"
                  placeholder=""
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={startYear}
                  onChangeText={(t) =>
                    setStartYear(String(t).replace(/[^0-9]/g, ""))
                  }
                  maxLength={4}
                  onFocus={() => {
                    setTimeout(() => {
                      try {
                        scrollRef.current?.scrollTo({
                          y: Math.max(0, startWrapY.current - 40),
                          animated: true,
                        });
                      } catch {}
                    }, 80);
                  }}
                />
                <Text style={styles.unitText}>years ago</Text>
              </View>

              <View style={styles.separator} />

              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
                I typically consume
              </Text>
              <Text style={styles.subLabel}>cartridges / refills per</Text>
              <View
                style={[styles.rowCenter, { marginTop: 12 }]}
                onLayout={(e) => {
                  dailyWrapY.current = e.nativeEvent.layout.y;
                }}
              >
                <TextInput
                  style={styles.numberBox}
                  keyboardType="number-pad"
                  placeholder=""
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={daily}
                  onChangeText={(t) =>
                    setDaily(String(t).replace(/[^0-9]/g, ""))
                  }
                  maxLength={4}
                  onFocus={() => {
                    setTimeout(() => {
                      try {
                        scrollRef.current?.scrollTo({
                          y: Math.max(0, dailyWrapY.current - 40),
                          animated: true,
                        });
                      } catch {}
                    }, 80);
                  }}
                />
                <Text style={styles.unitText}>daily</Text>
              </View>
            </View>
          </ScrollView>

          <View style={{ flex: 1 }} />

          <View style={styles.bottomTab} pointerEvents="box-none">
            <TouchableOpacity
              style={[
                styles.continueButton,
                !canContinue() && { opacity: 0.5 },
              ]}
              onPress={handleContinue}
              accessibilityLabel="Continue"
              disabled={!canContinue()}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GreenGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    flex: 1,
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
    marginLeft: 8,
  },
  langText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Inter",
  },
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
    fontFamily: "Inter",
  },
  questionSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 12,
    textAlign: "left",
    fontWeight: "400",
    fontFamily: "Inter",
  },
  inputLabel: { color: "rgba(255,255,255,0.9)", marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: "#fff",
    fontSize: 18,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter",
    fontWeight: "600",
    marginBottom: 10,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  numberBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 24,
    padding: 0,
    textAlign: "center",
    fontFamily: "Inter",
  },
  unitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 18,
  },
  subLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontFamily: "Inter",
  },
  periodBox: {
    marginLeft: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  periodText: {
    color: "#fff",
    fontSize: 16,
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
  continueText: { color: "#63a96a", fontSize: 18, fontWeight: "700" },
});

export default QuestionScreen10;
