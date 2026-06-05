import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Linking, FlatList
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
  stateTag:     "#EAF1FB",
  stateBorder:  "#A8C4E8",
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

const TABS = [
  { key: "admitcard", label: "Admit Cards", icon: "document-text-outline" },
  { key: "result",    label: "Results",     icon: "trophy-outline"         },
];

function AdmitCardItem({ item, type, onPress }) {
  const isResult = type === "result";
  const date     = isResult ? item.resultDate : item.examDate;
  const dateLabel = isResult ? "Result Date" : "Exam Date";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.card}>

        {/* Top Row */}
        <View style={styles.cardTop}>
          <View style={[styles.orgIcon, isResult && styles.orgIconResult]}>
            <Text style={[styles.orgText, isResult && styles.orgTextResult]}>
              {item.organization?.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.cardOrg}  numberOfLines={1}>{item.organization}</Text>
          </View>
          <View style={[styles.typeBadge, isResult && styles.typeBadgeResult]}>
            <Ionicons
              name={isResult ? "trophy-outline" : "document-text-outline"}
              size={11}
              color={isResult ? C.amber : C.primary}
            />
            <Text style={[styles.typeBadgeText, isResult && styles.typeBadgeTextResult]}>
              {isResult ? "Result" : "Admit Card"}
            </Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {item.state && (
            <View style={styles.tagState}>
              <Ionicons name="location-outline" size={10} color="#2C5F96" />
              <Text style={styles.tagStateText} numberOfLines={1}>{item.state}</Text>
            </View>
          )}
          {item.qualification && item.qualification !== "All" && (
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{item.qualification}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color={C.textMid} />
            <Text style={styles.dateLabel}>{dateLabel}:</Text>
            <Text style={styles.dateValue}>
              {date ? new Date(date).toDateString() : "Not announced"}
            </Text>
          </View>
          <TouchableOpacity style={[styles.downloadBtn, isResult && styles.downloadBtnResult]} onPress={onPress}>
            <Ionicons name={isResult ? "open-outline" : "download-outline"} size={13} color={C.white} />
            <Text style={styles.downloadText}>
              {isResult ? "Check" : "Download"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </TouchableOpacity>
  );
}

export default function AdmitCardScreen({ setScreen }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab]       = useState("admitcard");
  const [admitCards, setAdmitCards]     = useState([]);
  const [results, setResults]           = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [cardsRes, resultsRes] = await Promise.all([
        API.get("/updates/admit-cards"),
        API.get("/updates/results"),
      ]);
      setAdmitCards(cardsRes.data);
      setResults(resultsRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url) => Linking.openURL(url);

  const displayedData = activeTab === "admitcard" ? admitCards : results;

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Updates</Text>
          <Text style={styles.headerSub}>Admit Cards & Results</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAll}>
          <Ionicons name="refresh-outline" size={18} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* ── Stats Strip ── */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Ionicons name="document-text-outline" size={14} color={C.primary} />
          <Text style={styles.statText}>
            <Text style={styles.statNum}>{admitCards.length}</Text> Admit Cards
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="trophy-outline" size={14} color={C.amber} />
          <Text style={styles.statText}>
            <Text style={[styles.statNum, { color: C.amber }]}>{results.length}</Text> Results
          </Text>
        </View>
      </View>

      {/* ── Tab Switcher ── */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive,
              tab.key === "result" && activeTab === tab.key && styles.tabBtnResult
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={
                activeTab === tab.key
                  ? tab.key === "result" ? C.amber : C.primary
                  : "rgba(255,255,255,0.4)"
              }
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
              activeTab === tab.key && tab.key === "result" && { color: C.amber }
            ]}>
              {tab.label}
            </Text>
            {/* Count badge */}
            <View style={[styles.tabBadge,
              activeTab === tab.key && tab.key === "result" && { backgroundColor: C.amberMuted }
            ]}>
              <Text style={[styles.tabBadgeText,
                activeTab === tab.key && tab.key === "result" && { color: C.amber }
              ]}>
                {tab.key === "admitcard" ? admitCards.length : results.length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : displayedData.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={activeTab === "admitcard" ? "document-text-outline" : "trophy-outline"}
            size={52}
            color="rgba(255,255,255,0.12)"
          />
          <Text style={styles.emptyText}>
            No {activeTab === "admitcard" ? "admit cards" : "results"} yet
          </Text>
          <Text style={styles.emptySubText}>
            Check back later — we update this regularly
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.listLabel}>
            {displayedData.length} {activeTab === "admitcard" ? "admit card" : "result"}
            {displayedData.length > 1 ? "s" : ""} available
          </Text>

          {displayedData.map(item => (
            <AdmitCardItem
              key={item._id}
              item={item}
              type={activeTab}
              onPress={() => openLink(item.link)}
            />
          ))}
        </ScrollView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loader:    { flex: 1, justifyContent: "center", alignItems: "center" },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: C.bg, borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },
  headerSub:   { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 },

  // ── Stats Strip ─────────────────────────────────────────────────────────────
  statsStrip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)",
  },
  statItem:    { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" },
  statDivider: { width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.10)" },
  statText:    { fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: "500" },
  statNum:     { fontWeight: "700", color: C.primary },

  // ── Tabs ────────────────────────────────────────────────────────────────────
  tabRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  tabBtnActive: { backgroundColor: C.primaryMuted, borderColor: "rgba(10,140,95,0.30)" },
  tabBtnResult: { backgroundColor: C.amberMuted,   borderColor: C.amberBorder },
  tabText:       { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.4)" },
  tabTextActive: { color: C.primary },
  tabBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  tabBadgeText: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.4)" },

  // ── List ────────────────────────────────────────────────────────────────────
  scrollContent: { padding: 14, paddingBottom: 40 },
  listLabel: {
    fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12,
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface, borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
  },
  cardTop:  { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  orgIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: C.primaryMuted,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(10,140,95,0.18)",
  },
  orgIconResult: { backgroundColor: C.amberMuted, borderColor: C.amberBorder },
  orgText:       { color: C.primary, fontWeight: "700", fontSize: 14, letterSpacing: 0.5 },
  orgTextResult: { color: C.amber },
  cardTitle: { fontSize: 14, fontWeight: "700", color: C.text, lineHeight: 19 },
  cardOrg:   { fontSize: 12, color: C.textMid, marginTop: 2, fontWeight: "500" },

  // ── Type Badge ───────────────────────────────────────────────────────────────
  typeBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: C.primaryMuted, paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
  },
  typeBadgeResult:     { backgroundColor: C.amberMuted, borderColor: C.amberBorder },
  typeBadgeText:       { fontSize: 9, fontWeight: "700", color: C.primary, letterSpacing: 0.3 },
  typeBadgeTextResult: { color: C.amber },

  // ── Tags ────────────────────────────────────────────────────────────────────
  tagsRow: { flexDirection: "row", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  tag: {
    backgroundColor: C.primaryMuted, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
  },
  tagText:  { fontSize: 11, fontWeight: "600", color: C.primary },
  tagState: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.stateTag, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: C.stateBorder,
  },
  tagStateText: { fontSize: 11, fontWeight: "600", color: "#2C5F96", maxWidth: 120 },

  // ── Footer ──────────────────────────────────────────────────────────────────
  divider:      { height: 1, backgroundColor: C.border, marginBottom: 10 },
  footer:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateRow:      { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  dateLabel:    { fontSize: 11, fontWeight: "600", color: C.textMid },
  dateValue:    { fontSize: 11, fontWeight: "700", color: C.text },
  downloadBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.primary, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 10,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 4,
  },
  downloadBtnResult: { backgroundColor: C.amber },
  downloadText:      { color: C.white, fontSize: 12, fontWeight: "700" },

  // ── Empty ────────────────────────────────────────────────────────────────────
  emptyState: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingTop: 80, gap: 10,
  },
  emptyText:    { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.25)" },
  emptySubText: {
    fontSize: 13, color: "rgba(255,255,255,0.15)",
    textAlign: "center", paddingHorizontal: 40,
  },
});