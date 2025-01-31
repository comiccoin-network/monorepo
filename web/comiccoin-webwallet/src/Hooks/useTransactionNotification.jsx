// monorepo/web/comiccoin-webwallet/src/Hooks/useTransactionNotification.js
import { useState, useEffect } from 'react'

export const useTransactionNotification = () => {
    const [notification, setNotification] = useState(() => {
        // Check if there's a saved notification in sessionStorage
        const saved = sessionStorage.getItem('transaction_notification')
        if (saved) {
            const { message, type, timestamp } = JSON.parse(saved)
            // Only restore if within 15 seconds
            if (Date.now() - timestamp < 15000) {
                return { message, type }
            }
            sessionStorage.removeItem('transaction_notification')
        }
        return null
    })

    useEffect(() => {
        if (notification) {
            // Save notification with timestamp
            sessionStorage.setItem(
                'transaction_notification',
                JSON.stringify({
                    ...notification,
                    timestamp: Date.now(),
                })
            )

            const timer = setTimeout(() => {
                setNotification(null)
                sessionStorage.removeItem('transaction_notification')
            }, 15000)

            return () => clearTimeout(timer)
        }
    }, [notification])

    return [notification, setNotification]
}
