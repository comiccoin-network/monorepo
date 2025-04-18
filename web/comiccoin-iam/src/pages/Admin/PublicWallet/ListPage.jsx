// monorepo/web/comiccoin-iam/src/pages/Admin/PublicWallets/ListPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Wallet,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Edit,
  Trash2,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Building,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminTopNavigation from "../../../components/AdminTopNavigation";
import AdminFooter from "../../../components/AdminFooter";
import {
  usePublicWalletList,
  usePublicWallet,
  WALLET_STATUS,
  WALLET_TYPE,
} from "../../../hooks/usePublicWallet";

const AdminPublicWalletListPage = () => {
  const navigate = useNavigate();

  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [isVerified, setIsVerified] = useState(null);

  // Get the delete functionality from usePublicWallet hook
  const { deletePublicWallet, isLoading: isDeletingWallet } = usePublicWallet();

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);

  // Prepare filters for the API
  const filters = {
    limit: pageSize,
    value: searchTerm || undefined,
    type: selectedType || undefined,
    status: selectedStatus || undefined,
    isVerified: isVerified,
  };

  // Use the publicWalletList hook to fetch wallets with the filters
  const { wallets, pagination, isLoading, error, refetch } =
    usePublicWalletList(filters);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  // Handle type filter change
  const handleTypeChange = (e) => {
    setSelectedType(parseInt(e.target.value, 10));
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setSelectedStatus(parseInt(e.target.value, 10));
  };

  // Handle verification status filter change
  const handleVerificationChange = (e) => {
    const value = e.target.value;
    setIsVerified(value === "" ? null : value === "true");
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType(0);
    setSelectedStatus(0);
    setIsVerified(null);
  };

  // Effect to refetch when filters change
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, selectedType, selectedStatus, isVerified]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && pagination?.hasMore) {
      setCurrentPage(page);
    }
  };

  // Navigate to create wallet page
  const handleAddWallet = () => {
    navigate("/admin/public-wallets/create");
  };

  // Navigate to wallet detail page
  const handleViewWallet = (address) => {
    navigate(`/admin/public-wallets/${address}`);
  };

  // Navigate to edit wallet page
  const handleEditWallet = (address, e) => {
    e.stopPropagation(); // Prevent row click event from firing
    navigate(`/admin/public-wallets/${address}/edit`);
  };

  // Show delete confirmation
  const handleDeleteClick = (wallet, e) => {
    e.stopPropagation(); // Prevent row click event from firing
    setWalletToDelete(wallet);
    setShowDeleteConfirm(true);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setWalletToDelete(null);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!walletToDelete) return;

    try {
      await deletePublicWallet(walletToDelete.address);
      toast.success("Wallet deleted successfully");
      setShowDeleteConfirm(false);
      setWalletToDelete(null);
      refetch();
    } catch (err) {
      toast.error(`Failed to delete wallet: ${err.message || "Unknown error"}`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get wallet type details
  const getWalletTypeDetails = (type) => {
    switch (type) {
      case WALLET_TYPE.INDIVIDUAL:
        return {
          label: "Individual",
          icon: <User className="h-4 w-4 text-blue-500" />,
          className: "bg-blue-100 text-blue-800",
        };
      case WALLET_TYPE.COMPANY:
        return {
          label: "Business",
          icon: <Building className="h-4 w-4 text-purple-500" />,
          className: "bg-purple-100 text-purple-800",
        };
      default:
        return {
          label: "Unknown",
          icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  // Get wallet status details
  const getWalletStatusDetails = (status) => {
    switch (status) {
      case WALLET_STATUS.ACTIVE:
        return {
          label: "Active",
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          className: "bg-green-100 text-green-800",
          dotClass: "bg-green-500",
        };
      case WALLET_STATUS.ARCHIVED:
        return {
          label: "Archived",
          icon: <XCircle className="h-4 w-4 text-gray-500" />,
          className: "bg-gray-100 text-gray-800",
          dotClass: "bg-gray-500",
        };
      case WALLET_STATUS.LOCKED:
        return {
          label: "Locked",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          className: "bg-red-100 text-red-800",
          dotClass: "bg-red-500",
        };
      default:
        return {
          label: "Unknown",
          icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
          className: "bg-gray-100 text-gray-800",
          dotClass: "bg-gray-500",
        };
    }
  };

  // Get verification status details
  const getVerificationStatusDetails = (isVerified) => {
    return isVerified
      ? {
          label: "Verified",
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          className: "bg-green-100 text-green-800",
        }
      : {
          label: "Unverified",
          icon: <XCircle className="h-4 w-4 text-orange-500" />,
          className: "bg-orange-100 text-orange-800",
        };
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
        className="flex-grow container mx-auto px-4 py-8 max-w-6xl"
      >
        {/* Page Header with Gradient Background */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
                <Wallet className="h-6 w-6 mr-2" aria-hidden="true" />
                Public Wallet Management
              </h1>
              <p className="text-indigo-100">
                View and manage public wallets across the platform
              </p>
            </div>
            <div>
              <button
                onClick={handleAddWallet}
                className="w-full md:w-auto bg-white text-purple-700 hover:bg-indigo-50 px-6 py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 font-semibold"
                aria-label="Add new wallet"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                <span>Create New Wallet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="relative lg:col-span-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by name, address, or owner..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  aria-label="Filter by type"
                >
                  <option value={0}>All Types</option>
                  <option value={WALLET_TYPE.INDIVIDUAL}>Individual</option>
                  <option value={WALLET_TYPE.COMPANY}>Business</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <ChevronLeft className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  aria-label="Filter by status"
                >
                  <option value={0}>All Statuses</option>
                  <option value={WALLET_STATUS.ACTIVE}>Active</option>
                  <option value={WALLET_STATUS.ARCHIVED}>Archived</option>
                  <option value={WALLET_STATUS.LOCKED}>Locked</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <ChevronLeft className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Verification Filter (Second Row) */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <select
                  value={isVerified === null ? "" : isVerified.toString()}
                  onChange={handleVerificationChange}
                  className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  aria-label="Filter by verification status"
                >
                  <option value="">All Verification Statuses</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <ChevronLeft className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Results Count and Page Size */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Loading wallets...
              </div>
            ) : (
              <>
                Showing {wallets?.length || 0} of {wallets?.length || 0} wallets
                {(searchTerm ||
                  selectedType ||
                  selectedStatus ||
                  isVerified !== null) &&
                  " (filtered)"}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md p-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>
                Error loading wallets:{" "}
                {error.message || "An unknown error occurred"}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-2 text-red-700 hover:text-red-800 text-sm font-medium flex items-center gap-1"
            >
              <ArrowRight className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {/* Wallets Table */}
        {!isLoading && !error && wallets && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Wallet
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                    >
                      Owner
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wallets.length > 0 ? (
                    wallets.map((wallet) => (
                      <tr
                        key={wallet.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewWallet(wallet.address)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  wallet.type === WALLET_TYPE.COMPANY
                                    ? "#dbeafe"
                                    : "#fef9c3",
                              }}
                            >
                              <Wallet className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                {wallet.name || "Unnamed Wallet"}
                                {wallet.isVerified && (
                                  <CheckCircle
                                    className="h-4 w-4 text-green-500 ml-1"
                                    title="Verified"
                                  />
                                )}
                              </div>
                              <div className="text-sm text-gray-500 font-mono">
                                {wallet.formattedAddress}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWalletTypeDetails(wallet.type).className}`}
                          >
                            {getWalletTypeDetails(wallet.type).icon}
                            <span className="ml-1">
                              {getWalletTypeDetails(wallet.type).label}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">
                            {wallet.createdByName || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWalletStatusDetails(wallet.status).className}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full mr-1.5 my-auto ${getWalletStatusDetails(wallet.status).dotClass}`}
                              ></span>
                              {getWalletStatusDetails(wallet.status).label}
                            </span>
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerificationStatusDetails(wallet.isVerified).className}`}
                            >
                              {
                                getVerificationStatusDetails(wallet.isVerified)
                                  .icon
                              }
                              <span className="ml-1">
                                {
                                  getVerificationStatusDetails(
                                    wallet.isVerified,
                                  ).label
                                }
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(wallet.createdAt)}
                          </div>
                          <div className="flex items-center mt-1">
                            <Eye className="h-4 w-4 mr-1 text-gray-400" />
                            {wallet.viewCount || 0} views
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={(e) => handleViewWallet(wallet.address)}
                              className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                              aria-label={`View ${wallet.name || "wallet"}`}
                            >
                              <ExternalLink className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) =>
                                handleEditWallet(wallet.address, e)
                              }
                              className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                              aria-label={`Edit ${wallet.name || "wallet"}`}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(wallet, e)}
                              className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                              aria-label={`Delete ${wallet.name || "wallet"}`}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No wallets found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-lg text-gray-600">Loading wallets...</p>
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
              {searchTerm ||
              selectedType ||
              selectedStatus ||
              isVerified !== null
                ? "No wallets match the current filters. Try adjusting your search criteria."
                : "No public wallets have been created yet. Get started by adding your first wallet."}
            </p>
            {searchTerm ||
            selectedType ||
            selectedStatus ||
            isVerified !== null ? (
              <button
                onClick={clearFilters}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <Filter className="h-5 w-5 mr-2" />
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleAddWallet}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Wallet
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination && pagination.hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => handleLoadMore()}
              disabled={isLoading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {isLoading ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              Load More
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && walletToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
              <div className="mb-4 flex items-center justify-center">
                <div className="bg-red-100 rounded-full p-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete the wallet{" "}
                <span className="font-semibold">
                  {walletToDelete.name || walletToDelete.formattedAddress}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  disabled={isDeletingWallet}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                  disabled={isDeletingWallet}
                >
                  {isDeletingWallet ? (
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

      <AdminFooter />

      {/* Animation styles */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminPublicWalletListPage;
