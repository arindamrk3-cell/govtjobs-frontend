import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import React, { useState } from "react";

import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import BookmarkScreen from "./screens/BookmarkScreen";
import JobDetailScreen from "./screens/JobDetailScreen";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export default function App() {
  const [screen, setScreen] = useState("login");
  const [token, setToken] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    checkLogin();
  }, []);
 useEffect(()=>{
    Notifications.requestPermissionsAsync();

  },[]);
  // useEffect(() => {
  //   //registerForPushNotificationsAsync();
  // }, []);

  const checkLogin = async () => {
    const savedToken = await AsyncStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
      setScreen("home");
    }
  };
  
  async function getPushToken() {
    let token;

    if (!Device.isDevice) 
      return null;
    const {status: existing}=await Notifications.getPermissionsAsync();
    let finalStatus=existing;
    if(existing!=="granted"){
      const {status}=await Notifications.requestPermissionsAsync();
      finalStatus=status;
    }
    if(finalStatus!== "granted")
      return null;
    const token=(await Notifications.getExpoPushTokenAsync()).data;
    console.log("Push TOken:",token);
    return token;
  }
  return (
    <>
      {screen === "login" && (
        <LoginScreen setScreen={setScreen} setToken={setToken} />
      )}

      {screen === "home" && (
        <HomeScreen
          token={token}
          setScreen={setScreen}
          setSelectedJob={setSelectedJob}   // 🔥 IMPORTANT
        />
      )}

      {screen === "bookmark" && (
        <BookmarkScreen
          token={token}
          setScreen={setScreen}
        />
      )}

      {screen === "detail" && (
        <JobDetailScreen
          job={selectedJob}
          setScreen={setScreen}
        />
      )}
    </>
  );
}