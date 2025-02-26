import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { Coins, ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { withAuth } from "../hocs/withAuth";
import { useTransactions, Transaction } from "../hooks/useTransactions";

// Define valid sorting fields as a subset of keys from Transaction
type SortableField = keyof Pick<Transaction, "timestamp" | "amount">;

// Define sort direction
type SortDirection = "asc" | "desc";

// Define sort state
interface SortState {
  field: SortableField;
  direction: SortDirection;
}

const TransactionsPageContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState<SortState>({
    field: "timestamp",
    direction: "desc",
  });
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  // Get the filter parameter from URL query string
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const filter = queryParams.get('filter');

  // Prevent iOS scroll bounce
  useEffect(() => {
    // Use a more passive approach to prevent issues
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";
    };
  }, []);

  // Fetch transactions data with our custom hook
  const { transactions, isLoading, error, refetch } = useTransactions({
    refreshInterval: 0, // Disable auto-refresh temporarily to troubleshoot
    enabled: true,
  });

  // Filter transactions if needed based on URL parameter
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // If personal filter is applied, we could filter by user ID or other criteria
    // This is just a placeholder - implement actual filtering logic based on your requirements
    if (filter === 'personal') {
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
          direction *
          (new Date(aValue as string).getTime() -
            new Date(bValue as string).getTime())
        );
      }

      if (typeof aValue === "string") {
        return direction * aValue.localeCompare(bValue as string);
      }

      return direction * ((aValue as number) - (bValue as number));
    });
  }, [filteredTransactions, sortBy.field, sortBy.direction]);

  // Memoize the date formatter to prevent recreation on every render
  const formatDate = useMemo(() => (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, []);

  // Handle transaction expansion
  const toggleTransactionExpand = (transactionId: string) => {
    setExpandedTransaction(
      expandedTransaction === transactionId ? null : transactionId
    );
  };

  // Handle sort
  const handleSort = (field: SortableField) => {
    setSortBy({
      field,
      direction:
        sortBy.field === field && sortBy.direction === "asc" ? "desc" : "asc",
    });
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate("/user/dashboard");
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-purple-50 py-8 flex flex-col items-center justify-center">
        <div className="animate-pulse">
          <Coins className="h-12 w-12 text-purple-300 mb-4" />
        </div>
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-purple-50 py-8 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100">
            <Coins className="w-8 h-8 text-red-600" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {error.message || "Failed to load transactions"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto py-4 px-4 md:px-6 touch-manipulation"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="mr-3 text-purple-600 hover:text-purple-800 p-1 rounded-full hover:bg-purple-100"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Transactions</h1>
              <p className="text-xs text-gray-600 mt-1">
                {filter === 'personal' ? 'Your personal' : 'All'} ComicCoin transaction history
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => handleSort("timestamp")}
                className={`px-3 py-2 flex items-center text-sm ${
                  sortBy.field === "timestamp" ? "text-purple-600 font-medium" : "text-gray-600"
                }`}
              >
                <span className="mr-1">Date</span>
                {sortBy.field === "timestamp" && (
                  sortBy.direction === "asc"
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <div className="h-6 border-r border-gray-200"></div>
              <button
                onClick={() => handleSort("amount")}
                className={`px-3 py-2 flex items-center text-sm ${
                  sortBy.field === "amount" ? "text-purple-600 font-medium" : "text-gray-600"
                }`}
              >
                <span className="mr-1">Amount</span>
                {sortBy.field === "amount" && (
                  sortBy.direction === "asc"
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 rounded-full bg-white shadow-sm hover:bg-purple-50 text-purple-600"
              aria-label="Refresh transactions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Transactions Section */}
      <div className="space-y-4">
        {(!sortedTransactions || sortedTransactions.length === 0) ? (
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-purple-50">
              <Coins className="w-8 h-8 text-purple-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No transactions found
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Your transaction history will appear here after you claim your
              first ComicCoins.
            </p>
            <button
              onClick={handleBackToDashboard}
              className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {sortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="overflow-hidden"
                >
                  <div
                    onClick={() => toggleTransactionExpand(transaction.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-purple-700">
                          {transaction.amount} CC
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 ml-2 transition-transform ${
                      expandedTransaction === transaction.id ? 'rotate-180' : ''
                    }`} />
                  </div>
                  {expandedTransaction === transaction.id && (
                    <div className="px-4 pb-4 bg-purple-50">
                      <div className="border-t border-purple-200 pt-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Transaction ID</span>
                          <span className="text-gray-800 font-mono">{transaction.id}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Date & Time</span>
                          <span className="text-gray-800">{new Date(transaction.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Amount</span>
                          <span className="text-gray-800 font-medium">{transaction.amount} CC</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Status</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                            Completed
                          </span>
                        </div>
                        <div className="flex justify-end items-center mt-2 pt-2 border-t border-purple-200">
                          <a
                            href={`https://explorer.comiccoin.network/transaction/${transaction.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:text-purple-800 inline-flex items-center"
                          >
                            <span className="mr-1">View in Explorer</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap the component with the auth HOC and export
const TransactionsPage = withAuth(TransactionsPageContent);
export default TransactionsPage;
