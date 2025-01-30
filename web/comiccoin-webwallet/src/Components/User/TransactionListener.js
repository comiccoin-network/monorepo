// components/Shared/TransactionListener.jsx
import { useEffect } from 'react'
import { useLatestBlockTransactionSSE } from '../../Contexts/LatestBlockTransactionSSEContext'

const TransactionListener = ({ onNewTransaction }) => {
    const { latestData, error } = useLatestBlockTransactionSSE()

    useEffect(() => {
        if (latestData) {
            onNewTransaction(latestData)
        }
    }, [latestData, onNewTransaction])

    // Optionally handle errors
    useEffect(() => {
        if (error) {
            console.error('SSE Error:', error)
        }
    }, [error])

    // This component doesn't render anything
    return null
}

export default TransactionListener
