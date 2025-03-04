// src/pages/IndexPage.jsx
import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  ArrowRight,
  Github,
  Wallet,
  UserPlus,
  Coins,
} from "lucide-react";
import { Link } from "react-router";
import { useGetFaucet } from "../hooks/useGetFaucet";
import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";

const IndexPage = () => {
  // Use the hook to fetch faucet data
  const {
    data: faucet,
    isLoading,
    error,
    refetch,
  } = useGetFaucet({
    chainId: 1,
    enabled: true,
    refreshInterval: 60000,
  });

  // Format balance for display
  const formatBalance = (balanceStr) => {
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

      {/* Header component */}
      <Header />

      <main id="main-content" className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
              ComicCoin Faucet Balance
            </h1>
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-white opacity-20 blur transform scale-110 rounded-full"></div>
              <div className="relative">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-12 w-12 text-white animate-spin" />
                    <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
                      Loading...
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-xl sm:text-2xl font-bold text-red-300">
                      {error.message || "Error loading data"}
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="mt-4 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 active:bg-indigo-100"
                      aria-label="Retry loading data"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Retry
                    </button>
                  </div>
                ) : (
                  <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-2 flex items-center justify-center gap-3 sm:gap-4 text-white">
                    <Sparkles
                      className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-amber-300"
                      aria-hidden="true"
                    />
                    <span className="bg-gradient-to-r from-amber-300 to-yellow-500 text-transparent bg-clip-text">
                      {formatBalance(faucet?.balance)} CC
                    </span>
                    <Sparkles
                      className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-amber-300"
                      aria-hidden="true"
                    />
                  </p>
                )}
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Get started with free ComicCoins instantly! Follow the steps below
              to claim your coins and join the network today.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-lg shadow-lg hover:shadow-xl active:bg-indigo-100 active:shadow-md"
              aria-label="Start claiming ComicCoins"
            >
              Start Claiming Now
              <ArrowRight className="w-6 h-6" />
            </Link>
            {!isLoading && !error && faucet && (
              <p className="mt-4 text-indigo-100 text-base sm:text-lg">
                Daily Reward:{" "}
                <span className="font-bold">
                  {faucet.daily_coins_reward} CC
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Steps Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-purple-800 text-center mb-12">
            How to Collect Your ComicCoins
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1: Get Wallet */}
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg border border-purple-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <Wallet className="h-7 w-7 text-purple-600" />
                </div>
                <div className="bg-purple-100 text-purple-800 text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  1
                </div>
              </div>

              <div className="mb-6 flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Get Wallet
                </h3>
                <p className="text-gray-600">
                  Download our secure wallet app to store your coins
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-center mb-3">
                  <img
                    src="/apple-touch-icon.png"
                    alt="ComicCoin Wallet"
                    className="w-16 h-16 rounded-xl shadow-md"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href="https://apps.apple.com/ca/app/comiccoin-wallet/id6741118881"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-black text-white py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      className="mr-1"
                      fill="currentColor"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.86-3.1.43-1.1-.44-2.1-.48-3.26 0-1.46.62-2.2.44-3.1-.43C3.1 15.45 3.74 8.83 8.14 8.5c1.32.07 2.24.87 3.07.87.83 0 2.37-1.08 4-.92 1.53.13 2.72.77 3.47 1.97-3.12 1.95-2.6 5.93.33 7.16-.92 2.23-2.03 3.76-3.96 4.7zM12.9 7.34c-.76-1.27-.29-3.27 1.05-4.5 1.2 1.1 1.82 2.9 1.05 4.5-1.08.05-1.96-.27-2.1 0z" />
                    </svg>
                    <span className="text-xs">App Store</span>
                  </a>

                  <a
                    href="https://play.google.com/store/apps/details?id=com.theshootingstarpress.comiccoinwallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-black text-white py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      className="mr-1"
                      fill="currentColor"
                    >
                      <path d="M17.9 5c.1.1.2.3.2.5v13c0 .2-.1.3-.2.5l-7.6-7 7.6-7z" />
                      <path d="M4 18.1c-.1-.1-.1-.2-.1-.4V6.3c0-.1 0-.3.1-.4l7.7 6.1-7.7 6.1z" />
                    </svg>
                    <span className="text-xs">Google Play</span>
                  </a>

                  <a
                    href="https://comiccoinwallet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Wallet className="h-4 w-4 mr-1" />
                    <span className="text-xs">Web Wallet</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2: Register */}
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg border border-purple-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <UserPlus className="h-7 w-7 text-purple-600" />
                </div>
                <div className="bg-purple-100 text-purple-800 text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  2
                </div>
              </div>

              <div className="mb-6 flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Register
                </h3>
                <p className="text-gray-600">
                  Create a ComicCoin Network account to access all network
                  services with a single sign-on
                </p>
              </div>

              <Link
                to="/get-started"
                className="mt-auto bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Join Network
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Step 3: Collect Coins */}
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg border border-purple-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <Coins className="h-7 w-7 text-purple-600" />
                </div>
                <div className="bg-purple-100 text-purple-800 text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                  3
                </div>
              </div>

              <div className="mb-6 flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Collect Coins
                </h3>
                <p className="text-gray-600">
                  Once signed in, you can claim coins every 24 hours. Enter your
                  wallet address to claim your coins.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Each wallet can claim once every 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-12 mb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Start Collecting ComicCoins?
            </h2>
            <p className="text-purple-200 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already claimed their free
              ComicCoins. Get your wallet, register, and start collecting today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="https://comiccoinwallet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-purple-700 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Wallet className="h-5 w-5" />
                Get Wallet
              </a>
              <Link
                to="/get-started"
                className="bg-purple-800 bg-opacity-50 text-white border border-purple-300 px-6 py-3 rounded-lg font-bold hover:bg-opacity-75 transition-colors inline-flex items-center justify-center gap-2"
              >
                Register Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* About section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-purple-800 text-center sm:text-left">
              About ComicCoin
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="mt-1 flex-shrink-0 bg-purple-100 p-3 rounded-full">
                <div className="h-8 w-8 text-purple-600" aria-hidden="true">
                  <Github className="h-8 w-8" />
                </div>
              </div>
              <p className="text-gray-700 sm:text-lg leading-relaxed max-w-5xl text-center sm:text-left">
                ComicCoin is an open-source blockchain project utilizing a Proof
                of Authority consensus mechanism. This ensures fast, efficient,
                and environmentally friendly transactions while maintaining
                security and transparency. The ComicCoin Network offers
                developers a robust platform for building Web3 applications with
                a focus on user experience and accessibility.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600 mb-2">
                  {isLoading ? (
                    <RefreshCw className="h-8 w-8 inline-block animate-spin text-purple-400" />
                  ) : error ? (
                    "—"
                  ) : (
                    <>{faucet?.users_count?.toLocaleString() || "0"}+</>
                  )}
                </p>
                <p className="text-gray-600 text-lg">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600 mb-2">
                  {isLoading ? (
                    <RefreshCw className="h-8 w-8 inline-block animate-spin text-purple-400" />
                  ) : error ? (
                    "—"
                  ) : (
                    <>{formatBalance(faucet?.total_coins_distributed)}+</>
                  )}
                </p>
                <p className="text-gray-600 text-lg">Coins Distributed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600 mb-2">
                  {isLoading ? (
                    <RefreshCw className="h-8 w-8 inline-block animate-spin text-purple-400" />
                  ) : error ? (
                    "—"
                  ) : (
                    <>{faucet?.distribution_rate_per_day}/day</>
                  )}
                </p>
                <p className="text-gray-600 text-lg">Distribution Rate</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer component */}
      <Footer
        isLoading={isLoading}
        error={error}
        faucet={faucet}
        formatBalance={formatBalance}
      />
    </div>
  );
};

export default IndexPage;
