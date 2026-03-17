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

const QuestionScreen11: React.FC<Props> = ({
  onNext = () => {},
  onBack,
  current = 11,
  total = 11,
}) => {
  const { width: deviceWidth } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const puff = usePuff();
  const [value, setValue] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD $");
  const [showCurrencyList, setShowCurrencyList] = useState<boolean>(false);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const savingRef = useRef(false);
  const saveTimerRef = useRef<any>(null);
  const scrollRef = useRef<any>(null);
  const valueWrapY = useRef<number>(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const currencies = [
    "USD $",
    "GHS ¢",
    "GBP £",
    "EUR €",
    "NGN ₦",
    "CAD $",
    "AUD $",
    "NZD $",
    "INR ₹",
    "CNY ¥",
    "JPY ¥",
    "KRW ₩",
    "BRL R$",
    "MXN $",
    "SAR ر",
  ];

  useEffect(() => {
    try {
      const locale =
        Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.locale ||
        Intl?.DateTimeFormat()?.resolvedOptions()?.locale ||
        "en-US";
      const parts = String(locale).split(/[-_]/);
      const country = (parts[1] || parts[0] || "US").toUpperCase();
      setDetectedCountry(country);
      const mapping: Record<string, string> = {
        US: "USD $",
        GB: "GBP £",
        NG: "NGN ₦",
        GH: "GHS ¢",
        FR: "EUR €",
        DE: "EUR €",
        ES: "EUR €",
        IT: "EUR €",
        BE: "EUR €",
        NL: "EUR €",
        PT: "EUR €",
        CA: "CAD $",
        AU: "AUD $",
        NZ: "NZD $",
        IN: "INR ₹",
        CN: "CNY ¥",
        JP: "JPY ¥",
        KR: "KRW ₩",
        BR: "BRL R$",
        MX: "MXN $",
        SA: "SAR ر",
      };
      const detected = mapping[country] || "USD $";
      // if our list contains the detected currency, use it; otherwise default to USD
      const found = currencies.includes(detected) ? detected : "USD $";
      setCurrency(found);
      // persist detected currency (save only code portion like 'USD')
      try {
        const code = String(found).split(" ")[0];
        puff.saveOnboardingAnswer("currency", code).catch(() => {});
      } catch {}
    } catch {}
  }, []);

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
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    if (isNaN(num)) {
      return;
    }
    savingRef.current = true;
    try {
      await puff.saveOnboardingAnswer("pricePerCartridge", num);
      try {
        const code = String(currency).split(" ")[0];
        await puff.saveOnboardingAnswer("currency", code);
      } catch {}
    } catch {}
    savingRef.current = false;
    onNext && onNext();
  };

  const canContinue = () => !!String(value).trim();

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

          <TouchableOpacity style={styles.langButton}>
            <Text style={styles.langText}>EN</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 180 + keyboardHeight }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.questionTitle}>Question 11</Text>
            <Text style={styles.question}>I pay</Text>

            <View
              style={styles.inputRow}
              onLayout={(e) => {
                valueWrapY.current = e.nativeEvent.layout.y;
              }}
            >
              <TouchableOpacity
                style={styles.currencyBox}
                activeOpacity={0.85}
                onPress={() => setShowCurrencyList((s) => !s)}
              >
                <Text style={styles.currencyText}>{currency}</Text>
              </TouchableOpacity>

              <TextInput
                value={value}
                onChangeText={(t) => {
                  const cleaned = t.replace(/[^0-9.]/g, "");
                  setValue(cleaned);
                  try {
                    if (saveTimerRef.current)
                      clearTimeout(saveTimerRef.current);
                  } catch {}
                  saveTimerRef.current = setTimeout(async () => {
                    try {
                      const num = parseFloat(
                        String(cleaned).replace(/[^0-9.]/g, ""),
                      );
                      if (!isNaN(num)) {
                        await puff.saveOnboardingAnswer(
                          "pricePerCartridge",
                          num,
                        );
                      }
                    } catch {}
                  }, 700);
                }}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleNext}
                placeholder="0.00"
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.valueInput}
                onFocus={() => {
                  setTimeout(() => {
                    try {
                      scrollRef.current?.scrollTo({
                        y: Math.max(0, valueWrapY.current - 40),
                        animated: true,
                      });
                    } catch {}
                  }, 80);
                }}
              />
            </View>

            {showCurrencyList && (
              <View style={styles.currencyOptions}>
                {currencies.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.currencyOption}
                    onPress={async () => {
                      setCurrency(c);
                      setShowCurrencyList(false);
                      try {
                        const code = String(c).split(" ")[0];
                        await puff.saveOnboardingAnswer("currency", code);
                      } catch {}
                    }}
                  >
                    <Text style={styles.currencyOptionText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.unitText}>per cartridge</Text>

            {/* detected country display removed per request */}
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
            <Text style={styles.continueText}>Continue</Text>
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
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  currencyBox: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 12,
  },
  currencyText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  valueInput: {
    width: 140,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(0,0,0,0.04)",
    color: "#fff",
    fontSize: 20,
    paddingHorizontal: 12,
    textAlign: "left",
  },
  currencyOptions: { marginTop: 8 },
  currencyOption: {
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  currencyOptionText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  unitText: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 6 },
  detectedText: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8 },
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

export default QuestionScreen11;
