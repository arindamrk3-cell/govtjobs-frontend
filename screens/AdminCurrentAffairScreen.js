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
  amberMuted:   "#FFF4E0",
  amberBorder:  "#F5C87A",
};

const CATEGORIES = [
  "Economy", "Science", "Politics", "Sports",
  "Technology", "Environment", "Defence", "International",
];

export default function AdminCurrentAffairScreen({ token, setScreen }) {
  const insets = useSafeAreaInsets();

  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [category, setCategory] = useState("");
  const [points,   setPoints]   = useState("");
  const [adding,   setAdding]   = useState(false);

  const addAffair = async () => {
    if (!title)    { Alert.alert("Missing", "Title is required.");    return; }
    if (!content)  { Alert.alert("Missing", "Content is required.");  return; }
    if (!category) { Alert.alert("Missing", "Category is required."); return; }

    setAdding(true);
    try {
      await API.post(
        "/current-affairs",
        {
          title, content, category,
          importantPoints: points
            ? points.split(",").map(p => p.trim()).filter(Boolean)
            : [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ Published", "Current affair added successfully.");
      setTitle(""); setContent(""); setCategory(""); setPoints("");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to add current affair.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("admin")}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Current Affair</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Article Details</Text>

          {/* Title */}
          <Text style={styles.fieldLabel}>Title *</Text>
          <TextInput
            placeholder="e.g. RBI raises repo rate by 25 basis points"
            placeholderTextColor={C.textLight}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          {/* Category Chips */}
          <Text style={styles.fieldLabel}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
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

          {/* Content */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Content *</Text>
          <TextInput
            placeholder="Write the full article content here..."
            placeholderTextColor={C.textLight}
            value={content}
            onChangeText={setContent}
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          {/* Important Points */}
          <Text style={styles.fieldLabel}>Important Points</Text>
          <Text style={styles.fieldHint}>
            Separate each point with a comma
          </Text>
          <TextInput
            placeholder="Point 1, Point 2, Point 3..."
            placeholderTextColor={C.textLight}
            value={points}
            onChangeText={setPoints}
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Points Preview */}
          {points.length > 0 && (
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Ionicons name="flame-outline" size={13} color={C.amber} />
                <Text style={styles.previewTitle}>Points Preview</Text>
              </View>
              {points.split(",").map((p, i) => p.trim() ? (
                <View key={i} style={styles.previewRow}>
                  <View style={styles.previewBadge}>
                    <Text style={styles.previewNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.previewText}>{p.trim()}</Text>
                </View>
              ) : null)}
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={styles.publishBtn}
            onPress={addAffair}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <>
                <Ionicons name="newspaper-outline" size={18} color={C.white} />
                <Text style={styles.publishBtnText}>Publish Article</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 14 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: C.bg, borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
  },
  cardHeading: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 16 },

  // ── Fields ──────────────────────────────────────────────────────────────────
  fieldLabel: {
    fontSize: 11, fontWeight: "700", color: C.textMid,
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8,
  },
  fieldHint: {
    fontSize: 11, color: C.textLight, marginBottom: 8, marginTop: -4,
  },
  input: {
    backgroundColor: C.surfaceAlt, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text, marginBottom: 14,
  },
  multilineInput: { minHeight: 100, paddingTop: 12 },

  // ── Category Chips ───────────────────────────────────────────────────────────
  chipScroll:      { marginBottom: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: C.surfaceAlt, marginRight: 8,
    borderWidth: 1, borderColor: C.border,
  },
  chipActive:     { backgroundColor: C.primaryMuted, borderColor: "rgba(10,140,95,0.35)" },
  chipText:       { fontSize: 13, fontWeight: "600", color: C.textMid },
  chipTextActive: { color: C.primary, fontWeight: "700" },
  selectedValue:  { fontSize: 12, fontWeight: "600", color: C.primary, marginBottom: 4 },

  // ── Points Preview ───────────────────────────────────────────────────────────
  previewBox: {
    backgroundColor: C.amberMuted, borderRadius: 12,
    padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: C.amberBorder, gap: 8,
  },
  previewHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  previewTitle:  { fontSize: 12, fontWeight: "700", color: C.amber },
  previewRow:    { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  previewBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.amber, alignItems: "center",
    justifyContent: "center", flexShrink: 0, marginTop: 1,
  },
  previewNum:  { fontSize: 10, fontWeight: "800", color: C.white },
  previewText: { flex: 1, fontSize: 13, color: "#7B4F00", lineHeight: 19 },

  // ── Publish Button ───────────────────────────────────────────────────────────
  publishBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    backgroundColor: C.primary, paddingVertical: 14,
    borderRadius: 14, marginTop: 6,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 8, elevation: 5,
  },
  publishBtnText: { color: C.white, fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },
});