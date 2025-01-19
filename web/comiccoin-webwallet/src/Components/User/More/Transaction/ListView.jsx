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
      <NavigationMenu />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-12 mb-16 md:mb-0">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Transactions</h1>
          <p className="text-xl text-gray-600">View and manage your transaction history</p>
        </div>

        {/* Session Errors */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isSessionExpired && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800">Session expired. Redirecting to login...</p>
          </div>
        )}

        {/* Transaction Errors */}
        {txerror && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{txerror}</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <button
              onClick={txrefresh}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
              disabled={txloading}
            >
              {txloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100">
          {txloading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : filteredTransactions?.length > 0 ? (
            <div className="divide-y divide-gray-100">
             {filteredTransactions.map((tx) => {
                    const isSent = tx.from.toLowerCase() === currentWallet.address.toLowerCase();
                    const isBurned = tx.to.toLowerCase() === '0x0000000000000000000000000000000000000000';
                    const displayValue = tx.type === 'coin' ? `${tx.actualValue} CC` : `NFT #${tx.tokenId || 'Unknown'}`;

                    return (
                        <Link
                            key={tx.id}
                            to={`/transaction/${tx.id}`}
                            className="block p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        tx.type === 'coin'
                                            ? (isSent ? 'bg-red-100' : 'bg-green-100')
                                            : isBurned
                                                ? 'bg-orange-100'
                                                : 'bg-purple-100'
                                    }`}>
                                        {tx.type === 'coin' ? (
                                            <Coins className={`w-5 h-5 ${
                                                isSent ? 'text-red-600' : 'text-green-600'
                                            }`} />
                                        ) : (
                                            <Image className={`w-5 h-5 ${
                                                isBurned ? 'text-orange-600' : 'text-purple-600'
                                            }`} />
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium ${
                                                tx.type === 'coin'
                                                    ? (isSent ? 'text-red-600' : 'text-green-600')
                                                    : isBurned
                                                        ? 'text-orange-600'
                                                        : (isSent ? 'text-red-600' : 'text-green-600')
                                            }`}>
                                                {isBurned
                                                    ? `Burned ${tx.type === 'coin' ? 'Coins' : 'NFT'}`
                                                    : `${isSent ? 'Sent' : 'Received'} ${tx.type === 'coin' ? 'Coins' : 'NFT'}`
                                                }
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                tx.status === 'confirmed'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-yellow-50 text-yellow-700'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </div>

                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {new Date(tx.timestamp).toLocaleString()}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <div className="text-gray-500">
                                                    From: {tx.from}
                                                </div>
                                                <div className="text-gray-500">
                                                    {isBurned
                                                        ? `To: Burned ${tx.type === 'coin' ? 'Coins' : 'NFT'} (Zero Address)`
                                                        : `To: ${tx.to}`
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={`text-lg font-bold ${
                                        isBurned
                                            ? 'text-orange-600'
                                            : (isSent ? 'text-red-600' : 'text-green-600')
                                    }`}>
                                        {isBurned ? '🔥 ' : (isSent ? '-' : '+')}{displayValue}
                                    </div>
                                    {isSent && (
                                        <div className="text-sm text-gray-500 mt-1">
                                            Fee: {tx.fee} CC
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
      </main>

      <FooterMenu />
    </div>
  );
}

export default TransactionListPage;
