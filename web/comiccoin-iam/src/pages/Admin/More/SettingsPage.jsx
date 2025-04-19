// monorepo/web/comiccoin-iam/src/pages/Admin/More/SettingsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import countryRegionData from "country-region-data/dist/data-umd";
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Info,
  X,
  RefreshCw,
  Globe,
  Clock,
  ArrowDown,
} from "lucide-react";

import AdminTopNavigation from "../../../components/AdminTopNavigation";
import AdminFooter from "../../../components/AdminFooter";
import { usePutUpdateMe } from "../../../hooks/usePutUpdateMe";
import { useAuth } from "../../../hooks/useAuth";
import { useGetMe } from "../../../hooks/useGetMe";

// Define timezone options for dropdown selection
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
  const { user, updateUser } = useAuth(); // updateUser might be unused, but kept for consistency

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
    error: updateError, // Capture the error object from the hook
    isSuccess,
  } = usePutUpdateMe();

  // State for form data
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    country: "", // Country code like 'US', 'CA'
    region: "", // Region/State code like 'CA', 'NY'
    timezone: "",
    wallet_address: "",
  });

  // Get available regions based on selected country
  const getRegionsForCountry = (countryCode) => {
    if (!countryCode) return [];
    const country = countryRegionData.find(
      (country) => country.countryShortCode === countryCode,
    );
    return country ? country.regions : [];
  };

  const availableRegions = getRegionsForCountry(formData.country);

  // State for form validation errors
  const [formErrors, setFormErrors] = useState({});

  // State for status messages (success/error notifications)
  const [statusMessage, setStatusMessage] = useState({
    type: null,
    message: "",
  });

  // Auto-dismiss error status messages after 5 seconds
  useEffect(() => {
    let timer;

    // Only auto-dismiss error messages
    if (statusMessage.type === "error") {
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
      // Ensure country code is uppercase (e.g., 'CA', 'US')
      const countryCode = latestUserData.country
        ? latestUserData.country.toUpperCase()
        : "";

      setFormData({
        email: latestUserData.email || "",
        first_name: latestUserData.first_name || "",
        last_name: latestUserData.last_name || "",
        phone: latestUserData.phone || "",
        country: countryCode || "",
        region: latestUserData.region || "",
        timezone: latestUserData.timezone || "",
        wallet_address: latestUserData.wallet_address || "",
      });
    }
    // Fall back to auth context user data if API data isn't available yet
    else if (user) {
      // Ensure country code is uppercase and handle camelCase conversion
      const countryCode = user.country ? user.country.toUpperCase() : "";

      setFormData({
        email: user.email || "",
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        phone: user.phone || "",
        country: countryCode || "",
        region: user.region || "",
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

  // Update status message based on API call results and handle redirect
  useEffect(() => {
    if (isSuccess) {
      setStatusMessage({
        type: "success",
        message: "Settings updated successfully!",
      });
      refreshUserData();
      const redirectTimer = setTimeout(() => {
        navigate("/admin/more");
      }, 1500);
      return () => clearTimeout(redirectTimer);
    } else if (updateError) {
      let generalErrorMessage = "Failed to update settings. Please try again."; // Default fallback
      let specificFieldErrors = {};

      // Check if the error response has structured data (like Axios error)
      if (updateError?.response?.data) {
        const errorData = updateError.response.data;

        // Case 1: Backend returns a structured object with field errors (e.g., { email: "...", field: "..." })
        // Exclude objects that just have a 'message' key, treat those as general errors.
        if (
          typeof errorData === "object" &&
          errorData !== null &&
          !(Object.keys(errorData).length === 1 && errorData.message)
        ) {
          let firstFieldErrorMsg = null;
          for (const key in errorData) {
            if (Object.hasOwnProperty.call(errorData, key)) {
              const errorValue = errorData[key];
              let fieldMsg = null;
              // Handle string or array of strings from backend
              if (typeof errorValue === "string") {
                fieldMsg = errorValue;
              } else if (
                Array.isArray(errorValue) &&
                errorValue.length > 0 &&
                typeof errorValue[0] === "string"
              ) {
                fieldMsg = errorValue[0]; // Take the first error if it's an array
              }

              if (fieldMsg) {
                specificFieldErrors[key] = fieldMsg;
                if (!firstFieldErrorMsg) {
                  // Use the first identified field error for the general status message
                  // Could also be a generic message like "Please correct the errors below."
                  firstFieldErrorMsg = fieldMsg;
                }
              }
            }
          }
          // If we found field errors, update the general message
          if (Object.keys(specificFieldErrors).length > 0) {
            generalErrorMessage =
              firstFieldErrorMsg || "Please check the form for errors.";
          }
        }
        // Case 2: Backend returns an object with a 'message' property (e.g., { message: "Error details" })
        else if (errorData.message && typeof errorData.message === "string") {
          generalErrorMessage = errorData.message;
        }
        // Case 3: Backend returns a simple string error
        else if (typeof errorData === "string") {
          generalErrorMessage = errorData;
        }
      }
      // Case 4: Standard JavaScript error object without response data
      else if (updateError?.message) {
        generalErrorMessage = updateError.message;
      }

      // Update the states
      setStatusMessage({
        type: "error",
        message: generalErrorMessage,
      });

      // Set field errors if they were found
      if (Object.keys(specificFieldErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...specificFieldErrors }));
        // Optional: Focus the first field with a backend error
        const firstErrorField = Object.keys(specificFieldErrors)[0];
        // Ensure the ID matches the field key expected by the backend
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          // Small delay to allow React to render updates before focusing
          setTimeout(() => errorElement.focus(), 100);
        }
      }
    }
  }, [isSuccess, updateError, refreshUserData, navigate]);

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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // Clear general status message on input change
    if (statusMessage.type === "error") {
      setStatusMessage({ type: null, message: "" });
    }
  };

  // Handle country dropdown change
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      region: "", // Reset region when country changes
    }));

    // Clear country error if it exists
    if (formErrors.country) {
      setFormErrors((prev) => ({
        ...prev,
        country: undefined,
      }));
    }
    // Clear general status message on input change
    if (statusMessage.type === "error") {
      setStatusMessage({ type: null, message: "" });
    }
  };

  // Handle region dropdown change
  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      region: regionCode,
    }));

    // Clear region error if it exists
    if (formErrors.region) {
      setFormErrors((prev) => ({
        ...prev,
        region: undefined,
      }));
    }
    // Clear general status message on input change
    if (statusMessage.type === "error") {
      setStatusMessage({ type: null, message: "" });
    }
  };

  // Comprehensive field rendering (simplified for brevity, assuming implementation is correct)
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
            {/* Simplified Select Rendering */}
            <select
              id={field.id}
              name={field.name}
              value={formData[field.fieldKey] || ""}
              onChange={handleInputChange} // Using generic handler for simplicity here
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
              {/* Options would be rendered here */}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ArrowDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            {hasError && (
              <div className="absolute inset-y-0 right-9 flex items-center pr-3">
                <AlertCircle
                  className="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              type={field.type}
              id={field.id}
              name={field.name}
              value={formData[field.fieldKey] || ""}
              onChange={field.onChange || handleInputChange}
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
    setStatusMessage({ type: null, message: "" }); // Clear previous messages
    setFormErrors({}); // Clear previous form errors

    // Basic frontend validation (backend validation is handled by the useEffect hook)
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

    // If there are frontend validation errors, prevent submission
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
      // Prepare data for submission - ensure region is included
      const updateData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        timezone: formData.timezone,
        phone: formData.phone || null, // Send null if empty
        country: formData.country || null, // Send null if empty
        region: formData.region || null, // Send null if empty
      };

      // Attempt to update user profile
      // The result (success/error including backend validation) will be handled by the useEffect hook monitoring isSuccess and updateError
      await updateMe(updateData);
    } catch (err) {
      // This catch block handles errors during the *initiation* of the updateMe call,
      // not necessarily the backend response errors (which are handled in useEffect).
      console.error("Update initiation failed", err);

      // Show a generic error message if the update call itself throws an error
      setStatusMessage({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during submission. Please try again.",
      });
    }
  };

  // Navigate back to `More` page.
  const handleBackToDashboard = () => {
    navigate("/admin/more");
  };

  // Render loading state if user data is not yet available
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminTopNavigation />
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
        <AdminFooter />
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

      <AdminTopNavigation />

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
            role={statusMessage.type === "error" ? "alert" : "status"} // Use 'alert' for errors, 'status' for success
            aria-live={statusMessage.type === "error" ? "assertive" : "polite"}
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
            {/* Only show dismiss button for error messages */}
            {statusMessage.type === "error" && (
              <button
                onClick={() => setStatusMessage({ type: null, message: "" })}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Dismiss message"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <form
            onSubmit={handleSubmit}
            className="divide-y divide-gray-100"
            aria-labelledby="settings-heading"
            noValidate // Disable browser validation, rely on React state and backend
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
                {/* Country dropdown */}
                <div className="space-y-1">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleCountryChange}
                      aria-invalid={!!formErrors.country}
                      aria-describedby={
                        formErrors.country ? "country-error" : undefined
                      }
                      className={`w-full h-10 pl-10 pr-10 py-2 appearance-none border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${formErrors.country ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`}
                    >
                      <option value="">Select Country...</option>
                      {countryRegionData.map((country) => (
                        <option
                          key={country.countryShortCode}
                          value={country.countryShortCode}
                        >
                          {country.countryName}
                        </option>
                      ))}
                      {/* Removed "Other" option */}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ArrowDown className="h-5 w-5 text-gray-400" />
                    </div>
                    {formErrors.country && (
                      <div className="absolute inset-y-0 right-9 flex items-center pr-3 pointer-events-none">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {formErrors.country && (
                    <p
                      id="country-error"
                      className="text-red-500 text-xs mt-1 flex items-start gap-1"
                    >
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{formErrors.country}</span>
                    </p>
                  )}
                </div>

                {/* Show region selection if a country is selected */}
                {formData.country ? (
                  <div className="space-y-1">
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Region
                    </label>
                    <div className="relative">
                      <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleRegionChange}
                        disabled={!availableRegions.length} // Disable if no regions
                        aria-invalid={!!formErrors.region}
                        aria-describedby={
                          formErrors.region ? "region-error" : undefined
                        }
                        className={`w-full h-10 px-3 py-2 appearance-none border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${formErrors.region ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"} ${!availableRegions.length ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      >
                        <option value="">
                          {availableRegions.length
                            ? "Select Region..."
                            : "No regions available"}
                        </option>
                        {availableRegions.map((region) => (
                          <option
                            key={region.shortCode}
                            value={region.shortCode} // Use shortCode as value
                          >
                            {region.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                      {formErrors.region && (
                        <div className="absolute inset-y-0 right-9 flex items-center pr-3 pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.region && (
                      <p
                        id="region-error"
                        className="text-red-500 text-xs mt-1 flex items-start gap-1"
                      >
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.region}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* Show Timezone field if no country is selected */
                  <div className="space-y-1">
                    <label
                      htmlFor="timezone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Timezone <span className="text-red-500 ml-1">*</span>
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
                        className={`w-full h-10 pl-10 pr-10 py-2 appearance-none border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                          formErrors.timezone
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-purple-500"
                        }`}
                        required
                        aria-invalid={!!formErrors.timezone}
                        aria-describedby={
                          formErrors.timezone ? "timezone-error" : undefined
                        }
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
                      {formErrors.timezone && (
                        <div className="absolute inset-y-0 right-9 flex items-center pr-3 pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.timezone && (
                      <p
                        id="timezone-error"
                        className="text-red-500 text-xs mt-1 flex items-start gap-1"
                      >
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.timezone}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Always show Timezone field if a country IS selected (it might have been placed in the grid above if no country was selected) */}
                {formData.country && (
                  <div className="space-y-1">
                    <label
                      htmlFor="timezone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Timezone <span className="text-red-500 ml-1">*</span>
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
                        className={`w-full h-10 pl-10 pr-10 py-2 appearance-none border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                          formErrors.timezone
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-purple-500"
                        }`}
                        required
                        aria-invalid={!!formErrors.timezone}
                        aria-describedby={
                          formErrors.timezone ? "timezone-error" : undefined
                        }
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
                      {formErrors.timezone && (
                        <div className="absolute inset-y-0 right-9 flex items-center pr-3 pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.timezone && (
                      <p
                        id="timezone-error"
                        className="text-red-500 text-xs mt-1 flex items-start gap-1"
                      >
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.timezone}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Form Actions */}
            <section className="p-4 sm:p-6 bg-gray-50">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0">
                <button
                  type="button"
                  onClick={handleBackToDashboard}
                  disabled={isUpdating} // Disable cancel while updating
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || isSuccess} // Disable if updating or if success message is showing before redirect
                  className={`
                    w-full sm:w-auto px-6 py-2.5 rounded-lg text-white transition-colors shadow-sm flex items-center justify-center text-sm font-medium
                    ${
                      isUpdating || isSuccess
                        ? "bg-purple-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    }
                  `}
                  aria-disabled={isUpdating || isSuccess}
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

      <AdminFooter />
    </div>
  );
};

// Wrap the component with HOCs
const AdminSettingsPage = SettingsPageContent;
export default AdminSettingsPage;
