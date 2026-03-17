import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StarryBackground from "../components/StarryBackground";
import PlanCard from "../../src/components/PlanCard";

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
          if (onDone) onDone();
        }
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed]);

  return (
    <Text style={style} accessibilityLabel={text}>
      {display}
      {showCaret ? "" : ""}
    </Text>
  );
}

export default function PreferredSupportScreen({ onBack, onNext }: any) {
  const flipRef = React.useRef(new Animated.Value(90));
  const opacityRef = React.useRef(new Animated.Value(0));
  const [cardVisible, setCardVisible] = React.useState(false);

  const handleTypeDone = () => {
    setCardVisible(true);
    Animated.parallel([
      Animated.spring(flipRef.current, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: false,
      }),
      Animated.timing(opacityRef.current, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleTypeStart = () => {
    // Reset animation values so hot reloads / refreshes replay the flip
    try {
      // recreate Animated.Values to avoid driver mismatch (native vs JS)
      flipRef.current = new Animated.Value(90);
      opacityRef.current = new Animated.Value(0);
      setCardVisible(false);
    } catch (e) {
      // ignore if values unavailable
    }
  };
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
          <LinearGradient colors={["#90b855", "#63a96a"]} style={styles.cta}>
            <Text style={styles.ctaText} onPress={onNext}>
              Continue
            </Text>
          </LinearGradient>
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
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 14,
  },
});
// ...existing code...
