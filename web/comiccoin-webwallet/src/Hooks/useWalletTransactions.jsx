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

        // Calculate total coin value by tracking incoming and outgoing transactions
        const totalCoinValue = coinTransactions.reduce((sum, tx) => {
            if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
                // When we send coins:
                // 1. Subtract the value being sent
                // 2. Subtract the transaction fee
                return sum - Number(tx.value) - Number(tx.fee);
            } else if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
                // When we receive coins:
                // Just add the value (we don't pay fee when receiving)
                return sum + Number(tx.value);
            }
            return sum;
        }, 0);

        // Calculate total fees paid (only when we send)
        const totalFeesPaid = coinTransactions.reduce((sum, tx) => {
            // We only pay fees when we are the sender
            if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
                return sum + Number(tx.fee);
            }
            return sum;
        }, 0);

        // Calculate total sent
        const totalSent = coinTransactions.reduce((sum, tx) => {
            if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
                return sum + Number(tx.value);
            }
            return sum;
        }, 0);

        // Calculate total received
        const totalReceived = coinTransactions.reduce((sum, tx) => {
            if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
                return sum + Number(tx.value);
            }
            return sum;
        }, 0);

        // Calculate NFT ownership
        const ownedNfts = new Set();
        nftTransactions.forEach(tx => {
            if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
                ownedNfts.delete(tx.tokenId);
            } else if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
                ownedNfts.add(tx.tokenId);
            }
        });

        return {
            totalTransactions: transactions.length,
            coinTransactionsCount: coinTransactions.length,
            nftTransactionsCount: nftTransactions.length,
            coinTransactions,
            nftTransactions,
            totalCoinValue,          // Current balance
            totalFeesPaid,           // Total fees paid
            totalSent,               // Total amount sent
            totalReceived,           // Total amount received
            totalNftCount: ownedNfts.size,
            ownedNftIds: Array.from(ownedNfts),
            // Add formatted values for display
            formattedBalance: `${totalCoinValue.toLocaleString()} CC`,
            formattedTotalSent: `${totalSent.toLocaleString()} CC`,
            formattedTotalReceived: `${totalReceived.toLocaleString()} CC`,
            formattedTotalFees: `${totalFeesPaid.toLocaleString()} CC`
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

        totalCoinValue: statistics.totalCoinValue,
       totalFeesPaid: statistics.totalFeesPaid,
       totalSent: statistics.totalSent,
       totalReceived: statistics.totalReceived,
       formattedBalance: statistics.formattedBalance,
       formattedTotalSent: statistics.formattedTotalSent,
       formattedTotalReceived: statistics.formattedTotalReceived,
       formattedTotalFees: statistics.formattedTotalFees
    };
};
