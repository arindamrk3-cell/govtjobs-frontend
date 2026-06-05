import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, BackHandler } from "react-native";
import React, { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import BookmarkScreen from "./screens/BookmarkScreen";
import JobDetailScreen from "./screens/JobDetailScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AdminScreen from "./screens/AdminScreen";
import RegisterScreen from "./screens/RegisterScreen";
import OTPVerificationScreen from "./screens/OTPVerificationScreen";
import CategoryScreen from "./screens/CategoryScreen";
import BottomNav from "./components/BottomNav";
import OnboardingScreen from "./screens/OnboardingScreen";
import TrackerScreen from "./screens/TrackerScreen";
import AdmitCardScreen from "./screens/AdmitCardScreen";
import CalendarScreen from "./screens/CalendarScreen";
import CurrentAffairsScreen from "./screens/CurrentAffairsScreen";
import CurrentAffairDetailScreen from "./screens/CurrentAffairDetailScreen";
import AdminCurrentAffairScreen from "./screens/AdminCurrentAffairScreen";
import QuizScreen from "./screens/QuizScreen";
import AdminQuizScreen from "./screens/AdminQuizScreen";
import NotesScreen from "./screens/NotesScreen";
import NotesListScreen from "./screens/NotesListScreen";
import NoteDetailScreen from "./screens/NoteDetailScreen";
import AddNoteScreen from "./screens/AddNoteScreen";
import SavedNotesScreen from "./screens/SavedNotesScreen";
//import PDFViewerScreen from "./screens/PDFViewerScreen";
import QuizCategoryScreen from "./screens/QuizCategoryScreen";
import ReviewAnswersScreen from "./screens/ReviewAnswersScreen";
import QuickNoteScreen from "./screens/QuickNoteScreen";

import API from "./services/api";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export default function App() {
  const [screen, setScreen] = useState("login");
  const [token, setToken] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filter, setFilter] = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [trackerJob, setTrackerJob] = useState(null);
  const [selectedAffair, setSelectedAffair] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedQuizCategory, setSelectedQuizCategory] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [dailyQuizMode, setDailyQuizMode] =useState(false);
  const [showDailyQuiz, setShowDailyQuiz] =useState(true);
  const [selectedQuickNote, setSelectedQuickNote] =useState(null);
  const [tempEmail, setTempEmail] = useState(null);

  // useEffect(() => {
  //   AsyncStorage.clear(); // ← clears old token
  // }, []);
  useEffect(() => {
    
    checkLogin();
  }, []);
  useEffect(() => {
    Notifications.requestPermissionsAsync();

  }, []);
  useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    console.log('Notification received:', data);
    // Handle notification - navigate to relevant screen based on data
  });
  return () => subscription.remove();
}, []);
  useEffect(() => {
    const backAction = () => {
      if (screen === "login" || screen === "register") {// || screen === "home") {
        return false; // exit app normally
      }
      if (screen === "home") { return true; }
      if (screen === "detail") { setScreen("home"); return true; }
      if (screen === "bookmark") { setScreen("home"); return true; }
      if (screen === "profile") { setScreen("home"); return true; }
      if (screen === "calendar") { setScreen("home"); return true; }
      if (screen === "updates") { setScreen("home"); return true; }
      if (screen === "category") { setScreen("home"); return true; }
      if (screen === "tracker") { setScreen("home"); return true; }
      if (screen === "admin") { setScreen("profile"); return true; }
      if (screen === "onboarding") { return true; } // block back on onboarding
      if (screen === "current-affairs") { setScreen("home"); return true; }
      if (screen === "current-affair-detail") { setScreen("current-affairs"); return true; }
      if(screen === "admin-current-affair") { setScreen("admin"); return true; }
      if(screen === "admin-quiz") { setScreen("admin"); return true; }
      if(screen === "quiz-category") { setScreen("home"); return true; }
      if(screen === "quiz") { setScreen("quiz-category"); return true; }
      if(screen === "notes") { setScreen("home"); return true; }
      if(screen === "notes-list") { setScreen("notes"); return true; }
      if(screen === "quick-note") { setScreen("notes-list"); return true; }
      if(screen === "add-note") { setScreen("admin"); return true; }
      if(screen === "save-note") { setScreen("home"); return true; }
      if(screen === "otp-verification") {return true; }
      
      
      if(screen === "review-answers") { setScreen("quiz"); return true; }
      

      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [screen]);
  // useEffect(() => {
  //   //registerForPushNotificationsAsync();
  // }, []);

  const checkLogin = async () => {
    const savedToken = await AsyncStorage.getItem("token");
    const onboarded = await AsyncStorage.getItem("onboarded");
    if (!savedToken) return;
    try {
      await API.get("/user/profile", {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      setToken(savedToken);
      if (onboarded) {
        setScreen("home");
      } else {
        setScreen("onboarding");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Real invalid token — log out
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("onboarded");
        setScreen("login");
      } else {
        // Network error / server down — trust saved token
        setToken(savedToken);
        if (onboarded) {
          setScreen("home");
        } else {
          setScreen("onboarding");
        }
      }
    }

  };


  const onLoginSuccess = async (token) => {
    setToken(token);
    const onboarded = await AsyncStorage.getItem("onboarded");
    if (!onboarded) {
      setScreen("onboarding");
    } else {
      setScreen("home");
    }
  };


  async function getPushToken() {
    // let token;
    if (Platform.OS === "web") {
      console.log("Push not supported on web");
      return null;
    }

    if (!Device.isDevice) {
      console.log("Must use physical device");
      return null;
    }
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted")
        return null;
      const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Push TOken:", pushToken);
      return pushToken;
    }
    catch (err) {
      console.log("push token error:", err);
      return null;
    }
  }
  return (
    <SafeAreaProvider>
      <>
        {screen === "login" && (
          <LoginScreen setScreen={setScreen} setToken={setToken} onLoginSuccess={onLoginSuccess} getPushToken={getPushToken} />
        )}
        {screen === "register" && (
          <RegisterScreen
            setScreen={setScreen}
            setTempEmail={setTempEmail}
            setScreenToOTP={() => setScreen("otp-verification")}
          />
        )}
        {screen === "otp-verification" && (
          <OTPVerificationScreen
            email={tempEmail}
            setScreen={setScreen}
            onVerificationSuccess={() => setScreen("login")}
          />
        )}
        {screen === "onboarding" && (
          <OnboardingScreen
            token={token}
            getPushToken={getPushToken}
            setScreen={async (s) => {
              await AsyncStorage.setItem("onboarded", "true");
              setScreen(s);
            }}
          />
        )}

        {screen === "home" && (
          <HomeScreen
            token={token}
            setScreen={setScreen}
            setSelectedJob={setSelectedJob}
            getPushToken={getPushToken}  
            filter={filter}
            dailyQuizMode={dailyQuizMode}
            setDailyQuizMode={setDailyQuizMode}
            showDailyQuiz={showDailyQuiz}
            setShowDailyQuiz={setShowDailyQuiz}
          />
        )}
        {screen === "current-affairs" && (
          <CurrentAffairsScreen
            setScreen={setScreen}
            setSelectedAffair={setSelectedAffair}
          />
        )}
        {
          screen === "notes" && (
            <NotesScreen
  setScreen={setScreen}
  setSelectedCategory={setSelectedCategory}
/>
          )
        }
        {screen === "notes-list" && (
          <NotesListScreen
  selectedCategory={selectedCategory}
  setScreen={setScreen}
  selectedNote={selectedNote}
  setSelectedNote={setSelectedNote}
          setSelectedQuickNote={
    setSelectedQuickNote
  }
/>
)}
{screen === "quick-note" && (
  <QuickNoteScreen
    selectedQuickNote={selectedQuickNote}
    setScreen={setScreen}
  />
)}
{screen ==="notedetail" && (
  <NoteDetailScreen
  selectedNote={selectedNote}
  setScreen={setScreen}
/>

)}
        {screen === "current-affair-detail" && (
          <CurrentAffairDetailScreen
            affair={
              selectedAffair}
            setScreen={setScreen}
          />
        )}
        {screen === "quiz-category" && (
  <QuizCategoryScreen
    setScreen={setScreen}
    setSelectedQuizCategory={setSelectedQuizCategory}
    setDailyQuizMode={setDailyQuizMode}
  />
)}
        {screen === "quiz" && (
          <QuizScreen
          setScreen={setScreen}
          selectedQuizCategory={selectedQuizCategory}
          setUserAnswers={setUserAnswers}
          userAnswers={userAnswers}
          dailyQuizMode={dailyQuizMode}
  setDailyQuizMode={setDailyQuizMode}
  showDailyQuiz={showDailyQuiz}
  setShowDailyQuiz={setShowDailyQuiz}
  token={token}
           />
        )}
        {screen === "review-answers" && (
  <ReviewAnswersScreen
    userAnswers={userAnswers}
    setScreen={setScreen}
  />
)}
        {screen === "admin-quiz" && (
  <AdminQuizScreen
    token={token}
    setScreen={setScreen}
  />
)}
        {screen === "bookmark" && (
          <BookmarkScreen
            token={token}
            setScreen={setScreen}
            getPushToken={getPushToken}
            setSelectedJob={setSelectedJob}
          />
        )}
        {screen === "tracker" && (
          <TrackerScreen
            token={token}
            setScreen={setScreen}
            setSelectedJob={setSelectedJob}
          />
        )}

        {screen === "detail" && (
          <JobDetailScreen
            token={token}
            job={selectedJob}
            setScreen={setScreen}
            getPushToken={getPushToken}
          />
        )}
        {screen === "calendar" && (
          <CalendarScreen
            setScreen={setScreen}
            setSelectedJob={setSelectedJob}
          />
        )}
        {screen === "updates" && (
          <AdmitCardScreen setScreen={setScreen} />
        )}
        {screen === "profile" && (
          <ProfileScreen token={token} setScreen={setScreen} />
        )}
        {screen === "admin" && (
          <AdminScreen token={token} setScreen={setScreen} />
        )}
        {screen === "admin-current-affair" && (
          <AdminCurrentAffairScreen
            token={token}
            setScreen={setScreen}
          />
        )}
        {screen === "add-note" && (
          <AddNoteScreen
            token={token}
            setScreen={setScreen}
          />
        )}
        {screen === "save-note" &&(
          <SavedNotesScreen
          
          setScreen={setScreen}
          setSelectedQuickNote={setSelectedQuickNote}
          />

        )}
       
        {screen === "category" && (
          <CategoryScreen setScreen={setScreen} setFilter={setFilter} />
        )}
        {screen !== "login" && screen !== "detail" &&
          screen !== "onboarding" && screen !== "register" &&
          screen !== "tracker" && screen !== "updates" &&
          screen !== "calendar" && (
            <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#0D1F1A" }}>
              <BottomNav screen={screen} setScreen={setScreen} />
            </SafeAreaView>
          )}

      </>
    </SafeAreaProvider>
  );
}