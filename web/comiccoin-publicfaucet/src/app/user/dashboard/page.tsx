// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";
import { useGetFaucet } from "@/hooks/useGetFaucet";
import {
  Coins,
  Clock,
  TrendingUp,
  Wallet,
  Flame,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { WalletQRCode } from "@/components/dashboard/WalletQRCode";
import { ClaimsList } from "@/components/dashboard/ClaimsList";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ClaimStreak } from "@/components/dashboard/ClaimStreak";

// Generate more mock data
const generateMockClaims = (count, isPersonal = false) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${isPersonal ? "p" : "n"}-${i + 1}`,
    timestamp: new Date(Date.now() - i * 5 * 60000), // 5 minutes apart
    amount: 500,
    address: isPersonal
      ? "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      : `0x${Math.random().toString(16).slice(2, 42)}`,
    status: "completed",
    hash: `0x${Math.random().toString(16).slice(2, 42)}`,
  }));
};

const MOCK_YOUR_CLAIMS = generateMockClaims(10, true);
const MOCK_NETWORK_CLAIMS = generateMockClaims(20);

const DashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { user } = useMe();

  const [faucetBalance, setFaucetBalance] = useState(1000000);
  const [userBalance, setUserBalance] = useState(4170);
  const [totalClaimed, setTotalClaimed] = useState(15000);
  const [nextClaimTime, setNextClaimTime] = useState(
    new Date(Date.now() + 12 * 60 * 60 * 1000),
  );
  const [claimStreak, setClaimStreak] = useState(7);
  const [yourClaims, setYourClaims] = useState(MOCK_YOUR_CLAIMS);
  const [networkClaims, setNetworkClaims] = useState(MOCK_NETWORK_CLAIMS);

  // Display limits for claims
  const YOUR_CLAIMS_LIMIT = 5;
  const NETWORK_CLAIMS_LIMIT = 8;

  const { faucet, isLoading, error, refetch } = useGetFaucet(1, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!faucet) return <div>No data available</div>;

  return (
    <div className="py-8">
      {/* Header - enhanced with accessibility */}
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-purple-800 mb-2">
              Welcome back, {user?.name || "Comic Enthusiast"}!
            </h1>
            <p className="text-gray-600" role="doc-subtitle">
              Claim your free ComicCoins every 24 hours
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            onClick={() => {
              /* TODO: Implement claim function */
            }}
            aria-label="Claim your daily coins"
          >
            <Coins className="w-5 h-5" aria-hidden="true" />
            <span>Claim Coins</span>
          </button>
        </div>
      </header>

      {/* Stats Grid - with high contrast and aria labels */}
      <div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        role="region"
        aria-label="Account Overview"
      >
        <div className="relative bg-white rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-white opacity-50"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-800">
                Faucet Balance
              </h2>
              <Coins className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
            <div
              className="text-3xl font-bold text-purple-700"
              aria-label={`${faucetBalance.toLocaleString()} ComicCoins available for distribution`}
            >
              {faucetBalance.toLocaleString()} CC
            </div>
            <div className="text-sm text-gray-600">
              Available for distribution
            </div>
          </div>
        </div>

        {/* Your Balance Card */}
        <div className="relative bg-white rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-white opacity-50"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-800">
                Your Balance
              </h2>
              <Wallet className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold text-purple-700"
                aria-label={`${userBalance.toLocaleString()} ComicCoins in your wallet`}
              >
                {userBalance.toLocaleString()} CC
              </span>
              <span
                className="text-sm text-green-600 font-medium"
                aria-label="Increased by 12 percent"
              >
                +12%
              </span>
            </div>
            <div className="text-sm text-gray-600">Current wallet balance</div>
          </div>
        </div>

        {/* Total Claimed Card */}
        <div className="relative bg-white rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-white opacity-50"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-800">
                Total Claimed
              </h2>
              <TrendingUp
                className="h-6 w-6 text-purple-600"
                aria-hidden="true"
              />
            </div>
            <div
              className="text-3xl font-bold text-purple-700"
              aria-label={`${totalClaimed.toLocaleString()} ComicCoins claimed in total`}
            >
              {totalClaimed.toLocaleString()} CC
            </div>
            <div className="text-sm text-gray-600">Lifetime earnings</div>
          </div>
        </div>

        {/* Enhanced Countdown Timer */}
        <div
          className="relative rounded-xl overflow-hidden transition-all duration-300"
          aria-live="polite"
        >
          <CountdownTimer nextClaimTime={nextClaimTime} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Claims (2/3 width) */}
        <div className="lg:w-2/3 space-y-6">
          {/* Your Claims Section */}
          <section
            className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 focus-within:ring-2 focus-within:ring-purple-200 transition-shadow"
            aria-labelledby="your-claims-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                id="your-claims-title"
                className="text-lg font-semibold text-purple-800"
              >
                Your Claims
              </h2>
              <Link
                href="/user/transactions?filter=personal"
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg px-2 py-1"
                aria-label="View all your claims history"
              >
                See More
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
            <div
              role="feed"
              aria-label="Your recent claims"
              className="divide-y divide-gray-100"
            >
              <ClaimsList claims={yourClaims.slice(0, 5)} isPersonal />
            </div>
          </section>

          {/* Network Claims Section */}
          {/*
          <section
            className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 focus-within:ring-2 focus-within:ring-purple-200 transition-shadow"
            aria-labelledby="network-claims-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                id="network-claims-title"
                className="text-lg font-semibold text-purple-800"
              >
                Live Network Claims
              </h2>
              <Link
                href="/user/transactions?filter=network"
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm group focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg px-2 py-1"
                aria-label="View all network claims"
              >
                See More
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
            <div
              role="feed"
              aria-label="Recent network claims"
              className="divide-y divide-gray-100"
            >
              <ClaimsList claims={networkClaims.slice(0, 8)} />
            </div>
          </section>
          */}
        </div>

        {/* Right Column - Wallet & Streak (1/3 width) */}
        <div className="lg:w-1/3 space-y-6">
          {/* Wallet QR */}
          <section
            className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 focus-within:ring-2 focus-within:ring-purple-200 transition-shadow"
            aria-labelledby="wallet-title"
          >
            <h2
              id="wallet-title"
              className="text-lg font-semibold text-purple-800 mb-6"
            >
              Your Wallet
            </h2>
            <div className="flex justify-center mb-6">
              <div
                className="w-64 h-64 p-4 bg-white rounded-xl shadow-sm"
                role="img"
                aria-label="QR code for your Ethereum wallet address"
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=ethereum:${
                    user?.walletAddress ||
                    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                  }`}
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
                  {user?.walletAddress
                    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                    : "0x742d...f44e"}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      user?.walletAddress ||
                        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    );
                    // TODO: Add toast notification for copied address
                  }}
                  className="p-2 hover:bg-purple-50 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  aria-label="Copy wallet address to clipboard"
                >
                  <Wallet
                    className="w-4 h-4 text-gray-500"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Claim Streak */}
          {/*
          <section
            className="bg-white rounded-xl p-6 shadow-sm border border-purple-100 focus-within:ring-2 focus-within:ring-purple-200 transition-shadow"
            aria-labelledby="streak-title"
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="streak-title"
                className="text-lg font-semibold text-purple-800"
              >
                Claim Streak
              </h2>
              <Flame className="h-6 w-6 text-orange-500" aria-hidden="true" />
            </div>
            <div
              className="flex items-center gap-2 mb-4"
              aria-label={`Current streak: ${claimStreak} days`}
            >
              <div className="text-3xl font-bold text-orange-500">
                {claimStreak}
              </div>
              <div className="text-sm text-gray-600">days</div>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full mb-2">
              <div
                className="absolute left-0 top-0 h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(claimStreak / 10) * 100}%` }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={claimStreak}
                aria-label="Claim streak progress"
              />
            </div>
            <p className="text-sm text-gray-600">
              {10 - claimStreak} days until 1000 CC bonus!
            </p>
          </section>
          */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
