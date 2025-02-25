// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import { Coins, TrendingUp, Wallet, ArrowRight, Copy } from "lucide-react";
import Link from "next/link";

import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { ClaimsList } from "@/components/dashboard/ClaimsList";

import { useGetDashboard } from "@/hooks/useGetDashboard";
import { toast } from "sonner";

// Existing interfaces remain the same
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

const DashboardPage = () => {
  const router = useRouter();
  const { user } = useMe();

  // iOS-specific touch interaction state
  const [isTouchActive, setIsTouchActive] = useState(false);

  // Prevent default touch behaviors
  useEffect(() => {
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.body.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });

    // Prevent iOS scroll bounce
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.removeEventListener("touchmove", preventTouchMove);
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";
    };
  }, []);

  const { dashboard, isLoading, error, refetch } = useGetDashboard({
    refreshInterval: 30000,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!dashboard) return <div>No data available</div>;

  // Get the wallet address from user
  const walletAddress =
    user?.wallet_address || "0x0000000000000000000000000000000000000000";

  // Convert transactions to claims
  const transactionClaims: Claim[] = dashboard.transactions
    ? (dashboard.transactions as UserClaimedCoinTransaction[]).map((tx) => ({
        id: tx.id,
        timestamp: new Date(tx.timestamp),
        amount: tx.amount,
        address: walletAddress,
        status: "completed",
        hash: "",
      }))
    : [];

  // Copy wallet address with iOS-friendly implementation
  const copyWalletAddress = () => {
    try {
      // Use Clipboard API with fallback
      if (navigator.clipboard) {
        navigator.clipboard.writeText(walletAddress).then(() => {
          toast.success("Wallet address copied", {
            description: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
            duration: 2000,
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
          duration: 2000,
        });
      }
    } catch (err) {
      toast.error("Failed to copy wallet address");
    }
  };

  return (
    <div
      className="bg-purple-50 min-h-screen py-4 px-4"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Header with iOS-style design */}
      <header className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-purple-800 mb-1">
              Welcome back, {user?.name || "Comic Enthusiast"}!
            </h1>
            <p className="text-gray-600 text-sm" role="doc-subtitle">
              Claim your free ComicCoins every 24 hours
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 active:scale-95"
            onClick={() => {
              router.push("/user/claim-coins");
            }}
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

      {/* Balance Cards with iOS-inspired design */}
      <div className="space-y-4 mb-6">
        {/* Faucet Balance Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-600 mb-1">Faucet Balance</h2>
            <div
              className="text-2xl font-bold text-purple-700"
              aria-label={`${dashboard.faucet_balance} ComicCoins available for distribution`}
            >
              {dashboard.faucet_balance} CC
            </div>
          </div>
          <Coins className="h-6 w-6 text-purple-600" aria-hidden="true" />
        </div>

        {/* Your Balance Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-600 mb-1">Your Balance</h2>
            <div
              className="text-2xl font-bold text-purple-700"
              aria-label={`${dashboard.user_balance} ComicCoins in your wallet`}
            >
              {dashboard.user_balance} CC
            </div>
          </div>
          <Wallet className="h-6 w-6 text-purple-600" aria-hidden="true" />
        </div>

        {/* Total Claimed Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-600 mb-1">Total Claimed</h2>
            <div
              className="text-2xl font-bold text-purple-700"
              aria-label={`${dashboard.total_coins_claimed} ComicCoins claimed in total`}
            >
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
          <h2 className="text-lg font-semibold text-purple-800">Your Claims</h2>
          {dashboard.transactions && dashboard.transactions.length > 0 && (
            <Link
              href="/user/transactions?filter=personal"
              className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg px-2 py-1 active:bg-purple-50"
              aria-label="View all your claims history"
            >
              See More
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
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
                <Coins className="w-6 h-6 text-purple-600" aria-hidden="true" />
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
      <section className="bg-white rounded-xl p-4 shadow-sm">
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
  );
};

export default DashboardPage;
