// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/PublicWallet/UpdatePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
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
} from "lucide-react";
import { toast } from "react-toastify";
import UserTopNavigation from "../../../../components/UserTopNavigation";
import UserFooter from "../../../../components/UserFooter";
import withProfileVerification from "../../../../components/withProfileVerification";
import { usePublicWallet } from "../../../../hooks/usePublicWallet";

const AdminUserPublicWalletUpdatePage = () => {
  const { userId, address } = useParams();
  const navigate = useNavigate();
  const {
    fetchWalletByAddress,
    updatePublicWallet,
    isLoading: isLoadingOperation,
    error: operationError,
    reset,
    WALLET_STATUS,
  } = usePublicWallet();

  // Create ref for form card to scroll to on error
  const formCardRef = useRef(null);

  // State for tracking whether we've submitted the form
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // State for general error message
  const [generalError, setGeneralError] = useState("");

  // State for wallet loading and updating
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    address: "",
    chainId: 1,
    name: "",
    description: "",
    thumbnailS3Key: "",
    status: 1, // Default to active
    type: 3, // Default to individual
    websiteURL: "", // Added website URL
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

  // Get wallet type label
  const getWalletTypeLabel = (typeCode) => {
    switch (typeCode) {
      case 2:
        return "Business/Retailer";
      case 3:
        return "Individual";
      default:
        return "Unknown";
    }
  };

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
          });
        } else {
          console.warn("No wallet data found");
          setGeneralError("Wallet not found");
          navigate(`/admin/users/${userId}`);
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

    // Set flag to indicate we've submitted the form
    setHasSubmitted(true);
    setIsUpdating(true);

    try {
      console.log("Updating wallet with address:", address);
      console.log("Form data:", formData);

      // Make sure the address is included in the data we're sending
      const dataToUpdate = {
        ...formData,
        address: address, // Ensure address is explicitly included
      };

      // Use the updatePublicWallet function from the usePublicWallet hook
      const response = await updatePublicWallet(address, dataToUpdate);
      console.log("Update response:", response);

      toast.success("Wallet updated successfully");
      navigate(`/admin/users/${userId}`);
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
      setIsUpdating(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate(`/admin/users/${userId}`);
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

      <UserTopNavigation />

      <main
        userId="main-content"
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

        {/* Loading State */}
        {isLoadingWallet && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 flex flex-col items-center justify-center">
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
                  {formData.type === 2 ? (
                    <Building className="h-4 w-4 mr-1" />
                  ) : (
                    <User className="h-4 w-4 mr-1" />
                  )}
                  {getWalletTypeLabel(formData.type)} Wallet
                </h3>
                <p className="text-sm text-purple-700">
                  {formData.type === 2
                    ? "This is a business wallet associated with your Comic Book Store. Updates will be visible to other users on the ComicCoin network."
                    : "This is a personal wallet associated with your individual profile. Updates will be visible to other users on the ComicCoin network."}
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
              {formData.type === 2 ? (
                <Building className="h-6 w-6 mr-3" aria-hidden="true" />
              ) : (
                <Wallet className="h-6 w-6 mr-3" aria-hidden="true" />
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  Edit Wallet Information
                </h2>
                <p className="text-sm text-purple-100">
                  Update the profile for your ComicCoin wallet
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

              {/* Wallet Address (read-only since it's the ID) */}
              <div>
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
                    userId="address"
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
              <div>
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
                    userId="chainId"
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
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wallet Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {formData.type === 2 ? (
                      <Building className="h-5 w-5 text-gray-400" />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    userId="type"
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
              <div>
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
                    userId="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder={
                      formData.type === 2
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
              <div>
                <label
                  htmlFor="websiteURL"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Website URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    userId="websiteURL"
                    name="websiteURL"
                    value={formData.websiteURL || ""}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.websiteURL
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
                <p className="mt-1 text-xs text-gray-500">
                  {formData.type === 2
                    ? "Your business website URL"
                    : "Your personal website or online profile URL"}
                </p>
              </div>

              {/* Description */}
              <div>
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
                    userId="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.description
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
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
                  userId="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full pl-3 pr-10 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.status
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <option value={1}>Active</option>
                  <option value={2}>Archived</option>
                  <option value={3}>Locked</option>
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
                Changes to your public wallet will be visible to others
                immediately. Consider archiving wallets instead of deleting them
                if you want to preserve your transaction history but don't want
                the wallet to appear prominently in your profile.
              </p>
            </div>
          </div>
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

export default withProfileVerification(AdminUserPublicWalletUpdatePage);
