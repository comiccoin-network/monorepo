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
  ChevronDown,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";

import AppTopNavigation from "../components/AppTopNavigation";
import AppFooter from "../components/AppFooter";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../api/endpoints/dashboardApi";
import withProfileVerification from "../components/withProfileVerification";

// Integrated Hero and Countdown component
// Improved HeroCountdown component with better visual contrast
const HeroCountdown = ({ nextClaimTime, canClaim, userName, onClaimClick }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [expanded, setExpanded] = useState(true);

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

  // Get time display
  const getTimeDisplay = () => {
    if (canClaim) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-medium text-purple-900 mb-4">
            Your coins are ready to claim!
          </span>
          <button
            onClick={onClaimClick}
            className="px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition-colors text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            Claim Your Coins Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <div className="text-purple-900 text-base sm:text-lg font-medium mb-4">
          Next Claim Available In:
        </div>
        <div className="flex justify-center gap-3">
          <div className="text-center">
            <div className="bg-purple-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {padZero(timeRemaining.hours)}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-purple-800 mt-1 block">
              hours
            </span>
          </div>
          <div className="text-center">
            <div className="bg-purple-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {padZero(timeRemaining.minutes)}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-purple-800 mt-1 block">
              minutes
            </span>
          </div>
          <div className="text-center">
            <div className="bg-purple-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {padZero(timeRemaining.seconds)}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-purple-800 mt-1 block">
              seconds
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-lg text-indigo-200 max-w-xl mx-auto mb-6">
            Track your coins and claim daily rewards
          </p>

          <div className="inline-block">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors mb-2 mx-auto"
              aria-expanded={expanded}
              aria-controls="countdown-timer"
            >
              <span>{expanded ? "Hide Timer" : "Show Timer"}</span>
              <ChevronDown
                className={`w-5 h-5 transform transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {expanded && (
            <div
              id="countdown-timer"
              className="bg-white rounded-xl p-6 max-w-lg mx-auto mt-3 shadow-lg"
              aria-live="polite"
            >
              {getTimeDisplay()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for cards
const SkeletonCard = () => (
  <div
    className="bg-white rounded-xl p-6 shadow-md border border-purple-100"
    aria-hidden="true"
  >
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeButton, setActiveButton] = useState(null);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useDashboard();

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
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <AppTopNavigation />
        <div
          className="container mx-auto px-4 py-6 max-w-7xl"
          aria-busy="true"
          aria-label="Loading dashboard content"
        >
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-indigo-200 rounded-lg max-w-md mx-auto mb-4"></div>
            <div className="h-4 bg-indigo-100 rounded-lg max-w-sm mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 animate-pulse bg-white rounded-xl p-6 shadow-md border border-purple-100">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-pulse bg-white rounded-xl p-6 shadow-md border border-purple-100">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-36 w-36 bg-gray-200 rounded-lg mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <AppTopNavigation />
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div
            className="bg-white rounded-xl p-8 shadow-md border border-red-100"
            role="alert"
            aria-labelledby="error-title"
          >
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
                <AlertCircle
                  className="h-8 w-8 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <h3
                id="error-title"
                className="text-xl font-medium text-gray-900 mb-2"
              >
                Error Loading Dashboard
              </h3>
              <p className="text-gray-600 mb-6">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 inline-flex items-center"
                aria-label="Try loading dashboard again"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <AppTopNavigation />
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div
            className="bg-white rounded-xl p-8 shadow-md border border-yellow-100"
            role="alert"
            aria-labelledby="no-data-title"
          >
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-100">
                <AlertCircle
                  className="h-8 w-8 text-yellow-600"
                  aria-hidden="true"
                />
              </div>
              <h3
                id="no-data-title"
                className="text-xl font-medium text-gray-900 mb-2"
              >
                No Dashboard Data
              </h3>
              <p className="text-gray-600 mb-6">
                Unable to retrieve your dashboard information
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 inline-flex items-center"
                aria-label="Refresh dashboard data"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  const walletAddress =
    dashboardData.wallet_address ||
    "0x0000000000000000000000000000000000000000";

  // Main dashboard UI
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <AppTopNavigation />

      <main id="main-content" className="flex-grow">
        {/* Integrated Hero and Countdown */}
        <HeroCountdown
          nextClaimTime={dashboardData.next_claim_time}
          canClaim={dashboardData.can_claim}
          userName={user?.name || user?.first_name || "Comic Enthusiast"}
          onClaimClick={() => navigate("/claim-coins")}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Faucet Balance Card */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-medium text-gray-600 mb-2">
                    Faucet Balance
                  </h2>
                  <p className="text-2xl font-semibold text-purple-700">
                    {dashboardData.faucet_balance.toLocaleString()} CC
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Coins
                    className="h-6 w-6 text-purple-600"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Your Balance Card */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-medium text-gray-600 mb-2">
                    Your Balance
                  </h2>
                  <p className="text-2xl font-semibold text-purple-700">
                    {dashboardData.user_balance.toLocaleString()} CC
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Wallet
                    className="h-6 w-6 text-purple-600"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Total Claimed Card */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-medium text-gray-600 mb-2">
                    Total Claimed
                  </h2>
                  <p className="text-2xl font-semibold text-purple-700">
                    {dashboardData.total_coins_claimed.toLocaleString()} CC
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp
                    className="h-6 w-6 text-purple-600"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transaction History */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-purple-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <h2 className="text-xl font-semibold">
                      Recent Transactions
                    </h2>
                  </div>
                  {dashboardData.transactions.length > 0 && (
                    <a
                      href="/transactions"
                      className="text-white hover:text-purple-200 flex items-center gap-1 text-sm font-medium"
                    >
                      See All
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {dashboardData.transactions.length > 0 ? (
                  dashboardData.transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="p-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">
                            {tx.amount.toLocaleString()} CC
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(tx.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-purple-100">
                      <Coins
                        className="w-8 h-8 text-purple-600"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Your transaction history will appear here after you claim
                      your first ComicCoins.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Section */}
            <div className="bg-white rounded-xl shadow-md border border-purple-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  <h2 className="text-xl font-semibold">Your Wallet</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div
                    className="w-36 h-36 p-2 bg-white rounded-lg shadow-sm flex-shrink-0 border border-gray-200 mb-4"
                    role="img"
                    aria-label="QR code for your Ethereum wallet address"
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=ethereum:${walletAddress}`}
                      alt="Wallet QR Code"
                      className="w-full h-full"
                    />
                  </div>

                  <div className="w-full">
                    <p className="text-sm text-gray-600 mb-2 text-center">
                      Receive ComicCoins at:
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        readOnly
                        value={walletAddress}
                        className="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm text-gray-800 w-full"
                      />
                      <button
                        onClick={copyWalletAddress}
                        className="p-2 hover:bg-gray-100 rounded-md"
                        aria-label="Copy wallet address to clipboard"
                      >
                        <Copy className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="mt-4 text-center">
                      <a
                        href={`https://etherscan.io/address/${walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 inline-flex items-center text-sm"
                      >
                        View on Etherscan
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default withProfileVerification(DashboardPage);
