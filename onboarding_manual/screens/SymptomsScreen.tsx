import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import GradientBackground from "../components/GradientBackground";
import { LinearGradient } from "expo-linear-gradient";
import { darkTheme } from "../../src/theme/theme";

const { height } = Dimensions.get("window");

const SymptomsScreen: React.FC<any> = ({ navigation, onBack, onNext }: any) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const sections = [
    {
      title: "Mental",
      items: [
        "Feeling unmotivated",
        "Lack of ambition to pursue goals",
        "Difficulty concentrating",
        "General anxiety",
      ],
    },
    {
      title: "Physical",
      items: [
        "Shortness of breath",
        "Reduced stamina",
        "Chronic cough",
        "Increased risk of heart disease and cancer",
      ],
    },
    {
      title: "Cognitive",
      items: ["Slower memory recall", "Brain fog", "Reduced neuroplasticity"],
    },
    {
      title: "Social",
      items: [
        "Isolation due to stigma",
        "Strained relationships (partners/family dislike smoking)",
        "Missed opportunities in smoke-free environments",
      ],
    },
    {
      title: "Financial",
      items: [
        "Ongoing cost of cigarettes/vapes",
        "Medical expenses from smoking-related conditions",
      ],
    },
    {
      title: "Appearance",
      items: ["Premature aging of skin", "Yellowing teeth", "Bad breath"],
    },
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const BackArrowIcon = () => (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <GradientBackground>
      <View style={styles.wrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    if (typeof onBack === "function") onBack();
                    else if (navigation && navigation.goBack)
                      navigation.goBack();
                  }}
                >
                  <BackArrowIcon />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Symptoms</Text>
              </View>

              <View style={styles.alertBanner}>
                <Text style={styles.alertText}>
                  Excessive porn use can have negative impacts psychologically.
                </Text>
              </View>

              <Text style={styles.instructionText}>
                Select any symptoms below:
              </Text>

              {sections.map((section) => (
                <View style={styles.section} key={section.title}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>

                  <View style={styles.symptomsContainer}>
                    {section.items.map((symptom) => (
                      <TouchableOpacity
                        key={symptom}
                        style={styles.symptomButton}
                        onPress={() => toggleSymptom(symptom)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selectedSymptoms.includes(symptom) &&
                              styles.checkboxSelected,
                          ]}
                        >
                          {selectedSymptoms.includes(symptom) && (
                            <View style={styles.checkboxInner} />
                          )}
                        </View>
                        <Text style={styles.symptomText}>{symptom}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (typeof onNext === "function") onNext(selectedSymptoms);
              else if (navigation && navigation.navigate)
                navigation.navigate("ScareScreen1");
              else console.log("Selected symptoms:", selectedSymptoms);
            }}
            style={{ width: "100%" }}
          >
            <LinearGradient
              colors={[
                darkTheme.colors.secondaryGreen,
                darkTheme.colors.primaryGreen,
              ]}
              start={[0, 0]}
              end={[0, 1]}
              style={styles.buttonGradient}
            >
              <Text style={styles.ctaButtonText}>Reboot my brain</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingBottom: 160 },
  wrapper: { flex: 1, position: "relative" },
  container: {
    minHeight: height,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  /* Background is handled by GradientBackground (shared) */
  content: {
    position: "relative",
    zIndex: 10,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    position: "relative",
  },
  backButton: { position: "absolute", left: 0, padding: 8 },
  headerTitle: { color: "white", fontSize: 24, fontWeight: "bold" },
  alertBanner: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: "#DC4B3A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5,
    overflow: "hidden",
  },
  alertText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    flex: 1,
    letterSpacing: 0.2,
    fontFamily: "Inter",
  },
  alertInner: { flexDirection: "row", alignItems: "center" },
  leftAccent: {
    width: 8,
    height: "100%",
    backgroundColor: "#DC4B3A",
    borderRadius: 4,
    marginRight: 14,
  },
  instructionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 24,
    fontFamily: "Inter",
  },
  section: { marginBottom: 24 },
  symptomsContainer: { paddingVertical: 4 },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
    fontFamily: "Inter",
  },
  symptomButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#63a96a",
    backgroundColor: "#63a96a",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
  },
  symptomText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    fontFamily: "Inter",
  },
  ctaButton: {
    width: "100%",
    backgroundColor: "#63a96a",
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 32,
  },
  ctaButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  buttonGradient: {
    width: "100%",
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 32,
  },
  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    zIndex: 30,
  },
});

export default SymptomsScreen;
