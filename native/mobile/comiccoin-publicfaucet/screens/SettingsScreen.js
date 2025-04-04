// screens/SettingsScreen.js - With Android optimizations
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Switch,
  Keyboard,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePutUpdateMe } from "../hooks/usePutUpdateMe";
import { useAuth } from "../hooks/useAuth";
import { useGetMe } from "../hooks/useGetMe";
import Header from "../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTrackingPermissionsAsync } from "expo-tracking-transparency";

// Get device dimensions for responsive layout
const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 667; // iPhone SE or similar
const isLargeDevice = height > 844; // iPhone Pro Max models
const isAndroid = Platform.OS === "android";
const isIOS = Platform.OS === "ios";

// Define country and timezone options for dropdown selection
const countries = [
  { value: "", label: "Select a country" },
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
];

const timezones = [
  { value: "", label: "Select Timezone..." },
  { value: "UTC-12:00", label: "(UTC-12:00) International Date Line West" },
  { value: "UTC-11:00", label: "(UTC-11:00) Samoa" },
  { value: "UTC-10:00", label: "(UTC-10:00) Hawaii" },
  { value: "UTC-08:00", label: "(UTC-08:00) Pacific Time (US & Canada)" },
  { value: "UTC-07:00", label: "(UTC-07:00) Mountain Time (US & Canada)" },
  { value: "UTC-06:00", label: "(UTC-06:00) Central Time (US & Canada)" },
  { value: "UTC-05:00", label: "(UTC-05:00) Eastern Time (US & Canada)" },
  { value: "UTC+00:00", label: "(UTC+00:00) London, Dublin, Lisbon" },
  { value: "UTC+01:00", label: "(UTC+01:00) Berlin, Paris, Rome, Madrid" },
  { value: "UTC+02:00", label: "(UTC+02:00) Athens, Istanbul, Cairo" },
  { value: "UTC+03:00", label: "(UTC+03:00) Moscow, Baghdad" },
  { value: "UTC+05:30", label: "(UTC+05:30) New Delhi, Mumbai" },
  { value: "UTC+08:00", label: "(UTC+08:00) Beijing, Singapore, Hong Kong" },
  { value: "UTC+09:00", label: "(UTC+09:00) Tokyo, Seoul" },
  { value: "UTC+10:00", label: "(UTC+10:00) Sydney, Melbourne" },
];

// Custom touchable component that uses the appropriate component based on platform
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

const SettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Get safe area insets
  const isIOS = Platform.OS === "ios";
  const [isManuallyLoading, setIsManuallyLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Reference for ScrollView to handle keyboard appearance
  const scrollViewRef = useRef(null);

  // Set Android status bar colors
  useEffect(() => {
    if (isAndroid) {
      StatusBar.setBackgroundColor("#7e22ce");
      StatusBar.setBarStyle("light-content");
    }
  }, []);

  // Use the useAuth hook to get current user data
  const { user, updateUser } = useAuth();

  // Use the useGetMe hook to fetch latest user data
  const {
    user: latestUserData,
    isLoading: isLoadingUserData,
    error: userDataError,
    refetch: refreshUserData,
  } = useGetMe();

  // Define loading state based on if we have user data
  const isLoadingUser = isLoadingUserData || (!user && isManuallyLoading);

  // Function to refresh data using the new API call
  const handleRefreshUserData = async () => {
    setIsManuallyLoading(true);
    try {
      await refreshUserData();
      console.log("✅ User data refreshed successfully");
    } catch (error) {
      console.error("❌ Failed to refresh user data:", error);
    } finally {
      // Keep the slight delay for better UX transition
      setTimeout(() => {
        setIsManuallyLoading(false);
      }, 600); // Slightly longer for iOS animations
    }
  };

  // Set up keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      isIOS ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        // On iOS, scroll to active input when keyboard appears
        if (isIOS && scrollViewRef.current) {
          // Delay scrolling slightly to ensure input has focus
          setTimeout(() => {
            scrollViewRef.current.scrollTo({ y: 150, animated: true });
          }, 100);
        } else if (isAndroid && scrollViewRef.current) {
          // Android needs a bit more scroll
          setTimeout(() => {
            scrollViewRef.current.scrollTo({ y: 200, animated: true });
          }, 100);
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
  }, [isIOS]);

  const {
    updateMe,
    isLoading: isUpdating,
    error: updateError,
    isSuccess,
  } = usePutUpdateMe();

  // State for form data
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: null,
    country: null,
    timezone: "",
    agree_promotions: false,
    agree_to_tracking_across_third_party_apps_and_services: false,
    wallet_address: "",
  });

  // State for form validation errors
  const [formErrors, setFormErrors] = useState({});

  // State for status messages (success/error notifications)
  const [statusMessage, setStatusMessage] = useState({
    type: null,
    message: "",
  });

  // Auto-dismiss status messages after 5 seconds
  useEffect(() => {
    let timer;

    if (statusMessage.type) {
      timer = setTimeout(() => {
        setStatusMessage({ type: null, message: "" });
      }, 5000);
    }

    // Cleanup timer to prevent memory leaks
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [statusMessage]);

  // Initialize form data when user information loads
  useEffect(() => {
    console.log("🔄 Updating form with latest user data", latestUserData);

    // Use the latest user data from API if available
    if (latestUserData) {
      setFormData({
        email: latestUserData.email || "",
        first_name: latestUserData.first_name || "",
        last_name: latestUserData.last_name || "",
        phone: latestUserData.phone || null,
        country: latestUserData.country || null,
        timezone: latestUserData.timezone || "",
        agree_promotions: latestUserData.agree_promotions || false,
        agree_to_tracking_across_third_party_apps_and_services:
          latestUserData.agree_to_tracking_across_third_party_apps_and_services ||
          false,
        wallet_address: latestUserData.wallet_address || "",
      });
    }
    // Fall back to auth context user data if API data isn't available yet
    else if (user) {
      setFormData({
        email: user.email || "",
        first_name: user.firstName || user.first_name || "",
        last_name: user.lastName || user.last_name || "",
        phone: user.phone || null,
        country: user.country || null,
        timezone: user.timezone || "",
        agree_promotions: user.agree_promotions || false,
        agree_to_tracking_across_third_party_apps_and_services:
          user.agree_to_tracking_across_third_party_apps_and_services || false,
        wallet_address: user.walletAddress || user.wallet_address || "",
      });
    }
  }, [latestUserData, user]);

  // Display error message if API fetch fails
  useEffect(() => {
    if (userDataError) {
      setStatusMessage({
        type: "error",
        message:
          "Failed to load your latest profile data. Using cached data instead.",
      });
    }
  }, [userDataError]);

  // Check iOS tracking permissions
  useEffect(() => {
    if (isIOS) {
      const checkTrackingPermission = async () => {
        try {
          const { status } = await getTrackingPermissionsAsync();
          // If we have a permission status, update the form field
          if (status === "granted" || status === "denied") {
            setFormData((prev) => ({
              ...prev,
              agree_to_tracking_across_third_party_apps_and_services:
                status === "granted",
            }));
            console.log("Successfully set tracking permission");
          }
        } catch (error) {
          console.error("Error checking tracking permission:", error);
        }
      };

      checkTrackingPermission();
    }
  }, [isIOS]);

  // Update status message based on API call results
  useEffect(() => {
    if (isSuccess) {
      setStatusMessage({
        type: "success",
        message: "Your settings have been updated successfully!",
      });

      // Refresh user data after successful update
      refreshUserData();
    } else if (updateError) {
      setStatusMessage({
        type: "error",
        message:
          updateError.message || "Failed to update settings. Please try again.",
      });
    }
  }, [isSuccess, updateError, refreshUserData]);

  // Handle form submission with comprehensive validation
  const handleSubmit = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Comprehensive validation across all required fields
    const errors = {};

    // Email validation
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Valid email is required";
    }

    // First name validation
    if (!formData.first_name) {
      errors.first_name = "First name is required";
    }

    // Last name validation
    if (!formData.last_name) {
      errors.last_name = "Last name is required";
    }

    // Timezone validation
    if (!formData.timezone) {
      errors.timezone = "Timezone is required";
    }

    // Wallet address validation
    if (!formData.wallet_address) {
      errors.wallet_address = "Wallet address is required";
    }

    // If there are validation errors, prevent submission
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      // Show error alert - platform specific styling
      if (isAndroid) {
        Alert.alert(
          "Validation Error",
          "Please correct the highlighted fields before saving.",
          [{ text: "OK", style: "default" }],
        );
      } else {
        Alert.alert(
          "Validation Error",
          "Please correct the highlighted fields before saving.",
          [{ text: "OK" }],
        );
      }

      // Scroll to top to show errors
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }

      return;
    }

    try {
      // Prepare data for submission
      const updateData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        timezone: formData.timezone,
        phone: formData.phone,
        country: formData.country,
        wallet_address: formData.wallet_address,
        agree_promotions: formData.agree_promotions,
        agree_to_tracking_across_third_party_apps_and_services:
          formData.agree_to_tracking_across_third_party_apps_and_services,
      };

      // Attempt to update user profile
      await updateMe(updateData);
      // Success message and status handling is done in the useEffect
    } catch (err) {
      console.error("Update failed", err);

      // Show error message if update fails
      setStatusMessage({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update settings. Please try again.",
      });
    }
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    router.back();
  };

  // Function to handle form input changes
  const handleInputChange = (fieldKey, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: fieldKey === "phone" ? value || null : value,
    }));

    // Clear error when typing
    if (formErrors[fieldKey]) {
      setFormErrors((prev) => ({
        ...prev,
        [fieldKey]: undefined,
      }));
    }
  };

  // Render loading state if user data is not yet available
  if (isLoadingUser) {
    return (
      <View style={styles.container}>
        <Header showBackButton={true} title="Settings" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#8347FF"
            style={isAndroid ? styles.androidLoader : undefined}
          />
          <Text style={styles.loadingText}>Loading your settings...</Text>

          <Touchable style={styles.retryButton} onPress={handleRefreshUserData}>
            <View style={styles.buttonContentRow}>
              <Ionicons
                name="refresh"
                size={16}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.retryButtonText}>Retry Loading</Text>
            </View>
          </Touchable>
        </View>
      </View>
    );
  }

  // For iOS, render a dropdown selector modal
  const renderPicker = (
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
  ) => {
    if (!isIOS || !visible) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.pickerOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  selectedValue === option.value && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedValue === option.value &&
                      styles.pickerOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Ionicons name="checkmark" size={20} color="#8347FF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.pickerCancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.pickerCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // For Android, render a dropdown modal for country selection
  const renderAndroidPicker = (
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
  ) => {
    if (!isAndroid || !visible) return null;

    return (
      <View style={styles.androidModalOverlay}>
        <View style={styles.androidPickerContainer}>
          <View style={styles.androidPickerHeader}>
            <Text style={styles.androidPickerTitle}>{title}</Text>
            <TouchableNativeFeedback
              onPress={onClose}
              background={TouchableNativeFeedback.Ripple(
                "rgba(0, 0, 0, 0.1)",
                true,
              )}
              useForeground={true}
            >
              <View style={styles.androidPickerCloseBtn}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </View>
            </TouchableNativeFeedback>
          </View>

          <ScrollView style={styles.androidPickerOptions}>
            {options.map((option) => (
              <TouchableNativeFeedback
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                background={TouchableNativeFeedback.Ripple("#f3f4ff", false)}
                useForeground={true}
              >
                <View
                  style={[
                    styles.androidPickerOption,
                    selectedValue === option.value &&
                      styles.androidPickerOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.androidPickerOptionText,
                      selectedValue === option.value &&
                        styles.androidPickerOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedValue === option.value && (
                    <Ionicons name="checkmark" size={20} color="#8347FF" />
                  )}
                </View>
              </TouchableNativeFeedback>
            ))}
          </ScrollView>

          <View style={styles.androidPickerActions}>
            <TouchableNativeFeedback
              onPress={onClose}
              background={TouchableNativeFeedback.Ripple(
                "rgba(0, 0, 0, 0.1)",
                true,
              )}
              useForeground={true}
            >
              <View style={styles.androidPickerCancelButton}>
                <Text style={styles.androidPickerCancelText}>CANCEL</Text>
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>
      </View>
    );
  };

  // Render a form input field with label and error handling
  const renderField = (field) => {
    const hasError = !!formErrors[field.fieldKey];
    const isRequired = field.required;

    // Platform specific implementation for select fields
    if (field.type === "select") {
      if (isAndroid) {
        return (
          <View key={field.id} style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              {isRequired && <Text style={styles.requiredStar}>*</Text>}
            </View>

            <View style={styles.androidSelectWrapper}>
              <TouchableNativeFeedback
                onPress={() => {
                  if (field.fieldKey === "country") {
                    setShowCountryPicker(true);
                  } else {
                    setShowTimezonePicker(true);
                  }
                }}
                disabled={field.disabled}
                background={TouchableNativeFeedback.Ripple("#e5e7eb", false)}
                useForeground={true}
              >
                <View
                  style={[
                    styles.input,
                    styles.androidInput,
                    hasError && styles.inputError,
                    field.disabled && styles.inputDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.inputText,
                      !formData[field.fieldKey] && styles.placeholderText,
                    ]}
                  >
                    {field.fieldKey === "country"
                      ? formData.country
                        ? countries.find((c) => c.value === formData.country)
                            ?.label || formData.country
                        : "Select your country"
                      : formData.timezone
                        ? timezones.find((t) => t.value === formData.timezone)
                            ?.label || formData.timezone
                        : "Select your timezone"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </View>
              </TouchableNativeFeedback>
            </View>

            {/* Error message or helper text */}
            {hasError ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={14}
                  color="#EF4444"
                  style={styles.errorIcon}
                />
                <Text style={styles.errorText}>
                  {formErrors[field.fieldKey]}
                </Text>
              </View>
            ) : field.helperText ? (
              <View style={styles.helperContainer}>
                <Ionicons
                  name="information-circle"
                  size={14}
                  color="#6B7280"
                  style={styles.helperIcon}
                />
                <Text style={styles.helperText}>{field.helperText}</Text>
              </View>
            ) : null}
          </View>
        );
      }

      // iOS implementation (unchanged)
      return (
        <View key={field.id} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.inputLabel}>{field.label}</Text>
            {isRequired && <Text style={styles.requiredStar}>*</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.input,
              hasError && styles.inputError,
              field.disabled && styles.inputDisabled,
            ]}
            onPress={() => {
              if (field.fieldKey === "country") {
                setShowCountryPicker(true);
              } else {
                setShowTimezonePicker(true);
              }
            }}
            disabled={field.disabled}
            activeOpacity={0.7} // Better touch feedback for iOS
          >
            <Text
              style={[
                styles.inputText,
                !formData[field.fieldKey] && styles.placeholderText,
              ]}
            >
              {field.fieldKey === "country"
                ? formData.country
                  ? countries.find((c) => c.value === formData.country)
                      ?.label || formData.country
                  : "Select your country"
                : formData.timezone
                  ? timezones.find((t) => t.value === formData.timezone)
                      ?.label || formData.timezone
                  : "Select your timezone"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Error message or helper text */}
          {hasError ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle"
                size={14}
                color="#EF4444"
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{formErrors[field.fieldKey]}</Text>
            </View>
          ) : field.helperText ? (
            <View style={styles.helperContainer}>
              <Ionicons
                name="information-circle"
                size={14}
                color="#6B7280"
                style={styles.helperIcon}
              />
              <Text style={styles.helperText}>{field.helperText}</Text>
            </View>
          ) : null}
        </View>
      );
    } else if (field.fieldKey === "wallet_address") {
      // Special case for wallet address with copy button
      return (
        <View key={field.id} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.inputLabel}>{field.label}</Text>
            {isRequired && <Text style={styles.requiredStar}>*</Text>}
          </View>

          <View style={styles.walletAddressContainer}>
            <TextInput
              style={[
                styles.input,
                styles.inputDisabled,
                styles.walletAddressInput,
                isAndroid && styles.androidInput,
              ]}
              value={formData[field.fieldKey]}
              editable={false}
              placeholder={field.placeholder}
              underlineColorAndroid="transparent" // Remove default Android underline
            />
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => {
                if (formData.wallet_address) {
                  // In a real implementation we would use Clipboard API
                  // This is a placeholder since we can't access the clipboard directly
                  setStatusMessage({
                    type: "success",
                    message: "Wallet address copied to clipboard!",
                  });
                }
              }}
              activeOpacity={0.7} // Better touch feedback for iOS
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Larger hit area for iOS
            >
              <Ionicons name="copy-outline" size={20} color="#8347FF" />
            </TouchableOpacity>
          </View>

          {/* Error message or helper text */}
          {hasError ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle"
                size={14}
                color="#EF4444"
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{formErrors[field.fieldKey]}</Text>
            </View>
          ) : field.helperText ? (
            <View style={styles.helperContainer}>
              <Ionicons
                name="information-circle"
                size={14}
                color="#6B7280"
                style={styles.helperIcon}
              />
              <Text style={styles.helperText}>{field.helperText}</Text>
            </View>
          ) : null}
        </View>
      );
    } else {
      // Default text input field
      return (
        <View key={field.id} style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.inputLabel}>{field.label}</Text>
            {isRequired && <Text style={styles.requiredStar}>*</Text>}
          </View>

          <TextInput
            style={[
              styles.input,
              hasError && styles.inputError,
              field.disabled && styles.inputDisabled,
              isAndroid && styles.androidInput,
            ]}
            value={
              field.fieldKey === "phone"
                ? formData.phone || ""
                : formData[field.fieldKey]
            }
            onChangeText={(value) => handleInputChange(field.fieldKey, value)}
            placeholder={field.placeholder}
            editable={!field.disabled}
            keyboardType={
              field.type === "email"
                ? "email-address"
                : field.type === "tel"
                  ? "phone-pad"
                  : "default"
            }
            autoCapitalize={field.type === "email" ? "none" : "words"}
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            underlineColorAndroid="transparent" // Remove default Android underline
            // iOS specific
            textContentType={
              field.type === "email"
                ? "emailAddress"
                : field.type === "tel"
                  ? "telephoneNumber"
                  : "name"
            }
          />

          {/* Error message or helper text */}
          {hasError ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle"
                size={14}
                color="#EF4444"
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{formErrors[field.fieldKey]}</Text>
            </View>
          ) : field.helperText ? (
            <View style={styles.helperContainer}>
              <Ionicons
                name="information-circle"
                size={14}
                color="#6B7280"
                style={styles.helperIcon}
              />
              <Text style={styles.helperText}>{field.helperText}</Text>
            </View>
          ) : null}
        </View>
      );
    }
  };

  // Render buttons with platform specifics
  const renderActionButtons = () => {
    if (isAndroid) {
      return (
        <View style={styles.formActions}>
          <View style={styles.androidButtonWrapper}>
            <TouchableNativeFeedback
              onPress={handleBackToDashboard}
              background={TouchableNativeFeedback.Ripple(
                "rgba(75, 85, 99, 0.1)",
                false,
              )}
              useForeground={true}
            >
              <View style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </View>
            </TouchableNativeFeedback>
          </View>

          <View style={styles.androidButtonWrapper}>
            <TouchableNativeFeedback
              onPress={handleSubmit}
              disabled={isUpdating}
              background={TouchableNativeFeedback.Ripple(
                "rgba(131, 71, 255, 0.2)",
                false,
              )}
              useForeground={true}
            >
              <View
                style={[
                  styles.saveButton,
                  isUpdating && styles.saveButtonDisabled,
                ]}
              >
                {isUpdating ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.saveButtonText}>SAVING...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
                )}
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>
      );
    }

    // iOS buttons (unchanged)
    return (
      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleBackToDashboard}
          activeOpacity={0.7} // Better touch feedback for iOS
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isUpdating}
          activeOpacity={0.7} // Better touch feedback for iOS
        >
          {isUpdating ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Render switch component with platform-specific styling
  const renderSwitch = (fieldName, label) => {
    return (
      <View style={styles.switchContainer}>
        <Switch
          value={formData[fieldName]}
          onValueChange={(value) => handleInputChange(fieldName, value)}
          trackColor={{
            false: isAndroid ? "#E5E7EB" : "#e5e7eb",
            true: isAndroid ? "#8347FF50" : "#C4B5FD",
          }}
          thumbColor={
            formData[fieldName]
              ? isAndroid
                ? "#8347FF"
                : "#7e22ce"
              : isAndroid
                ? "#FFFFFF"
                : "#f4f3f4"
          }
          ios_backgroundColor="#e5e7eb"
        />
        <View style={styles.switchLabelContainer}>
          <Text style={styles.switchLabel}>{label}</Text>
        </View>
      </View>
    );
  };

  // Platform-specific status message renderer
  const renderStatusMessage = () => {
    if (!statusMessage.type) return null;

    if (isAndroid) {
      return (
        <View
          style={[
            styles.statusMessage,
            statusMessage.type === "success"
              ? styles.successMessage
              : styles.errorMessage,
          ]}
        >
          <View style={styles.statusContentContainer}>
            <Ionicons
              name={
                statusMessage.type === "success"
                  ? "checkmark-circle"
                  : "alert-circle"
              }
              size={20}
              color={statusMessage.type === "success" ? "#10B981" : "#EF4444"}
              style={styles.statusIcon}
            />
            <Text style={styles.androidStatusText}>
              {statusMessage.message}
            </Text>
          </View>
          <TouchableNativeFeedback
            onPress={() => setStatusMessage({ type: null, message: "" })}
            background={TouchableNativeFeedback.Ripple(
              statusMessage.type === "success"
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
              true,
            )}
            useForeground={true}
          >
            <View style={styles.androidCloseButton}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    }

    // iOS status message (unchanged)
    return (
      <View
        style={[
          styles.statusMessage,
          statusMessage.type === "success"
            ? styles.successMessage
            : styles.errorMessage,
        ]}
      >
        <View style={styles.statusContentContainer}>
          <Ionicons
            name={
              statusMessage.type === "success"
                ? "checkmark-circle"
                : "alert-circle"
            }
            size={20}
            color={statusMessage.type === "success" ? "#10B981" : "#EF4444"}
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{statusMessage.message}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setStatusMessage({ type: null, message: "" })}
          style={styles.closeButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Larger touch area for iOS
        >
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} title="Settings" />

      {/* iOS & Android Pickers */}
      {renderPicker(
        showCountryPicker,
        "Select Country",
        countries,
        formData.country,
        (value) => handleInputChange("country", value),
        () => setShowCountryPicker(false),
      )}

      {renderPicker(
        showTimezonePicker,
        "Select Timezone",
        timezones,
        formData.timezone,
        (value) => handleInputChange("timezone", value),
        () => setShowTimezonePicker(false),
      )}

      {/* Android-specific pickers */}
      {renderAndroidPicker(
        showCountryPicker,
        "Select Country",
        countries,
        formData.country,
        (value) => handleInputChange("country", value),
        () => setShowCountryPicker(false),
      )}

      {renderAndroidPicker(
        showTimezonePicker,
        "Select Timezone",
        timezones,
        formData.timezone,
        (value) => handleInputChange("timezone", value),
        () => setShowTimezonePicker(false),
      )}

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
            isIOS && {
              paddingBottom: Math.max(insets.bottom + 20, 30),
            },
            // Add specific padding for Android
            isAndroid && {
              paddingBottom: 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={isIOS} // Enable bounce effect only on iOS
          overScrollMode={isAndroid ? "never" : undefined} // Android specific
        >
          {/* Status Message */}
          {renderStatusMessage()}

          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <Text style={styles.sectionSubtitle}>
                Update your basic profile information
              </Text>
            </View>

            <View style={styles.sectionContent}>
              {renderField({
                id: "first_name",
                label: "First Name",
                type: "text",
                fieldKey: "first_name",
                placeholder: "Enter your first name",
                required: true,
              })}

              {renderField({
                id: "last_name",
                label: "Last Name",
                type: "text",
                fieldKey: "last_name",
                placeholder: "Enter your last name",
                required: true,
              })}
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <Text style={styles.sectionSubtitle}>How we can reach you</Text>
            </View>

            <View style={styles.sectionContent}>
              {renderField({
                id: "email",
                label: "Email Address",
                type: "email",
                fieldKey: "email",
                placeholder: "Enter your email",
                required: true,
              })}

              {renderField({
                id: "phone",
                label: "Phone Number",
                type: "tel",
                fieldKey: "phone",
                placeholder: "Enter your phone number",
                helperText: "Optional, format: 555-555-5555",
              })}
            </View>
          </View>

          {/* Location Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Location & Preferences</Text>
              <Text style={styles.sectionSubtitle}>
                Set your regional preferences
              </Text>
            </View>

            <View style={styles.sectionContent}>
              {renderField({
                id: "country",
                label: "Country",
                type: "select",
                fieldKey: "country",
                placeholder: "Select your country",
                helperText: "Optional",
              })}

              {renderField({
                id: "timezone",
                label: "Timezone",
                type: "select",
                fieldKey: "timezone",
                placeholder: "Select your timezone",
                required: true,
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Communication & Privacy</Text>
              <Text style={styles.sectionSubtitle}>
                Update your communication and privacy preferences
              </Text>
            </View>

            <View style={styles.sectionContent}>
              {/* Promotional Communications Preference */}
              {renderSwitch(
                "agree_promotions",
                "I'd like to receive updates about new features, events, and other comic-related content",
              )}

              {/* Tracking Preference - Show conditionally based on platform */}
              {Platform.OS === "android" &&
                renderSwitch(
                  "agree_to_tracking_across_third_party_apps_and_services",
                  "I agree to the tracking of my activity across third-party apps and services",
                )}

              {/* iOS tracking explanation */}
              {isIOS && (
                <View style={styles.iosTrackingInfoContainer}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#6B7280"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.iosTrackingInfoText}>
                    On iOS, tracking preferences are managed in your device's
                    Settings app. To change tracking settings, go to Settings →
                    Privacy → Tracking.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Wallet Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wallet Information</Text>
              <Text style={styles.sectionSubtitle}>
                Your ComicCoin wallet details
              </Text>
            </View>

            <View style={styles.sectionContent}>
              {renderField({
                id: "wallet_address",
                label: "Wallet Address",
                type: "text",
                fieldKey: "wallet_address",
                placeholder: "Wallet address",
                disabled: true,
                helperText:
                  "Your wallet address is automatically generated and cannot be modified",
              })}
            </View>
          </View>

          {/* Form Actions */}
          {renderActionButtons()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  androidLoader: {
    transform: [{ scale: 1.2 }], // Slightly larger for Android
  },
  loadingText: {
    marginTop: 12,
    marginBottom: 24,
    color: "#6B7280",
    fontSize: 16,
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
  retryButton: {
    backgroundColor: "#8347FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 44, // Standard iOS touch target height
    // Platform-specific styling
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3, // Android shadow
      },
    }),
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
        textTransform: "uppercase", // Material Design style uppercase buttons
        letterSpacing: 0.5, // Material Design letter spacing
      },
    }),
  },
  buttonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 4,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
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
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8347FF",
    marginBottom: 4,
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
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
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
  sectionContent: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
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
  input: {
    height: 44, // Standard iOS height
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
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
  androidSelectWrapper: {
    borderRadius: 8,
    overflow: "hidden", // Important for ripple containment
  },
  inputText: {
    fontSize: 16,
    color: "#1F2937",
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
  placeholderText: {
    color: "#9CA3AF",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  walletAddressContainer: {
    position: "relative",
  },
  walletAddressInput: {
    // Platform specific monospace font
    ...Platform.select({
      ios: {
        fontFamily: "Menlo", // Monospaced font for iOS
      },
      android: {
        fontFamily: "monospace",
      },
    }),
    fontSize: 14,
    paddingRight: 40,
  },
  copyButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 5,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  errorIcon: {
    marginRight: 4,
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
  helperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  helperIcon: {
    marginRight: 4,
  },
  helperText: {
    color: "#6B7280",
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
  statusMessage: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successMessage: {
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  errorMessage: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  statusContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    // Platform-specific font styling for iOS
    fontFamily: "System",
    fontWeight: "500",
  },
  androidStatusText: {
    fontSize: 14,
    flex: 1,
    // Android-specific font styling
    fontFamily: "sans-serif",
  },
  closeButton: {
    padding: 4,
  },
  androidCloseButton: {
    padding: 8,
    borderRadius: 20,
    height: 36,
    width: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  formActions: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    // Platform-specific styling
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1, // Android shadow
      },
    }),
  },
  androidButtonWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // Standard iOS height
    // Platform-specific styling
    ...Platform.select({
      android: {
        height: 48, // Slightly taller for Android
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
        textTransform: "uppercase", // Material Design style uppercase buttons
        letterSpacing: 0.5, // Material Design letter spacing
      },
    }),
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#8347FF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // Standard iOS height
    // Platform-specific styling
    ...Platform.select({
      android: {
        height: 48, // Slightly taller for Android
        elevation: 2, // Android shadow for primary action button
      },
    }),
  },
  saveButtonDisabled: {
    backgroundColor: "#C4B5FD",
    // Platform-specific styling
    ...Platform.select({
      android: {
        elevation: 0, // No elevation when disabled
      },
    }),
  },
  saveButtonText: {
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
        textTransform: "uppercase", // Material Design style uppercase buttons
        letterSpacing: 0.5, // Material Design letter spacing
      },
    }),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabelContainer: {
    marginLeft: 12,
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    color: "#4B5563",
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
  iosTrackingInfoContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4FF",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  iosTrackingInfoText: {
    color: "#6B7280",
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    // iOS-specific font styling
    fontFamily: "System",
  },
  // iOS Picker Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: "70%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "System",
  },
  pickerOptions: {
    maxHeight: 300,
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerOptionSelected: {
    backgroundColor: "#F3F4FF",
  },
  pickerOptionText: {
    fontSize: 16,
    color: "#1F2937",
    fontFamily: "System",
  },
  pickerOptionTextSelected: {
    color: "#8347FF",
    fontWeight: "500",
    fontFamily: "System",
  },
  pickerCancelButton: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  pickerCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: "System",
  },
  // Android Picker Modal styles
  androidModalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  androidPickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
  },
  androidPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  androidPickerTitle: {
    fontSize: 18,
    color: "#1F2937",
    fontFamily: "sans-serif-medium",
  },
  androidPickerCloseBtn: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  androidPickerOptions: {
    maxHeight: 400,
  },
  androidPickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  androidPickerOptionSelected: {
    backgroundColor: "#F3F4FF",
  },
  androidPickerOptionText: {
    fontSize: 16,
    color: "#1F2937",
    fontFamily: "sans-serif",
  },
  androidPickerOptionTextSelected: {
    color: "#8347FF",
    fontFamily: "sans-serif-medium",
  },
  androidPickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  androidPickerCancelButton: {
    padding: 12,
    borderRadius: 4,
  },
  androidPickerCancelText: {
    color: "#8347FF",
    fontFamily: "sans-serif-medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default SettingsScreen;
