// src/Components/User/Dashboard/View.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from "react-router-dom";
import {
    Globe,
    Monitor,
    Wallet,
    AlertCircle,
    Copy,
    Download,
    RefreshCw,
    Info,
    Loader2,
    LogOut,
    Coins,
    LineChart,
    ArrowUpRight,
    ArrowDownRight,
    Send,
    Image,
    MoreHorizontal,
    Clock
} from 'lucide-react';

import { useWallet } from '../../../Hooks/useWallet';
import { useAllTransactions } from '../../../Hooks/useAllTransactions';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";
import walletService from '../../../Services/WalletService';

function DashboardPage() {
  const {
    currentWallet,
    wallets,
    loadWallet,
    logout,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

  // Get the wallet address using the current HDNodeWallet format
  const getWalletAddress = () => {
    if (!currentWallet) return "";
    return currentWallet.address;
  };

  // Using the new useAllTransactions hook
  const {
    transactions,
    loading: txloading,
    error: txerror,
    refresh: txrefresh,
    statistics,
    coinTransactions,
    nftTransactions
  } = useAllTransactions(getWalletAddress());

  const [forceURL, setForceURL] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('DashboardPage: Initial useEffect running');
    let mounted = true;

    if (mounted) {
        window.scrollTo(0, 0);
    }

    const checkWalletSession = async () => {
      console.log('DashboardPage: checkWalletSession starting');
      try {
        if (!mounted) return;
        setIsLoading(true);

        if (serviceLoading) {
          console.log('DashboardPage: Service still loading, waiting...');
          return;
        }

        if (!currentWallet) {
          console.log('DashboardPage: No current wallet found, redirecting to login');
          if (mounted) {
            setForceURL("/login");
          }
          return;
        }

        // Check session using the wallet service
        if (!walletService.checkSession()) {
          throw new Error("Session expired");
        }

        if (mounted) {
          setForceURL("");
          setWalletAddress(getWalletAddress());
        }

      } catch (error) {
        console.error('DashboardPage: Session check error:', error);
        if (error.message === "Session expired" && mounted) {
          handleSessionExpired();
        } else if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkWalletSession();
    const sessionCheckInterval = setInterval(checkWalletSession, 60000);

    return () => {
      mounted = false;
      clearInterval(sessionCheckInterval);
    };
  }, [currentWallet, serviceLoading]);

  const handleSessionExpired = () => {
    setIsSessionExpired(true);
    logout();
    setError("Your session has expired. Please sign in again.");
    setTimeout(() => {
      setForceURL("/login");
    }, 3000);
  };

  const handleSignOut = () => {
    logout();
    setForceURL("/login");
  };

  if (forceURL !== "" && !serviceLoading) {
    console.log('DashboardPage: Navigating to:', forceURL);
    return <Navigate to={forceURL} />;
  }

  if (serviceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading wallet...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <NavigationMenu onSignOut={handleSignOut} />

      <main id="main-content" className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 mb-20 sm:mb-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-purple-800 mb-2 sm:mb-4">Dashboard</h1>
            <p className="text-lg sm:text-xl text-gray-600">Manage your ComicCoin wallet</p>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-r-lg flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm sm:text-base text-red-800">{error}</p>
            </div>
          )}

          {txerror && (
            <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-r-lg flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm sm:text-base text-red-800">{txerror}</p>
            </div>
          )}

          {isSessionExpired && (
            <div className="mb-4 sm:mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4 rounded-r-lg flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm sm:text-base text-yellow-800">Session expired. Redirecting to login...</p>
            </div>
          )}

          {currentWallet && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Wallet Info Card */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Wallet className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Wallet Details</h2>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        Wallet Address
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={walletAddress}
                          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(walletAddress)}
                          className="p-2.5 sm:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy address"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance Card */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Wallet className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Wallet Balance</h2>
                    <button
                      onClick={txrefresh}
                      className="ml-auto p-2.5 sm:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Refresh balances"
                      disabled={txloading}
                    >
                      {txloading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-medium text-blue-600">CC Balance</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics?.totalCoinValue || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {statistics?.coinTransactionsCount || 0} transactions
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4 text-purple-600" />
                        <h3 className="text-sm font-medium text-purple-600">NFTs Owned</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {statistics?.totalNftCount || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {statistics?.nftTransactionsCount || 0} transactions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty State section */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 sm:p-6">
                  <div className="text-center py-8">
                    <Image className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 text-gray-400 opacity-50" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
                    <p className="text-sm text-gray-500 mb-6">Start by sending or receiving coins</p>
                    <Link
                      to="/send-coins"
                      className="inline-flex items-center justify-center gap-2 px-6 h-12 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base touch-manipulation"
                    >
                      <Send className="w-4 h-4" />
                      Send First Transaction
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(isLoading || serviceLoading) && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading wallet data...</span>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden">
        <div className="flex justify-around items-center h-16">
          <Link to="/" className="flex flex-col items-center px-3 py-2 text-purple-600">
            <Monitor className="w-6 h-6" />
            <span className="text-xs mt-1">Desktop</span>
          </Link>
          <Link to="/receive-coins" className="flex flex-col items-center px-3 py-2 text-gray-600">
            <ArrowDownRight className="w-6 h-6" />
            <span className="text-xs mt-1">Receive</span>
          </Link>
          <Link to="/send-coins" className="flex flex-col items-center px-3 py-2 text-gray-600">
            <Send className="w-6 h-6" />
            <span className="text-xs mt-1">Send</span>
          </Link>
          <Link to="/trade" className="flex flex-col items-center px-3 py-2 text-gray-600">
            <ArrowUpRight className="w-6 h-6" />
            <span className="text-xs mt-1">Trade</span>
          </Link>
          <Link to="/nfts" className="flex flex-col items-center px-3 py-2 text-gray-600">
            <Image className="w-6 h-6" />
            <span className="text-xs mt-1">NFTs</span>
          </Link>
          <Link to="/more" className="flex flex-col items-center px-3 py-2 text-gray-600">
            <MoreHorizontal className="w-6 h-6" />
            <span className="text-xs mt-1">More</span>
          </Link>
        </div>
      </nav>

      <FooterMenu className="hidden sm:block" />
    </div>
  );
}

export default DashboardPage;
