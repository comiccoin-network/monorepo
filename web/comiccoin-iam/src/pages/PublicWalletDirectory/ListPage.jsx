// src/pages/PublicWalletDirectory/ListPage.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import {
  Search,
  Filter,
  Building,
  User,
  Star,
  MapPin,
  Mail,
  Globe,
  Phone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Calendar,
  CheckCircle2,
  Tag,
  EyeIcon,
  LayoutGrid,
  LayoutList,
  CreditCard,
  Wallet,
  BadgeCheck,
  SlidersHorizontal,
  Users,
  AlertTriangle,
  Loader,
} from "lucide-react";
import Header from "../../components/IndexPage/Header";
import Footer from "../../components/IndexPage/Footer";
import {
  usePublicWalletDirectoryList,
  usePublicWalletDirectory,
} from "../../hooks/usePublicWalletDirectory";

const PublicWalletDirectoryListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get search query from URL
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";

  // States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all"); // all, retailers, individuals
  const [displayMode, setDisplayMode] = useState("grid"); // grid or list
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(8);
  const [filters, setFilters] = useState({
    verified: false,
    location: "",
    type: "", // "business" or "individual"
    status: 1, // Active by default
  });

  // Prepare API filters
  const apiFilters = {
    value: searchQuery || undefined,
    limit: resultsPerPage,
    activeOnly: true, // Only active wallets
    status: filters.status,
  };

  if (filters.verified) {
    apiFilters.isVerified = true;
  }

  if (activeTab === "retailers") {
    apiFilters.type = "business";
  } else if (activeTab === "individuals") {
    apiFilters.type = "individual";
  }

  // Use our hook for listing
  const { wallets, pagination, isLoading, error, refetch } =
    usePublicWalletDirectoryList(apiFilters);

  // Use search hook
  const { searchWallets, isLoading: isSearchLoading } =
    usePublicWalletDirectory();

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();

    // Update URL query parameter
    navigate(`/directory?q=${encodeURIComponent(searchQuery)}`, {
      replace: true,
    });

    // Reset to first page when searching
    setCurrentPage(1);

    // Trigger refetch with new search query
    refetch();
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page
  };

  // Toggle display mode
  const toggleDisplayMode = () => {
    setDisplayMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // Get current page slice of results
  const getCurrentPageResults = () => {
    // This is for pagination
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const pageResults = wallets.slice(startIndex, endIndex);

    return {
      results: pageResults,
      totalPages: Math.ceil(wallets.length / resultsPerPage),
      totalResults: wallets.length,
    };
  };

  // Calculate total pages and current page results
  const { results, totalPages, totalResults } = getCurrentPageResults();

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      verified: false,
      location: "",
      type: "",
      status: 1,
    });
    setActiveTab("all");
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when page changes
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

      {/* Header with back button */}
      <Header showBackButton={false} />

      <main id="main-content" className="flex-grow">
        {/* Search Header Section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
              ComicCoin Digital Identity Directory
            </h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, location, or wallet address"
                    className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-700"
                    aria-label="Search by name, location, or wallet address"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchLoading}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg active:bg-indigo-100 flex items-center justify-center sm:w-auto w-full disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSearchLoading ? (
                    <>
                      <Loader className="animate-spin mr-2 h-5 w-5" />
                      Searching...
                    </>
                  ) : (
                    <>
                      Search
                      <Search className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Filter Tags */}
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-3 mt-4">
              <span className="text-indigo-100 font-medium">Filters:</span>

              {/* Category Tabs */}
              <div className="flex bg-indigo-700 bg-opacity-30 rounded-lg p-1">
                <button
                  onClick={() => handleTabChange("all")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === "all"
                      ? "bg-white text-indigo-600"
                      : "text-white hover:bg-indigo-600"
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-white`}
                  aria-pressed={activeTab === "all"}
                >
                  All
                </button>
                <button
                  onClick={() => handleTabChange("retailers")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === "retailers"
                      ? "bg-white text-indigo-600"
                      : "text-white hover:bg-indigo-600"
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-white flex items-center`}
                  aria-pressed={activeTab === "retailers"}
                >
                  <Building className="w-4 h-4 mr-1" />
                  Businesses
                </button>
                <button
                  onClick={() => handleTabChange("individuals")}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === "individuals"
                      ? "bg-white text-indigo-600"
                      : "text-white hover:bg-indigo-600"
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-white flex items-center`}
                  aria-pressed={activeTab === "individuals"}
                >
                  <User className="w-4 h-4 mr-1" />
                  Individuals
                </button>
              </div>

              {/* Verified Filter */}
              <button
                onClick={() =>
                  handleFilterChange("verified", !filters.verified)
                }
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  filters.verified
                    ? "bg-green-500 text-white"
                    : "bg-indigo-700 bg-opacity-30 text-white hover:bg-indigo-600"
                } transition-colors focus:outline-none focus:ring-2 focus:ring-white`}
                aria-pressed={filters.verified}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Verified Only
              </button>

              {/* Location Filter - Dropdown */}
              <div className="relative">
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  placeholder="Filter by location"
                  className={`pl-8 pr-3 py-2 rounded-md text-sm ${
                    filters.location
                      ? "bg-white text-indigo-600"
                      : "bg-indigo-700 bg-opacity-30 text-white placeholder-indigo-200"
                  } focus:outline-none focus:ring-2 focus:ring-white transition-colors`}
                />
                <MapPin
                  className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    filters.location ? "text-indigo-600" : "text-indigo-200"
                  }`}
                />
                {filters.location && (
                  <button
                    onClick={() => handleFilterChange("location", "")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    aria-label="Clear location filter"
                  >
                    <X className="w-4 h-4 text-indigo-600" />
                  </button>
                )}
              </div>

              {/* Clear All Filters */}
              {(filters.verified ||
                filters.location ||
                activeTab !== "all") && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-indigo-700 bg-opacity-30 text-white hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              )}

              {/* Toggle Display Mode */}
              <button
                onClick={toggleDisplayMode}
                className="ml-auto flex items-center px-3 py-2 rounded-md text-sm font-medium bg-indigo-700 bg-opacity-30 text-white hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={`Switch to ${displayMode === "grid" ? "list" : "grid"} view`}
              >
                {displayMode === "grid" ? (
                  <>
                    <LayoutList className="w-4 h-4 mr-1" />
                    List View
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4 mr-1" />
                    Grid View
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            {isLoading ? (
              <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0 flex items-center">
                <Loader className="animate-spin mr-2 h-5 w-5" />
                Loading directory...
              </h2>
            ) : error ? (
              <h2 className="text-xl font-bold text-red-600 mb-4 sm:mb-0 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Error loading directory
              </h2>
            ) : (
              <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">
                {totalResults === 0 ? (
                  "No results found"
                ) : (
                  <>
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * resultsPerPage + 1,
                      totalResults,
                    )}{" "}
                    - {Math.min(currentPage * resultsPerPage, totalResults)} of{" "}
                    {totalResults} results
                  </>
                )}
              </h2>
            )}

            {/* Sort and Results Per Page Controls */}
            <div className="flex items-center gap-4">
              {/* Results Per Page Selector */}
              <div className="flex items-center">
                <label
                  htmlFor="resultsPerPage"
                  className="text-sm text-gray-600 mr-2"
                >
                  Show:
                </label>
                <select
                  id="resultsPerPage"
                  value={resultsPerPage}
                  onChange={(e) => {
                    setResultsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                >
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-lg text-gray-700">
                Loading directory entries...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Error Loading Directory
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {error.message ||
                  "Failed to load directory entries. Please try again later."}
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Results Message */}
          {!isLoading && !error && totalResults === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No matching results found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any entries matching your search criteria. Try
                adjusting your filters or search terms.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Results Grid/List */}
          {!isLoading && !error && totalResults > 0 && (
            <div
              className={`grid gap-6 ${
                displayMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {results.map((wallet) => {
                const isRetailer =
                  wallet.type === "business" || wallet.type === "retailer";

                // Grid Card
                if (displayMode === "grid") {
                  return (
                    <div
                      key={wallet.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="relative">
                        <div className="h-3 bg-gradient-to-r from-purple-600 to-indigo-500"></div>
                        <div className="p-4 pb-2 flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              {isRetailer ? (
                                <Building className="h-6 w-6 text-purple-600" />
                              ) : (
                                <User className="h-6 w-6 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800">
                                {wallet.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {wallet.city && (
                                  <span className="flex items-center">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    {[
                                      wallet.city,
                                      wallet.region,
                                      wallet.country,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          {wallet.isVerified && (
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                              Verified
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 pt-2">
                        <p className="text-sm text-gray-600 mb-4">
                          {wallet.description || "No description provided."}
                        </p>

                        {/* Entity-specific Info */}
                        <div className="border-t border-gray-100 pt-3">
                          <div className="grid grid-cols-1 gap-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Wallet className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-mono">
                                {wallet.formattedAddress}
                              </span>
                            </div>

                            {wallet.createdAt && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                Registered{" "}
                                {new Date(
                                  wallet.createdAt,
                                ).toLocaleDateString()}
                              </div>
                            )}

                            {wallet.websiteURL && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Globe className="h-4 w-4 text-gray-400 mr-2" />
                                <a
                                  href={`https://${wallet.websiteURL}`}
                                  className="text-indigo-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {wallet.websiteURL}
                                </a>
                              </div>
                            )}

                            {wallet.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                {wallet.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex justify-between items-center mt-2">
                          <Link
                            to={`/directory/${wallet.address}`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                            aria-label={`View profile of ${wallet.name}`}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Profile
                          </Link>
                          <button
                            onClick={() => {
                              navigator.clipboard
                                .writeText(wallet.address)
                                .then(() =>
                                  alert(`Address copied: ${wallet.address}`),
                                )
                                .catch((err) =>
                                  console.error("Failed to copy:", err),
                                );
                            }}
                            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors px-3 py-1 rounded-lg text-sm font-medium"
                            aria-label={`Copy wallet address of ${wallet.name}`}
                          >
                            Copy Address
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
                // List Card
                else {
                  return (
                    <div
                      key={wallet.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="p-6 flex flex-col md:flex-row gap-4">
                        {/* Entity Icon/Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                            {isRetailer ? (
                              <Building className="h-8 w-8 text-purple-600" />
                            ) : (
                              <User className="h-8 w-8 text-purple-600" />
                            )}
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-bold text-lg text-gray-800">
                                  {wallet.name}
                                </h3>
                                {wallet.isVerified && (
                                  <div className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                    <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                                    Verified
                                  </div>
                                )}
                              </div>
                              {wallet.city && (
                                <p className="text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    {[
                                      wallet.city,
                                      wallet.region,
                                      wallet.country,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </span>
                                </p>
                              )}
                            </div>

                            <div className="mt-2 sm:mt-0 sm:text-right">
                              <div className="flex items-center text-sm text-gray-600 justify-start sm:justify-end">
                                <Wallet className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-mono">
                                  {wallet.formattedAddress}
                                </span>
                              </div>
                              {wallet.createdAt && (
                                <div className="text-sm text-gray-500 mt-1">
                                  <span className="flex items-center justify-start sm:justify-end">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    Registered{" "}
                                    {new Date(
                                      wallet.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {wallet.description || "No description provided."}
                          </p>

                          {/* Additional Details */}
                          <div className="border-t border-gray-100 pt-3 grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                            {/* Contact Information */}
                            <div>
                              {wallet.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                  <a
                                    href={`mailto:${wallet.email}`}
                                    className="text-indigo-600 hover:underline"
                                  >
                                    {wallet.email}
                                  </a>
                                </div>
                              )}
                              {wallet.phone && (
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                  {wallet.phone}
                                </div>
                              )}
                            </div>

                            {/* Website */}
                            <div>
                              {wallet.websiteURL && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Globe className="h-4 w-4 text-gray-400 mr-2" />
                                  <a
                                    href={`https://${wallet.websiteURL}`}
                                    className="text-indigo-600 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {wallet.websiteURL}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="flex justify-end items-center mt-2">
                            <Link
                              to={`/directory/${wallet.address}`}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mr-4"
                              aria-label={`View profile of ${wallet.name}`}
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View Profile
                            </Link>
                            <button
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(wallet.address)
                                  .then(() =>
                                    alert(`Address copied: ${wallet.address}`),
                                  )
                                  .catch((err) =>
                                    console.error("Failed to copy:", err),
                                  );
                              }}
                              className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors px-3 py-1 rounded-lg text-sm font-medium"
                              aria-label={`Copy wallet address of ${wallet.name}`}
                            >
                              Copy Address
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 0 && (
            <div className="mt-8 flex justify-center">
              <nav
                className="flex items-center bg-white px-4 py-3 rounded-lg shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`mr-2 p-2 rounded-md flex items-center ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-indigo-600 hover:bg-indigo-50"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center">
                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show current page, first, last, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 mx-1 rounded-md ${
                            page === currentPage
                              ? "bg-indigo-600 text-white"
                              : "text-gray-700 hover:bg-indigo-50"
                          }`}
                          aria-current={
                            page === currentPage ? "page" : undefined
                          }
                          aria-label={`Page ${page}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      // Show ellipsis
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-2 p-2 rounded-md flex items-center ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-indigo-600 hover:bg-indigo-50"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>

      {/* Footer component */}
      <Footer />
    </div>
  );
};

export default PublicWalletDirectoryListPage;
