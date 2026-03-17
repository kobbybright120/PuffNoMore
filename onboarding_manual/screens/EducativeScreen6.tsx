import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import StarryBackground from "../components/StarryBackground";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePuff } from "../../src/context/PuffContext";

type Props = {
  onNext?: () => void;
  onBack?: () => void;
};

export default function EducativeScreen6({ onNext }: Props) {
  const { width: deviceWidth } = useWindowDimensions();
  const puff = usePuff();
  const [annualCostText, setAnnualCostText] = useState<string | null>(null);
  const [annualAmount, setAnnualAmount] = useState<string | null>(null);
  const [debugPrice, setDebugPrice] = useState<number | null>(null);
  const [debugDaily, setDebugDaily] = useState<number | null>(null);
  const [debugCurrency, setDebugCurrency] = useState<string | null>(null);
  const computeFrom = (resp: Record<string, any>) => {
    try {
      const price = parseFloat(String(resp.pricePerCartridge ?? "0")) || 0;
      const dailyRaw = parseFloat(String(resp.cigarettesPerDay ?? "0")) || 0;
      const currencyCode = String(resp.currency || "GHS");
      const nicotineForm: string[] = Array.isArray(resp.nicotine_form)
        ? resp.nicotine_form
        : typeof resp.nicotine_form === "string"
          ? [resp.nicotine_form]
          : [];

      const symbolMap: Record<string, string> = {
        USD: "$",
        GHS: "¢",
        GBP: "£",
        EUR: "€",
        NGN: "₦",
        CAD: "$",
        AUD: "$",
        NZD: "$",
        INR: "₹",
        CNY: "¥",
        JPY: "¥",
        KRW: "₩",
        BRL: "R$",
        MXN: "$",
        SAR: "ر",
      };
      const sym = symbolMap[currencyCode] || "¢";

      // Interpretation: if user selected Vaping, treat dailyRaw as puffs/day.
      // If user selected Cigarettes, treat dailyRaw as cigarettes/day.
      // Fallback: assume cigarettes.
      const isVaping = nicotineForm.some((s) =>
        String(s).toLowerCase().includes("vaping"),
      );
      const isCigarettes = nicotineForm.some((s) =>
        String(s).toLowerCase().includes("cigarette"),
      );

      const PUFFS_PER_CARTRIDGE = 250; // per spec
      const CIGARETTES_PER_PACK = 20; // per spec

      let dailySpend = 0;
      let dailyLabel = "times";
      let unitLabel = "unit";
      let priceLabel = `${sym}${price}`;

      if (isVaping && !isCigarettes) {
        // dailyRaw is number of puffs per day
        const puffsPerDay = dailyRaw;
        const fraction = puffsPerDay / PUFFS_PER_CARTRIDGE;
        dailySpend = fraction * price;
        dailyLabel = `${puffsPerDay}`;
        unitLabel = `cartridge`;
      } else if (isCigarettes && !isVaping) {
        // dailyRaw is cigarettes per day; price is per pack
        const cigsPerDay = dailyRaw;
        const fraction = cigsPerDay / CIGARETTES_PER_PACK;
        dailySpend = fraction * price;
        dailyLabel = `${cigsPerDay}`;
        unitLabel = `pack`;
      } else if (isVaping && isCigarettes) {
        // if both selected prefer cigarettes interpretation
        const cigsPerDay = dailyRaw;
        const fraction = cigsPerDay / CIGARETTES_PER_PACK;
        dailySpend = fraction * price;
        dailyLabel = `${cigsPerDay}`;
        unitLabel = `pack`;
      } else {
        // unknown: treat as cigarettes by default
        const cigsPerDay = dailyRaw;
        const fraction = cigsPerDay / CIGARETTES_PER_PACK;
        dailySpend = fraction * price;
        dailyLabel = `${cigsPerDay}`;
        unitLabel = `pack`;
      }

      const yearly = dailySpend * 365;

      // formatting
      const dailyFmt = dailySpend.toFixed(2);
      const yearlyRounded = Math.round(yearly);

      // build amount and message
      if (dailySpend <= 0 || isNaN(dailySpend)) return null;
      const amountStr = ` ${sym}${yearlyRounded.toLocaleString()}`;
      const message = `At ${dailyLabel} times/day and ${sym}${price} per ${unitLabel}, you’re spending ${sym}${dailyFmt} daily. That adds up to ${sym}${yearlyRounded} a year — money gone up in smoke.`;
      return {
        amount: amountStr,
        message,
        debug: {
          interpretation:
            isVaping && !isCigarettes
              ? "vaping(puffs)"
              : isCigarettes && !isVaping
                ? "cigarettes"
                : isVaping && isCigarettes
                  ? "cigarettes(prefer)"
                  : "cigarettes(fallback)",
          price,
          dailyRaw,
          currencyCode,
        },
      } as any;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let result = computeFrom(puff.onboardingResponses || {});
        if (!result) {
          // fallback to persisted onboarding answers
          try {
            const raw = await AsyncStorage.getItem("puff:onboardingResponses");
            if (raw) {
              const parsed = JSON.parse(raw || "{}");
              result = computeFrom(parsed || {});
            }
          } catch {}
        }

        if (result && typeof result === "object") {
          // only surface the short annual amount to users; keep detailed
          // message internal (not shown).
          setAnnualCostText(null);
          setAnnualAmount((result as any).amount || null);
          try {
            const dbg = (result as any).debug || {};
            setDebugPrice(dbg.price ?? null);
            setDebugDaily(dbg.dailyRaw ?? null);
            setDebugCurrency(dbg.currencyCode ?? null);
          } catch {
            setDebugPrice(null);
            setDebugDaily(null);
            setDebugCurrency(null);
          }
        } else {
          setAnnualCostText(result as any);
          setAnnualAmount(null);
          // set debug fields for inspection (best-effort)
          try {
            const resp = puff.onboardingResponses || {};
            const raw =
              (await AsyncStorage.getItem("puff:onboardingResponses")) || null;
            const persisted = raw ? JSON.parse(raw) : {};
            const src = Object.keys(resp).length ? resp : persisted;
            const price = parseFloat(String(src.pricePerCartridge ?? "0")) || 0;
            const daily = parseFloat(String(src.cigarettesPerDay ?? "0")) || 0;
            const currency = String(src.currency || "GHS");
            setDebugPrice(price || null);
            setDebugDaily(daily || null);
            setDebugCurrency(currency || null);
          } catch {}
        }
      } catch {
        setAnnualCostText(null);
      }
    })();
  }, [puff.onboardingResponses]);

  return (
    <StarryBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.failHeaderBlock}>
            <Text style={styles.highlightTitle}>Did you know?</Text>
            {annualCostText ? (
              <Text style={[styles.failHeaderSubtitle, { textAlign: "left" }]}>
                {annualCostText}
              </Text>
            ) : annualAmount ? (
              <View style={{ alignSelf: "stretch" }}>
                <Text
                  style={[styles.failHeaderSubtitle, { textAlign: "left" }]}
                >
                  In the next one year, without change, you will spend{" "}
                  {annualAmount} on smoking/vaping!
                </Text>
                <Text
                  style={[
                    styles.failHeaderSubtitle,
                    { textAlign: "left", marginTop: 10 },
                  ]}
                >
                  It&apos;s time to start saving now.
                </Text>
              </View>
            ) : null}

            {/* Debug UI removed */}
          </View>

          <View style={{ alignSelf: "stretch" }}>
            <Image
              source={(function () {
                try {
                  // use image shipped with extracted animations
                  return require("../../assets/animations/extracted/images/save-money.jpg");
                } catch {
                  try {
                    return require("../../assets/images/save-money.jpg");
                  } catch {
                    return {
                      uri: "https://images.unsplash.com/photo-1582719478250-7d2f2f6b7d9b?w=1200&q=80",
                    };
                  }
                }
              })()}
              style={[styles.imagePlaceholder, { width: "100%" }]}
              resizeMode="cover"
            />
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>

        <View style={styles.bottomTab} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => onNext && onNext()}
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              { width: Math.min(420, deviceWidth - 48) },
            ]}
          >
            <Text style={styles.continueButtonText}>SAVE MY MONEY</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 140,
  },
  failHeaderBlock: {
    backgroundColor: "rgba(34,197,94,0.10)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
    alignItems: "flex-start",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  failHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22c55e",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.2,
    fontFamily: "Inter",
  },
  failHeaderSubtitle: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
    lineHeight: 22,
    fontWeight: "400",
    fontFamily: "Inter",
  },
  highlightTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ff9a5a",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Inter",
  },
  chartContainer: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 14,
    textAlign: "center",
    fontFamily: "Inter",
  },
  infoContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "rgba(34,197,94,0.13)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  infoText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: 0.1,
    fontFamily: "Inter",
  },
  imagePlaceholder: {
    height: 140,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  continueButton: {
    backgroundColor: "#63a96a",
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  bottomTab: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    alignItems: "center",
  },
});
