"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import {
  Coins,
  Wallet,
  Clock,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  QrCode,
} from "lucide-react";
import Link from "next/link";

import { useGetDashboard } from "@/hooks/useGetDashboard";
import { useGetTransactions } from "@/hooks/useGetTransactions";

const WalletPage = () => {
  const router = useRouter();
  const { user } = useMe();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // Fetch dashboard data to get wallet info
  const { dashboard, isLoading, error, refetch } = useGetDashboard({
    refreshInterval: 60000, // Refresh every minute
  });

  // Fetch transactions
  const {
    transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useGetTransactions();

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return "No wallet connected";
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  // Handle copy wallet address
  const copyToClipboard = () => {
    if (!dashboard?.wallet_address) return;

    navigator.clipboard.writeText(dashboard.wallet_address.toString());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Handle refresh wallet data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), refetchTransactions()]);
    setIsRefreshing(false);
  };

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

  if (isLoading)
    return <div className="py-8 text-center">Loading your wallet data...</div>;
  if (error)
    return <div className="py-8 text-center">Error: {error.message}</div>;
  if (!dashboard)
    return <div className="py-8 text-center">No wallet data available</div>;

  return (
    <div className="py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-purple-800 mb-2">
              My Wallet
            </h1>
            <p className="text-gray-600" role="doc-subtitle">
              Manage your ComicCoin wallet and view your balance
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh wallet data"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Wallet Card - Left Column (1/3) */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              Wallet Address
            </h2>
            <button
              onClick={() => setShowQrCode(!showQrCode)}
              className="p-2 hover:bg-purple-50 rounded-full text-purple-600 transition-colors"
              aria-label="Show QR code"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>

          {/* QR Code (conditionally rendered) */}
          {showQrCode && (
            <div className="mb-6 flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ethereum:${dashboard?.wallet_address || ""}`}
                  alt="Wallet QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>
          )}

          {/* Wallet Address Display */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-6">
            <code className="text-sm font-mono text-gray-800 flex-1 break-all">
              {dashboard?.wallet_address?.toString() || "No wallet connected"}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-purple-50 rounded-full transition-colors flex-shrink-0"
              aria-label="Copy wallet address"
            >
              {copySuccess ? (
                <span className="text-green-500 text-xs font-medium">
                  Copied!
                </span>
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* Wallet Balance */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Current Balance
            </h3>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">
                {dashboard?.user_balance || 0} CC
              </span>
            </div>
          </div>

          {/* Total Claimed */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Claimed
            </h3>
            <div className="text-xl font-semibold text-gray-800">
              {dashboard?.total_coins_claimed || 0} CC
            </div>
          </div>

          {/* View on Explorer Link */}
          <a
            href={`https://explorer.comiccoin.network/address/${dashboard?.wallet_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mt-4"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View on Explorer</span>
          </a>
        </div>

        {/* Transaction History - Right Column (2/3) */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-purple-800">
              Recent Transactions
            </h2>
            <Link
              href="/user/transactions"
              className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
            >
              View All
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          {/* Transactions List */}
          {isLoadingTransactions ? (
            <div className="py-8 text-center">
              <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {transactions.slice(0, 5).map((tx, index) => (
                <div key={tx.id || index} className="py-4 flex items-center">
                  <div className="bg-purple-100 rounded-full p-2 mr-4">
                    <ArrowDownLeft className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-900">
                        Claimed ComicCoins
                      </span>
                      <span className="font-semibold text-purple-700">
                        {tx.amount} CC
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {formatDate(tx.timestamp)}
                      </span>
                      <span className="text-gray-500">
                        ID: {tx.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-purple-50">
                <Coins className="w-6 h-6 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No transactions yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Your transaction history will appear here after you claim your
                first ComicCoins.
              </p>
              {dashboard?.can_claim && (
                <div className="mt-6">
                  <Link
                    href="/user/claim-coins"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Claim Coins
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Next Claim Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
        <h2 className="text-lg font-semibold text-purple-800 mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          Next Claim Information
        </h2>

        {dashboard?.can_claim ? (
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div>
              <p className="text-green-600 font-medium mb-2">
                You can claim ComicCoins now!
              </p>
              <p className="text-gray-600">
                Claim your daily reward to increase your balance.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/user/claim-coins"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors gap-2"
              >
                <Coins className="h-5 w-5" />
                Claim Coins
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Next claim available:</p>
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <span className="font-mono text-lg text-purple-800">
                {formatDate(dashboard?.next_claim_time)}
              </span>
            </div>
            <p className="text-gray-500 mt-4">
              You can claim ComicCoins once every 24 hours. Your last claim was
              at {formatDate(dashboard?.last_claim_time)}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
