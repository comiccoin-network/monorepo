// monorepo/web/comiccoin-webwallet/src/Components/User/Trade/View.jsx
import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2, ArrowLeftRight, AlertCircle, Rocket } from 'lucide-react'
import { useWallet } from '../../../Hooks/useWallet'
import NavigationMenu from '../NavigationMenu/View'
import FooterMenu from '../FooterMenu/View'

const TradePage = () => {
    const { currentWallet, loading: serviceLoading } = useWallet()

    useEffect(() => {
        let mounted = true

        if (mounted) {
            window.scrollTo(0, 0)
        }

        return () => {
            mounted = false
        }
    }, [])

    if (serviceLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading wallet...</span>
            </div>
        )
    }

    if (!currentWallet) {
        return <Navigate to="/logout" />
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <NavigationMenu />

            <main className="flex-grow w-full max-w-3xl mx-auto px-4 pt-6 pb-24 md:py-12 md:mb-0">
                {/* Page Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-purple-800 mb-2 md:mb-4">Trade</h1>
                    <p className="text-lg md:text-xl text-gray-600">Exchange ComicCoins and NFTs</p>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <ArrowLeftRight className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">Trading Platform</h2>
                        </div>
                    </div>

                    <div className="p-6 md:p-12 flex flex-col items-center text-center">
                        <div className="bg-purple-100 p-4 rounded-full mb-4 md:mb-6">
                            <Rocket className="w-10 h-10 md:w-12 md:h-12 text-purple-600" />
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                            Trading Coming Soon!
                        </h3>

                        <p className="text-base md:text-lg text-gray-600 max-w-md mb-6 md:mb-8">
                            We're working hard to bring you a seamless trading experience. Soon you'll be able to trade
                            ComicCoins and NFTs right from your wallet.
                        </p>

                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 max-w-md w-full">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm md:text-base text-purple-800 text-left">
                                    <p className="font-semibold mb-1">Want to get notified?</p>
                                    <p>
                                        Join our mailing list to be the first to know when trading goes live. Stay tuned
                                        for updates!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Preview */}
                    <div className="px-4 md:px-6 pb-4 md:pb-6">
                        <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                                Upcoming Features
                            </h4>
                            <ul className="space-y-3 text-sm md:text-base text-gray-600">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                                    <span>Direct coin-to-coin trading</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                                    <span>NFT marketplace integration</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                                    <span>Advanced trading tools and charts</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                                    <span>Real-time coin and NFT listing</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <FooterMenu />
        </div>
    )
}

export default TradePage
