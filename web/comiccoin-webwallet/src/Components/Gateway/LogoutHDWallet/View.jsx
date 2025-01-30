// monorepo/web/comiccoin-webwallet/src/Components/Gateway/Login/View.jsx
import React, { useState, useEffect } from 'react'
import { useWallet } from '../../../Hooks/useWallet'
import { Navigate, Link } from 'react-router-dom'
import {
    Globe,
    Monitor,
    Wallet,
    AlertCircle,
    Info,
    Loader2,
    Key,
    LogIn,
    KeyRound,
    Plus,
    ArrowRight,
    RefreshCw,
} from 'lucide-react'
import NavigationMenu from '../NavigationMenu/View'
import FooterMenu from '../FooterMenu/View'
import { useLatestBlockTransactionSSE } from '../../../Contexts/LatestBlockTransactionSSEContext'

// Common input styles to prevent iOS zoom
const inputStyles = {
    base: `block w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border
         border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500
         focus:border-transparent transition-colors text-base`,
    select: `mt-1 block w-full px-3 sm:px-4 h-[42px] sm:h-[46px] bg-white
          border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500
          focus:border-transparent transition-colors text-base appearance-none`,
    withIcon: `pl-9 sm:pl-10`,
}

function LogoutWalletPage() {
    const { logout } = useWallet()
    const { disconnect } = useLatestBlockTransactionSSE()
    const [isLoggedOut, setIsLoggedOut] = useState(false)

    useEffect(() => {
        // Perform logout actions once when component mounts
        console.log('Closing wallet...')
        logout()
        console.log('Disconnecting from authority...')
        disconnect()
        console.log('Finishing up...')
        setIsLoggedOut(true)
    }, []) // Empty dependency array ensures this runs once

    if (isLoggedOut) {
        return <Navigate to="/login" replace />
    }

    // Optional loading state while logout is processing
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Logging out...</span>
        </div>
    )
}

export default LogoutWalletPage
