// web/comiccoin-iam/src/pages/Admin/PublicWallet/UpdatePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
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
  Clock,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  Globe,
  MapPin,
  Home,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminTopNavigation from "../../../components/AdminTopNavigation";
import AdminFooter from "../../../components/AdminFooter";
import {
  usePublicWallet,
  WALLET_STATUS,
  WALLET_TYPE,
} from "../../../hooks/usePublicWallet";

const AdminPublicWalletUpdatePage = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    fetchWalletByAddress,
    updatePublicWallet,
    isLoading: isLoadingOperation,
    error: operationError,
    reset,
  } = usePublicWallet();

  // Create ref for form card to scroll to on error
  const formCardRef = useRef(null);
  const statusRef = useRef(null);

  // State for tracking whether we've submitted the form
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // State for general error message
  const [generalError, setGeneralError] = useState("");

  // State for wallet loading and updating
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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
    status: 1, // Default to active
    type: 3, // Default to individual
    websiteURL: "", // Website URL
    isVerified: false, // Verification status
    country: "",
    region: "",
    city: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
  });

  // Combine loading states
  const isLoading = isLoadingOperation || isUpdating || isLoadingWallet;
  const error = operationError;

  // Reset state on component mount
  useEffect(() => {
    console.log("Component mounted, resetting states");
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Fetch wallet data on component mount
  useEffect(() => {
    const loadWalletData = async () => {
      if (!address) {
        console.error("No address provided in URL parameters");
        return;
      }

      setIsLoadingWallet(true);
      try {
        console.log("Fetching wallet data for address:", address);
        const walletData = await fetchWalletByAddress(address);
        console.log("Wallet data received:", walletData);

        if (walletData) {
          setFormData({
            address: walletData.address || "",
            chainId: walletData.chainId || 1,
            name: walletData.name || "",
            description: walletData.description || "",
            thumbnailS3Key: walletData.thumbnailS3Key || "",
            status: walletData.status || 1,
            type: walletData.type || 3,
            websiteURL: walletData.websiteURL || "",
            viewCount: walletData.viewCount || 0,
            isVerified: walletData.isVerified || false,
            verifiedOn: walletData.verifiedOn || null,
            country: walletData.country || "",
            region: walletData.region || "",
            city: walletData.city || "",
            postalCode: walletData.postalCode || "",
            addressLine1: walletData.addressLine1 || "",
            addressLine2: walletData.addressLine2 || "",
          });
        } else {
          console.warn("No wallet data found");
          setGeneralError("Wallet not found");
          navigate("/admin/public-wallets");
        }
      } catch (err) {
        console.error("Failed to load wallet:", err);
        setGeneralError("Failed to load wallet details. Please try again.");
      } finally {
        setIsLoadingWallet(false);
      }
    };

    loadWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, fetchWalletByAddress]);

  // Handle API errors when they occur
  useEffect(() => {
    if (error) {
      console.error("Error detected:", error);
      setGeneralError(
        "Failed to update wallet. Please check your input and try again.",
      );

      // Check for response data with field validation errors
      if (error.response && error.response.data) {
        console.log("Response data:", error.response.data);

        // Handle object with field validation errors
        if (
          typeof error.response.data === "object" &&
          !Array.isArray(error.response.data)
        ) {
          // Set field-specific errors
          const fieldErrors = {};

          // Extract field errors
          Object.entries(error.response.data).forEach(([field, message]) => {
            fieldErrors[field] = message;
          });

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "N/A";
    return new Date(dateString).toLocaleString();
  };

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

    // If toggling isVerified to true, set the verified date to now
    if (name === "isVerified" && newValue === true && !formData.isVerified) {
      setFormData((prev) => ({
        ...prev,
        verifiedOn: new Date().toISOString(),
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    // Clear any previous errors
    setErrors({});
    setGeneralError("");

    // Basic validation
    const validationErrors = {};
    if (!formData.name) validationErrors.name = "Wallet name is required";
    if (!formData.address)
      validationErrors.address = "Wallet address is required";

    // If validation errors, set them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

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

    // Set updating state to true to show loading indicators and disable buttons
    setIsUpdating(true);
    setHasSubmitted(true);

    try {
      console.log("Updating wallet with address:", address);
      console.log("Form data:", formData);

      // Create a modified payload to match the API requirements
      const apiPayload = {
        address: formData.address,
        chain_id: parseInt(formData.chainId),
        name: formData.name,
        description: formData.description,
        thumbnail_s3_key: formData.thumbnailS3Key || "",
        view_count: formData.viewCount || 0,
        website_url: formData.websiteURL || "",
        status: parseInt(formData.status),
        type: parseInt(formData.type),
        is_verified: formData.isVerified,
        verified_on: formData.isVerified
          ? formData.verifiedOn || new Date().toISOString()
          : null,
        country: formData.country || "",
        region: formData.region || "",
        city: formData.city || "",
        postal_code: formData.postalCode || "",
        address_line1: formData.addressLine1 || "",
        address_line2: formData.addressLine2 || "",
      };

      console.log("API payload:", apiPayload);

      // Update the wallet using the hook
      await updatePublicWallet(address, apiPayload);

      // Invalidate and refetch queries related to public wallets
      queryClient.invalidateQueries(["publicWallets"]);
      queryClient.invalidateQueries(["wallets"]);

      // Show success message
      toast.success("Wallet updated successfully");

      setStatusMessage({
        type: "success",
        message: "Wallet updated successfully!",
      });

      // Navigate back to wallet details page after a short delay
      setTimeout(() => {
        navigate(`/admin/public-wallets/${address}`);
      }, 1500);
    } catch (err) {
      // Log the error for debugging
      console.error("Form submission error:", err);
      setHasSubmitted(false); // Reset submitted state on error

      // Set a fallback error message
      setGeneralError(
        "Failed to update wallet. Please check your input and try again.",
      );

      // Try to extract error information
      if (err.response && err.response.data) {
        console.log("Response data:", err.response.data);

        // Handle field validation errors
        if (
          typeof err.response.data === "object" &&
          !Array.isArray(err.response.data)
        ) {
          // Set field-specific errors
          const fieldErrors = {};

          // Extract field errors
          Object.entries(err.response.data).forEach(([field, message]) => {
            fieldErrors[field] = message;
          });

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }
        }
        // Handle string error
        else if (typeof err.response.data === "string") {
          setGeneralError(err.response.data);
        }
        // Handle error object with message
        else if (err.response.data.error) {
          setErrors({ address: err.response.data.error });
          setGeneralError(err.response.data.error);
        } else if (err.response.data.message) {
          setGeneralError(err.response.data.message);
        }
      } else if (err.message) {
        setGeneralError(err.message);
      }
    } finally {
      // Reset the updating state
      setIsUpdating(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate(`/admin/public-wallets/${address}`);
  };

  // Utility to check if a field has an error
  const hasError = (field) => Boolean(errors[field]);

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
            Edit Public Wallet
          </h1>
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800"
            aria-label="Return to wallet details"
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
        {isLoadingWallet && (
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center">
            <Loader className="h-8 w-8 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading wallet details...</p>
          </div>
        )}

        {/* Wallet Type Indicator */}
        {!isLoadingWallet && formData.type && (
          <div className="mb-6 p-4 rounded-lg bg-purple-50 border border-purple-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-purple-800 mb-1 flex items-center">
                  {formData.type === WALLET_TYPE.COMPANY ? (
                    <Building className="h-4 w-4 mr-1" />
                  ) : (
                    <User className="h-4 w-4 mr-1" />
                  )}
                  {getWalletTypeLabel(formData.type)} Wallet
                </h3>
                <p className="text-sm text-purple-700">
                  {formData.type === WALLET_TYPE.COMPANY
                    ? "This is a business wallet associated with a Comic Book Store. Updates will be visible to other users on the ComicCoin network."
                    : "This is a personal wallet associated with an individual profile. Updates will be visible to other users on the ComicCoin network."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        {!isLoadingWallet && (
          <div
            ref={formCardRef}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            {/* Card Header */}
            <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
              {formData.type === WALLET_TYPE.COMPANY ? (
                <Building className="h-6 w-6 mr-3" aria-hidden="true" />
              ) : (
                <Wallet className="h-6 w-6 mr-3" aria-hidden="true" />
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  Edit Wallet Information
                </h2>
                <p className="text-sm text-purple-100">
                  Update the profile for this ComicCoin wallet
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
                        ? "This wallet is marked as verified, increasing user trust"
                        : "Mark this wallet as verified to increase user trust"}
                    </p>
                    {formData.verifiedOn && formData.isVerified && (
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          Verified on: {formatDate(formData.verifiedOn)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="isVerified"
                      className={`inline-flex items-center ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        name="isVerified"
                        id="isVerified"
                        className="sr-only"
                        checked={formData.isVerified}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <div
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          formData.isVerified ? "bg-green-500" : "bg-gray-300"
                        } ${isLoading ? "opacity-50" : ""}`}
                      >
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            formData.isVerified ? "transform translate-x-6" : ""
                          }`}
                        ></div>
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium text-gray-700 ${isLoading ? "opacity-50" : ""}`}
                      >
                        {formData.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Basic Information Section */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                  <Wallet className="h-5 w-5 text-purple-600 mr-2" />
                  Basic Information
                </h3>

                {/* Wallet Address (read-only since it's the ID) */}
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
                      readOnly
                      className="w-full pl-10 pr-3 py-2 h-10 border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Wallet address cannot be changed
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
                  {errors.chainId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.chainId}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Fixed to ComicCoin Mainnet (Chain ID: 1)
                  </p>
                </div>

                {/* Wallet Type (read-only) */}
                <div className="mb-4">
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Wallet Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {formData.type === WALLET_TYPE.COMPANY ? (
                        <Building className="h-5 w-5 text-gray-400" />
                      ) : (
                        <User className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      id="type"
                      name="type"
                      value={getWalletTypeLabel(formData.type)}
                      readOnly
                      className="w-full pl-10 pr-3 py-2 h-10 border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Wallet type cannot be changed
                  </p>
                </div>

                {/* Wallet Name */}
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Wallet Name <span className="text-red-500">*</span>
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
                      disabled={isLoading}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.name
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      placeholder={
                        formData.type === WALLET_TYPE.COMPANY
                          ? "Business Wallet Name"
                          : "My Personal Wallet"
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
                      value={formData.websiteURL || ""}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.websiteURL
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                      disabled={isLoading}
                      rows={4}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.description
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                    disabled={isLoading}
                    className={`w-full pl-3 pr-10 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.status
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                    Set the current status of this wallet
                  </p>
                </div>
              </div>

              {/* Location Information Section */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                  Location Information
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
                        value={formData.country || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.country
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                        value={formData.region || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.region
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                        value={formData.city || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.city
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                        value={formData.postalCode || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.postalCode
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                        value={formData.addressLine1 || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.addressLine1
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                        value={formData.addressLine2 || ""}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.addressLine2
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
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
                  disabled={isLoading}
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    isLoading
                      ? "bg-purple-400 cursor-not-allowed text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  }`}
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
                Public Wallet Settings
              </h3>
              <p className="text-sm text-blue-700">
                Changes to this public wallet will be visible to others
                immediately. The verification badge helps users identify trusted
                wallets and increases confidence in transactions. As an
                administrator, you have the ability to mark wallets as verified
                and change their status.
              </p>
            </div>
          </div>
        </div>
      </main>

      <AdminFooter />

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

export default AdminPublicWalletUpdatePage;
