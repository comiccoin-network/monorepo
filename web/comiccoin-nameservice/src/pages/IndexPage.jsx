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
import WalletStepCard from "../components/IndexPage/WalletStepCard";
import StepCard from "../components/IndexPage/StepCard";

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
              ComicCoin Name Service Balance
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
            {/* Step 1: Get Wallet - Using the custom component */}
            <WalletStepCard />

            {/* Step 2: Register */}
            <StepCard
              id="2"
              icon="UserPlus"
              title="Register"
              description="Create a ComicCoin Network account to access all network services with a single sign-on"
              actionText="Join Network"
              actionUrl="/register"
              isExternalLink={false}
            />

            {/* Step 3: Collect Coins */}
            <StepCard
              id="3"
              icon="Coins"
              title="Collect Coins"
              description="Once signed in, you can claim coins every 24 hours. Enter your wallet address to claim your coins."
              subtitle="Each wallet can claim once every 24 hours."
              noAction={true}
            />
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Start Collecting ComicCoins?
            </h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already claimed their free
              ComicCoins. Get your wallet, register, and start collecting today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <a
                href="https://comiccoinwallet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg group"
              >
                <Wallet className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Get Wallet
              </a>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-purple-800 bg-opacity-50 text-white border border-purple-300 rounded-xl font-bold hover:bg-opacity-75 transition-colors shadow-lg group"
              >
                <UserPlus className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Register Now
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
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
