// monorepo/web/comiccoin-webwallet/src/Contexts/TransactionNotificationsContext.jsx
import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react'
import { useLatestBlockTransactionSSE } from './LatestBlockTransactionSSEContext'
import { useTransactionNotification } from '../Hooks/useTransactionNotification'

const TransactionNotificationsContext = createContext()

export function TransactionNotificationsProvider({ children }) {
    const { latestData, error } = useLatestBlockTransactionSSE()
    const [notification, setNotification] = useTransactionNotification()
    const latestDataRef = useRef(latestData)
    const callbacksRef = useRef(new Map())

    // Keep track of the latest SSE data
    useEffect(() => {
        latestDataRef.current = latestData
    }, [latestData])

    const handleNewTransaction = useCallback((currentWallet, callback) => {
        // Store the callback for this wallet
        if (callback && currentWallet?.address) {
            callbacksRef.current.set(currentWallet.address, callback)
        }

        const latestData = latestDataRef.current
        if (!latestData || !currentWallet?.address) return

        const parseTransactionData = (data) => {
            const [direction, type, value, timestamp] = data.split('|')
            return { direction, type, value, timestamp }
        }

        try {
            const storageKey = `latest_tx_${currentWallet.address}`
            const storedTransaction = localStorage.getItem(storageKey)
            const parsedLatestData = parseTransactionData(latestData)

            if (parsedLatestData.direction === 'FROM' || parsedLatestData.direction === 'TO') {
                if (!storedTransaction) {
                    localStorage.setItem(storageKey, latestData)
                } else {
                    const parsedStoredTransaction = parseTransactionData(storedTransaction)

                    if (parsedStoredTransaction.timestamp !== parsedLatestData.timestamp) {
                        localStorage.setItem(storageKey, latestData)

                        // Create notification message
                        const action = parsedLatestData.direction === 'FROM' ? 'sent' : 'received'
                        let message
                        if (parsedLatestData.type.toLowerCase() === 'coin') {
                            message = `You've ${action} ${parsedLatestData.value} coins`
                        } else if (parsedLatestData.type.toLowerCase() === 'token') {
                            message = `You've ${action} an NFT`
                        } else {
                            message = `New transaction ${action}`
                        }

                        setNotification({
                            message: `${message}!`,
                            type: parsedLatestData.direction,
                        })

                        // Execute stored callback
                        const storedCallback = callbacksRef.current.get(currentWallet.address)
                        if (storedCallback) {
                            storedCallback(parsedLatestData)
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error processing transaction:', error)
        }
    }, [])

    // Listen for SSE updates and notify all registered callbacks
    useEffect(() => {
        if (latestData) {
            callbacksRef.current.forEach((callback, address) => {
                handleNewTransaction({ address }, callback)
            })
        }
    }, [latestData, handleNewTransaction])

    return (
        <TransactionNotificationsContext.Provider
            value={{
                notification,
                handleNewTransaction,
                clearNotification: () => setNotification(null),
            }}
        >
            {children}
        </TransactionNotificationsContext.Provider>
    )
}

export function useTransactionNotifications() {
    const context = useContext(TransactionNotificationsContext)
    if (!context) {
        throw new Error('useTransactionNotifications must be used within a TransactionNotificationsProvider')
    }
    return context
}
