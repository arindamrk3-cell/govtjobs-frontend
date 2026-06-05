import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, SafeAreaView, ActivityIndicator,RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const CATEGORY_COLORS = {
  "Economy":      { bg: "#EAF1FB", border: "#A8C4E8", text: "#2C5F96" },
  "Science":      { bg: "#E6F4EF", border: "rgba(10,140,95,0.22)", text: "#0A8C5F" },
  "Politics":     { bg: "#FFF0EE", border: "#F5C6C0", text: "#C0392B" },
  "Sports":       { bg: "#FFF4E0", border: "#F5C87A", text: "#7B4F00" },
  "Technology":   { bg: "#EAF1FB", border: "#A8C4E8", text: "#2C5F96" },
  "Environment":  { bg: "#E6F4EF", border: "rgba(10,140,95,0.22)", text: "#0A8C5F" },
  "Defence":      { bg: "#FFF0EE", border: "#F5C6C0", text: "#C0392B" },
  "International":{ bg: "#FFF4E0", border: "#F5C87A", text: "#7B4F00" },
};

function getCategoryStyle(category) {
  return CATEGORY_COLORS[category] || {
    bg: C.primaryMuted,
    border: "rgba(10,140,95,0.22)",
    text: C.primary,
  };
}

function AffairCard({ item, onPress }) {
  const catStyle = getCategoryStyle(item.category);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.card}>

        {/* Top Row */}
        <View style={styles.cardTopRow}>
          {item.category && (
            <View style={[styles.categoryBadge, {
              backgroundColor: catStyle.bg,
              borderColor: catStyle.border,
            }]}>
              <Text style={[styles.categoryText, { color: catStyle.text }]}>
                {item.category}
              </Text>
            </View>
          )}
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={11} color={C.textLight} />
            <Text style={styles.dateText}>
              {new Date(item.date).toDateString()}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

        {/* Content preview */}
        <Text style={styles.content} numberOfLines={3}>{item.content}</Text>

        <View style={styles.cardFooter}>
          {/* Important points count */}
          {item.importantPoints?.length > 0 && (
            <View style={styles.pointsCountRow}>
              <Ionicons name="flame-outline" size={12} color={C.amber} />
              <Text style={styles.pointsCountText}>
                {item.importantPoints.length} key point{item.importantPoints.length > 1 ? "s" : ""}
              </Text>
            </View>
          )}
          <View style={styles.readMoreBtn}>
            <Text style={styles.readMoreText}>Read more</Text>
            <Ionicons name="arrow-forward" size={12} color={C.primary} />
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );
}

export default function CurrentAffairsScreen({ setScreen, setSelectedAffair }) {
  const insets = useSafeAreaInsets();
  const [affairs, setAffairs] = useState([]);
  const [cachedAffairs, setCachedAffairs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCachedAffairs = async () => {
  try {
    const cached = await AsyncStorage.getItem("cachedAffairs");

    if (cached) {
      const parsed = JSON.parse(cached);

      setAffairs(parsed);
      setCachedAffairs(parsed);
    }
  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    loadCachedAffairs();
    fetchAffairs();
  }, []);

  const fetchAffairs = async () => {
    try {
      const res = await API.get("/current-affairs");

      if (res.data && res.data.length >= 0) {

  setAffairs(res.data);

  setCachedAffairs(res.data);

  await AsyncStorage.setItem(
    "cachedAffairs",
    JSON.stringify(res.data)
  );
}
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = async () => {
  setRefreshing(true);

  await fetchAffairs();

  setRefreshing(false);
};

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Current Affairs</Text>
          <Text style={styles.headerSub}>Stay updated daily</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAffairs}>
          <Ionicons name="refresh-outline" size={18} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* ── Count Strip ── */}
      {!loading && affairs.length > 0 && (
        <View style={styles.countStrip}>
          <Ionicons name="newspaper-outline" size={13} color={C.primary} />
          <Text style={styles.countText}>
            <Text style={styles.countNum}>{affairs.length}</Text> articles available
          </Text>
        </View>
      )}

      {/* ── Content ── */}
      {loading && affairs.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : affairs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="newspaper-outline" size={52} color="rgba(255,255,255,0.12)" />
          <Text style={styles.emptyText}>No articles yet</Text>
          <Text style={styles.emptySubText}>Check back later for updates</Text>
        </View>
      ) : (
        <FlatList
          data={affairs}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AffairCard
              item={item}
              onPress={() => {
                setSelectedAffair(item);
                setScreen("current-affair-detail");
              }}
            />
          )}refreshControl={
  <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
    tintColor={C.primary}
  />
}
        />
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
  refreshBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },
  headerSub:   { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 },

  // ── Count Strip ──────────────────────────────────────────────────────────────
  countStrip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)",
  },
  countText: { fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: "500" },
  countNum:  { fontWeight: "700", color: C.primary },

  // ── List ────────────────────────────────────────────────────────────────────
  listContent: { padding: 14, paddingBottom: 40 },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface, borderRadius: 18,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
  },
  cardTopRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 10,
  },

  // ── Category Badge ───────────────────────────────────────────────────────────
  categoryBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  categoryText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },

  // ── Date ────────────────────────────────────────────────────────────────────
  datePill:  { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText:  { fontSize: 11, color: C.textLight, fontWeight: "500" },

  // ── Title & Content ──────────────────────────────────────────────────────────
  title: {
    fontSize: 16, fontWeight: "700", color: C.text,
    lineHeight: 22, marginBottom: 8,
  },
  content: {
    fontSize: 13, color: C.textMid,
    lineHeight: 20, marginBottom: 12,
  },

  // ── Card Footer ──────────────────────────────────────────────────────────────
  cardFooter: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  pointsCountRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  pointsCountText: { fontSize: 11, fontWeight: "600", color: C.amber },
  readMoreBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.primaryMuted, paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
  },
  readMoreText: { fontSize: 11, fontWeight: "700", color: C.primary },

  // ── Empty ────────────────────────────────────────────────────────────────────
  emptyState: {
    flex: 1, alignItems: "center",
    justifyContent: "center", gap: 10,
  },
  emptyText:    { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.25)" },
  emptySubText: { fontSize: 13, color: "rgba(255,255,255,0.15)", textAlign: "center" },
});