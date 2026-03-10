import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

type Params = {
  EducationDetail: {
    id?: string;
    title: string;
    body: string;
    tips?: string[];
  };
};

const EducationDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Params, "EducationDetail">>();
  const { title = "", body = "", tips = undefined } = route.params || {};

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.primaryBackground },
    header: {
      alignItems: "center",
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    title: {
      textAlign: "center",
      fontFamily: theme.fonts.family.bold,
      fontSize: theme.fonts.size.xlarge,
      color: theme.colors.text,
      marginBottom: 6,
    },
    subtitle: {
      color: theme.colors.primaryGreen,
      fontSize: theme.fonts.size.small,
      fontFamily: theme.fonts.family.regular,
      letterSpacing: 0.6,
      marginBottom: theme.spacing.sm,
    },
    contentWrap: {
      padding: theme.spacing.md,
    },
    card: {
      backgroundColor:
        theme.colors.primaryBackground === "#ffffff" ? "#ffffff" : "#0b1519",
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.md,
      ...theme.shadows.medium,
      borderWidth: theme.colors.primaryBackground === "#ffffff" ? 0 : 1,
      borderColor: theme.colors.primaryGreen + "10",
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: theme.spacing.md,
    },
    accent: {
      width: 4,
      height: 56,
      borderRadius: 4,
      backgroundColor: theme.colors.primaryGreen,
      marginRight: theme.spacing.md,
      marginTop: 6,
    },
    body: {
      color: theme.colors.text,
      fontSize: theme.fonts.size.medium,
      lineHeight: 26,
    },
    meta: { color: theme.colors.primaryGreen, marginBottom: theme.spacing.sm },
    highlight: {
      backgroundColor: theme.colors.primaryGreen + "18",
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.medium,
      marginVertical: theme.spacing.sm,
    },
    bulletList: {
      marginTop: theme.spacing.sm,
    },
    bulletItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: theme.spacing.xs,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 6,
      backgroundColor: theme.colors.primaryGreen,
      marginTop: 8,
      marginRight: theme.spacing.sm,
    },
    bulletText: {
      color: theme.colors.text,
      fontSize: theme.fonts.size.medium,
      lineHeight: 22,
      flex: 1,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderColor: theme.colors.primaryGreen + "10",
    },
    doneButton: {
      backgroundColor: theme.colors.primaryGreen,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.medium,
      alignItems: "center",
    },
    doneText: {
      color: theme.colors.primaryBackground,
      fontFamily: theme.fonts.family.bold,
    },
  });

  const paragraphs = (body || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // detect practical-tips paragraph (heuristic)
  const tipsIndex = paragraphs.findIndex((p) =>
    /delay|distract|substitut|practical/i.test(p)
  );

  const defaultTips = [
    "Delay: wait 10 minutes. Cravings usually pass.",
    "Distract: take a short walk or sip water.",
    "Substitute: chew gum or use a safe oral fix if needed.",
  ];
  const tipsBullets = tips && tips.length ? tips : defaultTips;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Tips • Guide</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentWrap}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.accent} />
            <View style={{ flex: 1 }}>
              {paragraphs.map((p, idx) => {
                if (p.toLowerCase().startsWith("good news")) {
                  return (
                    <View key={idx} style={styles.highlight}>
                      <Text
                        style={[
                          styles.body,
                          { fontFamily: theme.fonts.family.bold },
                        ]}
                      >
                        Good news
                      </Text>
                      <Text style={[styles.body, { marginTop: 6 }]}>
                        {p.replace(/^good news[:\-\s]*/i, "")}
                      </Text>
                    </View>
                  );
                }

                if (idx === tipsIndex) {
                  return (
                    <View key={idx}>
                      <Text style={styles.body}>{p.split(/[:\n]/)[0]}</Text>
                      <View style={styles.bulletList}>
                        {tipsBullets.map((b, i) => (
                          <View key={i} style={styles.bulletItem}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.bulletText}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                }

                return (
                  <Text
                    key={idx}
                    style={[styles.body, { marginBottom: theme.spacing.sm }]}
                  >
                    {p}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.doneText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EducationDetailScreen;
