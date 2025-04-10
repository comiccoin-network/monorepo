// src/pages/UserManagement/EditPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
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
  Wallet,
  BookOpen,
  RefreshCw,
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

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchUserById,
    updateUser,
    isLoading: isApiLoading,
    error,
    success,
    reset,
  } = useUser();

  // State for general error message
  const [generalError, setGeneralError] = useState("");

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Loading states
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Combined loading state
  const isLoading = isApiLoading || isLoadingUser || isUpdating;

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "", // Optional for update
    role: USER_ROLE.INDIVIDUAL,
    phone: "",
    country: "",
    timezone: "",
    region: "",
    city: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    walletAddress: "",
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

  // Fetch user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      setIsLoadingUser(true);
      try {
        const userData = await fetchUserById(id);
        if (userData) {
          // Transform API response to form data format
          setFormData({
            email: userData.email || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            password: "", // Leave blank for update
            role: userData.role || USER_ROLE.INDIVIDUAL,
            phone: userData.phone || "",
            country: userData.country || "",
            timezone: userData.timezone || "",
            region: userData.region || "",
            city: userData.city || "",
            postalCode: userData.postalCode || "",
            addressLine1: userData.addressLine1 || "",
            addressLine2: userData.addressLine2 || "",
            walletAddress: userData.walletAddress
              ? userData.walletAddress.toString()
              : "",
            isEmailVerified: userData.wasEmailVerified || false,
            profileVerificationStatus:
              userData.profileVerificationStatus ||
              PROFILE_VERIFICATION_STATUS.UNVERIFIED,
            websiteURL: userData.websiteURL || "",
            description: userData.description || "",
            comicBookStoreName: userData.comicBookStoreName || "",
            status: userData.status || USER_STATUS.ACTIVE,
            agreeTermsOfService: userData.agreeTermsOfService || false,
            agreePromotions: userData.agreePromotions || false,
            agreeToTrackingAcrossThirdPartyAppsAndServices:
              userData.agreeToTrackingAcrossThirdPartyAppsAndServices || false,
          });
        } else {
          setGeneralError("User not found");
          navigate("/users");
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
        setGeneralError("Failed to load user details. Please try again.");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();

    return () => {
      reset(); // Cleanup on unmount
    };
  }, [id, fetchUserById, navigate, reset]);

  // Handle API errors when they occur
  useEffect(() => {
    if (error) {
      console.error("Error detected:", error);

      // Set a general error message for display in the UI
      setGeneralError(
        "Failed to update user. Please check your input and try again.",
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

  // Handle successful update
  useEffect(() => {
    if (success) {
      toast.success("User updated successfully");
      navigate(`/users/${id}`);
    }
  }, [success, navigate, id]);

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
    if (!formData.timezone) validationErrors.timezone = "Timezone is required";

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      validationErrors.email = "Please enter a valid email address";
    }

    // Password validation (only if provided)
    if (formData.password && formData.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters long";
    }

    // If validation errors, set them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsUpdating(true);
    try {
      // Only include the password if it was provided
      const dataToUpdate = { ...formData };
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }

      await updateUser(id, dataToUpdate);
      // Success is handled by the useEffect
    } catch (err) {
      // Error is handled by the useEffect for error
      console.error("Form submission error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate(`/users/${id}`);
  };

  // Utility to check if a field has an error
  const hasError = (field) => Boolean(errors[field]);

  // Conditionally show/hide fields based on role
  const isCompanyRole = formData.role === USER_ROLE.COMPANY;
  const isRootUser = formData.role === USER_ROLE.ROOT;

  // Get role label
  const getRoleLabel = (roleCode) => {
    switch (parseInt(roleCode, 10)) {
      case USER_ROLE.ROOT:
        return "Administrator";
      case USER_ROLE.COMPANY:
        return "Business/Retailer";
      case USER_ROLE.INDIVIDUAL:
        return "Individual";
      default:
        return "Unknown";
    }
  };

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
          <h1 className="text-2xl font-bold text-purple-900">Edit User</h1>
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800"
            aria-label="Return to user details"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Cancel
          </button>
        </div>

        {/* Loading State */}
        {isLoadingUser && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 flex flex-col items-center justify-center">
            <Loader className="h-8 w-8 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading user details...</p>
          </div>
        )}

        {/* Main Form Card */}
        {!isLoadingUser && (
          <div
            ref={formCardRef}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 scroll-mt-16"
          >
            {/* Card Header */}
            <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
              <User className="h-6 w-6 mr-3" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-semibold">Edit User Information</h2>
                <p className="text-sm text-purple-100">
                  Update details for {formData.firstName} {formData.lastName}
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
                  {generalError && (
                    <p className="text-sm mb-2">{generalError}</p>
                  )}
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

                    {/* Password (optional for update) */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password{" "}
                        <span className="text-gray-400">(optional)</span>
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
                          placeholder="Leave blank to keep current password"
                        />
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.password}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank to keep the current password
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

                    {/* Role (show as readonly for root users for safety) */}
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
                        {isRootUser ? (
                          // Read-only display for root users to prevent accidental demotion
                          <div className="flex items-center w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                            <Shield className="h-5 w-5 mr-2 text-purple-600" />
                            Administrator (Root)
                            <div className="ml-auto text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                              Cannot be changed
                            </div>
                          </div>
                        ) : (
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
                            <option value={USER_ROLE.ROOT}>
                              Administrator
                            </option>
                            <option value={USER_ROLE.COMPANY}>
                              Business/Retailer
                            </option>
                            <option value={USER_ROLE.INDIVIDUAL}>
                              Individual
                            </option>
                          </select>
                        )}
                        <input
                          type="hidden"
                          name="role"
                          value={formData.role}
                          readOnly={isRootUser}
                        />
                      </div>
                      {isRootUser && (
                        <p className="mt-1 text-xs text-gray-500">
                          Administrator role cannot be changed for security
                          reasons
                        </p>
                      )}
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
                        {isRootUser ? (
                          // Read-only display for root users to prevent disabling
                          <div className="flex items-center w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                            <div className="flex items-center">
                              <span className="h-2 w-2 mr-2 rounded-full bg-green-500"></span>
                              Active
                            </div>
                            <div className="ml-auto text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                              Cannot be changed
                            </div>
                          </div>
                        ) : (
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
                            <option value={USER_STATUS.ARCHIVED}>
                              Archived
                            </option>
                          </select>
                        )}
                        <input
                          type="hidden"
                          name="status"
                          value={
                            isRootUser ? USER_STATUS.ACTIVE : formData.status
                          }
                          readOnly={isRootUser}
                        />
                      </div>
                      {isRootUser && (
                        <p className="mt-1 text-xs text-gray-500">
                          Administrator status cannot be changed for security
                          reasons
                        </p>
                      )}
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
                          <option
                            value={PROFILE_VERIFICATION_STATUS.UNVERIFIED}
                          >
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
                            User will not need to verify their email address
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
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="timezone"
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            hasError("timezone")
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      {errors.timezone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.timezone}
                        </p>
                      )}
                    </div>

                    {/* Country */}
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
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            hasError("country")
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
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
                        />
                      </div>
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* Region/State */}
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
                        <input
                          type="text"
                          id="region"
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            hasError("region")
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
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

                {/* Blockchain Information */}
                <div className="md:col-span-2 border-b border-gray-200 pb-4">
                  <h3 className="font-medium text-gray-800 mb-4">
                    Blockchain Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Wallet Address */}
                    <div>
                      <label
                        htmlFor="walletAddress"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Wallet Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Wallet className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="walletAddress"
                          name="walletAddress"
                          value={formData.walletAddress}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            hasError("walletAddress")
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.walletAddress && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.walletAddress}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        ComicCoin wallet address (optional)
                      </p>
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
                            User agrees to the Terms of Service and Privacy
                            Policy
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
                            User agrees to receive promotional emails and
                            updates
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
                  {isUpdating ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Changes
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
        )}

        {/* Helpful Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">
                User Account Management
              </h3>
              <p className="text-sm text-blue-700">
                When updating a user's information, be careful with changing
                their role or status as it may affect their access to the
                system. Leave the password field blank to keep the current
                password unchanged. Email changes may require the user to verify
                their new email address.
              </p>
            </div>
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default UserEditPage;
