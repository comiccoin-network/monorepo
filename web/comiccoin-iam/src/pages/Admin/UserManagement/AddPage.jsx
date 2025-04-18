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

  // State for general error message
  const [generalError, setGeneralError] = useState("");

  // Form validation errors
  const [errors, setErrors] = useState({});

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

  // Handle API errors when they occur
  useEffect(() => {
    if (error) {
      console.error("Error detected:", error);

      // Set a general error message for display in the UI
      setGeneralError(
        "Failed to create user. Please check your input and try again.",
      );

      // Check for response data with field validation errors
      if (error.response && error.response.data) {
        console.log("Response data:", error.response.data);

        // Handle object with field validation errors
        if (
          typeof error.response.data === "object" &&
          !Array.isArray(error.response.data)
        ) {
          setErrors(error.response.data);
        }
        // Handle string error message
        else if (typeof error.response.data === "string") {
          setGeneralError(error.response.data);
        }
        // Handle error with message property
        else if (error.response.data.message) {
          setGeneralError(error.response.data.message);
        }
      }
      // Handle error with message property
      else if (error.message && typeof error.message === "string") {
        setGeneralError(error.message);
      }

      // Set form field errors if available in the error object
      if (error.errors) {
        setErrors(error.errors);
      }
    } else {
      // Clear error when there's no error
      setGeneralError("");
    }
  }, [error]);

  // Scroll to form card when errors are detected
  useEffect(() => {
    if (
      (Object.keys(errors).length > 0 || generalError) &&
      formCardRef.current
    ) {
      // Small timeout to ensure DOM has updated
      setTimeout(() => {
        formCardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [errors, generalError]);

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
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
    if (errors.country) {
      setErrors((prev) => ({
        ...prev,
        country: undefined,
      }));
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
    if (errors.region) {
      setErrors((prev) => ({
        ...prev,
        region: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    setErrors({});
    setGeneralError("");

    // Basic validation
    const validationErrors = {};
    if (!formData.email) validationErrors.email = "Email is required";
    if (!formData.firstName)
      validationErrors.firstName = "First name is required";
    if (!formData.lastName) validationErrors.lastName = "Last name is required";
    if (!formData.password) validationErrors.password = "Password is required";
    if (!formData.timezone) validationErrors.timezone = "Timezone is required";

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      validationErrors.email = "Please enter a valid email address";
    }

    // Password strength validation
    if (formData.password && formData.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters long";
    }

    // If validation errors, set them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createNewUser(formData);
      // Success is handled by the useEffect
    } catch (err) {
      // Error is handled by the useEffect for error
      console.error("Form submission error:", err);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate("/users");
  };

  // Utility to check if a field has an error
  const hasError = (field) => Boolean(errors[field]);

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
            {(Object.keys(errors).length > 0 || generalError) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <h3>Please correct the following errors:</h3>
                </div>
                {generalError && <p className="text-sm mb-2">{generalError}</p>}
                {Object.keys(errors).length > 0 && (
                  <ul className="list-disc ml-5 space-y-1 text-sm">
                    {Object.entries(errors).map(
                      ([field, message]) =>
                        message && <li key={field}>{message}</li>,
                    )}
                  </ul>
                )}
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="user@example.com"
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password}
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="John"
                        required
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.firstName}
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Doe"
                        required
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.lastName}
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
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
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
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.role}
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.phone}
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
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
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
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.status}
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
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
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
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.profileVerificationStatus && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.profileVerificationStatus}
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
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Amazing Comics"
                        />
                      </div>
                      {errors.comicBookStoreName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.comicBookStoreName}
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
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="https://example.com"
                        />
                      </div>
                      {errors.websiteURL && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.websiteURL}
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="New York"
                      />
                    </div>
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.city}
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
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {errors.region && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.region}
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="10001"
                      />
                    </div>
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.postalCode}
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="123 Main St"
                      />
                    </div>
                    {errors.addressLine1 && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.addressLine1}
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Apt 4B"
                      />
                    </div>
                    {errors.addressLine2 && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.addressLine2}
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
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Brief description of the user or their business..."
                      />
                    </div>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.description}
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
                          checked={formData.agreeTermsOfService}
                          onChange={handleInputChange}
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
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

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreePromotions"
                          name="agreePromotions"
                          type="checkbox"
                          checked={formData.agreePromotions}
                          onChange={handleInputChange}
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
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

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreeToTrackingAcrossThirdPartyAppsAndServices"
                          name="agreeToTrackingAcrossThirdPartyAppsAndServices"
                          type="checkbox"
                          checked={
                            formData.agreeToTrackingAcrossThirdPartyAppsAndServices
                          }
                          onChange={handleInputChange}
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
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

      <AdminFooter />
    </div>
  );
};

export default UserAddPage;
