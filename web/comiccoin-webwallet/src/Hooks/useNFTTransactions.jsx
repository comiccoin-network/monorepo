// src/Hooks/useNFTTransactions.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import blockchainService from '../Services/BlockchainService'

export const useNFTTransactions = (walletAddress) => {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchNFTTransactions = useCallback(async () => {
        if (!walletAddress) return

        setLoading(true)
        setError(null)

        try {
            const txList = await blockchainService.fetchWalletTransactions(walletAddress, 'token')

            // Create a map to track the latest owner of each NFT
            const nftOwnership = new Map()

            // Sort transactions by timestamp in ascending order to process oldest first
            const sortedTransactions = txList.sort((a, b) => a.timestamp - b.timestamp)

            // Track ownership changes
            sortedTransactions.forEach((tx) => {
                nftOwnership.set(tx.tokenId, tx.to.toLowerCase())
            })

            // Filter transactions to only include those where you're still the owner
            const filteredTransactions = txList
                .filter((tx) => nftOwnership.get(tx.tokenId) === walletAddress.toLowerCase())
                .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first for display

            setTransactions(filteredTransactions)
        } catch (err) {
            setError(err.message)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }, [walletAddress])

    // Fetch on mount or wallet change
    useEffect(() => {
        fetchNFTTransactions()
    }, [fetchNFTTransactions])

    // Calculate NFT-specific statistics
    const statistics = useMemo(() => {
        // Create a map of currently owned NFTs
        const ownedNfts = new Set()
        const processedTransactions = [...transactions].sort((a, b) => a.timestamp - b.timestamp)

        processedTransactions.forEach((tx) => {
            if (tx.to.toLowerCase() === walletAddress?.toLowerCase()) {
                ownedNfts.add(tx.tokenId)
            }
        })

        return {
            totalNftCount: ownedNfts.size,
            nftTransactionsCount: transactions.length,
        }
    }, [transactions, walletAddress])

    return {
        transactions,
        loading,
        error,
        refresh: fetchNFTTransactions,
        statistics,
    }
}
