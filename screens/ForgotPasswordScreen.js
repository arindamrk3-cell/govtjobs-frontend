
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
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

export default function ForgotPasswordScreen({ setScreen }) {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown((prev) => prev - 1),
        1000
      );

      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const maskEmail = (value) => {
    if (!value || !value.includes("@")) return value;

    const [local, domain] = value.split("@");

    return `${local.substring(0, 2)}${"*".repeat(
      Math.max(0, local.length - 2)
    )}@${domain}`;
  };

  // STEP 1: Send reset OTP
  const handleSendOTP = async () => {
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setError("Email address is required.");
      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/forgot-password", {
        email: normalizedEmail,
      });

      setEmail(normalizedEmail);
      setStep(2);
      setResendCountdown(30);
      setSuccess("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify reset OTP
  const handleVerifyOTP = async () => {
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/verify-reset-otp", {
        email,
        otpCode: otp,
      });

      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
        setStep(3);
        setOtp("");
      } else {
        setError("Unable to verify OTP. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "OTP verification failed."
      );
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("/auth/forgot-password", {
        email,
      });

      setOtp("");
      setResendCountdown(30);
      setSuccess("A new OTP has been sent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset password
  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/;

    if (!password) {
      setError("New password is required.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError("Password must contain at least 6 characters, including letters and numbers.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/reset-password", {
        resetToken,
        newPassword: password,
      });

      setStep(4);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError("");
    setSuccess("");

    if (step === 1 || step === 4) {
      setScreen("login");
    } else if (step === 3) {
      // A verified OTP is single-use.
      // Start again if the user needs another OTP.
      setStep(1);
      setOtp("");
      setResetToken("");
    } else {
      setStep(1);
      setOtp("");
    }
  };

  const renderError = () => (
    error ? (
      <View style={styles.errorBox}>
        <Ionicons
          name="alert-circle-outline"
          size={16}
          color={C.danger}
        />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    ) : null
  );

  const renderSuccess = () => (
    success ? (
      <View style={styles.successBox}>
        <Ionicons
          name="checkmark-circle-outline"
          size={16}
          color={C.primary}
        />
        <Text style={styles.successText}>{success}</Text>
      </View>
    ) : null
  );

  const renderInput = ({
    label,
    placeholder,
    value,
    onChangeText,
    icon,
    secureTextEntry = false,
    showPasswordToggle = false,
    togglePassword,
    keyboardType = "default",
    maxLength,
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrap}>
        <Ionicons
          name={icon}
          size={18}
          color={C.textLight}
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#AABAB5"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          maxLength={maxLength}
          editable={!loading}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            onPress={togglePassword}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={C.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderButton = (label, icon, onPress) => (
    <TouchableOpacity
      style={[styles.mainBtn, loading && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={C.white} />
      ) : (
        <>
          <Ionicons name={icon} size={18} color={C.white} />
          <Text style={styles.mainBtnText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const getHeader = () => {
    if (step === 1) {
      return {
        icon: "lock-open-outline",
        title: "Forgot Password?",
        subtitle: "Enter your registered email address to reset your password.",
      };
    }

    if (step === 2) {
      return {
        icon: "mail-outline",
        title: "Verify Your Email",
        subtitle: `If an account exists, We've sent a reset code to ${maskEmail(email)}`,
      };
    }

    if (step === 3) {
      return {
        icon: "lock-closed-outline",
        title: "Create New Password",
        subtitle: "Choose a strong password for your GovtJobs account.",
      };
    }

    return {
      icon: "checkmark-circle-outline",
      title: "Password Updated!",
      subtitle: "Your password has been changed successfully.",
    };
  };

  const header = getHeader();

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={goBack}
            disabled={loading}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={C.text}
            />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={header.icon}
                size={42}
                color={C.primary}
              />
            </View>

            <Text style={styles.title}>{header.title}</Text>

            <Text style={styles.subtitle}>
              {header.subtitle}
            </Text>

            {/* STEP 1: EMAIL */}
            {step === 1 && (
              <>
                {renderInput({
                  label: "Email Address",
                  placeholder: "you@example.com",
                  value: email,
                  onChangeText: setEmail,
                  icon: "mail-outline",
                  keyboardType: "email-address",
                })}

                {renderError()}

                {renderButton(
                  "Send OTP",
                  "arrow-forward",
                  handleSendOTP
                )}
              </>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>6-Digit OTP</Text>

                  <View style={styles.inputWrap}>
                    <Ionicons
                      name="keypad-outline"
                      size={18}
                      color={C.textLight}
                      style={styles.inputIcon}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="000000"
                      placeholderTextColor="#AABAB5"
                      value={otp}
                      onChangeText={(value) =>
                        setOtp(value.replace(/\D/g, ""))
                      }
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />
                  </View>
                </View>

                <Text style={styles.infoText}>
                  This code will expire in 10 minutes.
                </Text>

                {renderError()}
                {renderSuccess()}

                {renderButton(
                  "Verify OTP",
                  "checkmark-outline",
                  handleVerifyOTP
                )}

                <TouchableOpacity
                  style={[
                    styles.resendBtn,
                    (resendCountdown > 0 || loading) && {
                      opacity: 0.5,
                    },
                  ]}
                  onPress={handleResendOTP}
                  disabled={resendCountdown > 0 || loading}
                >
                  <Ionicons
                    name="reload-outline"
                    size={16}
                    color={C.primary}
                  />
                  <Text style={styles.resendBtnText}>
                    {resendCountdown > 0
                      ? `Resend in ${resendCountdown}s`
                      : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === 3 && (
              <>
                {renderInput({
                  label: "New Password",
                  placeholder: "Enter new password",
                  value: password,
                  onChangeText: setPassword,
                  icon: "lock-closed-outline",
                  secureTextEntry: !showPassword,
                  showPasswordToggle: true,
                  togglePassword: () =>
                    setShowPassword((prev) => !prev),
                })}

                {renderInput({
                  label: "Confirm New Password",
                  placeholder: "Confirm new password",
                  value: confirmPassword,
                  onChangeText: setConfirmPassword,
                  icon: "lock-closed-outline",
                  secureTextEntry: !showConfirmPassword,
                  showPasswordToggle: true,
                  togglePassword: () =>
                    setShowConfirmPassword((prev) => !prev),
                })}

                <Text style={styles.infoText}>
                  Minimum 6 characters, including letters and numbers.
                </Text>

                {renderError()}

                {renderButton(
                  "Reset Password",
                  "checkmark-circle-outline",
                  handleResetPassword
                )}
              </>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
              <>
                <View style={styles.successIcon}>
                  <Ionicons
                    name="checkmark"
                    size={38}
                    color={C.white}
                  />
                </View>

                <Text style={styles.successMessage}>
                  Your password has been reset successfully.
                </Text>

                <Text style={styles.infoText}>
                  You can now sign in using your new password.
                </Text>

                {renderButton(
                  "Back to Login",
                  "arrow-forward",
                  () => setScreen("login")
                )}
              </>
            )}

            {step !== 4 && (
              <TouchableOpacity
                style={styles.changeEmailBtn}
                onPress={() => setScreen("login")}
              >
                <Text style={styles.changeEmailText}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.footer}>
            GovtJobs • Find your government career
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 25,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 20,
    marginTop: 10,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingTop: 20,
  },

  iconWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: C.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 26,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: C.white,
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },

  fieldWrap: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: C.white,
    marginBottom: 9,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    minHeight: 54,
  },

  inputIcon: {
    marginRight: 11,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    paddingVertical: 14,
    outlineStyle: "none",
  },

  eyeBtn: {
    padding: 8,
  },

  infoText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },

  mainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: C.primary,
    paddingVertical: 15,
    borderRadius: 13,
    marginTop: 8,
    marginBottom: 15,
  },

  mainBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: C.white,
  },

  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primaryMuted,
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 15,
  },

  resendBtnText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(192,57,43,0.12)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(192,57,43,0.3)",
  },

  errorText: {
    fontSize: 13,
    color: "#FF8B80",
    fontWeight: "600",
    flex: 1,
  },

  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(10,140,95,0.15)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  successText: {
    fontSize: 13,
    color: "#8BE0B9",
    fontWeight: "600",
    flex: 1,
  },

  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },

  successMessage: {
    fontSize: 16,
    fontWeight: "700",
    color: C.white,
    textAlign: "center",
    marginBottom: 14,
  },

  changeEmailBtn: {
    alignItems: "center",
    marginTop: 16,
    padding: 10,
  },

  changeEmailText: {
    fontSize: 13,
    color: C.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  footer: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    textAlign: "center",
    marginTop: 25,
  },
});
