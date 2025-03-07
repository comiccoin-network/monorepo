// components/VerificationCodeModal.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const VerificationCodeModal = ({
  visible,
  onClose,
  onVerify,
  email,
  isVerifying = false,
  verificationError = null,
}) => {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState("");

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      Alert.alert(
        "Verification Error",
        "Please enter the verification code from your email",
      );
      return;
    }

    onVerify(verificationCode);
  };

  const handleNavigateToLogin = () => {
    onClose();
    router.push("/login");
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={48} color="#10B981" />
            </View>

            {/* Header */}
            <Text style={styles.title}>Registration Successful!</Text>

            {/* Messages */}
            <View style={styles.messageContainer}>
              <Text style={styles.message}>
                Thank you for registering - an{" "}
                <Text style={styles.bold}>activation email</Text> has been sent
                to <Text style={styles.bold}>{email}</Text>. Please check your
                inbox (including spam folders).
              </Text>

              <Text style={styles.subMessage}>
                Enter the verification code below to activate your account.
              </Text>
            </View>

            {/* Verification Code Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                placeholderTextColor="#9CA3AF"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="default"
                autoCapitalize="none"
              />
            </View>

            {/* Error display */}
            {verificationError && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color="#EF4444"
                  style={styles.errorIcon}
                />
                <Text style={styles.errorText}>{verificationError}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleVerifyCode}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Verify Account</Text>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleNavigateToLogin}
              >
                <Text style={styles.secondaryButtonText}>Go to Login</Text>
                <Ionicons name="arrow-forward" size={20} color="#4F46E5" />
              </TouchableOpacity>

              <Text style={styles.helpText}>
                Didn't receive the code? Check your spam folder or contact
                support.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: "#D1FAE5",
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
    marginBottom: 24,
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
  },
  bold: {
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "white",
    width: "100%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    color: "#B91C1C",
    flex: 1,
    fontSize: 14,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  secondaryButtonText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "bold",
  },
  helpText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
  },
});

export default VerificationCodeModal;
