// screens/RegisterSuccessScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import LightFooter from "../components/LightFooter";
import { verifyEmailWithCode, resendVerificationCode } from "../api/endpoints/verifyEmailApi";
import { useAuth } from "../hooks/useAuth";

const RegisterSuccessScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();

  // Get email from navigation params or use empty string
  const userEmail = params.email || "";

  // State for verification process
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Create refs for individual code inputs if you want to use a segmented input
  const codeInputRef = useRef(null);

  // Handle verification submission
  const handleVerifyCode = async () => {
    // Validate code format (example: 6 digits)
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const result = await verifyEmailWithCode(userEmail, verificationCode);

      console.log("✅ Email verification successful:", result);

      setVerificationSuccess(true);

      // If user data is returned, update auth context
      if (result.user) {
        login(result);

        // Delay to show success message before navigating
        setTimeout(() => {
          router.replace("/(tabs)/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Verification failed:", err);
      setError(err.message || "Verification failed. Please check the code and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resending the verification code
  const handleResendCode = async () => {
    if (!userEmail) {
      Alert.alert("Error", "Email address is required to resend the verification code.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      await resendVerificationCode(userEmail);
      Alert.alert("Success", "A new verification code has been sent to your email address.");
    } catch (err) {
      console.error("❌ Resend code failed:", err);
      setError(err.message || "Failed to resend verification code. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Header showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          <View style={styles.card}>
            {/* Icon - Success or Email */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={verificationSuccess ? "checkmark-circle" : "mail"}
                size={48}
                color={verificationSuccess ? "#10B981" : "#8347FF"}
              />
            </View>

            {/* Title - Changes based on verification state */}
            <Text style={styles.title}>
              {verificationSuccess
                ? "Email Verified!"
                : "Check Your Email"}
            </Text>

            {/* Messages - Different for success/pending states */}
            {verificationSuccess ? (
              <View style={styles.messageContainer}>
                <Text style={styles.successMessage}>
                  Your email has been successfully verified! You can now access all features of ComicCoin Faucet.
                </Text>
                <Text style={styles.redirectMessage}>
                  Redirecting to dashboard...
                </Text>
              </View>
            ) : (
              <View style={styles.messageContainer}>
                <Text style={styles.message}>
                  We've sent a verification code to{" "}
                  <Text style={styles.bold}>{userEmail}</Text>.
                  Please enter the 6-digit code below to verify your email address.
                </Text>

                <Text style={styles.subMessage}>
                  Remember to check your spam or promotions folders if you don't see the email.
                </Text>

                {/* Verification Code Input */}
                <View style={styles.codeInputContainer}>
                  <TextInput
                    ref={codeInputRef}
                    style={styles.codeInput}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="Enter 6-digit code"
                    keyboardType="number-pad"
                    maxLength={6}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {/* Error message */}
                  {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                  ) : null}

                  {/* Verification button */}
                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      (isVerifying || !verificationCode) && styles.disabledButton
                    ]}
                    onPress={handleVerifyCode}
                    disabled={isVerifying || !verificationCode}
                  >
                    {isVerifying ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify Email</Text>
                    )}
                  </TouchableOpacity>

                  {/* Resend code option */}
                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                      Didn't receive the code?
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendCode}
                      disabled={isResending}
                    >
                      <Text style={[
                        styles.resendLinkText,
                        isResending && styles.disabledText
                      ]}>
                        {isResending ? "Sending..." : "Resend Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Login button - only show when not yet verified */}
            {!verificationSuccess && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleNavigateToLogin}
              >
                <Text style={styles.secondaryButtonText}>Back to Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <LightFooter />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#E9D5FF",
  },
  iconContainer: {
    backgroundColor: "#F3F4FF",
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B21A8",
    textAlign: "center",
    marginBottom: 24,
  },
  messageContainer: {
    alignItems: "center",
    width: "100%",
  },
  message: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  subMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  successMessage: {
    fontSize: 16,
    color: "#10B981",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  redirectMessage: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },
  bold: {
    fontWeight: "bold",
  },
  codeInputContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  codeInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
  },
  verifyButton: {
    backgroundColor: "#8347FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  verifyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  resendText: {
    color: "#6B7280",
    marginRight: 4,
  },
  resendLinkText: {
    color: "#8347FF",
    fontWeight: "500",
  },
  disabledText: {
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  secondaryButtonText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default RegisterSuccessScreen;
