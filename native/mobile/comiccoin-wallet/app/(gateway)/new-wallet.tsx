// monorepo/native/mobile/comiccoin-wallet/app/(gateway)/new-wallet.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import "react-native-get-random-values"; // 🐞 Bugfix: This must be above `ethers.js` or else we'll get a `platform does not support secure random numbers` error from our app. --> https://github.com/ethers-io/ethers.js/issues/1118#issuecomment-715511944
import { ethers } from "ethers";
import { LinearGradient } from "expo-linear-gradient";

import { useWallet } from "../../hooks/useWallet";

export default function NewWallet() {
  const { createWallet, error: serviceError } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    label: "",
    mnemonic: "",
    password: "",
    repeatPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [infoTab, setInfoTab] = useState<"password" | "mnemonic">("password");

  const passwordItems = [
    "Is at least 12 characters long",
    "Contains mixed case letters",
    "Includes numbers and symbols",
    "Is unique to this wallet",
  ];

  const mnemonicItems = [
    "Write down your phrase and keep it safe",
    "Never share it with anyone",
    "Lost phrases cannot be recovered",
    "All funds will be lost if you lose the phrase",
  ];

  const handleCreateWallet = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Add a small delay to ensure the loading state is rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Await the wallet creation
      await createWallet(formData.mnemonic, formData.password);

      // Add a small delay before navigation to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      await router.replace("/overview");
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to create wallet",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateMnemonic = () => {
    try {
      // Create a new random HD wallet
      const wallet = ethers.HDNodeWallet.createRandom();
      const mnemonic = wallet.mnemonic?.phrase;

      if (mnemonic) {
        setFormData((prev) => ({ ...prev, mnemonic }));
        // Clear any existing mnemonic error
        if (errors.mnemonic) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.mnemonic;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.log("new-wallet.tsx -> onGenerateMnemonic -> 🐞 error:", error);
      setErrors((prev) => ({
        ...prev,
        mnemonic: "Failed to generate mnemonic",
      }));
    }
  };

  const handleCopyMnemonic = async () => {
    if (formData.mnemonic) {
      await Clipboard.setString(formData.mnemonic);
      // Optional: Show some feedback that it was copied
      Alert.alert("Copied!", "Recovery phrase copied to clipboard");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate wallet label
    if (!formData.label.trim()) {
      newErrors.label = "Wallet label is required";
    }

    // Validate mnemonic
    if (!formData.mnemonic.trim()) {
      newErrors.mnemonic = "Recovery phrase is required";
    } else {
      try {
        // Verify mnemonic is valid
        ethers.Mnemonic.fromPhrase(formData.mnemonic.trim());
      } catch (e) {
        newErrors.mnemonic = "Invalid recovery phrase";
      }
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 12) {
      newErrors.password = "Password must be at least 12 characters long";
    }

    // Validate password confirmation
    if (!formData.repeatPassword) {
      newErrors.repeatPassword = "Please repeat your password";
    } else if (formData.password !== formData.repeatPassword) {
      newErrors.repeatPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Creating your wallet...</Text>
          </View>
        </View>
      )}
      <LinearGradient colors={["#F3E8FF", "#FFFFFF"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Your Wallet</Text>
              <Text style={styles.subtitle}>
                Set up your secure ComicCoin wallet
              </Text>
            </View>

            {/* Error Message Box */}
            {Object.keys(errors).length > 0 && (
              <View style={styles.errorBox}>
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

            {/* Info Tabs */}
            <View style={styles.tabsContainer}>
              <View style={styles.tabButtons}>
                <Pressable
                  onPress={() => setInfoTab("password")}
                  style={[
                    styles.tabButton,
                    infoTab === "password" && styles.activeTabButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      infoTab === "password" && styles.activeTabButtonText,
                    ]}
                  >
                    Password Guide
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setInfoTab("mnemonic")}
                  style={[
                    styles.tabButton,
                    infoTab === "mnemonic" && styles.activeTabButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      infoTab === "mnemonic" && styles.activeTabButtonText,
                    ]}
                  >
                    Recovery Guide
                  </Text>
                </Pressable>
              </View>
              {infoTab === "password" ? (
                <InfoTab
                  title="Choose a strong password that:"
                  items={passwordItems}
                  icon="information-circle"
                  color="#7C3AED"
                />
              ) : (
                <InfoTab
                  title="Important information about your recovery phrase:"
                  items={mnemonicItems}
                  icon="alert-circle"
                  color="#D97706"
                />
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <FormInput
                label="Wallet Label"
                value={formData.label}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, label: text }))
                }
                error={errors.label}
                placeholder="Enter a name for your wallet"
              />

              {/* Recovery Phrase */}
              <View style={styles.mnemonicInputContainer}>
                <TextInput
                  value={formData.mnemonic}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.mnemonicInput,
                    errors.mnemonic && styles.inputError,
                  ]}
                  placeholder="Your recovery phrase will appear here"
                  editable={false}
                />
                <View style={styles.mnemonicButtons}>
                  {formData.mnemonic && (
                    <Pressable
                      style={[styles.generateButton, styles.copyButton]}
                      onPress={handleCopyMnemonic}
                    >
                      <Text style={styles.generateButtonText}>Copy</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.generateButton}
                    onPress={onGenerateMnemonic}
                  >
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </Pressable>
                </View>
              </View>

              <FormInput
                label="Password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                error={errors.password}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                onToggleSecure={() => setShowPassword(!showPassword)}
                isPassword
              />

              <FormInput
                label="Confirm Password"
                value={formData.repeatPassword}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, repeatPassword: text }))
                }
                error={errors.repeatPassword}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                onToggleSecure={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                isPassword
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                onPress={() => router.back()}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateWallet}
                style={[
                  styles.continueButton,
                  isLoading && styles.continueButtonDisabled,
                ]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </Pressable>
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
    padding: 20,
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
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabButtons: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#7C3AED",
  },
  tabButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabButtonText: {
    color: "#7C3AED",
  },
  infoTabContainer: {
    padding: 16,
  },
  infoTabHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoTabTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoTabContent: {
    gap: 8,
  },
  infoTabItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletPoint: {
    color: "#7C3AED",
    fontSize: 16,
  },
  infoTabText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  inputWithIcon: {
    paddingRight: 40,
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
  },
  mnemonicContainer: {
    gap: 6,
  },
  mnemonicInputContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  mnemonicInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    height: 100,
    textAlignVertical: "top",
  },
  generateButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
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
    fontSize: 14,
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: "row",
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
  continueButtonDisabled: {
    opacity: 0.5,
  },
  mnemonicButtons: {
    gap: 8,
  },
  copyButton: {
    backgroundColor: "#4B5563", // A different color to distinguish from Generate
  },
  loadingOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    marginTop: 12,
  },
});

// Component for form input fields with error handling
const FormInput = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  onToggleSecure,
  isPassword = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder: string;
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  isPassword?: boolean;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          error ? styles.inputError : null,
          isPassword ? styles.inputWithIcon : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {isPassword && (
        <Pressable onPress={onToggleSecure} style={styles.eyeIcon}>
          <Ionicons
            name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#6B7280"
          />
        </Pressable>
      )}
    </View>
    {error && (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={16} color="#DC2626" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

// Information tab component
const InfoTab = ({
  title,
  items,
  icon,
  color,
}: {
  title: string;
  items: string[];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) => (
  <View style={styles.infoTabContainer}>
    <View style={styles.infoTabHeader}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.infoTabTitle, { color }]}>{title}</Text>
    </View>
    <View style={styles.infoTabContent}>
      {items.map((item, index) => (
        <View key={index} style={styles.infoTabItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.infoTabText}>{item}</Text>
        </View>
      ))}
    </View>
  </View>
);
