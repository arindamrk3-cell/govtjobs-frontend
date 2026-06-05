import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, SafeAreaView,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import API from "../services/api";

const C = {
  bg:           "#0D1F1A",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F4F7F5",
  primary:      "#0A8C5F",
  primaryDark:  "#076647",
  primaryMuted: "#E6F4EF",
  text:         "#0D1F1A",
  textMid:      "#4A6360",
  textLight:    "#8FA8A2",
  border:       "#DDE8E4",
  danger:       "#C0392B",
  white:        "#FFFFFF",
  amber:        "#F5A623",
};

const CATEGORIES = [
  "General Knowledge", "Current Affairs", "History",
  "Geography", "Science", "Polity", "Economy",
  "Math", "English", "Reasoning",
];

export default function AdminQuizScreen({ token, setScreen }) {
  const insets = useSafeAreaInsets();

  const [question,    setQuestion]    = useState("");
  const [option1,     setOption1]     = useState("");
  const [option2,     setOption2]     = useState("");
  const [option3,     setOption3]     = useState("");
  const [option4,     setOption4]     = useState("");
  const [answer,      setAnswer]      = useState("");
  const [explanation, setExplanation] = useState("");
  const [category,    setCategory]    = useState("");
  const [loading,     setLoading]     = useState(false);
  const [isDaily,     setIsDaily]     = useState(false);

  // which option is selected as correct
  const options = [option1, option2, option3, option4];
  const setters = [setOption1, setOption2, setOption3, setOption4];

  const addQuiz = async () => {
    if (!question || !option1 || !option2 || !option3 || !option4 || !answer || !category) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }
    if (!options.includes(answer)) {
      Alert.alert("Invalid Answer", "Correct answer must match one of the 4 options exactly.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/quizzes",
        { question, options, answer, explanation, category, isDaily },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("✅ Published", "Quiz question added successfully.");
      setQuestion(""); setOption1(""); setOption2("");
      setOption3(""); setOption4(""); setAnswer("");
      setExplanation(""); setCategory(""); setIsDaily(false);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to add quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Fixed Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("admin")}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Quiz Manager</Text>
          <Text style={styles.headerSub}>Add new quiz questions</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="help-circle-outline" size={13} color={C.amber} />
          <Text style={[styles.adminBadgeText, { color: C.amber }]}>Quiz</Text>
        </View>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardHeading}>New Question</Text>

          {/* Question */}
          <Text style={styles.fieldLabel}>Question *</Text>
          <TextInput
            placeholder="Type your question here..."
            placeholderTextColor={C.textLight}
            style={[styles.input, styles.multilineInput]}
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Divider */}
          <View style={styles.formDivider} />
          <Text style={styles.formSectionHeading}>Answer Options *</Text>

          {/* Options */}
          {["Option A", "Option B", "Option C", "Option D"].map((label, i) => (
            <View key={i}>
              <Text style={styles.fieldLabel}>{label} *</Text>
              <View style={styles.optionRow}>
                <View style={[
                  styles.optionBadge,
                  answer === options[i] && answer !== "" && styles.optionBadgeActive
                ]}>
                  <Text style={[
                    styles.optionBadgeText,
                    answer === options[i] && answer !== "" && { color: C.white }
                  ]}>
                    {["A", "B", "C", "D"][i]}
                  </Text>
                </View>
                <TextInput
                  placeholder={`Enter ${label}`}
                  placeholderTextColor={C.textLight}
                  style={[styles.input, styles.optionInput,
                    answer === options[i] && answer !== "" && styles.inputCorrect
                  ]}
                  value={options[i]}
                  onChangeText={setters[i]}
                />
              </View>
            </View>
          ))}

          {/* Divider */}
          <View style={styles.formDivider} />
          <Text style={styles.formSectionHeading}>Correct Answer *</Text>

          {/* Correct Answer — tap to select */}
          <Text style={[styles.fieldLabel, { marginBottom: 10 }]}>
            Tap the correct option below
          </Text>
          <View style={styles.answerGrid}>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.answerChip, answer === opt && opt !== "" && styles.answerChipActive]}
                onPress={() => opt && setAnswer(opt)}
                disabled={!opt}
              >
                <Text style={[
                  styles.answerChipText,
                  answer === opt && opt !== "" && styles.answerChipTextActive
                ]}>
                  {["A", "B", "C", "D"][i]}{opt ? `: ${opt}` : " (empty)"}
                </Text>
                {answer === opt && opt !== "" && (
                  <Ionicons name="checkmark-circle" size={14} color={C.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.formDivider} />
          <Text style={styles.formSectionHeading}>Details</Text>

          {/* Explanation */}
          <Text style={styles.fieldLabel}>Explanation (optional)</Text>
          <TextInput
            placeholder="Why is this the correct answer?"
            placeholderTextColor={C.textLight}
            style={[styles.input, styles.multilineInput]}
            value={explanation}
            onChangeText={setExplanation}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Category */}
          <Text style={styles.fieldLabel}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {category ? (
            <Text style={styles.selectedValue}>✓ {category}</Text>
          ) : null}
          <TouchableOpacity
  style={{
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  }}
  onPress={() =>
    setIsDaily(!isDaily)
  }
>

  <Ionicons
    name={
      isDaily
        ? "checkbox"
        : "square-outline"
    }
    size={22}
    color={C.primary}
  />

  <Text
    style={{
      color: C.text,
      fontWeight: "600",
    }}
  >
    Add to Daily Quiz
  </Text>

</TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={addQuiz}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={C.white} />
              : <>
                  <Ionicons name="checkmark-circle-outline" size={18} color={C.white} />
                  <Text style={styles.addBtnText}>Publish Quiz</Text>
                </>
            }
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // ── Header ──
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: C.bg,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },
  headerSub:   { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 },
  adminBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(245,166,35,0.12)",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(245,166,35,0.25)",
  },
  adminBadgeText: { fontSize: 12, fontWeight: "700" },

  // ── Card ──
  card: {
    backgroundColor: C.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: C.border, marginTop: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
  },
  cardHeading: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 16 },

  // ── Fields ──
  fieldLabel: {
    fontSize: 11, fontWeight: "700", color: C.textMid,
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8,
  },
  input: {
    backgroundColor: C.surfaceAlt, borderRadius: 10, borderWidth: 1,
    borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text, marginBottom: 14,
  },
  inputCorrect: {
    borderColor: C.primary, backgroundColor: C.primaryMuted,
  },
  multilineInput: { minHeight: 80, paddingTop: 12 },

  // ── Option Row ──
  optionRow:   { flexDirection: "row", alignItems: "center", gap: 8 },
  optionBadge: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  optionBadgeActive: { backgroundColor: C.primary, borderColor: C.primaryDark },
  optionBadgeText:   { fontSize: 12, fontWeight: "800", color: C.textMid },
  optionInput:       { flex: 1 },

  // ── Answer Grid ──
  answerGrid: { gap: 8, marginBottom: 14 },
  answerChip: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    gap: 8, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 10, backgroundColor: C.surfaceAlt,
    borderWidth: 1, borderColor: C.border,
  },
  answerChipActive:    { backgroundColor: C.primaryMuted, borderColor: "rgba(10,140,95,0.4)" },
  answerChipText:      { fontSize: 13, fontWeight: "600", color: C.textMid, flex: 1 },
  answerChipTextActive:{ color: C.primary, fontWeight: "700" },

  // ── Chips ──
  chipScroll: { marginBottom: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: C.surfaceAlt, marginRight: 8,
    borderWidth: 1, borderColor: C.border,
  },
  chipActive:     { backgroundColor: C.primaryMuted, borderColor: "rgba(10,140,95,0.35)" },
  chipText:       { fontSize: 13, fontWeight: "600", color: C.textMid },
  chipTextActive: { color: C.primary, fontWeight: "700" },
  selectedValue:  { fontSize: 12, fontWeight: "600", color: C.primary, marginBottom: 4 },

  // ── Divider ──
  formDivider:       { height: 1, backgroundColor: C.border, marginVertical: 16 },
  formSectionHeading:{ fontSize: 13, fontWeight: "700", color: C.textMid, letterSpacing: 0.5, marginBottom: 14 },

  // ── Submit ──
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primary, paddingVertical: 14, borderRadius: 14, marginTop: 8,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 8, elevation: 5,
  },
  addBtnText: { color: C.white, fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },
});