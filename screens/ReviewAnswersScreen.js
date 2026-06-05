import React from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#0D1F1A",
  surface: "#FFFFFF",
  text: "#0D1F1A",
  textMid: "#4A6360",
  border: "#DDE8E4",
  white: "#FFFFFF",
  primary: "#0A8C5F",
  correct: "#1BA94C",
  danger: "#D64545",
  amber: "#F5A623",
};

export default function ReviewAnswersScreen({
  userAnswers,
  setScreen,
}) {
    const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top}]}>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setScreen("quiz")}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        <View>

          <Text style={styles.headerTitle}>
            Review Answers
          </Text>

          <Text style={styles.headerSub}>
            Learn from mistakes
          </Text>

        </View>

      </View>

      {/* Answers */}
      <FlatList
        data={userAnswers}
        keyExtractor={(_, index) =>
          index.toString()
        }
        contentContainerStyle={{
          padding: 14,
          paddingBottom: 40,
        }}
        renderItem={({ item, index }) => {

          const isCorrect =
            item.selected === item.correct;

          return (

            <View style={styles.card}>

              {/* Question */}
              <Text style={styles.questionNum}>
                Question {index + 1}
              </Text>

              <Text style={styles.question}>
                {item.question}
              </Text>

              {/* Selected */}
              <View
                style={[
                  styles.answerBox,
                  {
                    borderColor: isCorrect
                      ? C.correct
                      : C.danger,
                  },
                ]}
              >

                <Text style={styles.answerLabel}>
                  Your Answer
                </Text>

                <Text
                  style={[
                    styles.answerText,
                    {
                      color: isCorrect
                        ? C.correct
                        : C.danger,
                    },
                  ]}
                >
                  {item.selected}
                </Text>

              </View>

              {/* Correct */}
              {!isCorrect && (

                <View
                  style={[
                    styles.answerBox,
                    {
                      borderColor: C.correct,
                    },
                  ]}
                >

                  <Text style={styles.answerLabel}>
                    Correct Answer
                  </Text>

                  <Text
                    style={[
                      styles.answerText,
                      { color: C.correct },
                    ]}
                  >
                    {item.correct}
                  </Text>

                </View>

              )}

              {/* Explanation */}
              {item.explanation ? (

                <View style={styles.explanationWrap}>

                  <View style={styles.explanationTop}>

                    <Ionicons
                      name="bulb-outline"
                      size={16}
                      color={C.amber}
                    />

                    <Text style={styles.explanationTitle}>
                      Explanation
                    </Text>

                  </View>

                  <Text style={styles.explanationText}>
                    {item.explanation}
                  </Text>

                </View>

              ) : null}

            </View>

          );
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  
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
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
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

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },

  questionNum: {
    color: C.primary,
    fontWeight: "700",
    marginBottom: 10,
  },

  question: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    lineHeight: 22,
  },

  answerBox: {
    marginTop: 16,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },

  answerLabel: {
    fontSize: 12,
    color: C.textMid,
    marginBottom: 6,
  },

  answerText: {
    fontSize: 15,
    fontWeight: "700",
  },

  explanationWrap: {
    marginTop: 18,
    backgroundColor: "#F6F7F8",
    borderRadius: 14,
    padding: 14,
  },

  explanationTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  explanationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.amber,
  },

  explanationText: {
    fontSize: 13,
    lineHeight: 22,
    color: C.textMid,
  },

});