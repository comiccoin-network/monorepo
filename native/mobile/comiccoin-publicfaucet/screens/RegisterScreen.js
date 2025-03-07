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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { useRegistration } from "../hooks/useRegistration";
import registrationApi from "../api/endpoints/registrationApi";
import Header from "../components/Header";
import VerificationCodeModal from "../components/VerificationCodeModal";

const RegisterScreen = () => {
  const router = useRouter();
  const {
    register,
    isLoading,
    error: apiError,
    success: apiSuccess,
    resetState,
  } = useRegistration();

  // Scroll reference
  const scrollViewRef = useRef(null);

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
  });

  // Field errors from API
  const [errors, setErrors] = useState({});

  // Error summary for display in the error box
  const [errorSummary, setErrorSummary] = useState([]);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for dropdowns
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);

  // State to track if form has been submitted to prevent duplicate submissions
  const [isSubmitted, setIsSubmitted] = useState(false);

  // New state for verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  // Effect to handle API errors when they change
  useEffect(() => {
    if (apiError) {
      mapApiErrorsToFormFields();

      // Scroll to the top of the form when errors occur
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }

      // Reset submission flag when we get an error
      setIsSubmitted(false);
    }
  }, [apiError]);

  // Effect to handle successful registration
  useEffect(() => {
    if (apiSuccess) {
      // Show the verification modal instead of navigating
      setShowVerificationModal(true);
    }
  }, [apiSuccess, router]);

  // Map API errors to form fields
  const mapApiErrorsToFormFields = () => {
    // Check for errors in API response
    if (!apiError) return;

    const newErrors = {};
    const summary = [];

    // Handle standard API error structure from our hook
    if (apiError.errors) {
      Object.entries(apiError.errors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          newErrors[key] = messages[0];
          summary.push(messages[0]);
        }
      });
    }
    // Handle the 400 error format returned directly from the backend
    else if (apiError.message && typeof apiError.message === "object") {
      // This handles the case where the error is in the format { field: "error message" }
      Object.entries(apiError.message).forEach(([key, message]) => {
        if (message && typeof message === "string") {
          newErrors[key] = message;
          summary.push(message);
        }
      });
    }
    // Handle generic error messages
    else if (apiError.message && typeof apiError.message === "string") {
      summary.push(apiError.message);
    }

    setErrors(newErrors);
    setErrorSummary(summary);
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle switch changes
  const handleSwitchChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field when user checks it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Select country
  const selectCountry = (country) => {
    handleInputChange("country", country.value);
    setCountryModalVisible(false);
  };

  // Select timezone
  const selectTimezone = (timezone) => {
    handleInputChange("timezone", timezone.value);
    setTimezoneModalVisible(false);
  };

  // Handle verification code submission
  const handleVerifyCode = async (code) => {
    try {
      setIsVerifying(true);
      setVerificationError(null);

      // Now we can use the imported API directly
      await registrationApi.verifyEmail(code);

      // Success! Navigate to login screen
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

      setShowVerificationModal(false);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationError(
        error.message || "Failed to verify code. Please try again.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isLoading || isSubmitted) {
      return;
    }

    // Reset submission states
    resetState();
    setErrors({});
    setErrorSummary([]);

    // Perform local validation
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

    // If there are validation errors, display them
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorSummary(Object.values(validationErrors));

      // Scroll to the top to show errors
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }

      return;
    }

    // Mark as submitted to prevent duplicate API calls
    setIsSubmitted(true);

    try {
      // Send registration request to API using our hook
      await register(formData);
      // Success will be handled by the useEffect watching apiSuccess
    } catch (error) {
      // mapApiErrorsToFormFields() will be called by the useEffect when apiError changes
      console.log("Registration error:", error);
    }
  };

  // List of countries for the dropdown
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

  // List of timezones for the dropdown (abbreviated for brevity)
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
  ) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label} {isRequired && <Text style={styles.requiredStar}>*</Text>}
        </Text>
        <View style={styles.inputWrapper}>
          {icon && <View style={styles.inputIconLeft}>{icon}</View>}
          <TextInput
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
            placeholderTextColor="#9ca3af"
          />
          {rightIcon && (
            <TouchableOpacity
              style={styles.inputIconRight}
              onPress={onRightIconPress}
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

  return (
    <View style={styles.container}>
      {/* Use the improved Header with back button */}
      <Header showBackButton={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
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
              <Text style={styles.heroTitle}>Create Your Account</Text>
              <Text style={styles.heroSubtitle}>
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
                    Register for ComicCoin Faucet
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
              )}

              {/* Last Name */}
              {renderFormField(
                "Last Name",
                "last_name",
                "Enter your last name",
                formData.last_name,
                true,
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
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    errors.country ? styles.inputError : null,
                  ]}
                  onPress={() => setCountryModalVisible(true)}
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

              {/* Country Modal */}
              <Modal
                visible={countryModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCountryModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Country</Text>
                      <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setCountryModalVisible(false)}
                      >
                        <Feather name="x" size={24} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                    <FlatList
                      data={countries.filter((c) => c.value !== "")}
                      keyExtractor={(item) => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => selectCountry(item)}
                        >
                          <Text style={styles.modalItemText}>{item.label}</Text>
                          {formData.country === item.value && (
                            <Feather name="check" size={20} color="#7e22ce" />
                          )}
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </Modal>

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
                  <TouchableOpacity
                    style={[
                      styles.dropdownButton,
                      styles.dropdownButtonWithIcon,
                      errors.timezone ? styles.inputError : null,
                    ]}
                    onPress={() => setTimezoneModalVisible(true)}
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

              {/* Timezone Modal */}
              <Modal
                visible={timezoneModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setTimezoneModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Timezone</Text>
                      <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setTimezoneModalVisible(false)}
                      >
                        <Feather name="x" size={24} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                    <FlatList
                      data={timezones.filter((t) => t.value !== "")}
                      keyExtractor={(item) => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => selectTimezone(item)}
                        >
                          <Text style={styles.modalItemText}>{item.label}</Text>
                          {formData.timezone === item.value && (
                            <Feather name="check" size={20} color="#7e22ce" />
                          )}
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </Modal>
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
              )}
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
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading || isSubmitted}
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
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <Feather name="arrow-right" size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>
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
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
    overflow: "hidden",
  },
  formHeader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
  },
  formHeaderSubtitle: {
    fontSize: 14,
    color: "#e0e7ff",
  },
  errorSummary: {
    margin: 16,
    padding: 12,
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
  },
  errorSummaryItem: {
    color: "#b91c1c",
    marginLeft: 10,
    marginBottom: 4,
    fontSize: 14,
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
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "white",
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
    top: 12,
    zIndex: 1,
  },
  inputIconRight: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 1,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "white",
  },
  dropdownButtonWithIcon: {
    paddingLeft: 40,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#1f2937",
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
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
  },
  modalCloseButton: {
    padding: 4,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemText: {
    fontSize: 16,
    color: "#1f2937",
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
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#4b5563",
    fontWeight: "500",
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#7e22ce",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
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
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alreadyAccountContainer: {
    alignItems: "center",
    paddingBottom: 16,
  },
  alreadyAccountText: {
    color: "#6b7280",
    fontSize: 14,
  },
});

export default RegisterScreen;
