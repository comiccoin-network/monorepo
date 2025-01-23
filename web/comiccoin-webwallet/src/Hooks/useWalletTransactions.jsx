// monorepo/web/comiccoin-webwallet/src/Hooks/useWalletTransactions.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import blockchainService from '../Services/BlockchainService'

export const useWalletTransactions = (walletAddress) => {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Basic fetch for all transactions
    const fetchTransactions = useCallback(async () => {
        if (!walletAddress) return

        setLoading(true)
        setError(null)

        try {
            const txList = await blockchainService.fetchWalletTransactions(walletAddress)
            const sortedTransactions = txList.sort((a, b) => b.timestamp - a.timestamp)
            setTransactions(sortedTransactions)
        } catch (err) {
            setError(err.message)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }, [walletAddress])

    // NFT specific fetch
    const getNftTransactions = useCallback(async () => {
        if (!walletAddress) return

        setLoading(true)
        setError(null)

        try {
            const txList = await blockchainService.fetchWalletTransactions(walletAddress, 'token')
            const sortedTransactions = txList.sort((a, b) => b.timestamp - a.timestamp)
            setTransactions(sortedTransactions)
        } catch (err) {
            setError(err.message)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }, [walletAddress])

    // Auto-fetch on mount and wallet change
    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    // Calculate statistics from transactions with corrected fee handling
    const statistics = useMemo(() => {
        const coinTxs = transactions.filter((tx) => tx.type === 'coin')
        const nftTxs = transactions.filter((tx) => tx.type === 'token')
        const currentAddress = walletAddress?.toLowerCase()

        // Calculate total coin value with proper fee handling
        const totalCoinValue = transactions.reduce((sum, tx) => {
            const txValue = Number(tx.value) || 0
            const txFee = Number(tx.fee) || 0

            if (tx.type === 'coin') {
                if (tx.from.toLowerCase() === currentAddress) {
                    // When sending coins - value already includes fee deduction
                    return sum - txValue
                } else if (tx.to.toLowerCase() === currentAddress) {
                    // When receiving coins - subtract fee from received amount
                    return sum + (txValue - txFee)
                }
            } else {
                // For NFT transactions:
                if (tx.from.toLowerCase() === currentAddress) {
                    // Developers note: NFTs do not affect sum as transaction fee
                    // subtracts any ComicCoin value. NFTs have no ComicCoin value.
                    return sum
                } else if (tx.to.toLowerCase() === currentAddress) {
                    // Developers note: NFTs do not affect sum as transaction fee
                    // subtracts any ComicCoin value. NFTs have no ComicCoin value.
                    return sum
                }
            }
            return sum
        }, 0)

        // Calculate NFT ownership
        const ownedNfts = new Set()
        nftTxs.forEach((tx) => {
            // Don't count burned NFTs
            const isBurned = tx.to.toLowerCase() === '0x0000000000000000000000000000000000000000'

            if (tx.from.toLowerCase() === currentAddress) {
                ownedNfts.delete(tx.tokenId)
            } else if (tx.to.toLowerCase() === currentAddress && !isBurned) {
                ownedNfts.add(tx.tokenId)
            }
        })

        return {
            totalTransactions: transactions.length,
            coinTransactionsCount: coinTxs.length,
            nftTransactionsCount: nftTxs.length,
            totalCoinValue: Math.max(0, totalCoinValue), // Ensure non-negative.
            totalNftCount: ownedNfts.size,
        }
    }, [transactions, walletAddress])

    // Process transactions for display
    const processedTransactions = useMemo(() => {
        return transactions.map((tx) => {
            const isSender = tx.from.toLowerCase() === walletAddress?.toLowerCase()
            const txValue = Number(tx.value) || 0
            const txFee = Number(tx.fee) || 0

            let actualValue
            if (tx.type === 'token') {
                actualValue = 0 // NFTs don't have a CC value
            } else if (isSender) {
                actualValue = txValue // For sent transactions, show the total amount (fee already included)
            } else {
                actualValue = txValue - txFee // For received transactions, subtract the fee
            }

            return {
                ...tx,
                actualValue: parseFloat(actualValue.toFixed(6)),
            }
        })
    }, [transactions, walletAddress])

    return {
        transactions: processedTransactions,
        loading,
        error,
        refresh: fetchTransactions,
        getNftTransactions,
        statistics,
        coinTransactionsCount: statistics.coinTransactionsCount,
        nftTransactionsCount: statistics.nftTransactionsCount,
        totalTransactions: statistics.totalTransactions,
    }
}
