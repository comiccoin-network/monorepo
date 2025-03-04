// src/pages/IndexPage.jsx
import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Wallet,
  UserPlus,
  Coins,
  Github,
  Shield,
  Heart,
  Globe,
  Download,
  Menu,
  X,
  FileText,
  BookOpen,
  Code,
} from "lucide-react";
import { Link } from "react-router";
import { useGetFaucet } from "../hooks/useGetFaucet";

const StepCard = ({
  id,
  icon,
  title,
  description,
  subtitle,
  actionText,
  actionUrl,
  isExternalLink,
  noAction,
}) => {
  // Map icon strings to actual Lucide icon components
  const getIcon = (iconName) => {
    switch (iconName) {
      case "Wallet":
        return <Wallet className="h-8 w-8 text-purple-600" />;
      case "UserPlus":
        return <UserPlus className="h-8 w-8 text-purple-600" />;
      case "Coins":
        return <Coins className="h-8 w-8 text-purple-600" />;
      default:
        return <Coins className="h-8 w-8 text-purple-600" />;
    }
  };

  // Render action button or link based on props
  const renderAction = () => {
    if (noAction) return null;
    if (!actionText || !actionUrl) return null;

    if (isExternalLink) {
      return (
        <a
          href={actionUrl}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-700 transition-colors text-sm sm:text-base active:bg-purple-800"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={actionText}
        >
          {actionText}
          <ExternalLink className="w-4 h-4" />
        </a>
      );
    } else {
      return (
        <Link
          to={actionUrl}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-700 transition-colors text-sm sm:text-base active:bg-purple-800"
          aria-label={actionText}
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div className="flex flex-col items-center text-center h-full">
        <div className="p-4 bg-purple-50 rounded-xl mb-6 transform transition-transform duration-300 hover:scale-110">
          {getIcon(icon)}
        </div>
        <h3 className="text-xl font-bold text-purple-800 mb-3">
          {`Step ${id}: ${title}`}
        </h3>
        <p className="text-gray-600 mb-6 flex-grow">{description}</p>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 mb-4">{subtitle}</p>
        )}
        <div className="mt-auto">{renderAction()}</div>
      </div>
    </div>
  );
};

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="relative z-10">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Navigation bar with improved accessibility */}
      <nav
        className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5">
            {/* Logo and Brand - Enhanced size and contrast */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0" aria-hidden="true">
                <Coins className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                ComicCoin Faucet
              </span>
            </div>

            {/* Desktop Navigation Links with enhanced accessibility */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/get-started"
                className="bg-white text-purple-700 px-5 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base active:bg-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
                aria-label="Start claiming ComicCoins"
              >
                <Coins className="w-5 h-5" aria-hidden="true" />
                <span>Claim Coins</span>
              </Link>
            </div>

            {/* Mobile menu button with improved accessibility */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-3 rounded-md text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-white"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
              >
                <span className="sr-only">
                  {isMenuOpen ? "Close main menu" : "Open main menu"}
                </span>
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu with improved accessibility */}
        {isMenuOpen && (
          <div
            className="md:hidden bg-purple-800 border-t border-purple-600 py-2 pb-4"
            id="mobile-menu"
            aria-label="Mobile Navigation"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link
                to="/get-started"
                className="block mt-4 bg-white text-purple-700 px-4 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base w-full justify-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Start claiming ComicCoins"
              >
                <Coins className="w-5 h-5" aria-hidden="true" />
                <span>Claim Coins</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

// Footer Component
const Footer = ({ isLoading, error, faucet }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Section */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-300" />
              <span>ComicCoin Network</span>
            </h3>
            <p className="text-purple-200 mb-4 max-w-md">
              A community-driven blockchain platform designed for comic
              collectors and creators. We're building an accessible ecosystem
              that connects fans with their favorite comics while empowering
              artists and publishers through blockchain technology.
            </p>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Code className="h-4 w-4 text-purple-300" />
              <span>Resources</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/comiccoin-network/monorepo"
                  className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://comiccoinnetwork.com"
                  className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Project Website</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://comiccoinwallet.com"
                  className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Wallet className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Official Wallet</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-300" />
              <span>Legal</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Terms of Service</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                >
                  <BookOpen className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Privacy Policy</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Network Stats Section */}
        {!isLoading && !error && faucet && (
          <div className="border-t border-purple-600 pt-6 mb-6">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Network Status</p>
              <p className="text-xl font-bold text-purple-300">
                {faucet.users_count?.toLocaleString() || "0"}+ Active Users
              </p>
            </div>
          </div>
        )}

        {/* Copyright Section */}
        <div className="text-center pt-6 border-t border-purple-500/30">
          <p className="flex items-center justify-center gap-2 text-purple-200">
            <span>
              © {currentYear} ComicCoin Network. All rights reserved.
            </span>
          </p>
          <p className="mt-2 text-sm text-purple-300">
            Built with ❤️ by the ComicCoin community
          </p>
        </div>
      </div>
    </footer>
  );
};

const IndexPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use the hook to fetch faucet data
  const {
    data: faucet,
    isLoading,
    error,
    refetch,
  } = useGetFaucet({
    chainId: 1, // Ensure this is a number, not a boolean
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

        {/* Steps Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-800 text-center mb-12">
            How to Collect Your ComicCoins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
            {steps.map((step) => (
              <StepCard key={step.id} {...step} />
            ))}
          </div>
        </div>

        {/* About section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-purple-800">
              About ComicCoin
            </h2>
            <div className="flex items-start space-x-4">
              <div className="mt-1 flex-shrink-0 bg-purple-100 p-3 rounded-full">
                <div className="h-6 w-6 text-purple-600" aria-hidden="true">
                  {/* Github icon */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
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
      <Footer isLoading={isLoading} error={error} faucet={faucet} />
    </div>
  );
};

export default IndexPage;
