// src/Components/User/Dashboard/View.jsx
import React, { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
    Globe,
    Monitor,
    Wallet,
    AlertCircle,
    Copy,
    Download,
    RefreshCw,
    Info,
    Loader2,
    LogOut,
    Coins,
    LineChart,
    ArrowUpRight,
    ArrowDownRight,
    Send,
    Image,
    MoreHorizontal,
    Clock,
} from 'lucide-react'

import { useWallet } from '../../../Hooks/useWallet'
import { useAllTransactions } from '../../../Hooks/useAllTransactions'
import NavigationMenu from '../NavigationMenu/View'
import FooterMenu from '../FooterMenu/View'
import walletService from '../../../Services/WalletService'

function DashboardPage() {
    const { currentWallet, wallets, loadWallet, logout, loading: serviceLoading, error: serviceError } = useWallet()

    const {
        transactions,
        loading: txloading,
        error: txerror,
        refresh: txrefresh,
        statistics,
        coinTransactions,
        nftTransactions,
    } = useAllTransactions(currentWallet?.address)

    // For debugging purposes only.
    console.log('DashboardPage: statistics:', statistics, '\nAddr:', currentWallet?.address)

    const [forceURL, setForceURL] = useState('')
    const [walletAddress, setWalletAddress] = useState('')
    const [error, setError] = useState(null)
    const [isSessionExpired, setIsSessionExpired] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Session check effect remains the same...
    useEffect(() => {
        let mounted = true
        if (mounted) {
            window.scrollTo(0, 0)
        }

        const checkWalletSession = async () => {
            try {
                if (!mounted) return
                setIsLoading(true)

                if (serviceLoading) return

                if (!currentWallet) {
                    if (mounted) {
                        setForceURL('/login')
                    }
                    return
                }

                if (!walletService.checkSession()) {
                    throw new Error('Session expired')
                }

                if (mounted) {
                    setForceURL('')
                    setWalletAddress(currentWallet?.address)
                }
            } catch (error) {
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
            setForceURL('/login')
        }, 3000)
    }

    const handleSignOut = () => {
        logout()
        setForceURL('/login')
    }

    const TransactionList = ({ transactions }) => {
        const recentTransactions = transactions?.slice(0, 5) || []

        if (!transactions || transactions.length === 0) {
            return (
                <div className="text-center py-6">
                    <Image className="w-12 h-12 mx-auto mb-2 text-gray-400 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Transactions Yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Get started by claiming some free ComicCoins</p>
                    <a
                        href="https://comiccoinfaucet.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm group"
                    >
                        <Coins className="w-4 h-4" />
                        Get Free ComicCoins
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                </div>
            )
        }

        return (
            <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                    {recentTransactions.map((tx) => {
                        const isSent = tx.from.toLowerCase() === currentWallet.address.toLowerCase()
                        const isBurned = tx.to.toLowerCase() === '0x0000000000000000000000000000000000000000'
                        const txValue = Math.floor(Number(tx.value)) || 0
                        const txFee = Math.floor(Number(tx.fee)) || 0
                        const isNFT = tx.type === 'token'

                        return (
                            <Link
                                key={tx.id || tx.hash}
                                to={`/transaction/${tx.id}`}
                                className="block hover:bg-gray-50 transition-colors cursor-pointer rounded-lg border border-gray-100"
                            >
                                <div className="p-3 sm:p-4">
                                    {/* Header Section */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    isNFT
                                                        ? isBurned
                                                            ? 'bg-orange-100'
                                                            : 'bg-purple-100'
                                                        : isSent
                                                          ? 'bg-red-100'
                                                          : 'bg-green-100'
                                                }`}
                                            >
                                                {isNFT ? (
                                                    <Image
                                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                                            isBurned ? 'text-orange-600' : 'text-purple-600'
                                                        }`}
                                                    />
                                                ) : (
                                                    <Coins
                                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                                            isSent ? 'text-red-600' : 'text-green-600'
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <span
                                                    className={`font-medium ${
                                                        isNFT
                                                            ? isBurned
                                                                ? 'text-orange-600'
                                                                : isSent
                                                                  ? 'text-red-600'
                                                                  : 'text-green-600'
                                                            : isSent
                                                              ? 'text-red-600'
                                                              : 'text-green-600'
                                                    }`}
                                                >
                                                    {isBurned
                                                        ? `Burned ${isNFT ? 'NFT' : 'Coins'}`
                                                        : `${isSent ? 'Sent' : 'Received'} ${isNFT ? 'NFT' : 'Coins'}`}
                                                </span>
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                                    tx.status === 'confirmed'
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-yellow-50 text-yellow-700'
                                                }`}
                                            >
                                                {tx.status}
                                            </span>
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                            {new Date(tx.timestamp).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        {isSent ? (
                                            // Sent Transaction Display
                                            <div className="space-y-1">
                                                {isNFT ? (
                                                    <>
                                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                                            <span className="text-gray-600">Non-Fungible Token:</span>
                                                            <span className="font-bold text-purple-600">
                                                                Token ID: {tx.tokenId || 'Unknown'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                                            <span className="text-gray-600">Fee Paid:</span>
                                                            <span className="font-bold text-red-600">{txValue} CC</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex justify-between items-center text-sm sm:text-base">
                                                        <span className="text-gray-600">Sent Amount:</span>
                                                        <span className="font-bold text-red-600">{txValue} CC</span>
                                                    </div>
                                                )}
                                                <div className="text-xs sm:text-sm text-gray-500">
                                                    Transaction fee is included in the amount
                                                </div>
                                            </div>
                                        ) : (
                                            // Received Transaction Display
                                            <div className="space-y-1">
                                                {isNFT ? (
                                                    <>
                                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                                            <span className="text-gray-600">Non-Fungible Token:</span>
                                                            <span className="font-bold text-purple-600">
                                                                Token ID: {tx.tokenId || 'Unknown'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                                            <span className="text-gray-600">Initial Amount:</span>
                                                            <span className="text-gray-900">{txValue} CC</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                                            <span className="text-gray-600">Network Fee:</span>
                                                            <span className="text-red-600">- {txFee} CC</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-sm sm:text-base">
                                                            <span className="font-medium text-gray-600">
                                                                Actually Received:
                                                            </span>
                                                            <span className="font-bold text-grey-900">0 CC</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                                            <span className="text-gray-600">Initial Amount:</span>
                                                            <span className="text-gray-900">{txValue} CC</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm sm:text-base text-red-600">
                                                            <span>Network Fee:</span>
                                                            <span>- {txFee} CC</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-sm sm:text-base">
                                                            <span className="font-medium text-gray-600">
                                                                Actual Received:
                                                            </span>
                                                            <span className="font-bold text-green-600">
                                                                {txValue - txFee} CC
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {transactions.length > 5 && (
                    <Link
                        to="/transactions"
                        className="block text-center py-3 text-purple-600 hover:text-purple-700 font-medium text-sm border-t border-gray-100"
                    >
                        View All Transactions ({transactions.length})
                    </Link>
                )}
            </div>
        )
    }

    if (forceURL !== '' && !serviceLoading) {
        return <Navigate to={forceURL} />
    }

    if (serviceLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading wallet...</span>
            </div>
        )
    }

    // Rest of the component remains the same...
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            <NavigationMenu onSignOut={handleSignOut} />

            <main id="main-content" className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-safe">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-purple-800 mb-2">Dashboard</h1>
                        <p className="text-lg text-gray-600">Manage your ComicCoin wallet</p>
                    </div>

                    {/* Error Messages */}
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {txerror && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-800">{txerror}</p>
                        </div>
                    )}

                    {isSessionExpired && (
                        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <p className="text-sm text-yellow-800">Session expired. Redirecting to login...</p>
                        </div>
                    )}

                    {currentWallet && !isLoading && !serviceLoading && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Wallet Info Card */}
                            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <Wallet className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Wallet Details</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1.5">
                                            Wallet Address
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={walletAddress}
                                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                                            />
                                            <button
                                                onClick={() => navigator.clipboard.writeText(walletAddress)}
                                                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Copy address"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Balance Card */}
                            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <Wallet className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Wallet Balance</h2>
                                    <button
                                        onClick={txrefresh}
                                        className="ml-auto p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Refresh balances"
                                        disabled={txloading}
                                    >
                                        {txloading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Coins className="w-4 h-4 text-blue-600" />
                                            <h3 className="text-sm font-medium text-blue-600">CC Balance</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {statistics?.totalCoinValue || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {statistics?.coinTransactionsCount || 0} transactions
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Image className="w-4 h-4 text-purple-600" />
                                            <h3 className="text-sm font-medium text-purple-600">NFTs Owned</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {statistics?.totalNftCount || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {statistics?.nftTransactionsCount || 0} transactions
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transactions List */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                                        <button
                                            onClick={txrefresh}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                            disabled={txloading}
                                        >
                                            {txloading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>

                                    {txloading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                                            <span className="ml-2 text-gray-600">Loading transactions...</span>
                                        </div>
                                    ) : (
                                        <TransactionList transactions={transactions} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {(isLoading || serviceLoading) && (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <span className="ml-2 text-gray-600">Loading wallet data...</span>
                        </div>
                    )}
                </div>
            </main>
            <FooterMenu />
        </div>
    )
}

export default DashboardPage
