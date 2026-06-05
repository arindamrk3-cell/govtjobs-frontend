import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg:           "#0D1F1A",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F4F7F5",
  primary:      "#0A8C5F",
  primaryDark:  "#076647",
  primaryMuted: "#E6F4EF",
  border:       "#DDE8E4",
  white:        "#FFFFFF",
  text:         "#0D1F1A",
  textMid:      "#4A6360",
};

const STATES = [
  "All", "West Bengal", "Delhi", "Maharashtra", "Uttar Pradesh",
  "Bihar", "Rajasthan", "Tamil Nadu", "Karnataka", "Gujarat",
  "Madhya Pradesh", "Odisha", "Jharkhand", "Punjab", "Haryana",
  "Assam", "Kerala", "Andhra Pradesh", "Telangana", "All India"
];

const QUALIFICATIONS = [
  "All", "8th Pass", "10th Pass", "12th Pass",
  "ITI", "Diploma", "Graduation", "B.Tech / BE",
  "MBA", "Post Graduation", "PhD"
];

export default function OnboardingScreen({ token, setScreen, getPushToken }) {
  const [step, setStep] = useState(1); // 1 = state, 2 = qualification
  const [selectedState, setSelectedState] = useState("All");
  const [selectedQual, setSelectedQual] = useState("All");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleFinish = async () => {
    setLoading(true);
    try {
      const pushToken = await getPushToken();
      await API.put("/user/preferences", {
        state: selectedState,
        qualification: selectedQual,
        pushToken: pushToken || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScreen("home");
    } catch (err) {
      console.log(err);
      setScreen("home");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>

      {/* Progress Bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: step === 1 ? "50%" : "100%" }]} />
        </View>
        <Text style={styles.progressText}>Step {step} of 2</Text>
      </View>

      {step === 1 ? (
        <>
          <View style={styles.headWrap}>
            <Ionicons name="location-outline" size={32} color={C.primary} />
            <Text style={styles.heading}>Which state are you from?</Text>
            <Text style={styles.subheading}>
              We'll show you jobs from your state first
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.optionsWrap} showsVerticalScrollIndicator={false}>
            {STATES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.option, selectedState === s && styles.optionActive]}
                onPress={() => setSelectedState(s)}
              >
                {selectedState === s && (
                  <Ionicons name="checkmark-circle" size={16} color={C.primary} />
                )}
                <Text style={[styles.optionText, selectedState === s && styles.optionTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.bottomWrap, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={C.white} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.headWrap}>
            <Ionicons name="school-outline" size={32} color={C.primary} />
            <Text style={styles.heading}>Your qualification?</Text>
            <Text style={styles.subheading}>
              We'll match jobs to your education level
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.optionsWrap} showsVerticalScrollIndicator={false}>
            {QUALIFICATIONS.map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.option, selectedQual === q && styles.optionActive]}
                onPress={() => setSelectedQual(q)}
              >
                {selectedQual === q && (
                  <Ionicons name="checkmark-circle" size={16} color={C.primary} />
                )}
                <Text style={[styles.optionText, selectedQual === q && styles.optionTextActive]}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.bottomWrap, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Ionicons name="arrow-back" size={18} color={C.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleFinish} disabled={loading}>
              {loading
                ? <ActivityIndicator color={C.white} />
                : <>
                    <Text style={styles.nextText}>Find My Jobs</Text>
                    <Ionicons name="sparkles" size={18} color={C.white} />
                  </>
              }
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1F1A",
  },
  progressWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 6,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0A8C5F",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headWrap: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
    marginTop: 8,
  },
  subheading: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    fontWeight: "500",
    lineHeight: 20,
  },
  optionsWrap: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  optionActive: {
    backgroundColor: "#E6F4EF",
    borderColor: "#0A8C5F",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
  },
  optionTextActive: {
    color: "#0A8C5F",
    fontWeight: "700",
  },
  bottomWrap: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0A8C5F",
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#0A8C5F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 5,
  },
  nextText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(10,140,95,0.12)",
    borderWidth: 1,
    borderColor: "rgba(10,140,95,0.30)",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0A8C5F",
  },
});