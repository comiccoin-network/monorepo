// monorepo/web/comiccoin-webwallet/src/Components/User/More/View.jsx
import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
    ClipboardList,
    Key,
    Droplets,
    ExternalLink,
    AlertCircle,
    Loader2,
    KeyRound,
    Network,
    BarChart3,
} from 'lucide-react'

import { useWallet } from '../../../Hooks/useWallet'
import NavigationMenu from '../NavigationMenu/View'
import FooterMenu from '../FooterMenu/View'
import walletService from '../../../Services/WalletService'
// import { useLatestBlockTransactionSSE } from '../../../Contexts/LatestBlockTransactionSSEContext'
import TransactionListener from '../TransactionListener'

const MorePage = () => {
    const { currentWallet, logout, loading: serviceLoading, error: serviceError } = useWallet()
    // const { connect, disconnect, latestData, sseError, isConnected } = useLatestBlockTransactionSSE()

    // // Connect with our backend server and receive SSE stream for latest txs
    // useEffect(() => {
    //     if (currentWallet?.address) {
    //         console.log('SSE connecting to:', currentWallet?.address)
    //         connect(currentWallet?.address)
    //     }
    //     return () => disconnect()
    // }, [currentWallet?.address])

    // // Handle incoming data
    // useEffect(() => {
    //     if (latestData) {
    //         console.log('sse results -->', latestData)
    //     }
    // }, [latestData])

    const handleTransactionStream = (transaction) => {
        // Handle stream transaction data
        console.log('Transaction received:', transaction)
    }

    // State for session management
    const [forceURL, setForceURL] = useState('')
    const [error, setError] = useState(null)
    const [isSessionExpired, setIsSessionExpired] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const menuItems = [
        {
            title: 'Transactions',
            description: 'View your complete transaction history',
            icon: ClipboardList,
            link: '/transactions',
            isExternal: false,
        },
        {
            title: 'ComicCoin Faucet',
            description: 'Get free coins for your wallet',
            icon: Droplets,
            link: 'https://comiccoinfaucet.com',
            isExternal: true,
        },
    ]

    // Session checking effect
    useEffect(() => {
        console.log('MorePage: Initial useEffect running')
        let mounted = true

        if (mounted) {
            window.scrollTo(0, 0)
        }

        const checkWalletSession = async () => {
            console.log('MorePage: checkWalletSession starting')
            try {
                if (!mounted) return
                setIsLoading(true)

                if (serviceLoading) {
                    console.log('MorePage: Service still loading, waiting...')
                    return
                }

                if (!currentWallet) {
                    console.log('MorePage: No current wallet found, redirecting to login')
                    if (mounted) {
                        setForceURL('/logout')
                    }
                    return
                }

                // Check session using the wallet service
                if (!walletService.checkSession()) {
                    throw new Error('Session expired')
                }

                if (mounted) {
                    setForceURL('')
                }
            } catch (error) {
                console.error('MorePage: Session check error:', error)
                if (error.message === 'Session expired' && mounted) {
                    handleSessionExpired()
                } else if (mounted) {
                    setError(error.message)
                }
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }

        checkWalletSession()
        const sessionCheckInterval = setInterval(checkWalletSession, 60000)

        return () => {
            mounted = false
            clearInterval(sessionCheckInterval)
        }
    }, [currentWallet, serviceLoading])

    const handleSessionExpired = () => {
        setIsSessionExpired(true)
        logout()
        setError('Your session has expired. Please sign in again.')
        setTimeout(() => {
            setForceURL('/logout')
        }, 3000)
    }

    const handleSignOut = () => {
        logout()
        setForceURL('/logout')
    }

    if (forceURL !== '' && !serviceLoading) {
        console.log('MorePage: Navigating to:', forceURL)
        return <Navigate to={forceURL} />
    }

    if (serviceLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading...</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            <NavigationMenu onSignOut={handleSignOut} />
            <TransactionListener onNewTransaction={handleTransactionStream} />

            <main id="main-content" className="flex-grow flex flex-col px-4 md:px-6 lg:px-8 py-6 md:py-12">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Error Messages */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm md:text-base text-red-800">{error}</p>
                        </div>
                    )}

                    {isSessionExpired && (
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm md:text-base text-yellow-800">
                                Session expired. Redirecting to login...
                            </p>
                        </div>
                    )}

                    {/* Page Header */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-2 md:mb-4">More Options</h1>
                        <p className="text-lg md:text-xl text-gray-600">Access additional features and settings</p>
                    </div>

                    {/* Menu Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-24 md:pb-0">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon
                            const CardContent = () => (
                                <div className="flex items-start gap-4 p-4 md:p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-colors group touch-manipulation">
                                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 md:mb-2">
                                            <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                                                {item.title}
                                            </h3>
                                            {item.isExternal && (
                                                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                    </div>
                                </div>
                            )

                            return item.isExternal ? (
                                <a
                                    key={index}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block transition-transform active:scale-[0.98]"
                                >
                                    <CardContent />
                                </a>
                            ) : (
                                <Link
                                    key={index}
                                    to={item.link}
                                    className="block transition-transform active:scale-[0.98]"
                                >
                                    <CardContent />
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </main>

            <FooterMenu />
        </div>
    )
}

export default MorePage
