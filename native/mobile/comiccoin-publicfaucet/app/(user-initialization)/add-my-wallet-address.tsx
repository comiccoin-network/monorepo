// app/(user-initialization)/add-my-wallet-address.tsx
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
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  Dimensions,
  Linking,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../hooks/useAuth";
import { useWalletConnect } from "../../hooks/useWalletConnect";
import UserInitializationHeader from "../../components/UserInitializationHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// Get device dimensions for responsive layout
const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 700; // iPhone SE or similar
const isLargeDevice = height > 800; // iPhone Pro Max or similar
const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";

// Touchable component factory to handle platform differences
const createTouchable = (isAndroid) => {
  return ({ children, style, onPress, disabled = false, ...props }) => {
    if (isAndroid) {
      // For Android, use TouchableNativeFeedback with ripple effect
      return (
        <TouchableNativeFeedback
          onPress={onPress}
          background={TouchableNativeFeedback.Ripple("#d4c1ff", false)}
          useForeground={true}
          disabled={disabled}
          {...props}
        >
          <View style={[style, { overflow: "hidden" }]}>{children}</View>
        </TouchableNativeFeedback>
      );
    }
    // For iOS, use TouchableOpacity
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
};

// Create platform-specific Touchable component
const Touchable = createTouchable(isAndroid);

// Confirmation Modal component
const ConfirmationModal = ({ visible, onClose, onConfirm, walletAddress }) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  // Different modal content for different platforms
  const modalContent = (
    <View
      style={[
        styles.modalContainer,
        { paddingBottom: Math.max(20, insets.bottom) }, // Ensure safe area padding
        isAndroid && styles.androidModalContainer, // Android-specific styling
      ]}
    >
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons name="close" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      <View style={styles.modalHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={32} color="#8347FF" />
        </View>
        <Text
          style={[styles.modalTitle, isAndroid && styles.androidModalTitle]}
        >
          Confirm Your Wallet
        </Text>
        <Text
          style={[
            styles.modalSubtitle,
            isAndroid && styles.androidModalSubtitle,
          ]}
        >
          Please verify that this is your correct wallet address:
        </Text>
      </View>

      <View style={styles.walletAddressContainer}>
        <Text
          style={[
            styles.walletAddressText,
            isAndroid && styles.androidWalletAddressText,
          ]}
          selectable={true}
          adjustsFontSizeToFit={isSmallDevice}
          numberOfLines={2}
        >
          {walletAddress}
        </Text>
      </View>

      <View style={styles.warningContainer}>
        <View style={styles.warningIconContainer}>
          <Ionicons name="warning" size={20} color="#F59E0B" />
        </View>
        <Text
          style={[styles.warningText, isAndroid && styles.androidWarningText]}
        >
          Double-check your wallet address carefully. Coins sent to the wrong
          address cannot be recovered!
        </Text>
      </View>

      <View style={styles.modalButtonsContainer}>
        {isAndroid ? (
          // Android-specific button layout
          <>
            <View style={styles.androidButtonWrapper}>
              <TouchableNativeFeedback
                onPress={onClose}
                background={TouchableNativeFeedback.Ripple("#E5E7EB", false)}
                useForeground={true}
              >
                <View style={styles.cancelButton}>
                  <Text
                    style={[styles.cancelButtonText, styles.androidButtonText]}
                  >
                    DOUBLE-CHECK
                  </Text>
                </View>
              </TouchableNativeFeedback>
            </View>

            <View style={styles.androidButtonWrapper}>
              <TouchableNativeFeedback
                onPress={onConfirm}
                background={TouchableNativeFeedback.Ripple("#6D28D9", false)}
                useForeground={true}
              >
                <View style={styles.confirmButton}>
                  <Text
                    style={[styles.confirmButtonText, styles.androidButtonText]}
                  >
                    CONFIRM ADDRESS
                  </Text>
                </View>
              </TouchableNativeFeedback>
            </View>
          </>
        ) : (
          // iOS buttons
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Double-check</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Confirm Address</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  // Platform-specific modal container
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>{modalContent}</View>
    </Modal>
  );
};

// External Link Confirmation Modal
const ExternalLinkModal = ({ visible, onClose, onConfirm, url }) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  // Different modal content for different platforms
  const modalContent = (
    <View
      style={[
        styles.modalContainer,
        { paddingBottom: Math.max(20, insets.bottom) }, // Ensure safe area padding
        isAndroid && styles.androidModalContainer, // Android-specific styling
      ]}
    >
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons name="close" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      <View style={styles.modalHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="open-outline" size={32} color="#8347FF" />
        </View>
        <Text
          style={[styles.modalTitle, isAndroid && styles.androidModalTitle]}
        >
          Leave App
        </Text>
        <Text
          style={[
            styles.modalSubtitle,
            isAndroid && styles.androidModalSubtitle,
          ]}
        >
          You're about to be redirected to:
        </Text>
      </View>

      <View style={styles.urlContainer}>
        <Text style={[styles.urlText, isAndroid && styles.androidUrlText]}>
          {url}
        </Text>
      </View>

      <View style={styles.warningContainer}>
        <View style={styles.warningIconContainer}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
        </View>
        <Text
          style={[styles.warningText, isAndroid && styles.androidWarningText]}
        >
          You will be redirected to an external website. Are you sure you want
          to proceed?
        </Text>
      </View>

      <View style={styles.modalButtonsContainer}>
        {isAndroid ? (
          // Android-specific button layout
          <>
            <View style={styles.androidButtonWrapper}>
              <TouchableNativeFeedback
                onPress={onClose}
                background={TouchableNativeFeedback.Ripple("#E5E7EB", false)}
                useForeground={true}
              >
                <View style={styles.cancelButton}>
                  <Text
                    style={[styles.cancelButtonText, styles.androidButtonText]}
                  >
                    CANCEL
                  </Text>
                </View>
              </TouchableNativeFeedback>
            </View>

            <View style={styles.androidButtonWrapper}>
              <TouchableNativeFeedback
                onPress={onConfirm}
                background={TouchableNativeFeedback.Ripple("#6D28D9", false)}
                useForeground={true}
              >
                <View style={styles.confirmButton}>
                  <Text
                    style={[styles.confirmButtonText, styles.androidButtonText]}
                  >
                    CONTINUE
                  </Text>
                </View>
              </TouchableNativeFeedback>
            </View>
          </>
        ) : (
          // iOS buttons
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  // Platform-specific modal container
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>{modalContent}</View>
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

  // Handle Android back button
  useEffect(() => {
    if (isAndroid) {
      const backAction = () => {
        if (showConfirmation) {
          setShowConfirmation(false);
          return true;
        }
        if (showExternalLinkModal) {
          setShowExternalLinkModal(false);
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }
  }, [showConfirmation, showExternalLinkModal]);

  // Track keyboard visibility for iOS
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      isIOS ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );

    const keyboardWillHideListener = Keyboard.addListener(
      isIOS ? "keyboardWillHide" : "keyboardDidHide",
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
        <ActivityIndicator
          size="large"
          color="#8347FF"
          style={isAndroid ? { transform: [{ scale: 1.3 }] } : null}
        />
        <Text
          style={[styles.loadingText, isAndroid && styles.androidLoadingText]}
        >
          Loading your account...
        </Text>
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

      // Add haptic feedback for Android
      if (isAndroid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      return;
    }

    // Add haptic feedback for Android
    if (isAndroid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

        // Add haptic feedback for Android on success
        if (isAndroid) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

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

      // Add haptic feedback for Android on error
      if (isAndroid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setLocalError(errorMessage);
      setShowConfirmation(false);
    }
  };

  const handleExternalLinkPress = () => {
    // Add haptic feedback for Android
    if (isAndroid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

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

  // Render platform-specific input field with copy/paste button
  const renderInputField = () => {
    return (
      <View style={styles.inputContainer}>
        <Text
          style={[styles.inputLabel, isAndroid && styles.androidInputLabel]}
        >
          Your Wallet Address <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputWithButtonContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.input, isAndroid && styles.androidInput]}
            value={walletAddress}
            onChangeText={setWalletAddress}
            placeholder="0x..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isConnecting}
            keyboardType={isIOS ? "default" : "visible-password"}
            autoComplete="off"
            textContentType="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            selectionColor="#8347FF"
            spellCheck={false}
            underlineColorAndroid="transparent"
          />
        </View>
        <Text
          style={[
            styles.inputHelperText,
            isAndroid && styles.androidInputHelperText,
          ]}
        >
          Your wallet address should start with "0x" followed by 40 hexadecimal
          characters
        </Text>
      </View>
    );
  };

  // Render platform-specific submit button
  const renderSubmitButton = () => {
    const buttonDisabled =
      isConnecting || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/);

    if (isAndroid) {
      return (
        <View style={styles.androidButtonWrapper}>
          <TouchableNativeFeedback
            onPress={handleSubmit}
            disabled={buttonDisabled}
            background={TouchableNativeFeedback.Ripple("#6D28D9", false)}
            useForeground={true}
          >
            <View
              style={[
                styles.submitButton,
                buttonDisabled && styles.submitButtonDisabled,
                styles.androidSubmitButton,
              ]}
            >
              {isConnecting ? (
                <View style={styles.buttonContentLoading}>
                  <ActivityIndicator size="small" color="white" />
                  <Text
                    style={[styles.submitButtonText, styles.androidButtonText]}
                  >
                    CONNECTING...
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text
                    style={[styles.submitButtonText, styles.androidButtonText]}
                  >
                    CONNECT WALLET
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              )}
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.submitButton,
          buttonDisabled && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={buttonDisabled}
        activeOpacity={0.7}
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
    );
  };

  return (
    <View
      style={[
        styles.mainContainer,
        { paddingBottom: insets.bottom }, // Add bottom padding for home indicator
      ]}
    >
      {/* Set appropriate status bar for Android */}
      {isAndroid && (
        <StatusBar
          backgroundColor="transparent"
          translucent={true}
          barStyle="light-content"
        />
      )}

      {/* Use the UserInitializationHeader component instead of inline header */}
      <UserInitializationHeader title="Finish ComicCoin Faucet Setup" />

      <KeyboardAvoidingView
        behavior={isIOS ? "padding" : "height"}
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
              isAndroid && styles.androidHeroBanner, // Android-specific adjustments
            ]}
          >
            <View style={styles.heroContent}>
              <Text
                style={[
                  styles.heroTitle,
                  isSmallDevice && styles.heroTitleSmall,
                  isAndroid && styles.androidHeroTitle,
                ]}
              >
                Connect Your Wallet
              </Text>
              <Text
                style={[
                  styles.heroSubtitle,
                  isSmallDevice && styles.heroSubtitleSmall,
                  isAndroid && styles.androidHeroSubtitle,
                ]}
              >
                Link your wallet to start receiving daily rewards
              </Text>
            </View>
          </LinearGradient>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text
              style={[
                styles.progressTitle,
                isAndroid && styles.androidProgressTitle,
              ]}
            >
              Account Setup Progress
            </Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressStepComplete}></View>
              <View style={styles.progressLineComplete}></View>
              <View style={styles.progressStepCurrent}></View>
              <View style={styles.progressLineIncomplete}></View>
              <View style={styles.progressStepIncomplete}></View>
            </View>
            <View style={styles.progressLabels}>
              <Text
                style={[
                  styles.progressLabelComplete,
                  isAndroid && styles.androidProgressLabelComplete,
                ]}
              >
                Register
              </Text>
              <Text
                style={[
                  styles.progressLabelCurrent,
                  isAndroid && styles.androidProgressLabelCurrent,
                ]}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;Wallet
              </Text>
              <Text
                style={[
                  styles.progressLabelIncomplete,
                  isAndroid && styles.androidProgressLabelIncomplete,
                ]}
              >
                Dashboard
              </Text>
            </View>
          </View>

          {/* Wallet Form Card */}
          <View
            style={[
              styles.walletFormCard,
              isAndroid && styles.androidWalletFormCard,
            ]}
          >
            <LinearGradient
              colors={["#7e22ce", "#4338ca"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.cardHeader, isAndroid && styles.androidCardHeader]}
            >
              <Ionicons
                name="wallet-outline"
                size={24}
                color="white"
                style={styles.cardHeaderIcon}
              />
              <View>
                <Text
                  style={[
                    styles.cardHeaderTitle,
                    isAndroid && styles.androidCardHeaderTitle,
                  ]}
                >
                  Enter Your Wallet Address
                </Text>
                <Text
                  style={[
                    styles.cardHeaderSubtitle,
                    isAndroid && styles.androidCardHeaderSubtitle,
                  ]}
                >
                  This is where you'll receive your ComicCoins
                </Text>
              </View>
            </LinearGradient>

            <View
              style={[styles.cardBody, isAndroid && styles.androidCardBody]}
            >
              {/* Show API errors if they exist */}
              {(connectError || localError) && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color="#EF4444"
                    style={styles.errorIcon}
                  />
                  <Text
                    style={[
                      styles.errorText,
                      isAndroid && styles.androidErrorText,
                    ]}
                  >
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
                  <Text
                    style={[
                      styles.warningTitle,
                      isAndroid && styles.androidWarningTitle,
                    ]}
                  >
                    Important
                  </Text>
                  <Text
                    style={[
                      styles.warningText,
                      isAndroid && styles.androidWarningText,
                    ]}
                  >
                    Make sure to enter your wallet address correctly. If you
                    enter the wrong address, your ComicCoins will be sent to
                    someone else and cannot be recovered!
                  </Text>
                </View>
              </View>

              {/* Input Field */}
              {renderInputField()}

              {/* Submit Button */}
              {renderSubmitButton()}
            </View>
          </View>

          {/* Need a Wallet - Simplified Accordion */}
          <View
            style={[
              styles.accordionCard,
              isAndroid && styles.androidAccordionCard,
            ]}
          >
            {isAndroid ? (
              <TouchableNativeFeedback
                onPress={() => setIsAccordionOpen(!isAccordionOpen)}
                background={TouchableNativeFeedback.Ripple("#6D28D9", true)}
              >
                <View style={styles.accordionHeader}>
                  <LinearGradient
                    colors={["#7e22ce", "#4338ca"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.accordionGradient}
                  >
                    <View style={styles.accordionHeaderContent}>
                      <Text
                        style={[
                          styles.accordionTitle,
                          styles.androidAccordionTitle,
                        ]}
                      >
                        Need a Wallet?
                      </Text>
                      <Ionicons
                        name={isAccordionOpen ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="white"
                      />
                    </View>
                  </LinearGradient>
                </View>
              </TouchableNativeFeedback>
            ) : (
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIsAccordionOpen(!isAccordionOpen)}
                activeOpacity={0.8}
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
            )}

            {isAccordionOpen && (
              <View style={styles.accordionContent}>
                <Text
                  style={[
                    styles.accordionText,
                    isAndroid && styles.androidAccordionText,
                  ]}
                >
                  You'll need a ComicCoin wallet to receive coins. Visit the
                  official ComicCoin wallet website to create one.
                </Text>

                {isAndroid ? (
                  <View style={styles.androidButtonWrapper}>
                    <TouchableNativeFeedback
                      onPress={handleExternalLinkPress}
                      background={TouchableNativeFeedback.Ripple(
                        "#E9D5FF",
                        false,
                      )}
                      useForeground={true}
                    >
                      <View
                        style={[
                          styles.externalLinkButton,
                          styles.androidExternalLinkButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.externalLinkText,
                            styles.androidExternalLinkText,
                          ]}
                        >
                          GO TO COMICCOIN WALLET
                        </Text>
                        <Ionicons
                          name="open-outline"
                          size={18}
                          color="#8347FF"
                        />
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.externalLinkButton}
                    onPress={handleExternalLinkPress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.externalLinkText}>
                      Go to ComicCoin Wallet
                    </Text>
                    <Ionicons name="open-outline" size={18} color="#8347FF" />
                  </TouchableOpacity>
                )}
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
    fontFamily: "System",
    fontWeight: "500",
  },
  androidLoadingText: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
  },
  heroBanner: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  androidHeroBanner: {
    paddingTop: 24,
    paddingBottom: 24,
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
    fontFamily: "System",
  },
  androidHeroTitle: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
  },
  heroTitleSmall: {
    fontSize: 22,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#E0E7FF",
    textAlign: "center",
    fontFamily: "System",
  },
  androidHeroSubtitle: {
    fontFamily: "sans-serif",
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
    fontFamily: "System",
  },
  androidProgressTitle: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
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
    fontFamily: "System",
  },
  androidProgressLabelComplete: {
    fontFamily: "sans-serif",
  },
  progressLabelCurrent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8347FF",
    fontFamily: "System",
  },
  androidProgressLabelCurrent: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
  },
  progressLabelIncomplete: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "System",
  },
  androidProgressLabelIncomplete: {
    fontFamily: "sans-serif",
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
  androidWalletFormCard: {
    borderRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  androidCardHeader: {
    padding: 18,
  },
  cardHeaderIcon: {
    marginRight: 12,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    fontFamily: "System",
  },
  androidCardHeaderTitle: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
  },
  cardHeaderSubtitle: {
    fontSize: 14,
    color: "#E0E7FF",
    fontFamily: "System",
  },
  androidCardHeaderSubtitle: {
    fontFamily: "sans-serif",
  },
  cardBody: {
    padding: 16,
  },
  androidCardBody: {
    padding: 18,
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
    fontFamily: "System",
  },
  androidErrorText: {
    fontFamily: "sans-serif",
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
    fontFamily: "System",
  },
  androidWarningTitle: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
  },
  warningText: {
    fontSize: 14,
    color: "#92400E",
    flexWrap: "wrap", // Ensure text wraps properly
    fontFamily: "System",
  },
  androidWarningText: {
    fontFamily: "sans-serif",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
    fontFamily: "System",
  },
  androidInputLabel: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
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
    fontFamily: "Menlo", // Monospaced font for wallet address
  },
  androidInput: {
    fontFamily: "monospace",
    height: 52,
    borderRadius: 4,
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
    fontFamily: "System",
  },
  inputHelperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "System",
  },
  androidInputHelperText: {
    fontFamily: "sans-serif",
  },
  submitButton: {
    backgroundColor: "#8347FF",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // Minimum height for iOS touch targets
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  androidSubmitButton: {
    borderRadius: 4,
    elevation: 4,
    minHeight: 52,
  },
  androidButtonWrapper: {
    borderRadius: 4,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.5,
    elevation: 0,
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
    fontFamily: "System",
  },
  androidButtonText: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  androidAccordionCard: {
    borderRadius: 8,
    elevation: 3,
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
    fontFamily: "System",
  },
  androidAccordionTitle: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
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
    fontFamily: "System",
  },
  androidAccordionText: {
    fontFamily: "sans-serif",
    lineHeight: 24,
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
  androidExternalLinkButton: {
    borderRadius: 4,
    minHeight: 52,
  },
  externalLinkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8347FF",
    marginRight: 8,
    fontFamily: "System",
  },
  androidExternalLinkText: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
    fontFamily: "System",
  },
  androidUrlText: {
    fontFamily: "monospace",
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
  androidModalContainer: {
    borderRadius: 8,
    elevation: 24,
    padding: 24,
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
    fontFamily: "System",
  },
  androidModalTitle: {
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "System",
  },
  androidModalSubtitle: {
    fontFamily: "sans-serif",
  },
  walletAddressContainer: {
    backgroundColor: "#F3F4FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  walletAddressText: {
    fontFamily: "Menlo",
    fontSize: 14,
    color: "#4338CA",
    textAlign: "center",
  },
  androidWalletAddressText: {
    fontFamily: "monospace",
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
    fontFamily: "System",
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
    fontFamily: "System",
  },
});
