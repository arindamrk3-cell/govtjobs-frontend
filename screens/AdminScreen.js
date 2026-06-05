import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
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
  text: "#0D1F1A",
  textMid: "#4A6360",
  textLight: "#8FA8A2",
  border: "#DDE8E4",
  danger: "#C0392B",
  white: "#FFFFFF",
};

const STATES = [
  "All India", "West Bengal", "Delhi", "Maharashtra",
  "Uttar Pradesh", "Tamil Nadu", "Gujarat", "Karnataka",
  "Rajasthan", "Bihar", "Odisha", "Punjab", "Haryana",
  "Assam", "Kerala", "Andhra Pradesh", "Telangana", "Jharkhand",
];

const QUALIFICATIONS = [
  "8th Pass", "10th Pass", "12th Pass", "ITI",
  "Diploma", "Graduation", "B.Tech / BE", "MBA",
  "Post Graduation", "PhD",
];

export default function AdminScreen({ token, setScreen }) {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [qualification, setQualification] = useState("");
  const [state, setState] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [link, setLink] = useState("");
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("add");
  const [examDate, setExamDate] = useState("");

  // Admit card form
  const [acTitle, setAcTitle] = useState("");
  const [acOrg, setAcOrg] = useState("");
  const [acExamDate, setAcExamDate] = useState("");
  const [acLastDate, setAcLastDate] = useState("");
  const [acState, setAcState] = useState("All India");
  const [acQual, setAcQual] = useState("All");
  const [acLink, setAcLink] = useState("");

  // Result form
  const [rTitle, setRTitle] = useState("");
  const [rOrg, setROrg] = useState("");
  const [rResultDate, setRResultDate] = useState("");
  const [rState, setRState] = useState("All India");
  const [rQual, setRQual] = useState("All");
  const [rLink, setRLink] = useState("");

  const [updateTab, setUpdateTab] = useState("admitcard"); // "admitcard" | "result"
  const [addingUpdate, setAddingUpdate] = useState(false);
  const [vacancies, setVacancies] = useState("");
  const [salary, setSalary] = useState("");
  const [ageLimit, setAgeLimit] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [selectionProcess, setSelectionProcess] = useState("");
  const [applicationFee, setApplicationFee] = useState("");
  const [users, setUsers] = useState([]);
  
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] =useState("");
  const [noteCategory, setNoteCategory] = useState("");
  
  const [addingNote, setAddingNote] = useState(false);



  useEffect(() => {
    fetchStats();
    fetchJobs();
    fetchUsers();

  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/admin/jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const deleteUser = async (id) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/admin/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            fetchStats();
          } catch (err) {
            console.log(err);
          }
        }
      }
    ]);
  };

  const deleteJob = async (id) => {
    Alert.alert("Delete Job", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/admin/jobs/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchJobs();
          } catch (err) {
            console.log(err);
          }
        }
      }
    ]);
  };

  const addJob = async () => {
    if (!title || !organization || !qualification || !state || !lastDate || !link) {
      Alert.alert("Missing Fields", "Please fill all fields before adding a job.");
      return;
    }
    setAdding(true);
    try {
      await API.post("/admin/jobs/add", {
        title, organization, qualification,
        state, last_date: lastDate, examDate: examDate || undefined, link,
        vacancies: vacancies || undefined,
        salary: salary || undefined,
        ageLimit: ageLimit || undefined,
        eligibility: eligibility || undefined,
        selectionProcess: selectionProcess || undefined,
        applicationFee: applicationFee || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
      setTitle(""); setOrganization(""); setQualification("");
      setState(""); setLastDate(""); setLink("");
      setExamDate(""); setVacancies(""); setSalary(""); setAgeLimit("");
      setEligibility(""); setSelectionProcess(""); setApplicationFee("");

      fetchJobs();
      fetchStats();
      setActiveTab("jobs");
      Alert.alert("✅ Success", "Job added and notifications sent to matching users.");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to add job.");
    } finally {
      setAdding(false);
    }
  };
  const addAdmitCard = async () => {
    if (!acTitle || !acOrg || !acLink) {
      Alert.alert("Missing Fields", "Title, Organization and Link are required.");
      return;
    }
    setAddingUpdate(true);
    try {
      await API.post("/admin/admit-cards/add", {
        title: acTitle, organization: acOrg,
        examDate: acExamDate || undefined,
        lastDate: acLastDate || undefined,
        state: acState, qualification: acQual, link: acLink
      }, { headers: { Authorization: `Bearer ${token}` } });

      setAcTitle(""); setAcOrg(""); setAcExamDate("");
      setAcLastDate(""); setAcLink("");
      Alert.alert("✅ Added", "Admit card posted successfully.");
    } catch (err) {
      Alert.alert("Error", "Failed to add admit card.");
    } finally {
      setAddingUpdate(false);
    }
  };

  const addResult = async () => {
    if (!rTitle || !rOrg || !rLink) {
      Alert.alert("Missing Fields", "Title, Organization and Link are required.");
      return;
    }
    setAddingUpdate(true);
    try {
      await API.post("/admin/results/add", {
        title: rTitle, organization: rOrg,
        resultDate: rResultDate || undefined,
        state: rState, qualification: rQual, link: rLink
      }, { headers: { Authorization: `Bearer ${token}` } });

      setRTitle(""); setROrg(""); setRResultDate(""); setRLink("");
      Alert.alert("✅ Added", "Result posted successfully.");
    } catch (err) {
      Alert.alert("Error", "Failed to add result.");
    } finally {
      setAddingUpdate(false);
    }
  };

//   const addNote = async () => {

//   if (
//     !noteTitle ||
//     !noteCategory ||
//     !noteSubject ||
//     !notePdfUrl
//   ) {
//     Alert.alert(
//       "Missing Fields",
//       "Please fill required fields"
//     );

//     return;
//   }

//   try {

//     setAddingNote(true);

//     await API.post(
//       "/quick-notes",
//       {
//         title: noteTitle,
//         category: noteCategory,
//         subject: noteSubject,
//         description: noteDescription,
//         pdfUrl: notePdfUrl,
//         pages: notePages,
//         language: noteLanguage,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     Alert.alert(
//       "Success",
//       "Note added successfully"
//     );

//     setNoteTitle("");
//     setNoteCategory("");
//     setNoteSubject("");
//     setNoteDescription("");
//     setNotePdfUrl("");
//     setNotePages("");
//     setNoteLanguage("English");

//   } catch (err) {

//     console.log(err);

//     Alert.alert(
//       "Error",
//       "Failed to add note"
//     );

//   } finally {

//     setAddingNote(false);
//   }
// };

const addNote = async () => {

  if (
    !noteTitle ||
    !noteCategory ||
    !noteContent
  ) {

    Alert.alert(
      "Missing Fields",
      "Please fill all required fields"
    );

    return;
  }

  try {

    setAddingNote(true);

    await API.post(
      "/quick-notes",
      {
        title: noteTitle,

        category: noteCategory,

        content: noteContent
          .split("\n")
          .filter(Boolean)
  //         .map((line) => ({

  //           type: line.startsWith("#")
  //             ? "heading"
  //   : line.startsWith("•")
  //   ? "bullet"
  //   : "text",

  //           text: line
  // .replace("•", "")
  // .replace("#", "")
  // .trim(),

  //         })),
  .map((line) => {

  let type = "text";

  if (line.startsWith("#")) {
    type = "heading";
  }

  else if (line.startsWith("•")) {
    type = "bullet";
  }

  else if (line.startsWith("!")) {
    type = "important";
  }

  else if (line.startsWith("=")) {
    type = "formula";
  }

  return {

    type,

    text: line
      .replace("#", "")
      .replace("•", "")
      .replace("!", "")
      .replace("=", "")
      .trim(),

  };

})
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    Alert.alert(
      "Success",
      "Quick note created"
    );

    setNoteTitle("");
    setNoteCategory("");
    setNoteContent("");

  } catch (err) {

    console.log(err);

    Alert.alert(
      "Error",
      "Failed to create note"
    );

  } finally {

    setAddingNote(false);
  }
};
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingTop: insets.top }} />

          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("profile")}>
              <Ionicons name="arrow-back" size={20} color={C.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={13} color={C.primary} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          </View>

          {/* ── Stats Row ── */}
          {stats && (
            <View style={styles.statsRow}>
              {/* <View style={styles.statCard}>
              <Ionicons name="people-outline" size={20} color={C.primary} />
              <Text style={styles.statNum}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View> */}
              <TouchableOpacity style={styles.statCard} onPress={() => setActiveTab("users")}>
                <Ionicons name="people-outline" size={20} color={C.primary} />
                <Text style={styles.statNum}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Users</Text>
              </TouchableOpacity>

              <View style={styles.statCard}>
                <Ionicons name="briefcase-outline" size={20} color="#2C5F96" />
                <Text style={[styles.statNum, { color: "#2C5F96" }]}>{stats.totalJobs}</Text>
                <Text style={styles.statLabel}>Jobs</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#7B4F00" />
                <Text style={[styles.statNum, { color: "#7B4F00" }]}>{jobs.filter(j => j.verified).length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>
          )}

          {/* ── Content Management ── */}
          <View style={styles.contentRow}>
            <TouchableOpacity
              style={[styles.contentCard, { borderLeftColor: "#2C5F96" }]}
              onPress={() => setScreen("admin-current-affair")}
              activeOpacity={0.85}
            >
              <View style={[styles.contentIcon, { backgroundColor: "#EAF1FB" }]}>
                <Ionicons name="newspaper-outline" size={18} color="#2C5F96" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contentTitle}>Current Affairs</Text>
                <Text style={styles.contentSub}>Post daily updates</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contentCard, { borderLeftColor: "#F5A623" }]}
              onPress={() => setScreen("admin-quiz")}
              activeOpacity={0.85}
            >
              <View style={[styles.contentIcon, { backgroundColor: "#FFF4E0" }]}>
                <Ionicons name="help-circle-outline" size={18} color="#F5A623" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contentTitle}>Quiz Manager</Text>
                <Text style={styles.contentSub}>Add quiz questions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>


            



          </View>

          {/* ── Tab Switcher ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
            style={{ marginBottom: 16 }}
          >
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "add" && styles.tabBtnActive]}
              onPress={() => setActiveTab("add")}
            >
              <Ionicons name="add-circle-outline" size={15} color={activeTab === "add" ? C.primary : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.tabText, activeTab === "add" && styles.tabTextActive]}>Add Job</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "add-note" && styles.tabBtnActive]}
              onPress={() => setActiveTab("add-note")}
            >
              <Ionicons name="document-text-outline" size={15} color={activeTab === "add-note" ? C.primary : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.tabText, activeTab === "add-note" && styles.tabTextActive]}>Add Note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "jobs" && styles.tabBtnActive]}
              onPress={() => setActiveTab("jobs")}>
              <Ionicons name="list-outline" size={15} color={activeTab === "jobs" ? C.primary : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.tabText, activeTab === "jobs" && styles.tabTextActive]}>
                All Jobs ({jobs.length})
              </Text>
            </TouchableOpacity>



            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "updates" && styles.tabBtnActive]}
              onPress={() => setActiveTab("updates")}
            >
              <Ionicons name="document-text-outline" size={15} color={activeTab === "updates" ? C.primary : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.tabText, activeTab === "updates" && styles.tabTextActive]}>
                Updates
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "users" && styles.tabBtnActive]}
              onPress={() => setActiveTab("users")}>
              <Ionicons name="people-outline" size={15} color={activeTab === "users" ? C.primary : "rgba(255,255,255,0.4)"} />
              <Text style={[styles.tabText, activeTab === "users" && styles.tabTextActive]}>
                Users ({users.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>



          {/* ── Add Job Form ── */}
          {activeTab === "add" && (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>New Job Listing</Text>

              {/* Title */}
              <Text style={styles.fieldLabel}>Job Title *</Text>
              <TextInput
                placeholder="e.g. Junior Engineer 2026"
                placeholderTextColor={C.textLight}
                style={styles.input}
                value={title}
                onChangeText={setTitle}
              />

              {/* Organization */}
              <Text style={styles.fieldLabel}>Organization *</Text>
              <TextInput
                placeholder="e.g. DRDO, SSC, Railway Board"
                placeholderTextColor={C.textLight}
                style={styles.input}
                value={organization}
                onChangeText={setOrganization}
              />

              {/* Qualification Dropdown */}
              <Text style={styles.fieldLabel}>Qualification *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {QUALIFICATIONS.map(q => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.chip, qualification === q && styles.chipActive]}
                    onPress={() => setQualification(q)}
                  >
                    <Text style={[styles.chipText, qualification === q && styles.chipTextActive]}>
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {qualification ? (
                <Text style={styles.selectedValue}>✓ {qualification}</Text>
              ) : null}

              {/* State Dropdown */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>State *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {STATES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, state === s && styles.chipActive]}
                    onPress={() => setState(s)}
                  >
                    <Text style={[styles.chipText, state === s && styles.chipTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {state ? (
                <Text style={styles.selectedValue}>✓ {state}</Text>
              ) : null}

              {/* Last Date */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Last Date *</Text>
              <TextInput
                placeholder="YYYY-MM-DD  e.g. 2026-06-30"
                placeholderTextColor={C.textLight}
                style={styles.input}
                value={lastDate}
                onChangeText={setLastDate}
              />
              <Text style={styles.fieldLabel}>Exam Date (optional)</Text>
              <TextInput
                placeholder="YYYY-MM-DD  e.g. 2026-06-15"
                placeholderTextColor={C.textLight}
                style={styles.input}
                value={examDate}
                onChangeText={setExamDate}
              />

              {/* Link */}
              <Text style={styles.fieldLabel}>Official Link *</Text>
              <TextInput
                placeholder="https://..."
                placeholderTextColor={C.textLight}
                style={styles.input}
                value={link}
                onChangeText={setLink}
                autoCapitalize="none"
                keyboardType="url"
              />
              {/* Divider */}
              <View style={styles.formDivider} />
              <Text style={styles.formSectionHeading}>Additional Details (Optional)</Text>

              {/* Vacancies */}
              <Text style={styles.fieldLabel}>Total Vacancies</Text>
              <TextInput
                placeholder="e.g. 500"
                placeholderTextColor={C.textLight}
                style={styles.input}
                value={vacancies}
                onChangeText={setVacancies}
                keyboardType="numeric"
              />

              {/* Salary */}
              <Text style={styles.fieldLabel}>Salary / Pay Scale</Text>
              <TextInput
                placeholder="e.g. ₹25,500 - ₹81,100 per month"
                placeholderTextColor={C.textLight}
                style={styles.input}
                value={salary}
                onChangeText={setSalary}
              />

              {/* Age Limit */}
              <Text style={styles.fieldLabel}>Age Limit</Text>
              <TextInput
                placeholder="e.g. 18-27 years (relaxation as per rules)"
                placeholderTextColor={C.textLight}
                style={styles.input}
                value={ageLimit}
                onChangeText={setAgeLimit}
              />

              {/* Application Fee */}
              <Text style={styles.fieldLabel}>Application Fee</Text>
              <TextInput
                placeholder="e.g. Gen: ₹500 | SC/ST: ₹250 | Female: Free"
                placeholderTextColor={C.textLight}
                style={styles.input}
                value={applicationFee}
                onChangeText={setApplicationFee}
              />

              {/* Eligibility */}
              <Text style={styles.fieldLabel}>Eligibility / Education</Text>
              <TextInput
                placeholder="e.g. B.Tech in CS/IT or equivalent from recognized university"
                placeholderTextColor={C.textLight}
                style={[styles.input, styles.multilineInput]}
                value={eligibility}
                onChangeText={setEligibility}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Selection Process */}
              <Text style={styles.fieldLabel}>Selection Process</Text>
              <TextInput
                placeholder="e.g. Written Exam → Physical Test → Medical → Document Verification"
                placeholderTextColor={C.textLight}
                style={[styles.input, styles.multilineInput]}
                value={selectionProcess}
                onChangeText={setSelectionProcess}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Submit */}
              <TouchableOpacity
                style={styles.addBtn}
                onPress={addJob}
                disabled={adding}
              >
                {adding
                  ? <ActivityIndicator color={C.white} />
                  : <>
                    <Ionicons name="add-circle-outline" size={18} color={C.white} />
                    <Text style={styles.addBtnText}>Add Job & Notify Users</Text>
                  </>
                }
              </TouchableOpacity>
            </View>
          )}
          {/* {activeTab === "add-note" && (
  <View style={styles.card}>

    <Text style={styles.cardHeading}>
      Add PDF Note
    </Text>

    
    <Text style={styles.fieldLabel}>Title *</Text>
    <TextInput
      placeholder="e.g. SSC Maths Notes"
      placeholderTextColor={C.textLight}
      style={styles.input}
      value={noteTitle}
      onChangeText={setNoteTitle}
    />

    
    <Text style={styles.fieldLabel}>Category *</Text>
    <TextInput
      placeholder="e.g. SSC"
      placeholderTextColor={C.textLight}
      style={styles.input}
      value={noteCategory}
      onChangeText={setNoteCategory}
    />

    
    <Text style={styles.fieldLabel}>Subject *</Text>
    <TextInput
      placeholder="e.g. Mathematics"
      placeholderTextColor={C.textLight}
      style={styles.input}
      value={noteSubject}
      onChangeText={setNoteSubject}
    />

   
    <Text style={styles.fieldLabel}>Description</Text>
    <TextInput
      placeholder="Short note description"
      placeholderTextColor={C.textLight}
      style={[styles.input, styles.multilineInput]}
      multiline
      numberOfLines={3}
      value={noteDescription}
      onChangeText={setNoteDescription}
    />

    
    <Text style={styles.fieldLabel}>PDF Link *</Text>
    <TextInput
      placeholder="https://drive.google.com/..."
      placeholderTextColor={C.textLight}
      style={styles.input}
      value={notePdfUrl}
      onChangeText={setNotePdfUrl}
      autoCapitalize="none"
    />

    
    <Text style={styles.fieldLabel}>Pages</Text>
    <TextInput
      placeholder="e.g. 120"
      placeholderTextColor={C.textLight}
      style={styles.input}
      value={notePages}
      onChangeText={setNotePages}
      keyboardType="numeric"
    />

    
    <Text style={styles.fieldLabel}>Language</Text>
    <TextInput
      placeholder="e.g. English"
      placeholderTextColor={C.textLight}
      style={styles.input}
      value={noteLanguage}
      onChangeText={setNoteLanguage}
    />

    <TouchableOpacity
      style={styles.addBtn}
      onPress={addNote}
      disabled={addingNote}
    >
      {addingNote ? (
        <ActivityIndicator color={C.white} />
      ) : (
        <>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={C.white}
          />
          <Text style={styles.addBtnText}>
            Add PDF Note
          </Text>
        </>
      )}
    </TouchableOpacity>

  </View>
)} */}
          {activeTab === "add-note" && (
  <View style={styles.card}>

    <Text style={styles.cardHeading}>
      Create Quick Note
    </Text>

    {/* Title */}
    <Text style={styles.fieldLabel}>
      Title *
    </Text>

    <TextInput
      placeholder="e.g. Percentage Short Tricks"
      placeholderTextColor={C.textLight}
      style={styles.input}
      value={noteTitle}
      onChangeText={setNoteTitle}
    />

    {/* Category */}
    <Text style={styles.fieldLabel}>
      Category *
    </Text>

    <TextInput
      placeholder="e.g. Aptitude"
      placeholderTextColor={C.textLight}
      style={styles.input}
      value={noteCategory}
      onChangeText={setNoteCategory}
    />

    {/* Content */}
    <Text style={styles.fieldLabel}>
      Content *
    </Text>

    <TextInput
     placeholder={`Write your note here...

Formatting Guide:

# Heading
• Bullet Point
! Important Note
= Formula

Example:

# Percentage Tricks

Percentage means per hundred

• 50% = 1/2
• 25% = 1/4

! Important:
Frequently asked in SSC exams

= Formula:
Percentage = (Value / Total) × 100`}
      placeholderTextColor={C.textLight}
      style={[
        styles.input,
        {
          height: 220,
          textAlignVertical: "top",
        },
      ]}
      multiline
      value={noteContent}
      onChangeText={setNoteContent}
    />

    {/* Submit */}
    <TouchableOpacity
      style={styles.addBtn}
      onPress={addNote}
      disabled={addingNote}
    >

      {addingNote ? (

        <ActivityIndicator color={C.white} />

      ) : (

        <>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={C.white}
          />

          <Text style={styles.addBtnText}>
            Create Note
          </Text>
        </>

      )}

    </TouchableOpacity>

  </View>
)}

          {/* ── Jobs List ── */}
          {activeTab === "jobs" && (
            <View>
              {jobs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="briefcase-outline" size={44} color="rgba(255,255,255,0.15)" />
                  <Text style={styles.emptyText}>No jobs posted yet</Text>
                </View>
              ) : (
                jobs.map(job => (
                  <View key={job._id} style={styles.jobCard}>
                    <View style={styles.jobCardTop}>
                      <View style={styles.jobOrgIcon}>
                        <Text style={styles.jobOrgText}>
                          {job.organization?.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                        <Text style={styles.jobOrg} numberOfLines={1}>{job.organization}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteJob(job._id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={C.danger} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.jobTags}>
                      <View style={styles.jobTag}>
                        <Text style={styles.jobTagText}>{job.qualification}</Text>
                      </View>
                      <View style={[styles.jobTag, { backgroundColor: "#EAF1FB", borderColor: "#A8C4E8" }]}>
                        <Text style={[styles.jobTagText, { color: "#2C5F96" }]}>{job.state}</Text>
                      </View>
                    </View>

                    <View style={styles.jobFooter}>
                      <Ionicons name="calendar-outline" size={12} color={C.danger} />
                      <Text style={styles.jobDate}>
                        Closes {new Date(job.last_date).toDateString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
          {activeTab === "users" && (
            <View>
              {users.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={44} color="rgba(255,255,255,0.15)" />
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              ) : (
                users.map((user) => (
                  <View key={user._id} style={styles.jobCard}>
                    <View style={styles.jobCardTop}>
                      <View style={styles.jobOrgIcon}>
                        <Text style={styles.jobOrgText}>
                          {user.name?.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle}>{user.name}</Text>
                        <Text style={styles.jobOrg}>{user.email}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteUser(user._id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={C.danger} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.jobTags}>
                      {user.state && (
                        <View style={[styles.jobTag, { backgroundColor: "#EAF1FB", borderColor: "#A8C4E8" }]}>
                          <Text style={[styles.jobTagText, { color: "#2C5F96" }]}>{user.state}</Text>
                        </View>
                      )}
                      {user.qualification && (
                        <View style={styles.jobTag}>
                          <Text style={styles.jobTagText}>{user.qualification}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === "updates" && (
            <View style={styles.card}>

              {/* Sub tab switcher */}
              <View style={styles.updateSubTabs}>
                <TouchableOpacity
                  style={[styles.subTabBtn, updateTab === "admitcard" && styles.subTabActive]}
                  onPress={() => setUpdateTab("admitcard")}
                >
                  <Ionicons name="document-text-outline" size={14} color={updateTab === "admitcard" ? C.primary : C.textMid} />
                  <Text style={[styles.subTabText, updateTab === "admitcard" && { color: C.primary }]}>
                    Admit Card
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.subTabBtn, updateTab === "result" && styles.subTabActive]}
                  onPress={() => setUpdateTab("result")}
                >
                  <Ionicons name="trophy-outline" size={14} color={updateTab === "result" ? "#F5A623" : C.textMid} />
                  <Text style={[styles.subTabText, updateTab === "result" && { color: "#F5A623" }]}>
                    Result
                  </Text>
                </TouchableOpacity>
              </View>

              {updateTab === "admitcard" ? (
                <>
                  <Text style={styles.cardHeading}>Post Admit Card</Text>

                  <Text style={styles.fieldLabel}>Title *</Text>
                  <TextInput placeholder="e.g. DRDO CEPTAM Admit Card 2026" placeholderTextColor={C.textLight}
                    style={styles.input} value={acTitle} onChangeText={setAcTitle} />

                  <Text style={styles.fieldLabel}>Organization *</Text>
                  <TextInput placeholder="e.g. DRDO" placeholderTextColor={C.textLight}
                    style={styles.input} value={acOrg} onChangeText={setAcOrg} />

                  <Text style={styles.fieldLabel}>Exam Date</Text>
                  <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={C.textLight}
                    style={styles.input} value={acExamDate} onChangeText={setAcExamDate} />

                  <Text style={styles.fieldLabel}>Last Date to Download</Text>
                  <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={C.textLight}
                    style={styles.input} value={acLastDate} onChangeText={setAcLastDate} />

                  <Text style={styles.fieldLabel}>State</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {STATES.map(s => (
                      <TouchableOpacity key={s}
                        style={[styles.chip, acState === s && styles.chipActive]}
                        onPress={() => setAcState(s)}
                      >
                        <Text style={[styles.chipText, acState === s && styles.chipTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Qualification</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {["All", ...QUALIFICATIONS].map(q => (
                      <TouchableOpacity key={q}
                        style={[styles.chip, acQual === q && styles.chipActive]}
                        onPress={() => setAcQual(q)}
                      >
                        <Text style={[styles.chipText, acQual === q && styles.chipTextActive]}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Official Link *</Text>
                  <TextInput placeholder="https://..." placeholderTextColor={C.textLight}
                    style={styles.input} value={acLink} onChangeText={setAcLink}
                    autoCapitalize="none" keyboardType="url" />

                  <TouchableOpacity style={styles.addBtn} onPress={addAdmitCard} disabled={addingUpdate}>
                    {addingUpdate
                      ? <ActivityIndicator color={C.white} />
                      : <Text style={styles.addBtnText}>Post Admit Card</Text>
                    }
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.cardHeading}>Post Result</Text>

                  <Text style={styles.fieldLabel}>Title *</Text>
                  <TextInput placeholder="e.g. SSC CHSL Result 2026" placeholderTextColor={C.textLight}
                    style={styles.input} value={rTitle} onChangeText={setRTitle} />

                  <Text style={styles.fieldLabel}>Organization *</Text>
                  <TextInput placeholder="e.g. SSC" placeholderTextColor={C.textLight}
                    style={styles.input} value={rOrg} onChangeText={setROrg} />

                  <Text style={styles.fieldLabel}>Result Date</Text>
                  <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={C.textLight}
                    style={styles.input} value={rResultDate} onChangeText={setRResultDate} />

                  <Text style={styles.fieldLabel}>State</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {STATES.map(s => (
                      <TouchableOpacity key={s}
                        style={[styles.chip, rState === s && styles.chipActive]}
                        onPress={() => setRState(s)}
                      >
                        <Text style={[styles.chipText, rState === s && styles.chipTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Qualification</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {["All", ...QUALIFICATIONS].map(q => (
                      <TouchableOpacity key={q}
                        style={[styles.chip, rQual === q && styles.chipActive]}
                        onPress={() => setRQual(q)}
                      >
                        <Text style={[styles.chipText, rQual === q && styles.chipTextActive]}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Official Link *</Text>
                  <TextInput placeholder="https://..." placeholderTextColor={C.textLight}
                    style={styles.input} value={rLink} onChangeText={setRLink}
                    autoCapitalize="none" keyboardType="url" />

                  <TouchableOpacity style={[styles.addBtn, { backgroundColor: "#F5A623" }]}
                    onPress={addResult} disabled={addingUpdate}>
                    {addingUpdate
                      ? <ActivityIndicator color={C.white} />
                      : <Text style={styles.addBtnText}>Post Result</Text>
                    }
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },
  adminBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.primaryMuted, paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.25)",
  },
  adminBadgeText: { fontSize: 12, fontWeight: "700", color: C.primary },

  // ── Stats ────────────────────────────────────────────────────────────────────
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14,
    alignItems: "center", gap: 4, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  statNum: { fontSize: 20, fontWeight: "800", color: C.text },
  statLabel: { fontSize: 10, fontWeight: "600", color: C.textMid, letterSpacing: 0.3 },

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  tabRow: {
  flexDirection: "row",
  gap: 8,
  paddingHorizontal: 0,
},
  tabBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  tabBtnActive: { backgroundColor: C.primaryMuted, borderColor: "rgba(10,140,95,0.30)" },
  tabText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.4)" },
  tabTextActive: { color: C.primary },

  // ── Form Card ────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
  },
  cardHeading: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 16 },
  fieldLabel: {
    fontSize: 11, fontWeight: "700", color: C.textMid,
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8,
  },
  input: {
    backgroundColor: C.surfaceAlt, borderRadius: 10, borderWidth: 1,
    borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text, marginBottom: 14,
  },

  // ── Chips ─────────────────────────────────────────────────────────────────────
  chipScroll: { marginBottom: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: C.surfaceAlt, marginRight: 8,
    borderWidth: 1, borderColor: C.border,
  },
  chipActive: { backgroundColor: C.primaryMuted, borderColor: "rgba(10,140,95,0.35)" },
  chipText: { fontSize: 13, fontWeight: "600", color: C.textMid },
  chipTextActive: { color: C.primary, fontWeight: "700" },
  selectedValue: { fontSize: 12, fontWeight: "600", color: C.primary, marginBottom: 4 },

  // ── Add Button ────────────────────────────────────────────────────────────────
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: C.primary, paddingVertical: 14, borderRadius: 14, marginTop: 8,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 8, elevation: 5,
  },
  addBtnText: { color: C.white, fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },

  // ── Job Cards ─────────────────────────────────────────────────────────────────
  jobCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  jobCardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  jobOrgIcon: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: C.primaryMuted,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(10,140,95,0.18)",
  },
  jobOrgText: { color: C.primary, fontWeight: "700", fontSize: 13 },
  jobTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  jobOrg: { fontSize: 12, color: C.textMid, marginTop: 1 },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: "#FFF0EE", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#F5C6C0",
  },
  jobTags: { flexDirection: "row", gap: 6, marginBottom: 8 },
  jobTag: {
    backgroundColor: C.primaryMuted, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
  },
  jobTagText: { fontSize: 11, fontWeight: "600", color: C.primary },
  jobFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  jobDate: { fontSize: 11, fontWeight: "600", color: C.danger },

  // ── Empty ─────────────────────────────────────────────────────────────────────
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.3)" },
  updateSubTabs: {
    flexDirection: "row", gap: 8, marginBottom: 16,
  },
  subTabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    paddingVertical: 9, borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1, borderColor: C.border,
  },
  subTabActive: {
    backgroundColor: C.primaryMuted,
    borderColor: "rgba(10,140,95,0.30)",
  },
  subTabText: { fontSize: 13, fontWeight: "600", color: C.textMid },
  formDivider: {
    height: 1, backgroundColor: C.border,
    marginVertical: 16,
  },
  formSectionHeading: {
    fontSize: 13, fontWeight: "700", color: C.textMid,
    letterSpacing: 0.5, marginBottom: 14,
  },
  multilineInput: {
    minHeight: 80, paddingTop: 12,
  },
  contentRow: {
    gap: 10, marginBottom: 16,
  },
  contentCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderLeftWidth: 3,
  },
  contentIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  contentTitle: {
    fontSize: 14, fontWeight: "700", color: C.white,
  },
  contentSub: {
    fontSize: 11, color: "rgba(255,255,255,0.4)",
    marginTop: 2, fontWeight: "500",
  },
});