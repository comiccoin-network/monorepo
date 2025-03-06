// screens/LoginScreen.js
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import LightFooter from "../components/LightFooter";

const LoginScreen = () => {
  console.log("🚀 LoginScreen component initializing");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  console.log("🔐 Authentication state:", { isAuthenticated });

  const router = useRouter();
  console.log("🧭 Router available:", !!router);

  // Handle navigation if authenticated
  useEffect(() => {
    console.log(
      "🔄 LoginScreen useEffect running, isAuthenticated:",
      isAuthenticated,
    );
    // Redirect if already authenticated
    if (isAuthenticated) {
      console.log("👉 User is authenticated, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    console.log("📝 Login form submitted");
    setGeneralError("");
    setErrors({});
    setLoading(true);

    try {
      console.log("🔑 Attempting login with email:", formData.email);
      const loginRequest = {
        email: formData.email,
        password: formData.password,
      };

      await login(loginRequest);
      console.log("✅ Login successful");
      // The redirect will happen in the useEffect when isAuthenticated changes
    } catch (err) {
      console.error("❌ Login error:", err);

      // Handle field-specific errors from the backend
      if (err.response?.data && typeof err.response.data === "object") {
        const fieldErrors = err.response.data;

        // Check if the error is in the format we expect
        if (fieldErrors.email || fieldErrors.password) {
          console.log("🔍 Field-specific errors detected:", fieldErrors);
          setErrors(fieldErrors);
        }
        // If we have a message field, use that as a general error
        else if (fieldErrors.message) {
          setGeneralError(fieldErrors.message);
        }
        // If the response is some other format, show it as JSON
        else {
          setGeneralError(`Login failed: ${JSON.stringify(fieldErrors)}`);
        }
      }
      // Handle network errors or other non-response errors
      else if (err.message) {
        setGeneralError(err.message);
      }
      // Fallback for unknown error formats
      else {
        setGeneralError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    router.back();
  };

  console.log("🎨 Rendering login form, errors:", {
    field: !!Object.keys(errors).length,
    general: !!generalError,
  });

  return (
    <View style={styles.container}>
      <Header showBackButton={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
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
              <Text style={styles.heroTitle}>Welcome Back</Text>
              <Text style={styles.heroSubtitle}>
                Sign in to access your account and claim your daily ComicCoins
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
                    Sign in to ComicCoin Faucet
                  </Text>
                  <Text style={styles.formHeaderSubtitle}>
                    Access your account and daily rewards
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Form Body */}
            <View style={styles.formBody}>
              {/* Display general error message if any */}
              {generalError ? (
                <View style={styles.errorBanner}>
                  <View style={styles.errorBannerContent}>
                    <Feather name="alert-circle" size={20} color="#ef4444" />
                    <Text style={styles.errorBannerText}>{generalError}</Text>
                  </View>
                </View>
              ) : null}

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <Feather name="mail" size={20} color="#9ca3af" />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputWithLeftIcon,
                      errors.email ? styles.inputError : null,
                    ]}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                {errors.email && (
                  <View style={styles.errorContainer}>
                    <Feather
                      name="alert-circle"
                      size={14}
                      color="#ef4444"
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </View>
                )}
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Password <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconLeft}>
                    <Feather name="lock" size={20} color="#9ca3af" />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputWithLeftIcon,
                      errors.password ? styles.inputError : null,
                    ]}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                    secureTextEntry={true}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                {errors.password && (
                  <View style={styles.errorContainer}>
                    <Feather
                      name="alert-circle"
                      size={14}
                      color="#ef4444"
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{errors.password}</Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.submitButtonText}>Signing in...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={styles.submitButtonText}>Sign In</Text>
                      <Feather name="log-in" size={20} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Registration Call to Action */}
          <View style={styles.registrationCta}>
            <View style={styles.registrationCtaContent}>
              <View>
                <Text style={styles.registrationCtaTitle}>
                  Don't have an account?
                </Text>
                <Text style={styles.registrationCtaText}>
                  Join our community and start collecting ComicCoins today
                </Text>
              </View>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => router.push("/register")}
              >
                <Feather name="user-plus" size={20} color="#7e22ce" />
                <Text style={styles.registerButtonText}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LightFooter />
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
  formBody: {
    padding: 16,
  },
  errorBanner: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
  },
  errorBannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorBannerText: {
    marginLeft: 8,
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
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
  inputIconLeft: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
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
  actionButtonsContainer: {
    marginTop: 24,
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
  registrationCta: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f3e8ff",
  },
  registrationCtaContent: {
    padding: 16,
    flexDirection: "column",
  },
  registrationCtaTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 4,
  },
  registrationCtaText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3e8ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#7e22ce",
    marginLeft: 8,
  },
  requiredStar: {
    color: "#ef4444",
  },
});

export default LoginScreen;
