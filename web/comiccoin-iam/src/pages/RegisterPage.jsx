// src/pages/RegisterPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  User,
  Globe,
  Lock,
  Mail,
  Phone,
  Clock,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";
import { useRegistration } from "../hooks/useRegistration";
import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    isLoading,
    error: apiError,
    success: apiSuccess,
    resetState,
  } = useRegistration();

  // Create a ref for the error summary div to scroll to
  const errorSummaryRef = useRef(null);
  const formRef = useRef(null);

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

  // State to track if form has been submitted to prevent duplicate submissions
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Effect to handle API errors when they change
  useEffect(() => {
    if (apiError) {
      mapApiErrorsToFormFields();

      // Scroll to the top of the form when errors occur
      setTimeout(() => {
        if (errorSummaryRef.current) {
          errorSummaryRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else if (formRef.current) {
          formRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);

      // Reset submission flag when we get an error
      setIsSubmitted(false);
    }
  }, [apiError]);

  // Effect to handle successful registration
  useEffect(() => {
    if (apiSuccess) {
      // Redirect to success page
      navigate("/register-success");
    }
  }, [apiSuccess, navigate]);

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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    // Clear the error for this field when user checks it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isLoading || isSubmitted) {
      return;
    }

    // Reset submission states
    resetState();
    setErrors({});
    setErrorSummary([]);

    // Mark as submitted to prevent duplicate API calls
    setIsSubmitted(true);

    try {
      // Send registration request to API using our hook - just once
      await register(formData);
      // Success will be handled by the useEffect watching apiSuccess
    } catch (error) {
      // mapApiErrorsToFormFields() will be called by the useEffect when apiError changes
      // This ensures errors are always displayed regardless of when they occur
      console.error("Registration error:", error);
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
    { value: "UTC-09:00", label: "(UTC-09:00) Alaska" },
    { value: "UTC-08:00", label: "(UTC-08:00) Pacific Time (US & Canada)" },
    { value: "UTC-07:00", label: "(UTC-07:00) Mountain Time (US & Canada)" },
    { value: "UTC-06:00", label: "(UTC-06:00) Central Time (US & Canada)" },
    { value: "UTC-05:00", label: "(UTC-05:00) Eastern Time (US & Canada)" },
    { value: "UTC-04:00", label: "(UTC-04:00) Atlantic Time (Canada)" },
    { value: "UTC-03:00", label: "(UTC-03:00) Brasilia" },
    { value: "UTC+00:00", label: "(UTC+00:00) London, Dublin, Lisbon" },
    { value: "UTC+01:00", label: "(UTC+01:00) Berlin, Paris, Rome, Madrid" },
    { value: "UTC+02:00", label: "(UTC+02:00) Athens, Istanbul, Cairo" },
    { value: "UTC+03:00", label: "(UTC+03:00) Moscow, Baghdad" },
    { value: "UTC+05:30", label: "(UTC+05:30) New Delhi, Mumbai" },
    { value: "UTC+08:00", label: "(UTC+08:00) Beijing, Singapore, Hong Kong" },
    { value: "UTC+09:00", label: "(UTC+09:00) Tokyo, Seoul" },
    { value: "UTC+10:00", label: "(UTC+10:00) Sydney, Melbourne" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Include the common Header component */}
      <Header showBackButton={true} />

      <main id="main-content" className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 lg:py-20 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Create Your Account
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto">
                Secure your unique blockchain identity and start building on the
                ComicCoin network.
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden mb-8"
            ref={formRef}
          >
            {/* Form Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
              <Shield className="h-7 w-7 mr-3 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">
                  Register for ComicCoin Name Service
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  Get started and secure your ComicCoin identity
                </p>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Display Error Summary Box */}
              {errorSummary.length > 0 && (
                <div
                  ref={errorSummaryRef}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  <div className="flex items-center gap-2 font-medium mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <h3>Please correct the following errors:</h3>
                  </div>
                  <ul className="list-disc ml-5 space-y-1">
                    {errorSummary.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Display API general error message if not already showing summary */}
              {apiError &&
                !apiError.errors &&
                typeof apiError.message === "string" &&
                errorSummary.length === 0 && (
                  <div
                    ref={errorSummaryRef}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                  >
                    <p className="font-medium">{apiError.message}</p>
                  </div>
                )}

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.first_name
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your first name"
                      required
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.last_name
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your last name"
                      required
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.email
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number{" "}
                    <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 h-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  Location Information
                </h3>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full h-10 px-3 py-2 appearance-none border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.country
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ArrowDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.country}
                    </p>
                  )}
                </div>

                {/* Other Country - only shows if "other" is selected */}
                {formData.country === "other" && (
                  <div>
                    <label
                      htmlFor="country_other"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Specify Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="country_other"
                      name="country_other"
                      value={formData.country_other}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.country_other
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      required={formData.country === "other"}
                    />
                    {errors.country_other && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.country_other}
                      </p>
                    )}
                  </div>
                )}

                {/* Timezone */}
                <div>
                  <label
                    htmlFor="timezone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Timezone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className={`w-full h-10 pl-10 pr-10 py-2 appearance-none border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.timezone
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      {timezones.map((timezone) => (
                        <option key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ArrowDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.timezone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.timezone}
                    </p>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-500" />
                  Account Security
                </h3>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 ${
                        errors.password
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Create a password (min 8 characters)"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="password_confirm"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="password_confirm"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 ${
                        errors.password_confirm
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex="-1"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password_confirm && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password_confirm}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="pt-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    Terms & Privacy
                  </h3>

                  {/* Terms of Service */}
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agree_terms_of_service"
                        name="agree_terms_of_service"
                        type="checkbox"
                        checked={formData.agree_terms_of_service}
                        onChange={handleCheckboxChange}
                        className={`h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 ${
                          errors.agree_terms_of_service ? "border-red-300" : ""
                        }`}
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="agree_terms_of_service"
                        className="font-medium text-gray-700"
                      >
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-purple-600 hover:text-purple-500"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-purple-600 hover:text-purple-500"
                        >
                          Privacy Policy
                        </Link>{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      {errors.agree_terms_of_service && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.agree_terms_of_service}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Promotional emails (optional) */}
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agree_promotions"
                        name="agree_promotions"
                        type="checkbox"
                        checked={formData.agree_promotions}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="agree_promotions"
                        className="font-medium text-gray-700"
                      >
                        I'd like to receive updates about new features, events,
                        and other comic-related content
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-6 flex flex-col sm:flex-row-reverse gap-3">
                <button
                  type="submit"
                  disabled={isLoading || isSubmitted}
                  className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/get-started")}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Additional Information */}
          <div className="mb-12 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Include the common Footer component */}
      <Footer
        isLoading={false}
        error={null}
        faucet={{}}
        formatBalance={(val) => val || "0"}
      />
    </div>
  );
};

export default RegisterPage;
