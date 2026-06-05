import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";


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
  amber: "#F5A623",
  amberMuted: "#FFF4E0",
  amberBorder: "#F5C87A",
  correct: "#00C853",
  correctMuted: "#B9F6CA",
  wrong: "#FF5252",
  wrongMuted: "#FFCDD2",
};

export default function QuizScreen({ setScreen, selectedQuizCategory, setUserAnswers, userAnswers, dailyQuizMode, setDailyQuizMode, showDailyQuiz, setShowDailyQuiz,token }) {
  const insets = useSafeAreaInsets();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);


  useEffect(() => {
    fetchQuiz();
  }, [selectedQuizCategory,
  dailyQuizMode]);

  useEffect(() => {

    if (quizStarted && quizzes.length > 0) {

      setTimeLeft(quizzes.length * 60);

    }

  }, [quizStarted]);

  useEffect(() => {

    if (!quizStarted || finished) {
      return;
    }

    if (timeLeft <= 0) {
       saveResult();

      setFinished(true);

      return;
    }

    const timer = setInterval(() => {

      setTimeLeft((prev) => prev - 1);

    }, 1000);

    return () => clearInterval(timer);

  }, [timeLeft, quizStarted, finished]);

  const fetchQuiz = async () => {
    try {
      setQuizzes([]);
      let res;
      if (dailyQuizMode) {

        res = await API.get("/quizzes/daily");

      } else {


        res = await API.get(`/quizzes?category=${selectedQuizCategory}`);

      }
      if (dailyQuizMode) {
        setQuizzes(res.data);
      } else {
        const filtered = res.data.filter(quiz => !quiz.isDaily);
        setQuizzes(filtered.length > 0 ? filtered : res.data);
      }

    }
    catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const saveResult = async () => {

  try {
  //   const finalScore =
  // selected === currentQuiz.answer
  //   ? score + 1
  //   : score;

    await API.post(
      "/quizzes/save-result",
      {
        

        category:
          selectedQuizCategory,

        score,

        totalQuestions:
          quizzes.length,

        percentage:
          Math.round(
            (score / quizzes.length)
            * 100
          ),

        isDaily:
          dailyQuizMode,

      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  } catch (err) {

    console.log(err);

  }
};

  const checkAnswer = (option) => {
    setSelected(option);
    setShowAnswer(true);
    if (option === currentQuiz.answer) {
      setScore(prev => prev + 1);
    }
    setUserAnswers((prev) => [

      ...prev,

      {
        question: currentQuiz.question,

        selected: option,

        correct: currentQuiz.answer,

        explanation: currentQuiz.explanation,
      }

    ]);
  };

  const nextQuestion =  async () => {
    if (currentIndex + 1 < quizzes.length) {
      setCurrentIndex(prev => prev + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      if (dailyQuizMode) {

        const today = new Date().toDateString();

        await AsyncStorage.setItem(
          "dailyQuizCompleted",
          today
        );
        setShowDailyQuiz(false);



      }
      await saveResult();

      setFinished(true);

    }
  };

  const restartQuiz = () => {
    setUserAnswers([]);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setShowAnswer(false);
    setFinished(false);
    setTimeLeft(quizzes.length * 60);
    if (!dailyQuizMode) {
      setDailyQuizMode(false);
    }
    setQuizStarted(false);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
            <Ionicons name="arrow-back" size={20} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {dailyQuizMode ? "Daily Quiz" : `${selectedQuizCategory} Quiz`}
          </Text>
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty ───────────────────────────────────────────────────────────────────
  if (quizzes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
            <Ionicons name="arrow-back" size={20} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {dailyQuizMode ? "Daily Quiz" : `${selectedQuizCategory} Quiz`}
          </Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="help-circle-outline" size={52} color="rgba(255,255,255,0.12)" />
          <Text style={styles.emptyText}>No quizzes available</Text>
          <Text style={styles.emptySubText}>Check back later for new questions</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Finished ────────────────────────────────────────────────────────────────
  if (finished) {
    const percentage = Math.round((score / quizzes.length) * 100);
    const isPerfect = score === quizzes.length;
    const isGood = percentage >= 60;

    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
            <Ionicons name="arrow-back" size={20} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Results</Text>
        </View>

        <ScrollView contentContainerStyle={styles.finishedContent}>

          {/* Trophy */}
          <View style={styles.trophyWrap}>
            <Ionicons
              name={isPerfect ? "trophy" : isGood ? "ribbon" : "school"}
              size={64}
              color={isPerfect ? C.amber : isGood ? C.primary : C.textMid}
            />
          </View>

          {/* Score Card */}
          <View style={styles.scoreCard}>
            <Text style={styles.finishedTitle}>
              {isPerfect ? "Perfect Score! 🎉" : isGood ? "Well Done! 👏" : "Keep Practising! 💪"}
            </Text>

            <View style={styles.scoreBig}>
              <Text style={styles.scoreNum}>{score}</Text>
              <Text style={styles.scoreDivider}>/</Text>
              <Text style={styles.scoreTotal}>{quizzes.length}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View style={[
                styles.progressFill,
                { width: `${percentage}%` },
                !isGood && { backgroundColor: C.danger },
              ]} />
            </View>
            <Text style={styles.percentageText}>{percentage}% correct</Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="checkmark-circle" size={20} color={C.correct} />
                <Text style={[styles.statNum, { color: C.correct }]}>{score}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="close-circle" size={20} color={C.danger} />
                <Text style={[styles.statNum, { color: C.danger }]}>{quizzes.length - score}</Text>
                <Text style={styles.statLabel}>Wrong</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="help-circle" size={20} color={C.textMid} />
                <Text style={styles.statNum}>{quizzes.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.restartBtn}
            onPress={() => setScreen("review-answers")}
          >

            <Ionicons
              name="document-text-outline"
              size={18}
              color="#fff"
            />

            <Text style={styles.restartBtnText}>
              Review Answers
            </Text>

          </TouchableOpacity>

          {/* Buttons */}
          <TouchableOpacity style={styles.restartBtn} onPress={restartQuiz}>
            <Ionicons name="refresh-outline" size={18} color={C.white} />
            <Text style={styles.restartBtnText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={() => {

  if (dailyQuizMode) {


    setScreen("home");

  } else {
    setDailyQuizMode(false);

    setScreen("quiz-category");
  }
}}>
            <Ionicons name="list-outline" size={18} color={C.primary} />
            <Text style={styles.homeBtnText}>Go to Category</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }
  if (!quizStarted) {

    return (
      <SafeAreaView style={styles.container}>

        <View style={styles.quizIntro}>

          <View style={styles.quizIconWrap}>
            <Ionicons
              name="help-circle-outline"
              size={42}
              color={C.primary}
            />
          </View>

          <Text style={styles.quizTitle}>
            {selectedQuizCategory} Quiz
          </Text>

          <Text style={styles.quizSub}>
            Test your preparation
          </Text>

          {/* Info Cards */}
          <View style={styles.infoRow}>

            <View style={styles.infoCard}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={C.primary}
              />

              <Text style={styles.infoValue}>
                {quizzes.length}
              </Text>

              <Text style={styles.infoLabel}>
                Questions
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons
                name="time-outline"
                size={20}
                color={C.primary}
              />

              <Text style={styles.infoValue}>
                {quizzes.length} Min
              </Text>

              <Text style={styles.infoLabel}>
                Duration
              </Text>
            </View>

          </View>

          {/* Instructions */}
          <View style={styles.instructions}>

            <Text style={styles.instructionsTitle}>
              Instructions
            </Text>

            <Text style={styles.instructionsText}>
              • Each question carries 1 mark
            </Text>

            <Text style={styles.instructionsText}>
              • No negative marking
            </Text>

            <Text style={styles.instructionsText}>
              • Attempt all questions
            </Text>

          </View>

          {/* Start */}
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => {


              // Reset quiz state
              setCurrentIndex(0);

              setSelected(null);

              setScore(0);

              setShowAnswer(false);

              setFinished(false);

              // Reset timer
              setTimeLeft(quizzes.length * 60);

              // Start quiz
              setQuizStarted(true);

            }}
          >

            <Ionicons
              name="play"
              size={18}
              color="#fff"
            />

            <Text style={styles.startBtnText}>
              Start Quiz
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>
    );
  }

  // ── Quiz ────────────────────────────────────────────────────────────────────
  const currentQuiz = quizzes[currentIndex];
  const progress = ((currentIndex + 1) / quizzes.length) * 100;
  const formatTime = (seconds) => {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen("home")}>
          <Ionicons name="arrow-back" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {dailyQuizMode ? "Daily Quiz" : `${selectedQuizCategory} Quiz`}
        </Text>
        <View style={styles.scorePill}>
          <Ionicons name="star" size={12} color={C.amber} />
          <Text style={styles.scorePillText}>{score} pts</Text>
        </View>
      </View>
      <View style={styles.timerWrap}>

        <Ionicons
          name="time-outline"
          size={18}
          color="#fff"
        />

        <Text style={styles.timerText}>
          {formatTime(timeLeft)}
        </Text>

      </View>

      {/* ── Progress Bar ── */}
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {quizzes.length}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.quizContent}
      >

        {/* ── Question Card ── */}
        <View style={styles.questionCard}>
          <View style={styles.questionNumBadge}>
            <Text style={styles.questionNumText}>Q{currentIndex + 1}</Text>
          </View>
          <Text style={styles.question}>{currentQuiz.question}</Text>
        </View>

        <View style={styles.optionsWrap}>
          {currentQuiz.options.map((option, index) => {
            const isCorrect = option === currentQuiz.answer;
            const isSelected = option === selected;

            let optionStyle = styles.option;
            let textStyle = styles.optionText;
            let iconName = null;
            let iconColor = null;

            if (showAnswer) {
              if (isCorrect) {
                optionStyle = [styles.option, styles.optionCorrect];
                textStyle = [styles.optionText, styles.optionTextCorrect];
                iconName = "checkmark-circle";
                iconColor = C.correct;
              } else if (isSelected) {
                optionStyle = [styles.option, styles.optionWrong];
                textStyle = [styles.optionText, styles.optionTextWrong];
                iconName = "close-circle";
                iconColor = C.danger;
              }
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                disabled={showAnswer}
                onPress={() => checkAnswer(option)}
                activeOpacity={0.85}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {["A", "B", "C", "D"][index]}
                  </Text>
                </View>
                <Text style={[textStyle, { flex: 1 }]}>{option}</Text>
                {iconName && (
                  <Ionicons name={iconName} size={20} color={iconColor} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Answer & Explanation ── */}
        {showAnswer && (
          <View style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <Ionicons name="bulb-outline" size={16} color={C.amber} />
              <Text style={styles.answerTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanation}>{currentQuiz.explanation}</Text>

            <TouchableOpacity style={styles.nextBtn} onPress={nextQuestion}>
              <Text style={styles.nextText}>
                {currentIndex + 1 < quizzes.length ? "Next Question" : "See Results"}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={C.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: C.bg, borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: C.white, letterSpacing: 0.3 },
  scorePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.amberMuted, paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: C.amberBorder,
  },
  scorePillText: { fontSize: 12, fontWeight: "700", color: C.amber },
  timerWrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },

  timerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Progress ─────────────────────────────────────────────────────────────────
  progressWrap: {
    paddingHorizontal: 16, paddingVertical: 10, gap: 6,
  },
  progressTrack: {
    height: 6, backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 4, overflow: "hidden",
  },
  progressFill: {
    height: "100%", backgroundColor: C.primary,
    borderRadius: 4,
  },
  counterText: {
    fontSize: 11, fontWeight: "600",
    color: "rgba(255,255,255,0.35)", textAlign: "right",
  },

  // ── Quiz Content ─────────────────────────────────────────────────────────────
  quizContent: { padding: 14 },

  // ── Question Card ────────────────────────────────────────────────────────────
  questionCard: {
    backgroundColor: C.surface, borderRadius: 18, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5, gap: 10,
  },
  questionNumBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.primaryMuted, paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(10,140,95,0.22)",
  },
  questionNumText: { fontSize: 11, fontWeight: "700", color: C.primary, letterSpacing: 0.5 },
  question: { fontSize: 18, fontWeight: "700", color: C.text, lineHeight: 26 },

  // ── Options ──────────────────────────────────────────────────────────────────
  optionsWrap: { gap: 10, marginBottom: 14 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: C.surface, padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  optionCorrect: {
    backgroundColor: "#F0FFF4", borderColor: C.correct,
  },
  optionWrong: {
    backgroundColor: "#FFF5F5", borderColor: C.danger,
  },
  optionLetter: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.surfaceAlt, alignItems: "center",
    justifyContent: "center", borderWidth: 1, borderColor: C.border,
  },
  optionLetterText: { fontSize: 13, fontWeight: "800", color: C.textMid },
  optionText: { fontSize: 14, fontWeight: "500", color: C.text },
  optionTextCorrect: { color: "#1B5E20", fontWeight: "700" },
  optionTextWrong: { color: C.danger, fontWeight: "600" },

  // ── Answer Card ──────────────────────────────────────────────────────────────
  answerCard: {
    backgroundColor: C.amberMuted, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.amberBorder, gap: 10,
  },
  answerHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  answerTitle: { fontSize: 14, fontWeight: "700", color: "#7B4F00" },
  explanation: { fontSize: 14, color: "#7B4F00", lineHeight: 22 },

  // ── Next Button ──────────────────────────────────────────────────────────────
  nextBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    backgroundColor: C.primary, paddingVertical: 13,
    borderRadius: 12, marginTop: 4,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 4,
  },
  nextText: { color: C.white, fontWeight: "700", fontSize: 14 },

  // ── Finished Screen ──────────────────────────────────────────────────────────
  finishedContent: { padding: 20, alignItems: "center" },
  trophyWrap: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 20, marginTop: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
  },
  scoreCard: {
    backgroundColor: C.surface, borderRadius: 20, padding: 24,
    width: "100%", alignItems: "center", marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 5,
  },
  finishedTitle: { fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 16 },
  scoreBig: { flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 16 },
  scoreNum: { fontSize: 56, fontWeight: "900", color: C.primary },
  scoreDivider: { fontSize: 32, color: C.textLight, fontWeight: "300" },
  scoreTotal: { fontSize: 32, color: C.textMid, fontWeight: "600" },
  percentageText: { fontSize: 13, color: C.textMid, fontWeight: "600", marginTop: 6 },
  statsRow: {
    flexDirection: "row", alignItems: "center",
    marginTop: 16, width: "100%",
  },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: C.border },
  statNum: { fontSize: 22, fontWeight: "800", color: C.text },
  statLabel: { fontSize: 10, fontWeight: "600", color: C.textMid, letterSpacing: 0.3 },

  restartBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    backgroundColor: C.primary, paddingVertical: 14,
    borderRadius: 14, width: "100%", marginBottom: 10,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40, shadowRadius: 8, elevation: 5,
  },
  restartBtnText: { color: C.white, fontWeight: "700", fontSize: 15 },
  homeBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    backgroundColor: C.primaryMuted, paddingVertical: 14,
    borderRadius: 14, width: "100%",
    borderWidth: 1, borderColor: "rgba(10,140,95,0.25)",
  },
  homeBtnText: { color: C.primary, fontWeight: "700", fontSize: 15 },

  // ── Empty ────────────────────────────────────────────────────────────────────
  emptyState: {
    flex: 1, alignItems: "center",
    justifyContent: "center", gap: 10,
  },
  emptyText: { fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.25)" },
  emptySubText: { fontSize: 13, color: "rgba(255,255,255,0.15)", textAlign: "center" },
  quizIntro: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  quizIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },

  quizTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.white,
    textAlign: "center",
  },

  quizSub: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },

  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 30,
  },

  infoCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
  },

  infoValue: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
  },

  infoLabel: {
    marginTop: 4,
    fontSize: 12,
    color: C.textMid,
  },

  instructions: {
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 18,
  },

  instructionsTitle: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },

  instructionsText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    marginBottom: 8,
  },

  startBtn: {
    marginTop: 34,
    backgroundColor: C.primary,
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  startBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

});