// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/PublicWallet/DeletePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  Trash2,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader,
  X,
  Check,
  Copy,
  Shield,
  Building,
  UserCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminTopNavigation from "../../../../components/AdminTopNavigation";
import AdminFooter from "../../../../components/AdminFooter";
import withProfileVerification from "../../../../components/withProfileVerification";
import { usePublicWallet } from "../../../../hooks/usePublicWallet";
import axiosClient from "../../../../api/axiosClient";

const AdminUserPublicWalletDeletePage = () => {
  const { userId, address } = useParams();
  const navigate = useNavigate();
  const statusRef = useRef(null);
  const queryClient = useQueryClient(); // Get the query client instance

  const {
    fetchWalletByAddress,
    isLoading: isLoadingOperation,
    error: operationError,
    reset,
    WALLET_TYPE,
  } = usePublicWallet();

  // State for the wallet being deleted
  const [wallet, setWallet] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Status message state
  const [statusMessage, setStatusMessage] = useState({
    type: null, // 'success' or 'error'
    message: "",
  });

  // Reset state on component mount
  useEffect(() => {
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
        setGeneralError("Wallet address is required");
        setIsLoadingWallet(false);
        return;
      }

      setIsLoadingWallet(true);
      try {
        console.log("Fetching wallet data for address:", address);
        const walletData = await fetchWalletByAddress(address);
        console.log("Wallet data received:", walletData);

        if (walletData) {
          setWallet(walletData);
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

  // Handle API errors
  useEffect(() => {
    if (operationError) {
      console.error("Error detected:", operationError);
      setGeneralError(
        operationError.message || "An error occurred. Please try again.",
      );

      setStatusMessage({
        type: "error",
        message:
          operationError.message ||
          "Failed to delete wallet. Please try again.",
      });

      setIsDeleting(false);
    }
  }, [operationError]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Copy address to clipboard
  const copyAddress = (addr) => {
    navigator.clipboard
      .writeText(addr)
      .then(() => {
        setStatusMessage({
          type: "success",
          message: "Address copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Failed to copy address:", err);
      });
  };

  // Get wallet type icon and label
  const getWalletTypeInfo = (typeCode) => {
    switch (typeCode) {
      case 2:
        return {
          icon: <Building className="h-5 w-5 text-blue-600 mr-2" />,
          label: "Business/Retailer",
        };
      case 3:
      default:
        return {
          icon: <UserCircle className="h-5 w-5 text-yellow-600 mr-2" />,
          label: "Individual",
        };
    }
  };

  const handleCancel = () => {
    if (userId) {
      navigate(`/admin/users/${userId}`);
    } else {
      navigate("/admin/wallets");
    }
  };

  const handleShowConfirmation = () => {
    setShowConfirmation(true);
  };

  // Direct delete implementation to avoid hooks-in-hooks issue
  const deleteWallet = async (walletAddress) => {
    if (!walletAddress) {
      throw new Error("Address is required to delete a wallet");
    }

    try {
      // Use direct axios call instead of the hook
      await axiosClient.delete(`/public-wallets/${walletAddress}`);
      return true;
    } catch (error) {
      console.error("Error deleting wallet:", error);
      throw error;
    }
  };

  // Function to invalidate all wallet-related queries
  const invalidateWalletQueries = () => {
    console.log("Invalidating wallet-related queries");

    // First, try to use the more specific predicate approach
    try {
      // This approach is safer as it only invalidates relevant queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;

          // Check if the query is related to wallets
          if (Array.isArray(queryKey)) {
            // Check if the first item in the query key is 'publicWallets' or 'wallets'
            if (queryKey[0] === "publicWallets" || queryKey[0] === "wallets") {
              return true;
            }

            // Check if it's a user query that might contain wallet info
            if (queryKey[0] === "user" && queryKey[1] === userId) {
              return true;
            }
          }

          return false;
        },
      });

      console.log("Successfully invalidated queries using predicate");
    } catch (err) {
      console.warn(
        "Error using predicate invalidation, falling back to direct invalidation",
        err,
      );

      // Fallback to direct invalidation
      try {
        queryClient.invalidateQueries("publicWallets");
        queryClient.invalidateQueries("wallets");
        if (userId) {
          queryClient.invalidateQueries(["user", userId]);
        }
        console.log("Successfully invalidated queries directly");
      } catch (err2) {
        console.error("Failed to invalidate queries", err2);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!wallet || !address) return;

    // Check if confirmation text is correct
    if (confirmText.toLowerCase() !== "delete") {
      setStatusMessage({
        type: "error",
        message: 'Please type "delete" to confirm',
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Delete the wallet using the direct method
      await deleteWallet(address);

      // Invalidate all wallet-related queries to update the UI
      invalidateWalletQueries();

      toast.success("Wallet deleted successfully");
      setStatusMessage({
        type: "success",
        message: "Wallet deleted successfully!",
      });

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        if (userId) {
          navigate(`/admin/users/${userId}`);
        } else {
          navigate("/admin/wallets");
        }
      }, 1500);
    } catch (err) {
      console.error("Delete error:", err);
      setGeneralError(
        err.message || "Failed to delete wallet. Please try again.",
      );
      setStatusMessage({
        type: "error",
        message: err.message || "Failed to delete wallet. Please try again.",
      });
      setIsDeleting(false);
      setShowConfirmation(false);
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
        className="flex-grow container mx-auto px-4 py-8 max-w-3xl"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-900">
            Delete Public Wallet
          </h1>
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-800"
            aria-label="Cancel and go back"
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
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 flex flex-col items-center justify-center">
            <Loader className="h-8 w-8 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading wallet details...</p>
          </div>
        )}

        {/* Error State */}
        {generalError && !isLoadingWallet && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{generalError}</p>
            </div>
            <button
              onClick={handleCancel}
              className="mt-4 bg-white text-red-700 border border-red-300 rounded-lg px-4 py-2 hover:bg-red-50"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Main Content */}
        {!isLoadingWallet && wallet && (
          <div className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
                <h2 className="text-xl font-bold text-red-700 mb-2">
                  Delete Public Wallet
                </h2>
                <p className="text-red-700 max-w-lg mx-auto">
                  You are about to permanently delete the public wallet "
                  {wallet.name}". This action cannot be undone and all
                  associated data will be lost.
                </p>
              </div>
            </div>

            {/* Wallet Info Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-5 bg-gradient-to-r from-red-600 to-red-800 text-white flex items-center">
                <Wallet className="h-6 w-6 mr-3" aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-semibold">Wallet Details</h2>
                  <p className="text-sm text-red-100">
                    Review the wallet information before deletion
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Wallet Name
                    </p>
                    <p className="text-gray-900 font-semibold">{wallet.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Wallet Type
                    </p>
                    <div className="flex items-center">
                      {getWalletTypeInfo(wallet.type).icon}
                      <span>{getWalletTypeInfo(wallet.type).label}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">
                      Wallet Address
                    </p>
                    <div className="flex items-center">
                      <p className="text-gray-900 font-mono text-sm break-all mr-2">
                        {wallet.address}
                      </p>
                      <button
                        onClick={() => copyAddress(wallet.address)}
                        className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                        aria-label="Copy address"
                        title="Copy address"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {wallet.description && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">
                        Description
                      </p>
                      <p className="text-gray-700">{wallet.description}</p>
                    </div>
                  )}

                  {wallet.createdAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Created At
                      </p>
                      <p className="text-gray-900">
                        {formatDate(wallet.createdAt)}
                      </p>
                    </div>
                  )}

                  {wallet.updatedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Last Updated
                      </p>
                      <p className="text-gray-900">
                        {formatDate(wallet.updatedAt)}
                      </p>
                    </div>
                  )}

                  {wallet.chainId && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Chain ID
                      </p>
                      <p className="text-gray-900">{wallet.chainId}</p>
                    </div>
                  )}

                  {wallet.viewCount !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        View Count
                      </p>
                      <p className="text-gray-900">{wallet.viewCount}</p>
                    </div>
                  )}
                </div>

                {/* What Gets Deleted Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    What will be deleted:
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        The public wallet profile and all associated metadata
                      </span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Any links or references to this wallet from the user's
                        profile
                      </span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Public access to view this wallet's information
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Info className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Note:</strong> This only deletes the public
                        wallet profile. The actual blockchain wallet and its
                        transactions will remain on the blockchain.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Confirmation Flow */}
                {!showConfirmation ? (
                  <div className="pt-6 flex justify-between border-t border-gray-200">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleShowConfirmation}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete Wallet
                    </button>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        To confirm deletion, type <strong>delete</strong> in the
                        field below
                      </p>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="confirmText"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirmation
                      </label>
                      <input
                        type="text"
                        id="confirmText"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder='Type "delete" to confirm'
                      />
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setShowConfirmation(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                        disabled={isDeleting}
                      >
                        Go Back
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        disabled={
                          confirmText.toLowerCase() !== "delete" || isDeleting
                        }
                        className={`px-6 py-2 rounded-lg text-white flex items-center
                          ${
                            confirmText.toLowerCase() === "delete" &&
                            !isDeleting
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-red-300 cursor-not-allowed"
                          }
                        `}
                      >
                        {isDeleting ? (
                          <>
                            <Loader className="h-5 w-5 animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-5 w-5 mr-2" />
                            Permanently Delete Wallet
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">
                    About Wallet Deletion
                  </h3>
                  <p className="text-sm text-blue-700">
                    Deleting a public wallet profile removes it from the
                    ComicCoin platform but does not affect the actual blockchain
                    wallet or its transactions. Users will no longer be able to
                    view this wallet's public profile, and all references to it
                    will be removed from the user's account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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

// Make sure we wrap with the withProfileVerification HOC
export default withProfileVerification(AdminUserPublicWalletDeletePage);
