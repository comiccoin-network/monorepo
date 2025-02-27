import React, { useState, useEffect, useCallback } from "react";
import { Coins, TrendingUp, Wallet, ArrowRight, Copy, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";

// Import custom hooks
import { useMe } from "../hooks/useMe";
import { useDashboard } from "../hooks/useDashboard";
import { withAuth } from "../hocs/withAuth";
import withWallet from '../hocs/withWallet';

// Type definitions
interface Claim {
  id: string;
  timestamp: Date;
  amount: number;
  address: string;
  status: "completed" | "pending";
  hash: string;
}

// CountdownTimer component with improved accessibility
const CountdownTimer: React.FC<{
  nextClaimTime: string;
  canClaim: boolean;
}> = ({ nextClaimTime, canClaim }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  const calculateTimeRemaining = useCallback(() => {
    if (canClaim) {
      setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const now = new Date().getTime();
    const nextTime = new Date(nextClaimTime).getTime();
    const difference = Math.max(0, nextTime - now);

    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setTimeRemaining({ hours, minutes, seconds });
  }, [nextClaimTime, canClaim]);

  useEffect(() => {
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeRemaining]);

  // For screen readers to announce time remaining
  const timeRemainingText = canClaim
    ? "Your next claim is available now"
    : `Time until next claim: ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes, and ${timeRemaining.seconds} seconds`;

  return (
    <div className="text-center" aria-live="polite">
      <h2 className="text-sm font-medium text-gray-600 mb-2">Next Claim Available In</h2>
      <span className="sr-only">{timeRemainingText}</span>
      {canClaim ? (
        <div className="text-green-500 font-bold text-xl" aria-hidden="true">Available Now!</div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2 text-purple-700 font-mono" aria-hidden="true">
          <div className="bg-purple-50 px-3 py-2 rounded-lg">
            <span className="text-xl font-bold">{String(timeRemaining.hours).padStart(2, "0")}</span>
            <span className="text-xs block">hours</span>
          </div>
          <div className="bg-purple-50 px-3 py-2 rounded-lg">
            <span className="text-xl font-bold">{String(timeRemaining.minutes).padStart(2, "0")}</span>
            <span className="text-xs block">mins</span>
          </div>
          <div className="bg-purple-50 px-3 py-2 rounded-lg">
            <span className="text-xl font-bold">{String(timeRemaining.seconds).padStart(2, "0")}</span>
            <span className="text-xs block">secs</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ClaimsList component with improved accessibility
const ClaimsList: React.FC<{ claims: Claim[] }> = ({ claims }) => {
  if (claims.length === 0) {
    return <div className="text-center text-gray-500 py-4">No claims found</div>;
  }

  return (
    <div className="overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200" role="list" aria-label="Transaction history">
        {claims.map((claim) => {
          const formattedDate = claim.timestamp.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <li key={claim.id} className="px-1 py-4 sm:px-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {claim.amount} CC
                  </p>
                  <p className="text-sm text-gray-500">
                    {formattedDate}
                  </p>
                </div>
                <div className="text-right flex flex-col justify-between items-end">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      claim.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                    role="status"
                  >
                    {claim.status === "completed" ? "Completed" : "Pending"}
                  </span>
                  {claim.hash && (
                    <a
                      href={`https://etherscan.io/tx/${claim.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 hover:text-purple-800 mt-1 flex items-center"
                      aria-label={`View transaction ${claim.hash.substring(0, 6)}... on Etherscan`}
                    >
                      <span className="mr-1">View</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Skeleton loader for cards with proper aria attributes
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm" aria-hidden="true">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Main Dashboard Component
const DashboardPageContent: React.FC = () => {
  const { user } = useMe();
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Use a reasonable refresh interval (30 seconds) to avoid hammering the API
  const { dashboard, isLoading, error, refetch } = useDashboard({
    refreshInterval: 30000,
  });

  const navigateTo = useCallback((path: string) => {
    window.location.href = path;
  }, []);

  // Add touch-friendly button behavior
  const handleTouchStart = (buttonId: string) => {
    setActiveButton(buttonId);
  };

  const handleTouchEnd = () => {
    setActiveButton(null);
  };

  // Copy wallet address function with proper error handling
  const copyWalletAddress = () => {
    const walletAddress = user?.wallet_address || "0x0000000000000000000000000000000000000000";
    const displayAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

    try {
      // Use Clipboard API with fallback
      if (navigator.clipboard) {
        navigator.clipboard.writeText(walletAddress)
          .then(() => {
            toast.success(`Wallet address copied: ${displayAddress}`, {
              autoClose: 2000,
              position: "bottom-center"
            });
          })
          .catch(err => {
            console.error('Failed to copy: ', err);
            toast.error("Failed to copy wallet address");
          });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = walletAddress;
        // Ensure element is not visible
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          toast.success(`Wallet address copied: ${displayAddress}`, {
            autoClose: 2000,
            position: "bottom-center"
          });
        } else {
          toast.error("Failed to copy wallet address");
        }
      }
    } catch (err) {
      console.error('Copy error: ', err);
      toast.error("Failed to copy wallet address");
    }
  };

  // Add gradient background to body
  useEffect(() => {
    // Set background gradient on body for full page coverage
    document.body.classList.add('bg-gradient-to-b', 'from-purple-100', 'via-indigo-50', 'to-white');
    document.body.style.minHeight = '100vh';

    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('bg-gradient-to-b', 'from-purple-100', 'via-indigo-50', 'to-white');
      document.body.style.minHeight = '';
    };
  }, []);

  // Display loading state with proper aria attributes
  if (isLoading && !dashboard) {
    return (
      <div className="container mx-auto px-4 sm:px-0 py-8 space-y-6" aria-busy="true" aria-label="Loading dashboard content">
        <div className="animate-pulse flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2" aria-hidden="true"></div>
            <div className="h-4 bg-gray-200 rounded w-40" aria-hidden="true"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 mt-4 sm:mt-0" aria-hidden="true"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm" aria-hidden="true">
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
    );
  }

  // Display error state with proper aria attributes
  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-0 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm" role="alert" aria-labelledby="error-title">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 id="error-title" className="text-lg font-medium text-gray-900">Error Loading Dashboard</h3>
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
    );
  }

  // Display no data state with proper aria attributes
  if (!dashboard) {
    return (
      <div className="container mx-auto px-4 sm:px-0 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm" role="alert" aria-labelledby="no-data-title">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 id="no-data-title" className="text-lg font-medium text-gray-900">No Dashboard Data</h3>
            <p className="mt-2 text-gray-600">Unable to retrieve your dashboard information</p>
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
    );
  }

  // Get the wallet address from user
  const walletAddress = user?.wallet_address || "0x0000000000000000000000000000000000000000";
  const displayAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  // Convert transactions to claims - Using a safe approach to handle type differences
  const transactionClaims: Claim[] = dashboard.transactions
    ? dashboard.transactions.map((tx: any) => {
        // Using 'any' temporarily to safely access properties
        return {
          id: tx.id || '',
          timestamp: new Date(tx.timestamp || Date.now()),
          amount: typeof tx.amount === 'number' ? tx.amount : 0,
          address: walletAddress,
          status: tx.status || "completed",
          hash: tx.hash || "",
        };
      })
    : [];

  return (
    <div className="container mx-auto px-4 sm:px-0 py-6">
      {/* Header with Claim Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || "Comic Enthusiast"}!
          </h1>
          <p className="text-gray-600">
            Claim your free ComicCoins every 24 hours
          </p>
        </div>
        <button
          className={`mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-3 sm:py-2 rounded-lg text-white gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
            dashboard.can_claim
              ? "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 active:bg-purple-800"
              : "bg-gray-400 cursor-not-allowed"
          } ${activeButton === 'claim' ? 'bg-purple-800' : ''}`}
          onClick={() => navigateTo("/user/claim-coins")}
          disabled={!dashboard.can_claim}
          onTouchStart={() => handleTouchStart('claim')}
          onTouchEnd={handleTouchEnd}
          aria-disabled={!dashboard.can_claim}
          aria-label={dashboard.can_claim ? "Claim your ComicCoins now" : "Wait until next claim is available"}
        >
          <Coins className="w-4 h-4" aria-hidden="true" />
          <span>
            {dashboard.can_claim ? "Claim Coins" : "Wait to Claim"}
          </span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Faucet Balance Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Faucet Balance</h2>
              <p className="mt-1 text-2xl font-semibold text-purple-700">{dashboard.faucet_balance} CC</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Coins className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Your Balance Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Your Balance</h2>
              <p className="mt-1 text-2xl font-semibold text-purple-700">{dashboard.user_balance} CC</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Wallet className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Total Claimed Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Total Claimed</h2>
              <p className="mt-1 text-2xl font-semibold text-purple-700">{dashboard.total_coins_claimed} CC</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <CountdownTimer
          nextClaimTime={dashboard.next_claim_time}
          canClaim={dashboard.can_claim}
        />
      </div>

      {/* Your Claims Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900" id="claims-heading">
              Your Claims
            </h2>
            {transactionClaims.length > 0 && (
              <button
                onClick={() => navigateTo("/user/transactions?filter=personal")}
                className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm"
                aria-label="View all your claims history"
              >
                See More
                <ArrowRight
                  className="w-4 h-4"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
        <div className="px-4 py-3 sm:px-5" aria-labelledby="claims-heading">
          {transactionClaims.length > 0 ? (
            <ClaimsList claims={transactionClaims.slice(0, 5)} />
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-purple-100">
                <Coins
                  className="w-6 h-6 text-purple-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No claims yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Your transaction history will appear here after you claim your
                first ComicCoins. Click the "Claim Coins" button above to get
                started!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900" id="wallet-heading">
            Your Wallet
          </h2>
        </div>
        <div className="p-5" aria-labelledby="wallet-heading">
          <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6">
            <div
              className="w-48 h-48 p-2 mb-4 md:mb-0 bg-white rounded-xl shadow-sm flex-shrink-0 border border-gray-100"
              role="img"
              aria-label={`QR code for your Ethereum wallet address: ${displayAddress}`}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=ethereum:${walletAddress}`}
                alt="Wallet QR Code"
                className="w-full h-full"
              />
            </div>
            <div className="text-center md:text-left w-full">
              <p className="text-sm text-gray-600 mb-2">Receive ComicCoins at:</p>
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
                <code
                  className="bg-gray-100 px-3 py-2 rounded font-mono text-sm text-gray-800 w-full break-all"
                  tabIndex={0}
                  aria-label={`Your wallet address: ${walletAddress}`}
                >
                  {walletAddress}
                </code>
                <button
                  onClick={copyWalletAddress}
                  className="sm:ml-2 p-2 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
                  aria-label="Copy wallet address to clipboard"
                  onTouchStart={() => handleTouchStart('copy')}
                  onTouchEnd={handleTouchEnd}
                >
                  <Copy className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  <span className="sr-only">Copy to clipboard</span>
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Connect with your wallet</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Scan this QR code with your Ethereum wallet app to view your ComicCoins or send transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the component with the auth HOC and export
const DashboardPage = withAuth(withWallet(DashboardPageContent));
export default DashboardPage;
