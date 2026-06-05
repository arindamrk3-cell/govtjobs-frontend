import React, { useState } from "react";

import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import API from "../services/api";

const C = {
  bg: "#0D1F1A",
  surface: "#FFFFFF",
  primary: "#0A8C5F",
  text: "#0D1F1A",
  textMid: "#4A6360",
  border: "#DDE8E4",
  white: "#FFFFFF",
};

export default function AddNoteScreen({
  token,
  setScreen,
}) {

  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");


  const [loading, setLoading] = useState(false);

  const submitNote = async () => {

    if (
      !title ||
      !category ||
      !subject ||
      !pdfUrl
    ) {
      Alert.alert(
        "Missing fields",
        "Please fill all required fields"
      );

      return;
    }

    try {

      setLoading(true);

      await API.post(
        "/quick-notes",
        {
          title,
          category,
          content: content
            .split("\n")
            .filter(Boolean)
            .map((line) => ({

              type: line.startsWith("•")
                ? "bullet"
                : "text",

              text: line.replace("•", "").trim(),

            })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Success",
        "Note added successfully"
      );

      setScreen("admin");

    } catch (err) {

      console.log(err);

      Alert.alert(
        "Error",
        "Failed to add note"
      );

    } finally {

      setLoading(false);
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
          onPress={() => setScreen("admin")}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={C.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Create Quick Note
        </Text>

      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Category"
          value={category}
          onChangeText={setCategory}
        />

        <Input
          label="Subject"
          value={subject}
          onChangeText={setSubject}
        />
        <Input
          label="Content"
          value={content}
          onChangeText={setContent}
          multiline
        />



        <TouchableOpacity
          style={styles.submitBtn}
          onPress={submitNote}
          activeOpacity={0.9}
        >

          {loading ? (

            <ActivityIndicator color="#fff" />

          ) : (

            <Text style={styles.submitText}>
              Add Note
            </Text>

          )}

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
}

function Input({
  label,
  multiline,
  ...props
}) {

  return (
    <View style={{ marginBottom: 18 }}>

      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          multiline && {
            height: 120,
            textAlignVertical: "top",
          },
        ]}
        placeholder={label}
        placeholderTextColor="rgba(255,255,255,0.25)"
        multiline={multiline}
        {...props}
      />

    </View>
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

  // Content
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  label: {
    color: "rgba(255,255,255,0.45)",
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: C.white,
    fontSize: 14,
  },

  submitBtn: {
    marginTop: 10,
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

});