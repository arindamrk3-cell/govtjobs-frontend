import React, { useState } from "react";
import {
  SafeAreaView, View, Text, TextInput,
  TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  ScrollView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";

export default function RegisterScreen({ setScreen, setTempEmail, setScreenToOTP }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");

    // Validations
    if (!name.trim()) { setError("Name is required."); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setError("Email is required."); return; }
    if (!emailRegex.test(email)) { setError("Enter a valid email address."); return; }

    const passRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/;
    if (!password) { setError("Password is required."); return; }
    if (!passRegex.test(password)) {
      setError("Password must be at least 6 characters with letters and numbers.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/send-otp", { name, email, password });
      setTempEmail?.(email);
      setScreenToOTP?.();
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message;
      setError(msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
    return (
    <SafeAreaView style={styles.container}>
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
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoDot}>
              <Ionicons name="briefcase-outline" size={28} color="#fff" />
            </View>
            <Text style={styles.logoTitle}>GovtJobs</Text>
            <Text style={styles.logoSub}>Create your account</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Get started</Text>
            <Text style={styles.cardSub}>Fill in your details to register</Text>

            {/* Error Banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={15} color="#C0392B" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Name */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={16} color="#aaa" style={styles.inputIcon} />
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor="#bbb"
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>
            </View>

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
                  placeholder="Min 6 chars with letters & numbers"
                  placeholderTextColor="#bbb"
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={16} color="#aaa" />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>At least 6 characters, must include letters and numbers</Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
              <Text style={styles.registerBtnText}>
                {loading ? "Creating account..." : "Create Account"}
              </Text>
              {!loading && <Ionicons name="arrow-forward" size={16} color="#fff" />}
            </TouchableOpacity>
          </View>

          {/* Footer — inside ScrollView so it never overlaps */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setScreen("login")}>
              <Text style={styles.footerLink}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
    // <SafeAreaView style={styles.container}>
    //   <View style={styles.topAccent} />

    //   {/* Logo */}
    //   <View style={styles.logoWrap}>
    //     <View style={styles.logoDot}>
    //       <Ionicons name="briefcase-outline" size={28} color="#fff" />
    //     </View>
    //     <Text style={styles.logoTitle}>GovtJobs</Text>
    //     <Text style={styles.logoSub}>Create your account</Text>
    //   </View>

    //   {/* Card */}
    //   <View style={styles.card}>
    //     <Text style={styles.cardTitle}>Get started</Text>
    //     <Text style={styles.cardSub}>Fill in your details to register</Text>

    //     {/* Error Banner */}
    //     {error ? (
    //       <View style={styles.errorBanner}>
    //         <Ionicons name="alert-circle-outline" size={15} color="#C0392B" />
    //         <Text style={styles.errorText}>{error}</Text>
    //       </View>
    //     ) : null}

    //     {/* Name */}
    //     <View style={styles.fieldWrap}>
    //       <Text style={styles.label}>Full Name</Text>
    //       <View style={styles.inputWrap}>
    //         <Ionicons name="person-outline" size={16} color="#aaa" style={styles.inputIcon} />
    //         <TextInput
    //           placeholder="John Doe"
    //           placeholderTextColor="#bbb"
    //           onChangeText={setName}
    //           style={styles.input}
    //         />
    //       </View>
    //     </View>

    //     {/* Email */}
    //     <View style={styles.fieldWrap}>
    //       <Text style={styles.label}>Email</Text>
    //       <View style={styles.inputWrap}>
    //         <Ionicons name="mail-outline" size={16} color="#aaa" style={styles.inputIcon} />
    //         <TextInput
    //           placeholder="you@example.com"
    //           placeholderTextColor="#bbb"
    //           onChangeText={setEmail}
    //           keyboardType="email-address"
    //           autoCapitalize="none"
    //           style={styles.input}
    //         />
    //       </View>
    //     </View>

    //     {/* Password */}
    //     <View style={styles.fieldWrap}>
    //       <Text style={styles.label}>Password</Text>
    //       <View style={styles.inputWrap}>
    //         <Ionicons name="lock-closed-outline" size={16} color="#aaa" style={styles.inputIcon} />
    //         <TextInput
    //           placeholder="Min 6 chars with letters & numbers"
    //           placeholderTextColor="#bbb"
    //           onChangeText={setPassword}
    //           secureTextEntry={!showPassword}
    //           style={styles.input}
    //         />
    //         <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
    //           <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={16} color="#aaa" />
    //         </TouchableOpacity>
    //       </View>
    //       <Text style={styles.hint}>At least 6 characters, must include letters and numbers</Text>
    //     </View>

    //     {/* Register Button */}
    //     <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
    //       <Text style={styles.registerBtnText}>{loading ? "Creating account..." : "Create Account"}</Text>
    //       {!loading && <Ionicons name="arrow-forward" size={16} color="#fff" />}
    //     </TouchableOpacity>
    //   </View>

    //   {/* Footer */}
    //   <View style={styles.footer}>
    //     <TouchableOpacity onPress={() => setScreen("login")}>
    //       <Text style={styles.footerLink}>Already have an account? Sign in</Text>
    //     </TouchableOpacity>
    //   </View>
    // </SafeAreaView>
  
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f7" },
  topAccent: {
    position: "absolute", top: -60, left: -40,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "#0F6E56", opacity: 0.08,
  },
  logoWrap: { alignItems: "center", paddingTop: 64, paddingBottom: 32 },
  logoDot: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: "#0F6E56", alignItems: "center",
    justifyContent: "center", marginBottom: 14,
  },
  logoTitle: { fontSize: 26, fontWeight: "700", color: "#111", letterSpacing: -0.5 },
  logoSub: { fontSize: 13, color: "#888", marginTop: 4 },
  card: {
    backgroundColor: "#fff", marginHorizontal: 20,
    borderRadius: 20, padding: 24,
    borderWidth: 0.5, borderColor: "#e5e5e5",
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "#888", marginBottom: 20 },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FFF0EE", borderWidth: 1, borderColor: "#F5C6C0",
    borderRadius: 10, padding: 10, marginBottom: 14,
  },
  errorText: { fontSize: 13, color: "#C0392B", fontWeight: "500", flex: 1 },
  fieldWrap: { marginBottom: 16 },
  label: {
    fontSize: 12, fontWeight: "600", color: "#444",
    marginBottom: 6, letterSpacing: 0.2,
  },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f7f7f7", borderWidth: 0.5,
    borderColor: "#e5e5e5", borderRadius: 12, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#111", paddingVertical: 13 },
  eyeBtn: { padding: 4 },
  hint: { fontSize: 11, color: "#aaa", marginTop: 5 },
  registerBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    backgroundColor: "#0F6E56", paddingVertical: 14,
    borderRadius: 12, marginTop: 4,
  },
  registerBtnText: { fontSize: 15, fontWeight: "700", color: "#fff", letterSpacing: 0.2 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerLink: { fontSize: 13, color: "#0F6E56", fontWeight: "600" },
});