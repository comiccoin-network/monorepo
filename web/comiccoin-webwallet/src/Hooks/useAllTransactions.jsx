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
            const sortedTransactions = txList.sort((a, b) => b.timestamp - a.timestamp);
            setTransactions(sortedTransactions);
        } catch (err) {
            setError(err.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [walletAddress]);

    useEffect(() => {
        fetchAllTransactions();
    }, [fetchAllTransactions]);

    // Calculate comprehensive statistics with corrected fee handling
    const statistics = useMemo(() => {
        const coinTxs = transactions.filter(tx => tx.type === 'coin');
        const nftTxs = transactions.filter(tx => tx.type === 'token');

        // Calculate total coin value with proper fee handling
        const totalCoinValue = transactions.reduce((sum, tx) => {
            const txValue = Number(tx.value) || 0;
            const txFee = Number(tx.fee) || 0;
            const currentAddress = walletAddress?.toLowerCase();

            if (tx.type === 'coin') {
                if (tx.from.toLowerCase() === currentAddress) {
                    // When sending coins - value already includes fee deduction
                    return sum - txValue;
                } else if (tx.to.toLowerCase() === currentAddress) {
                    // When receiving coins - subtract fee from received amount
                    return sum + (txValue - txFee);
                }
            } else {
                // For NFT transactions:
                if (tx.from.toLowerCase() === currentAddress) {
                    // When sending NFTs, fee is included in the transaction
                    return sum;
                } else if (tx.to.toLowerCase() === currentAddress) {
                    // When receiving NFTs, subtract the fee
                    return sum - txFee;
                }
            }
            return sum;
        }, 0);

        // Track NFT ownership
        const nftOwnership = new Map();
        nftTxs.forEach(tx => {
            nftOwnership.set(tx.tokenId, tx.to.toLowerCase());
        });

        const ownedNfts = new Set(
            Array.from(nftOwnership.entries())
                .filter(([_, owner]) => owner === walletAddress?.toLowerCase())
                .map(([tokenId]) => tokenId)
        );

        return {
            totalTransactions: transactions.length,
            coinTransactionsCount: coinTxs.length,
            nftTransactionsCount: nftTxs.length,
            totalCoinValue: Math.max(0, parseFloat(totalCoinValue.toFixed(6))), // Ensure non-negative with 6 decimal precision
            totalNftCount: ownedNfts.size
        };
    }, [transactions, walletAddress]);

    // Process transactions for display with corrected actual value calculation
    const processedTransactions = useMemo(() => {
        return transactions.map(tx => {
            const isSender = tx.from.toLowerCase() === walletAddress?.toLowerCase();
            const txValue = Number(tx.value) || 0;
            const txFee = Number(tx.fee) || 0;

            let actualValue;
            if (tx.type === 'token') {
                actualValue = 0; // NFTs don't have a CC value
            } else if (isSender) {
                actualValue = txValue; // For sent transactions, show the total amount (fee already included)
            } else {
                actualValue = txValue - txFee; // For received transactions, subtract the fee
            }

            return {
                ...tx,
                actualValue: parseFloat(actualValue.toFixed(6))
            };
        });
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
