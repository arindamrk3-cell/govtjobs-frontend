import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, Linking, Share,
  TextInput, ActivityIndicator, Alert
} from "react-native";
import API from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
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
  amber: "#F5A623",
};

// ─── DEADLINE HELPER ──────────────────────────────────────────────────────────
function getDeadlineLabel(last_date) {
  const now = new Date();
  const end = new Date(last_date);
  const diff = end - now;
  if (diff <= 0) return { label: "Expired", urgent: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return { label: "Closes today!", urgent: true };
  if (days === 1) return { label: "1 day left", urgent: true };
  if (days <= 7) return { label: `${days} days left`, urgent: true };
  return { label: new Date(last_date).toDateString(), urgent: false };
}

export default function JobDetailScreen({ token, job, setScreen }) {
  const insets = useSafeAreaInsets();

  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const NOTE_KEY = `note_${job?._id}`;
  const APPLIED_KEY = `applied_${job?._id}`;
  const BOOKMARK_KEY = `bookmark_${job?._id}`;

  // ── Load persisted note + applied state ──────────────────────────────────
  useEffect(() => {
    if (!job) return;
    (async () => {
      const savedN = await AsyncStorage.getItem(NOTE_KEY);
      const savedA = await AsyncStorage.getItem(APPLIED_KEY);
      const savedB = await AsyncStorage.getItem(BOOKMARK_KEY);
      if (savedN) { setSavedNote(savedN); setNote(savedN); }
      if (savedA === "true") setApplied(true);
      if (savedB === "true") setBookmarked(true);
    })();
  }, [job]);

  if (!job) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const { label: deadlineLabel, urgent } = getDeadlineLabel(job.last_date);
  const isUrgent =new Date(job.last_date) - new Date() < 3 * 24 * 60 * 60 * 1000;

  // ── Actions ───────────────────────────────────────────────────────────────
  const openLink = () => Linking.openURL(job.link);

  const handleShare = async () => {
    try {
      await Share.share({
        title: isUrgent
          ? `🔥 LAST CHANCE — ${job.title}`
          : `📢 ${job.title} Openings`,

        message:
          `🏛️ ${job.title}\n\n` +

          `🏢 ${job.organization}\n` +
          `📍 ${job.state}  •  🎓 ${job.qualification}\n\n` +

          `📅 Deadline: ${new Date(job.last_date).toDateString()}\n\n` +

          `🚀 Apply Now:${job.link}\n\n` +

          `💼 Secure your future today!\n` +
          `📲 GovtJobs App. Download the App now to get more opportunity.`
      });
    } catch (err) {
      console.log(err);
    }
  };

  const markApplied = async () => {
    setApplyLoading(true);
    try {
      await API.post(`/jobs/apply/${job._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await AsyncStorage.setItem(APPLIED_KEY, "true");
      setApplied(true);
      Alert.alert("✅ Marked as Applied", "Track your application in the Tracker tab.");
    } catch (err) {
      console.log(err);
    } finally {
      setApplyLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      if(bookmarked){
        await API.delete(`/jobs/bookmark/${job._id}`,{
          headers:{ Authorization: `Bearer ${token}`}
        });
        await AsyncStorage.removeItem(BOOKMARK_KEY);
        setBookmarked(false);
      }else{
         
      await API.post(`/jobs/bookmark/${job._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await AsyncStorage.setItem(BOOKMARK_KEY, "true");
      setBookmarked(true);
    }
    } catch (err) {
      console.log(err);
    }
  };

  const saveNote = async () => {
    setSavingNote(true);
    try {
      await AsyncStorage.setItem(NOTE_KEY, note);
      // also persist to backend if applied
      if (applied) {
        await API.patch(`/jobs/apply/${job._id}/status`, {
          status: "Applied",
          note,
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setSavedNote(note);
      setEditingNote(false);
    } catch (err) {
      console.log(err);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ paddingTop: insets.top }} />

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
            <Ionicons name="arrow-back" size={20} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={18} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* ── Main Card ── */}
        <View style={styles.card}>

          {/* Org Icon + Title */}
          <View style={styles.cardTop}>
            <View style={styles.orgIcon}>
              <Text style={styles.orgText}>
                {job.organization?.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{job.title}</Text>
              <Text style={styles.org}>{job.organization}</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tags}>
            <Text style={styles.tag} numberOfLines={1}>{job.qualification}</Text>
            <Text style={styles.tagState} numberOfLines={1}>{job.state}</Text>
          </View>

          {/* Deadline Info Box */}
          <View style={[styles.infoBox, urgent && styles.infoBoxUrgent]}>
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={urgent ? C.danger : C.textMid}
              />
              <View>
                <Text style={styles.label}>Application Deadline</Text>
                <Text style={[styles.value, !urgent && { color: C.text }]}>
                  {deadlineLabel}
                </Text>
                {urgent && (
                  <Text style={styles.valueSmall}>
                    {new Date(job.last_date).toDateString()}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyBtn} onPress={openLink}>
            <Ionicons name="open-outline" size={16} color={C.white} />
            <Text style={styles.applyText}>Apply on Official Site</Text>
          </TouchableOpacity>

          {/* Mark as Applied */}
          <TouchableOpacity
            style={[styles.trackerBtn, applied && styles.trackerBtnDone]}
            onPress={applied ? null : markApplied}
            disabled={applyLoading}
          >
            {applyLoading ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <>
                <Ionicons
                  name={applied ? "checkmark-circle" : "checkmark-circle-outline"}
                  size={16}
                  color={applied ? C.primary : C.primary}
                />
                <Text style={styles.trackerBtnText}>
                  {applied ? "Added to Tracker ✓" : "Mark as Applied"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Bookmark + Share row */}
          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={[styles.secondaryBtn, bookmarked && styles.secondaryBtnActive]}
              onPress={handleBookmark}
            >
              <Ionicons
                name={bookmarked ? "bookmark" : "bookmark-outline"}
                size={15}
                color={bookmarked ? C.primary : C.textMid}
              />
              <Text style={[styles.secondaryBtnText, bookmarked && { color: C.primary }]}>
                {bookmarked ? "Unsave" : "Save Job"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={15} color={C.textMid} />
              <Text style={styles.secondaryBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setScreen("tracker")}
            >
              <Ionicons name="document-text-outline" size={15} color={C.textMid} />
              <Text style={styles.secondaryBtnText}>Tracker</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Notes Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="create-outline" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.sectionTitle}>My Notes</Text>
            {!editingNote && (
              <TouchableOpacity onPress={() => setEditingNote(true)}>
                <Text style={styles.sectionAction}>
                  {savedNote ? "Edit" : "+ Add"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {editingNote ? (
            <View style={styles.noteEditorWrap}>
              <TextInput
                style={styles.noteInput}
                placeholder="e.g. Need to send physical form, exam date June 10, need NOC..."
                placeholderTextColor={C.textLight}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.noteActions}>
                <TouchableOpacity
                  style={styles.noteCancelBtn}
                  onPress={() => { setNote(savedNote); setEditingNote(false); }}
                >
                  <Text style={styles.noteCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noteSaveBtn} onPress={saveNote} disabled={savingNote}>
                  {savingNote
                    ? <ActivityIndicator size="small" color={C.white} />
                    : <Text style={styles.noteSaveText}>Save Note</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ) : savedNote ? (
            <TouchableOpacity
              style={styles.savedNoteBox}
              onPress={() => setEditingNote(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.savedNoteText}>{savedNote}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.emptyNoteBox}
              onPress={() => setEditingNote(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyNoteText}>Tap to add a personal note</Text>
            </TouchableOpacity>
          )}
        </View>

        
        {/* ── Quick Stats Row ── */}
{(job.vacancies || job.salary || job.ageLimit || job.applicationFee) && (
  <View style={styles.statsGrid}>

    {job.vacancies && (
      <View style={styles.statBox}>
        <Ionicons name="people-outline" size={20} color={C.primary} />
        <Text style={styles.statBoxNum}>{job.vacancies}</Text>
        <Text style={styles.statBoxLabel}>Vacancies</Text>
      </View>
    )}

    {job.salary && (
      <View style={styles.statBox}>
        <Ionicons name="cash-outline" size={20} color="#2C5F96" />
        <Text style={[styles.statBoxNum, { color: "#2C5F96", fontSize: 11 }]} numberOfLines={2}>
          {job.salary}
        </Text>
        <Text style={styles.statBoxLabel}>Salary</Text>
      </View>
    )}

    {job.ageLimit && (
      <View style={styles.statBox}>
        <Ionicons name="person-outline" size={20} color={C.amber} />
        <Text style={[styles.statBoxNum, { color: C.amber, fontSize: 11 }]} numberOfLines={2}>
          {job.ageLimit}
        </Text>
        <Text style={styles.statBoxLabel}>Age Limit</Text>
      </View>
    )}

    {job.applicationFee && (
      <View style={styles.statBox}>
        <Ionicons name="wallet-outline" size={20} color={C.danger} />
        <Text style={[styles.statBoxNum, { color: C.danger, fontSize: 11 }]} numberOfLines={2}>
          {job.applicationFee}
        </Text>
        <Text style={styles.statBoxLabel}>Fee</Text>
      </View>
    )}

  </View>
)}

{/* ── Eligibility ── */}
{job.eligibility && (
  <View style={styles.section}>
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name="school-outline" size={17} color={C.primary} />
      </View>
      <Text style={styles.sectionTitle}>Eligibility</Text>
    </View>
    <View style={styles.detailCard}>
      <Text style={styles.detailText}>{job.eligibility}</Text>
    </View>
  </View>
)}

{/* ── Selection Process ── */}
{job.selectionProcess && (
  <View style={styles.section}>
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name="git-branch-outline" size={17} color={C.primary} />
      </View>
      <Text style={styles.sectionTitle}>Selection Process</Text>
    </View>
    <View style={styles.detailCard}>
      {/* Split by → and show as steps */}
      {job.selectionProcess.split("→").map((step, index, arr) => (
        <View key={index} style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step.trim()}</Text>
          {index < arr.length - 1 && (
            <Ionicons name="chevron-forward" size={13} color={C.textLight} style={{ marginLeft: "auto" }} />
          )}
        </View>
      ))}
    </View>
  </View>
)}

{/* ── Important Dates ── */}
<View style={styles.section}>
  <View style={styles.sectionHeaderRow}>
    <View style={styles.sectionIconWrap}>
      <Ionicons name="calendar-outline" size={16} color={C.primary} />
    </View>
    <Text style={styles.sectionTitle}>Important Dates</Text>
  </View>
  <View style={styles.detailCard}>

    <View style={styles.dateInfoRow}>
      <Text style={styles.dateInfoLabel}>Application Deadline</Text>
      <Text style={[styles.dateInfoValue, { color: C.danger }]}>
        {new Date(job.last_date).toDateString()}
      </Text>
    </View>

    {job.examDate && (
      <>
        <View style={styles.dateInfoDivider} />
        <View style={styles.dateInfoRow}>
          <Text style={styles.dateInfoLabel}>Exam Date</Text>
          <Text style={[styles.dateInfoValue, { color: "#2C5F96" }]}>
            {new Date(job.examDate).toDateString()}
          </Text>
        </View>
      </>
    )}

  </View>
</View>

{/* ── About Job ── */}
<View style={styles.section}>
  <View style={styles.sectionHeaderRow}>
    <View style={styles.sectionIconWrap}>
      <Ionicons name="information-circle-outline" size={16} color={C.primary} />
    </View>
    <Text style={styles.sectionTitle}>About this Job</Text>
  </View>
  <View style={styles.aboutCard}>
    <Text style={styles.desc}>
      This is a government job opportunity posted by {job.organization}.
      Check the official notification for complete details including
      syllabus, exam pattern, and document requirements.
    </Text>
    <TouchableOpacity style={styles.officialLinkBtn} onPress={openLink}>
      <Ionicons name="open-outline" size={13} color={C.primary} />
      <Text style={styles.officialLinkText}>View Official Notification</Text>
    </TouchableOpacity>
  </View>
</View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.bg,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  shareBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface, margin: 14, padding: 18,
    borderRadius: 20, shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10,
    shadowRadius: 16, elevation: 5, borderWidth: 1, borderColor: C.border,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  orgIcon: {
    width: 48, height: 48, borderRadius: 13, backgroundColor: C.primaryMuted,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(10,140,95,0.18)",
  },
  orgText: { color: C.primary, fontWeight: "700", fontSize: 15, letterSpacing: 0.5 },
  title: { fontSize: 17, fontWeight: "700", color: C.text, lineHeight: 23, marginBottom: 3 },
  org: { fontSize: 13, fontWeight: "500", color: C.textMid },

  // ── Tags ────────────────────────────────────────────────────────────────────
  tags: { flexDirection: "row", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  tag: {
    backgroundColor: C.primaryMuted, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
    fontSize: 12, fontWeight: "600", color: C.primary, maxWidth: 160,
  },
  tagState: {
    backgroundColor: C.stateTag, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: C.stateBorder,
    fontSize: 12, fontWeight: "600", color: "#2C5F96", maxWidth: 160,
  },

  // ── Info Box ────────────────────────────────────────────────────────────────
  infoBox: {
    backgroundColor: C.surfaceAlt, borderRadius: 12, padding: 12,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
  },
  infoBoxUrgent: {
    backgroundColor: "#FFF0EE", borderColor: "#F5C6C0",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontSize: 10, fontWeight: "600", color: C.textLight, textTransform: "uppercase", marginBottom: 2 },
  value: { fontSize: 15, fontWeight: "700", color: C.danger },
  valueSmall: { fontSize: 11, color: C.textMid, marginTop: 2 },

  divider: { height: 1, backgroundColor: C.border, marginBottom: 14 },

  // ── Apply Button ────────────────────────────────────────────────────────────
  applyBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primary, paddingVertical: 14, borderRadius: 14,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 8, elevation: 5,
  },
  applyText: { fontSize: 15, color: C.white, fontWeight: "700", letterSpacing: 0.4 },

  // ── Tracker Button ──────────────────────────────────────────────────────────
  trackerBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primaryMuted, paddingVertical: 12, borderRadius: 14,
    marginTop: 10, borderWidth: 1, borderColor: "rgba(10,140,95,0.25)",
  },
  trackerBtnDone: {
    backgroundColor: "#E6F4EF", borderColor: C.primary,
  },
  trackerBtnText: { color: C.primary, fontSize: 14, fontWeight: "700" },

  // ── Secondary Row ───────────────────────────────────────────────────────────
  secondaryRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  secondaryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, backgroundColor: C.surfaceAlt, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
  },
  secondaryBtnActive: { backgroundColor: C.primaryMuted, borderColor: "rgba(10,140,95,0.25)" },
  secondaryBtnText: { fontSize: 11, fontWeight: "600", color: C.textMid },

  // ── Sections ────────────────────────────────────────────────────────────────
  section: { marginHorizontal: 14, marginBottom: 14 },
  sectionHeaderRow: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10,
  },
  sectionTitle: {
    flex: 1, fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.4)",
    letterSpacing: 1, textTransform: "uppercase",
  },
  sectionAction: { fontSize: 13, fontWeight: "600", color: C.primary },

  // ── Notes ───────────────────────────────────────────────────────────────────
  noteEditorWrap: { gap: 10 },
  noteInput: {
    backgroundColor: C.surface, borderRadius: 12, borderWidth: 1,
    borderColor: C.border, padding: 14, fontSize: 14,
    color: C.text, minHeight: 100,
  },
  noteActions: { flexDirection: "row", gap: 10 },
  noteCancelBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: "center",
    backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border,
  },
  noteCancelText: { fontSize: 14, fontWeight: "600", color: C.textMid },
  noteSaveBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: "center",
    backgroundColor: C.primary,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 4,
  },
  noteSaveText: { fontSize: 14, fontWeight: "700", color: C.white },
  savedNoteBox: {
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  savedNoteText: { fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 21 },
  emptyNoteBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderStyle: "dashed",
  },
  emptyNoteText: { fontSize: 13, color: "rgba(255,255,255,0.25)", fontWeight: "500" },

  // ── About Card ──────────────────────────────────────────────────────────────
  aboutCard: {
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  desc: { fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 22 },
  officialLinkBtn: { marginTop: 12 },
  officialLinkText: { fontSize: 13, fontWeight: "600", color: C.primary },
  // ── Quick Stats Grid ─────────────────────────────────────────────────────────
statsGrid: {
  flexDirection: "row", flexWrap: "wrap",
  gap: 10, marginHorizontal: 14, marginBottom: 14,
},
statBox: {
  flex: 1, minWidth: "45%",
  backgroundColor: C.surface, borderRadius: 14,
  padding: 14, alignItems: "center", gap: 6,
  borderWidth: 1, borderColor: C.border,
  shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
},
statBoxNum: {
  fontSize: 15, fontWeight: "800", color: C.text,
  textAlign: "center", letterSpacing: 0.2,
},
statBoxLabel: {
  fontSize: 10, fontWeight: "600", color: C.textLight,
  letterSpacing: 0.5, textTransform: "uppercase",
},

// ── Section ──────────────────────────────────────────────────────────────────
sectionIconWrap: {
  width: 28, height: 28, borderRadius: 8,
  backgroundColor: C.primaryMuted,
  alignItems: "center", justifyContent: "center",
  borderWidth: 1, borderColor: "rgba(10,140,95,0.18)",
},

// ── Detail Card ──────────────────────────────────────────────────────────────
detailCard: {
  backgroundColor: C.surface, borderRadius: 14,
  padding: 16, borderWidth: 1, borderColor: C.border,
  shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
},
detailText: {
  fontSize: 14, color: C.text, lineHeight: 22, fontWeight: "400",
},

// ── Selection Steps ───────────────────────────────────────────────────────────
stepRow: {
  flexDirection: "row", alignItems: "center",
  gap: 10, paddingVertical: 8,
  borderBottomWidth: 1, borderBottomColor: C.border,
},
stepBadge: {
  width: 24, height: 24, borderRadius: 12,
  backgroundColor: C.primaryMuted,
  alignItems: "center", justifyContent: "center",
  borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
},
stepNum: { fontSize: 11, fontWeight: "800", color: C.primary },
stepText: { flex: 1, fontSize: 13, fontWeight: "500", color: C.text },

// ── Date Info ────────────────────────────────────────────────────────────────
dateInfoRow: {
  flexDirection: "row", justifyContent: "space-between",
  alignItems: "center", paddingVertical: 4,
},
dateInfoLabel: { fontSize: 13, fontWeight: "500", color: C.textMid },
dateInfoValue: { fontSize: 13, fontWeight: "700" },
dateInfoDivider: { height: 1, backgroundColor: C.border, marginVertical: 8 },

// ── About Card ───────────────────────────────────────────────────────────────
aboutCard: {
  backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14,
  padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
},
desc: { fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 22 },
officialLinkBtn: {
  flexDirection: "row", alignItems: "center",
  gap: 6, marginTop: 12,
},
officialLinkText: { fontSize: 13, fontWeight: "600", color: C.primary },
});