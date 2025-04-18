// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/UpdatePage.jsx
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
  FileText,
  Wallet,
  BookOpen,
  RefreshCw,
  Eye,
  EyeOff,
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

const AdminUpdateUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const formCardRef = useRef(null);
  const statusRef = useRef(null);

  // Force reset on any success/error to prevent auto-submission
  const forceResetRef = useRef(null);

  const {
    fetchUserById,
    updateUser,
    isLoading: isApiLoading,
    error: apiError,
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Critical flags to prevent automatic submissions
  const [formInitialized, setFormInitialized] = useState(false);
  const [userHasClickedSubmit, setUserHasClickedSubmit] = useState(false);
  const [userModifiedForm, setUserModifiedForm] = useState(false);

  // Combined loading state
  const isLoading = isApiLoading || isLoadingUser || isUpdating;

  // Status message state
  const [statusMessage, setStatusMessage] = useState({
    type: null, // 'success' or 'error'
    message: "",
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

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

  // Track original user data to display a warning if sensitive fields are changed
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // IMPORTANT: Reset any previous success/error state on component mount
  // to ensure we don't trigger any automatic redirects
  useEffect(() => {
    if (forceResetRef.current === null) {
      forceResetRef.current = true;
      reset(); // Reset any previous states from the hook
    }
  }, [reset]);

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

  // Fetch user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      setIsLoadingUser(true);
      try {
        const userData = await fetchUserById(id);
        if (userData) {
          // Transform API response to form data format
          const formattedData = {
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
              parseInt(userData.profileVerificationStatus) ||
              PROFILE_VERIFICATION_STATUS.UNVERIFIED,
            websiteURL: userData.websiteURL || "",
            description: userData.description || "",
            comicBookStoreName: userData.comicBookStoreName || "",
            status: userData.status || USER_STATUS.ACTIVE,
            agreeTermsOfService: userData.agreeTermsOfService || false,
            agreePromotions: userData.agreePromotions || false,
            agreeToTrackingAcrossThirdPartyAppsAndServices:
              userData.agreeToTrackingAcrossThirdPartyAppsAndServices || false,
          };

          setFormData(formattedData);
          setOriginalData(formattedData);

          // Set form as initialized after data load
          setTimeout(() => {
            setFormInitialized(true);
          }, 500);
        } else {
          setGeneralError("User not found");
          navigate("/admin/users");
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
        setGeneralError("Failed to load user details. Please try again.");

        setStatusMessage({
          type: "error",
          message: "Failed to load user details. Please try again.",
        });
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
    if (apiError) {
      console.error("Error detected:", apiError);

      // Set a general error message for display in the UI
      setGeneralError(
        "Failed to update user. Please check your input and try again.",
      );

      setStatusMessage({
        type: "error",
        message:
          apiError.message ||
          "Failed to update user. Please check your input and try again.",
      });

      // Reset the submission flag to allow trying again
      setUserHasClickedSubmit(false);
      setIsUpdating(false);

      // Check for response data with field validation errors
      if (apiError.response && apiError.response.data) {
        console.log("Response data:", apiError.response.data);

        // Handle object with field validation errors
        if (
          typeof apiError.response.data === "object" &&
          !Array.isArray(apiError.response.data)
        ) {
          setErrors(apiError.response.data);
        }
        // Handle string error message
        else if (typeof apiError.response.data === "string") {
          setGeneralError(apiError.response.data);
        }
        // Handle error with message property
        else if (apiError.response.data.message) {
          setGeneralError(apiError.response.data.message);
        }
      }
      // Handle error with message property
      else if (apiError.message && typeof apiError.message === "string") {
        setGeneralError(apiError.message);
      }

      // Set form field errors if available in the error object
      if (apiError.errors) {
        setErrors(apiError.errors);
      }
    }
  }, [apiError]);

  // Detect form changes when user modifies the form
  useEffect(() => {
    // Only check for changes if form is initialized and user has made modifications
    if (formInitialized && userModifiedForm) {
      // Compare current form data with original data
      const checkForChanges = () => {
        for (const key in formData) {
          // Skip password as it's always different (empty at first)
          if (key === "password") continue;

          if (formData[key] !== originalData[key]) {
            return true;
          }
        }
        return false;
      };

      setHasChanges(checkForChanges());
    }
  }, [formData, originalData, formInitialized, userModifiedForm]);

  // Handle successful update ONLY if the user has clicked submit
  useEffect(() => {
    if (success && userHasClickedSubmit) {
      toast.success("User updated successfully");
      setStatusMessage({
        type: "success",
        message: "User updated successfully!",
      });

      // Clear submission state
      setUserHasClickedSubmit(false);
      setIsUpdating(false);

      // Wait briefly to show success message before navigating
      setTimeout(() => {
        navigate(`/admin/users/${id}`);
      }, 1500);
    }
  }, [success, navigate, id, userHasClickedSubmit]);

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

  // Refresh user data from the server
  const handleRefreshData = async () => {
    if (!id) return;

    setIsRefreshing(true);
    try {
      const userData = await fetchUserById(id);
      if (userData) {
        // Transform API response to form data format
        const formattedData = {
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
            parseInt(userData.profileVerificationStatus) ||
            PROFILE_VERIFICATION_STATUS.UNVERIFIED,
          websiteURL: userData.websiteURL || "",
          description: userData.description || "",
          comicBookStoreName: userData.comicBookStoreName || "",
          status: userData.status || USER_STATUS.ACTIVE,
          agreeTermsOfService: userData.agreeTermsOfService || false,
          agreePromotions: userData.agreePromotions || false,
          agreeToTrackingAcrossThirdPartyAppsAndServices:
            userData.agreeToTrackingAcrossThirdPartyAppsAndServices || false,
        };

        setFormData(formattedData);
        setOriginalData(formattedData);

        // Reset user modification flag
        setUserModifiedForm(false);
        setHasChanges(false);

        setStatusMessage({
          type: "success",
          message: "User data refreshed successfully!",
        });
      }
    } catch (err) {
      console.error("Failed to refresh user details:", err);
      setStatusMessage({
        type: "error",
        message: "Failed to refresh user data. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // Mark that user has modified form
    setUserModifiedForm(true);

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle form submission - ONLY triggers when user actually submits the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set flag that user has clicked submit
    setUserHasClickedSubmit(true);

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

    // Minor fixes.
    formData.profileVerificationStatus = parseInt(
      formData.profileVerificationStatus,
    ); // Our backend expects integers here.

    // If validation errors, set them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Reset submission state so user can try again
      setUserHasClickedSubmit(false);

      // Set error status message
      setStatusMessage({
        type: "error",
        message: "Please correct the errors in the form before submitting.",
      });

      // Focus on the first field with an error
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.focus();
      }

      return;
    }

    setIsUpdating(true);
    try {
      // Only include the password if it was provided
      const dataToUpdate = { ...formData };
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }

      // This is the key API call that actually updates the user
      await updateUser(id, dataToUpdate);

      // Success is handled by the useEffect when both success is true AND userHasClickedSubmit is true
    } catch (err) {
      // Error is handled by the API error useEffect
      console.error("Form submission error:", err);

      // Reset submission state
      setUserHasClickedSubmit(false);
      setIsUpdating(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelWarning(true);
    } else {
      navigate(`/admin/users/${id}`);
    }
  };

  // Handle confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    navigate(`/admin/users/${id}`);
  };

  // Utility to check if a field has an error
  const hasError = (field) => Boolean(errors[field]);

  // Conditionally show/hide fields based on role
  const isCompanyRole =
    formData.role === USER_ROLE.COMPANY.toString() ||
    formData.role === USER_ROLE.COMPANY;
  const isRootUser =
    formData.role === USER_ROLE.ROOT.toString() ||
    formData.role === USER_ROLE.ROOT;

  // Get role label
  const getRoleLabel = (roleCode) => {
    const role = parseInt(roleCode, 10);
    switch (role) {
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
        className="flex-grow container mx-auto px-4 py-8 max-w-5xl"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <button
              onClick={handleCancel}
              className="mr-3 text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors"
              aria-label="Return to user details"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-purple-900">
                Update User
              </h1>
              {!isLoadingUser && (
                <p className="text-gray-600">
                  Modify information for {formData.firstName}{" "}
                  {formData.lastName}
                </p>
              )}
            </div>
          </div>
          <div>
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="px-3 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-1"
              aria-label="Refresh user data"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage.type && (
          <div
            ref={statusRef}
            className={`
              mb-6 p-4 rounded-lg flex items-center justify-between
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

        {/* Loading State */}
        {isLoadingUser && (
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center">
            <div className="animate-pulse space-y-6 text-center">
              <div className="h-12 w-12 mx-auto rounded-full bg-purple-200"></div>
              <p className="text-gray-600 font-medium">Loading user data...</p>
              <span className="sr-only">Loading user data</span>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        {!isLoadingUser && (
          <div
            ref={formCardRef}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 scroll-mt-16"
          >
            {/* Card Header */}
            <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center">
                  <User className="h-6 w-6 mr-3" aria-hidden="true" />
                  <div>
                    <h2 className="text-xl font-semibold">
                      Edit User Information
                    </h2>
                    <p className="text-sm text-purple-100">
                      Modify details for {formData.firstName}{" "}
                      {formData.lastName}
                    </p>
                  </div>
                </div>

                {hasChanges && userModifiedForm && (
                  <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Unsaved changes
                  </div>
                )}
              </div>
            </div>

            {/* Error Summary */}
            {(Object.keys(errors).length > 0 || generalError) && (
              <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
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

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
              {/* Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information Section */}
                <div className="md:col-span-2 border-b border-gray-200 pb-6">
                  <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                    <UserCircle className="h-5 w-5 text-purple-600 mr-2" />
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
                        <span className="text-gray-400 text-xs">
                          (optional)
                        </span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            hasError("password")
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Leave blank to keep current password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <Eye className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
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
                          value={formData.phone || ""}
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
                    <div className="md:col-span-2">
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
                  <div className="md:col-span-2 border-b border-gray-200 pb-6">
                    <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                      <Building className="h-5 w-5 text-purple-600 mr-2" />
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
                <div className="md:col-span-2 border-b border-gray-200 pb-6">
                  <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 text-purple-600 mr-2" />
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
                          placeholder="America/New_York"
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
                          placeholder="United States"
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
                          placeholder="NY"
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

                {/* Blockchain Information */}
                <div className="md:col-span-2 border-b border-gray-200 pb-6">
                  <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                    <Wallet className="h-5 w-5 text-purple-600 mr-2" />
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
                          placeholder="0x..."
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
                  <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 text-purple-600 mr-2" />
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
              <div className="pt-6 flex flex-col sm:flex-row-reverse justify-between gap-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      isLoading
                        ? "bg-purple-300 cursor-not-allowed text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    }`}
                    id="submit-button"
                  >
                    {isUpdating ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Saving Changes...
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
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshData}
                  disabled={isRefreshing || isUpdating}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefreshing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      Reset Form
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* No User Found */}
        {!isLoadingUser && !formData.email && !apiError && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              User Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find a user with the ID: {id}
            </p>
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to User List
            </button>
          </div>
        )}

        {/* Help Information */}
        {!isLoadingUser && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">
                  Editing User Account
                </h3>
                <p className="text-sm text-blue-700">
                  When updating a user's information, be careful with changing
                  role or status as it may affect their access. Leave the
                  password field blank to keep the current password unchanged.
                  Email changes may require the user to verify their new email
                  address depending on your settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <AdminFooter />

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center mb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Discard Changes?
              </h3>
              <p className="text-gray-600 mt-2">
                You have unsaved changes that will be lost if you leave this
                page. Are you sure you want to continue?
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminUpdateUserPage;
