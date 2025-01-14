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

        // Calculate total coin value using actualValue
        const totalCoinValue = coinTransactions.reduce((sum, tx) => {
            if (tx.from === walletAddress) {
                return sum - Number(tx.actualValue);
            } else {
                return sum + Number(tx.actualValue);
            }
        }, 0);

        // Calculate total fees paid
        const totalFeesPaid = coinTransactions.reduce((sum, tx) => {
            if (tx.from === walletAddress) {
                return sum + Number(tx.fee);
            }
            return sum;
        }, 0);

        // Calculate NFT ownership
        const ownedNfts = new Set();
        nftTransactions.forEach(tx => {
            if (tx.from === walletAddress) {
                ownedNfts.delete(tx.tokenId);
            } else {
                ownedNfts.add(tx.tokenId);
            }
        });

        return {
            totalTransactions: transactions.length,
            coinTransactionsCount: coinTransactions.length,
            nftTransactionsCount: nftTransactions.length,
            coinTransactions,
            nftTransactions,
            totalCoinValue,
            totalFeesPaid,
            totalNftCount: ownedNfts.size,
            ownedNftIds: Array.from(ownedNfts)
        };
    }, [transactions, walletAddress]);

    return {
        // Basic state
        transactions,
        loading,
        error,
        refresh: fetchTransactions,

        // Statistics
        statistics,

        // Direct access to counts
        totalTransactions: statistics.totalTransactions,
        coinTransactionsCount: statistics.coinTransactionsCount,
        nftTransactionsCount: statistics.nftTransactionsCount,

        // Direct access to filtered transactions
        coinTransactions: statistics.coinTransactions,
        nftTransactions: statistics.nftTransactions,

        // Additional statistics
        totalCoinValue: statistics.totalCoinValue,
        totalFeesPaid: statistics.totalFeesPaid,
        totalNftCount: statistics.totalNftCount
    };
};
