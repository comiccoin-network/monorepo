// monorepo/web/comiccoin-iam/src/pages/PublicWallet/ListPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Wallet,
  Plus,
  Eye,
  Search,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Grid,
  List,
  Loader,
  Trash2,
  Edit2,
} from "lucide-react";
import { toast } from "react-toastify";
import AppTopNavigation from "../../components/AppTopNavigation";
import AppFooter from "../../components/AppFooter";
import withProfileVerification from "../../components/withProfileVerification";
import {
  usePublicWallet,
  usePublicWalletList,
} from "../../hooks/usePublicWallet";

const PublicWalletListPage = () => {
  const navigate = useNavigate();

  // State for view mode and filters
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Setup filters for the API
  const [filters, setFilters] = useState({
    limit: 20,
    value: "",
  });

  // Use our custom hooks
  const {
    wallets,
    pagination,
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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Submit search
  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      value: searchQuery,
      lastId: undefined,
      lastCreatedAt: undefined,
    }));
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    // No direct status filter in the API, we'll filter client-side for now
  };

  // Navigate to add wallet page
  const handleAddWallet = () => {
    navigate("/public-wallets/add");
  };

  // Navigate to wallet detail page
  const handleViewWallet = (walletId) => {
    navigate(`/public-wallet/${walletId}`);
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

  // Filter wallets based on status filter (client-side filtering)
  const filteredWallets = wallets
    ? wallets.filter((wallet) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active")
          return wallet.status === WALLET_STATUS.ACTIVE;
        if (statusFilter === "inactive")
          return wallet.status !== WALLET_STATUS.ACTIVE;
        return true;
      })
    : [];

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
        className="flex-grow container mx-auto px-4 py-8 max-w-6xl"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-purple-900 mb-2">
              My Public Wallets
            </h1>
            <p className="text-gray-600">
              Manage and share your public wallet profiles
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleAddWallet}
              className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              aria-label="Add new public wallet"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              <span className="font-medium">Add New Wallet</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Search by name, description or address"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                aria-label="Search wallets"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-2">
              <div className="relative">
                <select
                  className="appearance-none block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  aria-label="Filter by status"
                >
                  <option value="all">All Wallets</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-purple-100 text-purple-800" : "bg-white text-gray-500"} rounded-l-lg border-r border-gray-300`}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-purple-100 text-purple-800" : "bg-white text-gray-500"} rounded-r-lg`}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-4 text-gray-600 text-sm">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Loading wallets...
            </div>
          ) : (
            <>Showing {filteredWallets.length} wallets</>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your wallets...</p>
          </div>
        )}

        {/* Grid View */}
        {!isLoading && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWallets.map((wallet) => (
              <div
                key={wallet.address}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
              >
                {/* Card Header with Wallet Icon */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <Wallet
                        className="h-5 w-5 text-purple-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h2
                        className="font-semibold text-lg text-gray-800 truncate"
                        title={wallet.name}
                      >
                        {wallet.name}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {formatAddress(wallet.address)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
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

                {/* Card Body */}
                <div className="p-4">
                  <p
                    className="text-gray-600 text-sm mb-4 line-clamp-2"
                    title={wallet.description}
                  >
                    {wallet.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>{wallet.viewCount || 0} views</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      Created {formatDate(wallet.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewWallet(wallet.address)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                      aria-label={`View details for ${wallet.name}`}
                    >
                      View
                      <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleEditWallet(wallet.address)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      aria-label={`Edit ${wallet.name}`}
                    >
                      <Edit2 className="mr-1 h-4 w-4" aria-hidden="true" />
                      Edit
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/public/${wallet.address}`}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
                      aria-label={`View public page for ${wallet.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Public
                      <ExternalLink
                        className="ml-1 h-4 w-4"
                        aria-hidden="true"
                      />
                    </a>
                    <button
                      onClick={() => handleDeleteClick(wallet)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                      aria-label={`Delete ${wallet.name}`}
                    >
                      <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {!isLoading && viewMode === "list" && (
          <div className="space-y-4">
            {filteredWallets.map((wallet) => (
              <div
                key={wallet.address}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* Wallet Icon (Left Side for non-mobile) */}
                <div className="flex-shrink-0 flex sm:block items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Wallet
                      className="h-6 w-6 text-purple-600"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <div>
                      <h2 className="font-semibold text-lg text-gray-800">
                        {wallet.name}
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="font-mono">
                          {wallet.address
                            ? `${wallet.address.slice(0, 10)}...${wallet.address.slice(-8)}`
                            : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(wallet.status)}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full mr-1.5 ${getStatusDotClass(wallet.status)}`}
                        ></span>
                        {getStatusLabel(wallet.status)}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                        <span>{wallet.viewCount || 0} views</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{wallet.description}</p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-2 border-t border-gray-100">
                    <div className="text-gray-500 text-sm mb-2 sm:mb-0">
                      Created {formatDate(wallet.createdAt)}
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleViewWallet(wallet.address)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                        aria-label={`View details for ${wallet.name}`}
                      >
                        View Details
                        <ArrowRight
                          className="ml-1 h-4 w-4"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        onClick={() => handleEditWallet(wallet.address)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        aria-label={`Edit ${wallet.name}`}
                      >
                        <Edit2 className="mr-1 h-4 w-4" aria-hidden="true" />
                        Edit
                      </button>
                      <a
                        href={`/public/${wallet.address}`}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
                        aria-label={`View public page for ${wallet.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Public Link
                        <ExternalLink
                          className="ml-1 h-4 w-4"
                          aria-hidden="true"
                        />
                      </a>
                      <button
                        onClick={() => handleDeleteClick(wallet)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                        aria-label={`Delete ${wallet.name}`}
                      >
                        <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredWallets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No wallets found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchQuery || statusFilter !== "all"
                ? "We couldn't find any wallets matching your filters. Try adjusting your search or filters."
                : "You haven't created any public wallets yet. Get started by adding your first wallet."}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the wallet{" "}
                <span className="font-semibold">{selectedWallet?.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  disabled={isOperationLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
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

      <AppFooter />
    </div>
  );
};

export default withProfileVerification(PublicWalletListPage);
