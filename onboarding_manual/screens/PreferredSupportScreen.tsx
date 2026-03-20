import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StarryBackground from "../components/StarryBackground";
import PlanCard from "../../src/components/PlanCard";
// try to use react-navigation focus hooks when available
let useFocusEffect: any = null;
try {
  const nav = require("@react-navigation/native");
  useFocusEffect = nav.useFocusEffect;
} catch {
  useFocusEffect = null;
}

// Smooth Typewriter using requestAnimationFrame for consistent timings
function Typewriter({
  text,
  speed = 36,
  style,
  showCaret = false,
  onDone,
  onStart,
}: any) {
  const [display, setDisplay] = React.useState("");
  const indexRef = React.useRef(0);
  const accRef = React.useRef(0); // accumulated milliseconds
  const lastRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const finishedRef = React.useRef(false);

  React.useEffect(() => {
    indexRef.current = 0;
    accRef.current = 0;
    lastRef.current = null;
    finishedRef.current = false;
    setDisplay("");
    if (onStart) onStart();
    console.log("Typewriter: started", { text, speed });

    const step = (now: number) => {
      if (lastRef.current == null) lastRef.current = now;
      const delta = now - (lastRef.current || now);
      lastRef.current = now;
      accRef.current += delta;

      const charsToAdd = Math.floor(accRef.current / speed);
      if (charsToAdd > 0) {
        indexRef.current = Math.min(text.length, indexRef.current + charsToAdd);
        accRef.current -= charsToAdd * speed;
        setDisplay(text.slice(0, indexRef.current));
      }

      if (indexRef.current < text.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        if (!finishedRef.current) {
          finishedRef.current = true;
          console.log("Typewriter: finished");
          if (onDone) onDone();
        }
      }
    };

    rafRef.current = requestAnimationFrame(step);
    // fallback in case rAF doesn't fire reliably on some devices
    const fallbackTimer = setTimeout(
      () => {
        if (!finishedRef.current) {
          finishedRef.current = true;
          console.warn("Typewriter: fallback finish triggered");
          if (onDone) onDone();
        }
      },
      Math.max(500, text.length * speed + 500),
    );

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(fallbackTimer);
    };
  }, [text, speed]);

  return (
    <Text style={style} accessibilityLabel={text}>
      {display}
      {showCaret ? "" : ""}
    </Text>
  );
}

export default function PreferredSupportScreen(props: any) {
  const { onBack, onNext, navigation, isActive } = props;
  const flipRef = React.useRef(new Animated.Value(90));
  const opacityRef = React.useRef(new Animated.Value(0));
  const [cardVisible, setCardVisible] = React.useState(false);
  const [tvKey, setTvKey] = React.useState(0);

  const handleTypeDone = () => {
    console.log("PreferredSupportScreen: handleTypeDone called");
    setCardVisible(true);
    // Use native-driven timing for a smoother, consistent animation
    Animated.parallel([
      Animated.timing(flipRef.current, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityRef.current, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTypeStart = () => {
    // Reset animation values so hot reloads / refreshes replay the flip
    try {
      console.log("PreferredSupportScreen: handleTypeStart called");
      // Prefer resetting the existing Animated.Value via setValue so the
      // native driver node remains consistent with the animated view.
      if (
        flipRef.current &&
        typeof (flipRef.current as any).setValue === "function"
      ) {
        (flipRef.current as any).setValue(90);
      } else {
        flipRef.current = new Animated.Value(90);
      }
      if (
        opacityRef.current &&
        typeof (opacityRef.current as any).setValue === "function"
      ) {
        (opacityRef.current as any).setValue(0);
      } else {
        opacityRef.current = new Animated.Value(0);
      }
      setCardVisible(false);
    } catch {
      // ignore if values unavailable
    }
  };
  // prefer useFocusEffect when available (works even when screen stays mounted)
  if (useFocusEffect) {
    useFocusEffect(
      React.useCallback(() => {
        console.log("PreferredSupportScreen: focus via useFocusEffect");
        handleTypeStart();
        setTvKey((k) => k + 1);
        return () => {};
      }, []),
    );
  } else {
    // fallback to navigation 'focus' event listener
    React.useEffect(() => {
      if (!navigation || !navigation.addListener) return;
      console.log(
        "PreferredSupportScreen: attaching navigation.focus listener",
      );
      const sub = navigation.addListener("focus", () => {
        console.log("PreferredSupportScreen: focus event received");
        handleTypeStart();
        setTvKey((k) => k + 1);
      });
      return () => sub && sub();
    }, [navigation]);
  }

  // If this screen is rendered inside a parent pager (ManualOnboardingFlow)
  // the parent passes `isActive` to indicate the active page. React to
  // that so the typewriter + card flip replay when the page becomes active.
  React.useEffect(() => {
    if (isActive) {
      console.log("PreferredSupportScreen: active via isActive prop");
      handleTypeStart();
      setTvKey((k) => k + 1);
    }
  }, [isActive]);
  return (
    <StarryBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.titleWrap}>
          <Typewriter
            key={tvKey}
            text={"Now it's time to invest in yourself"}
            speed={36}
            showCaret={false}
            style={styles.titleLarge}
            onDone={handleTypeDone}
            onStart={handleTypeStart}
          />
        </View>
        <View style={styles.planCardContainer}>
          {cardVisible && (
            <Animated.View
              style={[
                styles.planCardAnimated,
                {
                  transform: [
                    { perspective: 1000 },
                    {
                      rotateY: flipRef.current.interpolate({
                        inputRange: [0, 90],
                        outputRange: ["0deg", "90deg"],
                      }),
                    },
                  ],
                  opacity: opacityRef.current,
                },
              ]}
            >
              <PlanCard />
            </Animated.View>
          )}
        </View>
        <View style={styles.footer}>
          <Pressable
            onPress={onNext}
            android_ripple={{ color: "transparent" }}
            style={styles.cta}
          >
            <LinearGradient
              colors={["#90b855", "#63a96a"]}
              style={styles.ctaInner}
            >
              <Text style={styles.ctaText} selectable={false}>
                Continue
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </StarryBackground>
  );
}
const styles = StyleSheet.create({
  titleWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  titleLarge: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    fontFamily: "Inter",
  },
  subtextCenter: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Inter",
    marginTop: 8,
    marginBottom: 8,
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
  headerSpacer: {
    width: 40,
    height: 40,
  },
  planCardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  planCardAnimated: {
    width: "100%",
    alignItems: "center",
    backfaceVisibility: "hidden",
  },
  footer: {
    padding: 16,
  },
  cta: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 12,
  },
  ctaInner: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 14,
  },
});
// ...existing code...
