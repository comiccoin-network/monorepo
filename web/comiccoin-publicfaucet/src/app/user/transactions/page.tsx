// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/transactions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Coins, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

import { useGetTransactions, Transaction } from "@/hooks/useGetTransactions";

// Define valid sorting fields as a subset of keys from Transaction
type SortableField = keyof Pick<Transaction, "timestamp" | "amount">;

// Define sort direction
type SortDirection = "asc" | "desc";

// Define sort state
interface SortState {
  field: SortableField;
  direction: SortDirection;
}

const TransactionsPage = () => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortState>({
    field: "timestamp",
    direction: "desc",
  });
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  // Prevent iOS scroll bounce
  useEffect(() => {
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.body.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });

    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.removeEventListener("touchmove", preventTouchMove);
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";
    };
  }, []);

  // Fetch transactions data
  const { transactions, isLoading, error, refetch } = useGetTransactions({
    refreshInterval: 60000, // Refresh every minute
  });

  // Apply sorting
  const sortedTransactions = [...transactions].sort((a, b) => {
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

  // Format date/time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

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
      className="min-h-screen bg-purple-50 py-4 px-4 touch-manipulation"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <Link
              href="/user/dashboard"
              className="mr-3 text-purple-600 hover:text-purple-800"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-purple-800">
              Transactions
            </h1>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Your ComicCoin transaction history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSort("timestamp")}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors"
          >
            {sortBy.field === "timestamp" && sortBy.direction === "asc" ? (
              <ChevronUp className="w-4 h-4 text-purple-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-600" />
            )}
          </button>
          <button
            onClick={() => handleSort("amount")}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors"
          >
            {sortBy.field === "amount" && sortBy.direction === "asc" ? (
              <ChevronUp className="w-4 h-4 text-purple-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-600" />
            )}
          </button>
        </div>
      </header>

      {/* Transactions Section */}
      <div className="space-y-4">
        {transactions.length === 0 ? (
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
          </div>
        ) : (
          sortedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
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
              </div>
              {expandedTransaction === transaction.id && (
                <div className="px-4 pb-4 bg-purple-50">
                  <div className="border-t border-purple-200 pt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="text-gray-800 font-mono">
                        {transaction.id}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
