import React from "react";

import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
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


const QUIZ_CATEGORIES = [
  {
    id: "1",
    title: "Reasoning",
    icon: "bulb-outline",
  },
  {
    id: "2",
    title: "Math",
    icon: "calculator-outline",
  },
  {
    id: "3",
    title: "Science",
    icon: "flask-outline",
  },
  {
    id: "4",
    title: "General Knowledge",
    icon: "book-outline",
  },
  {
    id: "5",
    title: "History",
    icon: "people-outline",
  },
  {
    id: "6",
    title: "Economy",
    icon: "cash-outline",
  },
  {
    id: "7",
    title: "Geography",
    icon: "earth-outline",
  },
  {
    id: "8",
    title: "Polity",
    icon: "shield-checkmark-outline",
  },
  {
    id: "9",
    title: "Aptitude",
    icon: "calculator-outline",
  },
  {
    id: "10",
    title: "Computer",
    icon: "desktop-outline",
  },
  {
    id: "11",
    title: "English",
    icon: "language-outline",
  },
  {
    id: "12",
    title: "Current Affairs",
    icon: "newspaper-outline",
  },
];

export default function QuizCategoryScreen({
  setScreen,
  setSelectedQuizCategory,
  setDailyQuizMode,
}) {

  const insets = useSafeAreaInsets();

  const openCategory = (category) => {

    setSelectedQuizCategory(category);
    setDailyQuizMode(false);

    setScreen("quiz");
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
            color="#fff"
          />
        </TouchableOpacity>

        <View>

          <Text style={styles.headerTitle}>
            Quiz Categories
          </Text>

          <Text style={styles.headerSub}>
            Choose your topic
          </Text>

        </View>

      </View>

      {/* Categories */}
      <FlatList
        data={QUIZ_CATEGORIES}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        renderItem={({ item }) => (

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() =>
              openCategory(item.title)
            }
          >

            <View style={styles.iconWrap}>

              <Ionicons
                name={item.icon}
                size={28}
                color={C.primary}
              />

            </View>

            <Text style={styles.cardTitle}>
              {item.title}
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
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  headerSub: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    marginTop: 2,
  },

  // Grid
  listContent: {
    padding: 14,
    gap: 12,
  },

  card: {
    width: "48%",
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },

  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },

});