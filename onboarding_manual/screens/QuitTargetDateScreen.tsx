import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import StarryBackground from "../components/StarryBackground";
import { usePuff } from "../../src/context/PuffContext";
import OnboardingLottie from "../../src/components/OnboardingLottie";

export default function QuitTargetDateScreen({ _onBack, onNext }: any) {
  const puff = usePuff();
  const navigation: any = useNavigation();
  const userName =
    puff?.onboardingResponses &&
    (puff.onboardingResponses.fullName || puff.onboardingResponses.name);
  const reductionStartRaw =
    puff?.onboardingResponses && puff.onboardingResponses.reductionStartDate;
  const baseline = Number(
    (puff?.onboardingResponses && puff.onboardingResponses.cigarettesPerDay) ||
      0,
  );
  const reductionPerWeek = 2;
  const quitDateFormatted = React.useMemo(() => {
    if (!baseline || baseline <= 0) return "—";
    try {
      // Determine start date: prefer stored reductionStartDate, else use today
      let start: Date | null = null;
      if (reductionStartRaw) {
        try {
          const s = String(reductionStartRaw).trim();
          const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (m) {
            const y = Number(m[1]);
            const mo = Number(m[2]) - 1;
            const d = Number(m[3]);
            start = new Date(y, mo, d);
          } else {
            const parsed = new Date(s);
            if (!isNaN(parsed.getTime())) start = parsed;
          }
        } catch {
          start = null;
        }
      }
      if (!start) start = new Date();

      const weeksNeeded = Math.ceil(baseline / reductionPerWeek);
      const d = new Date(start);
      d.setDate(d.getDate() + weeksNeeded * 7);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  }, [reductionStartRaw, baseline]);

  // Persist today's date as reductionStartDate if none is stored,
  // so the app always has a start date recorded.
  React.useEffect(() => {
    if (!puff.onboardingResponses?.reductionStartDate) {
      try {
        const today = new Date();
        const isoDateOnly = today.toISOString().slice(0, 10); // YYYY-MM-DD
        puff.saveOnboardingAnswer("reductionStartDate", isoDateOnly);
      } catch {
        // ignore persistence failures
      }
    }
  }, [puff.onboardingResponses?.reductionStartDate, puff]);
  const handleContinue = () => {
    if (Platform.OS === "android") {
      ToastAndroid.show(
        "Allow PuffNoMore to send you notification",
        ToastAndroid.LONG,
      );
    } else {
      Alert.alert(
        "Notification Permission",
        "Allow PuffNoMore to send you notification",
      );
    }
    // End onboarding and navigate into the main app
    try {
      navigation.reset({ index: 0, routes: [{ name: "RootTabs" }] });
    } catch {
      try {
        navigation.navigate("RootTabs");
      } catch {
        // fallback: advance onboarding if navigation unavailable
        if (onNext) onNext();
      }
    }
  };

  // benefit tags and a safe color palette (use modulo to handle any length)
  const benefitTags = [
    "Healthier skin & appearance",
    "Lower heart disease risk",
    "Better lung function",
    "Lower heart disease risk",
    "More energy & stamina",
    "Improved taste & smell",
    "Better sleep & mood",
    "Save money every week",
  ];
  const benefitColors = [
    "#4a7c8a",
    "#8a7a4a",
    "#2d6b4a",
    "#7a4a7c",
    "#4a7c6b",
    "#7c4a4a",
    "#6b7c4a",
  ];

  return (
    <StarryBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Onboarding header section */}
          <View style={styles.headerSection}>
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={32} color="#fff" />
            </View>
            <Text style={styles.mainMessage}>
              {userName
                ? `${userName}, we've made you a custom plan.`
                : "Dff, we've made you a custom plan."}
            </Text>
            <Text style={styles.subtext}>You will quit smoking by:</Text>
            <View style={styles.leadCard}>
              <Text style={styles.leadCardText}>{quitDateFormatted}</Text>
            </View>
            <View style={styles.decorativeLine} />
            <View style={styles.laurelStarsRow}>
              <Ionicons
                name="leaf"
                size={28}
                color="#ccc"
                style={{ marginRight: 8 }}
              />
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={28} color="#FBBF24" />
              ))}
              <Ionicons
                name="leaf"
                size={28}
                color="#ccc"
                style={{ marginLeft: 8, transform: [{ scaleX: -1 }] }}
              />
            </View>
            <Text style={styles.motivationalText}>
              Become the best version of yourself with PuffNoMore
            </Text>
            <Text style={styles.motivationalSubtext}>
              Strong, Healthier, Happier
            </Text>
          </View>

          {/* Benefit Tags */}
          <View style={styles.tagsContainer}>
            {benefitTags.map((benefit, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor:
                      benefitColors[index % benefitColors.length],
                  },
                ]}
              >
                <Text style={styles.tagText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <OnboardingLottie
              animationKey="QuitDateScreenLottie"
              style={{ lottieWidth: 220, lottieHeight: 220 }}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Conquer yourself</Text>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#3B82F6" }]}>
                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Reduce your smoking gradually
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#9333EA" }]}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Strengthen your self-control
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#22C55E" }]}>
                <Ionicons name="trending-up" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>Build confidence daily</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#EAB308" }]}>
                <Ionicons name="medal" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Feel proud of your progress
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#22C55E" }]}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>Become nicotine-free</Text>
            </View>
          </View>

          {/* 5 Stars */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name="star" size={28} color="#FBBF24" />
            ))}
          </View>

          {/* Testimonial & Chart Section */}
          <View style={styles.testimonialSection}>
            <Text style={styles.testimonialQuote}>
              'For a long time, I felt controlled by my smoking habit. But by
              reducing it step by step, I rebuilt my confidence and took back
              control. I never want to feel that dependent again.'
            </Text>
            <Text style={styles.testimonialAuthor}>Anonymous</Text>
            <View style={styles.chartIllustrationContainer}>
              <Image
                source={require("../../assets/animations/growBarsSequential.json")}
                style={styles.chartIllustration}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Restore Sex Drive Benefits */}
          <View style={styles.benefitListSection}>
            <OnboardingLottie
              animationKey="gradualReduction"
              style={{
                lottieWidth: 260,
                lottieHeight: 140,
                marginTop: -12,
                marginBottom: 8,
              }}
            />
            <Text style={styles.benefitsTitle}>
              Become Free from Nicotine Again
            </Text>
            <View style={styles.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#22C55E"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.benefitRowText}>
                Feel your body recover with every step
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons
                name="settings"
                size={24}
                color="#9333EA"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.benefitRowText}>
                Break free from nicotine control
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons
                name="time"
                size={24}
                color="#3B82F6"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.benefitRowText}>
                Reduce smoking without overwhelming yourself
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons
                name="trophy"
                size={24}
                color="#FBBF24"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.benefitRowText}>
                Become fully smoke-free over time
              </Text>
            </View>
          </View>

          {/* Take Back Control Component */}
          <View style={styles.takeBackControlSection}>
            <OnboardingLottie
              animationKey="hero"
              style={{ lottieWidth: 260, lottieHeight: 140, marginBottom: 8 }}
            />
            <View style={styles.takeBackIllustrationContainer}>
              <Image
                source={require("../../assets/animations/fadeInLogo.json")}
                style={styles.takeBackIllustration}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.takeBackTitle}>Take back control</Text>
            <View style={styles.benefitRow}>
              <Ionicons
                name="arrow-forward-circle"
                size={24}
                color="#22C55E"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.benefitRowText}>
                Reclaim control from nicotine
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons
                name="radio-button-on"
                size={24}
                color="#EF4444"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.benefitRowText}>
                Reshape your cravings over time
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons
                name="cube"
                size={24}
                color="#3B82F6"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.benefitRowText}>
                Return to clarity and focus
              </Text>
            </View>
            <View style={{ height: 24 }} />

            <View style={styles.takeBackStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={28} color="#FBBF24" />
              ))}
            </View>
            <Text style={styles.takeBackTestimonialQuote}>
              'For years, smoking kept me trapped in anxiety and low energy. I
              didn’t realize how much it was stealing from my confidence and
              relationships. Quitting gave me back control now I feel stronger,
              more connected, and free.'
            </Text>
            <Text style={styles.testimonialAuthor}>Anonymous</Text>
            <View style={styles.specialDiscountSection}>
              <Text style={styles.specialDiscountTitle}>Special Discount!</Text>
              <Text style={styles.specialDiscountSubtitle}>
                Get 80% off on PuffNomore premium!
              </Text>
              <TouchableOpacity
                style={styles.specialDiscountButton}
                activeOpacity={0.8}
              >
                <Text style={styles.specialDiscountButtonText}>Claim Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.ctaButtonText}>Become a PuffnoMore</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>Purchase appears Discretely</Text>
          <Text style={styles.cancelText}>
            Cancel anytime✅ Finally Quit Smoking🛡️
          </Text>
        </View>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  takeBackControlSection: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
  },
  takeBackIllustrationContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  takeBackIllustration: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  takeBackTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  takeBackStarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: "center",
    marginBottom: 16,
  },
  takeBackTestimonialQuote: {
    color: "#fff",
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
    marginHorizontal: 12,
    fontFamily: "Inter",
  },
  testimonialSection: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
  },
  testimonialQuote: {
    color: "#fff",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
    marginHorizontal: 10,
    fontFamily: "Inter",
  },
  testimonialAuthor: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  chartIllustrationContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  chartIllustration: {
    width: 140,
    height: 90,
    marginBottom: 8,
  },
  benefitsTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  benefitListSection: {
    width: "100%",
    marginBottom: 18,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 6,
  },
  benefitRowText: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 12,
  },
  checkmarkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  laurelStarsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  motivationalText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 4,
    fontFamily: "Inter",
  },
  motivationalSubtext: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 12,
    fontFamily: "Inter",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Inter",
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 18,
  },
  illustration: {
    width: 220,
    height: 180,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Inter",
  },
  benefitsList: {
    gap: 12,
    marginBottom: 18,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    paddingVertical: 6,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 22,
    textAlign: "left",
    marginTop: 0,
    marginBottom: 0,
    letterSpacing: 0.2,
    backgroundColor: "transparent",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.5,
    fontFamily: "Inter",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: "center",
    marginBottom: 20,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1e5c6e",
    fontFamily: "Inter",
  },
  disclaimer: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Inter",
  },
  cancelText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    fontFamily: "Inter",
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  headerSpacer: { width: 40 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    alignItems: "center",
  },
  titleLarge: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    fontFamily: "Inter",
    marginBottom: 8,
  },
  subtext: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    fontFamily: "Inter",
  },
  leadCardContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  leadCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  leadCardText: {
    color: "#222",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "bold",
  },
  decorativeLine: {
    width: 256,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 32,
    alignSelf: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 8,
  },
  footerText: {
    color: "#ffffff",
    fontSize: 15,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    opacity: 0.85,
    fontFamily: "Inter",
  },
  mainMessage: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 8,
  },
  subMessage: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  badgesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 384,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  subtextBold: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: "Inter",
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  specialDiscountSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  specialDiscountTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
    fontFamily: "Inter",
  },
  specialDiscountSubtitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Inter",
  },
  specialDiscountButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  specialDiscountButtonText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
