// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/page.tsx
"use client";

import React from "react";
import {
  Wallet,
  ArrowRight,
  Shield,
  RefreshCw,
  Github,
  Globe,
  Coins,
  UserPlus,
  Sparkles,
  ExternalLink,
  Code,
  FileText,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/env";

const FaucetPage = () => {
  const currentYear = new Date().getFullYear();

  // Define types for faucet data
  type BigIntString = string;

  interface FaucetDTO {
    id: string;
    chain_id: number;
    balance: BigIntString;
    users_count: number;
    total_coins_distributed: BigIntString;
    total_transactions: number;
    distribution_rate_per_day: number;
    total_coins_distributed_today: number;
    total_transactions_today: number;
    created_at?: string;
    last_modified_at?: string;
    daily_coins_reward: number;
  }

  // Set up state for faucet data
  const [faucet, setFaucet] = useState<FaucetDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Chain ID for the ComicCoin network
  const chainId = 1;

  // Function to fetch faucet data
  const fetchFaucetData = async () => {
    try {
      console.log(`🔄 Fetching faucet data for chain ID: ${chainId}`);
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/faucet/${chainId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch faucet data: ${response.statusText}`);
      }

      const data: FaucetDTO = await response.json();
      console.log("✅ Faucet data received:", {
        chainId: data.chain_id,
        balance: data.balance,
        usersCount: data.users_count,
      });

      setFaucet(data);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching faucet data:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch faucet data"),
      );
      setFaucet(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up initial fetch and refresh interval
  useEffect(() => {
    // Initial fetch
    fetchFaucetData();

    // Set up 60-second refresh interval
    const refreshInterval = 60000;
    console.log(`⏰ Setting up refresh interval: ${refreshInterval}ms`);
    const intervalId = setInterval(fetchFaucetData, refreshInterval);

    // Cleanup interval on unmount
    return () => {
      console.log("🧹 Cleaning up refresh interval");
      clearInterval(intervalId);
    };
  }, [chainId]);

  // Function to manually refresh data
  const refetch = fetchFaucetData;

  // Format balance for display
  const formatBalance = (balanceStr: string | undefined) => {
    if (!balanceStr) return "0";

    try {
      // The balance is already in ComicCoin units, not wei
      const balance = parseInt(balanceStr);
      return balance.toLocaleString();
    } catch (e) {
      console.error("Error formatting balance:", e);
      return "0";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Navigation bar with iOS-safe padding */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white pt-safe">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Coins className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="text-lg sm:text-xl font-bold">
                ComicCoin Faucet
              </span>
            </div>
            <Link
              href="/get-started"
              className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm sm:text-base active:bg-purple-100 touch-action-manipulation"
            >
              <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Claim Coins</span>
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow">
        {/* Hero Section with iOS optimizations */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-8 sm:py-12 mb-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                ComicCoin Faucet Balance
              </h1>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-white opacity-20 blur transform scale-110 rounded-full"></div>
                <div className="relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="h-8 w-8 sm:h-10 sm:w-10 text-white animate-spin" />
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                        Loading...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-300">
                        Error
                      </p>
                      <button
                        onClick={refetch}
                        className="mt-4 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 active:bg-indigo-100 touch-action-manipulation"
                        aria-label="Retry loading data"
                      >
                        <RefreshCw className="h-5 w-5" />
                        Retry
                      </button>
                    </div>
                  ) : (
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-2 sm:gap-4 text-white">
                      <Sparkles
                        className="h-8 w-8 sm:h-10 sm:w-10 text-amber-300"
                        aria-hidden="true"
                      />
                      <span className="bg-gradient-to-r from-amber-300 to-yellow-500 text-transparent bg-clip-text">
                        {formatBalance(faucet?.balance)} CC
                      </span>
                      <Sparkles
                        className="h-8 w-8 sm:h-10 sm:w-10 text-amber-300"
                        aria-hidden="true"
                      />
                    </p>
                  )}
                </div>
              </div>
              <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto mt-6 mb-6">
                Get started with free ComicCoins instantly! Follow the steps
                below to claim your coins.
              </p>
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-base sm:text-lg shadow-lg hover:shadow-xl active:bg-indigo-100 active:shadow-md touch-action-manipulation"
                aria-label="Start claiming ComicCoins"
              >
                Start Claiming Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!isLoading && !error && faucet && (
                <p className="mt-4 text-indigo-100 text-sm sm:text-base">
                  Daily Reward:{" "}
                  <span className="font-bold">
                    {faucet.daily_coins_reward} CC
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Steps Section with iOS optimizations */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 text-center mb-8">
            How to Collect Your ComicCoins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100 touch-action-manipulation">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-50 rounded-xl mb-4 transform transition-transform duration-300 hover:scale-110">
                  <Wallet className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-800 mb-3">
                  Step 1: Get Wallet
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Download and install the ComicCoin Wallet to store your coins
                  securely
                </p>
                <Link
                  href="https://comiccoinwallet.com"
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-700 transition-colors text-sm sm:text-base active:bg-purple-800 touch-action-manipulation"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get the ComicCoin wallet"
                >
                  Get Wallet
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100 touch-action-manipulation">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-50 rounded-xl mb-4 transform transition-transform duration-300 hover:scale-110">
                  <UserPlus className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-800 mb-3">
                  Step 2: Register
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Create a ComicCoin Network account to access all network
                  services with a single sign-on
                </p>
                <Link
                  href="/get-started"
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-700 transition-colors text-sm sm:text-base active:bg-purple-800 touch-action-manipulation"
                  aria-label="Join the ComicCoin network"
                >
                  Join Network
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100 touch-action-manipulation">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-50 rounded-xl mb-4 transform transition-transform duration-300 hover:scale-110">
                  <Coins className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-800 mb-3">
                  Step 3: Collect Coins
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Once signed in, you can claim coins every 24 hours. Enter your
                  wallet address to claim your coins.
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Each wallet can claim once every 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About section with iOS optimizations */}
        <section className="max-w-6xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">
              About ComicCoin
            </h2>
            <div className="flex items-start space-x-3">
              <Github className="h-6 w-6 mt-1 flex-shrink-0 text-purple-600" />
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                ComicCoin is an open-source blockchain project utilizing a Proof
                of Authority consensus mechanism. This ensures fast, efficient,
                and environmentally friendly transactions while maintaining
                security and transparency.
              </p>
            </div>
          </div>
        </section>

        {/* Community section with iOS optimizations */}
        <section className="bg-gradient-to-b from-purple-900 to-indigo-900 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Join the Community?
              </h2>
              <p className="text-base sm:text-lg mb-6 text-purple-100">
                Join our growing community of creators, collectors, and
                enthusiasts. Get started with free ComicCoins today!
              </p>
              <Link
                href="https://comiccoinwallet.com"
                className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors text-base shadow-lg active:bg-purple-100 active:shadow-md touch-action-manipulation"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join the ComicCoin community"
              >
                Join the Community
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section with iOS optimizations */}
        <section className="bg-white py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {isLoading ? (
                    <RefreshCw className="h-6 w-6 inline-block animate-spin text-purple-400" />
                  ) : error ? (
                    "Error"
                  ) : (
                    <>{faucet?.users_count?.toLocaleString() || "0"}+</>
                  )}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  Active Users
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {isLoading ? (
                    <RefreshCw className="h-6 w-6 inline-block animate-spin text-purple-400" />
                  ) : error ? (
                    "Error"
                  ) : (
                    <>{formatBalance(faucet?.total_coins_distributed)}+</>
                  )}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  Coins Distributed
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {isLoading ? (
                    <RefreshCw className="h-6 w-6 inline-block animate-spin text-purple-400" />
                  ) : error ? (
                    "Error"
                  ) : (
                    <>{faucet?.distribution_rate_per_day}/day</>
                  )}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  Distribution Rate
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer with iOS optimizations */}
        <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 pb-safe">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Project Links */}
              <div className="text-center md:text-left">
                <h3 className="font-bold mb-4 text-base flex items-center justify-center md:justify-start gap-2">
                  <Code className="h-4 w-4 text-purple-300" />
                  <span>Resources</span>
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="https://github.com/comiccoin-network/monorepo"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-2 group transition-colors duration-200 text-sm sm:text-base touch-action-manipulation"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>GitHub Repository</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://comiccoinnetwork.com"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-2 group transition-colors duration-200 text-sm sm:text-base touch-action-manipulation"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>Project Website</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://comiccoinwallet.com"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-2 group transition-colors duration-200 text-sm sm:text-base touch-action-manipulation"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Wallet className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>Official Wallet</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Links */}
              <div className="text-center md:text-left">
                <h3 className="font-bold mb-4 text-base flex items-center justify-center md:justify-start gap-2">
                  <Shield className="h-4 w-4 text-purple-300" />
                  <span>Legal</span>
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-2 group transition-colors duration-200 text-sm sm:text-base touch-action-manipulation"
                    >
                      <FileText className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>Terms of Service</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-2 group transition-colors duration-200 text-sm sm:text-base touch-action-manipulation"
                    >
                      <BookOpen className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>Privacy Policy</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright Section */}
            <div className="text-center pt-4 border-t border-purple-500/30">
              <p className="flex items-center justify-center gap-2 text-purple-200 text-sm">
                <span>
                  © {currentYear} ComicCoin Network. All rights reserved.
                </span>
              </p>
              {!isLoading && !error && faucet && (
                <p className="mt-2 text-xs sm:text-sm text-purple-300">
                  Today's Stats: {faucet.total_coins_distributed_today} coins
                  distributed in {faucet.total_transactions_today} transactions
                </p>
              )}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default FaucetPage;
