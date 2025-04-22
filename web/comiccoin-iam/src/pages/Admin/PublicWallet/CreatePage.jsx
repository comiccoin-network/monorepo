// monorepo/web/comiccoin-iam/src/pages/Admin/PublicWallet/CreatePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  Save,
  ArrowLeft,
  AlertCircle,
  LinkIcon,
  Hash,
  Type,
  FileText,
  Loader,
  Info,
  Building,
  User,
  CheckCircle,
  X,
  Globe,
  MapPin,
  Home,
  UserCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminTopNavigation from "../../../components/AdminTopNavigation";
import AdminFooter from "../../../components/AdminFooter";
import {
  usePublicWallet,
  WALLET_STATUS,
  WALLET_TYPE,
} from "../../../hooks/usePublicWallet";
import { useUserList } from "../../../hooks/useUser";

const AdminPublicWalletCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    createPublicWalletByAdmin,
    isLoading: isCreating,
    error: operationError,
    reset,
  } = usePublicWallet();

  // Get users list for the user selection dropdown
  const { users, isLoading: isLoadingUsers } = useUserList({
    pageSize: 1000, // Load all users for the dropdown
    status: 1, // Only active users
  });

  // Create ref for form card to scroll to on error
  const formCardRef = useRef(null);
  const statusRef = useRef(null);

  // State for tracking whether we've submitted the form
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // State for general error message
  const [generalError, setGeneralError] = useState("");

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Status message state
  const [statusMessage, setStatusMessage] = useState({
    type: null, // 'success' or 'error'
    message: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    address: "",
    chainId: 1,
    name: "",
    description: "",
    thumbnailS3Key: "",
    status: WALLET_STATUS.ACTIVE,
    type: WALLET_TYPE.INDIVIDUAL,
    websiteURL: "",
    isVerified: false,
    userId: "", // Required for admin creation
    country: "",
    region: "",
    city: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
  });

  // Reset state on component mount
  useEffect(() => {
    reset();
  }, [reset]);

  // Auto-dismiss status messages after 5 seconds
  useEffect(() => {
    let timer;

    if (statusMessage.type) {
      timer = setTimeout(() => {
        setStatusMessage({ type: null, message: "" });
      }, 5000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [statusMessage]);

  // Handle API errors when they occur
  useEffect(() => {
    if (operationError) {
      // Only show backend error messages - no technical details
      if (operationError.response && operationError.response.data) {
        if (
          typeof operationError.response.data === "object" &&
          !Array.isArray(operationError.response.data)
        ) {
          // Set the backend errors directly as they come from the server
          setErrors(operationError.response.data);

          // If there's a general error message in the response
          if (operationError.response.data.general) {
            setGeneralError(operationError.response.data.general);
          }
        } else if (typeof operationError.response.data === "string") {
          setGeneralError(operationError.response.data);
        }
      }
    } else {
      setGeneralError("");
      setErrors({});
    }
  }, [operationError]);

  // Scroll to form card when errors are detected
  useEffect(() => {
    if (
      (Object.keys(errors).length > 0 || generalError) &&
      formCardRef.current
    ) {
      setTimeout(() => {
        formCardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [errors, generalError]);

  // Get wallet type label
  const getWalletTypeLabel = (typeCode) => {
    switch (typeCode) {
      case WALLET_TYPE.COMPANY:
        return "Business/Retailer";
      case WALLET_TYPE.INDIVIDUAL:
        return "Individual";
      default:
        return "Unknown";
    }
  };

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

    setHasSubmitted(true);

    try {
      // Send data to backend without any client-side validation
      const apiPayload = {
        address: formData.address,
        chainId: parseInt(formData.chainId),
        name: formData.name,
        description: formData.description,
        thumbnailS3Key: formData.thumbnailS3Key,
        status: parseInt(formData.status),
        type: parseInt(formData.type),
        websiteURL: formData.websiteURL,
        isVerified: formData.isVerified,
        userId: formData.userId,
        country: formData.country,
        region: formData.region,
        city: formData.city,
        postalCode: formData.postalCode,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
      };

      await createPublicWalletByAdmin(apiPayload);

      // Invalidate and refetch queries related to public wallets
      queryClient.invalidateQueries(["publicWallets"]);
      queryClient.invalidateQueries(["wallets"]);

      // Show success message
      toast.success("Wallet created successfully");

      setStatusMessage({
        type: "success",
        message: "Wallet created successfully!",
      });

      // Navigate back to wallet list page after a short delay
      setTimeout(() => {
        navigate("/admin/public-wallets");
      }, 1500);
    } catch (err) {
      console.error("Form submission error:", err);
      setHasSubmitted(false);

      // Only set the field-specific errors from the backend response
      if (err.response && err.response.data) {
        if (
          typeof err.response.data === "object" &&
          !Array.isArray(err.response.data)
        ) {
          // Set the backend errors directly
          setErrors(err.response.data);

          // If there's a general error message in the response
          if (err.response.data.general) {
            setGeneralError(err.response.data.general);
          }
        } else if (typeof err.response.data === "string") {
          setGeneralError(err.response.data);
        }
      }
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate("/admin/public-wallets");
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
        className="flex-grow container mx-auto px-4 py-8 max-w-3xl"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-900">
            Create Public Wallet
          </h1>
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800"
            aria-label="Return to wallet list"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Cancel
          </button>
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
                <CheckCircle
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

        {/* Main Form Card */}
        <div
          ref={formCardRef}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
          {/* Card Header */}
          <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
            <Wallet className="h-6 w-6 mr-3" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-semibold">
                Create New Public Wallet
              </h2>
              <p className="text-sm text-purple-100">
                Create a new wallet for a user on the ComicCoin network
              </p>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
            {/* Error Summary */}
            {(Object.keys(errors).length > 0 || generalError) && (
              <>
                {generalError && (
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
              </>
            )}

            {/* User Selection Section */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <UserCircle className="h-5 w-5 text-purple-600 mr-2" />
                User Assignment
              </h3>

              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select User
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  disabled={isCreating || isLoadingUsers}
                  className={`w-full pl-3 pr-10 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.userId
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } ${isCreating || isLoadingUsers ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">Select a user...</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.fullName} ({user.email})
                      {user.isCompany && " - Business"}
                    </option>
                  ))}
                </select>
                {errors.userId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.userId}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Choose the user who will own this wallet
                </p>
              </div>
            </div>

            {/* Basic Information Section */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <Wallet className="h-5 w-5 text-purple-600 mr-2" />
                Basic Information
              </h3>

              {/* Wallet Address */}
              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ComicCoin Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={isCreating}
                    className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.address
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="0x..."
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.address}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter a valid Ethereum address (42 characters starting with
                  0x)
                </p>
              </div>

              {/* Chain ID */}
              <div className="mb-4">
                <label
                  htmlFor="chainId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chain ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="chainId"
                    name="chainId"
                    value={formData.chainId}
                    readOnly
                    className="w-full pl-10 pr-3 py-2 h-10 border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
                    aria-readonly="true"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Fixed to ComicCoin Mainnet (Chain ID: 1)
                </p>
              </div>

              {/* Wallet Type */}
              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wallet Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={isCreating}
                  className={`w-full pl-3 pr-10 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.type ? "border-red-500 bg-red-50" : "border-gray-300"
                  } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value={WALLET_TYPE.INDIVIDUAL}>Individual</option>
                  <option value={WALLET_TYPE.COMPANY}>Business/Retailer</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.type}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Select the type of wallet based on the user's profile
                </p>
              </div>

              {/* Wallet Name */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wallet Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isCreating}
                    className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder={
                      formData.type === WALLET_TYPE.COMPANY
                        ? "Business Wallet Name"
                        : "Personal Wallet"
                    }
                    maxLength={100}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  A friendly name to identify this wallet (max 100 characters)
                </p>
              </div>

              {/* Website URL */}
              <div className="mb-4">
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
                    disabled={isCreating}
                    className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.websiteURL
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="https://example.com"
                  />
                </div>
                {errors.websiteURL && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.websiteURL}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.type === WALLET_TYPE.COMPANY
                    ? "Business website URL"
                    : "Personal website or online profile URL"}
                </p>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
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
                    disabled={isCreating}
                    rows={4}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.description
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Add a description for this wallet (optional)"
                    maxLength={500}
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Optional description (max 500 characters)
                </p>
              </div>

              {/* Wallet Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wallet Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={isCreating}
                  className={`w-full pl-3 pr-10 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.status
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value={WALLET_STATUS.ACTIVE}>Active</option>
                  <option value={WALLET_STATUS.ARCHIVED}>Archived</option>
                  <option value={WALLET_STATUS.LOCKED}>Locked</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.status}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Set the initial status of this wallet
                </p>
              </div>
            </div>

            {/* Verification Status Section */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                Verification Status
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <label
                      htmlFor="isVerified"
                      className="font-medium text-gray-700 cursor-pointer"
                    >
                      Wallet Verification
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.isVerified
                      ? "This wallet will be marked as verified"
                      : "Mark this wallet as verified if appropriate"}
                  </p>
                </div>

                <div className="relative">
                  <label
                    htmlFor="isVerified"
                    className={`inline-flex items-center ${isCreating ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      name="isVerified"
                      id="isVerified"
                      className="sr-only"
                      checked={formData.isVerified}
                      onChange={handleInputChange}
                      disabled={isCreating}
                    />
                    <div
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData.isVerified ? "bg-green-500" : "bg-gray-300"
                      } ${isCreating ? "opacity-50" : ""}`}
                    >
                      <div
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          formData.isVerified ? "transform translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium text-gray-700 ${isCreating ? "opacity-50" : ""}`}
                    >
                      {formData.isVerified ? "Verified" : "Not Verified"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                Location Information (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={isCreating}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.country
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                      disabled={isCreating}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.region
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                      disabled={isCreating}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.city
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
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

                {/* Postal Code */}
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
                      disabled={isCreating}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.postalCode
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                      disabled={isCreating}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.addressLine1
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                      disabled={isCreating}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.addressLine2
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""}`}
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

            {/* Form Actions */}
            <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={isCreating || hasSubmitted}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  isCreating || hasSubmitted
                    ? "bg-purple-400 cursor-not-allowed text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                }`}
              >
                {isCreating ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Create Wallet
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCreating || hasSubmitted}
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
                About Admin Wallet Creation
              </h3>
              <p className="text-sm text-blue-700">
                As an administrator, you can create wallets for any user in the
                system. Make sure to:
              </p>
              <ul className="list-disc ml-4 mt-2 text-sm text-blue-700 space-y-1">
                <li>Select the appropriate user who will own this wallet</li>
                <li>
                  Choose the correct wallet type based on the user's profile
                </li>
                <li>Enter the complete wallet address</li>
                <li>
                  Only mark wallets as verified if they meet all verification
                  criteria
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <AdminFooter />

      {/* Animation styles */}
      <style jsx>{`
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

export default AdminPublicWalletCreatePage;
