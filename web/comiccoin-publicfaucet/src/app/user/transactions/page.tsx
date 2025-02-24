// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/transactions/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, ArrowLeft, ArrowUpDown } from "lucide-react";
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

  // Fetch transactions data
  const { transactions, isLoading, error } = useGetTransactions({
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Handle sort
  const handleSort = (field: SortableField) => {
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
        <p className="text-gray-600">View your ComicCoin transaction history</p>
      </header>

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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((transaction, index) => (
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
                        {transaction.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-700">
                        {transaction.amount} CC
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
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
                      Your transaction history will appear here after you claim
                      your first ComicCoins.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
