// src/pages/PublicWallet/AddPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Wallet,
  Save,
  ArrowLeft,
  AlertCircle,
  Link as LinkIcon,
  Hash,
  Info,
  Type,
  FileText,
  Activity,
  Loader,
} from "lucide-react";
import { toast } from "react-toastify";
import AppTopNavigation from "../../components/AppTopNavigation";
import AppFooter from "../../components/AppFooter";
import withProfileVerification from "../../components/withProfileVerification";
import { usePublicWallet } from "../../hooks/usePublicWallet";

const PublicWalletAddPage = () => {
  const navigate = useNavigate();
  const { createPublicWallet, isLoading, error, success, reset } =
    usePublicWallet();

  // State for general error message
  const [generalError, setGeneralError] = useState("");

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    address: "",
    chainId: 1, // Default to ComicCoin Mainnet
    name: "",
    description: "",
    thumbnailS3Key: "",
  });

  // Create ref for form card to scroll to on error
  const formCardRef = useRef(null);

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

  // Reset state when navigating away
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Handle API errors when they occur
  useEffect(() => {
    if (error) {
      console.log("Error detected:", error);

      // Set a general error message for display in the UI
      setGeneralError(
        "Failed to create wallet. Please check your input and try again.",
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
        if (error.message.includes("hex string has length 0, want 40")) {
          setGeneralError(
            "Please enter a valid ComicCoin address (40 characters starting with 0x)",
          );
          setErrors((prev) => ({
            ...prev,
            address: "Invalid ComicCoin address format",
          }));
        } else {
          setGeneralError(error.message);
        }
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

  // Handle successful creation
  useEffect(() => {
    if (success) {
      toast.success("Wallet created successfully");
      navigate("/wallets");
    }
  }, [success, navigate]);

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

    // Clear any previous errors
    setErrors({});
    setGeneralError("");

    try {
      await createPublicWallet(formData);
      // Success is handled by the useEffect
    } catch (err) {
      // Log the error for debugging
      console.error("Form submission error:", err);

      // Set a fallback error message
      setGeneralError(
        "Failed to create wallet. Please check your input and try again.",
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
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate("/wallets");
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

      <AppTopNavigation />

      <main
        id="main-content"
        className="flex-grow container mx-auto px-4 py-8 max-w-3xl"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-900">
            Add New Public Wallet
          </h1>
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800"
            aria-label="Return to wallet list"
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
            <Wallet className="h-6 w-6 mr-3" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-semibold">Wallet Information</h2>
              <p className="text-sm text-purple-100">
                Create a public profile for your ComicCoin wallet
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

            {/* Wallet Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ComicCoin Address <span className="text-red-500">*</span>
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
                  className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.address
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
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
                Enter your complete ComicCoin wallet address, starting with 0x
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
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="My Primary Wallet"
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
                  id="description"
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

            {/* Thumbnail S3 Key field is hidden from users */}

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
                    Create Wallet
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
                Public Wallet Information
              </h3>
              <p className="text-sm text-blue-700">
                Creating a public wallet allows you to share your wallet details
                with others and build your reputation on our platform. Public
                wallets are displayed on your profile and can be used to receive
                payments, showcase NFTs, and demonstrate your blockchain
                activity.
              </p>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default withProfileVerification(PublicWalletAddPage);
