// monorepo/web/comiccoin-webwallet/src/Hooks/useAllTransactions.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import blockchainService from '../Services/BlockchainService'

export const useAllTransactions = (walletAddress) => {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchAllTransactions = useCallback(async () => {
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

    useEffect(() => {
        fetchAllTransactions()
    }, [fetchAllTransactions])

    // Calculate comprehensive statistics with corrected fee handling
    const statistics = useMemo(() => {
        const coinTxs = transactions.filter((tx) => tx.type === 'coin')
        const nftTxs = transactions.filter((tx) => tx.type === 'token')

        // Calculate total coin value with proper fee handling, using integer math
        const totalCoinValue = transactions.reduce((sum, tx) => {
            const txValue = Math.floor(Number(tx.value)) || 0
            const txFee = Math.floor(Number(tx.fee)) || 0
            const currentAddress = walletAddress?.toLowerCase()

            if (tx.type === 'coin') {
                if (tx.from.toLowerCase() === currentAddress) {
                    return sum - txValue
                } else if (tx.to.toLowerCase() === currentAddress) {
                    return sum + (txValue - txFee)
                }
            } else {
                // Developers note: NFTs do not affect sum as transaction fee
                // subtracts any ComicCoin value. NFTs have no ComicCoin value.
                if (tx.from.toLowerCase() === currentAddress) {
                    return sum
                } else if (tx.to.toLowerCase() === currentAddress) {
                    return sum
                }
            }
            return sum
        }, 0)

        // Track NFT ownership (unchanged as it's already using integers)
        const nftOwnership = new Map()
        nftTxs.forEach((tx) => {
            nftOwnership.set(tx.tokenId, tx.to.toLowerCase())
        })

        const ownedNfts = new Set(
            Array.from(nftOwnership.entries())
                .filter(([_, owner]) => owner === walletAddress?.toLowerCase())
                .map(([tokenId]) => tokenId)
        )

        return {
            totalTransactions: transactions.length,
            coinTransactionsCount: coinTxs.length,
            nftTransactionsCount: nftTxs.length,
            totalCoinValue: Math.max(0, Math.floor(totalCoinValue)),
            totalNftCount: ownedNfts.size,
        }
    }, [transactions, walletAddress])

    // Process transactions for display with integer values
    const processedTransactions = useMemo(() => {
        return transactions.map((tx) => {
            const isSender = tx.from.toLowerCase() === walletAddress?.toLowerCase()
            const txValue = Math.floor(Number(tx.value)) || 0
            const txFee = Math.floor(Number(tx.fee)) || 0

            let actualValue
            if (tx.type === 'token') {
                actualValue = 0
            } else if (isSender) {
                actualValue = txValue
            } else {
                actualValue = txValue - txFee
            }

            return {
                ...tx,
                actualValue: Math.floor(actualValue),
            }
        })
    }, [transactions, walletAddress])

    return {
        transactions: processedTransactions,
        loading,
        error,
        refresh: fetchAllTransactions,
        statistics,
        coinTransactions: processedTransactions.filter((tx) => tx.type === 'coin'),
        nftTransactions: processedTransactions.filter((tx) => tx.type === 'token'),
    }
}
