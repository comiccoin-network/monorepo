// src/Components/Gateway/GettingStarted/View.jsx
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
  Coins,
  Monitor
} from 'lucide-react';
import { Link } from "react-router-dom";
import FooterMenu from "../FooterMenu/View";

const GetStartedPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50">
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
            href="/download-native-wallet"
            className="text-purple-200 hover:text-white flex items-center gap-1 text-sm"
          >
            <Monitor className="h-4 w-4" />
            Looking for our Native Wallet? Get it here →
          </a>
        </div>
      </div>

      {/* Navigation Header */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8" />
              <span className="text-2xl font-bold" style={{fontFamily: 'Comic Sans MS'}}>
                ComicCoin Web Wallet
              </span>
            </div>
            <div className="flex space-x-4">
              <a href="/help" className="text-white hover:text-purple-200 px-3 py-2">Help</a>
              <a href="/" className="text-white hover:text-purple-200 px-3 py-2">Home</a>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-purple-800 mb-6" style={{fontFamily: 'Comic Sans MS'}}>
            Welcome to ComicCoin
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose an option below to get started with your wallet
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-8 p-6 bg-purple-50 border border-purple-200 rounded-xl shadow-sm">
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
                  <Shield className="h-5 w-5 mt-0.5 shrink-0" />
                  <span>Never share your recovery phrase or password with anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 mt-0.5 shrink-0" />
                  <span>Always keep your recovery phrase in a safe place - you'll need it to restore your wallet</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Left Column - New/Access */}
          <div className="space-y-6">
            {/* Create New Wallet */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Plus className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Create New Wallet</h2>
              </div>
              <p className="text-gray-600 mb-6">Start fresh with a new wallet, perfect for first-time users.</p>
              <Link
                to="/create-wallet"
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Create New Wallet
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Access Existing */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Access Browser Wallet</h2>
              </div>
              <p className="text-gray-600 mb-6">Quick access to your wallet stored in this browser.</p>
              <Link
                to="/login"
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Access Browser Wallet
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right Column - Recovery */}
          <div className="lg:pl-6">
            <div className="bg-white rounded-xl p-8 border-2 border-purple-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recover Existing Wallet</h2>
                  <p className="text-sm text-gray-500 mt-1">Have a wallet on another browser?</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">When to use recovery:</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-purple-600">•</span>
                      <span>You're using a new browser or device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-purple-600">•</span>
                      <span>You've cleared your browser data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-purple-600">•</span>
                      <span>You want to restore from a backup</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">What you'll need:</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <Key className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                      <span>Your 12-word recovery phrase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                      <span>A secure environment to enter it</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                to="/recover"
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Recover Wallet
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterMenu />
    </div>
  );
};

export default GetStartedPage;
