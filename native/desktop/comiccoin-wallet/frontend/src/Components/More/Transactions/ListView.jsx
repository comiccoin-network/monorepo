import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Clock,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
} from "lucide-react";
import { useRecoilState } from "recoil";

import { GetTransactions } from "../../../../wailsjs/go/main/App";
import { currentOpenWalletAtAddressState } from "../../../AppState";
import useSyncStatus from "../../../Hooks/syncstatus";

function ListTransactionsView() {
  // Global State
  const [currentOpenWalletAtAddress] = useRecoilState(
    currentOpenWalletAtAddressState,
  );
  const isSyncing = useSyncStatus();

  // Component states
  const [isLoading, setIsLoading] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [wasSyncing, setWasSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to fetch transactions data
  const fetchTransactions = async () => {
    if (!currentOpenWalletAtAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("📊 Fetching transactions...");
      const txsResponse = await GetTransactions(currentOpenWalletAtAddress);
      console.log("✅ Transactions fetched successfully:", txsResponse);
      setTransactions(txsResponse);
    } catch (error) {
      console.error("❌ Failed to fetch transactions:", error);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle sync status changes
  useEffect(() => {
    if (wasSyncing && !isSyncing) {
      console.log("🔄 Sync completed, refreshing transactions");
      fetchTransactions();
    }
    setWasSyncing(isSyncing);
  }, [isSyncing, wasSyncing]);

  // Initial data fetch
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isSyncing) {
      fetchTransactions();
    }
  }, [currentOpenWalletAtAddress]);

  // Helper functions
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTransactionClick = (tx) => {
    console.log("Navigating to transaction details:", tx);
    setForceURL("/more/transaction/" + tx.timestamp);
  };

  // Handle navigation
  if (forceURL) {
    return <Navigate to={forceURL} />;
  }

  // Render loading state while syncing
  if (isSyncing) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 mb-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Syncing transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 mb-24">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12">
          <div className="text-center">
            <h3 className="text-red-800 font-medium mb-2">
              Error Loading Transactions
            </h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-2xl mx-auto px-6 py-12 mb-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Clock className="w-5 h-5 text-purple-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                All Transactions
              </h2>
            </div>
          </div>

          {/* Show loading state while fetching initial data */}
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions yet
              </h3>
              <p className="text-gray-500">
                Your transaction history will appear here once you start sending
                or receiving CC.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx) => {
                const isReceived =
                  tx.to.toLowerCase() ===
                  currentOpenWalletAtAddress.toLowerCase();
                const totalValue =
                  parseFloat(tx.value) - (isReceived ? parseFloat(tx.fee) : 0);

                return (
                  <button
                    key={`${tx.timestamp}-${tx.value}`}
                    onClick={() => handleTransactionClick(tx)}
                    className="w-full p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${isReceived ? "bg-green-100" : "bg-red-100"}`}
                        >
                          {isReceived ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-semibold ${isReceived ? "text-green-600" : "text-red-600"}`}
                            >
                              {isReceived ? "+" : "-"}
                              {totalValue} CC
                            </p>
                            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                              {tx.type.toUpperCase()}
                            </span>
                            {!isReceived && (
                              <span className="text-xs text-gray-500">
                                (Fee: {tx.fee} CC)
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            <p className="text-sm text-gray-600">
                              {isReceived ? "From:" : "To:"}{" "}
                              {formatAddress(isReceived ? tx.from : tx.to)}
                            </p>
                            <span className="hidden sm:inline text-gray-400">
                              •
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(tx.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ListTransactionsView;
