// src/Hooks/useNFTTransactions.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import blockchainService from '../Services/BlockchainService';

export const useNFTTransactions = (walletAddress) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNFTTransactions = useCallback(async () => {
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

    // Fetch on mount or wallet change
    useEffect(() => {
        fetchNFTTransactions();
    }, [fetchNFTTransactions]);

    // Calculate NFT-specific statistics
    const statistics = useMemo(() => {
        // Calculate NFT ownership
        const ownedNfts = new Set();
        transactions.forEach(tx => {
            if (tx.from.toLowerCase() === walletAddress?.toLowerCase()) {
                ownedNfts.delete(tx.tokenId);
            } else if (tx.to.toLowerCase() === walletAddress?.toLowerCase()) {
                ownedNfts.add(tx.tokenId);
            }
        });

        return {
            totalNftCount: ownedNfts.size,
            nftTransactionsCount: transactions.length
        };
    }, [transactions, walletAddress]);

    return {
        transactions,
        loading,
        error,
        refresh: fetchNFTTransactions,
        statistics
    };
};
