import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function BottomNav({ screen, setScreen }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>

      <Tab
        icon="home"
        label="Home"
        active={screen === "home"}
        onPress={() => setScreen("home")}
      />
      <Tab
        icon="grid"
        label="Categories"
        active={screen === "category"}
        onPress={() => setScreen("category")}
      />
      <Tab
        icon="document-text"
        label="Tracker"
        active={screen === "tracker"}
        onPress={() => setScreen("tracker")}
      />

      <Tab
        icon="document-text"
        label="Updates"
        active={screen === "updates"}
        onPress={() => setScreen("updates")}
      />
      <Tab
        icon="person"
        label="Profile"
        active={screen === "profile"}
        onPress={() => setScreen("profile")}
      />

    </View>
  );
}

function Tab({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress}>
      <Ionicons
        name={active ? icon : `${icon}-outline`}
        size={22}
        color={active ? "#0A8C5F" : "rgba(255,255,255,0.35)"}
      />
      <Text style={[styles.label, active && styles.active]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 65,
    backgroundColor: "#0d1e19",
    borderTopWidth: 1,
    borderTopColor: "rgba(55, 51, 51, 0.21)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(53, 42, 42, 0.37)",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10
  },

  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.2
  },

  active: {
    color: "#0A8C5F",
    fontWeight: "bold",
  },
});