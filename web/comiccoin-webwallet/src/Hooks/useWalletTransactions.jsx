// src/Hooks/useWalletTransactions.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import blockchainService from '../Services/BlockchainService';

export const useWalletTransactions = (walletAddress) => {
    // State
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch transactions function
    const fetchTransactions = useCallback(async () => {
        if (!walletAddress) return;

        setLoading(true);
        setError(null);

        try {
            const txList = await blockchainService.fetchWalletTransactions(walletAddress);
            const sortedTransactions = txList.sort((a, b) => b.timestamp - a.timestamp);
            setTransactions(sortedTransactions);
        } catch (err) {
            setError(err.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [walletAddress]);

    // Fetch transactions on mount and when wallet address changes
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Derived state calculations using useMemo
    const statistics = useMemo(() => {
        const coinTransactions = transactions.filter(tx => tx.type === 'coin');
        const nftTransactions = transactions.filter(tx => tx.type === 'token');

        return {
            totalTransactions: transactions.length,
            coinTransactionsCount: coinTransactions.length,
            nftTransactionsCount: nftTransactions.length,
            coinTransactions,
            nftTransactions,
            // Additional statistics can be added here
            totalCoinValue: coinTransactions.reduce((sum, tx) => sum + Number(tx.value), 0),
            totalNftCount: new Set(nftTransactions.map(tx => tx.tokenId)).size,
            latestCoinTransaction: coinTransactions[0] || null,
            latestNftTransaction: nftTransactions[0] || null,
        };
    }, [transactions]);

    // Transaction filters
    const getTransactionsByType = useCallback((type) => {
        return transactions.filter(tx => tx.type === type);
    }, [transactions]);

    const getTransactionsByStatus = useCallback((status) => {
        return transactions.filter(tx => tx.status === status);
    }, [transactions]);

    // Return the hook's API
    return {
        // Basic state
        transactions,
        loading,
        error,
        refresh: fetchTransactions,

        // Statistics
        statistics,

        // Filter methods
        getCoinTransactions: () => getTransactionsByType('coin'),
        getNftTransactions: () => getTransactionsByType('token'),
        getPendingTransactions: () => getTransactionsByStatus('pending'),
        getConfirmedTransactions: () => getTransactionsByStatus('confirmed'),

        // Direct access to counts
        totalTransactions: statistics.totalTransactions,
        coinTransactionsCount: statistics.coinTransactionsCount,
        nftTransactionsCount: statistics.nftTransactionsCount,

        // Direct access to filtered transactions
        coinTransactions: statistics.coinTransactions,
        nftTransactions: statistics.nftTransactions,
    };
};
