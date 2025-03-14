// screens/DeleteAccountScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDeleteAccount } from "../api/endpoints/deleteMeApi";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Get device dimensions for responsive layout
const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 667; // iPhone SE or similar sizes
const isLargeDevice = height > 844; // iPhone Pro Max models
const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";

// Custom touchable component that adapts to the platform
const Touchable = ({
  children,
  style,
  onPress,
  disabled = false,
  ...props
}) => {
  if (isAndroid) {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple("#d4c1ff", false)}
        useForeground={true}
        disabled={disabled}
        {...props}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const DeleteAccountScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Get safe area insets
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formError, setFormError] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Ref for scrollView to auto-scroll when keyboard appears
  const scrollViewRef = useRef(null);

  // Get the delete account functionality from our hook
  const { deleteAccount, isDeleting, error } = useDeleteAccount();

  // Set proper status bar for Android
  useEffect(() => {
    if (isAndroid) {
      StatusBar.setBackgroundColor("#7e22ce");
      StatusBar.setBarStyle("light-content");
    }
  }, []);

  // Set up keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      isIOS ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        // Scroll to input field when keyboard appears
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: isAndroid ? 250 : 200, // Slightly more scroll on Android
            animated: true,
          });
        }
      },
    );

    const keyboardWillHideListener = Keyboard.addListener(
      isIOS ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

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
    // Dismiss keyboard
    Keyboard.dismiss();

    // Validate input
    if (!password.trim()) {
      setFormError("Password is required to confirm account deletion");
      return;
    }

    // Confirmation dialog with platform-specific styling
    if (isAndroid) {
      Alert.alert(
        "Delete Account",
        "This action cannot be undone. All your data will be permanently deleted. Are you sure you want to continue?",
        [
          {
            text: "CANCEL",
            style: "cancel",
          },
          {
            text: "DELETE ACCOUNT",
            style: "destructive",
            onPress: processDeleteAccount,
          },
        ],
        { cancelable: true },
      );
    } else {
      // iOS specific alert
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
            onPress: processDeleteAccount,
          },
        ],
        { cancelable: true },
      );
    }
  };

  // Process the actual account deletion after confirmation
  const processDeleteAccount = async () => {
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
              text: isIOS ? "OK" : "OK",
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
  };

  // Render a better visibility toggle button for Android
  const renderVisibilityToggle = () => {
    if (isAndroid) {
      return (
        <TouchableNativeFeedback
          onPress={() => setPasswordVisible(!passwordVisible)}
          background={TouchableNativeFeedback.Ripple(
            "rgba(156, 163, 175, 0.2)",
            true,
          )}
          useForeground={false}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <View style={styles.visibilityToggle}>
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#9CA3AF"
            />
          </View>
        </TouchableNativeFeedback>
      );
    }

    return (
      <TouchableOpacity
        style={styles.visibilityToggle}
        onPress={() => setPasswordVisible(!passwordVisible)}
        activeOpacity={0.7} // Better touch feedback for iOS
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Larger touch area
      >
        <Ionicons
          name={passwordVisible ? "eye-off-outline" : "eye-outline"}
          size={24}
          color="#9CA3AF"
        />
      </TouchableOpacity>
    );
  };

  // Render the buttons with platform-specific handling
  const renderButtons = () => {
    const cancelButton = (
      <View style={styles.buttonContent}>
        <Text style={styles.cancelButtonText}>
          {isAndroid ? "CANCEL" : "Cancel"}
        </Text>
      </View>
    );

    const deleteButton = isDeleting ? (
      <View style={styles.buttonContent}>
        <ActivityIndicator size="small" color="white" />
        <Text style={styles.deleteButtonText}>
          {isAndroid ? "DELETING..." : "Deleting..."}
        </Text>
      </View>
    ) : (
      <View style={styles.buttonContent}>
        <Ionicons
          name="trash-outline"
          size={20}
          color="white"
          style={styles.buttonIcon}
        />
        <Text style={styles.deleteButtonText}>
          {isAndroid ? "DELETE ACCOUNT" : "Delete Account"}
        </Text>
      </View>
    );

    if (isAndroid) {
      return (
        <View style={styles.buttonContainer}>
          {/* Android Cancel Button */}
          <View style={styles.androidButtonWrapper}>
            <TouchableNativeFeedback
              onPress={handleBack}
              disabled={isDeleting}
              background={TouchableNativeFeedback.Ripple("#e2e8f0", false)}
              useForeground={true}
            >
              <View style={styles.cancelButton}>{cancelButton}</View>
            </TouchableNativeFeedback>
          </View>

          {/* Android Delete Button */}
          <View style={styles.androidButtonWrapper}>
            <TouchableNativeFeedback
              onPress={handleDeleteAccount}
              disabled={isDeleting || !password.trim()}
              background={TouchableNativeFeedback.Ripple("#fecaca", false)}
              useForeground={true}
            >
              <View
                style={[
                  styles.deleteButton,
                  isDeleting && styles.deleteButtonDisabled,
                  !password.trim() && styles.deleteButtonDisabled,
                ]}
              >
                {deleteButton}
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>
      );
    }

    // iOS Buttons
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleBack}
          disabled={isDeleting}
          activeOpacity={0.7} // Better iOS touch feedback
        >
          {cancelButton}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            isDeleting && styles.deleteButtonDisabled,
            !password.trim() && styles.deleteButtonDisabled,
          ]}
          onPress={handleDeleteAccount}
          disabled={isDeleting || !password.trim()}
          activeOpacity={0.7} // Better iOS touch feedback
        >
          {deleteButton}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} title="Delete Account" />

      <KeyboardAvoidingView
        behavior={isIOS ? "padding" : "height"}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={isIOS ? 88 : 0} // Adjust for header height on iOS
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            // Add bottom padding for home indicator area on iOS
            isIOS && { paddingBottom: Math.max(insets.bottom + 20, 30) },
            // Add specific padding for Android
            isAndroid && { paddingBottom: 24 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={isIOS} // Enable bounce effect only on iOS
          overScrollMode={isAndroid ? "never" : undefined} // Android specific
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
              <Text style={styles.sectionTitle}>
                Confirm with your password
              </Text>
            </View>

            <View style={styles.sectionContent}>
              <Text style={styles.inputLabel}>
                Password <Text style={styles.requiredStar}>*</Text>
              </Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    formError && styles.inputError,
                    isAndroid && styles.androidInput,
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                  textContentType="password" // For iOS password autofill
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  underlineColorAndroid="transparent" // Remove default Android underline
                />
                {renderVisibilityToggle()}
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
          {renderButtons()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  warningContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 20,
    // Platform-specific styling
    ...Platform.select({
      ios: {
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2, // Android shadow
        borderLeftWidth: 4, // Add a colored edge for Android
        borderLeftColor: "#EF4444",
      },
    }),
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    marginTop: 8,
    marginBottom: 8,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
  },
  warningText: {
    fontSize: 14,
    color: "#7F1D1D",
    textAlign: "center",
    lineHeight: 20,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
        lineHeight: 22, // Better readability on Android
      },
    }),
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    // Platform-specific styling
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2, // Android shadow
      },
    }),
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
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
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
    flex: 1,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 6,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "500",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
  },
  requiredStar: {
    color: "#EF4444",
  },
  passwordContainer: {
    position: "relative",
  },
  input: {
    height: 44, // Standard iOS height for inputs
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 48, // Extra space for the visibility toggle
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "white",
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
    }),
  },
  androidInput: {
    fontFamily: "sans-serif",
    height: 48, // Slightly taller inputs on Android
    paddingVertical: 8, // Better vertical padding for Android
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
    borderRadius: 20, // Make it round for better touch feedback on Android
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 12,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 16,
  },
  androidButtonWrapper: {
    borderRadius: 8,
    overflow: "hidden",
    flex: Platform.OS === "android" ? 1 : 0,
    marginRight: Platform.OS === "android" ? 8 : 0,
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
    height: Platform.OS === "android" ? 48 : 44, // Taller on Android
    ...Platform.select({
      android: {
        elevation: 1, // Subtle elevation for Android
      },
    }),
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "500",
    fontSize: 16,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "500",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
        letterSpacing: 0.5, // Material Design uses letter spacing for buttons
      },
    }),
  },
  deleteButton: {
    flex: 2,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    height: Platform.OS === "android" ? 48 : 44, // Taller on Android
    ...Platform.select({
      android: {
        elevation: 3, // More pronounced elevation for primary action
      },
    }),
  },
  deleteButtonDisabled: {
    backgroundColor: "#FCA5A5",
    ...Platform.select({
      android: {
        elevation: 0, // No elevation for disabled buttons on Android
      },
    }),
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
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
        letterSpacing: 0.5, // Material Design uses letter spacing for buttons
      },
    }),
  },
});

export default DeleteAccountScreen;
