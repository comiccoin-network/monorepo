// app/(user-initialization)/add-my-wallet-address.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
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
import { useAuth } from "../../hooks/useAuth";
import { useWalletConnect } from "../../hooks/useWalletConnect";
import UserInitializationHeader from "../../components/UserInitializationHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Get device dimensions for responsive layout
const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 700; // iPhone SE or similar
const isLargeDevice = height > 800; // iPhone Pro Max or similar

// Confirmation Modal component
const ConfirmationModal = ({ visible, onClose, onConfirm, walletAddress }) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { paddingBottom: Math.max(20, insets.bottom) }, // Ensure safe area padding
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Increase hit area
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.modalHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#8347FF" />
            </View>
            <Text style={styles.modalTitle}>Confirm Your Wallet</Text>
            <Text style={styles.modalSubtitle}>
              Please verify that this is your correct wallet address:
            </Text>
          </View>

          <View style={styles.walletAddressContainer}>
            <Text
              style={styles.walletAddressText}
              selectable={true} // Enable text selection on iOS
              adjustsFontSizeToFit={isSmallDevice} // Adjust font for small screens
              numberOfLines={2}
            >
              {walletAddress}
            </Text>
          </View>

          <View style={styles.warningContainer}>
            <View style={styles.warningIconContainer}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.warningText}>
              Double-check your wallet address carefully. Coins sent to the
              wrong address cannot be recovered!
            </Text>
          </View>

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7} // Better iOS touch feedback
            >
              <Text style={styles.cancelButtonText}>Double-check</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.7} // Better iOS touch feedback
            >
              <Text style={styles.confirmButtonText}>Confirm Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// External Link Confirmation Modal
