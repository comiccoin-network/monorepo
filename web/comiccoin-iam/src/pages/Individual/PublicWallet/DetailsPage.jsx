// monorepo/web/comiccoin-iam/src/pages/Individual/PublicWallet/DetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Wallet,
  ArrowLeft,
  ExternalLink,
  Link as LinkIcon,
  Hash,
  Calendar,
  Eye,
  Clock,
  User,
  MapPin,
  Shield,
  Edit2,
  Trash2,
  Loader,
  AlertCircle,
  Check,
  Building,
  Phone,
  Mail,
  Globe,
  Navigation,
  Home,
  CheckCircle,
  XCircle,
  Info,
  Activity,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import UserTopNavigation from "../../../components/UserTopNavigation";
import UserFooter from "../../../components/UserFooter";
import withProfileVerification from "../../../components/withProfileVerification";
import { usePublicWallet } from "../../../hooks/usePublicWallet";

const UserPublicWalletDetailsPage = () => {
  const { address } = useParams();
  const navigate = useNavigate();

  const {
    fetchWalletByAddress,
    deletePublicWallet,
    isLoading,
    error,
    success,
    reset,
    WALLET_STATUS,
  } = usePublicWallet();

  const [wallet, setWallet] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch wallet details on component mount
  useEffect(() => {
    const loadWallet = async () => {
      if (!address) return;

      try {
        const walletData = await fetchWalletByAddress(address);
        setWallet(walletData);
      } catch (err) {
        console.error("Failed to load wallet details:", err);
        setGeneralError("Failed to load wallet details. Please try again.");
      }
    };

    loadWallet();

    return () => {
      reset(); // Cleanup on unmount
    };
  }, [address, fetchWalletByAddress, reset]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      setGeneralError(error.message || "An error occurred");
    } else {
      setGeneralError("");
    }
  }, [error]);

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePublicWallet(address);
      toast.success("Wallet deleted successfully");
      navigate("/public-wallets");
    } catch (err) {
      console.error("Failed to delete wallet:", err);
      setGeneralError("Failed to delete wallet. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Navigate to edit page
  const handleEdit = () => {
    navigate(`/public-wallet/${address}/edit`);
  };

  // Navigate back to list
  const handleBackToList = () => {
    navigate("/public-wallets");
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Get status information
  const getStatusInfo = (statusCode) => {
    switch (statusCode) {
      case WALLET_STATUS.ACTIVE:
        return {
          label: "Active",
          color: "bg-green-100 text-green-800",
          dotColor: "bg-green-500",
        };
      case WALLET_STATUS.ARCHIVED:
        return {
          label: "Archived",
          color: "bg-gray-100 text-gray-600",
          dotColor: "bg-gray-400",
        };
      case WALLET_STATUS.LOCKED:
        return {
          label: "Locked",
          color: "bg-red-100 text-red-800",
          dotColor: "bg-red-500",
        };
      default:
        return {
          label: "Unknown",
          color: "bg-gray-100 text-gray-600",
          dotColor: "bg-gray-400",
        };
    }
  };

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

  // Get formatted address
  const getFormattedAddress = (wallet) => {
    if (!wallet) return "N/A";

    const parts = [];
    if (wallet.addressLine1) parts.push(wallet.addressLine1);
    if (wallet.addressLine2) parts.push(wallet.addressLine2);

    const cityRegion = [];
    if (wallet.city) cityRegion.push(wallet.city);
    if (wallet.region) cityRegion.push(wallet.region);

    if (cityRegion.length > 0) parts.push(cityRegion.join(", "));
    if (wallet.postalCode) parts.push(wallet.postalCode);
    if (wallet.country) parts.push(wallet.country);

    return parts.length > 0 ? parts.join(", ") : "N/A";
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
        id="main-content"
        className="flex-grow container mx-auto px-4 py-8 max-w-4xl"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-900">Wallet Details</h1>
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-600 hover:text-gray-800"
            aria-label="Return to wallet list"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to List
          </button>
        </div>

        {/* Error Display */}
        {generalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{generalError}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center">
            <Loader className="h-8 w-8 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading wallet details...</p>
          </div>
        )}

        {/* Wallet Details */}
        {!isLoading && wallet && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            {/* Card Header */}
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-white/20 p-3 rounded-lg mr-4">
                    {wallet.type === 2 ? (
                      <Building className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <User className="h-6 w-6" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{wallet.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-purple-100 font-mono text-sm truncate max-w-xs">
                        {wallet.address}
                      </p>

                      {/* Verification Badge */}
                      {wallet.isVerified ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Info className="h-3 w-3 mr-1" />
                          Unverified
                        </span>
                      )}

                      {/* Wallet Type Badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {wallet.type === 2 ? (
                          <Building className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        {getWalletTypeLabel(wallet.type)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    {wallet.status !== undefined && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          getStatusInfo(wallet.status).color
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full mr-1.5 ${
                            getStatusInfo(wallet.status).dotColor
                          }`}
                        ></span>
                        {getStatusInfo(wallet.status).label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Information */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700">
                  {wallet.description || "No description provided."}
                </p>
              </div>

              {/* Tabs for different sections */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8" aria-label="Tabs">
                  {/* These would be actual tabs if we were implementing tab functionality */}
                  <div className="border-b-2 border-purple-500 py-2 px-1">
                    <span className="text-sm font-medium text-purple-600">
                      Information
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Wallet Information Section */}
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Wallet className="h-5 w-5 text-purple-600 mr-2" />
                    Wallet Information
                  </h3>

                  <div className="space-y-4">
                    {/* Address */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <LinkIcon className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Wallet Address
                          </h4>
                          <p className="mt-1 text-gray-900 font-mono break-all">
                            {wallet.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chain ID */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Hash className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Chain ID
                          </h4>
                          <p className="mt-1 text-gray-900">
                            {wallet.chainId || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        {wallet.type === 2 ? (
                          <Building className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                        ) : (
                          <User className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Wallet Type
                          </h4>
                          <p className="mt-1 text-gray-900">
                            {getWalletTypeLabel(wallet.type)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Website URL (if available) */}
                    {wallet.websiteURL && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Globe className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Website
                            </h4>
                            <a
                              href={
                                wallet.websiteURL.startsWith("http")
                                  ? wallet.websiteURL
                                  : `https://${wallet.websiteURL}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 text-blue-600 hover:text-blue-800 break-all inline-flex items-center"
                            >
                              {wallet.websiteURL}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Location Section */}
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                    Contact & Location
                  </h3>

                  <div className="space-y-4">
                    {/* Full Address */}
                    {(wallet.addressLine1 || wallet.city || wallet.country) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Home className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Address
                            </h4>
                            <p className="mt-1 text-gray-900">
                              {getFormattedAddress(wallet)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Phone (if available) */}
                    {wallet.phone && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Phone
                            </h4>
                            <p className="mt-1 text-gray-900">{wallet.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verification Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Verification Status
                          </h4>
                          <div className="mt-1 flex items-center">
                            {wallet.isVerified ? (
                              <>
                                <span className="text-green-600 font-medium flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Verified
                                </span>
                                {wallet.verifiedOn &&
                                  wallet.verifiedOn !==
                                    "0001-01-01T00:00:00Z" && (
                                    <span className="text-gray-500 text-sm ml-2">
                                      on {formatDate(wallet.verifiedOn)}
                                    </span>
                                  )}
                              </>
                            ) : (
                              <span className="text-yellow-600 font-medium flex items-center">
                                <XCircle className="h-4 w-4 mr-1" />
                                Not Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="mt-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Activity className="h-5 w-5 text-purple-600 mr-2" />
                  Activity & History
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* View Counts */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Eye className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Views
                        </h4>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-xs text-gray-500">
                              Total:
                            </span>
                            <p className="text-gray-900 font-medium">
                              {wallet.viewCount || 0}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">
                              Unique:
                            </span>
                            <p className="text-gray-900 font-medium">
                              {wallet.uniqueViewCount || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Created Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Created
                        </h4>
                        <p className="mt-1 text-gray-900">
                          {formatDate(wallet.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {wallet.createdByName || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Last Modified */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Last Modified
                        </h4>
                        <p className="mt-1 text-gray-900">
                          {formatDate(wallet.modifiedAt)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {wallet.modifiedByName || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <a
                  href={`/directory/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Page
                </a>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center justify-center bg-blue-50 border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Wallet
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="inline-flex items-center justify-center bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Wallet Found */}
        {!isLoading && !wallet && !generalError && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Wallet Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find a wallet with the address: {address}
            </p>
            <button
              onClick={handleBackToList}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Wallet List
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the wallet{" "}
                <span className="font-semibold">{wallet?.name}</span>? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Wallet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <UserFooter />
    </div>
  );
};

export default withProfileVerification(UserPublicWalletDetailsPage);
