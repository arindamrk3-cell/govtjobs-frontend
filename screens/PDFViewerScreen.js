import React from "react";

import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import { WebView } from "react-native-webview";

import { Ionicons } from "@expo/vector-icons";

export default function PDFViewerScreen({
  selectedNote,
  setScreen,
}) {

  const pdfUrl =
    `https://docs.google.com/gview?embedded=1&url=${selectedNote.pdfUrl}`;

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setScreen("note-detail")}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {selectedNote.title}
        </Text>

      </View>

      {/* PDF */}
      <WebView
        source={{ uri: pdfUrl }}
        style={{ flex: 1 }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0D1F1A",
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
    backgroundColor: "#0D1F1A",
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

});