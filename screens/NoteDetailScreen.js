import React from "react";

import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#0D1F1A",
  surface: "#FFFFFF",
  primary: "#0A8C5F",
  primaryMuted: "#E6F4EF",
  text: "#0D1F1A",
  textMid: "#4A6360",
  border: "#DDE8E4",
  white: "#FFFFFF",
};

export default function NoteDetailScreen({
  selectedNote,
  setScreen,
}) {

  const insets = useSafeAreaInsets();

  if (!selectedNote) return null;

  const getDrivePreviewLink = (url) => {

  try {

    if (!url.includes("drive.google.com")) {
      return url;
    }

    const match = url.match(/\/d\/(.*?)\//);

    if (!match || !match[1]) {
      return url;
    }

    const fileId = match[1];

    return `https://drive.google.com/file/d/${fileId}/preview`;

  } catch {

    return url;
  }
};

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top }
        ]}
      >

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setScreen("notes-list")}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={C.white}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            PDF Notes
          </Text>

          <Text style={styles.headerSub}>
            Study materials
          </Text>
        </View>

      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* PDF Card */}
        <View style={styles.card}>

          {/* Icon */}
          <View style={styles.iconWrap}>
            <Ionicons
              name="document-text-outline"
              size={42}
              color={C.primary}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {selectedNote.title}
          </Text>

          {/* Subject */}
          <View style={styles.subjectChip}>
            <Text style={styles.subjectText}>
              {selectedNote.subject}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {selectedNote.description || "No description available."}
          </Text>

          {/* Info Row */}
          <View style={styles.infoRow}>

            <View style={styles.infoCard}>
              <Ionicons
                name="document-outline"
                size={18}
                color={C.primary}
              />

              <Text style={styles.infoLabel}>
                Pages
              </Text>

              <Text style={styles.infoValue}>
                {selectedNote.pages}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons
                name="language-outline"
                size={18}
                color={C.primary}
              />

              <Text style={styles.infoLabel}>
                Language
              </Text>

              <Text style={styles.infoValue}>
                {selectedNote.language}
              </Text>
            </View>

          </View>

          {/* Open Button */}
          <TouchableOpacity
            style={styles.openBtn}
            activeOpacity={0.9}
            onPress={() =>
              Linking.openURL(
  getDrivePreviewLink(selectedNote.pdfUrl)
)
            }
          >

            <Ionicons
              name="open-outline"
              size={18}
              color={C.white}
            />

            <Text style={styles.openText}>
              Open PDF
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
  style={styles.secondaryBtn}
  onPress={() =>
    Linking.openURL(selectedNote.pdfUrl)
  }
>

  <Ionicons
    name="download-outline"
    size={18}
    color={C.primary}
  />

  <Text style={styles.secondaryBtnText}>
    Download PDF
  </Text>

  </TouchableOpacity>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
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
  },

  headerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    marginTop: 1,
  },

  // Content
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // Main Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },

  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    lineHeight: 30,
  },

  subjectChip: {
    alignSelf: "center",
    marginTop: 14,
    backgroundColor: C.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },

  subjectText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 12,
  },

  description: {
    marginTop: 22,
    fontSize: 14,
    lineHeight: 24,
    color: C.textMid,
    textAlign: "center",
  },

  // Info
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 26,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#F7FAF8",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },

  infoLabel: {
    marginTop: 8,
    fontSize: 11,
    color: C.textMid,
    fontWeight: "600",
  },

  infoValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },

  // Button
  openBtn: {
    marginTop: 30,
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    shadowColor: C.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  openText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
  marginTop: 12,
  height: 52,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "rgba(10,140,95,0.25)",
  backgroundColor: C.primaryMuted,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
},

secondaryBtnText: {
  color: C.primary,
  fontWeight: "700",
  fontSize: 14,
},

});