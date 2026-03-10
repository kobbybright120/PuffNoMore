import React, { useMemo, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  Modal,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { usePuff } from "../context/PuffContext";
import AppHeader from "../components/AppHeader";
import MotivationCard from "../components/MotivationCard";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SafeHaptics from "../utils/haptics";

let BlurViewComp: any = null;
try {
  // optional dependency
  BlurViewComp = require("expo-blur").BlurView;
} catch {}

const SupportScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { onboardingResponses } = usePuff();

  const reasonRaw =
    (onboardingResponses &&
      (onboardingResponses.quitReason ||
        onboardingResponses.mainReason ||
        onboardingResponses.fullName)) ||
    "";
  const userName = onboardingResponses?.fullName || null;

  const anim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  const items = useMemo(
    () => [
      { id: "breathing", title: "Deep Breathing", icon: "air" },
      { id: "delay", title: "Delay Craving", icon: "timer-sand" },
      { id: "tips", title: "Tips & Guides", icon: "book-open-page-variant" },
      { id: "crusher", title: "Craving Crusher", icon: "apps-box" },
      { id: "contact", title: "Contact Support", icon: "email" },
    ],
    []
  );

  const openEmail = () =>
    Linking.openURL(
      "mailto:support@puffnomore.app?subject=PuffNoMore%20Support"
    );

  const handlePress = (id: string) => {
    try {
      SafeHaptics.selectionAsync();
    } catch {}
    switch (id) {
      case "breathing":
        navigation.navigate("Breathing");
        break;
      case "delay":
        navigation.navigate("DelayCraving");
        break;
      case "tips":
        navigation.navigate("TipsAndGuides");
        break;
      case "crusher":
        navigation.navigate("CravingCrusher");
        break;
      case "contact":
        openEmail();
        break;
    }
  };

  const openModal = () => {
    setModalVisible(true);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 240,
      useNativeDriver: false,
    }).start();
  };
  const closeModal = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: false,
    }).start(() => setModalVisible(false));
  };

  const isLight = theme.colors.primaryBackground === "#ffffff";
  const cardBackground = isLight ? theme.colors.primaryBackground : "#0b1519";
  const cardBorderColor = isLight
    ? theme.colors.primaryGreen + "10"
    : "rgba(255,255,255,0.08)";
  const cardShadow = isLight
    ? theme.shadows.medium
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 12,
        elevation: 8,
      };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.primaryBackground },
      ]}
    >
      <AppHeader title="Support" titleColor={theme.colors.primaryGreen} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Support tools
        </Text>

        <View style={{ marginBottom: theme.spacing.md }}>
          <MotivationCard />
        </View>

        <View style={styles.grid}>
          {items.map((it) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.miniCard,
                {
                  backgroundColor: cardBackground,
                  borderWidth: isLight ? 0 : 1,
                  borderColor: cardBorderColor,
                },
                cardShadow,
              ]}
              onPress={() => handlePress(it.id)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: theme.colors.primaryGreen },
                ]}
              >
                <MaterialCommunityIcons
                  name={it.icon as any}
                  size={20}
                  color={theme.colors.primaryBackground}
                />
              </View>
              <Text style={[styles.miniTitle, { color: theme.colors.text }]}>
                {it.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {reasonRaw ? (
          <View style={styles.combined}>
            <TouchableOpacity
              activeOpacity={0.92}
              style={[
                styles.mainCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: cardBorderColor,
                  borderWidth: isLight ? 0 : 1,
                },
              ]}
              onPress={openModal}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                Remember why you're quitting
              </Text>
              <Text
                style={{ color: theme.colors.textSecondary, marginTop: 10 }}
              >
                {userName
                  ? `Tap to see your reason, ${userName}`
                  : "Tap to see your personal reason to quit"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="none"
        transparent
        onRequestClose={closeModal}
      >
        {BlurViewComp ? (
          <View style={StyleSheet.absoluteFill}>
            <BlurViewComp
              intensity={60}
              tint={"light"}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isLight
                    ? "rgba(0,0,0,0.06)"
                    : "rgba(255,255,255,0.06)",
                },
              ]}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { justifyContent: "center", padding: 20 },
              ]}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.94, 1],
                      }),
                    },
                  ],
                  opacity: anim,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.primaryBackground,
                    borderRadius: theme.borderRadius.large,
                    padding: theme.spacing.md,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 18,
                      color: theme.colors.text,
                    }}
                  >
                    Why you’re quitting
                  </Text>
                  <Text
                    style={{
                      marginTop: 12,
                      color: theme.colors.textSecondary,
                      fontSize: 15,
                      lineHeight: 20,
                    }}
                  >
                    {String(reasonRaw)}
                  </Text>
                  <View style={{ marginTop: 18, alignItems: "flex-end" }}>
                    <TouchableOpacity
                      onPress={closeModal}
                      style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                    >
                      <Text
                        style={{
                          color: theme.colors.primaryGreen,
                          fontWeight: "700",
                        }}
                      >
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
        ) : (
          <View style={StyleSheet.absoluteFill}>
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isLight
                    ? "rgba(0,0,0,0.12)"
                    : "rgba(255,255,255,0.06)",
                },
              ]}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { justifyContent: "center", padding: 20 },
              ]}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.94, 1],
                      }),
                    },
                  ],
                  opacity: anim,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.primaryBackground,
                    borderRadius: theme.borderRadius.large,
                    padding: theme.spacing.md,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 18,
                      color: theme.colors.text,
                    }}
                  >
                    Why you’re quitting
                  </Text>
                  <Text
                    style={{
                      marginTop: 12,
                      color: theme.colors.textSecondary,
                      fontSize: 15,
                      lineHeight: 20,
                    }}
                  >
                    {String(reasonRaw)}
                  </Text>
                  <View style={{ marginTop: 18, alignItems: "flex-end" }}>
                    <TouchableOpacity
                      onPress={closeModal}
                      style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                    >
                      <Text
                        style={{
                          color: theme.colors.primaryGreen,
                          fontWeight: "700",
                        }}
                      >
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingTop: 8 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  miniCard: {
    width: "48%",
    backgroundColor: "transparent",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  miniTitle: { fontSize: 15, fontWeight: "600" },
  combined: { paddingHorizontal: 4, marginTop: 12 },
  mainCard: { borderRadius: 12, padding: 12, backgroundColor: "transparent" },
});

export default SupportScreen;
