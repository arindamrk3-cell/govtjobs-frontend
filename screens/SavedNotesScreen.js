import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

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

export default function SavedNotesScreen({

  setScreen,
  setSelectedQuickNote
  
}) {

  const insets = useSafeAreaInsets();

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadSavedNotes();
  }, []);

  const loadSavedNotes = async () => {

    try {

      const raw = await AsyncStorage.getItem(
        "savedNotes"
      );

      const saved = raw
        ? JSON.parse(raw)
        : [];

      setNotes(saved);
      

    } catch (err) {

      console.log(err);
    }
  };

  const removeBookmark = async (id) => {

    try {

      const updated = notes.filter(
        (item) => item._id !== id
      );

      setNotes(updated);

      await AsyncStorage.setItem(
        "savedNotes",
        JSON.stringify(updated)
      );

    } catch (err) {

      console.log(err);
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
          onPress={() => setScreen("home")}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={C.white}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>

          <Text style={styles.headerTitle}>
            Saved Notes
          </Text>

          <Text style={styles.headerSub}>
            Your bookmarked PDFs
          </Text>

        </View>

      </View>

      {/* Content */}
      {notes.length === 0 ? (

        <View style={styles.emptyState}>

          <Ionicons
            name="bookmark-outline"
            size={56}
            color="rgba(255,255,255,0.12)"
          />

          <Text style={styles.emptyText}>
            No saved notes
          </Text>

          <Text style={styles.emptySub}>
            Bookmark PDFs to see them here
          </Text>

        </View>

      ) : (

        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => {

  setSelectedQuickNote(item);

  setScreen("quick-note");

}}
            >

              <View style={styles.topRow}>

                <View style={styles.iconWrap}>
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={C.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>

                  <Text
                    style={styles.title}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  <Text style={styles.subject}>
                    {item.subject}
                  </Text>

                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() =>
                    removeBookmark(item._id)
                  }
                >
                  <Ionicons
                    name="bookmark"
                    size={18}
                    color={C.primary}
                  />
                </TouchableOpacity>

              </View>

            </TouchableOpacity>

          )}
        />

      )}

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

  // List
  listContent: {
    padding: 14,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },

  topRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    lineHeight: 20,
  },

  subject: {
    fontSize: 12,
    color: C.textMid,
    marginTop: 4,
  },

  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.25)",
  },

  emptySub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.15)",
  },

});