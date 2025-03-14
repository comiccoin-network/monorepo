// screens/LoginScreen.js
import React, { useState, useEffect, useRef } from "react";
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
  SafeAreaView,
  Keyboard,
  TouchableNativeFeedback,
  StatusBar,
  ToastAndroid,
  BackHandler,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const LoginScreen = () => {
  console.log("🚀 LoginScreen component initializing");

  // Get safe area insets for proper layout with notches and home indicator
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const { login, isAuthenticated } = useAuth();
  console.log("🔐 Authentication state:", { isAuthenticated });

  const router = useRouter();
  console.log("🧭 Router available:", !!router);

  // Ref for scrollView to allow scrolling to top on errors
  const scrollViewRef = useRef(null);

  // Handle Android back button
  useEffect(() => {
    if (isAndroid) {
      const backAction = () => {
        router.back();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }
  }, [router]);

  // Add keyboard listeners
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
  }, [isIOS]);

  // Handle navigation if authenticated
  useEffect(() => {
    console.log(
      "🔄 LoginScreen useEffect running, isAuthenticated:",
      isAuthenticated,
    );
    // Redirect if already authenticated
    if (isAuthenticated) {
      console.log("👉 User is authenticated, redirecting to dashboard");
      router.replace("/(tabs)/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general error when typing in any field
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSubmit = async () => {
    // Dismiss keyboard when submitting form
    Keyboard.dismiss();

    console.log("📝 Login form submitted");
    setGeneralError("");
    setErrors({});
    setLoading(true);

    // Android haptic feedback
    if (isAndroid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      console.log("🔑 Attempting login with email:", formData.email);
      const loginRequest = {
        email: formData.email,
        password: formData.password,
      };

      await login(loginRequest);
      console.log("✅ Login successful");

      // Android success feedback
      if (isAndroid) {
        ToastAndroid.showWithGravity(
          "Login successful",
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      }

      // The redirect will happen in the useEffect when isAuthenticated changes
    } catch (err) {
      console.log("❌ Login error:", err);

      // Android error feedback
      if (isAndroid) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Handle field-specific errors from the backend
      if (err.response?.data && typeof err.response.data === "object") {
        const fieldErrors = err.response.data;

        // Check if the error is in the format we expect
        if (fieldErrors.email || fieldErrors.password) {
          console.log("🔍 Field-specific errors detected:", fieldErrors);
          setErrors(fieldErrors);

          // Scroll to top to show errors
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
          }
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

  // Wrapper component for Android TouchableNativeFeedback
  const Touchable = ({
    children,
    style,
    activeOpacity = 0.7,
    onPress,
    disabled = false,
    rippleColor = "#e5e7eb",
    ...props
  }) => {
    if (isIOS) {
      return (
        <TouchableOpacity
          style={style}
          activeOpacity={activeOpacity}
          onPress={onPress}
          disabled={disabled}
          {...props}
        >
          {children}
        </TouchableOpacity>
      );
    }

    // For Android, determine if it should be a colored button
    const isPurpleButton =
      style &&
      (Array.isArray(style)
        ? style.some((s) => s && s.backgroundColor === "#7e22ce")
        : style.backgroundColor === "#7e22ce");

    const ripple = isPurpleButton
      ? TouchableNativeFeedback.Ripple("#a78bfa", false)
      : TouchableNativeFeedback.Ripple(rippleColor, false);

    return (
      <TouchableNativeFeedback
        background={ripple}
        useForeground={true}
        onPress={onPress}
        disabled={disabled}
        {...props}
      >
        <View style={[style, { overflow: "hidden" }]}>{children}</View>
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
            // Add bottom padding for safe area when keyboard is not visible
            !keyboardVisible && {
              paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={isAndroid}
          bounces={isIOS}
          overScrollMode={isAndroid ? "always" : "never"}
        >
          {/* Hero Banner */}
          <LinearGradient
            colors={["#4f46e5", "#4338ca"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.heroBanner,
              isAndroid && {
                paddingTop: insets.top > 0 ? insets.top + 20 : 40,
              },
            ]}
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
                    Sign in to ComicCoin Public Faucet
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
                    returnKeyType="next"
                    autoCorrect={false}
                    textContentType="emailAddress" // iOS autofill hint
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
                      styles.inputWithRightIcon,
                      errors.password ? styles.inputError : null,
                    ]}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9ca3af"
                    returnKeyType="done"
                    autoCorrect={false}
                    textContentType="password" // iOS autofill hint
                    onSubmitEditing={handleSubmit}
                  />
                  {/* Add eye toggle for password visibility */}
                  <Touchable
                    style={styles.inputIconRight}
                    onPress={() => setShowPassword(!showPassword)}
                    rippleColor="transparent"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#9ca3af"
                    />
                  </Touchable>
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

              {/* Forgot Password Link */}
              <Touchable
                style={styles.forgotPasswordContainer}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                rippleColor="transparent"
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot your password?
                </Text>
              </Touchable>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <Touchable
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={loading}
                  rippleColor="#d1d5db"
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Touchable>

                <Touchable
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={loading}
                  rippleColor="#a78bfa"
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
                </Touchable>
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
              <Touchable
                style={styles.registerButton}
                onPress={() => {
                  if (isAndroid) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push("/register");
                }}
                rippleColor="#f3e8ff"
              >
                <Feather name="user-plus" size={20} color="#7e22ce" />
                <Text style={styles.registerButtonText}>Register Now</Text>
              </Touchable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  formContainer: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 12,
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
  },
  formHeader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: Platform.OS === "ios" ? 12 : 8,
    borderTopRightRadius: Platform.OS === "ios" ? 12 : 8,
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
    height: Platform.OS === "ios" ? 48 : 52, // Taller input fields on Android
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: Platform.OS === "ios" ? 8 : 4, // Smaller corner radius on Android
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
    top: Platform.OS === "ios" ? 14 : 16, // Adjusted for taller Android inputs
    zIndex: 1,
  },
  inputIconRight: {
    position: "absolute",
    right: 12,
    top: Platform.OS === "ios" ? 14 : 16, // Adjusted for taller Android inputs
    zIndex: 1,
    padding: 4, // Increased touch target
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
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
    marginTop: 4,
  },
  forgotPasswordText: {
    color: "#7e22ce",
    fontSize: 14,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  actionButtonsContainer: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: Platform.OS === "ios" ? 8 : 4,
    paddingVertical: 14,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // Ensure minimum touch target on iOS
    ...Platform.select({
      android: {
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
    borderRadius: Platform.OS === "ios" ? 8 : 4,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // Ensure minimum touch target on iOS
    ...Platform.select({
      android: {
        overflow: "hidden",
      },
    }),
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
  registrationCta: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: Platform.OS === "ios" ? 12 : 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    marginBottom: 24,
    borderWidth: Platform.OS === "ios" ? 1 : 0,
    borderColor: "#f3e8ff",
  },
  registrationCtaContent: {
    padding: 16,
  },
  registrationCtaTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 4,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  registrationCtaText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3e8ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Platform.OS === "ios" ? 8 : 4,
    minHeight: 48, // Ensure minimum touch target on iOS
    ...Platform.select({
      android: {
        overflow: "hidden",
      },
    }),
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#7e22ce",
    marginLeft: 8,
    ...Platform.select({
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  requiredStar: {
    color: "#ef4444",
  },
});

export default LoginScreen;
