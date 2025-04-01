// src/pages/PublicWalletsPage.jsx
import React, { useState } from "react";
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
} from "lucide-react";
import AppTopNavigation from "../components/AppTopNavigation";
import AppFooter from "../components/AppFooter";
import withProfileVerification from "../components/withProfileVerification";

const PublicWalletsPage = () => {
  const navigate = useNavigate();

  // Sample wallet data - In a real application, this would come from an API
  const [wallets, setWallets] = useState([
    {
      id: "1",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      name: "Primary Collectibles Wallet",
      description:
        "My main wallet for comic book collectibles and special editions",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 432,
      createdAt: "2025-01-15",
      status: "active",
    },
    {
      id: "2",
      address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      name: "Comic-Con Exclusive Drops",
      description:
        "Special wallet for limited edition Comic-Con exclusive items and partnerships",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 278,
      createdAt: "2025-02-10",
      status: "active",
    },
    {
      id: "3",
      address: "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
      name: "Vintage Collection",
      description:
        "Dedicated wallet for pre-1990s comic NFTs and digital memorabilia",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 189,
      createdAt: "2025-02-22",
      status: "inactive",
    },
    {
      id: "4",
      address: "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C",
      name: "Trading Portfolio",
      description:
        "Active wallet for trading and short-term holdings in the ComicCoin ecosystem",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 321,
      createdAt: "2025-03-05",
      status: "active",
    },
    {
      id: "5",
      address: "0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47",
      name: "Artist Collaborations",
      description:
        "Wallet for artist collaborations and supporting indie comic creators",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 157,
      createdAt: "2025-03-12",
      status: "inactive",
    },
  ]);

  // State for view mode (grid or list)
  const [viewMode, setViewMode] = useState("grid");
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // State for filter status
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter wallets based on search query and status filter
  const filteredWallets = wallets.filter((wallet) => {
    const matchesSearch =
      wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || wallet.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Navigate to add wallet page
  const handleAddWallet = () => {
    navigate("/add-wallet");
  };

  // Navigate to wallet detail page
  const handleViewWallet = (walletId) => {
    navigate(`/wallet/${walletId}`);
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
          Showing {filteredWallets.length} out of {wallets.length} wallets
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWallets.map((wallet) => (
              <div
                key={wallet.id}
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
                        {wallet.address.slice(0, 6)}...
                        {wallet.address.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${wallet.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full mr-1.5 ${wallet.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                      ></span>
                      {wallet.status === "active" ? "Active" : "Inactive"}
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
                      <span>{wallet.viewCount} views</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      Created {new Date(wallet.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                  <button
                    onClick={() => handleViewWallet(wallet.id)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                    aria-label={`View details for ${wallet.name}`}
                  >
                    View Details
                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </button>

                  <a
                    href={`/public/${wallet.address}`}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
                    aria-label={`View public page for ${wallet.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Public Link
                    <ExternalLink className="ml-1 h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-4">
            {filteredWallets.map((wallet) => (
              <div
                key={wallet.id}
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
                          {wallet.address.slice(0, 10)}...
                          {wallet.address.slice(-8)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${wallet.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full mr-1.5 ${wallet.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                        ></span>
                        {wallet.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                        <span>{wallet.viewCount} views</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{wallet.description}</p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-2 border-t border-gray-100">
                    <div className="text-gray-500 text-sm mb-2 sm:mb-0">
                      Created {new Date(wallet.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleViewWallet(wallet.id)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                        aria-label={`View details for ${wallet.name}`}
                      >
                        View Details
                        <ArrowRight
                          className="ml-1 h-4 w-4"
                          aria-hidden="true"
                        />
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredWallets.length === 0 && (
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
      </main>

      <AppFooter />
    </div>
  );
};

export default withProfileVerification(PublicWalletsPage);
