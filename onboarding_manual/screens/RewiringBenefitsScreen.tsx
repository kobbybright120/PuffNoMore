import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import StarryBackground from "../components/StarryBackground";

// TODO: Replace these with actual image assets once added to assets/images/
// const hubermanImg = require('../../assets/images/huberman.png');
// const bartlettImg = require('../../assets/images/bartlett.png');
// const quittrLogo = require('../../assets/images/quittr-logo.png');

export default function RewiringBenefitsScreen({ onNext }: any) {
  return (
    <StarryBackground>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rewiring Benefits</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Testimonial 1 - Andrew Huberman */}
          <View style={styles.testimonialContainer}>
            <View style={styles.testimonialHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarPlaceholder}>AH</Text>
              </View>
              <View style={styles.nameContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>Andrew Huberman, Ph.D</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#90b855" />
                </View>
              </View>
            </View>
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>
                Drastically improve your life.
              </Text>
              <Text style={styles.messageText}>
                Resetting your dopamine balance by taking a break from highly
                stimulating content can dramatically improve motivation,
                emotional stability, and everyday pleasure.
              </Text>
            </View>
          </View>

          {/* Testimonial 2 - Steven Bartlett */}
          <View style={styles.testimonialContainer}>
            <View style={styles.testimonialHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarPlaceholder}>SB</Text>
              </View>
              <View style={styles.nameContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>Steven Bartlett</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#90b855" />
                </View>
              </View>
            </View>
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>There's no good in porn.</Text>
              <Text style={styles.messageText}>
                Pornography doesn't have an educational role-it's only an open
                window for a market that brings more emptiness and addiction
                that profit to porn.
              </Text>
            </View>
          </View>

          {/* Testimonial 3 - Connor */}
          <View style={styles.testimonialContainer}>
            <View style={styles.testimonialHeader}>
              <View style={[styles.avatar, styles.avatarSmall]}>
                <Text style={styles.avatarLogoText}>QUITTR</Text>
              </View>
              <View style={styles.nameContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>Connor</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#90b855" />
                </View>
              </View>
            </View>
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>
                Quitting has allowed me to change my mindset on the little
                things in life.
              </Text>
              <Text style={styles.messageText}>
                I was coming to grips with the fact that life is dark, boring,
                depressing and then I die. Screw that. Quitting has allowed me
                to change my mindset on the little things in life.
              </Text>
            </View>
          </View>

          {/* Testimonial 4 - Jack */}
          <View style={styles.testimonialContainer}>
            <View style={styles.testimonialHeader}>
              <View style={[styles.avatar, styles.avatarSmall]}>
                <Text style={styles.avatarLogoText}>QUITTR</Text>
              </View>
              <View style={styles.nameContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>Jack</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#90b855" />
                </View>
              </View>
            </View>
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>I feel more confident.</Text>
              <Text style={styles.messageText}>
                I've noticed significant improvements in my confidence and
                social interactions since quitting.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={["#90b855", "#63a96a"]}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.button}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onNext}
              style={styles.buttonTouchable}
            >
              <Text style={styles.buttonText}>See Progress Chart</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </StarryBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  testimonialContainer: {
    marginBottom: 24,
  },
  testimonialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(74, 109, 57, 0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(144, 184, 85, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarSmall: {
    backgroundColor: "rgba(45, 70, 32, 0.3)",
    borderColor: "rgba(144, 184, 85, 0.35)",
  },
  avatarPlaceholder: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  avatarLogoText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  messageCard: {
    backgroundColor: "rgba(90, 141, 61, 0.15)",
    borderRadius: 16,
    padding: 16,
    marginLeft: 0,
    borderWidth: 1,
    borderColor: "rgba(144, 184, 85, 0.3)",
  },
  messageTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    lineHeight: 22,
  },
  messageText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 15,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: "#90b855",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonTouchable: { width: "100%" },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
