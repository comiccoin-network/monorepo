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
        const totalCoinValue = transactions.reduce((sum, tx) => {
            if (tx.from.toLowerCase() === walletAddress?.toLowerCase()) {
                // When sending any transaction (coin or NFT), subtract fee
                const feeDeduction = Number(tx.fee);

                // For coin transactions, also subtract the value
                const valueDeduction = tx.type === 'coin' ? Number(tx.value) : 0;

                return sum - valueDeduction - feeDeduction;
            } else if (tx.to.toLowerCase() === walletAddress?.toLowerCase() && tx.type === 'coin') {
                // Only add received value for coin transactions
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

    // Process transactions for display
    const processedTransactions = useMemo(() => {
        return transactions.map(tx => {
            const isSender = tx.from.toLowerCase() === walletAddress?.toLowerCase();

            let actualValue;
            if (tx.type === 'token') {
                actualValue = 0;
            } else {
                // For coin transactions
                if (isSender) {
                    actualValue = Number(tx.value) - Number(tx.fee);
                } else {
                    actualValue = Number(tx.value) - Number(tx.fee);
                }
            }

            return {
                ...tx,
                actualValue
            };
        }).sort((a, b) => b.timestamp - a.timestamp);
    }, [transactions, walletAddress]);

    return {
        transactions: processedTransactions,
        loading,
        error,
        refresh: fetchAllTransactions,
        statistics,
        coinTransactions: processedTransactions.filter(tx => tx.type === 'coin'),
        nftTransactions: processedTransactions.filter(tx => tx.type === 'token')
    };
};
