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

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-12 mb-16 md:mb-0">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your ComicCoin wallet</p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {txerror && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{txerror}</p>
          </div>
        )}

        {isSessionExpired && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800">Session expired. Redirecting to login...</p>
          </div>
        )}

        {currentWallet && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Info Card */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Wallet Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={walletAddress}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(walletAddress)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Wallet Balance</h2>
                <button
                  onClick={txrefresh}
                  className="ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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

              <div className="grid grid-cols-2 gap-4">
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

            {/* Latest Transactions Card */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <LineChart className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Latest Transactions</h2>
                </div>

                <button
                  onClick={txrefresh}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh transactions"
                  disabled={txloading}
                >
                  {txloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                </button>
              </div>

              {txloading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : transactions?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {transactions.slice(0, 5).map((tx) => {
                    const isSent = tx.from.toLowerCase() === currentWallet.address.toLowerCase();
                    const displayValue = tx.type === 'coin' ? `${tx.actualValue} CC` : `NFT #${tx.tokenId || 'Unknown'}`;

                    return (
                      <div key={tx.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          {/* Left side - Transaction type and direction */}
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              tx.type === 'coin'
                                ? (isSent ? 'bg-red-100' : 'bg-green-100')
                                : 'bg-purple-100'
                            }`}>
                              {tx.type === 'coin' ? (
                                <Coins className={`w-5 h-5 ${
                                  isSent ? 'text-red-600' : 'text-green-600'
                                }`} />
                              ) : (
                                <Image className="w-5 h-5 text-purple-600" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${
                                  isSent ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {isSent ? 'Sent' : 'Received'} {tx.type === 'coin' ? 'Coins' : 'NFT'}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  tx.status === 'confirmed'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                  {tx.status}
                                </span>
                              </div>

                              {/* Time and Address */}
                              <div className="mt-1 space-y-1">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {new Date(tx.timestamp).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {isSent
                                    ? `To: ${tx.to.slice(0, 8)}...${tx.to.slice(-6)}`
                                    : `From: ${tx.from.slice(0, 8)}...${tx.from.slice(-6)}`
                                  }
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right side - Amount and fee */}
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              isSent ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {isSent ? '-' : '+'}{displayValue}
                            </div>
                            {tx.type === 'coin' && (
                              <div className="text-xs text-gray-500 mt-1">
                                Fee: {tx.fee} CC
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Bottom action buttons */}
                  <div className="pt-4 mt-4 flex gap-4">
                    <button className="flex-1 text-center py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                      View All Transactions
                    </button>
                    <Link
                      to="/send-coins"
                      className="flex-1 text-center py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      Send New Transaction
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Image className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900">No Transactions Yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Start by sending or receiving coins</p>
                  <Link
                    to="/send-coins"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send First Transaction
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <LineChart className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <Link to="/receive-coins" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">Receive</span>
                  </div>
                </Link>

                <Link to="/send-coins" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Send className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">Send</span>
                  </div>
                </Link>

                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ArrowUpRight className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">Trade</span>
                  </div>
                </button>

                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Image className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">NFTs</span>
                  </div>
                </button>

                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">More</span>
                  </div>
                </button>
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
      </main>

      <FooterMenu />
    </div>
  );
}

export default DashboardPage;
