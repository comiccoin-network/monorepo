// monorepo/web/comiccoin-webwallet/src/Components/Gateway/Help/View.jsx
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Apple, ArrowLeft, Scale, Mail, Phone, MapPin, Globe, Monitor, Wallet } from 'lucide-react'
import NavigationMenu from '../NavigationMenu/View'
import FooterMenu from '../FooterMenu/View'

function HelpPage() {
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

            <main
                id="main-content"
                className="flex-grow w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12 max-w-4xl"
            >
                <Link
                    to="/"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-3 sm:mb-6 text-sm sm:text-base py-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm sm:shadow-lg border border-purple-100 sm:border-2 p-3 sm:p-6 md:p-8 mb-3 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
                        <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl">
                            <Scale className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600" />
                        </div>
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Help & Support Center</h1>
                    </div>

                    <div className="space-y-4 sm:space-y-8 text-sm sm:text-base text-gray-700">
                        {/* Getting Started Section */}
                        <section className="scroll-mt-16" id="getting-started">
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-2 sm:mb-4">
                                Getting Started
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100">
                                    <h3 className="font-semibold text-purple-900 mb-2">Choose Your Wallet Type</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-1" />
                                            <div>
                                                <p className="font-medium text-purple-900">Web Wallet</p>
                                                <p className="text-purple-700 text-sm sm:text-base">
                                                    Access your wallet through any web browser. Perfect for quick access
                                                    and convenience.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-1" />
                                            <div>
                                                <p className="font-medium text-purple-900">Desktop Wallet</p>
                                                <p className="text-purple-700 text-sm sm:text-base">
                                                    Download our native app for Windows or MacOS for enhanced security
                                                    and features.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Creating a Wallet */}
                        <section className="scroll-mt-16" id="creating-wallet">
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-2 sm:mb-4">
                                Creating a Wallet
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                                    <h3 className="font-semibold mb-2 sm:mb-3">Steps to Create a New Wallet:</h3>
                                    <ol className="list-decimal pl-4 space-y-1.5 sm:space-y-2">
                                        <li>Choose a unique wallet label for easy identification</li>
                                        <li>Generate and securely save your recovery phrase</li>
                                        <li>Create a strong password (minimum 12 characters)</li>
                                        <li>Verify your recovery phrase</li>
                                    </ol>
                                </div>
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 sm:p-4 rounded-r-lg">
                                    <h4 className="font-semibold text-amber-800 mb-2">Important Security Notes:</h4>
                                    <ul className="list-disc pl-4 space-y-1.5 sm:space-y-2 text-amber-700">
                                        <li>Never share your recovery phrase or password</li>
                                        <li>Store your recovery phrase offline in a secure location</li>
                                        <li>Use a unique password not used anywhere else</li>
                                        <li>Keep your recovery phrase in the exact order provided</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* System Requirements */}
                        <section className="scroll-mt-16" id="system-requirements">
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-2 sm:mb-4">
                                System Requirements
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                                        <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                                            <Monitor className="w-4 h-4" />
                                            Windows Requirements
                                        </h3>
                                        <ul className="space-y-1.5 sm:space-y-2">
                                            <li>• Windows 10 version 17763.0 or higher</li>
                                            <li>• 4 GB RAM (8 GB recommended)</li>
                                            <li>• 1 GB available disk space</li>
                                            <li>• Microsoft Store access</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                                        <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                                            <Apple className="w-4 h-4" />
                                            MacOS Requirements
                                        </h3>
                                        <ul className="space-y-1.5 sm:space-y-2">
                                            <li>• macOS 15.2 (Sequoia) or higher</li>
                                            <li>• 4 GB RAM (8 GB recommended)</li>
                                            <li>• 1 GB available disk space</li>
                                            <li>• Intel or Apple Silicon processor</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Features & Functions */}
                        <section className="scroll-mt-16" id="features">
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-2 sm:mb-4">
                                Features & Functions
                            </h2>
                            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">HD Wallet Features</h3>
                                        <ul className="space-y-1.5 sm:space-y-2">
                                            <li>• Full blockchain node support</li>
                                            <li>• Enhanced security features</li>
                                            <li>• Offline transaction signing</li>
                                            <li>• Automatic updates (Desktop version)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Security Features</h3>
                                        <ul className="space-y-1.5 sm:space-y-2">
                                            <li>• Industry-standard encryption</li>
                                            <li>• Recovery phrase backup</li>
                                            <li>• Secure password protection</li>
                                            <li>• Two-factor authentication support</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Troubleshooting */}
                        <section className="scroll-mt-16" id="troubleshooting">
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-2 sm:mb-4">
                                Troubleshooting
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                                    <h3 className="font-semibold mb-2 sm:mb-3">Common Issues:</h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        <div>
                                            <p className="font-medium mb-1">Forgot Password</p>
                                            <p className="text-gray-600 text-sm sm:text-base">
                                                Use your recovery phrase to restore access to your wallet and set a new
                                                password.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-1">Connection Issues</p>
                                            <p className="text-gray-600 text-sm sm:text-base">
                                                Ensure you have a stable internet connection and try refreshing your
                                                browser or restarting the desktop app.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-1">Sync Problems</p>
                                            <p className="text-gray-600 text-sm sm:text-base">
                                                If your wallet isn't syncing, try clearing your cache or updating to the
                                                latest version.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Contact Support */}
                        <section className="scroll-mt-16" id="contact">
                            <h2 className="text-lg sm:text-2xl font-bold text-purple-800 mb-2 sm:mb-4">
                                Contact Support
                            </h2>
                            <div className="bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100">
                                <div className="space-y-3">
                                    <a
                                        href="mailto:info@cpscapsule.com"
                                        className="flex items-center gap-2 sm:gap-3 text-purple-600 hover:text-purple-700 py-1"
                                    >
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                                        info@cpscapsule.com
                                    </a>
                                    <a
                                        href="tel:5199142685"
                                        className="flex items-center gap-2 sm:gap-3 text-purple-600 hover:text-purple-700 py-1"
                                    >
                                        <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                                        (519) 914-2685
                                    </a>
                                    <div className="flex items-start gap-2 sm:gap-3 py-1">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-1" />
                                        <div className="text-sm sm:text-base">
                                            <p>ComicCoin Network – Collectible Protection Services</p>
                                            <p>8-611 Wonderland Road North, P.M.B. 125</p>
                                            <p>London, Ontario N6H1T6</p>
                                            <p>Canada</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <Link
                    to="/"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm sm:text-base py-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </main>

            <FooterMenu />
        </div>
    )
}

export default HelpPage
