// monorepo/web/comiccoin-iam/src/pages/Individual/PublicWallet/ListPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Wallet,
  Plus,
  Eye,
  ArrowRight,
  ExternalLink,
  Grid,
  List,
  Loader,
  Trash2,
  Edit,
  Share2,
  UserCheck,
  Copy,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import UserTopNavigation from "../../../components/UserTopNavigation";
import UserFooter from "../../../components/UserFooter";
import withProfileVerification from "../../../components/withProfileVerification";
import {
  usePublicWallet,
  usePublicWalletList,
} from "../../../hooks/usePublicWallet";
import { QRCodeSVG } from "qrcode.react";

const UserPublicWalletListPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Simple notification function UI State
  const [notification, setNotification] = useState(null);

  // Simple notification function
  const showNotification = (message) => {
    setNotification(message);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Setup API request
  const [filters, setFilters] = useState({
    limit: 100, // We'll handle pagination client-side for better UX
  });

  // Use our custom hooks
  const {
    wallets,
    isLoading,
    error,
    refetch: refetchWallets,
  } = usePublicWalletList(filters);

  const {
    deletePublicWallet,
    isLoading: isOperationLoading,
    error: operationError,
    WALLET_STATUS,
  } = usePublicWallet();

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast.error(
        `Error fetching wallets: ${error.message || "Unknown error"}`,
      );
    }
    if (operationError) {
      toast.error(
        `Operation failed: ${operationError.message || "Unknown error"}`,
      );
    }
  }, [error, operationError]);

  // Navigate to add wallet page
  const handleAddWallet = () => {
    navigate("/public-wallets/add");
  };

  // Navigate to wallet detail page
  const handleViewWallet = (address) => {
    navigate(`/public-wallet/${address}`);
  };

  // Handle edit wallet
  const handleEditWallet = (address) => {
    navigate(`/public-wallet/${address}/edit`);
  };

  // Show delete confirmation
  const handleDeleteClick = (wallet) => {
    setSelectedWallet(wallet);
    setShowDeleteConfirm(true);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedWallet(null);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedWallet) return;

    try {
      await deletePublicWallet(selectedWallet.address);
      toast.success("Wallet deleted successfully");
      setShowDeleteConfirm(false);
      setSelectedWallet(null);
      refetchWallets();
    } catch (err) {
      // Error is already handled by the hook and shown in toast
    }
  };

  // Copy wallet address to clipboard with simple notification.
  const copyAddress = (address) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        showNotification("Address copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy address:", err);
      });
  };

  // Share wallet functionality with simple notification.
  const handleShareWallet = (address) => {
    const publicUrl = `${window.location.origin}/public/${address}`;
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        showNotification("Public wallet link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  // Get the wallet status label
  const getStatusLabel = (statusCode) => {
    switch (statusCode) {
      case WALLET_STATUS.ACTIVE:
        return "Active";
      case WALLET_STATUS.ARCHIVED:
        return "Archived";
      case WALLET_STATUS.LOCKED:
        return "Locked";
      default:
        return "Unknown";
    }
  };

  // Get the wallet status class
  const getStatusClass = (statusCode) => {
    switch (statusCode) {
      case WALLET_STATUS.ACTIVE:
        return "bg-green-100 text-green-800";
      case WALLET_STATUS.ARCHIVED:
        return "bg-gray-100 text-gray-600";
      case WALLET_STATUS.LOCKED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Get the wallet status dot class
  const getStatusDotClass = (statusCode) => {
    switch (statusCode) {
      case WALLET_STATUS.ACTIVE:
        return "bg-green-500";
      case WALLET_STATUS.ARCHIVED:
        return "bg-gray-400";
      case WALLET_STATUS.LOCKED:
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWallets = wallets
    ? wallets.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = wallets ? Math.ceil(wallets.length / itemsPerPage) : 0;

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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

      <UserTopNavigation />

      {/* Simple Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {notification}
        </div>
      )}

      <main
        id="main-content"
        className="flex-grow container mx-auto px-4 py-8 max-w-6xl"
      >
        {/* Page Header with Gradient Background */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
                <Wallet className="h-6 w-6 mr-2" aria-hidden="true" />
                My Public Wallets
              </h1>
              <p className="text-indigo-100">
                Manage and share your public wallet profiles on the blockchain
              </p>
            </div>
            <div>
              <button
                onClick={handleAddWallet}
                className="w-full md:w-auto bg-white text-purple-700 hover:bg-indigo-50 px-6 py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 font-semibold"
                aria-label="Add new public wallet"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                <span>Create New Wallet</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Results Count */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="text-gray-600 text-sm">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Loading wallets...
              </div>
            ) : (
              <>
                Showing{" "}
                <span className="font-medium">{wallets?.length || 0}</span>{" "}
                wallet{wallets?.length !== 1 ? "s" : ""}
              </>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-purple-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-purple-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader className="h-10 w-10 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading your wallets...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Error Loading Wallets
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {error.message ||
                "There was a problem loading your wallets. Please try again."}
            </p>
            <button
              onClick={() => refetchWallets()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Grid View - Dashboard Style */}
        {!isLoading && !error && viewMode === "grid" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {currentWallets && currentWallets.length > 0 ? (
              currentWallets.map((wallet) => (
                <div
                  key={wallet.address}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg"
                >
                  {/* Card Header with Status */}
                  <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
                    <h3 className="font-bold truncate">{wallet.name}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(wallet.status)}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full mr-1.5 ${getStatusDotClass(wallet.status)}`}
                      ></span>
                      {getStatusLabel(wallet.status)}
                    </span>
                  </div>

                  {/* Card Body with QR Code and Info */}
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* QR Code */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
                          <QRCodeSVG
                            value={wallet.address}
                            size={120}
                            level="H"
                            imageSettings={{
                              src: "/logo192.png",
                              height: 24,
                              width: 24,
                              excavate: true,
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          Scan to view
                        </div>
                      </div>

                      {/* Wallet Details */}
                      <div className="flex-grow space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Address
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                              {formatAddress(wallet.address)}
                            </code>
                            <button
                              onClick={() => copyAddress(wallet.address)}
                              className="p-1 text-gray-500 hover:text-purple-600"
                              aria-label="Copy address"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {wallet.description && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Description
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                              {wallet.description}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-4 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">Total Views</p>
                            <div className="flex items-center gap-1 text-blue-600">
                              <Eye className="h-4 w-4" />
                              <span className="font-bold">
                                {wallet.viewCount || 0}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Unique Views
                            </p>
                            <div className="flex items-center gap-1 text-amber-600">
                              <UserCheck className="h-4 w-4" />
                              <span className="font-bold">
                                {wallet.uniqueViewCount || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex mt-5 pt-4 border-t border-gray-100 justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditWallet(wallet.address)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          aria-label="Edit wallet"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleShareWallet(wallet.address)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          aria-label="Share wallet"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(wallet)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          aria-label="Delete wallet"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleViewWallet(wallet.address)}
                        className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors font-medium text-sm"
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 lg:col-span-2">
                {/* Empty state will be rendered below */}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {!isLoading && !error && viewMode === "list" && (
          <div className="space-y-6 mb-8">
            {currentWallets && currentWallets.length > 0 ? (
              currentWallets.map((wallet) => (
                <div
                  key={wallet.address}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Left Side Color Bar */}
                    <div
                      className={`md:w-2 w-full h-2 md:h-auto ${
                        wallet.status === WALLET_STATUS.ACTIVE
                          ? "bg-green-500"
                          : wallet.status === WALLET_STATUS.ARCHIVED
                            ? "bg-gray-400"
                            : "bg-red-500"
                      }`}
                    ></div>

                    <div className="flex-grow p-5">
                      {/* Header with name and status */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-xl text-gray-800 flex items-center">
                            {wallet.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono mr-2">
                              {formatAddress(wallet.address)}
                            </code>
                            <button
                              onClick={() => copyAddress(wallet.address)}
                              className="p-1 text-gray-500 hover:text-purple-600"
                              aria-label="Copy address"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(wallet.status)}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full mr-1.5 ${getStatusDotClass(wallet.status)}`}
                            ></span>
                            {getStatusLabel(wallet.status)}
                          </span>
                        </div>
                      </div>

                      {/* Main content area */}
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* QR Code */}
                        <div className="flex-shrink-0 flex items-center justify-center">
                          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                            <QRCodeSVG
                              value={wallet.address}
                              size={100}
                              level="H"
                              imageSettings={{
                                src: "/logo192.png",
                                height: 20,
                                width: 20,
                                excavate: true,
                              }}
                            />
                          </div>
                        </div>

                        {/* Wallet Details */}
                        <div className="flex-grow">
                          <p className="text-gray-700 mb-4">
                            {wallet.description || "No description provided."}
                          </p>

                          <div className="flex flex-wrap gap-x-8 gap-y-3">
                            <div>
                              <p className="text-xs text-gray-500">
                                Created On
                              </p>
                              <div className="text-sm font-medium">
                                {formatDate(wallet.createdAt)}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">
                                Total Views
                              </p>
                              <div className="flex items-center gap-1 text-blue-600">
                                <Eye className="h-4 w-4" />
                                <span className="font-bold">
                                  {wallet.viewCount || 0}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">
                                Unique Views
                              </p>
                              <div className="flex items-center gap-1 text-amber-600">
                                <UserCheck className="h-4 w-4" />
                                <span className="font-bold">
                                  {wallet.uniqueViewCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditWallet(wallet.address)}
                            className="inline-flex items-center px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-sm font-medium"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleShareWallet(wallet.address)}
                            className="inline-flex items-center px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded text-sm font-medium"
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </button>
                          <button
                            onClick={() => handleDeleteClick(wallet)}
                            className="inline-flex items-center px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-sm font-medium"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                        <div className="flex items-center">
                          <a
                            href={`/public/${wallet.address}`}
                            className="inline-flex items-center px-3 py-1.5 text-gray-600 hover:text-gray-800 rounded text-sm font-medium mr-2"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Public Page
                            <ExternalLink className="ml-1 h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleViewWallet(wallet.address)}
                            className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors font-medium text-sm"
                          >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>{/* Empty state will be rendered below */}</div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && wallets && wallets.length > 0 && (
          <div className="flex justify-center mt-8 mb-4">
            <nav
              className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`mr-2 p-2 rounded-md ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-purple-600 hover:bg-purple-50"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-4 py-2 mx-1 rounded-md ${
                        currentPage === number
                          ? "bg-purple-600 text-white"
                          : "text-gray-700 hover:bg-purple-50"
                      }`}
                      aria-current={currentPage === number ? "page" : undefined}
                    >
                      {number}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-2 p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-purple-600 hover:bg-purple-50"
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!wallets || wallets.length === 0) && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Wallet className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No wallets found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              You haven't created any public wallets yet. Get started by adding
              your first wallet.
            </p>
            <button
              onClick={handleAddWallet}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Wallet
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scaleIn">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                Delete Wallet
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{selectedWallet?.name}</span>?
                This action cannot be undone.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
                  disabled={isOperationLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center font-medium"
                  disabled={isOperationLoading}
                >
                  {isOperationLoading ? (
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

      {/* Animations for modal */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default withProfileVerification(UserPublicWalletListPage);
