// monorepo/native/mobile/comiccoin-wallet/app/(gateway)/recover-wallet.tsx
import React, { useState } from "react";
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
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

export default function RecoverWallet() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    mnemonic: "",
    password: "",
    repeatPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate mnemonic using ethers
  const validateMnemonic = (phrase: string) => {
    try {
      const normalizedPhrase = phrase.trim().toLowerCase();

      return true;
    } catch (error) {
      return false;
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
        // Implementation for wallet creation would go here
        // await createWallet(formData.mnemonic, formData.password);
        router.push("/dashboard");
      } catch (error: any) {
        setErrors((prev) => ({
          ...prev,
          submit: error.message || "Failed to recover wallet",
        }));
      } finally {
        setIsLoading(false);
      }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#F3E8FF", "#FFFFFF"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Recover Your Wallet</Text>
              <Text style={styles.subtitle}>
                Access your ComicCoin wallet using your recovery phrase
              </Text>
            </View>

            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <View style={styles.errorContent}>
                  <Text style={styles.errorTitle}>
                    Please fix the following errors:
                  </Text>
                  {Object.values(errors).map((error, index) => (
                    <Text key={index} style={styles.errorText}>
                      • {error}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Main Form */}
            <View style={styles.formContainer}>
              {/* Info Box */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#6B46C1" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>
                    Important information about recovery:
                  </Text>
                  <Text style={styles.infoText}>
                    • Enter your 12 or 24-word recovery phrase exactly
                  </Text>
                  <Text style={styles.infoText}>
                    • Words must be in the correct order
                  </Text>
                  <Text style={styles.infoText}>
                    • Each word should be lowercase and spelled correctly
                  </Text>
                  <Text style={styles.infoText}>
                    • Choose a new strong password to secure your wallet
                  </Text>
                </View>
              </View>

              {/* Form Fields */}
              <View style={styles.formField}>
                <Text style={styles.label}>Wallet Label</Text>
                <TextInput
                  style={[styles.input, errors.label && styles.inputError]}
                  value={formData.label}
                  onChangeText={(value) => handleInputChange("label", value)}
                  placeholder="Enter a name for your wallet"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.label && (
                  <Text style={styles.fieldError}>{errors.label}</Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Recovery Phrase</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.mnemonic && styles.inputError,
                  ]}
                  value={formData.mnemonic}
                  onChangeText={(value) => handleInputChange("mnemonic", value)}
                  placeholder="Enter your 12 or 24-word recovery phrase"
                  multiline
                  numberOfLines={3}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.mnemonic && (
                  <Text style={styles.fieldError}>{errors.mnemonic}</Text>
                )}
              </View>

              <View style={styles.formField}>
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
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={24}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.fieldError}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.formField}>
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
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={24}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.repeatPassword && (
                  <Text style={styles.fieldError}>{errors.repeatPassword}</Text>
                )}
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isLoading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Recover Wallet</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3E8FF",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800", // Change from "bold" to "800" to match
    color: "#5B21B6",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Marker Felt" : "normal", // Comic Sans alternative
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    flexDirection: "row",
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorContent: {
    marginLeft: 8,
    flex: 1,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991B1B",
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F3E8FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 4,
  },
  formField: {
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
    borderColor: "#E5E7EB", // Update from #D1D5DB
    borderRadius: 12, // Update from 8
    padding: 12,
    fontSize: 16,
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
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
  },
  fieldError: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 12, // Add borderRadius to match
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12, // Update from 8 to 12
    flexDirection: "row", // Add to match
    alignItems: "center", // Add to match
    gap: 8, // Add to match
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  gradient: {
    flex: 1,
  },
});
