// src/Components/User/More/Transaction/ListView.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from "react-router-dom";
import {
    AlertCircle,
    Loader2,
    LineChart,
    Coins,
    Image,
    Clock,
    Filter,
    Search,
    RefreshCw
} from 'lucide-react';

import { useWallet } from '../../../../Hooks/useWallet';
import { useAllTransactions } from '../../../../Hooks/useAllTransactions';
import NavigationMenu from "../../NavigationMenu/View";
import FooterMenu from "../../FooterMenu/View";
import walletService from '../../../../Services/WalletService';

function TransactionListPage() {
  const {
    currentWallet,
    logout,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

  // Session management state
  const [forceURL, setForceURL] = useState("");
  const [error, setError] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Transaction filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const getWalletAddress = () => {
    if (!currentWallet) return "";
    return currentWallet.address;
  };

  const {
    transactions,
    loading: txloading,
    error: txerror,
    refresh: txrefresh
  } = useAllTransactions(getWalletAddress());

  // Session checking effect
  useEffect(() => {
    let mounted = true;

    if (mounted) {
        window.scrollTo(0, 0);
    }

    const checkWalletSession = async () => {
      try {
        if (!mounted) return;
        setIsLoading(true);

        if (serviceLoading) {
          return;
        }

        if (!currentWallet) {
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
          setError(null);
        }

      } catch (error) {
        console.error('TransactionListPage: Session check error:', error);
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

  const filteredTransactions = transactions?.filter(tx => {
    const matchesSearch = tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.from.toLowerCase().includes(searchTerm.toLowerCase());

    const isSent = tx.from.toLowerCase() === currentWallet?.address.toLowerCase();

    switch (filterType) {
      case 'sent':
        return isSent && matchesSearch;
      case 'received':
        return !isSent && matchesSearch;
      case 'coin':
        return tx.type === 'coin' && matchesSearch;
      case 'nft':
        return tx.type === 'nft' && matchesSearch;
      default:
        return matchesSearch;
    }
  }).sort((a, b) => {
    return sortOrder === 'desc'
      ? new Date(b.timestamp) - new Date(a.timestamp)
      : new Date(a.timestamp) - new Date(b.timestamp);
  });

  const handleSignOut = () => {
      logout();
      setForceURL("/login");
  };

  if (forceURL !== "" && !serviceLoading) {
    return <Navigate to={forceURL} />;
  }

  if (serviceLoading || isLoading) {
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

    <main id="main-content" className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-safe">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">Transactions</h1>
          <p className="text-lg text-gray-600">View your complete transaction history</p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {txerror && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-800">{txerror}</p>
          </div>
        )}

        {isSessionExpired && (
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">Session expired. Redirecting to login...</p>
          </div>
        )}

        {currentWallet && !isLoading && !serviceLoading && (
          <div className="space-y-6">
            {/* Filters Card */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  />
                </div>

                {/* Filter Dropdowns */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-base"
                >
                  <option value="all">All Transactions</option>
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                  <option value="coin">Coins Only</option>
                  <option value="nft">NFTs Only</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-base"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                <button
                  onClick={txrefresh}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Loading transactions...</span>
                </div>
              ) : filteredTransactions?.length > 0 ? (
                <div className="space-y-2">
                  {filteredTransactions.map((tx) => {
                    const isSent = tx.from.toLowerCase() === currentWallet.address.toLowerCase();
                    const isBurned = tx.to.toLowerCase() === '0x0000000000000000000000000000000000000000';
                    const txValue = Math.floor(Number(tx.value)) || 0;
                    const txFee = Math.floor(Number(tx.fee)) || 0;
                    const isNFT = tx.type === 'token';

                    return (
                      <Link
                        key={tx.id || tx.hash}
                        to={`/transaction/${tx.id}`}
                        className="block hover:bg-gray-50 transition-colors cursor-pointer rounded-lg border border-gray-100"
                      >
                        <div className="p-3 sm:p-4">
                          {/* Header Section */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${
                                isNFT
                                  ? (isBurned ? 'bg-orange-100' : 'bg-purple-100')
                                  : (isSent ? 'bg-red-100' : 'bg-green-100')
                              }`}>
                                {isNFT ? (
                                  <Image className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                    isBurned ? 'text-orange-600' : 'text-purple-600'
                                  }`} />
                                ) : (
                                  <Coins className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                    isSent ? 'text-red-600' : 'text-green-600'
                                  }`} />
                                )}
                              </div>
                              <div>
                                <span className={`font-medium ${
                                  isNFT
                                    ? (isBurned ? 'text-orange-600' : (isSent ? 'text-red-600' : 'text-green-600'))
                                    : (isSent ? 'text-red-600' : 'text-green-600')
                                }`}>
                                  {isBurned
                                    ? `Burned ${isNFT ? 'NFT' : 'Coins'}`
                                    : `${isSent ? 'Sent' : 'Received'} ${isNFT ? 'NFT' : 'Coins'}`
                                  }
                                </span>
                              </div>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                tx.status === 'confirmed'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-yellow-50 text-yellow-700'
                              }`}>
                                {tx.status}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              {new Date(tx.timestamp).toLocaleString()}
                            </div>
                          </div>

                          {/* Transaction Details */}
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            {isSent ? (
                              <div className="space-y-1">
                                {isNFT ? (
                                  <>
                                    <div className="flex justify-between items-center text-sm sm:text-base">
                                      <span className="text-gray-600">Non-Fungible Token:</span>
                                      <span className="font-bold text-purple-600">Token ID: {tx.tokenId || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm sm:text-base">
                                      <span className="text-gray-600">Fee Paid:</span>
                                      <span className="font-bold text-red-600">{txValue} CC</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex justify-between items-center text-sm sm:text-base">
                                    <span className="text-gray-600">Sent Amount:</span>
                                    <span className="font-bold text-red-600">{txValue} CC</span>
                                  </div>
                                )}
                                <div className="text-xs sm:text-sm text-gray-500">
                                  Transaction fee is included in the amount
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {isNFT ? (
                                  <>
                                    <div className="flex justify-between items-center text-sm sm:text-base">
                                      <span className="text-gray-600">Non-Fungible Token:</span>
                                      <span className="font-bold text-purple-600">Token ID: {tx.tokenId || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm sm:text-base">
                                      <span className="text-gray-600">Initial Amount:</span>
                                      <span className="text-gray-900">{txValue} CC</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm sm:text-base">
                                      <span className="text-gray-600">Network Fee:</span>
                                      <span className="text-red-600">- {txFee} CC</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-sm sm:text-base">
                                      <span className="font-medium text-gray-600">Actually Received:</span>
                                      <span className="font-bold text-grey-900">0 CC</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex justify-between items-center text-sm sm:text-base">
                                      <span className="text-gray-600">Initial Amount:</span>
                                      <span className="text-gray-900">{txValue} CC</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm sm:text-base text-red-600">
                                      <span>Network Fee:</span>
                                      <span>- {txFee} CC</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-sm sm:text-base">
                                      <span className="font-medium text-gray-600">Actual Received:</span>
                                      <span className="font-bold text-green-600">{txValue - txFee} CC</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <LineChart className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900">No Transactions Found</h3>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(isLoading || serviceLoading) && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading transaction data...</span>
          </div>
        )}
      </div>
    </main>

    <FooterMenu />
  </div>
);
}

export default TransactionListPage;
