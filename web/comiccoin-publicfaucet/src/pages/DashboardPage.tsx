import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Coins, TrendingUp, Wallet, ArrowRight, Copy } from "lucide-react";
import { toast } from "react-toastify";

// Import custom hooks
import { useMe } from "../hooks/useMe";
import { useDashboard } from "../hooks/useDashboard";
import { withAuth } from "../hocs/withAuth";

// Type definitions
interface Claim {
  id: string;
  timestamp: Date;
  amount: number;
  address: string;
  status: "completed" | "pending";
  hash: string;
}

interface UserClaimedCoinTransaction {
  id: string;
  timestamp: string;
  amount: number;
}

// CountdownTimer component
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

  return (
    <div className="text-center">
      <h2 className="text-sm text-gray-600 mb-2">Next Claim Available In</h2>
      {canClaim ? (
        <div className="text-green-500 font-bold text-xl">Available Now!</div>
      ) : (
        <div className="flex justify-center gap-2 text-purple-700 font-mono">
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

// ClaimsList component
const ClaimsList: React.FC<{
  claims: Claim[];
  isPersonal?: boolean;
}> = ({ claims, isPersonal = false }) => {
  if (claims.length === 0) {
    return <div className="text-center text-gray-500 py-4">No claims found</div>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {claims.map((claim) => (
        <li key={claim.id} className="py-3">
          <div className="flex justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {claim.amount} CC
              </p>
              <p className="text-sm text-gray-500">
                {claim.timestamp.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                  claim.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {claim.status === "completed" ? "Completed" : "Pending"}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

// Main Dashboard Component
const DashboardPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useMe();
  const [isTouchActive, setIsTouchActive] = useState(false);

  // Use the dashboard hook with 30 second refresh
  const { dashboard, isLoading, error, refetch } = useDashboard({
    refreshInterval: 30000,
  });

  const navigateTo = useCallback((path: string) => {
    window.location.href = path;
  }, []);

  // Display loading state
  if (isLoading && !dashboard) {
    return (
      <div className="bg-purple-50 min-h-screen py-4 px-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="bg-purple-50 min-h-screen py-4 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-bold">Error loading dashboard</p>
            <p>{error.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display no data state
  if (!dashboard) {
    return (
      <div className="bg-purple-50 min-h-screen py-4 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
            <p>No dashboard data available</p>
            <button
              onClick={() => refetch()}
              className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get the wallet address from user
  const walletAddress =
    user?.wallet_address || "0x0000000000000000000000000000000000000000";

  // Convert transactions to claims
  const transactionClaims: Claim[] = dashboard.transactions
    ? dashboard.transactions.map((tx: UserClaimedCoinTransaction) => ({
        id: tx.id,
        timestamp: new Date(tx.timestamp),
        amount: tx.amount,
        address: walletAddress,
        status: "completed",
        hash: "",
      }))
    : [];

  // Copy wallet address function
  const copyWalletAddress = () => {
    try {
      // Use Clipboard API with fallback
      if (navigator.clipboard) {
        navigator.clipboard.writeText(walletAddress).then(() => {
          toast.success("Wallet address copied", {
            description: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
            autoClose: 2000,
          });
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = walletAddress;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        toast.success("Wallet address copied", {
          description: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          autoClose: 2000,
        });
      }
    } catch (err) {
      toast.error("Failed to copy wallet address");
    }
  };

  return (
    <div
      className="bg-purple-50 min-h-screen py-4 px-4 overflow-y-auto"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        WebkitOverflowScrolling: "touch", // Enable smooth scrolling on iOS
      }}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-purple-800 mb-1">
                Welcome back, {user?.name || "Comic Enthusiast"}!
              </h1>
              <p className="text-gray-600 text-sm">
                Claim your free ComicCoins every 24 hours
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 active:scale-95"
              onClick={(e) => navigateTo("/user/claim-coins", e)}
              disabled={!dashboard.can_claim}
              aria-label="Claim your daily coins"
              onTouchStart={() => setIsTouchActive(true)}
              onTouchEnd={() => setIsTouchActive(false)}
            >
              <Coins className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">
                {dashboard.can_claim ? "Claim Coins" : "Wait to Claim"}
              </span>
            </button>
          </div>
        </header>

        {/* Balance Cards */}
        <div className="space-y-4 mb-6">
          {/* Faucet Balance Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-600 mb-1">Faucet Balance</h2>
              <div className="text-2xl font-bold text-purple-700" aria-label={`${dashboard.faucet_balance} ComicCoins available for distribution`}>
                {dashboard.faucet_balance} CC
              </div>
            </div>
            <Coins className="h-6 w-6 text-purple-600" aria-hidden="true" />
          </div>

          {/* Your Balance Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-600 mb-1">Your Balance</h2>
              <div className="text-2xl font-bold text-purple-700" aria-label={`${dashboard.user_balance} ComicCoins in your wallet`}>
                {dashboard.user_balance} CC
              </div>
            </div>
            <Wallet className="h-6 w-6 text-purple-600" aria-hidden="true" />
          </div>

          {/* Total Claimed Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-sm text-gray-600 mb-1">Total Claimed</h2>
              <div className="text-2xl font-bold text-purple-700" aria-label={`${dashboard.total_coins_claimed} ComicCoins claimed in total`}>
                {dashboard.total_coins_claimed} CC
              </div>
            </div>
            <TrendingUp className="h-6 w-6 text-purple-600" aria-hidden="true" />
          </div>

          {/* Countdown Timer */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <CountdownTimer
              nextClaimTime={dashboard.next_claim_time}
              canClaim={dashboard.can_claim}
            />
          </div>
        </div>

        {/* Your Claims Section */}
        <section className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-purple-800">
              Your Claims
            </h2>
            {transactionClaims.length > 0 && (
              <button
                onClick={(e) => navigateTo("/user/transactions?filter=personal", e)}
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg px-2 py-1 active:bg-purple-50"
                aria-label="View all your claims history"
              >
                See More
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
          <div
            role="feed"
            aria-label="Your recent claims"
            className="divide-y divide-gray-100"
          >
            {transactionClaims.length > 0 ? (
              <ClaimsList claims={transactionClaims.slice(0, 5)} isPersonal />
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-purple-50">
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
        </section>

        {/* Wallet Section */}
        <section className="bg-white rounded-xl p-4 shadow-sm mb-20">
          <h2 className="text-lg font-semibold text-purple-800 mb-4">
            Your Wallet
          </h2>
          <div className="flex justify-center mb-4">
            <div
              className="w-48 h-48 p-2 bg-white rounded-xl shadow-sm"
              role="img"
              aria-label="QR code for your Ethereum wallet address"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=ethereum:${walletAddress}`}
                alt="Wallet QR Code"
                className="w-full h-full"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Receive coins at:</p>
            <div className="flex items-center justify-center gap-2">
              <code
                className="bg-purple-50 px-3 py-1 rounded text-sm font-mono text-purple-700"
                role="textbox"
                aria-label="Your wallet address"
              >
                {walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : "0x0000...0000"}
              </code>
              <button
                onClick={copyWalletAddress}
                className="p-2 hover:bg-purple-50 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors active:bg-purple-100"
                aria-label="Copy wallet address to clipboard"
                onTouchStart={() => setIsTouchActive(true)}
                onTouchEnd={() => setIsTouchActive(false)}
              >
                <Copy className="w-4 h-4 text-gray-500" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Wrap the component with the auth HOC and export
const DashboardPage = withAuth(DashboardPageContent);
export default DashboardPage;
