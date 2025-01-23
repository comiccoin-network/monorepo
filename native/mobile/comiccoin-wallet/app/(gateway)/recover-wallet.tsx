// monorepo/native/mobile/comiccoin-wallet/app/(gateway)/recover-wallet.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import "react-native-get-random-values"; // 🐞 Bugfix: This must be above `ethers.js` or else we'll get a `platform does not support secure random numbers` error from our app. --> https://github.com/ethers-io/ethers.js/issues/1118#issuecomment-715511944
import { HDNodeWallet } from "ethers";
import { useWallet } from "../../hooks/useWallet";

export default function RecoverWallet() {
  const router = useRouter();
  const {
    createWallet,
    loading: serviceLoading,
    error: serviceError,
  } = useWallet();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    mnemonic: "",
    password: "",
    repeatPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      // Scroll to top when component mounts
      // Note: In React Native, we don't need window.scrollTo
    }

    return () => {
      mounted = false;
    };
  }, []);

  const validateMnemonic = (phrase: string) => {
    try {
      const normalizedPhrase = phrase.trim().toLowerCase();
      HDNodeWallet.fromPhrase(normalizedPhrase);
      return true;
    } catch (error) {
      console.log("recover-wallet.tsx -> validateMnemonic -> 🐞 error:", error);
      return false;
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = "Wallet label is required";
    }

    if (!formData.mnemonic.trim()) {
      newErrors.mnemonic = "Recovery phrase is required";
    } else if (!validateMnemonic(formData.mnemonic)) {
      newErrors.mnemonic = "Invalid recovery phrase";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 12) {
      newErrors.password = "Password must be at least 12 characters long";
    }

    if (!formData.repeatPassword) {
      newErrors.repeatPassword = "Please repeat your password";
    } else if (formData.password !== formData.repeatPassword) {
      newErrors.repeatPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        await createWallet(formData.mnemonic, formData.password);
        router.push("/overview");
      } catch (error: any) {
        setErrors((prev) => ({
          ...prev,
          submit: error.message || "Failed to recover wallet",
        }));
        // In React Native, we use scrollTo with a ref instead of window.scrollTo
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Combine all errors for display
  const allErrors = {
    ...errors,
    ...(serviceError ? { service: serviceError } : {}),
  };

  // Security Notice Component
  const SecurityNotice = () => (
    <View style={styles.securityNoticeContainer}>
      <Ionicons name="information-circle" size={20} color="#D97706" />
      <View style={styles.securityNoticeContent}>
        <Text style={styles.securityNoticeTitle}>
          Important information about recovery:
        </Text>
        <View style={styles.securityNoticeList}>
          <View style={styles.securityNoticeItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.securityNoticeText}>
              Enter your 12 or 24-word recovery phrase exactly
            </Text>
          </View>
          <View style={styles.securityNoticeItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.securityNoticeText}>
              Words must be in the correct order
            </Text>
          </View>
          <View style={styles.securityNoticeItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.securityNoticeText}>
              Each word should be lowercase and spelled correctly
            </Text>
          </View>
          <View style={styles.securityNoticeItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.securityNoticeText}>
              Choose a new strong password to secure your wallet
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F3E8FF", "#FFFFFF"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.title}>Recover Your Wallet</Text>
              <Text style={styles.subtitle}>
                Access your ComicCoin wallet using your recovery phrase
              </Text>
            </View>

            {/* Error Display */}
            {Object.keys(allErrors).length > 0 && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <View style={styles.errorContent}>
                  <Text style={styles.errorTitle}>
                    Please fix the following errors:
                  </Text>
                  {Object.values(allErrors).map((error, index) => (
                    <Text key={index} style={styles.errorText}>
                      • {error}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Main Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="key" size={20} color="#7C3AED" />
                </View>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardTitle}>Recover Your HD Wallet</Text>
                  <Text style={styles.cardSubtitle}>
                    Enter your recovery phrase and set a new password to access
                    your wallet.
                  </Text>
                </View>
              </View>

              <View style={styles.formContainer}>
                <SecurityNotice />

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Wallet Label</Text>
                  <TextInput
                    style={[styles.input, errors.label && styles.inputError]}
                    value={formData.label}
                    onChangeText={(value) => handleInputChange("label", value)}
                    placeholder="Enter a name for your wallet"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading && !serviceLoading}
                  />
                  {errors.label && (
                    <View style={styles.errorMessageContainer}>
                      <Ionicons name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.errorMessage}>{errors.label}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Recovery Phrase</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      errors.mnemonic && styles.inputError,
                    ]}
                    value={formData.mnemonic}
                    onChangeText={(value) =>
                      handleInputChange("mnemonic", value)
                    }
                    placeholder="Enter your 12 or 24-word recovery phrase"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading && !serviceLoading}
                  />
                  {errors.mnemonic && (
                    <View style={styles.errorMessageContainer}>
                      <Ionicons name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.errorMessage}>{errors.mnemonic}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.password && styles.inputError,
                      ]}
                      value={formData.password}
                      onChangeText={(value) =>
                        handleInputChange("password", value)
                      }
                      placeholder="Enter your new password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading && !serviceLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isLoading || serviceLoading}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <View style={styles.errorMessageContainer}>
                      <Ionicons name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.errorMessage}>{errors.password}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.repeatPassword && styles.inputError,
                      ]}
                      value={formData.repeatPassword}
                      onChangeText={(value) =>
                        handleInputChange("repeatPassword", value)
                      }
                      placeholder="Confirm your new password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading && !serviceLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading || serviceLoading}
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={24}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.repeatPassword && (
                    <View style={styles.errorMessageContainer}>
                      <Ionicons name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.errorMessage}>
                        {errors.repeatPassword}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={isLoading || serviceLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (isLoading || serviceLoading) &&
                        styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isLoading || serviceLoading}
                  >
                    {isLoading || serviceLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>
                          Recover Wallet
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#FFFFFF"
                        />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3E8FF",
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#5B21B6",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Marker Felt" : "normal", // Comic Sans alternative
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  cardHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardHeaderIcon: {
    backgroundColor: "#F3E8FF",
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 20,
    paddingRight: 8,
  },
  formContainer: {
    padding: 20,
    gap: 24,
  },
  securityNoticeContainer: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  securityNoticeContent: {
    flex: 1,
  },
  securityNoticeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  securityNoticeList: {
    gap: 4,
  },
  securityNoticeItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  bulletPoint: {
    color: "#92400E",
  },
  securityNoticeText: {
    fontSize: 14,
    color: "#92400E",
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    paddingRight: 48, // Space for the eye icon
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 4,
  },
  errorMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  errorMessage: {
    color: "#DC2626",
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
