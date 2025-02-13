// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

// Transaction type definition to include comic submission details
interface Transaction {
  id: string;
  timestamp: string;
  address: string;
  amount: number;
  status: "completed" | "pending" | "rejected";
  hash: string;
  submission: {
    id: string;
    name: string;
    frontCover: {
      objectUrl: string;
    };
    backCover: {
      objectUrl: string;
    };
    reason?: string;
  };
}

// Mock data for prototyping - replace with actual API calls
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    amount: 500,
    status: "completed",
    hash: "0xabcd1234...",
    submission: {
      id: "sub_1",
      name: "Amazing Spider-Man #123",
      frontCover: {
        objectUrl: "/api/placeholder/200/300",
      },
      backCover: {
        objectUrl: "/api/placeholder/200/300",
      },
    },
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    address: "0x123f681aD6E5914e58774E56686dfE01234a6542",
    amount: 750,
    status: "pending",
    hash: "0x9876abcd...",
    submission: {
      id: "sub_2",
      name: "Batman: The Dark Knight #45",
      frontCover: {
        objectUrl: "/api/placeholder/200/300",
      },
      backCover: {
        objectUrl: "/api/placeholder/200/300",
      },
    },
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    address: "0x8293dF54c8A7278B24578Fe7E8585aFf69c984E2",
    amount: 0,
    status: "rejected",
    hash: "0xdef45678...",
    submission: {
      id: "sub_3",
      name: "Superman #789",
      frontCover: {
        objectUrl: "/api/placeholder/200/300",
      },
      backCover: {
        objectUrl: "/api/placeholder/200/300",
      },
      reason: "Image quality too low to verify comic authenticity",
    },
  },
];

function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, tokens } = useAuthStore();
  const { user } = useMe();

  // State management for dashboard data
  const [faucetBalance, setFaucetBalance] = useState(100000);
  const [userBalance, setUserBalance] = useState(0);
  const [distributionRate, setDistributionRate] = useState(2500);
  const [recentTransactions, setRecentTransactions] =
    useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate fetching initial data
    setUserBalance(Math.floor(Math.random() * 5000));
  }, []);

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          text: "Approved",
          bgColor: "bg-green-50",
          textColor: "text-green-700",
        };
      case "pending":
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />,
          text: "In Review",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-700",
        };
      case "rejected":
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: "Rejected",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          text: "Unknown",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
        };
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    router.push(`/user/submissions/${transaction.submission.id}`);
  };

  return (
    <div className="py-8">
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
            Submit your comic book covers to earn ComicCoins
          </p>
        </div>
        <button
          onClick={() => router.push("/user/submit")}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Submit Comic
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

      {/* Recent Submissions & Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-purple-800">
            Recent Submissions
          </h2>
          <div className="flex items-center text-sm text-gray-500">
            <History className="h-4 w-4 mr-1" />
            Auto-updating
          </div>
        </div>

        <div className="space-y-4">
          {recentTransactions.map((tx) => {
            const statusInfo = getStatusInfo(tx.status);
            return (
              <div
                key={tx.id}
                onClick={() => handleTransactionClick(tx)}
                className={`flex items-center justify-between p-4 rounded-lg ${statusInfo.bgColor} hover:bg-opacity-75 transition-colors cursor-pointer`}
              >
                {/* Left side - Status and Comic Info */}
                <div className="flex items-center space-x-4">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-24 rounded-md overflow-hidden">
                    <img
                      src={tx.submission.frontCover.objectUrl}
                      alt={tx.submission.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Comic Details */}
                  <div>
                    <div className="font-medium text-gray-900">
                      {tx.submission.name}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {statusInfo.icon}
                      <span className={`text-sm ${statusInfo.textColor}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 block mt-1">
                      {new Date(tx.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right side - Reward Amount */}
                <div className="flex items-center space-x-4">
                  {tx.status === "completed" && (
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-purple-600" />
                      <span className="font-bold text-purple-700">
                        {tx.amount.toLocaleString()} CC
                      </span>
                    </div>
                  )}
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/user/submissions")}
            className="text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2"
          >
            View All Submissions
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
