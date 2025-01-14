import React from 'react';
import {
  Wallet,
  Key,
  ArrowRight,
  AlertCircle,
  Plus,
  RefreshCw,
  Globe,
  Shield,
  Github,
  Coins
} from 'lucide-react';
import { Link } from "react-router-dom";

const GetStartedPage = () => {
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
            <span>You're using the <strong>Web Wallet</strong> - Access your ComicCoin from any browser</span>
          </div>
          <a
            href="https://comiccoin.ca/native-wallet"
            className="text-purple-200 hover:text-white flex items-center gap-1 text-sm"
          >
            Looking for our Native Wallet? Get it here →
          </a>
        </div>
      </div>

      {/* Header Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8" />
              <span className="text-2xl font-bold" style={{fontFamily: 'Comic Sans MS, cursive'}}>
                ComicCoin Web Wallet
              </span>
            </div>
            <div className="flex space-x-4">
              <a href="/help" className="text-white hover:text-purple-200 px-3 py-2">
                Help
              </a>
              <a href="https://comiccoin.ca" className="text-white hover:text-purple-200 px-3 py-2">
                About
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-purple-800 mb-6" style={{fontFamily: 'Comic Sans MS, cursive'}}>
            Begin Your ComicCoin Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to start your secure wallet experience
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-12 p-6 bg-purple-50 border border-purple-200 rounded-xl shadow-sm" role="alert">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg shrink-0">
              <AlertCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-purple-800 text-lg mb-2">
                Important Security Information
              </h2>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  Your recovery phrase is the only way to restore your wallet
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  Write it down and store it in a safe place
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  Never share it with anyone - ComicCoin team will never ask for it
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Create New Wallet */}
          <div className="bg-white rounded-xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-purple-100 rounded-xl">
                <Plus className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Wallet</h2>
            </div>

            <div className="space-y-6 mb-8">
              <h3 className="font-semibold text-gray-900">What you'll get:</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <span>New unique wallet address that belongs only to you</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <span>Secure 12-word recovery phrase for wallet backup</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <span>Guided setup process with security verification</span>
                </li>
              </ul>
            </div>

            <Link
              to="/create-first-wallet"
              className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              aria-label="Create a new wallet"
            >
              Create New Wallet
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Access Existing Wallet */}
          <div className="bg-white rounded-xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-purple-100 rounded-xl">
                <Key className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Access Existing Wallet</h2>
            </div>

            <div className="space-y-6 mb-8">
              <h3 className="font-semibold text-gray-900">What you'll need:</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">•</div>
                  <span>Your 12-word recovery phrase from wallet creation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">•</div>
                  <span>Private, secure environment to enter your phrase</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">•</div>
                  <span>About 2-3 minutes to complete the process</span>
                </li>
              </ul>
            </div>

            <Link
              to="/login"
              className="w-full px-6 py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              aria-label="Access your existing wallet"
            >
              Access Existing Wallet
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Additional Security Tips */}
        <div className="bg-white rounded-xl p-6 border border-purple-200 mb-12">
          <h2 className="font-semibold text-gray-900 mb-4">Security Tips:</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Recovery is Critical</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your recovery phrase is the only way to restore access. No one can help if you lose it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Stay Secure</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Never enter your recovery phrase on any website claiming to be ComicCoin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="hover:text-purple-200">Help Center</a>
                </li>
                <li>
                  <a href="/security" className="hover:text-purple-200">Security Guide</a>
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
            <p>© 2025 ComicCoin Web Wallet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GetStartedPage;
