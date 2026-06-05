import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import API from "../services/api";

const C = {
  bg: "#0D1F1A",
  surface: "#FFFFFF",
  primary: "#0A8C5F",
  primaryDark: "#076647",
  primaryMuted: "#E6F4EF",
  text: "#0D1F1A",
  textMid: "#4A6360",
  textLight: "#8FA8A2",
  border: "#DDE8E4",
  danger: "#C0392B",
  white: "#FFFFFF",
};

export default function OTPVerificationScreen({ email, setScreen, onVerificationSuccess }) {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const maskEmail = (email) => {
    const [local, domain] = email.split("@");
    return `${local.substring(0, 2)}${"*".repeat(local.length - 2)}@${domain}`;
  };

  const handleVerifyOTP = async () => {
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (isNaN(otp)) {
      setError("OTP must contain only numbers");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otpCode: otp,
      });

      if (res.status === 200) {
        setScreen("login");
        onVerificationSuccess?.();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Verification failed";
      setError(errorMsg);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setResendLoading(true);

    try {
      await API.post("/auth/resend-otp", { email });
      setOtp("");
      setResendCountdown(30);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to resend OTP";
      setError(errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setScreen("register")}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Header Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="mail-outline" size={48} color={C.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a code to {maskEmail(email)}
          </Text>

          {/* OTP Input */}
          <View style={styles.otpInputWrap}>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="rgba(0,0,0,0.2)"
              maxLength={6}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              editable={!loading}
            />
          </View>

          {/* Expiry Info */}
          <Text style={styles.infoText}>
            This code will expire in 10 minutes
          </Text>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={C.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyBtn, loading && { opacity: 0.6 }]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <>
                <Ionicons name="checkmark-outline" size={18} color={C.white} />
                <Text style={styles.verifyBtnText}>Verify OTP</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Resend Button */}
          <TouchableOpacity
            style={[
              styles.resendBtn,
              (resendCountdown > 0 || resendLoading) && { opacity: 0.5 },
            ]}
            onPress={handleResendOTP}
            disabled={resendCountdown > 0 || resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <>
                <Ionicons name="reload-outline" size={16} color={C.primary} />
                <Text style={styles.resendBtnText}>
                  {resendCountdown > 0
                    ? `Resend in ${resendCountdown}s`
                    : "Resend OTP"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Change Email */}
          <TouchableOpacity
            style={styles.changeEmailBtn}
            onPress={() => setScreen("register")}
          >
            <Text style={styles.changeEmailText}>Want to change email?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    marginBottom: 20,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: C.white,
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 30,
  },

  otpInputWrap: {
    marginBottom: 12,
  },

  otpInput: {
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 10,
    borderWidth: 1,
    borderColor: C.border,
  },

  infoText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginBottom: 16,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(192,57,43,0.1)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(192,57,43,0.2)",
  },

  errorText: {
    fontSize: 13,
    color: C.danger,
    fontWeight: "600",
    flex: 1,
  },

  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  verifyBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 16,
  },

  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primaryMuted,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(10,140,95,0.3)",
    marginBottom: 20,
  },

  resendBtnText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  changeEmailBtn: {
    alignItems: "center",
  },

  changeEmailText: {
    fontSize: 13,
    color: C.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
