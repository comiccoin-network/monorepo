// screens/DeleteAccountScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDeleteAccount } from "../api/endpoints/deleteMeApi";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";

const DeleteAccountScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formError, setFormError] = useState(null);

  // Get the delete account functionality from our hook
  const { deleteAccount, isDeleting, error } = useDeleteAccount();

  // Clear form error when password changes
  useEffect(() => {
    if (formError && password) {
      setFormError(null);
    }
  }, [password]);

  // Update error from API
  useEffect(() => {
    if (error) {
      setFormError(
        error.message ||
          "An error occurred while trying to delete your account.",
      );
    }
  }, [error]);

  // Navigate back
  const handleBack = () => {
    router.back();
  };

  // Handle form submission with validation
  const handleDeleteAccount = async () => {
    // Validate input
    if (!password.trim()) {
      setFormError("Password is required to confirm account deletion");
      return;
    }

    // Confirm deletion with alert
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted. Are you sure you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              // Call the API to delete the account
              const success = await deleteAccount(password);

              if (success) {
                // The logout happens automatically in the hook
                // Just show a confirmation message to the user
                Alert.alert(
                  "Account Deleted",
                  "Your account has been successfully deleted.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // The hook will have already logged the user out
                        // which will redirect them to the login screen
                      },
                    },
                  ],
                );
              }
            } catch (err) {
              console.error("Failed to delete account:", err);
              // Error is already handled by the hook and displayed in the UI
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Header showBackButton={true} title="Delete Account" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Warning Section */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={32} color="#EF4444" />
          <Text style={styles.warningTitle}>Delete Your Account</Text>
          <Text style={styles.warningText}>
            This action permanently deletes your account and all associated
            data. Once completed, this cannot be undone.
          </Text>
        </View>

        {/* What Will Be Deleted Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What will be deleted:</Text>
          </View>

          <View style={styles.sectionContent}>
            <View style={styles.listItem}>
              <Ionicons
                name="close-circle"
                size={20}
                color="#EF4444"
                style={styles.listIcon}
              />
              <Text style={styles.listText}>Your account information</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons
                name="close-circle"
                size={20}
                color="#EF4444"
                style={styles.listIcon}
              />
              <Text style={styles.listText}>Your transaction history</Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons
                name="close-circle"
                size={20}
                color="#EF4444"
                style={styles.listIcon}
              />
              <Text style={styles.listText}>
                Your wallet address association
              </Text>
            </View>
            <View style={styles.listItem}>
              <Ionicons
                name="close-circle"
                size={20}
                color="#EF4444"
                style={styles.listIcon}
              />
              <Text style={styles.listText}>
                All personal data and preferences
              </Text>
            </View>
          </View>
        </View>

        {/* Confirmation Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Confirm with your password</Text>
          </View>

          <View style={styles.sectionContent}>
            <Text style={styles.inputLabel}>
              Password <Text style={styles.requiredStar}>*</Text>
            </Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, formError && styles.inputError]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {formError && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color="#EF4444"
                  style={styles.errorIcon}
                />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBack}
            disabled={isDeleting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              isDeleting && styles.deleteButtonDisabled,
              !password.trim() && styles.deleteButtonDisabled,
            ]}
            onPress={handleDeleteAccount}
            disabled={isDeleting || !password.trim()}
          >
            {isDeleting ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.deleteButtonText}>Deleting...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  warningContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    marginTop: 8,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#7F1D1D",
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  sectionContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  listIcon: {
    marginRight: 12,
  },
  listText: {
    fontSize: 15,
    color: "#4B5563",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 6,
  },
  requiredStar: {
    color: "#EF4444",
  },
  passwordContainer: {
    position: "relative",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 48, // Extra space for the visibility toggle
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "white",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  visibilityToggle: {
    position: "absolute",
    right: 8,
    top: 10,
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "500",
    fontSize: 16,
  },
  deleteButton: {
    flex: 2,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  deleteButtonDisabled: {
    backgroundColor: "#FCA5A5",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default DeleteAccountScreen;
