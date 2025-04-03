// src/pages/PublicWallet/DetailsPage.jsx
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
} from "lucide-react";
import { toast } from "react-toastify";
import AppTopNavigation from "../../components/AppTopNavigation";
import AppFooter from "../../components/AppFooter";
import withProfileVerification from "../../components/withProfileVerification";
import { usePublicWallet } from "../../hooks/usePublicWallet";

const PublicWalletDetailsPage = () => {
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
    if (!dateString) return "N/A";
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
                    <Wallet className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{wallet.name}</h2>
                    <p className="text-purple-100 font-mono mt-1">
                      {wallet.address}
                    </p>
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

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                {/* Created Date */}
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
                    </div>
                  </div>
                </div>

                {/* Created By */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Created By
                      </h4>
                      <p className="mt-1 text-gray-900">
                        {wallet.createdByName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Views */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Eye className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        View Count
                      </h4>
                      <p className="mt-1 text-gray-900">
                        {wallet.viewCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* IP Address (if available) */}
                {wallet.createdFromIPAddress && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Created From
                        </h4>
                        <p className="mt-1 text-gray-900">
                          {wallet.createdFromIPAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modified By (if available) */}
                {wallet.modifiedByName && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Modified By
                        </h4>
                        <p className="mt-1 text-gray-900">
                          {wallet.modifiedByName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <a
                  href={`/public/${wallet.address}`}
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

      <AppFooter />
    </div>
  );
};

export default withProfileVerification(PublicWalletDetailsPage);
