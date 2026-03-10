import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CommitmentBackground from "../../src/components/CommitmentBackground202";

const testimonials = [
  {
    name: "Michael Stevens",
    avatar: require("../../assets/testimonials/casual-dressed-man-mockup-psd-playing-with-phone-outdoor-photoshoot_53876-1082530.jpg"),
    quote:
      "PuffNoMore’s progress tracker kept me motivated. Watching smoke-free days grow gave me pride and determination to continue.",
  },
  {
    name: "Tony Coleman",
    avatar: require("../../assets/testimonials/front-view-tired-man-gym.jpg"),
    quote:
      "The Craving Crusher tool gave me instant relief during urges. It felt supportive and helped me stay smoke-free longer.",
  },
  {
    name: "Sofia Ramos",
    avatar: require("../../assets/testimonials/medium-shot-girl-making-gum-balloon.jpg"),
    quote:
      "The delay timer was a game-changer. Instead of giving in right away, I learned to pause. Those few minutes often made the urge fade.",
  },
];

export default function RatingScreen({ onBack, onNext }: any) {
  const ANDROID_PACKAGE = "com.example.yourapp"; // adjust if you have a real package id
  const DEBUG_FORCE_FALLBACK_REVIEW = false;

  const openStoreForRating = async () => {
    try {
      const marketUrl = `market://details?id=${ANDROID_PACKAGE}`;
      const webUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
      try {
        await Linking.openURL(marketUrl);
      } catch {
        await Linking.openURL(webUrl);
      }
    } catch (e) {
      console.warn("openStoreForRating error:", e);
    }
  };

  const promptInAppReview = async () => {
    try {
      const StoreReview = require("expo-store-review");
      if (StoreReview && StoreReview.isAvailableAsync) {
        const available = await StoreReview.isAvailableAsync();
        if (available) {
          await StoreReview.requestReview();
          return true;
        }
      }
    } catch {
      // ignore - fallback to opening store
    }
    await openStoreForRating();
    return false;
  };

  const handleRateNow = async () => {
    try {
      if (Platform.OS === "web") {
        onNext && onNext();
        return;
      }

      let storeReviewAvailable = false;
      try {
        const StoreReview = require("expo-store-review");
        if (StoreReview && StoreReview.isAvailableAsync) {
          storeReviewAvailable = await StoreReview.isAvailableAsync();
        }
      } catch {
        storeReviewAvailable = false;
      }

      if (DEBUG_FORCE_FALLBACK_REVIEW) storeReviewAvailable = false;

      if (storeReviewAvailable) {
        try {
          await promptInAppReview();
        } catch (e) {
          console.warn(e);
        }
        try {
          Alert.alert("Thanks!", "Thanks for rating PuffNoMore.");
        } catch {}
        onNext && onNext();
        return;
      }

      const storeName = Platform.OS === "android" ? "Play Store" : "App Store";
      Alert.alert(
        "Enjoying PuffNoMore?",
        `Tap a star to rate it on the ${storeName}.`,
        [
          {
            text: "☆  ☆  ☆  ☆  ☆",
            onPress: async () => {
              try {
                await openStoreForRating();
                try {
                  Alert.alert("Thanks!", "Thanks for supporting PuffNoMore.");
                } catch {}
              } catch (e) {
                console.warn(e);
              }
              onNext && onNext();
            },
          },
          { text: "Not Now", onPress: () => onNext && onNext() },
        ],
      );
    } catch (e) {
      console.warn(e);
      onNext && onNext();
    }
  };

  return (
    <CommitmentBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Help us Improve</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Give us a Rating</Text>
          <Text style={styles.subtext}>
            This app was designed for people like you.
          </Text>

          <View style={{ width: "100%", alignItems: "center", marginTop: 8 }}>
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              {testimonials.slice(0, 3).map((t, i) => (
                <View
                  key={i}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    overflow: "hidden",
                    marginLeft: i === 0 ? 0 : -8,
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                >
                  <Image source={t.avatar} style={{ width: 40, height: 40 }} />
                </View>
              ))}
            </View>

            <Text style={{ color: "#dfe7da" }}>+ 1,000,000 people</Text>
          </View>

          <View style={{ marginTop: 16, width: "100%", alignItems: "center" }}>
            {testimonials.map((t, idx) => (
              <View key={idx} style={styles.testimonialCard}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        overflow: "hidden",
                        marginRight: 8,
                      }}
                    >
                      <Image
                        source={t.avatar}
                        style={{ width: 44, height: 44 }}
                      />
                    </View>

                    <View>
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: 16,
                        }}
                      >
                        {t.name}
                      </Text>
                      <Text style={{ color: "#cbd5c4", fontSize: 13 }}>
                        @{t.name.split(" ")[0].toLowerCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialIcons
                        key={i}
                        name={"star"}
                        size={14}
                        color="#fbbf24"
                      />
                    ))}
                  </View>
                </View>

                <Text
                  style={{ color: "#e6f0df", fontSize: 15, lineHeight: 20 }}
                >{`"${t.quote}"`}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <View style={styles.footer} pointerEvents="box-none">
          <TouchableOpacity onPress={handleRateNow} style={{ width: "100%" }}>
            <LinearGradient colors={["#90b855", "#63a96a"]} style={styles.cta}>
              <Text style={styles.ctaText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </CommitmentBackground>
  );
}

const styles = StyleSheet.create({
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
  headerSpacer: { width: 40 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  title: {
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
  footer: { paddingHorizontal: 20, paddingBottom: 26, paddingTop: 8 },
  testimonialCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignSelf: "center",
    width: "94%",
  },
  cta: { paddingVertical: 14, borderRadius: 28, alignItems: "center" },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  ctaTouch: { width: "100%" },
});
