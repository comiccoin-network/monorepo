import React from 'react';
import { Link } from "react-router-dom";
import {
  Shield, Wallet, Key, RefreshCw, Github, ArrowRight,
  Monitor, Globe, CheckCircle, Apple, HardDrive, Image
} from 'lucide-react';
import FooterMenu from "../FooterMenu/View";

const IndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50">
        Skip to main content
      </a>

      {/* Platform Selection Banner */}
      <div className="bg-purple-900 text-white py-4 px-4" role="banner">
        <div className="max-w-6xl mx-auto flex flex-col space-y-2 sm:space-y-0 sm:flex-row items-center justify-between text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Globe aria-hidden="true" className="h-5 w-5" />
            <span className="text-sm sm:text-base">You're using the <strong>Web Wallet</strong></span>
          </div>
          <a
            href="/download-native-wallet"
            className="text-purple-200 hover:text-white flex items-center gap-1 text-sm whitespace-nowrap"
          >
            <Monitor className="h-4 w-4" />
            <span>Desktop Wallet</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-xl sm:text-2xl font-bold">
                ComicCoin Web Wallet
              </span>
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <Link
                to="/create-wallet"
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-center"
              >
                Create Wallet
              </Link>
              <Link
                to="/login"
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white hover:bg-purple-50 text-purple-700 font-bold text-center"
              >
                Access Wallet
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
          <div className="text-center mb-8 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 text-purple-800">
              Your ComicCoin Wallet<br />Anywhere You Need It
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
              Choose between our secure web wallet for instant access or download our desktop app
              for enhanced features and security.
            </p>
          </div>

          {/* Wallet Options */}
          <div className="mb-12 sm:mb-16 bg-white rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
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

              {/* Desktop App Card */}
              <div className="border-2 border-purple-500 rounded-xl p-6 bg-purple-50">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Monitor className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-800">Desktop App</h3>
                      <p className="text-purple-600">Available for Windows & MacOS</p>
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
                  <div className="space-y-3">
                    <a
                      href="/download-windows"
                      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Monitor className="w-5 h-5" />
                      Download for Windows
                      <ArrowRight className="w-5 h-5" />
                    </a>
                    <a
                      href="/download-macos"
                      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Apple className="w-5 h-5" />
                      Download for MacOS
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-3xl font-bold text-purple-800 text-center mb-8">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <Shield className="h-8 w-8 text-purple-600" />,
                  title: "Bank-Grade Security",
                  description: "Client-side encryption ensures your keys never leave your device"
                },
                {
                  icon: <Monitor className="h-8 w-8 text-purple-600" />,
                  title: "Cross-Platform Support",
                  description: "Access via web browser or native desktop application"
                },
                {
                  icon: <HardDrive className="h-8 w-8 text-purple-600" />,
                  title: "IPFS Integration",
                  description: "Decentralized storage for NFTs using IPFS technology"
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
                },
                {
                  icon: <Image className="h-8 w-8 text-purple-600" />,
                  title: "NFT Support",
                  description: "View, transfer and burn non-fungible tokens you own"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-100 p-6"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-purple-50 rounded-xl mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-purple-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <section className="bg-white rounded-xl p-6 sm:p-8 shadow-lg mb-12">
            <h2 className="text-3xl font-bold mb-6 text-purple-800">About ComicCoin</h2>
            <div className="flex items-start space-x-4">
              <Github className="h-6 w-6 mt-1 flex-shrink-0 text-purple-600" />
              <p className="text-gray-700">
                ComicCoin is an open-source blockchain project utilizing a Proof of Authority consensus mechanism.
                This ensures fast, efficient, and environmentally friendly transactions while maintaining
                security and transparency. Our code is public, auditable, and community-driven.
              </p>
            </div>
          </section>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default IndexPage;
