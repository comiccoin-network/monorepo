// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/page.tsx
"use client";

import React from "react";
import {
  Wallet,
  ArrowRight,
  Shield,
  Key,
  RefreshCw,
  Github,
  Globe,
  Coins,
  UserPlus,
  Download,
  Sparkles,
  ExternalLink,
  Code,
  FileText,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

const FaucetPage = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Previous skip link and navigation remain the same */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Coins className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-xl sm:text-2xl font-bold">
                ComicCoin Faucet
              </span>
            </div>
            <Link
              href="/get-started"
              className="bg-white text-purple-700 px-6 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <Coins className="w-5 h-5" />
              Claim Coins
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow">
        {/* Hero Section with updated color contrast */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 md:py-20 mb-6 sm:mb-8 md:mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                ComicCoin Faucet Balance
              </h1>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-white opacity-20 blur transform scale-110 rounded-full"></div>
                <div className="relative">
                  <p className="text-5xl sm:text-6xl md:text-7xl font-bold mb-2 flex items-center justify-center gap-4 text-white">
                    <Sparkles
                      className="h-12 w-12 text-amber-300"
                      aria-hidden="true"
                    />
                    <span className="bg-gradient-to-r from-amber-300 to-yellow-500 text-transparent bg-clip-text">
                      1,000,000 CC
                    </span>
                    <Sparkles
                      className="h-12 w-12 text-amber-300"
                      aria-hidden="true"
                    />
                  </p>
                </div>
              </div>
              <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mt-8 mb-8 sm:mb-10">
                Get started with free ComicCoins instantly! Follow the steps
                below to claim your coins.
              </p>
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-lg shadow-lg hover:shadow-xl"
              >
                Start Claiming Now
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Steps Section with updated text and icons */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-purple-800 text-center mb-12">
            How to Collect Your ComicCoins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 - Updated text and icon */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100 hover:border-purple-300">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-purple-50 rounded-xl mb-6 transform transition-transform duration-300 hover:scale-110">
                  <Wallet className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-purple-800 mb-4">
                  Step 1: Get Wallet
                </h3>
                <p className="text-gray-600 mb-6">
                  Download and install the ComicCoin Wallet to store your coins
                  securely
                </p>
                <Link
                  href="https://comiccoinwallet.com"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Wallet
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Step 2 remains largely the same */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100 hover:border-purple-300">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-purple-50 rounded-xl mb-6 transform transition-transform duration-300 hover:scale-110">
                  <UserPlus className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-purple-800 mb-4">
                  Step 2: Register
                </h3>
                <p className="text-gray-600 mb-6">
                  Create a ComicCoin Network account to access all network
                  services with a single sign-on, including the wallet and
                  faucet
                </p>
                <Link
                  href="/get-started"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-700 transition-colors"
                >
                  Join Network
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Step 3 - Updated description */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100 hover:border-purple-300">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-purple-50 rounded-xl mb-6 transform transition-transform duration-300 hover:scale-110">
                  <Coins className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-purple-800 mb-4">
                  Step 3: Collect Coins
                </h3>
                <p className="text-gray-600 mb-6">
                  Once signed in, you can claim coins every 24 hours. Enter your
                  wallet address, claim your coins, and come back tomorrow for
                  more!
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Sign in to your wallet to start claiming. Each wallet can
                  claim once every 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About and Community sections remain the same */}
        <section className="max-w-6xl mx-auto px-4 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-purple-800">
              About ComicCoin
            </h2>
            <div className="flex items-start space-x-4">
              <Github className="h-8 w-8 mt-1 flex-shrink-0 text-purple-600" />
              <p className="text-gray-700 text-lg leading-relaxed">
                ComicCoin is an open-source blockchain project utilizing a Proof
                of Authority consensus mechanism. This ensures fast, efficient,
                and environmentally friendly transactions while maintaining
                security and transparency. Our code is public, auditable, and
                community-driven.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-purple-900 to-indigo-900 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Join the ComicCoin Community?
              </h2>
              <p className="text-xl mb-8 text-purple-100">
                Join our growing community of creators, collectors, and
                enthusiasts. Get started with your free ComicCoins today!
              </p>
              <Link
                href="https://comiccoinwallet.com"
                className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-colors text-lg shadow-lg hover:shadow-xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join the Community
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section - Updated metrics */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  10,000+
                </p>
                <p className="text-gray-600">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600 mb-2">1M+</p>
                <p className="text-gray-600">Coins Distributed</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  500/day
                </p>
                <p className="text-gray-600">Distribution Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Updated Footer with additional links */}
        <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Project Links */}
              <div className="text-center md:text-left">
                <h3 className="font-bold mb-6 text-lg flex items-center justify-center md:justify-start gap-2">
                  <Code className="h-5 w-5 text-purple-300" />
                  <span>Resources</span>
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link
                      href="https://github.com/comiccoin-network/monorepo"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>GitHub Repository</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://comiccoinnetwork.com"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>Project Website</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://comiccoinwallet.com"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Wallet className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>Official Wallet</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Links */}
              <div className="text-center md:text-left">
                <h3 className="font-bold mb-6 text-lg flex items-center justify-center md:justify-start gap-2">
                  <Shield className="h-5 w-5 text-purple-300" />
                  <span>Legal</span>
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                    >
                      <FileText className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>Terms of Service</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                    >
                      <BookOpen className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                      <span>Privacy Policy</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright Section */}
            <div className="text-center pt-6 border-t border-purple-500/30">
              <p className="flex items-center justify-center gap-2 text-purple-200">
                <span>
                  © {currentYear} ComicCoin Network. All rights reserved.
                </span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default FaucetPage;
