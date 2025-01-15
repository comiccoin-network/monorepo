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
import { useWalletTransactions } from '../../../Hooks/useWalletTransactions';

function DashboardPage() {
  console.log('DashboardPage: Component rendering');

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
   // HDNodeWallet stores the address in the address property
   return currentWallet.address;
 };

 const {
   loading: txloading,
   error: txerror,
   refresh: txrefresh,
   totalTransactions,
   coinTransactionsCount,
   nftTransactionsCount,
   coinTransactions,
   nftTransactions,
   statistics,
   getCoinTransactions,
   getNftTransactions,
   getPendingTransactions,
   getConfirmedTransactions,
   transactions
 } = useWalletTransactions(getWalletAddress());


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

         if (mounted) {
           setForceURL("");
           setWalletAddress(getWalletAddress()); // Use the getter function
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

      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Wallet aria-hidden="true" className="h-8 w-8" />
              <span className="text-2xl font-bold">ComicCoin Web Wallet</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/help" className="text-white hover:text-purple-200 px-3 py-2">Help</a>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your ComicCoin wallet</p>
        </div>

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
                    {coinTransactionsCount || 0} transactions
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
                    {nftTransactionsCount || 0} transactions
                  </p>
                </div>
              </div>
            </div>

            {/* Latest Transactions Card */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <LineChart className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Latest Transactions</h2>
              </div>

              {/* Recent Activity */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <span className="text-sm text-gray-500">Showing latest 5 transactions</span>
                </div>

                {txloading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : transactions?.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.type === 'coin' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            {tx.type === 'coin' ? (
                              <Coins className={`w-4 h-4 ${tx.type === 'coin' ? 'text-blue-600' : 'text-purple-600'}`} />
                            ) : (
                              <Image className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900">
                                 {tx.type === 'coin' ? (
                                   `${tx.from === currentWallet.address ? '-' : '+'}${tx.actualValue} CC`
                                 ) : (
                                   `NFT #${tx.tokenId || 'Unknown'}`
                                 )}
                               </p>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                tx.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {tx.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(tx.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-900 font-medium">
                            {tx.from === currentWallet.address ? 'Sent' : 'Received'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fee: {tx.fee} CC
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* View All Transactions Link */}
                    <button
                      className="w-full mt-4 text-center py-2 px-4 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                      onClick={() => {/* TODO: Implement view all transactions */}}
                    >
                      View All Transactions
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Image className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                    <p className="font-medium">No transactions found</p>
                    <p className="text-sm mt-1">Your transaction history will appear here</p>
                  </div>
                )}
              </div>
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
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">Receive</span>
                  </div>
                </button>

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

      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 ComicCoin Web Wallet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default DashboardPage;
