// src/Components/Gateway/Index.jsx
import React from 'react';
import { Link } from "react-router-dom";
import { Shield, Wallet, Key, RefreshCw, Github, ArrowRight, Monitor, Globe, CheckCircle } from 'lucide-react';

const IndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50">
        Skip to main content
      </a>

      {/* Platform Selection Banner */}
      <div className="bg-purple-900 text-white py-3 px-4" role="banner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Globe aria-hidden="true" className="h-5 w-5" />
            <span>You're using the <strong>Web Wallet</strong> - Access your ComicCoin from any browser</span>
          </div>
          <a
            href="/download-native-wallet"
            className="text-purple-200 hover:text-white flex items-center gap-1 text-sm"
            aria-label="Download Native Wallet"
          >
            <Monitor aria-hidden="true" className="h-4 w-4" />
            Looking for our Native Wallet? Get it here
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8" />
              <span className="text-2xl font-bold" style={{fontFamily: 'Comic Sans MS, cursive'}}>
                ComicCoin Web Wallet
              </span>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/create-first-wallet"
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold border-2 border-white transition-colors"
              >
                Create Wallet
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-white hover:bg-purple-50 text-purple-700 font-bold transition-colors"
              >
                Access Wallet
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 md:mb-6 text-purple-800" style={{fontFamily: 'Comic Sans MS, cursive'}}>
            Your ComicCoin Wallet<br />Anywhere You Need It
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Choose between our secure web wallet for instant access or download our Windows app
            for enhanced features and security.
          </p>
        </div>

        {/* Wallet Options */}
        <div className="mb-12 md:mb-16 bg-white rounded-xl p-6 md:p-8 shadow-lg border-2 border-purple-200">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Web Wallet Card */}
            <div className="border-2 border-purple-500 rounded-xl p-6 bg-purple-50">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Globe className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-800">Web Wallet</h3>
                    <p className="text-purple-600">Browser-based solution</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Instant access from any browser</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>No installation required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Perfect for quick transactions</span>
                  </li>
                </ul>
                <Link
                  to="/get-started"
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Launch Web Wallet
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Windows App Card */}
            <div className="border-2 border-purple-500 rounded-xl p-6 bg-purple-50">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Monitor className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-800">Windows App</h3>
                    <p className="text-purple-600">v{process.env.REACT_APP_NATIVE_BINARY_VERSION}</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Enhanced security features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Full blockchain node support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Offline transaction signing</span>
                  </li>
                </ul>
                <a
                  href={process.env.REACT_APP_NATIVE_BINARY_WINDOWS_DOWNLOAD_LINK}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Download from Microsoft Store
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
          {[
            {
              icon: <Shield className="h-8 w-8 text-purple-600" />,
              title: "Bank-Grade Security",
              description: "Client-side encryption ensures your keys never leave your device"
            },
            {
              icon: <Wallet className="h-8 w-8 text-purple-600" />,
              title: "HD Wallet Support",
              description: "Generate multiple accounts from a single recovery phrase"
            },
            {
              icon: <Key className="h-8 w-8 text-purple-600" />,
              title: "Full Control",
              description: "You hold your private keys and recovery phrase at all times"
            },
            {
              icon: <RefreshCw className="h-8 w-8 text-purple-600" />,
              title: "Easy Recovery",
              description: "Restore your wallet anytime using your recovery phrase"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200 p-6"
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

        {/* About Section */}
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
                  <Link to="/create-first-wallet" className="hover:text-purple-200">Create Wallet</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-purple-200">Access Wallet</Link>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="hover:text-purple-200">Terms of Service</a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-purple-200">Privacy Policy</a>
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
