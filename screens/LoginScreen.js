import React, { useState } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,KeyboardAvoidingView,ScrollView,Platform
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { View, TextInput, Button, Text } from "react-native";
import API from "../services/api";

export default function LoginScreen({ setScreen, setToken, getPushToken, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setError("Email is required."); return; }
    if (!emailRegex.test(email)) { setError("Enter a valid email address."); return; }
    if (!password) { setError("Password is required."); return; }
    
    try {
      //console.log("Attempting login to:", API.defaults.baseURL); 
      const res = await API.post("/auth/login", { email, password });
      console.log("Login response:", res.data);
      const jwtToken = res.data.token;
      setToken(jwtToken);
      await AsyncStorage.setItem("token", jwtToken);


      await onLoginSuccess(jwtToken);
      try{
      const pushToken = await getPushToken();

      if (pushToken) {
        await API.post(
          "/auth/save-token",
          { pushToken },
          { headers: { Authorization: `Bearer ${jwtToken}` } }
        );
      }

      }
      catch(pushErr){
        console.log("Push token error (non-fatal):", pushErr);
      }
      
    }
    catch (err) {
    console.log("Login failed:");
    console.log("Status:", err.response?.status);
    console.log("Data:", JSON.stringify(err.response?.data));
    console.log("Message:", err.message);
    
    if (err.response?.status === 400) setError("No account found. Please register.");
    else if (err.response?.status === 401) setError("Incorrect password. Try again.");
    else if (!err.response) setError("Network error. Check your connection.");
    else setError(err.response?.data?.message || err.response?.data?.error || "Login failed.");
    }
  };


  return (
    <SafeAreaView style={styles.container}>

      {/* Background accent */}
      <View style={styles.topAccent} />
      <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

      {/* Logo area */}
      <View style={styles.logoWrap}>
        <View style={styles.logoDot}>
          <Ionicons name="briefcase-outline" size={28} color="#fff" />
        </View>
        <Text style={styles.logoTitle}>GovtJobs</Text>
        <Text style={styles.logoSub}>Find your government career</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardSub}>Sign in to continue</Text>

        {/* Email */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={16} color="#aaa" style={styles.inputIcon} />
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#bbb"
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={16} color="#aaa" style={styles.inputIcon} />
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#bbb"
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={16} color="#aaa" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot */}
        <TouchableOpacity style={styles.forgotWrap}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
        {/* Error Banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={15} color="#C0392B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Login button */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Sign in</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity style={styles.googleBtn}>
          <Ionicons name="logo-google" size={16} color="#444" />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* <Text style={styles.footerText}>Don't have an account? </Text> */}
        <TouchableOpacity onPress={() => setScreen("register")}>
          <Text style={{ marginTop: 10, color: "blue" }}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
       </ScrollView>
    </KeyboardAvoidingView>
 

    </SafeAreaView>
  );
}
// Add this one state variable near your existing ones
//const [showPassword, setShowPassword] = useState(false);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },

  // Green top accent blob
  topAccent: {
    position: "absolute",
    top: -60,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#0F6E56",
    opacity: 0.08,
  },

  // Logo
  logoWrap: {
    alignItems: "center",
    paddingTop: 64,
    paddingBottom: 32,
  },
  logoDot: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#0F6E56",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 0.5,
    borderColor: "#e5e5e5",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: "#888",
    marginBottom: 24,
  },

  // Fields
  fieldWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderWidth: 0.5,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111",
    paddingVertical: 13,
  },
  eyeBtn: {
    padding: 4,
  },

  // Forgot
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 12,
    color: "#0F6E56",
    fontWeight: "500",
  },

  // Login button
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F6E56",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: "#e5e5e5",
  },
  dividerText: {
    fontSize: 12,
    color: "#bbb",
  },

  // Google
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#f7f7f7",
    borderWidth: 0.5,
    borderColor: "#e5e5e5",
    paddingVertical: 13,
    borderRadius: 12,
  },
  googleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: "#888",
  },
  footerLink: {
    fontSize: 13,
    color: "#0F6E56",
    fontWeight: "600",
  },
  errorBanner: {
  flexDirection: "row", alignItems: "center", gap: 6,
  backgroundColor: "#FFF0EE", borderWidth: 1, borderColor: "#F5C6C0",
  borderRadius: 10, padding: 10, marginBottom: 14,
},
errorText: { fontSize: 13, color: "#C0392B", fontWeight: "500", flex: 1 },
});
