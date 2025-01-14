import React from 'react';
import { Link } from "react-router-dom";
import { Shield, Wallet, Key, RefreshCw, Github, ArrowRight, Monitor, Globe, CheckCircle, Smartphone } from 'lucide-react';

const IndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Platform Selection Banner */}
      <div className="bg-purple-900 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Globe className="h-5 w-5" />
            <span>You're viewing the <strong>Web Wallet</strong> - Access your ComicCoin from any browser</span>
          </div>
          <a
            href="/download-native-wallet"
            className="text-purple-200 hover:text-white flex items-center gap-1 text-sm"
          >
            <Monitor className="h-4 w-4" />
            Looking for our Native Wallet? Get it here →
          </a>
        </div>
      </div>

      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8" />
              <span className="text-2xl font-bold" style={{fontFamily: 'Comic Sans MS, cursive'}}>
                ComicCoin Web Wallet
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold border-2 border-white transition-colors"
                aria-label="Create Wallet"
              >
                Create Wallet
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-white hover:bg-purple-50 text-purple-700 font-bold transition-colors"
                aria-label="Access Wallet"
              >
                Access Wallet
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 md:mb-6 text-purple-800" style={{fontFamily: 'Comic Sans MS, cursive'}}>
            Instant Access to<br />Your ComicCoin Wallet
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Get started instantly through your browser - no blockchain download needed.
            Secure, convenient, and accessible from anywhere in the world.
          </p>
        </div>

        {/* Choose Your Wallet Type */}
        <div className="mb-12 md:mb-16 bg-white rounded-xl p-6 md:p-8 shadow-lg border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 md:mb-6 text-center" style={{fontFamily: 'Comic Sans MS, cursive'}}>
            Choose Your Wallet Type
          </h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Web Wallet Card */}
            <div className="border-2 border-purple-500 rounded-xl p-4 md:p-6 bg-purple-50">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-purple-100 rounded-lg shrink-0">
                  <Globe className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-purple-800 mb-2">Web Wallet (Current)</h3>
                  <ul className="space-y-2 text-gray-700 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Access from any device with a browser
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      No blockchain download required
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Start using instantly
                    </li>
                  </ul>
                  <Link to="/get-started" className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                    Get Started with Web Wallet
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
            {/* Native Wallet Card */}
            <div className="border-2 border-gray-200 rounded-xl p-4 md:p-6">
              <div className="flex flex-col">
                <div className="flex items-start gap-3 md:gap-4 mb-6">
                  <div className="flex gap-2">
                    <div className="p-2 md:p-3 bg-gray-100 rounded-lg shrink-0">
                      <Monitor className="h-6 w-6 md:h-8 md:w-8 text-gray-600" />
                    </div>
                    <div className="p-2 md:p-3 bg-gray-100 rounded-lg shrink-0">
                      <Smartphone className="h-6 w-6 md:h-8 md:w-8 text-gray-600" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800">Native Wallet</h3>
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">v1.2.0</span>
                    </div>
                    <ul className="space-y-2 text-gray-700 mt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Available for desktop and mobile
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Full blockchain node included
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Complete offline functionality
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Download Options */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Desktop Downloads */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Desktop</h4>
                      <div className="space-y-2">
                        <a
                          href="https://comiccoin.ca/download/windows"
                          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Windows
                          </span>
                          <span className="text-sm text-gray-300">64-bit</span>
                        </a>
                        <a
                          href="https://comiccoin.ca/download/macos"
                          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            macOS
                          </span>
                          <span className="text-sm text-gray-300">Universal</span>
                        </a>
                        <a
                          href="https://comiccoin.ca/download/linux"
                          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Linux
                          </span>
                          <span className="text-sm text-gray-300">x86_64</span>
                        </a>
                      </div>
                    </div>

                    {/* Mobile Downloads */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Mobile</h4>
                      <div className="space-y-2">
                        <a
                          href="https://apps.apple.com/app/comiccoin-wallet"
                          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            iOS App Store
                          </span>
                          <span className="text-sm text-gray-300">iPhone & iPad</span>
                        </a>
                        <a
                          href="https://play.google.com/store/apps/details?id=ca.comiccoin.wallet"
                          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Google Play
                          </span>
                          <span className="text-sm text-gray-300">Android</span>
                        </a>
                        <a
                          href="https://comiccoin.ca/download/apk"
                          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Direct APK
                          </span>
                          <span className="text-sm text-gray-300">Android</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Source Code Link */}
                  <div className="mt-4 text-center">
                    <a
                      href="https://github.com/comiccoin-network/wallet"
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1"
                    >
                      <Github className="h-4 w-4" />
                      View source code
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
          {[
            {
              icon: <Shield className="h-8 w-8 text-purple-600" aria-hidden="true" />,
              title: "Bank-Grade Security",
              description: "Client-side encryption ensures your keys never leave your device"
            },
            {
              icon: <Wallet className="h-8 w-8 text-purple-600" aria-hidden="true" />,
              title: "HD Wallet Support",
              description: "Generate multiple accounts from a single recovery phrase"
            },
            {
              icon: <Key className="h-8 w-8 text-purple-600" aria-hidden="true" />,
              title: "Full Control",
              description: "You hold your private keys and recovery phrase at all times"
            },
            {
              icon: <RefreshCw className="h-8 w-8 text-purple-600" aria-hidden="true" />,
              title: "Easy Recovery",
              description: "Restore your wallet anytime using your recovery phrase"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200 p-4 md:p-6"
              role="article"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {feature.icon}
                </div>
                <h2 className="mt-4 text-xl font-bold text-purple-800" style={{fontFamily: 'Comic Sans MS, cursive'}}>
                  {feature.title}
                </h2>
                <p className="mt-2 text-gray-700">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section className="bg-white rounded-xl p-8 shadow-lg mb-16 border-2 border-purple-200">
          <h2 className="text-3xl font-bold mb-6 text-purple-800" style={{fontFamily: 'Comic Sans MS, cursive'}}>
            About ComicCoin
          </h2>
          <div className="flex items-start space-x-4">
            <Github className="h-6 w-6 mt-1 flex-shrink-0 text-purple-600" />
            <p className="text-gray-700">
              ComicCoin is an open-source blockchain project utilizing a Proof of Authority consensus mechanism.
              This ensures fast, efficient, and environmentally friendly transactions while maintaining
              security and transparency. Our code is public, auditable, and community-driven.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-left">
              <h3 className="font-bold mb-4">Project Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com/comiccoin-network/monorepo" className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-2">
                    <Github className="h-4 w-4" />
                    <span>GitHub Repository</span>
                  </a>
                </li>
                <li>
                  <a href="https://comiccoin.ca" className="hover:text-purple-200">
                    Project Website
                  </a>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-bold mb-4">Account</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-purple-200">Create Wallet</a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-200">Access Wallet</a>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-purple-200">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-200">Privacy Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-purple-500">
            <p>© 2025 ComicCoin Wallet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;
