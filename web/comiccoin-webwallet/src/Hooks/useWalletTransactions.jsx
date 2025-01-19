// src/Hooks/useWalletTransactions.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import blockchainService from '../Services/BlockchainService';

// In useWalletTransactions.js
export const useWalletTransactions = (walletAddress) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Basic fetch for all transactions
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

    // NFT specific fetch
    const getNftTransactions = useCallback(async () => {
        if (!walletAddress) return;

        setLoading(true);
        setError(null);

        try {
            const txList = await blockchainService.fetchWalletTransactions(walletAddress, 'token');
            const sortedTransactions = txList.sort((a, b) => b.timestamp - a.timestamp);
            setTransactions(sortedTransactions);
        } catch (err) {
            setError(err.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [walletAddress]);

    // Auto-fetch on mount and wallet change
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Calculate statistics from transactions
    const statistics = useMemo(() => {
        const coinTxs = transactions.filter(tx => tx.type === 'coin');
        const nftTxs = transactions.filter(tx => tx.type === 'token');

        // Calculate total coin value
        const totalCoinValue = coinTxs.reduce((sum, tx) => {
            if (tx.from.toLowerCase() === walletAddress?.toLowerCase()) {
                return sum - Number(tx.value) - Number(tx.fee);
            } else if (tx.to.toLowerCase() === walletAddress?.toLowerCase()) {
                return sum + Number(tx.value) - Number(tx.fee);
            }
            return sum;
        }, 0);

        // Calculate NFT ownership
        const ownedNfts = new Set();
        nftTxs.forEach(tx => {
            if (tx.from.toLowerCase() === walletAddress?.toLowerCase()) {
                ownedNfts.delete(tx.tokenId);
            } else if (tx.to.toLowerCase() === walletAddress?.toLowerCase()) {
                ownedNfts.add(tx.tokenId);
            }
        });

        return {
            totalTransactions: transactions.length,
            coinTransactionsCount: coinTxs.length,
            nftTransactionsCount: nftTxs.length,
            totalCoinValue,
            totalNftCount: ownedNfts.size,
        };
    }, [transactions, walletAddress]);

    return {
        transactions,
        loading,
        error,
        refresh: fetchTransactions,
        getNftTransactions,
        statistics,
        coinTransactionsCount: statistics.coinTransactionsCount,
        nftTransactionsCount: statistics.nftTransactionsCount,
        totalTransactions: statistics.totalTransactions,
    };
};
