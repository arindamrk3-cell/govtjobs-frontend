import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  TextInput, Modal, Linking,Alert
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
};

const STATUS_CONFIG = {
  Applied: {
    color: "#2C5F96",
    bg: "#EAF1FB",
    border: "#A8C4E8",
    icon: "paper-plane-outline"
  },
  Shortlisted: {
    color: "#7B4F00",
    bg: "#FFF4E0",
    border: "#F5C87A",
    icon: "star-outline"
  },
  Rejected: {
    color: C.danger,
    bg: "#FFF0EE",
    border: "#F5C6C0",
    icon: "close-circle-outline"
  },
};

const ALL_STATUSES = ["Applied", "Shortlisted", "Rejected"];

export default function TrackerScreen({ token, setScreen, setSelectedJob }) {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [modalEntry, setModalEntry] = useState(null); // entry being edited
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchApplied();
  }, []);

  const fetchApplied = async () => {
    try {
      const res = await API.get("/jobs/applied", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (jobId, status) => {
    try {
      await API.patch(`/jobs/apply/${jobId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(prev =>
        prev.map(e =>
          e.jobId?._id === jobId ? { ...e, status } : e
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const saveNote = async () => {
    if (!modalEntry) return;
    setSavingNote(true);
    try {
      await API.patch(`/jobs/apply/${modalEntry.jobId?._id}/status`, {
        status: modalEntry.status,
        note: noteText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(prev =>
        prev.map(e =>
          e.jobId?._id === modalEntry.jobId?._id ? { ...e, note: noteText } : e
        )
      );
      setModalEntry(null);
    } catch (err) {
      console.log(err);
    } finally {
      setSavingNote(false);
    }
  };
  // Add removeFromTracker function:
const removeFromTracker = async (jobId) => {
  try {
    await API.delete(`/jobs/apply/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Remove from local state instantly
    setEntries(prev => prev.filter(e => e.jobId?._id !== jobId));
  } catch (err) {
    console.log(err);
  }
};

  const filtered = filterStatus === "All"
    ? entries
    : entries.filter(e => e.status === filterStatus);

  // Stats
  const stats = {
    total:       entries.length,
    applied:     entries.filter(e => e.status === "Applied").length,
    shortlisted: entries.filter(e => e.status === "Shortlisted").length,
    rejected:    entries.filter(e => e.status === "Rejected").length,
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Tracker</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ── Stats Row ── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { borderColor: "#A8C4E8" }]}>
              <Text style={[styles.statNum, { color: "#2C5F96" }]}>{stats.applied}</Text>
              <Text style={styles.statLabel}>Applied</Text>
            </View>
            <View style={[styles.statCard, { borderColor: "#F5C87A" }]}>
              <Text style={[styles.statNum, { color: "#7B4F00" }]}>{stats.shortlisted}</Text>
              <Text style={styles.statLabel}>Shortlisted</Text>
            </View>
            <View style={[styles.statCard, { borderColor: "#F5C6C0" }]}>
              <Text style={[styles.statNum, { color: C.danger }]}>{stats.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>

          {/* ── Filter Chips ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {["All", ...ALL_STATUSES].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
                onPress={() => setFilterStatus(s)}
              >
                <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Empty State ── */}
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={44} color="rgba(255,255,255,0.15)" />
              <Text style={styles.emptyText}>No applications yet</Text>
              <Text style={styles.emptySubText}>
                Mark jobs as applied from the job detail screen
              </Text>
            </View>
          ) : (
            filtered.map((entry) => {
              const job = entry.jobId;
              if (!job) return null;
              const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.Applied;

              return (
                <View key={entry._id} style={styles.card}>

                  {/* Card Top */}
                  <View style={styles.cardTop}>
                    <View style={styles.orgIcon}>
                      <Text style={styles.orgText}>
                        {job.organization?.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{job.title}</Text>
                      <Text style={styles.cardOrg} numberOfLines={1}>{job.organization}</Text>
                    </View>
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                      <Ionicons name={cfg.icon} size={11} color={cfg.color} />
                      <Text style={[styles.statusText, { color: cfg.color }]}>{entry.status}</Text>
                    </View>
                  </View>

                  {/* Applied date */}
                  <Text style={styles.appliedDate}>
                    Applied on {new Date(entry.appliedAt).toDateString()}
                  </Text>

                  {/* Note */}
                  {entry.note ? (
                    <View style={styles.noteBox}>
                      <Ionicons name="create-outline" size={13} color={C.textMid} />
                      <Text style={styles.noteText}>{entry.note}</Text>
                    </View>
                  ) : null}

                  <View style={styles.divider} />

                  {/* Status Buttons */}
                  <View style={styles.statusRow}>
                    {ALL_STATUSES.map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.statusBtn,
                          entry.status === s && {
                            backgroundColor: STATUS_CONFIG[s].bg,
                            borderColor: STATUS_CONFIG[s].border,
                          }
                        ]}
                        onPress={() => updateStatus(job._id, s)}
                      >
                        <Text style={[
                          styles.statusBtnText,
                          entry.status === s && { color: STATUS_CONFIG[s].color, fontWeight: "700" }
                        ]}>
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Action Row */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => {
                        setModalEntry(entry);
                        setNoteText(entry.note || "");
                      }}
                    >
                      <Ionicons name="create-outline" size={14} color={C.primary} />
                      <Text style={styles.actionBtnText}>Add Note</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => {
                        setSelectedJob(job);
                        setScreen("detail");
                      }}
                    >
                      <Ionicons name="eye-outline" size={14} color={C.primary} />
                      <Text style={styles.actionBtnText}>View Job</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => Linking.openURL(job.link)}
                    >
                      <Ionicons name="open-outline" size={14} color={C.primary} />
                      <Text style={styles.actionBtnText}>Apply Link</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
    style={[styles.actionBtn, { borderColor: "#F5C6C0", backgroundColor: "#FFF0EE" }]}
    onPress={() => {
      Alert.alert(
        "Remove from Tracker",
        "Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove", style: "destructive",
            onPress: () => removeFromTracker(job._id)
          }
        ]
      );
    }}
  >
    <Ionicons name="trash-outline" size={14} color={C.danger} />
    <Text style={[styles.actionBtnText, { color: C.danger }]}>Remove</Text>
  </TouchableOpacity>
                  </View>

                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ── Note Modal ── */}
      <Modal
        visible={!!modalEntry}
        transparent
        animationType="slide"
        onRequestClose={() => setModalEntry(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Note</Text>
              <TouchableOpacity onPress={() => setModalEntry(null)}>
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalJobTitle} numberOfLines={1}>
              {modalEntry?.jobId?.title}
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Need to submit physical form, exam date: June 10..."
              placeholderTextColor={C.textLight}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.saveNoteBtn}
              onPress={saveNote}
              disabled={savingNote}
            >
              {savingNote
                ? <ActivityIndicator color={C.white} />
                : <Text style={styles.saveNoteBtnText}>Save Note</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: C.bg },
  loader:        { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 14, paddingBottom: 40 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.bg,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },

  // ── Stats ────────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row", gap: 8, marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 14,
    padding: 12, alignItems: "center", borderWidth: 1.5, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  statNum:   { fontSize: 22, fontWeight: "800", color: C.text },
  statLabel: { fontSize: 10, fontWeight: "600", color: C.textMid, marginTop: 2, letterSpacing: 0.3 },

  // ── Filter ───────────────────────────────────────────────────────────────────
  filterRow: { paddingHorizontal: 0, gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  filterChipActive:     { backgroundColor: C.primaryMuted, borderColor: "rgba(10,140,95,0.30)" },
  filterChipText:       { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.45)" },
  filterChipTextActive: { color: C.primary },

  // ── Empty ────────────────────────────────────────────────────────────────────
  emptyState:   { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText:    { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.3)" },
  emptySubText: { fontSize: 13, color: "rgba(255,255,255,0.18)", textAlign: "center", paddingHorizontal: 30 },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface, borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
  },
  cardTop:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  orgIcon: {
    width: 42, height: 42, borderRadius: 11, backgroundColor: C.primaryMuted,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(10,140,95,0.18)",
  },
  orgText:   { color: C.primary, fontWeight: "700", fontSize: 13, letterSpacing: 0.5 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: C.text, lineHeight: 18 },
  cardOrg:   { fontSize: 12, color: C.textMid, marginTop: 1, fontWeight: "500" },

  // ── Status Badge ─────────────────────────────────────────────────────────────
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.2 },

  // ── Applied date & Note ───────────────────────────────────────────────────────
  appliedDate: { fontSize: 11, color: C.textLight, marginBottom: 8, marginLeft: 2 },
  noteBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: C.surfaceAlt, borderRadius: 8,
    padding: 10, marginBottom: 8, borderWidth: 1, borderColor: C.border,
  },
  noteText: { flex: 1, fontSize: 12, color: C.textMid, lineHeight: 17 },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 10 },

  // ── Status Buttons ────────────────────────────────────────────────────────────
  statusRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  statusBtn: {
    flex: 1, paddingVertical: 7, borderRadius: 8,
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
    alignItems: "center",
  },
  statusBtnText: { fontSize: 11, fontWeight: "600", color: C.textMid },

  // ── Action Row ────────────────────────────────────────────────────────────────
  actionRow: { flexDirection: "row", gap: 6 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 4,
    backgroundColor: C.primaryMuted, borderRadius: 8,
    paddingVertical: 8, borderWidth: 1,
    borderColor: "rgba(10,140,95,0.22)",
  },
  actionBtnText: { fontSize: 11, fontWeight: "600", color: C.primary },

  // ── Note Modal ────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: C.surface, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  modalTitle:    { fontSize: 18, fontWeight: "700", color: C.text },
  modalJobTitle: { fontSize: 13, color: C.textMid, marginBottom: 16 },
  noteInput: {
    backgroundColor: C.surfaceAlt, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    padding: 14, fontSize: 14, color: C.text,
    minHeight: 100, marginBottom: 16,
  },
  saveNoteBtn: {
    backgroundColor: C.primary, paddingVertical: 14,
    borderRadius: 14, alignItems: "center",
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 4,
  },
  saveNoteBtnText: { color: C.white, fontSize: 15, fontWeight: "700" },
});