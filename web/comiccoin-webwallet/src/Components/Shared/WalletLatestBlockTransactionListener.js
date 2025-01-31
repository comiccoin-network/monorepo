// monorepo/web/comiccoin-webwallet/src/Components/Shared/WalletLatestBlockTransactionListener.jsx
import { useEffect } from 'react'
import { useLatestBlockTransactionSSE } from '../../Contexts/LatestBlockTransactionSSEContext'

/**
 * WalletLatestBlockTransactionListener Component
 *
 * This component listens for new blockchain transactions via Server-Sent Events (SSE)
 * and notifies the parent component when a new transaction is detected for the current wallet.
 *
 * @param {Object} currentWallet - The current wallet object containing the address
 * @param {Function} onNewTransaction - Callback function to handle new transactions
 */
const WalletLatestBlockTransactionListener = ({ currentWallet, onNewTransaction }) => {
    // Subscribe to SSE updates for latest blockchain transactions
    const { latestData, error } = useLatestBlockTransactionSSE()

    useEffect(() => {
        // Exit early if we don't have transaction data or a wallet address
        if (!latestData || !currentWallet?.address) return

        /**
         * Parse the raw transaction data string into an object
         * Expected format: "direction|type|value|timestamp"
         * Example: "FROM|TRANSFER|100|1234567890"
         */
        const parseTransactionData = (data) => {
            const [direction, type, value, timestamp] = data.split('|')
            return { direction, type, value, timestamp }
        }

        try {
            // Create a unique storage key for each wallet address
            const storageKey = `latest_tx_${currentWallet.address}`

            // Get the previously stored transaction for this wallet (if any)
            const storedTransaction = localStorage.getItem(storageKey)

            // Parse the incoming transaction data
            const parsedLatestData = parseTransactionData(latestData)

            // Only process transactions that are directly related to the wallet
            // (either sending FROM or receiving TO)
            if (parsedLatestData.direction === 'FROM' || parsedLatestData.direction === 'TO') {
                if (!storedTransaction) {
                    // This is the first transaction we're seeing for this wallet.
                    // Store it as our baseline for future comparison.
                    // We don't trigger onNewTransaction here because:
                    // 1. SSE connections can be periodic/reconnecting
                    // 2. We need a baseline transaction to compare against
                    // 3. We only want to notify of actual new transactions
                    localStorage.setItem(storageKey, latestData)
                } else {
                    // We have a previous transaction to compare against
                    const parsedStoredTransaction = parseTransactionData(storedTransaction)

                    // Compare timestamps to detect if this is actually a new transaction
                    // Only notify parent component if timestamps don't match
                    if (parsedStoredTransaction.timestamp !== parsedLatestData.timestamp) {
                        // Update stored transaction and notify parent
                        localStorage.setItem(storageKey, latestData)
                        onNewTransaction(parsedLatestData)
                    }
                }
            }
        } catch (error) {
            console.error('Error processing transaction:', error)
        }
    }, [currentWallet, latestData, onNewTransaction])

    // Handle any SSE connection errors
    useEffect(() => {
        if (error) {
            console.error('SSE Error:', error)
        }
    }, [error])

    // This component doesn't render anything visible
    return null
}

export default WalletLatestBlockTransactionListener
