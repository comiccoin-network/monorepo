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

function TransactionListPage() {
  const {
    currentWallet,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'sent', 'received', 'coin', 'nft'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

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
      <NavigationMenu />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-12 mb-16 md:mb-0">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Transactions</h1>
          <p className="text-xl text-gray-600">View and manage your transaction history</p>
        </div>

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
                const displayValue = tx.type === 'coin' ? `${tx.actualValue} CC` : `NFT #${tx.tokenId || 'Unknown'}`;

                return (
                  <div key={tx.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
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
                                To: {tx.to}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          isSent ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {isSent ? '-' : '+'}{displayValue}
                        </div>
                        {tx.type === 'coin' && (
                          <div className="text-sm text-gray-500 mt-1">
                            Fee: {tx.fee} CC
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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