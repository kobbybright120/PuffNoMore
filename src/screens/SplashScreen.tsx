import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { usePuff } from "../context/PuffContext";
import { useTheme } from "../context/ThemeContext";

const SplashScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { onboardingCompleted, onboardingResponses, setOnboardingCompleted } =
    usePuff();
  const theme = useTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // In production the splash will route automatically (handled elsewhere).
    // For temporary design work in dev, keep the splash visible until the
    // developer chooses to continue via the buttons below.
    if (!__DEV__) {
      let mounted = true;
      (async () => {
        try {
          const [rawResponses, rawDone] = await Promise.all([
            AsyncStorage.getItem("puff:onboardingResponses"),
            AsyncStorage.getItem("puff:onboardingCompleted"),
          ]);

          const hasResponses = rawResponses && rawResponses.length > 2; // '{}' length 2
          const done = rawDone ? JSON.parse(rawDone) === true : false;
          const showOnboarding = !done || !hasResponses;

          setTimeout(() => {
            if (!mounted) return;
            if (showOnboarding)
              nav.reset({ index: 0, routes: [{ name: "Onboarding" }] });
            else nav.reset({ index: 0, routes: [{ name: "RootTabs" }] });
          }, 600);
        } catch (e) {
          setTimeout(() => {
            if (!mounted) return;
            nav.reset({ index: 0, routes: [{ name: "Onboarding" }] });
          }, 600);
        }
      })();
      return () => {
        mounted = false;
      };
    }
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.primaryBackground },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onLongPress={async () => {
          try {
            await setOnboardingCompleted(false);
          } catch {}
        }}
      >
        <Animated.View style={{ opacity: fade, alignItems: "center" }}>
          <View
            style={[
              styles.logoPlaceholder,
              { backgroundColor: theme.colors.primaryGreen },
            ]}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            PuffNoMore
          </Text>
          <Text style={[styles.tag, { color: theme.colors.textSecondary }]}>
            Reclaim control
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {__DEV__ ? (
        <View style={styles.devControls}>
          <TouchableOpacity
            style={[
              styles.devButton,
              { borderColor: theme.colors.primaryGreen },
            ]}
            onPress={() =>
              nav.reset({ index: 0, routes: [{ name: "Onboarding" }] })
            }
          >
            <Text
              style={{ color: theme.colors.primaryGreen, fontWeight: "700" }}
            >
              Design Onboarding
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.devButton, { borderColor: theme.colors.text }]}
            onPress={() =>
              nav.reset({ index: 0, routes: [{ name: "RootTabs" }] })
            }
          >
            <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
              Open App
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 120, height: 120, resizeMode: "contain", marginBottom: 16 },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 28,
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "700" },
  tag: { fontSize: 14, marginTop: 8 },
  devControls: { flexDirection: "row", marginTop: 18 },
  devButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 8,
  },
});

export default SplashScreen;
