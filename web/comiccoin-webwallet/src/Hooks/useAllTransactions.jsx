// src/Hooks/useAllTransactions.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import blockchainService from '../Services/BlockchainService';

export const useAllTransactions = (walletAddress) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAllTransactions = useCallback(async () => {
        if (!walletAddress) return;

        setLoading(true);
        setError(null);

        try {
            const txList = await blockchainService.fetchWalletTransactions(walletAddress);
            const sortedTransactions = txList.sort((a, b) => a.timestamp - b.timestamp);
            setTransactions(sortedTransactions);
        } catch (err) {
            setError(err.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [walletAddress]);

    // Fetch on mount or wallet change
    useEffect(() => {
        fetchAllTransactions();
    }, [fetchAllTransactions]);

    // Calculate comprehensive statistics
    const statistics = useMemo(() => {
        const coinTxs = transactions.filter(tx => tx.type === 'coin');
        const nftTxs = transactions.filter(tx => tx.type === 'token');

        // Calculate total coin value
        const totalCoinValue = coinTxs.reduce((sum, tx) => {
            if (tx.from.toLowerCase() === walletAddress?.toLowerCase()) {
                return sum - Number(tx.value) - Number(tx.fee);
            } else if (tx.to.toLowerCase() === walletAddress?.toLowerCase()) {
                return sum + Number(tx.value);
            }
            return sum;
        }, 0);

        // Create a map to track the current ownership of each NFT
        const nftOwnership = new Map();

        // Process transactions in chronological order to track ownership
        nftTxs.forEach(tx => {
            nftOwnership.set(tx.tokenId, tx.to.toLowerCase());
        });

        // Count only NFTs where the current owner is this wallet
        const ownedNfts = new Set(
            Array.from(nftOwnership.entries())
                .filter(([_, owner]) => owner === walletAddress?.toLowerCase())
                .map(([tokenId]) => tokenId)
        );

        return {
            totalTransactions: transactions.length,
            coinTransactionsCount: coinTxs.length,
            nftTransactionsCount: nftTxs.length,
            totalCoinValue,
            totalNftCount: ownedNfts.size
        };
    }, [transactions, walletAddress]);

    // Return values in ascending order by default (oldest first)
    // Consumers can sort as needed
    return {
        transactions: transactions.sort((a, b) => b.timestamp - a.timestamp), // newest first for display
        loading,
        error,
        refresh: fetchAllTransactions,
        statistics,
        coinTransactions: transactions.filter(tx => tx.type === 'coin'),
        nftTransactions: transactions.filter(tx => tx.type === 'token')
    };
};
