// src/pages/Individual/More/SettingsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Info,
  X,
  RefreshCw,
} from "lucide-react";

import UserTopNavigation from "../../../components/UserTopNavigation";
import UserFooter from "../../../components/UserFooter";
import { usePutUpdateMe } from "../../../hooks/usePutUpdateMe";
import { useAuth } from "../../../hooks/useAuth";
import { useGetMe } from "../../../hooks/useGetMe";

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

const SettingsPageContent = () => {
  const navigate = useNavigate();
  const statusRef = useRef(null);
  const [isManuallyLoading, setIsManuallyLoading] = useState(false);

  // Use the useAuth hook to get current user data
  const { user, updateUser } = useAuth();

  // Use the new useGetMe hook to fetch latest user data
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
      }, 1000);
    }
  };

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
        first_name: latestUserData.first_name || "", // FIXED: Use snake_case from API
        last_name: latestUserData.last_name || "", // FIXED: Use snake_case from API
        phone: latestUserData.phone || null,
        country: latestUserData.country || null,
        timezone: latestUserData.timezone || "",
        wallet_address: latestUserData.wallet_address || "", // FIXED: Use snake_case from API
      });
    }
    // Fall back to auth context user data if API data isn't available yet
    else if (user) {
      setFormData({
        email: user.email || "",
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        phone: user.phone || null,
        country: user.country || null,
        timezone: user.timezone || "",
        wallet_address: user.walletAddress || "",
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

  // Define form fields
  const personalFields = [
    {
      id: "first_name",
      label: "First Name",
      type: "text",
      name: "first_name",
      fieldKey: "first_name",
      placeholder: "Enter your first name",
      required: true,
    },
    {
      id: "last_name",
      label: "Last Name",
      type: "text",
      name: "last_name",
      fieldKey: "last_name",
      placeholder: "Enter your last name",
      required: true,
    },
  ];

  const contactFields = [
    {
      id: "email",
      label: "Email Address",
      type: "email",
      name: "email",
      fieldKey: "email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      id: "phone",
      label: "Phone Number",
      type: "tel",
      name: "phone",
      fieldKey: "phone",
      placeholder: "Enter your phone number",
      helperText: "Optional, format: 555-555-5555",
    },
  ];

  const locationFields = [
    {
      id: "country",
      label: "Country",
      type: "select",
      name: "country",
      fieldKey: "country",
      placeholder: "Select your country",
      helperText: "Optional",
    },
    {
      id: "timezone",
      label: "Timezone",
      type: "select",
      name: "timezone",
      fieldKey: "timezone",
      placeholder: "Select your timezone",
      required: true,
    },
  ];

  // Comprehensive field rendering
  const renderField = (field) => {
    const hasError = !!formErrors[field.fieldKey];
    const isRequired = field.required;

    return (
      <div key={field.id} className="space-y-1">
        <label
          htmlFor={field.id}
          className="block text-sm font-medium text-gray-700"
        >
          {field.label}
          {isRequired && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {field.type === "select" ? (
          <div className="relative">
            <select
              id={field.id}
              name={field.name}
              value={
                field.fieldKey === "country"
                  ? formData.country || ""
                  : formData[field.fieldKey]
              }
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  [field.fieldKey]: value,
                }));

                // Perform validation
                let errorMessage = "";
                if (field.required && !value) {
                  errorMessage = `${field.label} is required`;
                }

                setFormErrors((prev) => ({
                  ...prev,
                  [field.fieldKey]: errorMessage,
                }));
              }}
              disabled={field.disabled}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${field.id}-error` : undefined}
              className={`
                w-full h-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 appearance-none
                ${hasError ? "border-red-500 focus:ring-red-500 pr-10" : "border-gray-300 focus:ring-purple-500"}
                ${field.disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                ${field.customClasses || ""}
              `}
              required={isRequired}
            >
              {field.fieldKey === "country"
                ? countries.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                : timezones.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
            </select>

            {/* Dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Error indicator */}
            {hasError && (
              <div className="absolute inset-y-0 right-9 flex items-center pr-3">
                <AlertCircle
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        ) : field.fieldKey === "wallet_address" ? (
          <div className="relative">
            <input
              type="text"
              id={field.id}
              name={field.name}
              value={formData[field.fieldKey]}
              disabled={true}
              className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed font-mono text-sm"
              placeholder={field.placeholder}
            />
            <button
              type="button"
              onClick={() => {
                if (formData.wallet_address) {
                  navigator.clipboard.writeText(formData.wallet_address);
                  setStatusMessage({
                    type: "success",
                    message: "Wallet address copied to clipboard!",
                  });
                }
              }}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-purple-600 hover:text-purple-800 transition-colors"
              aria-label="Copy wallet address to clipboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type={field.type}
              id={field.id}
              name={field.name}
              value={
                field.fieldKey === "phone"
                  ? formData.phone || ""
                  : formData[field.fieldKey]
              }
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  [field.fieldKey]:
                    field.fieldKey === "phone" ? value || null : value,
                }));

                // Perform validation
                let errorMessage = "";
                switch (field.fieldKey) {
                  case "email":
                    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      errorMessage = "Please enter a valid email address";
                    }
                    break;
                  case "first_name":
                  case "last_name":
                    if (value && value.length < 2) {
                      errorMessage = `${field.label} must be at least 2 characters`;
                    }
                    break;
                  case "phone":
                    if (
                      value &&
                      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(
                        value,
                      )
                    ) {
                      errorMessage = "Please enter a valid phone number";
                    }
                    break;
                }

                // Set or clear error
                setFormErrors((prev) => ({
                  ...prev,
                  [field.fieldKey]: errorMessage,
                }));
              }}
              disabled={field.disabled}
              aria-invalid={hasError}
              placeholder={field.placeholder}
              required={isRequired}
              className={`
                w-full h-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
                ${hasError ? "border-red-500 focus:ring-red-500 pr-10" : "border-gray-300 focus:ring-purple-500"}
                ${field.disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                ${field.customClasses || ""}
              `}
            />

            {hasError && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <AlertCircle
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        )}

        {/* Error or helper text display */}
        {hasError ? (
          <p
            id={`${field.id}-error`}
            className="text-red-500 text-xs mt-1 flex items-start gap-1"
          >
            <AlertCircle
              className="h-3 w-3 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <span>{formErrors[field.fieldKey]}</span>
          </p>
        ) : field.helperText ? (
          <p
            id={`${field.id}-hint`}
            className="text-gray-500 text-xs mt-1 flex items-start gap-1"
          >
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{field.helperText}</span>
          </p>
        ) : null}
      </div>
    );
  };

  // Handle form submission with comprehensive validation
  const handleSubmit = async (e) => {
    e.preventDefault();

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

    // If there are validation errors, prevent submission
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      // Focus on the first field with an error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.focus();
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
            : "Failed to update profile. Please try again.",
      });
    }
  };

  // Navigate back to `More` page.
  const handleBackToDashboard = () => {
    navigate("/more");
  };

  // Render loading state if user data is not yet available
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <UserTopNavigation />
        <div
          className="flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white py-8"
          role="status"
        >
          <div className="animate-pulse space-y-6 text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-purple-200"></div>
            <p className="text-gray-600 font-medium">
              Loading your settings...
            </p>
            <span className="sr-only">Loading settings</span>

            <div className="mt-4">
              <button
                onClick={handleRefreshUserData}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Retry Loading
              </button>
            </div>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <UserTopNavigation />

      <main
        id="main-content"
        className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl flex-grow"
      >
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="mr-3 text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div>
              <h1
                className="text-2xl font-bold text-purple-900"
                id="settings-heading"
              >
                Account Settings
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your profile and account preferences
              </p>
            </div>
          </div>
        </header>

        {/* Status Message */}
        {statusMessage.type && (
          <div
            ref={statusRef}
            className={`
              mb-4 sm:mb-6 p-4 rounded-lg flex items-center justify-between
              ${statusMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}
              animate-fadeIn
            `}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center space-x-3">
              {statusMessage.type === "success" ? (
                <Check
                  className="h-5 w-5 text-green-500 flex-shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="h-5 w-5 text-red-500 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              <p className="font-medium text-sm">{statusMessage.message}</p>
            </div>
            <button
              onClick={() => setStatusMessage({ type: null, message: "" })}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Dismiss message"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <form
            onSubmit={handleSubmit}
            className="divide-y divide-gray-100"
            aria-labelledby="settings-heading"
            noValidate
          >
            {/* Personal Information Section */}
            <section className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="pb-1">
                <h2 className="text-lg font-medium text-purple-800 mb-1">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-600">
                  Update your basic profile information
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {personalFields.map(renderField)}
              </div>
            </section>

            {/* Contact Information Section */}
            <section className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="pb-1">
                <h2 className="text-lg font-medium text-purple-800 mb-1">
                  Contact Information
                </h2>
                <p className="text-sm text-gray-600">How we can reach you</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {contactFields.map(renderField)}
              </div>
            </section>

            {/* Location Information Section */}
            <section className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="pb-1">
                <h2 className="text-lg font-medium text-purple-800 mb-1">
                  Location & Preferences
                </h2>
                <p className="text-sm text-gray-600">
                  Set your regional preferences
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {locationFields.map(renderField)}
              </div>
            </section>

            {/* Wallet Information Section */}
            <section className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="pb-1">
                <h2 className="text-lg font-medium text-purple-800 mb-1">
                  Wallet Information
                </h2>
                <p className="text-sm text-gray-600">
                  Your ComicCoin wallet details
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {renderField({
                  id: "wallet_address",
                  label: "Wallet Address",
                  type: "text",
                  name: "wallet_address",
                  fieldKey: "wallet_address",
                  placeholder: "Wallet address",
                  disabled: true,
                  helperText:
                    "Your wallet address is automatically generated and cannot be modified",
                  customClasses: "font-mono text-sm",
                })}
              </div>
            </section>

            {/* Form Actions */}
            <section className="p-4 sm:p-6 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0">
                <button
                  type="button"
                  onClick={handleBackToDashboard}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`
                    w-full sm:w-auto px-6 py-2.5 rounded-lg text-white transition-colors shadow-sm flex items-center justify-center text-sm font-medium
                    ${
                      isUpdating
                        ? "bg-purple-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    }
                  `}
                  aria-disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </section>
          </form>
        </div>

        {/* Add global styles for animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }

          /* iOS-specific optimizations */
          @supports (-webkit-touch-callout: none) {
            .touch-manipulation {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }

            /* Add padding at the bottom for iOS safe areas */
            body {
              padding-bottom: env(safe-area-inset-bottom);
            }

            /* Improve tap targets for iOS */
            input, select, button {
              min-height: 44px; /* Apple's recommended minimum tap target size */
            }
          }
        `}</style>
      </main>

      <UserFooter />
    </div>
  );
};

// Wrap the component with HOCs
const UserSettingsPage = SettingsPageContent;
export default UserSettingsPage;
