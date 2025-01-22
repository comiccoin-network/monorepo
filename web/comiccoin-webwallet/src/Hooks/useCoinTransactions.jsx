// src/Hooks/useCoinTransactions.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import blockchainService from '../Services/BlockchainService'

export const useCoinTransactions = (walletAddress) => {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchCoinTransactions = useCallback(async () => {
        if (!walletAddress) return

        setLoading(true)
        setError(null)

        try {
            const txList = await blockchainService.fetchWalletTransactions(walletAddress, 'coin')
            const sortedTransactions = txList.sort((a, b) => b.timestamp - a.timestamp)
            setTransactions(sortedTransactions)
        } catch (err) {
            setError(err.message)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }, [walletAddress])

    // Fetch on mount or wallet change
    useEffect(() => {
        fetchCoinTransactions()
    }, [fetchCoinTransactions])

    // Calculate coin-specific statistics
    const statistics = useMemo(() => {
        const totalCoinValue = transactions.reduce((sum, tx) => {
            if (tx.from.toLowerCase() === walletAddress?.toLowerCase()) {
                return sum - Number(tx.value) - Number(tx.fee)
            } else if (tx.to.toLowerCase() === walletAddress?.toLowerCase()) {
                return sum + Number(tx.value)
            }
            return sum
        }, 0)

        return {
            totalCoinValue,
            coinTransactionsCount: transactions.length,
        }
    }, [transactions, walletAddress])

    return {
        transactions,
        loading,
        error,
        refresh: fetchCoinTransactions,
        statistics,
    }
}
