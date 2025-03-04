// src/pages/IndexPage.jsx
import { useState } from "react";
import { Sparkles, RefreshCw, ArrowRight, Github } from "lucide-react";
import { Link } from "react-router";
import { useGetFaucet } from "../hooks/useGetFaucet";
import Header from "../components/IndexPage/Header";
import StepCard from "../components/IndexPage/StepCard";
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

  // Step data for the collection process
  const steps = [
    {
      id: 1,
      icon: "Wallet",
      title: "Get Wallet",
      description:
        "Download and install the ComicCoin Wallet to store your coins securely",
      actionText: "Get Wallet",
      actionUrl: "https://comiccoinwallet.com",
      isExternalLink: true,
    },
    {
      id: 2,
      icon: "UserPlus",
      title: "Register",
      description:
        "Create a ComicCoin Network account to access all network services with a single sign-on",
      actionText: "Join Network",
      actionUrl: "/get-started",
      isExternalLink: false,
    },
    {
      id: 3,
      icon: "Coins",
      title: "Collect Coins",
      description:
        "Once signed in, you can claim coins every 24 hours. Enter your wallet address to claim your coins.",
      subtitle: "Each wallet can claim once every 24 hours.",
      noAction: true,
    },
  ];

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
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 lg:py-20 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                ComicCoin Faucet Balance
              </h1>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-white opacity-20 blur transform scale-110 rounded-full"></div>
                <div className="relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="h-10 w-10 text-white animate-spin" />
                      <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
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
                    <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 flex items-center justify-center gap-2 sm:gap-4 text-white">
                      <Sparkles
                        className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-amber-300"
                        aria-hidden="true"
                      />
                      <span className="bg-gradient-to-r from-amber-300 to-yellow-500 text-transparent bg-clip-text">
                        {formatBalance(faucet?.balance)} CC
                      </span>
                      <Sparkles
                        className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-amber-300"
                        aria-hidden="true"
                      />
                    </p>
                  )}
                </div>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto mt-6 mb-8">
                Get started with free ComicCoins instantly! Follow the steps
                below to claim your coins and join the network today.
              </p>
              <Link
                to="/get-started"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-base sm:text-lg shadow-lg hover:shadow-xl active:bg-indigo-100 active:shadow-md"
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

        {/* Steps Section - Now always in a single row on all screens except very small ones */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-800 text-center mb-8 sm:mb-12">
            How to Collect Your ComicCoins
          </h2>

          {/* Always use a single row layout, with flex-wrap for very small screens */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 lg:gap-8">
            {steps.map((step) => (
              <div key={step.id} className="flex-1 min-w-0">
                <StepCard {...step} />
              </div>
            ))}
          </div>
        </div>

        {/* About section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-purple-800">
              About ComicCoin
            </h2>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="mt-1 flex-shrink-0 bg-purple-100 p-3 rounded-full">
                <div className="h-6 w-6 text-purple-600" aria-hidden="true">
                  <Github className="h-6 w-6" />
                </div>
              </div>
              <p className="text-gray-700 sm:text-lg leading-relaxed max-w-5xl">
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
