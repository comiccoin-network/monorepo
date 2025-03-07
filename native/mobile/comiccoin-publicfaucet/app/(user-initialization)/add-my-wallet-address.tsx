// app/(user-initialization)/add-my-wallet-address.tsx
import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../hooks/useAuth";
import { useWalletConnect } from "../../hooks/useWalletConnect";
import UserInitializationHeader from "../../components/UserInitializationHeader";

// Confirmation Modal component
const ConfirmationModal = ({ visible, onClose, onConfirm, walletAddress }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
            <Text style={styles.walletAddressText}>{walletAddress}</Text>
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
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Double-check</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>Confirm Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function AddMyWalletAddressScreen() {
  const router = useRouter();
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

  // Handle initial authentication check
  useEffect(() => {
    // If user data is present, we're no longer initializing
    if (user) {
      setIsInitializing(false);
    }
  }, [user]);

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

  return (
    <View style={styles.mainContainer}>
      {/* Use the UserInitializationHeader component instead of inline header */}
      <UserInitializationHeader title="Finish ComicCoin Faucet Setup" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          contentInsetAdjustmentBehavior="never"
        >
          {/* Hero Banner */}
          <LinearGradient
            colors={["#4f46e5", "#4338ca"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Connect Your Wallet</Text>
              <Text style={styles.heroSubtitle}>
                Link your ComicCoin wallet to start receiving daily rewards
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
              <Text style={styles.progressLabelComplete}>Account</Text>
              <Text style={styles.progressLabelCurrent}>Wallet</Text>
              <Text style={styles.progressLabelIncomplete}>Verification</Text>
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

              {/* Warning Message */}
              <View style={styles.warningContainer}>
                <Ionicons
                  name="warning"
                  size={20}
                  color="#F59E0B"
                  style={styles.warningIcon}
                />
                <View>
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
                <TextInput
                  style={styles.input}
                  value={walletAddress}
                  onChangeText={setWalletAddress}
                  placeholder="0x..."
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isConnecting}
                />
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

          {/* Need a Wallet Info Card */}
          <View style={styles.needWalletCard}>
            <LinearGradient
              colors={["#7e22ce", "#4338ca"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardHeader}
            >
              <Text style={styles.cardHeaderTitle}>Need a Wallet?</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Get one of these options
              </Text>
            </LinearGradient>

            <View style={styles.walletOptionsContainer}>
              <TouchableOpacity style={styles.walletOption}>
                <Ionicons
                  name="globe-outline"
                  size={24}
                  color="#8347FF"
                  style={styles.walletOptionIcon}
                />
                <View style={styles.walletOptionContent}>
                  <Text style={styles.walletOptionTitle}>Web Wallet</Text>
                  <Text style={styles.walletOptionSubtitle}>
                    No installation required
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.walletOption}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={24}
                  color="#8347FF"
                  style={styles.walletOptionIcon}
                />
                <View style={styles.walletOptionContent}>
                  <Text style={styles.walletOptionTitle}>Mobile App</Text>
                  <Text style={styles.walletOptionSubtitle}>
                    iOS and Android
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.walletOption}>
                <Ionicons
                  name="download-outline"
                  size={24}
                  color="#8347FF"
                  style={styles.walletOptionIcon}
                />
                <View style={styles.walletOptionContent}>
                  <Text style={styles.walletOptionTitle}>Desktop Wallet</Text>
                  <Text style={styles.walletOptionSubtitle}>
                    Windows, Mac, Linux
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        walletAddress={walletAddress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  // Header styles
  headerContainer: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0,
    paddingBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    padding: 8,
    width: 44,
    alignItems: "flex-start",
  },
  signOutButton: {
    padding: 8,
    width: 70,
    alignItems: "flex-end",
  },
  signOutText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
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
  heroSubtitle: {
    fontSize: 16,
    color: "#E0E7FF",
    textAlign: "center",
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
  warningTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#92400E",
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
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1F2937",
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
  needWalletCard: {
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
  walletOptionsContainer: {
    padding: 8,
  },
  warningIconContainer: {
    marginRight: 8,
  },
  walletOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  walletOptionIcon: {
    marginRight: 12,
  },
  walletOptionContent: {
    flex: 1,
  },
  walletOptionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  walletOptionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
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
    borderRadius: 12,
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
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "white",
  },
});
