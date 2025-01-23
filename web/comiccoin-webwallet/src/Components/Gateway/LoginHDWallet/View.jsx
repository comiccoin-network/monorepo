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

function LoginHDWalletPage() {
    const { wallets, loadWallet, loading: serviceLoading, error: serviceError } = useWallet()

    const [selectedWalletId, setSelectedWalletId] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [redirectTo, setRedirectTo] = useState('')

    useEffect(() => {
        if (wallets.length > 0 && !selectedWalletId) {
            setSelectedWalletId(wallets[0].id)
        }

        let mounted = true

        if (mounted) {
            window.scrollTo(0, 0)
        }

        return () => {
            mounted = false
        }
    }, [wallets])

    const handleLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            if (!selectedWalletId) {
                throw new Error('Please select a wallet')
            }
            if (!password) {
                throw new Error('Please enter your password')
            }

            await loadWallet(selectedWalletId, password)
            setRedirectTo('/dashboard')
        } catch (err) {
            setError(err.message)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (redirectTo) {
        return <Navigate to={redirectTo} />
    }

    // Empty state component for no wallets
    const EmptyWalletState = () => (
        <div className="px-4 sm:px-6 pb-6">
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-purple-600" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wallet Found</h3>

                <p className="text-gray-600 text-sm mb-6">
                    To start using ComicCoin, you'll need to create a new wallet or recover an existing one.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/create-wallet"
                        className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Wallet</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>

                    <Link
                        to="/recover"
                        className="flex items-center justify-center gap-2 w-full bg-white text-gray-700 px-4 py-3 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Recover Existing Wallet</span>
                    </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start gap-2 text-left">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-600">
                            New to ComicCoin? Creating a wallet is quick and secure. Make sure to safely store your
                            recovery phrase when creating a new wallet.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            <NavigationMenu />

            <main id="main-content" className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 max-w-xl">
                {/* Title Section */}
                <div className="text-center mb-6 sm:mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-purple-800 mb-2 sm:mb-4">Access Your Wallet</h1>
                    <p className="text-lg sm:text-xl text-gray-600">Login to your existing wallet</p>
                </div>

                {/* Error Message */}
                {(error || serviceError) && (
                    <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-r-lg">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error || serviceError}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100">
                    {/* Header Section */}
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-xl">
                                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" aria-hidden="true" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Login to Wallet</h2>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Select your wallet and enter your password to continue.
                        </p>
                    </div>

                    {wallets.length === 0 && !serviceLoading ? (
                        <EmptyWalletState />
                    ) : (
                        <form onSubmit={handleLogin} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Security Notice */}
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 sm:p-4 rounded-r-lg">
                                <div className="flex gap-2 sm:gap-3">
                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs sm:text-sm text-amber-800">
                                        <p className="font-medium mb-1 sm:mb-2">Security Notice:</p>
                                        <ul className="list-disc pl-4 space-y-0.5 sm:space-y-1">
                                            <li>Make sure you're on {process.env.REACT_APP_WWW_DOMAIN}</li>
                                            <li>Never share your password with anyone</li>
                                            <li>ComicCoin team will never ask for your password</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Wallet Selection - Updated with new styles */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Wallet</label>
                                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                                    Choose the wallet you want to access
                                </p>
                                <select
                                    value={selectedWalletId}
                                    onChange={(e) => setSelectedWalletId(e.target.value)}
                                    className={inputStyles.select}
                                    disabled={isLoading || serviceLoading}
                                >
                                    <option value="">Select a wallet</option>
                                    {wallets.map((wallet) => (
                                        <option key={wallet.id} value={wallet.id}>
                                            {`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} - Last accessed: ${formatDate(wallet.lastAccessed)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Password Input - Updated with new styles */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">Enter your wallet password</p>
                                <div className="relative mt-1">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <Key className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`${inputStyles.base} ${inputStyles.withIcon}`}
                                        placeholder="Enter your wallet password"
                                        disabled={isLoading || serviceLoading}
                                        autoComplete="off"
                                        data-lpignore="true"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 sm:gap-4 pt-2 sm:pt-4">
                                <Link
                                    to="/"
                                    className="px-4 sm:px-6 py-2.5 text-sm sm:text-base text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isLoading || serviceLoading}
                                    className="px-4 sm:px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading || serviceLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="inline-block">Accessing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-4 h-4" />
                                            <span className="inline-block">Access Wallet</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <FooterMenu />
        </div>
    )
}

export default LoginHDWalletPage
