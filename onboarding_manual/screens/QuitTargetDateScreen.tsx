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
import CommitmentBackground from "../../src/components/CommitmentBackground202";

export default function QuitTargetDateScreen({ onBack, onNext }: any) {
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
    if (onNext) onNext();
  };

  return (
    <CommitmentBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Quit Date</Text>
          <View style={styles.headerSpacer} />
        </View>
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
              Dff, we've made you a custom plan.
            </Text>
            <Text style={styles.subtext}>You will quit porn by:</Text>
            <View style={styles.leadCard}>
              <Text style={styles.leadCardText}>May 3, 2026</Text>
            </View>
            <View style={styles.decorativeLine} />
            <View style={styles.laurelStarsRow}>
              {/* Placeholder laurels, replace with image if available */}
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
                style={{ marginLeft: 8 }}
              />
            </View>
            <Text style={styles.motivationalText}>
              Become the best version of yourself with QUITTR
            </Text>
            <Text style={styles.motivationalSubtext}>
              Strong, Healthier, Happier
            </Text>
          </View>

          {/* Benefit Tags */}
          <View style={styles.tagsContainer}>
            {[
              "Increased Testosterone",
              "Prevent Erectile Dysfunction",
              "Increased Energy",
              "Increased Motivation",
              "Improved Focus",
              "Improved Relationships",
              "Increased Confidence",
            ].map((benefit, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor: [
                      "#4a7c8a",
                      "#8a7a4a",
                      "#2d6b4a",
                      "#7a4a7c",
                      "#4a7c6b",
                      "#7c4a4a",
                      "#6b7c4a",
                    ][index],
                  },
                ]}
              >
                <Text style={styles.tagText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require("../../assets/testimonials/casual-dressed-man-mockup-psd-playing-with-phone-outdoor-photoshoot_53876-1082530.jpg")}
              style={styles.illustration}
              resizeMode="contain"
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
                Build unbreakable self control
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#9333EA" }]}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Become more attractive and confident
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#22C55E" }]}>
                <Ionicons name="trending-up" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>Boost your self-worth</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.iconCircle, { backgroundColor: "#EAB308" }]}>
                <Ionicons name="medal" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.benefitText}>
                Fill each day with pride and happiness
              </Text>
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
              'All this time my social anxiety was just because I was secretly
              ashamed of my porn problem. I never want to feel that small
              again.'
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
            <Text style={styles.benefitsTitle}>
              Restore your natural sex drive
            </Text>
            <View style={styles.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#22C55E"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.benefitRowText}>
                Rewire your brain to prefer real sex
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
                Reverse porn-induced desensitization
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons
                name="heart"
                size={24}
                color="#3B82F6"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.benefitRowText}>
                Enjoy healthy and satisfying intimacy
              </Text>
            </View>
          </View>

          {/* Take Back Control Component */}
          <View style={styles.takeBackControlSection}>
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
                Learn to redirect harmful cravings
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
                Regain focus and motivation
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
                Find real joy and satisfaction in life
              </Text>
            </View>
            <View style={{ height: 24 }} />

            <View style={styles.takeBackStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={28} color="#FBBF24" />
              ))}
            </View>
            <Text style={styles.takeBackTestimonialQuote}>
              'I had started to dread having sex with my girlfriend because I
              was so anxious all the time. But now our sex is so good it's made
              our relationship much stronger.'
            </Text>
            <Text style={styles.testimonialAuthor}>Anonymous</Text>
            <View style={styles.specialDiscountSection}>
              <Text style={styles.specialDiscountTitle}>Special Discount!</Text>
              <Text style={styles.specialDiscountSubtitle}>
                Get 80% off on QUITTR premium!
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
            <Text style={styles.ctaButtonText}>Become a QUITTR</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>Purchase appears Discretely</Text>
          <Text style={styles.cancelText}>
            Cancel anytime✅ Finally Quit Porn🛡️
          </Text>
        </View>
      </SafeAreaView>
    </CommitmentBackground>
  );
}

const styles = StyleSheet.create({
  takeBackControlSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
  },
  takeBackIllustrationContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  takeBackIllustration: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  takeBackTitle: {
    color: "#fff",
    fontSize: 24,
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
  },
  testimonialSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
  },
  testimonialQuote: {
    color: "#fff",
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
    marginHorizontal: 12,
  },
  testimonialAuthor: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  chartIllustrationContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  chartIllustration: {
    width: 120,
    height: 80,
    marginBottom: 8,
  },
  benefitsTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  benefitListSection: {
    width: "100%",
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginHorizontal: 8,
  },
  benefitRowText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
  },
  checkmarkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  laurelStarsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  motivationalText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  motivationalSubtext: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.85,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 32,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  illustration: {
    width: 256,
    height: 200,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 32,
  },
  benefitsList: {
    gap: 16,
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 26,
    textAlign: "left",
    marginTop: 2,
    marginBottom: 2,
    letterSpacing: 0.2,
    backgroundColor: "transparent",
    // Add shadow for contrast if needed
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: "center",
    marginBottom: 32,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "transparent",
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e5c6e",
  },
  disclaimer: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 8,
  },
  cancelText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
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
  },
  specialDiscountSubtitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
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
