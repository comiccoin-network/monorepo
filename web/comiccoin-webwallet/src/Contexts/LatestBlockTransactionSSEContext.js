// monorepo/web/comiccoin-webwallet/src/Contexts/LatestBlockTransactionLatestBlockTransactionSSEContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import latestBlockTransactionSSEService from '../Services/LatestBlockTransactionSSEService'

const LatestBlockTransactionSSEContext = createContext()

export function LatestBlockTransactionSSEProvider({ children }) {
    const [latestData, setLatestData] = useState(null)
    const [error, setError] = useState(null)
    const [isConnected, setIsConnected] = useState(false)

    const connect = (address) => {
        try {
            setError(null)
            setIsConnected(true)
            latestBlockTransactionSSEService.connect(address)
        } catch (err) {
            setError(err.message)
            setIsConnected(false)
        }
    }

    const disconnect = () => {
        latestBlockTransactionSSEService.disconnect()
        setIsConnected(false)
        setLatestData(null)
    }

    useEffect(() => {
        const unsubscribe = latestBlockTransactionSSEService.subscribe((data) => {
            if (data.startsWith('Error:')) {
                setError(data)
                setIsConnected(false)
            } else {
                setLatestData(data)
            }
        })

        return () => {
            unsubscribe()
            disconnect()
        }
    }, [])

    const value = {
        latestData,
        error,
        isConnected,
        connect,
        disconnect,
    }

    return (
        <LatestBlockTransactionSSEContext.Provider value={value}>{children}</LatestBlockTransactionSSEContext.Provider>
    )
}

export function useLatestBlockTransactionSSE() {
    const context = useContext(LatestBlockTransactionSSEContext)
    if (!context) {
        throw new Error('useContext must be used within an LatestBlockTransactionSSEProvider')
    }
    return context
}
