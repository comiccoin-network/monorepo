// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";
import {
  Coins,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Upload,
  History,
} from "lucide-react";

// Mock data for prototyping - replace with actual API calls
const MOCK_TRANSACTIONS = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    amount: 500,
    status: "completed",
    hash: "0xabcd1234...",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    address: "0x123f681aD6E5914e58774E56686dfE01234a6542",
    amount: 750,
    status: "completed",
    hash: "0x9876abcd...",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    address: "0x8293dF54c8A7278B24578Fe7E8585aFf69c984E2",
    amount: 1000,
    status: "pending",
    hash: "0xdef45678...",
  },
];

function DashboardPage() {
  const { isAuthenticated, tokens } = useAuthStore();
  const { user } = useMe();
  const [faucetBalance, setFaucetBalance] = useState(100000);
  const [userBalance, setUserBalance] = useState(0);
  const [distributionRate, setDistributionRate] = useState(2500);
  const [recentTransactions, setRecentTransactions] =
    useState(MOCK_TRANSACTIONS);

  useEffect(() => {
    // Simulate fetching initial data
    setUserBalance(Math.floor(Math.random() * 5000));
  }, []);

  const formatAddress = (address) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-3xl font-bold text-purple-800"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              Welcome, {user?.name || "Comic Enthusiast"}!
            </h1>
            <p className="text-gray-600">
              Track your ComicCoin balance and faucet activity
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/user/request-coins")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            Request ComicCoins
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Faucet Balance */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-800">
                Faucet Balance
              </h2>
              <Coins className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {faucetBalance.toLocaleString()} CC
            </div>
            <div className="text-sm text-gray-500">
              Available for distribution
            </div>
          </div>

          {/* Your Balance */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-800">
                Your Balance
              </h2>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {userBalance.toLocaleString()} CC
            </div>
            <div className="text-sm text-gray-500">Current wallet balance</div>
          </div>

          {/* Distribution Rate */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-800">
                Distribution Rate
              </h2>
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {distributionRate}/hr
            </div>
            <div className="text-sm text-gray-500">Current faucet activity</div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-purple-800">
              Recent Transactions
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <History className="h-4 w-4 mr-1" />
              Auto-updating
            </div>
          </div>

          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(tx.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {formatAddress(tx.address)}
                      </span>
                      <a
                        href={`https://explorer.comiccoin.network/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-purple-700">
                    {tx.amount.toLocaleString()} CC
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* View All Link */}
          <div className="mt-6 text-center">
            <a
              href="/user/transactions"
              className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2"
            >
              View All Transactions
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
