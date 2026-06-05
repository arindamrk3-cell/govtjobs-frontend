import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import API from "../services/api";

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
  amberMuted: "#FFF4E0",
  amberBorder: "#F5C87A",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
  return new Date(year, month - 1, 1).getDay();
}

function toDateKey(year, month, day) {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export default function CalendarScreen({ setScreen, setSelectedJob }) {
  const insets = useSafeAreaInsets();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);

  useEffect(() => {
    fetchCalendar();
  }, [month, year]);
  useEffect(() => {
    fetchUpcoming();
  }, []);




  const fetchCalendar = async () => {
    setLoading(true);
    setSelectedDate(null);
    try {
      const res = await API.get(`/jobs/calendar?month=${month}&year=${year}`);
      setGrouped(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchUpcoming = async () => {
    try {
      const res = await API.get("/jobs/upcoming-exams");
      setUpcomingExams(res.data);
    } catch (err) {
      console.log("upcoming error:", err);
    }
  };
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  // Build calendar grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedExams = selectedDate ? (grouped[selectedDate] || []) : [];

  // All exams this month sorted
  const allExamDates = Object.keys(grouped).sort();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[0]}
      >

        <View style={{ paddingTop: insets.top }} />

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
            <Ionicons name="arrow-back" size={20} color={C.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Exam Calendar</Text>
            <Text style={styles.headerSub}>Upcoming government exams</Text>
          </View>
          <View style={styles.examCountBadge}>
            <Text style={styles.examCountText}>
              {allExamDates.length} exams
            </Text>
          </View>
        </View>



        {/* ── Month Navigator ── */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.monthNavBtn} onPress={prevMonth}>
            <Ionicons name="chevron-back" size={20} color={C.white} />
          </TouchableOpacity>
          <View style={styles.monthTitleWrap}>
            <Text style={styles.monthTitle}>{MONTHS[month - 1]}</Text>
            <Text style={styles.yearText}>{year}</Text>
          </View>
          <TouchableOpacity style={styles.monthNavBtn} onPress={nextMonth}>
            <Ionicons name="chevron-forward" size={20} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* ── Calendar Grid ── */}
        <View style={styles.calendarCard}>

          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map(d => (
              <Text key={d} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>

          {loading ? (
            <View style={styles.calLoader}>
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          ) : (
            <View style={styles.grid}>
              {cells.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.emptyCell} />;

                const dateKey = toDateKey(year, month, day);
                const hasExam = !!grouped[dateKey];
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDate;
                const examCount = grouped[dateKey]?.length || 0;

                return (
                  <TouchableOpacity
                    key={dateKey}
                    style={[
                      styles.cell,
                      isToday && styles.cellToday,
                      isSelected && styles.cellSelected,
                      hasExam && !isSelected && styles.cellHasExam,
                    ]}
                    onPress={() => setSelectedDate(isSelected ? null : dateKey)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.cellText,
                      isToday && styles.cellTextToday,
                      isSelected && styles.cellTextSelected,
                      hasExam && !isSelected && styles.cellTextHasExam,
                    ]}>
                      {day}
                    </Text>
                    {hasExam && (
                      <View style={[
                        styles.examDot,
                        isSelected && styles.examDotSelected,
                      ]}>
                        {examCount > 1 && (
                          <Text style={styles.examDotText}>{examCount}</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Legend ── */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.primary }]} />
            <Text style={styles.legendText}>Exam day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.amber }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#2C5F96" }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>


        {(() => {
          const today = new Date();

          // Only show exams that are in NEXT month from today (not viewed month, but real today)
          const oneMonthAhead = new Date(today.getFullYear(), today.getMonth() + 2, 1); // start of month after next
          const twoMonthsAhead = new Date(today.getFullYear(), today.getMonth() + 2, 1); // same

          const visibleUpcoming = upcomingExams.filter(job => {
            const examDate = new Date(job.examDate);
            const examMonth = examDate.getMonth() + 1;
            const examYear = examDate.getFullYear();
            const todayMonth = today.getMonth() + 1;
            const todayYear = today.getFullYear();

            // Must be strictly next month only (not current, not 2+ months ahead)
            const isNextMonth =
              (todayYear === examYear && examMonth === todayMonth + 1) ||
              (todayMonth === 12 && examMonth === 1 && examYear === todayYear + 1);

            return isNextMonth;
          });

          if (visibleUpcoming.length === 0) return null;

          return (
            <View style={styles.upcomingSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="flash" size={14} color={C.amber} />
                <Text style={styles.upcomingTitle}>Upcoming Exams</Text>
              </View>

              {visibleUpcoming.map((job) => {
                const daysUntil = Math.ceil(
                  (new Date(job.examDate) - new Date()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <TouchableOpacity
                    key={job._id}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedJob(job);
                      setScreen("detail");
                    }}
                  >
                    <View style={styles.upcomingCard}>
                      <View style={[
                        styles.upcomingBar,
                        daysUntil <= 7 && { backgroundColor: C.danger },
                        daysUntil <= 30 && daysUntil > 7 && { backgroundColor: C.amber },
                        daysUntil > 30 && { backgroundColor: C.primary },
                      ]} />

                      <View style={styles.upcomingCardBody}>
                        <Text style={styles.upcomingJobTitle} numberOfLines={1}>
                          {job.title}
                        </Text>
                        <Text style={styles.upcomingJobOrg} numberOfLines={1}>
                          {job.organization}
                        </Text>
                        <View style={styles.upcomingMeta}>
                          <Ionicons name="calendar-outline" size={11} color={C.textMid} />
                          <Text style={styles.upcomingDate}>
                            {new Date(job.examDate).toDateString()}
                          </Text>
                        </View>
                      </View>

                      <View style={[
                        styles.upcomingPill,
                        daysUntil <= 7 && styles.upcomingPillUrgent,
                        daysUntil <= 30 && daysUntil > 7 && styles.upcomingPillSoon,
                        daysUntil > 30 && styles.upcomingPillFar,
                      ]}>
                        <Text style={[
                          styles.upcomingPillNum,
                          daysUntil <= 7 && { color: C.danger },
                          daysUntil <= 30 && daysUntil > 7 && { color: C.amber },
                          daysUntil > 30 && { color: C.primary },
                        ]}>
                          {daysUntil}
                        </Text>
                        <Text style={[
                          styles.upcomingPillLabel,
                          daysUntil <= 7 && { color: C.danger },
                          daysUntil <= 30 && daysUntil > 7 && { color: C.amber },
                          daysUntil > 30 && { color: C.primary },
                        ]}>
                          days left
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })()}




        {/* ── Selected Date Exams ── */}
        {selectedDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="calendar" size={14} color={C.primary} />
              <Text style={styles.sectionTitle}>
                {new Date(selectedDate + "T00:00:00").toDateString()}
              </Text>
              <Text style={styles.sectionCount}>
                {selectedExams.length} exam{selectedExams.length > 1 ? "s" : ""}
              </Text>
            </View>

            {selectedExams.length === 0 ? (
              <View style={styles.noExamBox}>
                <Text style={styles.noExamText}>No exams on this date</Text>
              </View>
            ) : (
              selectedExams.map(job => (
                <ExamCard
                  key={job._id}
                  job={job}
                  onPress={() => {
                    setSelectedJob(job);
                    setScreen("detail");
                  }}
                  onApply={() => Linking.openURL(job.link)}
                />
              ))
            )}
          </View>
        )}

        {/* ── All Exams This Month ── */}
        {!selectedDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="list-outline" size={14} color="rgba(255,255,255,0.4)" />
              <Text style={styles.sectionLabel}>
                All Exams in {MONTHS[month - 1]}
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator color={C.primary} style={{ marginTop: 20 }} />
            ) : allExamDates.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={44} color="rgba(255,255,255,0.12)" />
                <Text style={styles.emptyText}>No exams this month</Text>
                <Text style={styles.emptySubText}>
                  Navigate to another month or check back later
                </Text>
              </View>
            ) : (
              allExamDates.map(dateKey => (
                <View key={dateKey}>
                  {/* Date separator */}
                  <View style={styles.dateSeparator}>
                    <View style={styles.dateSeparatorLine} />
                    <Text style={styles.dateSeparatorText}>
                      {new Date(dateKey + "T00:00:00").toDateString()}
                    </Text>
                    <View style={styles.dateSeparatorLine} />
                  </View>

                  {grouped[dateKey].map(job => (
                    <ExamCard
                      key={job._id}
                      job={job}
                      onPress={() => {
                        setSelectedJob(job);
                        setScreen("detail");
                      }}
                      onApply={() => Linking.openURL(job.link)}
                    />
                  ))}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── EXAM CARD ────────────────────────────────────────────────────────────────
function ExamCard({ job, onPress, onApply }) {
  const daysUntil = Math.ceil(
    (new Date(job.examDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isPast = daysUntil < 0;
  const isToday = daysUntil === 0;
  const isSoon = daysUntil > 0 && daysUntil <= 7;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.examCard}>
        <View style={styles.examCardLeft}>
          <View style={styles.examOrgIcon}>
            <Text style={styles.examOrgText}>
              {job.organization?.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.examCardBody}>
          <Text style={styles.examTitle} numberOfLines={2}>{job.title}</Text>
          <Text style={styles.examOrg}>{job.organization}</Text>

          <View style={styles.examTags}>
            {job.state && (
              <View style={styles.examTagState}>
                <Text style={styles.examTagStateText} numberOfLines={1}>{job.state}</Text>
              </View>
            )}
            {job.qualification && (
              <View style={styles.examTagQual}>
                <Text style={styles.examTagQualText} numberOfLines={1}>{job.qualification}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.examCardRight}>
          {/* Countdown pill */}
          <View style={[
            styles.countdownPill,
            isPast && styles.countdownPast,
            isToday && styles.countdownToday,
            isSoon && styles.countdownSoon,
          ]}>
            <Text style={[
              styles.countdownText,
              isPast && { color: C.textLight },
              isToday && { color: C.white },
              isSoon && { color: C.danger },
            ]}>
              {isPast ? "Done"
                : isToday ? "Today!"
                  : isSoon ? `${daysUntil}d`
                    : `${daysUntil}d`}
            </Text>
          </View>

          <TouchableOpacity style={styles.examApplyBtn} onPress={onApply}>
            <Ionicons name="open-outline" size={13} color={C.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    backgroundColor: C.bg,        // matches screen bg so it doesn't look odd when stuck
    paddingHorizontal: 16,
    zIndex: 10,
  },
  container: { flex: 1, backgroundColor: C.bg },
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
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 },
  examCountBadge: {
    backgroundColor: C.primaryMuted, paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.25)",
  },
  examCountText: { fontSize: 11, fontWeight: "700", color: C.primary },

  // ── Month Nav ────────────────────────────────────────────────────────────────
  monthNav: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  monthNavBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  monthTitleWrap: { alignItems: "center" },
  monthTitle: { fontSize: 22, fontWeight: "800", color: C.white, letterSpacing: 0.3 },
  yearText: { fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: "500" },

  // ── Calendar Card ────────────────────────────────────────────────────────────
  calendarCard: {
    backgroundColor: C.surface, borderRadius: 20, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
  },
  calLoader: { paddingVertical: 40, alignItems: "center" },

  // Day headers
  dayHeaders: { flexDirection: "row", marginBottom: 8 },
  dayHeader: {
    flex: 1, textAlign: "center", fontSize: 11,
    fontWeight: "700", color: C.textLight, letterSpacing: 0.5,
  },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap" },
  emptyCell: { width: "14.28%", aspectRatio: 1 },
  cell: {
    width: "14.28%", aspectRatio: 1,
    alignItems: "center", justifyContent: "center",
    borderRadius: 10,
  },
  cellToday: { backgroundColor: C.amberMuted, borderWidth: 1.5, borderColor: C.amber },
  cellSelected: { backgroundColor: "#EAF1FB", borderWidth: 1.5, borderColor: "#A8C4E8" },
  cellHasExam: { backgroundColor: C.primaryMuted },

  cellText: { fontSize: 13, fontWeight: "500", color: C.text },
  cellTextToday: { fontWeight: "800", color: C.amber },
  cellTextSelected: { fontWeight: "800", color: "#2C5F96" },
  cellTextHasExam: { fontWeight: "700", color: C.primary },

  examDot: {
    width: 16, height: 6, borderRadius: 3,
    backgroundColor: C.primary, marginTop: 2,
    alignItems: "center", justifyContent: "center",
  },
  examDotSelected: { backgroundColor: "#2C5F96" },
  examDotText: { fontSize: 8, fontWeight: "800", color: C.white },

  // ── Legend ───────────────────────────────────────────────────────────────────
  legend: {
    flexDirection: "row", justifyContent: "center",
    gap: 20, marginBottom: 20,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: "500" },

  // ── Section ──────────────────────────────────────────────────────────────────
  section: { marginBottom: 16 },
  sectionHeaderRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: C.white },
  sectionCount: { fontSize: 12, fontWeight: "600", color: C.primary },
  sectionLabel: {
    flex: 1, fontSize: 11, fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1, textTransform: "uppercase",
  },

  // ── No exam box ──────────────────────────────────────────────────────────────
  noExamBox: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12,
    padding: 16, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  noExamText: { fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: "500" },

  // ── Date Separator ───────────────────────────────────────────────────────────
  dateSeparator: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginVertical: 12,
  },
  dateSeparatorLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  dateSeparatorText: {
    fontSize: 11, fontWeight: "700",
    color: "rgba(255,255,255,0.35)", letterSpacing: 0.5,
  },

  // ── Empty State ──────────────────────────────────────────────────────────────
  emptyState: { alignItems: "center", paddingTop: 30, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.25)" },
  emptySubText: {
    fontSize: 13, color: "rgba(255,255,255,0.15)",
    textAlign: "center", paddingHorizontal: 30,
  },

  // ── Exam Card ────────────────────────────────────────────────────────────────
  examCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.surface, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
    gap: 10,
  },
  examCardLeft: {},
  examOrgIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.primaryMuted, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(10,140,95,0.18)",
  },
  examOrgText: { color: C.primary, fontWeight: "700", fontSize: 13, letterSpacing: 0.5 },
  examCardBody: { flex: 1 },
  examTitle: { fontSize: 13, fontWeight: "700", color: C.text, lineHeight: 18 },
  examOrg: { fontSize: 11, color: C.textMid, marginTop: 2, marginBottom: 6, fontWeight: "500" },
  examTags: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  examTagState: {
    backgroundColor: C.stateTag, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, borderColor: C.stateBorder,
  },
  examTagStateText: { fontSize: 10, fontWeight: "600", color: "#2C5F96", maxWidth: 90 },
  examTagQual: {
    backgroundColor: C.primaryMuted, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
  },
  examTagQualText: { fontSize: 10, fontWeight: "600", color: C.primary, maxWidth: 90 },

  examCardRight: { alignItems: "center", gap: 8 },
  countdownPill: {
    backgroundColor: C.surfaceAlt, paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
    minWidth: 44, alignItems: "center",
  },
  countdownPast: { backgroundColor: C.surfaceAlt },
  countdownToday: { backgroundColor: C.primary, borderColor: C.primaryDark },
  countdownSoon: { backgroundColor: "#FFF0EE", borderColor: "#F5C6C0" },
  countdownText: { fontSize: 11, fontWeight: "800", color: C.textMid },
  examApplyBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: C.primaryMuted, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",

  },
  // ── Upcoming Section ─────────────────────────────────────────────────────────
  upcomingSection: { marginBottom: 20 },
  upcomingTitle: {
    flex: 1, fontSize: 13, fontWeight: "700",
    color: C.white, letterSpacing: 0.2,
  },
  upcomingCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.surface, borderRadius: 14,
    marginBottom: 8, overflow: "hidden",
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  upcomingBar: {
    width: 4, alignSelf: "stretch",
  },
  upcomingCardBody: {
    flex: 1, padding: 12, gap: 3,
  },
  upcomingJobTitle: {
    fontSize: 13, fontWeight: "700", color: C.text,
  },
  upcomingJobOrg: {
    fontSize: 11, color: C.textMid, fontWeight: "500",
  },
  upcomingMeta: {
    flexDirection: "row", alignItems: "center",
    gap: 4, marginTop: 4,
  },
  upcomingDate: {
    fontSize: 11, color: C.textMid, fontWeight: "500",
  },
  upcomingPill: {
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 12, paddingVertical: 8,
    marginRight: 12, borderRadius: 10,
    minWidth: 54,
  },
  upcomingPillUrgent: { backgroundColor: "#FFF0EE", borderWidth: 1, borderColor: "#F5C6C0" },
  upcomingPillSoon: { backgroundColor: C.amberMuted, borderWidth: 1, borderColor: C.amberBorder },
  upcomingPillFar: { backgroundColor: C.primaryMuted, borderWidth: 1, borderColor: "rgba(10,140,95,0.22)" },
  upcomingPillNum: {
    fontSize: 18, fontWeight: "800",
  },
  upcomingPillLabel: {
    fontSize: 9, fontWeight: "600", letterSpacing: 0.3,
  },
});