const ExternalLinkModal = ({ visible, onClose, onConfirm, url }) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { paddingBottom: Math.max(20, insets.bottom) }, // Ensure safe area padding
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Increase hit area
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.modalHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="open-outline" size={32} color="#8347FF" />
            </View>
            <Text style={styles.modalTitle}>Leave App</Text>
            <Text style={styles.modalSubtitle}>
              You're about to be redirected to:
            </Text>
          </View>

          <View style={styles.urlContainer}>
            <Text style={styles.urlText}>{url}</Text>
          </View>

          <View style={styles.warningContainer}>
            <View style={styles.warningIconContainer}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.warningText}>
              You will be redirected to an external website. Are you sure you
              want to proceed?
            </Text>
          </View>

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7} // Better iOS touch feedback
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.7} // Better iOS touch feedback
            >
              <Text style={styles.confirmButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function AddMyWalletAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser, logout } = useAuth();
  const {
    connectWallet,
    isConnecting,
    error: connectError,
  } = useWalletConnect();

  const [walletAddress, setWalletAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showExternalLinkModal, setShowExternalLinkModal] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef(null);
  const WALLET_WEBSITE_URL = "https://comiccoinwallet.com";

  // Track keyboard visibility for iOS
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Handle initial authentication check
  useEffect(() => {
    // If user data is present, we're no longer initializing
    if (user) {
      setIsInitializing(false);
    }
  }, [user]);

  // Prefill wallet address if available
  useEffect(() => {
    if (user?.wallet_address || user?.walletAddress) {
      setWalletAddress(user.wallet_address || user.walletAddress);
    }
  }, [user]);

  // Focus input automatically on small devices to show keyboard
  useEffect(() => {
    if (!isInitializing && isSmallDevice && inputRef.current) {
      // Slight delay to ensure component is fully rendered
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isInitializing, isSmallDevice]);

  // Don't render the main content while checking user status
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8347FF" />
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    );
  }

  const handleSubmit = () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Clear previous errors when opening confirmation modal
    setLocalError(null);

    // Validate wallet address format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setLocalError(
        "Please enter a valid wallet address (0x followed by 40 hexadecimal characters)",
      );
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    console.log("🔄 Starting wallet confirmation process");

    try {
      // Call the wallet connection API
      const success = await connectWallet(walletAddress);

      // If successfully connected the wallet
      if (success && user) {
        console.log("✅ Wallet connected successfully");

        // Update user data with the wallet address
        const updatedUser = {
          ...user,
          walletAddress: walletAddress,
          wallet_address: walletAddress,
        };
        updateUser(updatedUser);

        console.log("👤 Updated user with wallet:", updatedUser);
        console.log("🔄 Redirecting to dashboard");

        // Hide confirmation modal
        setShowConfirmation(false);

        // Navigate to dashboard
        router.push("/(tabs)/dashboard");
      } else {
        console.log("❌ Wallet connection failed or was cancelled");
        // Keep modal open if there's an error to display
        if (!localError) {
          setShowConfirmation(false);
        }
      }
    } catch (err) {
      console.error("❌ Error during wallet confirmation:", err);

      // Extract error message from various possible formats
      let errorMessage = "An unexpected error occurred";

      if (err.response) {
        // The request was made and the server responded with an error status
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else {
          errorMessage = `Request failed: ${err.response.status}`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened while setting up the request
        errorMessage = err.message || errorMessage;
      }

      setLocalError(errorMessage);
      setShowConfirmation(false);
    }
  };

  const handleExternalLinkPress = () => {
    setShowExternalLinkModal(true);
  };

  const handleOpenExternalLink = async () => {
    setShowExternalLinkModal(false);
    try {
      const canOpen = await Linking.canOpenURL(WALLET_WEBSITE_URL);
      if (canOpen) {
        await Linking.openURL(WALLET_WEBSITE_URL);
      } else {
        Alert.alert(
          "Cannot Open Link",
          "Unable to open the website. Please try again later.",
        );
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert(
        "Error",
        "There was a problem opening the link. Please try again.",
      );
    }
  };

  return (
    <View
      style={[
        styles.mainContainer,
        { paddingBottom: insets.bottom }, // Add bottom padding for home indicator
      ]}
    >
      {/* Use the UserInitializationHeader component instead of inline header */}
      <UserInitializationHeader title="Finish ComicCoin Faucet Setup" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollViewContent,
            // Add extra bottom padding when keyboard is not visible
            !keyboardVisible && {
              paddingBottom: Math.max(40, insets.bottom + 20),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Prevents keyboard dismissal when tapping scroll view
          bounces={true} // Enable bouncing for iOS native feel
        >
          {/* Hero Banner */}
          <LinearGradient
            colors={["#4f46e5", "#4338ca"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.heroBanner,
              isSmallDevice && styles.heroBannerSmall, // Smaller on iPhone SE
            ]}
          >
            <View style={styles.heroContent}>
              <Text
                style={[
                  styles.heroTitle,
                  isSmallDevice && styles.heroTitleSmall,
                ]}
              >
                Connect Your Wallet
              </Text>
              <Text
                style={[
                  styles.heroSubtitle,
                  isSmallDevice && styles.heroSubtitleSmall,
                ]}
              >
                Link your wallet to start receiving daily rewards
              </Text>
            </View>
          </LinearGradient>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Account Setup Progress</Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressStepComplete}></View>
              <View style={styles.progressLineComplete}></View>
              <View style={styles.progressStepCurrent}></View>
              <View style={styles.progressLineIncomplete}></View>
              <View style={styles.progressStepIncomplete}></View>
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelComplete}>Register</Text>
              <Text style={styles.progressLabelCurrent}>
                &nbsp;&nbsp;&nbsp;&nbsp;Wallet
              </Text>
              <Text style={styles.progressLabelIncomplete}>Dashboard</Text>
            </View>
          </View>

          {/* Wallet Form Card */}
          <View style={styles.walletFormCard}>
            <LinearGradient
              colors={["#7e22ce", "#4338ca"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardHeader}
            >
              <Ionicons
                name="wallet-outline"
                size={24}
                color="white"
                style={styles.cardHeaderIcon}
              />
              <View>
                <Text style={styles.cardHeaderTitle}>
                  Enter Your Wallet Address
                </Text>
                <Text style={styles.cardHeaderSubtitle}>
                  This is where you'll receive your ComicCoins
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.cardBody}>
              {/* Show API errors if they exist */}
              {(connectError || localError) && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color="#EF4444"
                    style={styles.errorIcon}
                  />
                  <Text style={styles.errorText}>
                    {localError ||
                      (typeof connectError === "object" &&
                        connectError?.message) ||
                      (typeof connectError === "string" && connectError) ||
                      "An error occurred"}
                  </Text>
                </View>
              )}

              {/* Warning Message - Improved to ensure text fits properly */}
              <View style={styles.warningContainer}>
                <Ionicons
                  name="warning"
                  size={20}
                  color="#F59E0B"
                  style={styles.warningIcon}
                />
                <View style={styles.warningTextContainer}>
                  <Text style={styles.warningTitle}>Important</Text>
                  <Text style={styles.warningText}>
                    Make sure to enter your wallet address correctly. If you
                    enter the wrong address, your ComicCoins will be sent to
                    someone else and cannot be recovered!
                  </Text>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Your Wallet Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWithButtonContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={walletAddress}
                    onChangeText={setWalletAddress}
                    placeholder="0x..."
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isConnecting}
                    keyboardType={
                      Platform.OS === "ios" ? "default" : "visible-password"
                    }
                    autoComplete="off"
                    textContentType="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    selectionColor="#8347FF"
                    spellCheck={false}
                  />
                </View>
                <Text style={styles.inputHelperText}>
                  Your wallet address should start with "0x" followed by 40
                  hexadecimal characters
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (isConnecting ||
                    !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  isConnecting || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)
                }
                activeOpacity={0.7} // Better touch feedback for iOS
              >
                {isConnecting ? (
                  <View style={styles.buttonContentLoading}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.submitButtonText}>Connecting...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.submitButtonText}>Connect Wallet</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Need a Wallet - Simplified Accordion */}
          <View style={styles.accordionCard}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setIsAccordionOpen(!isAccordionOpen)}
              activeOpacity={0.8} // Better touch feedback for iOS
            >
              <LinearGradient
                colors={["#7e22ce", "#4338ca"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accordionGradient}
              >
                <View style={styles.accordionHeaderContent}>
                  <Text style={styles.accordionTitle}>Need a Wallet?</Text>
                  <Ionicons
                    name={isAccordionOpen ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="white"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {isAccordionOpen && (
              <View style={styles.accordionContent}>
                <Text style={styles.accordionText}>
                  You'll need a ComicCoin wallet to receive coins. Visit the
                  official ComicCoin wallet website to create one.
                </Text>

                <TouchableOpacity
                  style={styles.externalLinkButton}
                  onPress={handleExternalLinkPress}
                  activeOpacity={0.7} // Better touch feedback for iOS
                >
                  <Text style={styles.externalLinkText}>
                    Go to ComicCoin Wallet
                  </Text>
                  <Ionicons name="open-outline" size={18} color="#8347FF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modals */}
      <ConfirmationModal
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        walletAddress={walletAddress}
      />

      <ExternalLinkModal
        visible={showExternalLinkModal}
        onClose={() => setShowExternalLinkModal(false)}
        onConfirm={handleOpenExternalLink}
        url={WALLET_WEBSITE_URL}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
  },
  heroBanner: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  heroBannerSmall: {
    paddingVertical: 24,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  heroTitleSmall: {
    fontSize: 22,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#E0E7FF",
    textAlign: "center",
  },
  heroSubtitleSmall: {
    fontSize: 14,
  },
  progressContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8347FF",
    textAlign: "center",
    marginBottom: 16,
  },
  progressTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  progressStepComplete: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
  },
  progressLineComplete: {
    flex: 1,
    height: 2,
    backgroundColor: "#10B981",
    marginHorizontal: 4,
  },
  progressStepCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#8347FF",
    borderWidth: 3,
    borderColor: "#F3F4FF",
  },
  progressLineIncomplete: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  progressStepIncomplete: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  progressLabelComplete: {
    fontSize: 12,
    color: "#10B981",
  },
  progressLabelCurrent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8347FF",
  },
  progressLabelIncomplete: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  walletFormCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  cardHeaderIcon: {
    marginRight: 12,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  cardHeaderSubtitle: {
    fontSize: 14,
    color: "#E0E7FF",
  },
  cardBody: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#B91C1C",
  },
  warningContainer: {
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  warningIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  warningTextContainer: {
    flex: 1, // Ensure text container takes remaining space
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#92400E",
    flexWrap: "wrap", // Ensure text wraps properly
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#EF4444",
  },
  inputWithButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "white",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", // Monospaced font for wallet address
  },
  pasteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  pasteButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8347FF",
    marginLeft: 4,
  },
  inputHelperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#8347FF",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // Minimum height for iOS touch targets
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContentLoading: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginHorizontal: 8,
  },

  // Accordion styles - simplified wallet section
  accordionCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 24,
    overflow: "hidden",
    backgroundColor: "white",
  },
  accordionHeader: {
    overflow: "hidden",
    borderRadius: 12,
  },
  accordionGradient: {
    width: "100%",
  },
  accordionHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  accordionContent: {
    padding: 16,
    backgroundColor: "white",
  },
  accordionText: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 16,
    lineHeight: 22,
  },
  externalLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4FF",
    padding: 12,
    borderRadius: 8,
    minHeight: 48, // Minimum height for iOS touch targets
  },
  externalLinkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8347FF",
    marginRight: 8,
  },

  // URL container for external link modal
  urlContainer: {
    backgroundColor: "#F3F4FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  urlText: {
    fontSize: 14,
    color: "#4338CA",
    textAlign: "center",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16, // More rounded corners for iOS feel
    width: "100%",
    maxWidth: 400,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 5, // Increased touch target
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  walletAddressContainer: {
    backgroundColor: "#F3F4FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  walletAddressText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 14,
    color: "#4338CA",
    textAlign: "center",
  },
  warningIconContainer: {
    marginRight: 8,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
    minHeight: 48, // Minimum height for iOS touch targets
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#8347FF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 8,
    minHeight: 48, // Minimum height for iOS touch targets
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "white",
  },
});
