// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import {
  Coins,
  ArrowLeft,
  ArrowUpDown,
  Download,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { useGetDashboard } from "@/hooks/useGetDashboard";

// Status badge component for transaction status
const StatusBadge = ({ status }) => {
  const statusConfig = {
    completed: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="w-4 h-4 mr-1" />,
      label: "Completed",
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="w-4 h-4 mr-1" />,
      label: "Pending",
    },
    failed: {
      color: "bg-red-100 text-red-800",
      icon: <XCircle className="w-4 h-4 mr-1" />,
      label: "Failed",
    },
  };

  const config = statusConfig[status] || statusConfig.completed;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

const TransactionsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useMe();
  const filter = searchParams.get("filter") || "personal";

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState({
    field: "timestamp",
    direction: "desc",
  });
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch dashboard data to get transactions
  const { dashboard, isLoading, error, refetch } = useGetDashboard({
    refreshInterval: 60000, // Refresh every minute
  });

  // Prepare transactions data
  const transactions = dashboard?.transactions || [];

  // Apply filters and sorting
  const filteredTransactions = transactions
    .filter((tx) => filterStatus === "all" || tx.status === filterStatus)
    .sort((a, b) => {
      const aValue = a[sortBy.field];
      const bValue = b[sortBy.field];
      const direction = sortBy.direction === "asc" ? 1 : -1;

      if (sortBy.field === "timestamp") {
        return direction * (new Date(aValue) - new Date(bValue));
      }

      if (typeof aValue === "string") {
        return direction * aValue.localeCompare(bValue);
      }

      return direction * (aValue - bValue);
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Format date/time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle sort
  const handleSort = (field) => {
    setSortBy({
      field,
      direction:
        sortBy.field === field && sortBy.direction === "asc" ? "desc" : "asc",
    });
  };

  if (isLoading)
    return (
      <div className="py-8 text-center">
        Loading your transaction history...
      </div>
    );
  if (error)
    return <div className="py-8 text-center">Error: {error.message}</div>;
  if (!dashboard)
    return <div className="py-8 text-center">No data available</div>;

  return (
    <div className="py-8">
      {/* Header with navigation back to dashboard */}
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href="/user/dashboard"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mr-4"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-purple-800">
            Transaction History
          </h1>
        </div>
        <p className="text-gray-600">
          View and manage your ComicCoin transaction history
        </p>
      </header>

      {/* Filters and controls */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-purple-100 flex flex-wrap items-center justify-between gap-4">
        {/* Status filter */}
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-purple-600 mr-2" aria-hidden="true" />
          <span className="mr-2 text-sm text-gray-700">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-300 rounded-md text-sm py-1 px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            aria-label="Filter by status"
          >
            <option value="all">All Transactions</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Items per page */}
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-700">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-white border border-gray-300 rounded-md text-sm py-1 px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            aria-label="Items per page"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Export button (placeholder) */}
        <button
          className="inline-flex items-center px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Export transactions"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-purple-100 mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("timestamp")}
                >
                  <div className="flex items-center">
                    <span>Date & Time</span>
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Transaction ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center">
                    <span>Amount</span>
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id || index}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {formatAddress(transaction.hash || transaction.id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-700">
                        {transaction.amount} CC
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status || "completed"} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`https://explorer.comiccoin.network/tx/${transaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-900"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-purple-50">
                      <Coins
                        className="w-6 h-6 text-purple-600"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      No transactions found
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      {filterStatus !== "all"
                        ? `No ${filterStatus} transactions found. Try changing your filters.`
                        : "Your transaction history will appear here after you claim your first ComicCoins."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-purple-100">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(endIndex, filteredTransactions.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium">{filteredTransactions.length}</span>{" "}
            transactions
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
