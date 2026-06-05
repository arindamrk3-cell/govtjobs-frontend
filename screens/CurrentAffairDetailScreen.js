import React from "react";
import {
  ScrollView, Text, View,
  StyleSheet, SafeAreaView, TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
};

export default function CurrentAffairDetailScreen({ affair, setScreen }) {
  const insets = useSafeAreaInsets();

  if (!affair) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={44} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>No article found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("currentaffairs")}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Current Affairs</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── Category Badge ── */}
        {affair.category && (
          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag-outline" size={11} color={C.primary} />
            <Text style={styles.categoryText}>{affair.category}</Text>
          </View>
        )}

        {/* ── Title ── */}
        <Text style={styles.title}>{affair.title}</Text>

        {/* ── Date ── */}
        <View style={styles.datePill}>
          <Ionicons name="calendar-outline" size={13} color={C.textLight} />
          <Text style={styles.dateText}>
            {new Date(affair.date).toDateString()}
          </Text>
        </View>

        {/* ── Content Card ── */}
        <View style={styles.contentCard}>
          <Text style={styles.content}>{affair.content}</Text>
        </View>

        {/* ── Important Points ── */}
        {affair.importantPoints?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="flame-outline" size={15} color={C.amber} />
              </View>
              <Text style={styles.sectionTitle}>Important Points</Text>
            </View>

            <View style={styles.pointsCard}>
              {affair.importantPoints.map((point, index) => (
                <View key={index} style={styles.pointRow}>
                  <View style={styles.pointBadge}>
                    <Text style={styles.pointNum}>{index + 1}</Text>
                  </View>
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  emptyState:   { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyText:    { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.25)" },

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
  headerTitle: {
    flex: 1, fontSize: 17, fontWeight: "700",
    color: C.white, letterSpacing: 0.3,
  },

  // ── Scroll ──────────────────────────────────────────────────────────────────
  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },

  // ── Category ────────────────────────────────────────────────────────────────
  categoryBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    alignSelf: "flex-start",
    backgroundColor: C.primaryMuted, paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 8, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
  },
  categoryText: {
    fontSize: 11, fontWeight: "700",
    color: C.primary, letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ── Title ────────────────────────────────────────────────────────────────────
  title: {
    fontSize: 22, fontWeight: "800",
    color: C.white, lineHeight: 30,
    letterSpacing: 0.2, marginBottom: 12,
  },

  // ── Date ────────────────────────────────────────────────────────────────────
  datePill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 12, fontWeight: "600",
    color: C.textLight, letterSpacing: 0.2,
  },

  // ── Content Card ─────────────────────────────────────────────────────────────
  contentCard: {
    backgroundColor: C.surface, borderRadius: 16,
    padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  content: {
    fontSize: 15, lineHeight: 26,
    color: C.text, fontWeight: "400",
  },

  // ── Section ──────────────────────────────────────────────────────────────────
  section:         { marginBottom: 16 },
  sectionHeaderRow: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 12,
  },
  sectionIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: C.amberMuted,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#F5C87A",
  },
  sectionTitle: {
    fontSize: 15, fontWeight: "700",
    color: C.white, letterSpacing: 0.2,
  },

  // ── Points Card ──────────────────────────────────────────────────────────────
  pointsCard: {
    backgroundColor: C.surface, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
    gap: 12,
  },
  pointRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
  },
  pointBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.amberMuted,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#F5C87A",
    marginTop: 1, flexShrink: 0,
  },
  pointNum:  { fontSize: 10, fontWeight: "800", color: C.amber },
  pointText: { flex: 1, fontSize: 14, lineHeight: 22, color: C.text, fontWeight: "400" },
});