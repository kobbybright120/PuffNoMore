import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import motivations from "../data/motivations.json";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  quote?: string;
  author?: string;
  onShare?: () => void;
  onMore?: () => void;
};

const MotivationCard: React.FC<Props> = ({ quote, author, onShare }) => {
  const theme = useTheme();
  const mount = React.useRef(new Animated.Value(0)).current;
  const favScale = React.useRef(new Animated.Value(1)).current;
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(mount, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [mount]);

  // Hourly random selection with persistence so message changes once per hour
  const HOUR_MS = 1000 * 60 * 60;
  const STORAGE_KEY = "@motivation_state_v1";
  const timerRef = React.useRef<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(() =>
    Math.floor(Math.random() * (motivations.length || 1)),
  );

  const sanitize = React.useCallback((text?: string): string => {
    if (!text) return "";
    return text.replace(/[-—–]/g, " ").replace(/\s+/g, " ").trim();
  }, []);
  const transformSupportive = React.useCallback(
    (text?: string): string => {
      const raw = text || "";
      // replace craving/smoke specific words with gentler terms
      let t = raw
        .replace(/\bcravings?\b/gi, "urges")
        .replace(/\bsmok(?:e|ing|er|ers)\b/gi, "old habit")
        .replace(/\bcigarettes?\b/gi, "old habit")
        .replace(/\bnon ?smoker\b/gi, "someone choosing health");

      t = sanitize(t);
      return t.replace(/\s+/g, " ").trim();
    },
    [sanitize],
  );

  // displayed motivation: use provided quote or persisted hourly selection
  const getDisplayedMotivation = React.useCallback((): string => {
    try {
      return (quote as string) || (motivations[selectedIndex] as string) || "";
    } catch {
      return "";
    }
  }, [quote, selectedIndex]);

  const pickRandomIndex = React.useCallback(() => {
    return Math.floor(Math.random() * (motivations.length || 1));
  }, []);

  const scheduleNextHour = React.useCallback(() => {
    const now = Date.now();
    const nextHour = Math.floor(now / HOUR_MS) * HOUR_MS + HOUR_MS;
    const ms = Math.max(1000, nextHour - now);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // @ts-ignore setTimeout returns number in RN
    timerRef.current = setTimeout(async () => {
      const idx = pickRandomIndex();
      setSelectedIndex(idx);
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            hour: Math.floor(Date.now() / HOUR_MS),
            index: idx,
          }),
        );
      } catch {}
      scheduleNextHour();
    }, ms) as unknown as number;
  }, [pickRandomIndex]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const nowHour = Math.floor(Date.now() / HOUR_MS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            mounted &&
            parsed &&
            typeof parsed.index === "number" &&
            parsed.hour === nowHour
          ) {
            setSelectedIndex(parsed.index);
            scheduleNextHour();
            return;
          }
        }
      } catch {}
      // fallback: pick and persist
      const idx = pickRandomIndex();
      setSelectedIndex(idx);
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            hour: Math.floor(Date.now() / HOUR_MS),
            index: idx,
          }),
        );
      } catch {}
      scheduleNextHour();
    })();
    return () => {
      mounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pickRandomIndex, scheduleNextHour]);

  const handleShare = React.useCallback(async () => {
    try {
      await Haptics.selectionAsync();
      const base =
        quote ??
        getDisplayedMotivation() ??
        "You are doing important work for yourself.";
      const transformedBase = transformSupportive(base);
      const cleanAuthor = sanitize(author);
      const message = cleanAuthor
        ? `${transformedBase} ${cleanAuthor}`
        : transformedBase;
      await Share.share({ message });
    } catch {}
    onShare && onShare();
  }, [quote, author, onShare, getDisplayedMotivation]);

  const toggleSave = React.useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    Animated.sequence([
      Animated.timing(favScale, {
        toValue: 0.88,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(favScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
    setSaved((s) => !s);
  }, [favScale]);

  const animatedStyle = {
    opacity: mount,
    transform: [
      {
        translateY: mount.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  } as any;

  const styles = StyleSheet.create({
    outer: {
      borderRadius: theme.borderRadius.large,
      overflow: "hidden",
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primaryBackground,
    },
    gradient: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
    inner: {
      flexDirection: "row",
      padding: theme.spacing.md,
      alignItems: "center",
      minHeight: 140,
      backgroundColor: "transparent",
    },
    accent: {
      width: 8,
      height: "100%",
      borderRadius: 6,
      backgroundColor: theme.colors.primaryGreen,
      marginRight: theme.spacing.sm,
    },
    content: { flex: 1 },
    quote: {
      fontSize: theme.fonts.size.xlarge,
      color: theme.colors.text,
      fontFamily: (theme.fonts.family.bold as any) || undefined,
      lineHeight: 32,
      textAlign: "left",
    },
    author: {
      marginTop: theme.spacing.xs,
      textAlign: "right",
      color: theme.colors.textSecondary,
    },
    actions: {
      flexDirection: "row",
      marginTop: theme.spacing.sm,
      justifyContent: "flex-end",
    },
    circleButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: theme.spacing.sm,
      backgroundColor: theme.colors.primaryBackground,
      borderWidth: 1,
      borderColor: theme.colors.secondaryGreen + "44",
    },
    gradientCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: theme.spacing.sm,
      overflow: "hidden",
    },
  });

  // adjust borders based on theme so dark mode uses subtle light borders
  const isLight = theme.colors.primaryBackground === "#ffffff";
  const circleBorderColor = isLight
    ? theme.colors.secondaryGreen + "44"
    : "rgba(255,255,255,0.06)";

  return (
    <Animated.View style={[styles.outer, animatedStyle]}>
      <LinearGradient
        colors={[theme.colors.primaryGreen + "06", "transparent"]}
        style={styles.gradient}
      />
      <View style={styles.inner}>
        <View style={styles.accent} />
        <View style={styles.content}>
          <Text style={styles.quote}>
            {transformSupportive(
              sanitize(
                quote ??
                  getDisplayedMotivation() ??
                  "You are doing important work for yourself.",
              ),
            )}
          </Text>
          {author ? (
            <Text style={styles.author}>{sanitize(author)}</Text>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleShare} activeOpacity={0.9}>
              <LinearGradient
                colors={[
                  theme.colors.primaryGreen,
                  theme.colors.secondaryGreen,
                ]}
                style={styles.gradientCircle}
              >
                <Ionicons
                  name="share-social"
                  size={18}
                  color={theme.colors.primaryBackground}
                />
              </LinearGradient>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: favScale }] }}>
              {saved ? (
                <TouchableOpacity onPress={toggleSave} activeOpacity={0.9}>
                  <LinearGradient
                    colors={[
                      theme.colors.primaryGreen,
                      theme.colors.secondaryGreen,
                    ]}
                    style={styles.gradientCircle}
                  >
                    <Ionicons
                      name="heart"
                      size={18}
                      color={theme.colors.primaryBackground}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.circleButton,
                    { borderColor: circleBorderColor },
                  ]}
                  onPress={toggleSave}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={"heart-outline"}
                    size={18}
                    color={theme.colors.primaryGreen}
                  />
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default React.memo(MotivationCard);
