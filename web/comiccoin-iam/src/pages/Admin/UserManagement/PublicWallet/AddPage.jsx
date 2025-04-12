// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/PublicWallet/AddPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
import {
  Wallet,
  Save,
  ArrowLeft,
  AlertCircle,
  User,
  UserCircle,
  Check,
  Link as LinkIcon,
  Globe,
  Info,
  Loader,
  FileText,
  Copy,
  QrCode,
  Eye,
  EyeOff,
  X,
  CheckCircle,
  Hexagon,
  Hash,
  Landmark,
  Key,
  Lock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminTopNavigation from "../../../../components/AdminTopNavigation";
import AdminFooter from "../../../../components/AdminFooter";
import { usePublicWallet } from "../../../../hooks/usePublicWallet";
import { useUser } from "../../../../hooks/useUser";

const AdminAddWalletPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formCardRef = useRef(null);
  const statusRef = useRef(null);
  const { userId } = useParams();
  const userIdFromQuery = userId;

  // Hooks for API operations
  const {
    createPublicWalletByAdmin,
    isLoading: isWalletLoading,
    error: walletError,
    WALLET_STATUS,
  } = usePublicWallet();
  const { fetchUserById, isLoading: isUserLoading } = useUser();

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    userId: userIdFromQuery || "",
    status: WALLET_STATUS.ACTIVE,
    chainId: "1",
    isVerified: false, // New field for admin creation
  });

  // State for the selected user (if userId is provided)
  const [selectedUser, setSelectedUser] = useState(null);

  // State for form validation errors
  const [errors, setErrors] = useState({});

  // State for general error message
  const [generalError, setGeneralError] = useState("");

  // State for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status message state
  const [statusMessage, setStatusMessage] = useState({
    type: null, // 'success' or 'error'
    message: "",
  });

  // Combined loading state to properly disable the submit button
  const isButtonDisabled = isSubmitting || isWalletLoading;

  // Load user data if userId is provided
  useEffect(() => {
    if (userIdFromQuery) {
      const loadUserData = async () => {
        try {
          const userData = await fetchUserById(userIdFromQuery);
          if (userData) {
            setSelectedUser(userData);
          }
        } catch (err) {
          console.error("Failed to load user data:", err);
          setStatusMessage({
            type: "error",
            message:
              "Failed to load user data. You can still create a wallet without associating it with a user.",
          });
        }
      };

      loadUserData();
    }
  }, [userIdFromQuery, fetchUserById]);

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

  // Handle wallet API errors
  useEffect(() => {
    if (walletError) {
      console.error("Wallet error:", walletError);

      setGeneralError(
        walletError.message ||
          "Failed to create wallet. Please check your input and try again.",
      );

      setStatusMessage({
        type: "error",
        message:
          walletError.message ||
          "Failed to create wallet. Please check your input and try again.",
      });

      setIsSubmitting(false);

      // Set form field errors if available in the error object
      if (walletError.errors) {
        setErrors(walletError.errors);
      }
    }
  }, [walletError]);

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

  // Handle form input changes
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

    // If already submitting, prevent multiple submissions
    if (isButtonDisabled) {
      console.log(
        "Submission already in progress, preventing duplicate submission",
      );
      return;
    }

    // Basic validation
    const validationErrors = {};
    if (!formData.name) validationErrors.name = "Wallet name is required";
    if (!formData.address)
      validationErrors.address = "Wallet address is required";
    if (userIdFromQuery && !formData.userId)
      validationErrors.userId = "User ID is required for admin creation";

    // Ethereum address validation (if wallet type is ethereum)
    if (formData.walletType === "ethereum" && formData.address) {
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethAddressRegex.test(formData.address)) {
        validationErrors.address =
          "Invalid Ethereum address format. Should start with 0x followed by 40 hexadecimal characters.";
      }
    }

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

    // Set submitting flag to true immediately to prevent double submission
    setIsSubmitting(true);

    try {
      // Prepare wallet data for submission
      const walletData = {
        ...formData,
        // Convert tags from comma separated string to array
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        chainId: parseInt(formData.chainId),
      };

      console.log("Submitting wallet data:", walletData);

      // Submit wallet data
      await createPublicWalletByAdmin(walletData);

      // Show success message
      toast.success("Wallet created successfully");

      // Set success status message
      setStatusMessage({
        type: "success",
        message: "Wallet created successfully!",
      });

      // Navigate back to appropriate page
      if (userIdFromQuery) {
        // If created from user details, go back to that user's detail page
        setTimeout(() => {
          navigate(`/admin/users/${userIdFromQuery}`);
        }, 1500);
      } else {
        // Otherwise go to wallets list (or wherever appropriate)
        setTimeout(() => {
          navigate("/admin/wallets");
        }, 1500);
      }
    } catch (err) {
      // Error handling is done in the useEffect for walletError
      console.error("Failed to create wallet:", err);
      // Make sure to reset the submitting state in case the error wasn't caught by the wallet hook
      setIsSubmitting(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    // Prevent navigation during form submission
    if (isButtonDisabled) {
      return;
    }

    if (userIdFromQuery) {
      // If came from user details, go back there
      navigate(`/admin/users/${userIdFromQuery}`);
    } else {
      // Otherwise go to wallets list (or wherever appropriate)
      navigate("/admin/wallets");
    }
  };

  // Generate random wallet address (for testing/demo purposes)
  const generateRandomAddress = () => {
    // Prevent action during form submission
    if (isButtonDisabled) {
      return;
    }

    const characters = "0123456789abcdef";
    let address = "0x";
    for (let i = 0; i < 40; i++) {
      address += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    setFormData({ ...formData, address });
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
        className="flex-grow container mx-auto px-4 py-8 max-w-4xl"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-900">
            Add Public Wallet
          </h1>
          <button
            onClick={handleCancel}
            disabled={isButtonDisabled}
            className={`flex items-center text-gray-600 hover:text-gray-800 ${
              isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
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
              disabled={isButtonDisabled}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Main Form Card */}
        <div
          ref={formCardRef}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 scroll-mt-16"
        >
          {/* Card Header */}
          <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
            <Wallet className="h-6 w-6 mr-3" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-semibold">New Public Wallet</h2>
              <p className="text-sm text-purple-100">
                {selectedUser
                  ? `Create a new public wallet for ${selectedUser.firstName} ${selectedUser.lastName}`
                  : "Create a new public wallet"}
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

            {/* User Association Section (if coming from user details) */}
            {userIdFromQuery && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 text-purple-600 mr-2" />
                  Associated User
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  {isUserLoading ? (
                    <div className="flex items-center">
                      <Loader className="h-5 w-5 text-gray-400 animate-spin mr-2" />
                      <span className="text-gray-600">
                        Loading user details...
                      </span>
                    </div>
                  ) : selectedUser ? (
                    <div className="flex items-center">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center mr-3"
                        style={{
                          backgroundColor: selectedUser.isRoot
                            ? "#e9d5ff"
                            : selectedUser.isCompany
                              ? "#dbeafe"
                              : "#fef9c3",
                        }}
                      >
                        {selectedUser.isRoot ? (
                          <Check className="h-5 w-5 text-purple-700" />
                        ) : selectedUser.isCompany ? (
                          <Globe className="h-5 w-5 text-blue-700" />
                        ) : (
                          <UserCircle className="h-5 w-5 text-yellow-700" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedUser.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedUser.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          This wallet will be associated with this user's
                          account
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-700">
                      <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                      <span>User not found or unable to load user details</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wallet Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <Wallet className="h-5 w-5 text-purple-600 mr-2" />
                Wallet Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Wallet className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isButtonDisabled}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        hasError("name")
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isButtonDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      placeholder="My ComicCoin Wallet"
                      required
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Wallet Address */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Wallet Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={isButtonDisabled}
                      className={`w-full pl-10 pr-12 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm ${
                        hasError("address")
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isButtonDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      placeholder="0x0000000000000000000000000000000000000000"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => generateRandomAddress()}
                        disabled={isButtonDisabled}
                        className={`text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors ${
                          isButtonDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the public address of the wallet (e.g., ComicCoin
                    address starting with 0x)
                  </p>
                </div>

                {/* Chain ID */}
                <div>
                  <label
                    htmlFor="chainId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chain ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="chainId"
                      name="chainId"
                      value={formData.chainId}
                      onChange={handleInputChange}
                      disabled={isButtonDisabled}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                        hasError("chainId")
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } ${isButtonDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    >
                      <option value="1">ComicCoin Mainnet (1)</option>
                    </select>
                  </div>
                  {errors.chainId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.chainId}
                    </p>
                  )}
                </div>

                {/* Status (for admin creation) */}
                {userIdFromQuery && (
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Wallet Status
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        disabled={isButtonDisabled}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none ${
                          hasError("status")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } ${isButtonDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      >
                        <option value={WALLET_STATUS.ACTIVE}>Active</option>
                        <option value={WALLET_STATUS.ARCHIVED}>Archived</option>
                        <option value={WALLET_STATUS.LOCKED}>Locked</option>
                      </select>
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.status}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                Description
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wallet Description
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
                    disabled={isButtonDisabled}
                    rows={4}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      hasError("description")
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    } ${isButtonDisabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Describe the purpose or usage of this wallet..."
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Verification Section (Admin Only) */}
            {userIdFromQuery && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                  Wallet Verification
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <label
                        htmlFor="isVerified"
                        className="font-medium text-gray-700 cursor-pointer"
                      >
                        Verified Status
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Mark this wallet as verified to indicate it has been
                      reviewed and approved by ComicCoin
                    </p>
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="isVerified"
                      className={`inline-flex items-center ${isButtonDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        name="isVerified"
                        id="isVerified"
                        className="sr-only"
                        checked={formData.isVerified}
                        onChange={handleInputChange}
                        disabled={isButtonDisabled}
                      />
                      <div
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          formData.isVerified ? "bg-green-500" : "bg-gray-300"
                        } ${isButtonDisabled ? "opacity-50" : ""}`}
                      >
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            formData.isVerified ? "transform translate-x-6" : ""
                          }`}
                        ></div>
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium text-gray-700 ${isButtonDisabled ? "opacity-50" : ""}`}
                      >
                        {formData.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3 border-t border-gray-200">
              <button
                type="submit"
                disabled={isButtonDisabled}
                className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  isButtonDisabled
                    ? "bg-purple-300 cursor-not-allowed text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                }`}
                aria-disabled={isButtonDisabled}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Creating Wallet...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {userIdFromQuery
                      ? "Create Wallet as Admin"
                      : "Create Wallet"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isButtonDisabled}
                className={`px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-sm ${
                  isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-disabled={isButtonDisabled}
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
                About Public Wallets
              </h3>
              <p className="text-sm text-blue-700">
                Public wallets allow users to showcase their blockchain assets
                and transactions with customizable privacy settings. The wallet
                address is linked to the blockchain and cannot be changed once
                created. Choose an appropriate name and description to help
                users understand the purpose of this wallet.
                {userIdFromQuery && (
                  <span className="block mt-2">
                    <strong>Admin features:</strong> As an admin, you can set
                    the verification status and initial status of the wallet.
                    Verified wallets will display a verification badge to users,
                    indicating trustworthiness.
                  </span>
                )}
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

export default AdminAddWalletPage;
