// monorepo/web/comiccoin-webwallet/src/Components/User/Index/View.jsx
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Shield,
    Wallet,
    Key,
    RefreshCw,
    Github,
    ArrowRight,
    Monitor,
    Globe,
    CheckCircle,
    Apple,
    HardDrive,
    Image,
    Coins,
    ArrowUpRight,
    Server,
    Smartphone,
} from 'lucide-react'
import NavigationMenu from '../NavigationMenu/View'
import FooterMenu from '../FooterMenu/View'

const IndexPage = () => {
    useEffect(() => {
        let mounted = true

        if (mounted) {
            window.scrollTo(0, 0)
        }

        return () => {
            mounted = false
        }
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            {/* Skip to main content link */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            {/* Navigation */}
            <NavigationMenu />

            <main id="main-content" className="flex-grow">
                {/* Hero Section */}
                {/* Hero Section */}
                <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 md:py-20 mb-6 sm:mb-8 md:mb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1
                                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
                                style={{ fontFamily: 'Comic Sans MS' }}
                            >
                                Start Your Blockchain Journey
                            </h1>
                            <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-8 sm:mb-10">
                                Experience the future of digital collectibles with our secure and easy-to-use web
                                wallet. No downloads required - get started in minutes.
                            </p>
                            <div className="flex justify-center">
                                <Link
                                    to="/get-started"
                                    className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-lg"
                                >
                                    <Wallet className="w-5 h-5" />
                                    Get Started Now
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download Native Apps Section */}
                <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-4">Want More Features?</h2>
                        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                            Download our native apps for enhanced security and additional features
                        </p>
                    </div>

                    {/* Download Options Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Windows */}
                        <a
                            href={process.env.REACT_APP_NATIVE_BINARY_WINDOWS_DOWNLOAD_LINK}
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-100 group"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="p-3 bg-purple-50 rounded-xl mb-4 group-hover:bg-purple-100 transition-colors">
                                    <Monitor className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-purple-800 mb-2">Windows App</h3>
                                <p className="text-gray-600 mb-4">Available on Microsoft Store</p>
                                <span className="text-purple-600 font-semibold flex items-center gap-1">
                                    Download Now
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </a>

                        {/* MacOS */}
                        <a
                            href={process.env.REACT_APP_NATIVE_BINARY_MACOS_DOWNLOAD_LINK}
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-100 group"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="p-3 bg-purple-50 rounded-xl mb-4 group-hover:bg-purple-100 transition-colors">
                                    <Apple className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-purple-800 mb-2">MacOS App</h3>
                                <p className="text-gray-600 mb-4">Native Apple Silicon support</p>
                                <span className="text-purple-600 font-semibold flex items-center gap-1">
                                    Download Now
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </a>

                        {/* Android */}
                        <a
                            href="https://play.google.com/store/apps/details?id=com.theshootingstarpress.comiccoinwallet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-100 group"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="p-3 bg-purple-50 rounded-xl mb-4 group-hover:bg-purple-100 transition-colors">
                                    <Smartphone className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-purple-800 mb-2">Android App</h3>
                                <p className="text-gray-600 mb-4">Available on Play Store</p>
                                <span className="text-purple-600 font-semibold flex items-center gap-1">
                                    Download Now
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </a>
                    </div>

                    {/* View All Downloads Link */}
                    <div className="text-center mt-8">
                        <Link
                            to="/download-native-wallet"
                            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold"
                        >
                            View all download options
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <h2 className="text-3xl font-bold text-purple-800 text-center mb-8">Key Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                icon: <Shield className="h-8 w-8 text-purple-600" />,
                                title: 'Bank-Grade Security',
                                description: 'Client-side encryption ensures your keys never leave your device',
                            },
                            {
                                icon: <Monitor className="h-8 w-8 text-purple-600" />,
                                title: 'Cross-Platform Support',
                                description: 'Access via web browser or native desktop application',
                            },
                            {
                                icon: <HardDrive className="h-8 w-8 text-purple-600" />,
                                title: 'IPFS Integration',
                                description: 'Decentralized storage for NFTs using IPFS technology',
                            },
                            {
                                icon: <Wallet className="h-8 w-8 text-purple-600" />,
                                title: 'HD Wallet Support',
                                description: 'Generate multiple accounts from a single recovery phrase',
                            },
                            {
                                icon: <Key className="h-8 w-8 text-purple-600" />,
                                title: 'Full Control',
                                description: 'You hold your private keys and recovery phrase at all times',
                            },
                            {
                                icon: <RefreshCw className="h-8 w-8 text-purple-600" />,
                                title: 'Easy Recovery',
                                description: 'Restore your wallet anytime using your recovery phrase',
                            },
                            {
                                icon: <Image className="h-8 w-8 text-purple-600" />,
                                title: 'NFT Support',
                                description: 'View, transfer and burn non-fungible tokens you own',
                            },
                            {
                                icon: <Github className="h-8 w-8 text-purple-600" />,
                                title: 'Open Source',
                                description:
                                    'Licensed under GNU AGPL v3.0, fostering transparency and community collaboration',
                            },
                            {
                                icon: <Coins className="h-8 w-8 text-purple-600" />,
                                title: 'Free ComicCoins',
                                description: (
                                    <>
                                        Get started with free ComicCoins from our{' '}
                                        <a
                                            href="https://comiccoinfaucet.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                                        >
                                            official faucet
                                            <ArrowUpRight className="w-3 h-3" />
                                        </a>
                                    </>
                                ),
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-100 p-6"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="p-3 bg-purple-50 rounded-xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-bold text-purple-800 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* About Section */}
                <section className="max-w-6xl mx-auto px-4 mb-12">
                    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
                        <h2 className="text-3xl font-bold mb-6 text-purple-800">About ComicCoin</h2>
                        <div className="flex items-start space-x-4">
                            <Github className="h-6 w-6 mt-1 flex-shrink-0 text-purple-600" />
                            <p className="text-gray-700">
                                ComicCoin is an open-source blockchain project utilizing a Proof of Authority consensus
                                mechanism. This ensures fast, efficient, and environmentally friendly transactions while
                                maintaining security and transparency. Our code is public, auditable, and
                                community-driven.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <FooterMenu />
        </div>
    )
}

export default IndexPage
