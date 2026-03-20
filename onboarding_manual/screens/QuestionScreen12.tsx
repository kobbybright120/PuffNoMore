import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  TextInput,
  ScrollView,
  Keyboard,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import GreenGradientBackground from "../components/GreenGradientBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePuff } from "../../src/context/PuffContext";

interface Props {
  onNext?: () => void;
  onBack?: () => void;
  current?: number;
  total?: number;
}

const { height } = Dimensions.get("window");

const QuestionScreen12: React.FC<Props> = ({
  onNext = () => {},
  onBack,
  current = 12,
  total = 12,
}) => {
  const { width: deviceWidth } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const puff = usePuff();
  const [value, setValue] = useState<string>(
    String(puff.onboardingResponses?.quitReason || ""),
  );
  const saveTimerRef = useRef<any>(null);
  const savingRef = useRef(false);
  const scrollRef = useRef<any>(null);
  const inputY = useRef<number>(0);
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

  const handleNext = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      await puff.saveOnboardingAnswer("quitReason", String(value).trim());
    } catch {}
    savingRef.current = false;
    onNext && onNext();
  };

  return (
    <GreenGradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (onBack) return onBack();
              try {
                if (
                  navigation &&
                  navigation.canGoBack &&
                  navigation.canGoBack()
                ) {
                  navigation.goBack();
                }
              } catch {}
            }}
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

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 180 + keyboardHeight }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.questionTitle}>Finally</Text>
            <Text style={styles.question}>Why do you want to quit?</Text>

            <Text style={styles.instruction}>
              Type a brief reason that will help remind you when you need
              support.
            </Text>

            <TextInput
              value={value}
              onChangeText={(t) => {
                setValue(t);
                try {
                  if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                } catch {}
                saveTimerRef.current = setTimeout(async () => {
                  try {
                    await puff.saveOnboardingAnswer(
                      "quitReason",
                      String(t).trim(),
                    );
                  } catch {}
                }, 700);
              }}
              placeholder="e.g. For my children, for better health, to save money"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.multilineInput}
              multiline
              numberOfLines={5}
              onFocus={() => {
                setTimeout(() => {
                  try {
                    scrollRef.current?.scrollTo({
                      y: Math.max(0, inputY.current - 40),
                      animated: true,
                    });
                  } catch {}
                }, 80);
              }}
              onLayout={(e) => (inputY.current = e.nativeEvent.layout.y)}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomTab} pointerEvents="box-none">
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              { width: Math.min(420, deviceWidth - 48) },
              !String(value).trim() && { opacity: 0.5 },
            ]}
            disabled={!String(value).trim()}
          >
            <Text style={styles.continueText}>Analyze My Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GreenGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    flex: 1,
    minHeight: height,
  },
  question: {
    color: "#fff",
    fontSize: 20,
    marginTop: 6,
    marginBottom: 16,
    textAlign: "left",
    alignSelf: "stretch",
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
  instruction: {
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(0,0,0,0.04)",
    color: "#fff",
    fontSize: 16,
    padding: 12,
    textAlignVertical: "top",
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

export default QuestionScreen12;
