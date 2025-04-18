// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/AddPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import countryRegionData from "country-region-data/dist/data-umd";
import {
  User,
  Save,
  ArrowLeft,
  AlertCircle,
  Mail,
  UserCircle,
  Shield,
  Building,
  Lock,
  Phone,
  Globe,
  MapPin,
  Home,
  Hash,
  Info,
  Loader,
  Check,
  Calendar,
  Type,
  FileText,
  BookOpen,
  Clock,
  ArrowDown,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminTopNavigation from "../../../components/AdminTopNavigation";
import AdminFooter from "../../../components/AdminFooter";
import {
  useUser,
  USER_ROLE,
  USER_STATUS,
  PROFILE_VERIFICATION_STATUS,
} from "../../../hooks/useUser";

// Define timezone options for dropdown selection - copied from SettingsPage
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

const UserAddPage = () => {
  const navigate = useNavigate();
  const { createNewUser, isLoading, error, success, reset } = useUser();
  const statusRef = useRef(null);

  // State for general error message
  const [generalError, setGeneralError] = useState("");

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: USER_ROLE.INDIVIDUAL,
    phone: "",
    country: "", // Will store country code (e.g., 'US', 'CA')
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    region: "", // Will store region code
    city: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    isEmailVerified: false,
    profileVerificationStatus: PROFILE_VERIFICATION_STATUS.UNVERIFIED,
    websiteURL: "",
    description: "",
    comicBookStoreName: "",
    status: USER_STATUS.ACTIVE,
    agreeTermsOfService: true,
    agreePromotions: false,
    agreeToTrackingAcrossThirdPartyAppsAndServices: false,
  });

  // Create ref for form card to scroll to on error
  const formCardRef = useRef(null);

  // Get available regions based on selected country
  const getRegionsForCountry = (countryCode) => {
    if (!countryCode) return [];
    const country = countryRegionData.find(
      (country) => country.countryShortCode === countryCode,
    );
    return country ? country.regions : [];
  };

  // Available regions for the selected country
  const availableRegions = getRegionsForCountry(formData.country);

  // Reset state when navigating away
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // We'll handle errors directly in the form submission handler
  // No need for error handling in useEffect which could conflict
  useEffect(() => {
    if (success) {
      toast.success("User created successfully");
      navigate("/users");
    }
  }, [success, navigate]);

  // Handle successful creation
  useEffect(() => {
    if (success) {
      toast.success("User created successfully");
      navigate("/users");
    }
  }, [success, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general status message on input change
    if (generalError) {
      setGeneralError("");
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

    // Clear general error message on input change
    if (generalError) {
      setGeneralError("");
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

    // Clear general error message on input change
    if (generalError) {
      setGeneralError("");
    }
  };

  // Handle form submission - No client-side validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    setFormErrors({});
    setGeneralError("");

    try {
      // Log what we're submitting
      console.log("Submitting form data:", formData);

      // Submit form data directly without validation
      await createNewUser(formData);
      // Success is handled by the useEffect
    } catch (err) {
      // Process error response directly here instead of relying on useEffect
      console.error("Form submission error:", err);

      // Convert backend snake_case field names to frontend camelCase names
      const fieldMap = {
        email: "email",
        password: "password",
        first_name: "firstName",
        last_name: "lastName",
        agree_terms_of_service: "agreeTermsOfService",
        // Add others as needed
      };

      // Extract error data from response if it exists
      const errorData = err.response?.data;
      console.log("Raw error data from backend:", errorData);

      if (errorData && typeof errorData === "object") {
        // Collect all error messages for the summary box
        const errorMessages = [];
        const fieldErrors = {};

        // Process each error field
        Object.entries(errorData).forEach(([field, message]) => {
          // Add to error messages list
          if (typeof message === "string") {
            errorMessages.push(message);

            // Map field name and add to field errors
            const formFieldName = fieldMap[field] || field;
            fieldErrors[formFieldName] = message;
          }
        });

        // Update error states
        if (errorMessages.length > 0) {
          setGeneralError(errorMessages.join(" • "));
          setFormErrors(fieldErrors);

          // Scroll to error message
          if (statusRef.current) {
            setTimeout(() => {
              statusRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 100);
          }
        } else {
          // Fallback error message if no specific messages found
          setGeneralError(
            "An error occurred. Please check your submission and try again.",
          );
        }
      } else {
        // Fallback for non-object error responses
        setGeneralError(err.message || "An unexpected error occurred");
      }
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate("/users");
  };

  // Utility to check if a field has an error
  const hasError = (field) => Boolean(formErrors[field]);

  // Conditionally show/hide fields based on role
  const isCompanyRole = formData.role === USER_ROLE.COMPANY;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <AdminTopNavigation />

      <main
        id="main-content"
        className="flex-grow container mx-auto px-4 py-8 max-w-4xl"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-900">
            Create New User
          </h1>
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800"
            aria-label="Return to user list"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to List
          </button>
        </div>

        {/* Main Form Card */}
        <div
          ref={formCardRef}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 scroll-mt-16"
        >
          {/* Card Header */}
          <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
            <User className="h-6 w-6 mr-3" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-semibold">User Information</h2>
              <p className="text-sm text-purple-100">
                Create a new user account
              </p>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
            {/* Error Summary */}
            {generalError && (
              <div
                ref={statusRef}
                className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 animate-fadeIn"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <AlertCircle
                      className="h-5 w-5 text-red-500 flex-shrink-0 mr-2"
                      aria-hidden="true"
                    />
                    <h3 className="font-medium">
                      Please correct the following errors:
                    </h3>
                  </div>
                  <button
                    onClick={() => setGeneralError("")}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Dismiss message"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {generalError.split(" • ").map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information Section */}
              <div className="md:col-span-2 border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-800 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("email")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="user@example.com"
                        required
                      />
                      {hasError("email") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("password")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      {hasError("password") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.password}</span>
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters
                    </p>
                  </div>

                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("firstName")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="John"
                        required
                      />
                      {hasError("firstName") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.firstName}</span>
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("lastName")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="Doe"
                        required
                      />
                      {hasError("lastName") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.lastName}</span>
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      User Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                          hasError("role")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        required
                      >
                        <option value={USER_ROLE.ROOT}>Administrator</option>
                        <option value={USER_ROLE.COMPANY}>
                          Business/Retailer
                        </option>
                        <option value={USER_ROLE.INDIVIDUAL}>Individual</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasError("role") ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.role}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
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
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("phone")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {hasError("phone") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Account Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                          hasError("status")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        required
                      >
                        <option value={USER_STATUS.ACTIVE}>Active</option>
                        <option value={USER_STATUS.LOCKED}>Locked</option>
                        <option value={USER_STATUS.ARCHIVED}>Archived</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasError("status") ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {formErrors.status && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.status}</span>
                      </p>
                    )}
                  </div>

                  {/* Verification Status */}
                  <div>
                    <label
                      htmlFor="profileVerificationStatus"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Verification Status
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Check className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="profileVerificationStatus"
                        name="profileVerificationStatus"
                        value={formData.profileVerificationStatus}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                          hasError("profileVerificationStatus")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                      >
                        <option value={PROFILE_VERIFICATION_STATUS.UNVERIFIED}>
                          Unverified
                        </option>
                        <option
                          value={
                            PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW
                          }
                        >
                          Under Review
                        </option>
                        <option value={PROFILE_VERIFICATION_STATUS.APPROVED}>
                          Verified
                        </option>
                        <option value={PROFILE_VERIFICATION_STATUS.REJECTED}>
                          Rejected
                        </option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasError("profileVerificationStatus") ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {formErrors.profileVerificationStatus && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.profileVerificationStatus}</span>
                      </p>
                    )}
                  </div>

                  {/* Email Verified Checkbox */}
                  <div>
                    <div className="flex items-start mt-4">
                      <div className="flex items-center h-5">
                        <input
                          id="isEmailVerified"
                          name="isEmailVerified"
                          type="checkbox"
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                          checked={formData.isEmailVerified}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="isEmailVerified"
                          className="font-medium text-gray-700"
                        >
                          Mark Email as Verified
                        </label>
                        <p className="text-gray-500">
                          Skip email verification process for this user
                        </p>
                      </div>
                    </div>
                    {formErrors.isEmailVerified && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.isEmailVerified}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Information (Conditional) */}
              {isCompanyRole && (
                <div className="md:col-span-2 border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-gray-800 mb-4">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Comic Book Store Name */}
                    <div>
                      <label
                        htmlFor="comicBookStoreName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Comic Book Store Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BookOpen className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="comicBookStoreName"
                          name="comicBookStoreName"
                          value={formData.comicBookStoreName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            hasError("comicBookStoreName")
                              ? "border-red-500 bg-red-50 pr-10"
                              : "border-gray-300"
                          }`}
                          placeholder="Amazing Comics"
                        />
                        {hasError("comicBookStoreName") && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {formErrors.comicBookStoreName && (
                        <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{formErrors.comicBookStoreName}</span>
                        </p>
                      )}
                    </div>

                    {/* Website URL */}
                    <div>
                      <label
                        htmlFor="websiteURL"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Website URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          id="websiteURL"
                          name="websiteURL"
                          value={formData.websiteURL}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            hasError("websiteURL")
                              ? "border-red-500 bg-red-50 pr-10"
                              : "border-gray-300"
                          }`}
                          placeholder="https://example.com"
                        />
                        {hasError("websiteURL") && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {formErrors.websiteURL && (
                        <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{formErrors.websiteURL}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Location Information */}
              <div className="md:col-span-2 border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-800 mb-4">
                  Location Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Timezone - Updated to dropdown */}
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
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                          hasError("timezone")
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
                        {hasError("timezone") ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {formErrors.timezone && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.timezone}</span>
                      </p>
                    )}
                  </div>

                  {/* Country - Updated to dropdown */}
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
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
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                          hasError("country")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
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
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasError("country") ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {formErrors.country && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.country}</span>
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("city")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="New York"
                      />
                      {hasError("city") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.city}</span>
                      </p>
                    )}
                  </div>

                  {/* Region/State - Updated to dynamic dropdown */}
                  <div>
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Region/State
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleRegionChange}
                        disabled={!availableRegions.length} // Disable if no regions
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                          hasError("region")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } ${!availableRegions.length ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      >
                        <option value="">
                          {availableRegions.length
                            ? "Select State/Province..."
                            : "No states/provinces available"}
                        </option>
                        {availableRegions.map((region) => (
                          <option
                            key={region.shortCode}
                            value={region.shortCode}
                          >
                            {region.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasError("region") ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {formErrors.region && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.region}</span>
                      </p>
                    )}
                  </div>

                  {/* PostalCode */}
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Postal Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("postalCode")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="10001"
                      />
                      {hasError("postalCode") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.postalCode && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.postalCode}</span>
                      </p>
                    )}
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label
                      htmlFor="addressLine1"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address Line 1
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("addressLine1")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="123 Main St"
                      />
                      {hasError("addressLine1") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.addressLine1 && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.addressLine1}</span>
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label
                      htmlFor="addressLine2"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address Line 2
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("addressLine2")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="Apt 4B"
                      />
                      {hasError("addressLine2") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.addressLine2 && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.addressLine2}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="md:col-span-2">
                <h3 className="font-medium text-gray-800 mb-4">
                  Additional Information
                </h3>
                <div>
                  {/* Description */}
                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Profile Description
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("description")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="Brief description of the user or their business..."
                      />
                      {hasError("description") && (
                        <div className="absolute top-3 right-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Terms and Consent */}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreeTermsOfService"
                          name="agreeTermsOfService"
                          type="checkbox"
                          className={`focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded ${
                            hasError("agreeTermsOfService")
                              ? "border-red-500 bg-red-50"
                              : ""
                          }`}
                          checked={formData.agreeTermsOfService}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="agreeTermsOfService"
                          className="font-medium text-gray-700"
                        >
                          Terms of Service{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <p className="text-gray-500">
                          User agrees to the Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </div>
                    {formErrors.agreeTermsOfService && (
                      <p className="text-sm text-red-600 flex items-start gap-1 pl-7">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.agreeTermsOfService}</span>
                      </p>
                    )}

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreePromotions"
                          name="agreePromotions"
                          type="checkbox"
                          className={`focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded ${
                            hasError("agreePromotions")
                              ? "border-red-500 bg-red-50"
                              : ""
                          }`}
                          checked={formData.agreePromotions}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="agreePromotions"
                          className="font-medium text-gray-700"
                        >
                          Marketing Communications
                        </label>
                        <p className="text-gray-500">
                          User agrees to receive promotional emails and updates
                        </p>
                      </div>
                    </div>
                    {formErrors.agreePromotions && (
                      <p className="text-sm text-red-600 flex items-start gap-1 pl-7">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.agreePromotions}</span>
                      </p>
                    )}

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreeToTrackingAcrossThirdPartyAppsAndServices"
                          name="agreeToTrackingAcrossThirdPartyAppsAndServices"
                          type="checkbox"
                          className={`focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded ${
                            hasError(
                              "agreeToTrackingAcrossThirdPartyAppsAndServices",
                            )
                              ? "border-red-500 bg-red-50"
                              : ""
                          }`}
                          checked={
                            formData.agreeToTrackingAcrossThirdPartyAppsAndServices
                          }
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="agreeToTrackingAcrossThirdPartyAppsAndServices"
                          className="font-medium text-gray-700"
                        >
                          Third-Party Tracking
                        </label>
                        <p className="text-gray-500">
                          User agrees to tracking across third-party apps and
                          services
                        </p>
                      </div>
                    </div>
                    {formErrors.agreeToTrackingAcrossThirdPartyAppsAndServices && (
                      <p className="text-sm text-red-600 flex items-start gap-1 pl-7">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>
                          {
                            formErrors.agreeToTrackingAcrossThirdPartyAppsAndServices
                          }
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Create User
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Helpful Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">
                User Account Information
              </h3>
              <p className="text-sm text-blue-700">
                Creating a new user will send them a welcome email with their
                login credentials. If you mark their email as verified, they
                won't need to complete the email verification process.
                Administrator accounts have full system access, so create them
                sparingly.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add global styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>

      <AdminFooter />
    </div>
  );
};

export default UserAddPage;
