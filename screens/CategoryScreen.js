import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import API from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
};

export default function CategoryScreen({ setScreen, setFilter }) {
  const [data, setData] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/jobs/categories");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = (type, value) => {
    setFilter({ type, value });
    setScreen("home");
  };

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ── States ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={15} color={C.primary} />
            <Text style={styles.sectionLabel}>States</Text>
            <Text style={styles.sectionCount}>{data.states.length}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.row}>
              {data.states.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.chip}
                  onPress={() => handleClick("state", item._id)}
                >
                  <Text style={styles.chipText}>{item._id}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── Organizations ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={15} color={C.primary} />
            <Text style={styles.sectionLabel}>Organizations</Text>
            <Text style={styles.sectionCount}>{data.organizations.length}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.row}>
              {data.organizations.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.chip}
                  onPress={() => handleClick("organization", item._id)}
                >
                  <Text style={styles.chipText}>{item._id}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── Qualifications ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school-outline" size={15} color={C.primary} />
            <Text style={styles.sectionLabel}>Qualifications</Text>
            <Text style={styles.sectionCount}>{data.qualifications.length}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.row}>
              {data.qualifications.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.chip}
                  onPress={() => handleClick("qualification", item._id)}
                >
                  <Text style={styles.chipText}>{item._id}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // ── Layout ────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.white,
    letterSpacing: 0.3,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(209, 199, 199, 0.8)",
    //letterSpacing: 0.5,
  },

  // ── Card wrapper ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // ── Chips ─────────────────────────────────────────────────────────────────
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.text,
    letterSpacing: 0.1,
  },
  countBadge: {
    backgroundColor: C.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(10,140,95,0.22)",
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
  },
});