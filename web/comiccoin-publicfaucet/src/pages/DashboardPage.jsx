// src/pages/DashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Coins,
  TrendingUp,
  Wallet,
  ArrowRight,
  Copy,
  ExternalLink,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";

import TopNavigation from "../components/TopNavigation";
import AppFooter from "../components/AppFooter";
import withWallet from "../components/withWallet";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../api/endpoints/dashboardApi";

// CountdownTimer component for a better timer display
const CountdownTimer = ({ nextClaimTime, canClaim }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeRemaining = useCallback(() => {
    if (canClaim) {
      setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const now = new Date().getTime();
    const nextTime = new Date(nextClaimTime).getTime();
    const difference = Math.max(0, nextTime - now);

    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setTimeRemaining({ hours, minutes, seconds });
  }, [nextClaimTime, canClaim]);

  useEffect(() => {
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeRemaining]);

  // Format display with leading zeros
  const padZero = (num) => String(num).padStart(2, "0");

  if (canClaim) {
    return (
      <div className="text-center py-4">
        <h2 className="text-sm font-medium text-gray-600 mb-2">
          Next Claim Available
        </h2>
        <div className="text-green-500 font-bold text-xl">Available Now!</div>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <h2 className="text-sm font-medium text-gray-600 mb-4">
        Next Claim Available In
      </h2>
      <div className="flex justify-center gap-2">
        <div className="text-center">
          <div className="bg-purple-50 px-3 py-2 rounded-lg">
            <span className="text-xl font-bold text-purple-700">
              {padZero(timeRemaining.hours)}
            </span>
          </div>
          <span className="text-xs text-purple-600 mt-1 block">hours</span>
        </div>
        <div className="text-center">
          <div className="bg-purple-50 px-3 py-2 rounded-lg">
            <span className="text-xl font-bold text-purple-700">
              {padZero(timeRemaining.minutes)}
            </span>
          </div>
          <span className="text-xs text-purple-600 mt-1 block">mins</span>
        </div>
        <div className="text-center">
          <div className="bg-purple-50 px-3 py-2 rounded-lg">
            <span className="text-xl font-bold text-purple-700">
              {padZero(timeRemaining.seconds)}
            </span>
          </div>
          <span className="text-xs text-purple-600 mt-1 block">secs</span>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for cards
const SkeletonCard = () => (
  <div className="bg-white rounded-lg p-4 shadow-sm" aria-hidden="true">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeButton, setActiveButton] = useState(null);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useDashboard();

  // Handle UI interaction for buttons
  const handleTouchStart = (buttonId) => {
    setActiveButton(buttonId);
  };

  const handleTouchEnd = () => {
    setActiveButton(null);
  };

  // Copy wallet address function
  const copyWalletAddress = () => {
    if (!dashboardData?.wallet_address) return;

    const walletAddress = dashboardData.wallet_address;
    const displayAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

    try {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(walletAddress)
          .then(() => {
            toast.success(`Wallet address copied: ${displayAddress}`, {
              autoClose: 2000,
              position: "bottom-center",
            });
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
            toast.error("Failed to copy wallet address");
          });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = walletAddress;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          toast.success(`Wallet address copied: ${displayAddress}`, {
            autoClose: 2000,
            position: "bottom-center",
          });
        } else {
          toast.error("Failed to copy wallet address");
        }
      }
    } catch (err) {
      console.error("Copy error: ", err);
      toast.error("Failed to copy wallet address");
    }
  };

  // Format a timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Loading state with skeletons
  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopNavigation />
        <div
          className="container mx-auto px-4 py-6 max-w-5xl"
          aria-busy="true"
          aria-label="Loading dashboard content"
        >
          <div className="animate-pulse flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32 mt-4 sm:mt-0"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="flex justify-center space-x-2">
                <div className="h-16 bg-gray-200 rounded w-16"></div>
                <div className="h-16 bg-gray-200 rounded w-16"></div>
                <div className="h-16 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div
            className="bg-white rounded-lg p-6 shadow-sm"
            role="alert"
            aria-labelledby="error-title"
          >
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
                <AlertCircle
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <h3
                id="error-title"
                className="text-lg font-medium text-gray-900"
              >
                Error Loading Dashboard
              </h3>
              <p className="mt-2 text-gray-600">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="Try loading dashboard again"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div
            className="bg-white rounded-lg p-6 shadow-sm"
            role="alert"
            aria-labelledby="no-data-title"
          >
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-100">
                <AlertCircle
                  className="h-6 w-6 text-yellow-600"
                  aria-hidden="true"
                />
              </div>
              <h3
                id="no-data-title"
                className="text-lg font-medium text-gray-900"
              >
                No Dashboard Data
              </h3>
              <p className="mt-2 text-gray-600">
                Unable to retrieve your dashboard information
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                aria-label="Refresh dashboard data"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const walletAddress =
    dashboardData.wallet_address ||
    "0x0000000000000000000000000000000000000000";

  // Main dashboard UI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 max-w-5xl flex-grow">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back,{" "}
              {user?.name || user?.first_name || "Comic Enthusiast"}!
            </h1>
            <p className="text-gray-600">
              Claim your free ComicCoins every 24 hours
            </p>
          </div>

          {/* Mobile-only Claim Button */}
          <div className="sm:hidden mt-4">
            <button
              className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-white gap-2
                ${
                  dashboardData.can_claim
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              onClick={() => navigate("/claim-coins")}
              disabled={!dashboardData.can_claim}
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>
                {dashboardData.can_claim ? "Claim Coins" : "Wait to Claim"}
              </span>
            </button>
          </div>

          {/* Desktop Claim Button */}
          <div className="hidden sm:block">
            <button
              className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white gap-2
                ${
                  dashboardData.can_claim
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              onClick={() => navigate("/claim-coins")}
              disabled={!dashboardData.can_claim}
              aria-disabled={!dashboardData.can_claim}
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>
                {dashboardData.can_claim ? "Claim Coins" : "Wait to Claim"}
              </span>
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Faucet Balance Card */}
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-medium text-gray-600">
                  Faucet Balance
                </h2>
                <p className="mt-1 text-2xl font-semibold text-purple-700">
                  {dashboardData.faucet_balance.toLocaleString()} CC
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Coins className="h-5 w-5 text-purple-600" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Your Balance Card */}
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-medium text-gray-600">
                  Your Balance
                </h2>
                <p className="mt-1 text-2xl font-semibold text-purple-700">
                  {dashboardData.user_balance.toLocaleString()} CC
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Wallet
                  className="h-5 w-5 text-purple-600"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Total Claimed Card */}
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-medium text-gray-600">
                  Total Claimed
                </h2>
                <p className="mt-1 text-2xl font-semibold text-purple-700">
                  {dashboardData.total_coins_claimed.toLocaleString()} CC
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <TrendingUp
                  className="h-5 w-5 text-purple-600"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <CountdownTimer
            nextClaimTime={dashboardData.next_claim_time}
            canClaim={dashboardData.can_claim}
          />
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Transaction History
              </h2>
              {dashboardData.transactions.length > 0 && (
                <a
                  href="/transactions"
                  className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm"
                >
                  See More
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {dashboardData.transactions.length > 0 ? (
              dashboardData.transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="p-4 sm:px-5">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {tx.amount.toLocaleString()} CC
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-purple-100">
                  <Coins
                    className="w-6 h-6 text-purple-600"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No transactions yet
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Your transaction history will appear here after you claim your
                  first ComicCoins.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Wallet</h2>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div
                className="w-40 h-40 p-2 mx-auto md:mx-0 bg-white rounded-lg shadow-sm flex-shrink-0 border border-gray-100"
                role="img"
                aria-label="QR code for your Ethereum wallet address"
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=ethereum:${walletAddress}`}
                  alt="Wallet QR Code"
                  className="w-full h-full"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Receive ComicCoins at:
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    readOnly
                    value={walletAddress}
                    className="bg-gray-100 px-3 py-2 rounded font-mono text-sm text-gray-800 w-full"
                  />
                  <button
                    onClick={copyWalletAddress}
                    className="p-2 hover:bg-gray-100 rounded-md"
                    aria-label="Copy wallet address to clipboard"
                  >
                    <Copy className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Connect with your wallet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Scan this QR code with your Ethereum wallet app to view your
                    ComicCoins or send transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Mobile Only) */}
        <div className="flex justify-center gap-4 md:hidden mb-6">
          <button
            onClick={() => navigate("/settings")}
            className="bg-purple-50 text-purple-700 px-4 py-2 rounded-md text-sm flex-1"
          >
            Settings
          </button>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm flex-1"
          >
            Logout
          </button>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

export default withWallet(DashboardPage);
