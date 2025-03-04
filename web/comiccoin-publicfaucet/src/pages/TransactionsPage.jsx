// src/pages/TransactionsPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Coins,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  Filter,
} from "lucide-react";

import withWallet from "../components/withWallet";
import { useTransactions } from "../api/endpoints/transactionsApi";

const TransactionsPageContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState({
    field: "timestamp",
    direction: "desc",
  });
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get the filter parameter from URL query string
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const filter = queryParams.get("filter");

  // Prevent iOS scroll bounce and optimize for mobile
  useEffect(() => {
    // Meta viewport tag optimization for iOS
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      );
    }

    // Use a more passive approach to prevent issues
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    // Add touch-friendly interactions
    document.body.classList.add("touch-manipulation");

    return () => {
      // Clean up
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";
      document.body.classList.remove("touch-manipulation");
      if (metaViewport) {
        metaViewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1",
        );
      }
    };
  }, []);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setFilterMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch transactions data with our custom hook
  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useTransactions({
    refreshInterval: 0, // Disable auto-refresh temporarily to troubleshoot
    enabled: true,
  });

  // Handle manual refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();

    // Add slight delay to make the animation visible
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Filter transactions if needed based on URL parameter
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // If personal filter is applied, we could filter by user ID or other criteria
    // This is just a placeholder - implement actual filtering logic based on your requirements
    if (filter === "personal") {
      return transactions; // In a real app, you'd filter by user ID or similar
    }

    return transactions;
  }, [transactions, filter]);

  // Apply sorting with useMemo to prevent recalculation on every render
  const sortedTransactions = useMemo(() => {
    // Early return for empty arrays
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return [];
    }

    // Sort the transactions
    return [...filteredTransactions].sort((a, b) => {
      const aValue = a[sortBy.field];
      const bValue = b[sortBy.field];
      const direction = sortBy.direction === "asc" ? 1 : -1;

      if (sortBy.field === "timestamp") {
        return (
          direction * (new Date(aValue).getTime() - new Date(bValue).getTime())
        );
      }

      if (typeof aValue === "string") {
        return direction * aValue.localeCompare(bValue);
      }

      return direction * (aValue - bValue);
    });
  }, [filteredTransactions, sortBy.field, sortBy.direction]);

  // Memoize the date formatter to prevent recreation on every render
  const formatDate = useMemo(
    () => (dateString) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    [],
  );

  // Handle transaction expansion
  const toggleTransactionExpand = (transactionId) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId,
    );
  };

  // Handle sort
  const handleSort = (field) => {
    setSortBy({
      field,
      direction:
        sortBy.field === field && sortBy.direction === "asc" ? "desc" : "asc",
    });
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // Set filter and update URL
  const applyFilter = (filterValue) => {
    const newParams = new URLSearchParams(location.search);

    if (filterValue) {
      newParams.set("filter", filterValue);
    } else {
      newParams.delete("filter");
    }

    navigate({
      pathname: location.pathname,
      search: newParams.toString(),
    });

    setFilterMenuOpen(false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8 flex flex-col items-center justify-center"
        role="status"
      >
        <div className="animate-pulse">
          <Coins
            className="h-16 w-16 text-purple-400 mb-4"
            aria-hidden="true"
          />
        </div>
        <p className="text-gray-700 font-medium">Loading transactions...</p>
        <div className="sr-only">Loading transactions, please wait</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-100"
            aria-hidden="true"
          >
            <Coins className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-base text-gray-600 mb-6">
            {error.message ||
              "Failed to load transactions. Please check your connection and try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md"
            aria-label="Try loading transactions again"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-5xl mx-auto py-6 px-4 sm:px-6 md:py-8 lg:px-8 pb-20 sm:pb-10"
      style={{
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="mr-3 text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-purple-900 flex items-center">
                Transactions
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {filter === "personal" ? "Personal" : "All"}
                </span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Your ComicCoin transaction history
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            {/* Filter Dropdown */}
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className="px-3 py-2 flex items-center text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Filter transactions"
                aria-expanded={filterMenuOpen}
                aria-haspopup="true"
              >
                <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Filter</span>
              </button>

              {filterMenuOpen && (
                <div
                  className="absolute z-10 mt-1 w-48 right-0 bg-white rounded-lg shadow-lg py-1 border border-gray-200 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="filter-menu-button"
                >
                  <button
                    onClick={() => applyFilter(null)}
                    className={`px-4 py-2 text-sm text-left w-full hover:bg-purple-50 ${!filter ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"}`}
                    role="menuitem"
                  >
                    All Transactions
                  </button>
                  <button
                    onClick={() => applyFilter("personal")}
                    className={`px-4 py-2 text-sm text-left w-full hover:bg-purple-50 ${filter === "personal" ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"}`}
                    role="menuitem"
                  >
                    Personal Only
                  </button>
                </div>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <button
                onClick={() => handleSort("timestamp")}
                className={`px-3 py-2 flex items-center text-sm focus:outline-none focus:bg-purple-50 ${
                  sortBy.field === "timestamp"
                    ? "text-purple-700 font-medium bg-purple-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                aria-label={`Sort by date, currently sorted ${sortBy.field === "timestamp" ? sortBy.direction : "unsorted"}`}
              >
                <span className="mr-1">Date</span>
                {sortBy.field === "timestamp" &&
                  (sortBy.direction === "asc" ? (
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  ))}
              </button>
              <div
                className="h-6 border-r border-gray-200"
                aria-hidden="true"
              ></div>
              <button
                onClick={() => handleSort("amount")}
                className={`px-3 py-2 flex items-center text-sm focus:outline-none focus:bg-purple-50 ${
                  sortBy.field === "amount"
                    ? "text-purple-700 font-medium bg-purple-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                aria-label={`Sort by amount, currently sorted ${sortBy.field === "amount" ? sortBy.direction : "unsorted"}`}
              >
                <span className="mr-1">Amount</span>
                {sortBy.field === "amount" &&
                  (sortBy.direction === "asc" ? (
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  ))}
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white shadow-sm hover:bg-purple-50 text-purple-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              aria-label="Refresh transactions"
            >
              <RefreshCw
                className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Transactions Section */}
      <div className="space-y-4">
        {!sortedTransactions || sortedTransactions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-purple-100">
              <Coins className="w-10 h-10 text-purple-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No transactions found
            </h3>
            <p className="text-base text-gray-600 max-w-md mx-auto">
              Your transaction history will appear here after you claim your
              first ComicCoins.
            </p>
            <button
              onClick={handleBackToDashboard}
              className="mt-8 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md inline-flex items-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Return to dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <ul
              className="divide-y divide-gray-200"
              role="list"
              aria-label="Transaction list"
            >
              {sortedTransactions.map((transaction) => (
                <li key={transaction.id} className="overflow-hidden">
                  <div
                    onClick={() => toggleTransactionExpand(transaction.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-purple-50 transition-colors"
                    role="button"
                    aria-expanded={expandedTransaction === transaction.id}
                    aria-controls={`transaction-details-${transaction.id}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleTransactionExpand(transaction.id);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-lg font-semibold text-purple-700">
                          {transaction.amount} CC
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 ml-2 transition-transform ${
                        expandedTransaction === transaction.id
                          ? "rotate-180"
                          : ""
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Expanded Transaction Details */}
                  {expandedTransaction === transaction.id && (
                    <div
                      id={`transaction-details-${transaction.id}`}
                      className="px-4 sm:px-5 pb-5 bg-purple-50 animate-fadeIn"
                    >
                      <div className="border-t border-purple-200 pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 sm:col-span-1">
                            <div className="text-xs text-gray-600 mb-1">
                              Transaction ID
                            </div>
                            <div className="text-sm text-gray-800 font-mono bg-white p-2 rounded overflow-x-auto">
                              {transaction.id}
                            </div>
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <div className="text-xs text-gray-600 mb-1">
                              Date & Time
                            </div>
                            <div className="text-sm text-gray-800 bg-white p-2 rounded">
                              {new Date(transaction.timestamp).toLocaleString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                },
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Amount
                            </div>
                            <div className="text-sm text-gray-800 font-medium bg-white p-2 rounded">
                              {transaction.amount} CC
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Status
                            </div>
                            <div className="bg-white p-2 rounded">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                Completed
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end items-center mt-3 pt-3 border-t border-purple-200">
                          <a
                            href={`https://explorer.comiccoin.network/transaction/${transaction.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-800 inline-flex items-center p-2 hover:bg-purple-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                            aria-label={`View transaction ${transaction.id.substring(0, 8)} in explorer (opens in new tab)`}
                          >
                            <span className="mr-1.5">View in Explorer</span>
                            <ExternalLink size={14} aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Skip to top button - appears when scrolled down */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 md:hidden"
        aria-label="Scroll to top"
        style={{
          display: "none",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        /* iOS-specific optimizations */
        @supports (-webkit-touch-callout: none) {
          .touch-manipulation {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }

          /* Add padding at the bottom for iOS safe areas */
          body {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
};

// Wrap the component with the auth HOC and wallet HOC
const TransactionsPage = withWallet(TransactionsPageContent);
export default TransactionsPage;
