import React, { useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CommitmentBackground from "../../src/components/CommitmentBackground202";
import CommitmentScreen from "../../src/screens/CommitmentScreen";

export default function CommitmentScreen201({ onBack, onNext }: any) {
  const savedRef = useRef<any>(null);

  return (
    <CommitmentBackground>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>


          <View style={{ width: 40 }} />
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              width: "100%",
              alignItems: "center",
              paddingHorizontal: 20,
              marginTop: 12,
            }}
          >
            <Text style={styles.titleLarge}>Sign your commitment</Text>
            <Text style={styles.subtextCenter}>
              Finally, promise yourself: I will quit step by step, until I am
              truly free.
            </Text>
          </View>

          <CommitmentScreen
            onSave={(strokes: any) => {
              savedRef.current = strokes;
            }}
            onFinish={() => {
              try {
                onNext && onNext(savedRef.current);
              } catch {}
            }}
            onBack={onBack}
          />

          <View style={{ width: "100%", alignItems: "center", marginTop: 8 }}>
            <Text style={styles.guide}>Draw on the open space above</Text>
          </View>
        </View>

        <View style={styles.footer} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => {
              // trigger finish; CommitmentScreen will have already called onSave
              try {
                onNext && onNext(savedRef.current);
              } catch {
                onNext && onNext(null);
              }
            }}
            style={{ width: "100%" }}
          >
            <LinearGradient colors={["#90b855", "#63a96a"]} style={styles.cta}>
              <Text style={styles.ctaText}>Let’s Go</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </CommitmentBackground>
  );
}

const styles = StyleSheet.create({
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

  body: { flex: 1, paddingHorizontal: 20 },
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
    marginBottom: 8,
  },
  subtextCenter: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    fontFamily: "Inter",
  },
  signatureContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 6,
  },
  guideWrap: { width: "100%", alignItems: "center", marginTop: 10 },
  guide: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 6,
    fontFamily: "Inter",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 26,
    paddingTop: 8,
    alignItems: "center",
  },
  cta: {
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    width: "94%",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
  },
});
