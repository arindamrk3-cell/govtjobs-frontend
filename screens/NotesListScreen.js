import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert, TextInput
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

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

function NoteCard({ item, onPress, onBookmark }) {

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
    >

      <View style={styles.card}>

        {/* Top */}
        <View style={styles.topRow}>

          <View style={styles.pdfIcon}>
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
              {item.category}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookmarkBtn}
            onPress={onBookmark}
          >
            <Ionicons
              name="bookmark-outline"
              size={18}
              color={C.primary}
            />
          </TouchableOpacity>

        </View>

        {/* Description */}
        <Text
          style={styles.description}
          numberOfLines={3}
        >
          {item.content?.[0]?.text}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>

          <View style={styles.infoRow}>
            <Ionicons
              name="document-outline"
              size={14}
              color={C.textMid}
            />

            <Text style={styles.pages}>
              Quick Note
            </Text>
          </View>

          <View style={styles.openBtn}>
            <Text style={styles.openText}>
              Open
            </Text>

            <Ionicons
              name="arrow-forward"
              size={12}
              color={C.primary}
            />
          </View>

        </View>

      </View>

    </TouchableOpacity>
  );
}

export default function NotesListScreen({
  selectedCategory,
  setScreen,
  setSelectedNote,
  selectedNote, setSelectedQuickNote,
}) {

  const insets = useSafeAreaInsets();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, [selectedCategory]);

  const fetchNotes = async () => {

    try {
      
      const cacheKey = `notes_${selectedCategory.toLowerCase()
        .replace(/\s/g, "_")}`;
      const cachedNotes = await AsyncStorage.getItem(cacheKey);
      if (cachedNotes) {
        const parsed =
          JSON.parse(cachedNotes);
        setNotes(
          parsed
        );
        setFilteredNotes(parsed);
      }

      const res = await API.get(
        `/quick-notes?category=${selectedCategory}`
      );


      setNotes(res.data);
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify(res.data)
      );
      setFilteredNotes(res.data);

    } catch (err) {
      console.log(err);

    } finally {
      setLoading(false);
    }
  };

  const searchNotes = (text) => {

    setSearch(text);

    if (!text.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter((item) =>
      item.title
        ?.toLowerCase()
        .includes(text.toLowerCase())
    );

    setFilteredNotes(filtered);
  };
  const bookmarkNote = async (note) => {

    try {

      const raw = await AsyncStorage.getItem("savedNotes");

      let saved = raw
        ? JSON.parse(raw)
        : [];

      const alreadyExists = saved.some(
        (n) => n._id === note._id
      );

      if (alreadyExists) {

        saved = saved.filter(
          (n) => n._id !== note._id
        );

      } else {

        saved.unshift(note);
      }

      await AsyncStorage.setItem(
        "savedNotes",
        JSON.stringify(saved)
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
          onPress={() => setScreen("notes")}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={C.white}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>

          <Text style={styles.headerTitle}>
            {selectedCategory}
          </Text>

          <Text style={styles.headerSub}>
            Study notes & PDFs
          </Text>

        </View>

      </View>
      <View style={styles.searchWrap}>

        <Ionicons
          name="search"
          size={18}
          color="rgba(255,255,255,0.4)"
        />

        <TextInput
          placeholder="Search notes..."
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={search}
          onChangeText={searchNotes}
          style={styles.searchInput}
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => searchNotes("")}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color="rgba(255,255,255,0.4)"
            />
          </TouchableOpacity>
        )}

      </View>

      {/* Content */}
      {loading ? (

        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={C.primary}
          />
        </View>

      ) : filteredNotes.length === 0 ? (

        <View style={styles.emptyState}>

          <Ionicons
            name="document-outline"
            size={54}
            color="rgba(255,255,255,0.12)"
          />

          <Text style={styles.emptyText}>
            No notes available
          </Text>

          <Text style={styles.emptySub}>
            PDFs will appear here
          </Text>

        </View>

      ) : (

        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NoteCard
              item={item}
              onPress={() => {

                setSelectedQuickNote(item);

                setScreen("quick-note");

              }}
              onBookmark={() => {
                bookmarkNote(item);
              }}
            />
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

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
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

  topRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  pdfIcon: {
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

  description: {
    fontSize: 13,
    color: C.textMid,
    lineHeight: 20,
    marginBottom: 14,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  pages: {
    fontSize: 12,
    color: C.textMid,
    fontWeight: "500",
  },

  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  openText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.primary,
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
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 6,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  searchInput: {
    flex: 1,
    color: C.white,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 14,
  },
  bookmarkBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },

});