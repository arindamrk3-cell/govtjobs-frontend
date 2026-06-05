import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
} from "react-native";

import  { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";

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

export default function NotesScreen({
  setScreen,
  setSelectedCategory,
}) {

  const insets = useSafeAreaInsets();
  const [categories,
  setCategories] = useState([]);
  useEffect(() => {
  fetchCategories();
}, []);
const fetchCategories = async () => {

  try {

    const cached =
      await AsyncStorage.getItem(
        "noteCategories"
      );

    if (cached) {

      setCategories(
        JSON.parse(cached)
      );
    }

    const res = await API.get(
      "/quick-notes/categories"
    );
    

    const formatted =
      res.data.map((cat) => ({

        title: cat,

        icon:
          cat === "Reasoning"
            ? "bulb-outline"
            : cat === "Aptitude"
            ? "calculator-outline"
            : cat === "Math"
            ? "calculator-outline"
            : cat === "English"
            ? "language-outline"
            : cat === "Science"
            ? "flask-outline"
            : "book-outline",

      }));

    setCategories(formatted);

    await AsyncStorage.setItem(
      "noteCategories",
      JSON.stringify(formatted)
    );

  } catch (err) {

    console.log(err);
  }
};

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
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
            PDF Notes
          </Text>

          <Text style={styles.headerSub}>
            Study materials & PDFs
          </Text>
        </View>
      </View>

      {/* ── Categories ── */}
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{
          justifyContent: "space-between"
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => {
              setSelectedCategory(item.title);
              setScreen("notes-list");
            }}
          >

            <View style={styles.iconWrap}>
              <Ionicons
                name={item.icon}
                size={26}
                color={C.primary}
              />
            </View>

            <Text style={styles.cardTitle}>
              {item.title}
            </Text>

            <Text style={styles.cardSub}>
              Notes & PDFs
            </Text>

          </TouchableOpacity>
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header ─────────────────────
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

  // ── Grid ─────────────────────
  listContent: {
    padding: 14,
    paddingBottom: 40,
    gap: 12,
  },

  card: {
    width: "48%",
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 18,
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

  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },

  cardSub: {
    fontSize: 12,
    color: C.textMid,
    marginTop: 4,
  },

});