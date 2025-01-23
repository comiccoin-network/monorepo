// monorepo/web/comiccoin-webwallet/src/Components/Gateway/DownloadNativeWallet/View.jsx
import React, { useEffect } from 'react'
import {
    Wallet,
    Monitor,
    Globe,
    ArrowRight,
    Shield,
    Github,
    CheckCircle,
    Apple,
    Terminal,
    Download,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import NavigationMenu from '../NavigationMenu/View'
import FooterMenu from '../FooterMenu/View'

const DownloadNativeWalletPage = () => {
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
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            <NavigationMenu />

            <main id="main-content" className="flex-grow">
                {/* Hero Section */}
                <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-8 sm:py-12 md:py-16 mb-6 sm:mb-8 md:mb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1
                                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
                                style={{ fontFamily: 'Comic Sans MS' }}
                            >
                                Download ComicCoin Wallet
                            </h1>
                            <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-6 sm:mb-8">
                                Get the official ComicCoin Wallet for your platform
                            </p>
                            <div className="inline-flex items-center bg-indigo-700 text-xs sm:text-sm px-3 py-1 rounded-full">
                                <span className="mr-2">Latest Version:</span>
                                <span className="font-mono font-bold">
                                    v{process.env.REACT_APP_NATIVE_BINARY_VERSION}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Download Cards */}
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto mb-6 sm:mb-8 md:mb-12">
                        {/* Microsoft Download Card */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl overflow-hidden border-2 border-purple-100">
                            <div className="p-4 sm:p-6 md:p-8">
                                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                                        <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Windows App</h2>
                                        <p className="text-sm sm:text-base text-purple-600">
                                            Available on Microsoft Store
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-3 sm:mb-4">Features:</h3>
                                        <ul className="space-y-2 sm:space-y-3">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                                                <span className="text-sm sm:text-base text-gray-600">
                                                    Full blockchain node support
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                                                <span className="text-sm sm:text-base text-gray-600">
                                                    Automatic updates via Microsoft Store
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="flex items-start gap-2 sm:gap-3 bg-blue-50 p-3 sm:p-4 rounded-xl">
                                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 shrink-0" />
                                        <p className="text-xs sm:text-sm text-blue-700">
                                            Download only from the Microsoft Store to ensure you&apos;re getting the
                                            genuine, verified app.
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href={process.env.REACT_APP_NATIVE_BINARY_WINDOWS_DOWNLOAD_LINK}
                                    className="w-full bg-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base"
                                >
                                    <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Download from Microsoft Store
                                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                </a>

                                <p className="text-center text-xs sm:text-sm text-gray-500">
                                    Requires Windows 10 version 17763.0 or higher
                                </p>
                            </div>
                        </div>

                        {/* MacOS Download Card */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl overflow-hidden border-2 border-purple-100">
                            <div className="p-4 sm:p-6 md:p-8">
                                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                                        <Apple className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">MacOS App</h2>
                                        <p className="text-sm sm:text-base text-purple-600">
                                            Universal Binary (Intel/Apple Silicon)
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-3 sm:mb-4">Features:</h3>
                                        <ul className="space-y-2 sm:space-y-3">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                                                <span className="text-sm sm:text-base text-gray-600">
                                                    Native Apple Silicon support
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                                                <span className="text-sm sm:text-base text-gray-600">
                                                    Optimized for macOS performance
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="flex items-start gap-2 sm:gap-3 bg-blue-50 p-3 sm:p-4 rounded-xl">
                                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 shrink-0" />
                                        <p className="text-xs sm:text-sm text-blue-700">
                                            App is notarized by Apple for enhanced security and seamless installation.
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href={process.env.REACT_APP_NATIVE_BINARY_MACOS_DOWNLOAD_LINK}
                                    className="w-full bg-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base"
                                >
                                    <Apple className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Download for MacOS
                                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                </a>

                                <p className="text-center text-xs sm:text-sm text-gray-500">
                                    Requires macOS 15.2 (Sequoia) or higher
                                </p>
                            </div>
                        </div>

                        {/* Linux Download Card - Full Width */}
                        <div className="md:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl overflow-hidden border-2 border-purple-100">
                            <div className="p-4 sm:p-6 md:p-8">
                                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                                        <Terminal className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                            Linux Installation
                                        </h2>
                                        <p className="text-sm sm:text-base text-purple-600">
                                            Available for Ubuntu/Debian and Fedora/RHEL systems
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Ubuntu/Debian Instructions */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Ubuntu/Debian Installation:</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <pre className="text-sm overflow-x-auto">
                                                <code className="text-gray-700">
                                                    {`wget ${process.env.REACT_APP_NATIVE_BINARY_LINUX_DEB_DOWNLOAD_LINK}\nsudo apt install ./comiccoin-wallet_${process.env.REACT_APP_NATIVE_BINARY_VERSION}_amd64.deb`}
                                                </code>
                                            </pre>
                                        </div>
                                        <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
                                            <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                            <p className="text-xs text-blue-700">
                                                Supported on Ubuntu 20.04+ and Debian 11+
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fedora/RHEL Instructions */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Fedora/RHEL Installation:</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <pre className="text-sm overflow-x-auto">
                                                <code className="text-gray-700">
                                                    {`wget ${process.env.REACT_APP_NATIVE_BINARY_LINUX_RPM_DOWNLOAD_LINK}\nsudo dnf install ./comiccoin-wallet-${process.env.REACT_APP_NATIVE_BINARY_VERSION}-1.x86_64.rpm`}
                                                </code>
                                            </pre>
                                        </div>
                                        <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
                                            <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                            <p className="text-xs text-blue-700">Supported on Fedora 37+ and RHEL 9+</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shared Features Section */}
                    <div className="max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-12 px-4 sm:px-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Common Features</h3>
                        <div className="bg-white rounded-xl border-2 border-purple-100 p-4 sm:p-6">
                            <ul className="space-y-2 sm:space-y-3">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-sm sm:text-base text-gray-600">
                                        Full blockchain node support
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-sm sm:text-base text-gray-600">
                                        Enhanced security features
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-sm sm:text-base text-gray-600">
                                        Offline transaction signing
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-sm sm:text-base text-gray-600">
                                        4 GB RAM minimum (8 GB recommended)
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-sm sm:text-base text-gray-600">
                                        1 GB available hard disk space
                                    </span>
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

export default DownloadNativeWalletPage
