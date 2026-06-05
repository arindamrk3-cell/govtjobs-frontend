import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#0D1F1A",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F7F5",
  primary: "#0A8C5F",
  primaryDark: "#076647",
  primaryMuted: "#E6F4EF",
  text: "#0D1F1A",
  textMid: "#4A6360",
  textLight: "#8FA8A2",
  border: "#DDE8E4",
  danger: "#C0392B",
  white: "#FFFFFF",
};

const STATES = [
  "All", "West Bengal", "Delhi", "All India", "Maharashtra",
  "Uttar Pradesh", "Tamil Nadu", "Gujarat", "Karnataka",
  "Rajasthan", "Bihar", "Odisha", "Punjab", "Haryana",
  "Assam", "Kerala", "Andhra Pradesh", "Telangana", "Jharkhand",
];

const QUALIFICATIONS = [
  "All", "8th pass", "10th pass", "12th pass", "ITI",
  "Diploma", "Graduation", "B.Tech / BE", "MBA",
  "Post Graduation", "PhD",
];

export default function ProfileScreen({ token, setScreen }) {
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState(null);
  const [cachedUser, setCachedUser] = useState(null);
  const [state, setState] = useState("All");
  const [qualification, setQualification] = useState("All");
  const [role, setRole] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stats
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  const [accuracy, setAccuracy] = useState(0);

  const [avgScore, setAvgScore] = useState(0);


  const loadCachedUser = async () => {
    try {
      const cached = await AsyncStorage.getItem("cachedUser");

      if (cached) {
        const parsed = JSON.parse(cached);

        setUser(parsed);
        setCachedUser(parsed);

        setState(parsed.state || "All");
        setQualification(parsed.qualification || "All");
      }
    } catch (err) {
      console.log("cached user error:", err);
    }
  };



  useEffect(() => {
    loadCachedUser();
    loadProfile();
    loadStats();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (e) { }
    }
  }, []);
  const loadProfile = async () => {
    try {
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = res.data;
      setUser(userData);
      await AsyncStorage.setItem(
        "cachedUser",
        JSON.stringify(userData)
      );
      setState(res.data.state || "All");
      setQualification(res.data.qualification || "All");

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const cachedStats =
        await AsyncStorage.getItem(
          "profileStats"
        );

      if (cachedStats) {

        const parsed =
          JSON.parse(cachedStats);

        setBookmarkCount(
          parsed.bookmarkCount || 0
        );

        setAppliedCount(
          parsed.appliedCount || 0
        );

        setQuizCount(
          parsed.quizCount || 0
        );

        setAccuracy(
          parsed.accuracy || 0
        );

        setAvgScore(
          parsed.avgScore || 0
        );
      }
      const [bookmarks, applied, quizStats] = await Promise.all([
        API.get("/jobs/bookmarks", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/jobs/applied", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/quizzes/stats", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      await AsyncStorage.setItem(
        "profileStats",
        JSON.stringify({

          bookmarkCount:
            bookmarks.data.length,

          appliedCount:
            applied.data.length,

          quizCount:
            quizStats.data.totalQuizzes,

          accuracy:
            quizStats.data.accuracy,

          avgScore:
            quizStats.data.avgScore,

        })
      );
      setBookmarkCount(bookmarks.data.length);

      setAppliedCount(applied.data.length);
      setQuizCount(quizStats.data.totalQuizzes);

      setAccuracy(quizStats.data.accuracy);
      setAvgScore(quizStats.data.avgScore);
    } catch (err) {
      console.log(err);
    }
  };

  const savePref = async () => {
    setSaving(true);
    try {
      await API.post("/auth/preferences",
        { state, qualification },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowOptions(false);
      Alert.alert("✅ Saved", "Your preferences have been updated.For You feed will now reflect these.");
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("onboarded");
          setScreen("login");
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ paddingTop: insets.top }} />

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen("home")} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          {role === "admin" && (
            <TouchableOpacity style={styles.adminBtn} onPress={() => setScreen("admin")}>
              <Ionicons name="settings-outline" size={16} color={C.primary} />
              <Text style={styles.adminBtnText}>Admin</Text>
            </TouchableOpacity>
          )}
          {role !== "admin" && <View style={{ width: 38 }} />}
        </View>

        {/* ── User Card ── */}
        {loading && !user ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : user && (
          <View style={styles.userCard}>
            {/* Avatar */}
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name?.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>

            </View>

            {/* Preferences Preview */}
            <View style={styles.prefRow}>
              <View style={styles.prefChip}>
                <Ionicons name="location-outline" size={15} color={C.primary} />
                <Text style={styles.prefText}>{state}</Text>
              </View>
              <View style={styles.prefChip}>
                <Ionicons name="school-outline" size={15} color={C.primary} />
                <Text style={styles.prefText}>{qualification}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setScreen("bookmark")}
          >
            <Ionicons name="bookmark" size={24} color={C.primary} />
            <Text style={styles.statNum}>{bookmarkCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setScreen("tracker")}
          >
            <Ionicons name="document-text" size={24} color="#2C5F96" />
            <Text style={[styles.statNum, { color: "#2C5F96" }]}>{appliedCount}</Text>
            <Text style={styles.statLabel}>Applied</Text>
          </TouchableOpacity>

          {/* <View style={styles.statCard}>
            <Ionicons name="person-outline" size={20} color={C.textMid} />
            <Text style={styles.statNum}>—</Text>
            <Text style={styles.statLabel}>Member</Text>
          </View> */}
        </View>
        <View style={styles.statsRow}>

          <View style={styles.statCard}>

            <Ionicons
              name="trophy-outline"
              size={24}
              color="#FF9800"
            />

            <Text
              style={[
                styles.statNum,
                { color: "#FF9800" }
              ]}
            >
              {quizCount}
            </Text>

            <Text style={styles.statLabel}>
              Quizzes
            </Text>

          </View>

          <View style={styles.statCard}>

            <Ionicons
              name="analytics-outline"
              size={24}
              color="#7B61FF"
            />

            <Text
              style={[
                styles.statNum,
                { color: "#7B61FF" }
              ]}
            >
              {accuracy}%
            </Text>

            <Text style={styles.statLabel}>
              Accuracy
            </Text>

          </View>

          <View style={styles.statCard}>

            <Ionicons
              name="star-outline"
              size={24}
              color="#E91E63"
            />

            <Text
              style={[
                styles.statNum,
                { color: "#E91E63" }
              ]}
            >
              {avgScore}
            </Text>

            <Text style={styles.statLabel}>
              Avg Score
            </Text>

          </View>

        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>

          <View style={styles.actionCard}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setScreen("tracker")}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="document-text-outline" size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Application Tracker</Text>
                <Text style={styles.actionSub}>Track your applied jobs</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textLight} />
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setScreen("bookmark")}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="bookmark-outline" size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Saved Jobs</Text>
                <Text style={styles.actionSub}>View your bookmarked jobs</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textLight} />
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setScreen("category")}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="grid-outline" size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Browse Categories</Text>
                <Text style={styles.actionSub}>Filter by state or qualification</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Preferences Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>Job Preferences</Text>
            <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
              <Text style={styles.sectionAction}>
                {showOptions ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {!showOptions ? (
            // Preview mode
            <View style={styles.prefPreviewCard}>
              <View style={styles.prefPreviewRow}>
                <Ionicons name="location-outline" size={16} color={C.primary} />
                <Text style={styles.prefPreviewLabel}>State</Text>
                <Text style={styles.prefPreviewValue}>{state}</Text>
              </View>
              <View style={styles.actionDivider} />
              <View style={styles.prefPreviewRow}>
                <Ionicons name="school-outline" size={16} color={C.primary} />
                <Text style={styles.prefPreviewLabel}>Qualification</Text>
                <Text style={styles.prefPreviewValue}>{qualification}</Text>
              </View>
            </View>
          ) : (
            // Edit mode
            <>
              <Text style={styles.label}>Select State</Text>
              <View style={styles.optionsRow}>
                {STATES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.option, state === s && styles.optionActive]}
                    onPress={() => setState(s)}
                  >
                    {state === s && (
                      <Ionicons name="checkmark-circle" size={13} color={C.primary} />
                    )}
                    <Text style={[styles.optionText, state === s && styles.optionTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 20 }]}>Select Qualification</Text>
              <View style={styles.optionsRow}>
                {QUALIFICATIONS.map(q => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.option, qualification === q && styles.optionActive]}
                    onPress={() => setQualification(q)}
                  >
                    {qualification === q && (
                      <Ionicons name="checkmark-circle" size={13} color={C.primary} />
                    )}
                    <Text style={[styles.optionText, qualification === q && styles.optionTextActive]}>
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={savePref}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color={C.white} />
                  : <Text style={styles.saveText}>Save Preferences</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Danger Zone ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionRow} onPress={logout}>
              <View style={[styles.actionIcon, { backgroundColor: "#FFF0EE" }]}>
                <Ionicons name="log-out-outline" size={18} color={C.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: C.danger }]}>Logout</Text>
                <Text style={styles.actionSub}>Sign out of your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingBottom: 16, paddingTop: 8,

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
  adminBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.primaryMuted, paddingHorizontal: 12,
    paddingVertical: 7, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.25)",
  },
  adminBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },

  // ── User Card ────────────────────────────────────────────────────────────────
  userCard: {
    backgroundColor: C.surface, borderRadius: 18, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: C.primary, alignItems: "center", justifyContent: "center",
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 4,
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: C.white, letterSpacing: 0.5 },
  name: { fontSize: 17, fontWeight: "700", color: C.text },
  email: { fontSize: 12, color: C.textMid, marginTop: 2, fontWeight: "500" },
  logoutBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#FFF0EE", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#F5C6C0",
  },
  prefRow: { flexDirection: "row", gap: 8 },
  prefChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.primaryMuted, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
  },
  prefText: { fontSize: 12, fontWeight: "600", color: C.primary },

  // ── Stats ────────────────────────────────────────────────────────────────────
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14,
    alignItems: "center", gap: 4, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  statNum: { fontSize: 20, fontWeight: "800", color: C.text },
  statLabel: { fontSize: 10, fontWeight: "600", color: C.textMid, letterSpacing: 0.3 },

  // ── Sections ─────────────────────────────────────────────────────────────────
  section: { marginBottom: 20 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)",
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
  },
  sectionAction: { fontSize: 13, fontWeight: "600", color: C.primary },

  // ── Action Card ──────────────────────────────────────────────────────────────
  actionCard: {
    backgroundColor: C.surface, borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  actionRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14,
  },
  actionIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.primaryMuted,
    alignItems: "center", justifyContent: "center",
  },
  actionTitle: { fontSize: 14, fontWeight: "600", color: C.text },
  actionSub: { fontSize: 12, color: C.textMid, marginTop: 1 },
  actionDivider: { height: 1, backgroundColor: C.border, marginLeft: 62 },

  // ── Preferences Edit ─────────────────────────────────────────────────────────
  prefPreviewCard: {
    backgroundColor: C.surface, borderRadius: 14, overflow: "hidden",
    borderWidth: 1, borderColor: C.border,
  },
  prefPreviewRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14,
  },
  prefPreviewLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: C.textMid },
  prefPreviewValue: { fontSize: 14, fontWeight: "700", color: C.text },

  label: {
    fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.45)",
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 10,
  },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 10,
  },
  optionActive: {
    backgroundColor: C.primaryMuted,
    borderColor: "rgba(10,140,95,0.35)",
  },
  optionText: { color: "rgba(255,255,255,0.65)", fontWeight: "600", fontSize: 13 },
  optionTextActive: { color: C.primary },

  saveBtn: {
    backgroundColor: C.primary, paddingVertical: 14, marginTop: 20,
    borderRadius: 14, alignItems: "center",
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 8, elevation: 5,
  },
  saveText: { color: C.white, fontWeight: "700", fontSize: 15, letterSpacing: 0.4 },
});