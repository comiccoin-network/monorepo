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
    Smartphone,
    Cloud,
    Server,
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
                            <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto">
                                Choose the wallet type that best suits your needs
                            </p>
                        </div>
                    </div>
                </div>

                {/* Wallet Type Explanation */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-xl">
                                    <Cloud className="h-6 w-6 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-bold">Light Node Wallet</h2>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Perfect for mobile devices and casual users. Light nodes:
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span className="text-sm text-gray-600">
                                        Don't require downloading the blockchain
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span className="text-sm text-gray-600">Use minimal storage space</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span className="text-sm text-gray-600">Start working instantly</span>
                                </li>
                            </ul>
                            <div className="mt-4 text-sm text-purple-600 font-medium">Current Version: v1.0.5</div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-xl">
                                    <Server className="h-6 w-6 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-bold">Full Node Wallet</h2>
                            </div>
                            <p className="text-gray-600 mb-3">Ideal for advanced users and developers. Full nodes:</p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span className="text-sm text-gray-600">
                                        Download and verify the complete blockchain
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span className="text-sm text-gray-600">Provide maximum security and privacy</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                    <span className="text-sm text-gray-600">Help maintain the network</span>
                                </li>
                            </ul>
                            <div className="mt-4 text-sm text-purple-600 font-medium">Current Version: v1.0.1</div>
                        </div>
                    </div>
                </div>

                {/* Light Node Downloads Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Light Node Wallets</h2>
                        <p className="text-gray-600 mt-2">Quick and easy mobile wallets for everyday use</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Android Download Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-purple-100">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <Smartphone className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Android App</h2>
                                        <p className="text-sm text-purple-600">Light Node v1.0.5</p>
                                    </div>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">Optimized for mobile use</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">Biometric authentication</span>
                                    </li>
                                </ul>

                                <a
                                    href={process.env.REACT_APP_NATIVE_BINARY_GOOGLE_ANDROID_DOWNLOAD_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-3"
                                >
                                    <Smartphone className="h-4 w-4" />
                                    Download from Play Store
                                    <ArrowRight className="h-4 w-4" />
                                </a>

                                <p className="text-center text-xs text-gray-500">Requires Android 8.0 or higher</p>
                            </div>
                        </div>

                        {/* iOS Download Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-purple-100">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <Apple className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">iOS App</h2>
                                        <p className="text-sm text-purple-600">Light Node v1.0.5</p>
                                    </div>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">Native iOS design</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">Face ID/Touch ID support</span>
                                    </li>
                                </ul>

                                <a
                                    href={process.env.REACT_APP_NATIVE_BINARY_APPLE_IOS_DOWNLOAD_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-3"
                                >
                                    <Apple className="h-4 w-4" />
                                    Download from App Store
                                </a>

                                <p className="text-center text-xs text-gray-500">Will require iOS 18.0 or higher</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Node Downloads Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    {/* Section header with clear description of full node capabilities */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Full Node Wallets</h2>
                        <p className="text-gray-600 mt-2">
                            Advanced desktop wallets with complete blockchain verification
                        </p>
                    </div>

                    {/* Grid layout for desktop downloads, allowing two cards side-by-side on wider screens */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Windows Download Card */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-purple-100">
                            <div className="p-6">
                                {/* Card header with Windows icon and version info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <Monitor className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Windows</h2>
                                        <p className="text-sm text-purple-600">Full Node v1.0.1</p>
                                    </div>
                                </div>

                                {/* Windows-specific features list */}
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">Complete blockchain verification</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">
                                            Automatic updates via Microsoft Store
                                        </span>
                                    </li>
                                </ul>

                                {/* Download button with Microsoft Store link */}
                                <a
                                    href={process.env.REACT_APP_NATIVE_BINARY_WINDOWS_DOWNLOAD_LINK}
                                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-3"
                                >
                                    <Monitor className="h-4 w-4" />
                                    Download from Microsoft Store
                                    <ArrowRight className="h-4 w-4" />
                                </a>

                                {/* System requirements note */}
                                <p className="text-center text-xs text-gray-500">
                                    Requires Windows 10 version 17763.0 or higher
                                </p>
                            </div>
                        </div>

                        {/* MacOS Download Card - Structure mirrors Windows card for consistency */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-purple-100">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <Apple className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">MacOS</h2>
                                        <p className="text-sm text-purple-600">Full Node v1.0.1</p>
                                    </div>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">
                                            Universal Binary (Intel/Apple Silicon)
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">
                                            Complete blockchain verification capabilities
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">Native Apple M1/M2 optimization</span>
                                    </li>
                                </ul>

                                {/* Security notice specifically for MacOS */}
                                <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-xl mb-6">
                                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-blue-700">
                                        Notarized by Apple for enhanced security and seamless installation
                                    </p>
                                </div>

                                {/* MacOS download button */}
                                <a
                                    href={process.env.REACT_APP_NATIVE_BINARY_MACOS_DOWNLOAD_LINK}
                                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-3"
                                >
                                    <Apple className="h-4 w-4" />
                                    Download for MacOS
                                    <ArrowRight className="h-4 w-4" />
                                </a>

                                <p className="text-center text-xs text-gray-500">
                                    Requires macOS 15.2 (Sequoia) or higher
                                </p>
                            </div>
                        </div>

                        {/* Linux Download Card - Spans full width for better command display */}
                        <div className="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border-2 border-purple-100">
                            <div className="p-6">
                                {/* Linux header maintains consistent styling with other cards */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-xl">
                                        <Terminal className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Linux Installation</h2>
                                        <p className="text-sm text-purple-600">Full Node v1.0.1</p>
                                    </div>
                                </div>

                                {/* Linux-specific features */}
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">
                                            Complete blockchain verification and network participation
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span className="text-sm text-gray-600">
                                            Automated dependency management through package managers
                                        </span>
                                    </li>
                                </ul>

                                {/* Two-column layout for different Linux distributions */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Ubuntu/Debian Installation Instructions */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Ubuntu/Debian Installation:</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <pre className="text-sm overflow-x-auto">
                                                <code className="text-gray-700">
                                                    {`wget ${process.env.REACT_APP_NATIVE_BINARY_LINUX_DEB_DOWNLOAD_LINK}\nsudo apt install ./comiccoin-wallet_1.0.1_amd64.deb`}
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

                                    {/* Fedora/RHEL Installation Instructions */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Fedora/RHEL Installation:</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <pre className="text-sm overflow-x-auto">
                                                <code className="text-gray-700">
                                                    {`wget ${process.env.REACT_APP_NATIVE_BINARY_LINUX_RPM_DOWNLOAD_LINK}\nsudo dnf install ./comiccoin-wallet-1.0.1-1.x86_64.rpm`}
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
                </div>
            </main>

            <FooterMenu />
        </div>
    )
}
export default DownloadNativeWalletPage
