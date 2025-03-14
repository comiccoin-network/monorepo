// screens/RegisterScreen.js
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  StatusBar,
  Alert,
  Dimensions,
  Keyboard,
  BackHandler,
  ToastAndroid,
  TouchableNativeFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { getTrackingPermissionsAsync } from "expo-tracking-transparency";
import { useRegistration } from "../hooks/useRegistration";
import registrationApi from "../api/endpoints/registrationApi";
import Header from "../components/Header";
import VerificationCodeModal from "../components/VerificationCodeModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 700;
const isLargeDevice = height > 800;
const isAndroid = Platform.OS === "android";
const isIOS = Platform.OS === "ios";

const RegisterScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    register,
    isLoading,
    error: apiError,
    success: apiSuccess,
    resetState,
  } = useRegistration();

  // Scroll and field references
  const scrollViewRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const phoneRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
    phone: "",
    country: "",
    country_other: "",
    timezone: "",
    agree_terms_of_service: false,
    agree_promotions: false,
    agree_to_tracking_across_third_party_apps_and_services: false,
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [errorSummary, setErrorSummary] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Handle Android back button
  useEffect(() => {
    if (isAndroid) {
      const backAction = () => {
        if (countryModalVisible) {
          setCountryModalVisible(false);
          return true;
        }
        if (timezoneModalVisible) {
          setTimezoneModalVisible(false);
          return true;
        }
        if (showVerificationModal) {
          return true; // Block back button during verification
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }
  }, [countryModalVisible, timezoneModalVisible, showVerificationModal]);

  // Keyboard listeners for iOS
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

  // Check tracking permission status for iOS
  useEffect(() => {
    if (isIOS) {
      const checkTrackingPermission = async () => {
        try {
          const { status } = await getTrackingPermissionsAsync();
          // Set tracking permission value based on iOS system status
          if (status === "granted") {
            handleInputChange(
              "agree_to_tracking_across_third_party_apps_and_services",
              true,
            );
          } else if (status === "denied") {
            handleInputChange(
              "agree_to_tracking_across_third_party_apps_and_services",
              false,
            );
          }
        } catch (error) {
          console.error("Error checking tracking permission:", error);
        }
      };

      checkTrackingPermission();
    }
  }, [isIOS]);

  // Handle API errors when they change
  useEffect(() => {
    if (apiError) {
      mapApiErrorsToFormFields();

      // Scroll to top to show errors (with smooth animation)
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }

      // Android-specific feedback for errors
      if (isAndroid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setIsSubmitted(false);
    }
  }, [apiError]);

  // Handle successful registration
  useEffect(() => {
    if (apiSuccess) {
      setShowVerificationModal(true);

      // Android-specific feedback for success
      if (isAndroid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [apiSuccess, router]);

  // Map API errors to form fields
  const mapApiErrorsToFormFields = () => {
    if (!apiError) return;

    const newErrors = {};
    const summary = [];

    if (apiError.errors) {
      Object.entries(apiError.errors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          newErrors[key] = messages[0];
          summary.push(messages[0]);
        }
      });
    } else if (apiError.message && typeof apiError.message === "object") {
      Object.entries(apiError.message).forEach(([key, message]) => {
        if (message && typeof message === "string") {
          newErrors[key] = message;
          summary.push(message);
        }
      });
    } else if (apiError.message && typeof apiError.message === "string") {
      summary.push(apiError.message);
    }

    setErrors(newErrors);
    setErrorSummary(summary);
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle switch changes
  const handleSwitchChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Select country
  const selectCountry = (country) => {
    handleInputChange("country", country.value);
    setCountryModalVisible(false);

    // Android haptic feedback
    if (isAndroid) {
      Haptics.selectionAsync();
    }
  };

  // Select timezone
  const selectTimezone = (timezone) => {
    handleInputChange("timezone", timezone.value);
    setTimezoneModalVisible(false);

    // Android haptic feedback
    if (isAndroid) {
      Haptics.selectionAsync();
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async (code) => {
    try {
      setIsVerifying(true);
      setVerificationError(null);

      await registrationApi.verifyEmail(code);

      if (isAndroid) {
        // Android toast notification
        ToastAndroid.showWithGravity(
          "Account verification successful!",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
        );
      } else {
        // iOS Alert
        Alert.alert(
          "Verification Successful",
          "Your account has been verified. You can now login.",
          [
            {
              text: "Go to Login",
              onPress: () => router.replace("/login"),
            },
          ],
        );
      }

      setShowVerificationModal(false);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationError(
        error.message || "Failed to verify code. Please try again.",
      );

      if (isAndroid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Form validation and submission
  const handleSubmit = async () => {
    if (isLoading || isSubmitted) {
      return;
    }

    resetState();
    setErrors({});
    setErrorSummary([]);

    // Perform comprehensive validation
    const validationErrors = {};

    if (!formData.first_name.trim()) {
      validationErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      validationErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      validationErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.password_confirm) {
      validationErrors.password_confirm = "Please confirm your password";
    } else if (formData.password_confirm !== formData.password) {
      validationErrors.password_confirm = "Passwords do not match";
    }

    if (!formData.country) {
      validationErrors.country = "Please select your country";
    }

    if (formData.country === "other" && !formData.country_other.trim()) {
      validationErrors.country_other = "Please specify your country";
    }

    if (!formData.timezone) {
      validationErrors.timezone = "Please select your timezone";
    }

    if (!formData.agree_terms_of_service) {
      validationErrors.agree_terms_of_service =
        "You must agree to the terms of service";
    }

    // Display validation errors if any
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorSummary(Object.values(validationErrors));

      // Scroll to top to show errors
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }

      // Android feedback and toast for validation errors
      if (isAndroid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        ToastAndroid.showWithGravity(
          "Please correct the form errors",
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      } else {
        // For iOS, use Alert for validation errors
        Alert.alert(
          "Validation Error",
          "Please correct the highlighted fields before saving.",
          [{ text: "OK", style: "default" }],
        );
      }

      return;
    }

    // Haptic feedback on form submission
    if (isAndroid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsSubmitted(true);

    try {
      await register(formData);
      // Success will be handled by useEffect watching apiSuccess
    } catch (error) {
      // Errors handled by the useEffect watching apiError
      console.log("Registration error:", error);
    }
  };

  // Country and timezone data
  const countries = [
    { value: "", label: "Select Country..." },
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "au", label: "Australia" },
    { value: "fr", label: "France" },
    { value: "de", label: "Germany" },
    { value: "jp", label: "Japan" },
    { value: "other", label: "Other (please specify)" },
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

  // Render a form input field with label and error handling
  const renderFormField = (
    label,
    name,
    placeholder,
    value,
    isRequired = false,
    keyboardType = "default",
    secureTextEntry = false,
    icon = null,
    rightIcon = null,
    onRightIconPress = null,
    inputRef = null,
    onSubmitEditing = null,
    returnKeyType = "next",
  ) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label} {isRequired && <Text style={styles.requiredStar}>*</Text>}
        </Text>
        <View style={styles.inputWrapper}>
          {icon && <View style={styles.inputIconLeft}>{icon}</View>}
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              icon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
              errors[name] ? styles.inputError : null,
            ]}
            placeholder={placeholder}
            value={value}
            onChangeText={(text) => handleInputChange(name, text)}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
            placeholderTextColor="#9CA3AF"
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={returnKeyType !== "next"}
          />
          {rightIcon && (
            <TouchableOpacity
              style={styles.inputIconRight}
              onPress={onRightIconPress}
              activeOpacity={isIOS ? 0.7 : 1}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
        {errors[name] && (
          <View style={styles.errorContainer}>
            <Feather
              name="alert-circle"
              size={14}
              color="#ef4444"
              style={styles.errorIcon}
            />
            <Text style={styles.errorText}>{errors[name]}</Text>
          </View>
        )}
      </View>
    );
  };

  // Android-specific modal wrapper
  const AndroidModalWrapper = ({ children, visible, onRequestClose }) => {
    if (!isAndroid) return children;

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onRequestClose}
      >
        {children}
      </Modal>
    );
  };

  // Render Android touchable with correct props
  const renderTouchable = (props) => {
    if (!isAndroid) {
      return (
        <TouchableOpacity activeOpacity={0.7} {...props}>
          {props.children}
        </TouchableOpacity>
      );
    }

    if (
      props.style &&
      (props.style.backgroundColor === "#8347FF" ||
        props.style.backgroundColor === "#7e22ce")
    ) {
      return (
        <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple("#a78bfa", false)}
          useForeground={true}
          {...props}
        >
          <View style={[props.style, { overflow: "hidden" }]}>
            {props.children}
          </View>
        </TouchableNativeFeedback>
      );
    }

    return (
      <TouchableNativeFeedback
        background={TouchableNativeFeedback.Ripple("#d1d5db", false)}
        useForeground={true}
        {...props}
      >
        <View style={[props.style, { overflow: "hidden" }]}>
          {props.children}
        </View>
      </TouchableNativeFeedback>
    );
  };

  return (
    <View style={styles.container}>
      {isAndroid && (
        <StatusBar
          translucent={true}
          backgroundColor="transparent"
          barStyle="light-content"
        />
      )}

      <Header showBackButton={true} />

      <KeyboardAvoidingView
        behavior={isIOS ? "padding" : "height"}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={isIOS ? 20 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={isAndroid}
          bounces={isIOS}
          overScrollMode={isAndroid ? "always" : "never"}
          contentInsetAdjustmentBehavior={isIOS ? "never" : undefined}
        >
          {/* Hero Banner */}
          <LinearGradient
            colors={["#4f46e5", "#4338ca"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.heroBanner,
              isAndroid && { paddingTop: 20 + insets.top },
            ]}
          >
            <View style={styles.heroContent}>
              <Text
                style={[
                  styles.heroTitle,
                  isSmallDevice && styles.heroTitleSmall,
                ]}
              >
                Create Your Account
              </Text>
              <Text
                style={[
                  styles.heroSubtitle,
                  isSmallDevice && styles.heroSubtitleSmall,
                ]}
              >
                Join our community of comic collectors and creators today and
                get free ComicCoins!
              </Text>
            </View>
          </LinearGradient>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Form Header */}
            <LinearGradient
              colors={["#7e22ce", "#4338ca"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.formHeader}
            >
              <View style={styles.formHeaderContent}>
                <Feather
                  name="shield"
                  size={24}
                  color="white"
                  style={styles.formHeaderIcon}
                />
                <View>
                  <Text style={styles.formHeaderTitle}>
                    Register for ComicCoin Public Faucet
                  </Text>
                  <Text style={styles.formHeaderSubtitle}>
                    Get started with daily free coins
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Error Summary */}
            {errorSummary.length > 0 && (
              <View style={styles.errorSummary}>
                <View style={styles.errorSummaryHeader}>
                  <Feather name="alert-triangle" size={20} color="#ef4444" />
                  <Text style={styles.errorSummaryTitle}>
                    Please correct the following errors:
                  </Text>
                </View>
                {errorSummary.map((error, index) => (
                  <Text key={index} style={styles.errorSummaryItem}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            {/* Personal Information Section */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Feather name="user" size={20} color="#7e22ce" />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>

              {/* First Name */}
              {renderFormField(
                "First Name",
                "first_name",
                "Enter your first name",
                formData.first_name,
                true,
                "default",
                false,
                null,
                null,
                null,
                null,
                () => emailRef.current?.focus(),
              )}

              {/* Last Name */}
              {renderFormField(
                "Last Name",
                "last_name",
                "Enter your last name",
                formData.last_name,
                true,
                "default",
                false,
                null,
                null,
                null,
                null,
                () => emailRef.current?.focus(),
              )}

              {/* Email */}
              {renderFormField(
                "Email Address",
                "email",
                "you@example.com",
                formData.email,
                true,
                "email-address",
                false,
                <Feather name="mail" size={20} color="#9ca3af" />,
                null,
                null,
                emailRef,
                () => passwordRef.current?.focus(),
              )}

              {/* Phone (Optional) */}
              {renderFormField(
                "Phone Number",
                "phone",
                "+1 (555) 123-4567",
                formData.phone,
                false,
                "phone-pad",
                false,
                <Feather name="phone" size={20} color="#9ca3af" />,
                null,
                null,
                phoneRef,
              )}
            </View>

            {/* Account Security */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Feather name="lock" size={20} color="#7e22ce" />
                <Text style={styles.sectionTitle}>Account Security</Text>
              </View>

              {/* Password */}
              {renderFormField(
                "Password",
                "password",
                "Create a password (min 8 characters)",
                formData.password,
                true,
                "default",
                !showPassword,
                null,
                showPassword ? (
                  <Feather name="eye-off" size={20} color="#6b7280" />
                ) : (
                  <Feather name="eye" size={20} color="#6b7280" />
                ),
                () => setShowPassword(!showPassword),
                passwordRef,
                () => confirmPasswordRef.current?.focus(),
              )}

              {/* Confirm Password */}
              {renderFormField(
                "Confirm Password",
                "password_confirm",
                "Confirm your password",
                formData.password_confirm,
                true,
                "default",
                !showConfirmPassword,
                null,
                showConfirmPassword ? (
                  <Feather name="eye-off" size={20} color="#6b7280" />
                ) : (
                  <Feather name="eye" size={20} color="#6b7280" />
                ),
                () => setShowConfirmPassword(!showConfirmPassword),
                confirmPasswordRef,
                null,
                "done",
              )}
            </View>

            {/* Location Information */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Feather name="globe" size={20} color="#7e22ce" />
                <Text style={styles.sectionTitle}>Location Information</Text>
              </View>

              {/* Country Custom Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Country <Text style={styles.requiredStar}>*</Text>
                </Text>
                {isAndroid ? (
                  <TouchableNativeFeedback
                    onPress={() => setCountryModalVisible(true)}
                    background={TouchableNativeFeedback.Ripple(
                      "#e5e7eb",
                      false,
                    )}
                  >
                    <View
                      style={[
                        styles.dropdownButton,
                        errors.country ? styles.inputError : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownButtonText,
                          !formData.country && styles.dropdownPlaceholder,
                        ]}
                      >
                        {formData.country
                          ? countries.find((c) => c.value === formData.country)
                              ?.label || formData.country
                          : "Select Country..."}
                      </Text>
                      <Feather name="chevron-down" size={20} color="#9ca3af" />
                    </View>
                  </TouchableNativeFeedback>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.dropdownButton,
                      errors.country ? styles.inputError : null,
                    ]}
                    onPress={() => setCountryModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownButtonText,
                        !formData.country && styles.dropdownPlaceholder,
                      ]}
                    >
                      {formData.country
                        ? countries.find((c) => c.value === formData.country)
                            ?.label || formData.country
                        : "Select Country..."}
                    </Text>
                    <Feather name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
                {errors.country && (
                  <View style={styles.errorContainer}>
                    <Feather
                      name="alert-circle"
                      size={14}
                      color="#ef4444"
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{errors.country}</Text>
                  </View>
                )}
              </View>

              {/* Other Country - only shows if "other" is selected */}
              {formData.country === "other" &&
                renderFormField(
                  "Specify Country",
                  "country_other",
                  "Enter your country",
                  formData.country_other,
                  true,
                )}

              {/* Timezone Custom Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Timezone <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <Feather name="clock" size={20} color="#9ca3af" />
                  </View>
                  {isAndroid ? (
                    <TouchableNativeFeedback
                      onPress={() => setTimezoneModalVisible(true)}
                      background={TouchableNativeFeedback.Ripple(
                        "#e5e7eb",
                        false,
                      )}
                    >
                      <View
                        style={[
                          styles.dropdownButton,
                          styles.dropdownButtonWithIcon,
                          errors.timezone ? styles.inputError : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownButtonText,
                            !formData.timezone && styles.dropdownPlaceholder,
                          ]}
                        >
                          {formData.timezone
                            ? timezones.find(
                                (t) => t.value === formData.timezone,
                              )?.label || formData.timezone
                            : "Select Timezone..."}
                        </Text>
                        <Feather
                          name="chevron-down"
                          size={20}
                          color="#9ca3af"
                        />
                      </View>
                    </TouchableNativeFeedback>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.dropdownButton,
                        styles.dropdownButtonWithIcon,
                        errors.timezone ? styles.inputError : null,
                      ]}
                      onPress={() => setTimezoneModalVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dropdownButtonText,
                          !formData.timezone && styles.dropdownPlaceholder,
                        ]}
                      >
                        {formData.timezone
                          ? timezones.find((t) => t.value === formData.timezone)
                              ?.label || formData.timezone
                          : "Select Timezone..."}
                      </Text>
                      <Feather name="chevron-down" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
                {errors.timezone && (
                  <View style={styles.errorContainer}>
                    <Feather
                      name="alert-circle"
                      size={14}
                      color="#ef4444"
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{errors.timezone}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Terms & Privacy */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Feather name="shield" size={20} color="#7e22ce" />
                <Text style={styles.sectionTitle}>Terms & Privacy</Text>
              </View>

              {/* Terms Agreement */}
              <View style={styles.switchContainer}>
                <Switch
                  value={formData.agree_terms_of_service}
                  onValueChange={(value) =>
                    handleSwitchChange("agree_terms_of_service", value)
                  }
                  trackColor={{ false: "#e5e7eb", true: "#c4b5fd" }}
                  thumbColor={
                    formData.agree_terms_of_service ? "#7e22ce" : "#f4f3f4"
                  }
                  ios_backgroundColor="#e5e7eb"
                />
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.switchLabel}>
                    I agree to the{" "}
                    <Text
                      style={styles.linkText}
                      onPress={() => router.push("/terms")}
                    >
                      Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text
                      style={styles.linkText}
                      onPress={() => router.push("/privacy")}
                    >
                      Privacy Policy
                    </Text>{" "}
                    <Text style={styles.requiredStar}>*</Text>
                  </Text>
                </View>
              </View>
              {errors.agree_terms_of_service && (
                <View style={styles.switchErrorContainer}>
                  <Feather
                    name="alert-circle"
                    size={14}
                    color="#ef4444"
                    style={styles.errorIcon}
                  />
                  <Text style={styles.errorText}>
                    {errors.agree_terms_of_service}
                  </Text>
                </View>
              )}

              {/* Promotional emails */}
              <View style={styles.switchContainer}>
                <Switch
                  value={formData.agree_promotions}
                  onValueChange={(value) =>
                    handleSwitchChange("agree_promotions", value)
                  }
                  trackColor={{ false: "#e5e7eb", true: "#c4b5fd" }}
                  thumbColor={formData.agree_promotions ? "#7e22ce" : "#f4f3f4"}
                  ios_backgroundColor="#e5e7eb"
                />
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.switchLabel}>
                    I'd like to receive updates about new features, events, and
                    other comic-related content
                  </Text>
                </View>
              </View>

              {/* Third Party Tracking - Only show on Android */}
              {!isIOS && (
                <View style={styles.switchContainer}>
                  <Switch
                    value={
                      formData.agree_to_tracking_across_third_party_apps_and_services
                    }
                    onValueChange={(value) =>
                      handleSwitchChange(
                        "agree_to_tracking_across_third_party_apps_and_services",
                        value,
                      )
                    }
                    trackColor={{ false: "#e5e7eb", true: "#c4b5fd" }}
                    thumbColor={
                      formData.agree_to_tracking_across_third_party_apps_and_services
                        ? "#7e22ce"
                        : "#f4f3f4"
                    }
                    ios_backgroundColor="#e5e7eb"
                  />
                  <View style={styles.switchLabelContainer}>
                    <Text style={styles.switchLabel}>
                      I agree to the tracking of my activity across third-party
                      apps and services
                    </Text>
                  </View>
                </View>
              )}

              {/* iOS tracking explanation */}
              {isIOS && (
                <View style={styles.iosTrackingInfoContainer}>
                  <Feather
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

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              {isAndroid ? (
                <>
                  <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple(
                      "#e5e7eb",
                      false,
                    )}
                    onPress={() => router.back()}
                    disabled={isLoading}
                  >
                    <View style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </View>
                  </TouchableNativeFeedback>

                  <TouchableNativeFeedback
                    background={TouchableNativeFeedback.Ripple(
                      "#a78bfa",
                      false,
                    )}
                    onPress={handleSubmit}
                    disabled={isLoading || isSubmitted}
                  >
                    <View
                      style={[
                        styles.submitButton,
                        (isLoading || isSubmitted) && styles.disabledButton,
                      ]}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="white" />
                          <Text style={styles.submitButtonText}>
                            Creating Account...
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.submitButtonText}>
                            Create Account
                          </Text>
                          <Feather name="arrow-right" size={20} color="white" />
                        </View>
                      )}
                    </View>
                  </TouchableNativeFeedback>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (isLoading || isSubmitted) && styles.disabledButton,
                    ]}
                    onPress={handleSubmit}
                    disabled={isLoading || isSubmitted}
                    activeOpacity={0.7}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.submitButtonText}>
                          Creating Account...
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.submitButtonText}>
                          Create Account
                        </Text>
                        <Feather name="arrow-right" size={20} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Already have account */}
            <View style={styles.alreadyAccountContainer}>
              <Text style={styles.alreadyAccountText}>
                Already have an account?{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => router.push("/login")}
                >
                  Sign in
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Modal */}
      <Modal
        visible={countryModalVisible}
        transparent={true}
        animationType={isAndroid ? "fade" : "slide"}
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            isAndroid && { backgroundColor: "rgba(0, 0, 0, 0.6)" },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom },
              isAndroid && {
                width: "90%",
                maxHeight: "80%",
                borderRadius: 8,
                elevation: 24,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setCountryModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={countries.filter((c) => c.value !== "")}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) =>
                isAndroid ? (
                  <TouchableNativeFeedback
                    onPress={() => selectCountry(item)}
                    background={TouchableNativeFeedback.Ripple(
                      "#f3f4ff",
                      false,
                    )}
                  >
                    <View
                      style={[
                        styles.modalItem,
                        formData.country === item.value &&
                          styles.modalItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          formData.country === item.value &&
                            styles.modalItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {formData.country === item.value && (
                        <Feather name="check" size={20} color="#7e22ce" />
                      )}
                    </View>
                  </TouchableNativeFeedback>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      formData.country === item.value &&
                        styles.modalItemSelected,
                    ]}
                    onPress={() => selectCountry(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        formData.country === item.value &&
                          styles.modalItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {formData.country === item.value && (
                      <Feather name="check" size={20} color="#7e22ce" />
                    )}
                  </TouchableOpacity>
                )
              }
              style={styles.modalList}
              showsVerticalScrollIndicator={isAndroid}
            />
          </View>
        </View>
      </Modal>

      {/* Timezone Modal */}
      <Modal
        visible={timezoneModalVisible}
        transparent={true}
        animationType={isAndroid ? "fade" : "slide"}
        onRequestClose={() => setTimezoneModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            isAndroid && { backgroundColor: "rgba(0, 0, 0, 0.6)" },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom },
              isAndroid && {
                width: "90%",
                maxHeight: "80%",
                borderRadius: 8,
                elevation: 24,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Timezone</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setTimezoneModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={timezones.filter((t) => t.value !== "")}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) =>
                isAndroid ? (
                  <TouchableNativeFeedback
                    onPress={() => selectTimezone(item)}
                    background={TouchableNativeFeedback.Ripple(
                      "#f3f4ff",
                      false,
                    )}
                  >
                    <View
                      style={[
                        styles.modalItem,
                        formData.timezone === item.value &&
                          styles.modalItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          formData.timezone === item.value &&
                            styles.modalItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {formData.timezone === item.value && (
                        <Feather name="check" size={20} color="#7e22ce" />
                      )}
                    </View>
                  </TouchableNativeFeedback>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      formData.timezone === item.value &&
                        styles.modalItemSelected,
                    ]}
                    onPress={() => selectTimezone(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        formData.timezone === item.value &&
                          styles.modalItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {formData.timezone === item.value && (
                      <Feather name="check" size={20} color="#7e22ce" />
                    )}
                  </TouchableOpacity>
                )
              }
              style={styles.modalList}
              showsVerticalScrollIndicator={isAndroid}
            />
          </View>
        </View>
      </Modal>

      {/* Verification Modal */}
      <VerificationCodeModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={handleVerifyCode}
        email={formData.email}
        isVerifying={isVerifying}
        verificationError={verificationError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  heroBanner: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  heroTitleSmall: {
    fontSize: 24,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    paddingHorizontal: 20,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  heroSubtitleSmall: {
    fontSize: 14,
  },
  formContainer: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 16, // More iOS-friendly corner radius
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderRadius: 8,
        elevation: 4,
      },
    }),
    marginBottom: 24,
    overflow: "hidden",
  },
  formHeader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: Platform.OS === "ios" ? 16 : 8,
    borderTopRightRadius: Platform.OS === "ios" ? 16 : 8,
  },
  formHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  formHeaderIcon: {
    marginRight: 12,
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  formHeaderSubtitle: {
    fontSize: 14,
    color: "#e0e7ff",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  errorSummary: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
  },
  errorSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  errorSummaryTitle: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#b91c1c",
    fontSize: 16,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  errorSummaryItem: {
    color: "#b91c1c",
    marginLeft: 10,
    marginBottom: 4,
    fontSize: 14,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    height: Platform.OS === "ios" ? 44 : 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: Platform.OS === "ios" ? 10 : 4, // Android uses smaller radii
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "white",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  inputWithLeftIcon: {
    paddingLeft: 40,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  inputIconLeft: {
    position: "absolute",
    left: 12,
    top: Platform.OS === "ios" ? 12 : 14,
    zIndex: 1,
  },
  inputIconRight: {
    position: "absolute",
    right: 12,
    top: Platform.OS === "ios" ? 12 : 14,
    zIndex: 1,
    padding: 2, // Increase touch target
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: Platform.OS === "ios" ? 44 : 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: Platform.OS === "ios" ? 10 : 4,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  dropdownButtonWithIcon: {
    paddingLeft: 40,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#1f2937",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Modal slides from bottom for iOS
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: Platform.OS === "ios" ? 20 : 8, // Platform-specific radius
    borderTopRightRadius: Platform.OS === "ios" ? 20 : 8,
    maxHeight: "80%",
    paddingTop: Platform.OS === "ios" ? 8 : 0, // iOS-specific top padding
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
      ios: {
        fontFamily: "System",
      },
    }),
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    maxHeight: Platform.OS === "ios" ? 400 : "auto", // Different height limits
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemSelected: {
    backgroundColor: "#f3f4ff", // Subtle background for selected item
  },
  modalItemText: {
    fontSize: 16,
    color: "#1f2937",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
      ios: {
        fontFamily: "System",
      },
    }),
  },
  modalItemTextSelected: {
    color: "#7e22ce",
    fontWeight: "600",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
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
    color: "#ef4444",
    fontSize: 12,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
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
    color: "#4b5563",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  switchErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 50,
  },
  linkText: {
    color: "#7e22ce",
    fontWeight: "500",
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  requiredStar: {
    color: "#ef4444",
  },
  actionButtonsContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: Platform.OS === "ios" ? 10 : 4,
    paddingVertical: 14,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: {
        borderRadius: 4,
        overflow: "hidden",
      },
    }),
  },
  cancelButtonText: {
    color: "#4b5563",
    fontWeight: "500",
    fontSize: 16,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#7e22ce",
    borderRadius: Platform.OS === "ios" ? 10 : 4,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: {
        borderRadius: 4,
        overflow: "hidden",
      },
    }),
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
    marginRight: 8,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  alreadyAccountContainer: {
    alignItems: "center",
    paddingBottom: 16,
  },
  alreadyAccountText: {
    color: "#6b7280",
    fontSize: 14,
    ...Platform.select({
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
  },
});

export default RegisterScreen;
