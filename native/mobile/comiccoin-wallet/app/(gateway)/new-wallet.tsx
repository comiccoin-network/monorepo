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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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

export default function NewWallet() {
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
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Your Wallet</Text>
              <Text style={styles.subtitle}>
                Set up your secure ComicCoin wallet
              </Text>
            </View>

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
              <View style={styles.mnemonicContainer}>
                <Text style={styles.inputLabel}>Recovery Phrase</Text>
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
                  <Pressable style={styles.generateButton}>
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
                onPress={() => {}} // Add your submit logic here
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
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
});
