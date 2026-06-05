import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import API from "../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const C = {
  bg: "#0D1F1A",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F7F5",
  primary: "#0A8C5F",
  primaryDark: "#076647",
  primaryMuted: "#E6F4EF",
  stateTag: "#EAF1FB",
  stateBorder: "#A8C4E8",
  text: "#0D1F1A",
  textMid: "#4A6360",
  textLight: "#8FA8A2",
  border: "#DDE8E4",
  danger: "#C0392B",
  white: "#FFFFFF",
};

export default function BookmarkScreen({ token, setScreen, getPushToken, setSelectedJob }) {
  const [jobs, setJobs] = useState([]);
  const [cachedBookmarks, setCachedBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const loadCachedBookmarks = async () => {
    try {
      const cached = await AsyncStorage.getItem("cachedBookmarks");

      if (cached) {
        const parsed = JSON.parse(cached);

        setJobs(parsed);
        setCachedBookmarks(parsed);
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    loadCachedBookmarks();
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await API.get("/jobs/bookmarks", {
        headers: { Authorization: token }
      });
      if (res.data && res.data.length > 0) {

        setJobs(res.data);
        setCachedBookmarks(res.data);
        await AsyncStorage.setItem("cachedBookmarks", JSON.stringify(res.data));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  // Add removeBookmark function:
  const removeBookmark = async (id) => {
    try {
      await API.delete(`/jobs/bookmark/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from local state instantly
      setJobs(prev => prev.filter(j => j._id !== id));
      const updated = jobs.filter(j => j._id !== id);

setCachedBookmarks(updated);

await AsyncStorage.setItem(
  "cachedBookmarks",
  JSON.stringify(updated)
);
    } catch (err) {
      console.log(err);
    }
  };

  const openLink = (url) => Linking.openURL(url);

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={{ width: 38 }} />{/* spacer to center title */}
      </View>

      {/* ── Body ── */}
      {loading && jobs.length === 0 ? (

  <View style={styles.loader}>
    <ActivityIndicator size="large" color={C.primary} />
  </View>

) : jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={52} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>No bookmarks yet</Text>
          <Text style={styles.emptySubText}>Jobs you save will appear here</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionLabel}>{jobs.length} saved jobs</Text>

          {jobs.map((job) => {
            const isUrgent =
              new Date(job.last_date) - new Date() < 7 * 24 * 60 * 60 * 1000;

            return (
              <TouchableOpacity
                key={job._id}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedJob(job);
                  setScreen("detail");
                }}
              >

                <View style={styles.card}>
                  {/* Card Top */}
                  <View style={styles.cardTop}>
                    <View style={styles.orgIcon}>
                      <Text style={styles.orgText}>
                        {job.organization?.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{job.title}</Text>
                      <Text style={styles.cardOrg}>{job.organization}</Text>
                    </View>
                    {isUrgent && (
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>Urgent</Text>
                      </View>
                    )}

                    {/* ← ADD REMOVE BUTTON HERE inside cardTop */}
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeBookmark(job._id)}
                    >
                      <Ionicons name="bookmark" size={18} color={C.primary} />
                    </TouchableOpacity>

                  </View>

                  {/* Tags */}
                  <View style={styles.tagsRow}>
                    <Text style={styles.tag} numberOfLines={1}>{job.qualification}</Text>
                    <Text style={styles.tagState} numberOfLines={1}>{job.state}</Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Footer */}
                  <View style={styles.footer}>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={14} color={C.danger} />
                      <Text style={styles.dateText}>
                        Closes {new Date(job.last_date).toDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={() => openLink(job.link)}
                    >
                      <Text style={styles.applyText}>Apply now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* <View  style={styles.card} >
                
                <View style={styles.cardTop}>
                  <View style={styles.orgIcon}>
                    <Text style={styles.orgText}>
                      {job.organization?.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{job.title}</Text>
                    <Text style={styles.cardOrg}>{job.organization}</Text>
                  </View>
                  {isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                  )}
                </View>

               
                <View style={styles.tagsRow}>
                  <Text style={styles.tag} numberOfLines={1}>{job.qualification}</Text>
                  <Text style={styles.tagState} numberOfLines={1}>{job.state}</Text>
                </View>

                <View style={styles.divider} />

                
                <View style={styles.footer}>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color={C.danger} />
                    <Text style={styles.dateText}>
                      Closes {new Date(job.last_date).toDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => openLink(job.link)}
                  >
                    <Text style={styles.applyText}>Apply now</Text>
                  </TouchableOpacity>
                </View>
              </View> */}
              </TouchableOpacity>

            );
          })}
        </ScrollView>
      )}
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
    justifyContent: "space-between",
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

  // ── Section Label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  // ── Empty State ───────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
  },
  emptySubText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.18)",
    fontWeight: "500",
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  orgIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(10,140,95,0.18)",
  },
  orgText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  cardOrg: {
    fontSize: 13,
    color: C.textMid,
    marginTop: 2,
    fontWeight: "500",
  },

  // ── Urgent Badge ──────────────────────────────────────────────────────────
  urgentBadge: {
    backgroundColor: "#FFF0EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F5C6C0",
  },
  urgentText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.danger,
    letterSpacing: 0.3,
  },

  // ── Tags ──────────────────────────────────────────────────────────────────
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: C.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(10,140,95,0.22)",
    fontSize: 12,
    fontWeight: "600",
    color: C.primary,
    //letterSpacing: 0.2,
    maxWidth: 140,
  },
  tagState: {
    backgroundColor: C.stateTag,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.stateBorder,
    fontSize: 12,
    fontWeight: "600",
    color: "#2C5F96",
    //letterSpacing: 0.2,
    maxWidth: 140,
  },

  // ── Card Footer ───────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.danger,
    letterSpacing: 0.1,
  },
  applyBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 6,
    elevation: 4,
  },
  applyText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  removeBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.primaryMuted,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
    marginLeft: 6,
  },
});