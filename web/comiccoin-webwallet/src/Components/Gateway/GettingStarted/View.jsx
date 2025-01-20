// src/Components/Gateway/GettingStarted/View.jsx
import React, { useEffect } from 'react';
import {
  Wallet, Key, ArrowRight, AlertCircle,
  Plus, RefreshCw, Globe, Shield, Github,
  Coins, Monitor
} from 'lucide-react';
import { Link } from "react-router-dom";
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";

const GetStartedPage = () => {
  useEffect(() => {
      let mounted = true;

      if (mounted) {
          window.scrollTo(0, 0);
      }

      return () => {
          mounted = false;
      };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50">
        Skip to main content
      </a>

      <NavigationMenu />

      <main id="main-content" className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-purple-800 mb-4">
              Welcome to ComicCoin
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Choose an option below to get started with your wallet
            </p>
          </div>

          {/* Important Notice */}
          <div className="mb-8 bg-purple-50 rounded-2xl border-2 border-purple-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/50 p-3 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-purple-800">
                    Important Security Information
                  </h2>
                  <ul className="space-y-3 text-purple-700">
                    <li className="flex items-center gap-3">
                      <Shield className="h-5 w-5 shrink-0" />
                      <span>Never share your recovery phrase or password with anyone</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Shield className="h-5 w-5 shrink-0" />
                      <span>Always keep your recovery phrase in a safe place - you'll need it to restore your wallet</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Actions */}
            <div className="space-y-6">
              {/* Create New Wallet */}
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-purple-50 p-3 rounded-xl group-hover:bg-purple-100 transition-colors">
                    <Plus className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Create New Wallet</h2>
                    <p className="text-gray-600">Start fresh with a new wallet, perfect for first-time users.</p>
                  </div>
                </div>
                <Link
                  to="/create-wallet"
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Create New Wallet
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Access Existing */}
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-purple-50 p-3 rounded-xl group-hover:bg-purple-100 transition-colors">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Browser Wallet</h2>
                    <p className="text-gray-600">Quick access to your wallet stored in this browser.</p>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Access Browser Wallet
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Column - Recovery */}
            <div className="bg-white rounded-2xl p-8 border-2 border-purple-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-purple-50 p-3 rounded-xl">
                  <RefreshCw className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Recover Existing Wallet</h2>
                  <p className="text-gray-500">Have a wallet on another browser?</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">When to use recovery:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">•</span>
                      <span>You're using a new browser or device</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">•</span>
                      <span>You've cleared your browser data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">•</span>
                      <span>You want to restore from a backup</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">What you'll need:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-purple-600 shrink-0" />
                      <span>Your 12-word recovery phrase</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-purple-600 shrink-0" />
                      <span>A secure environment to enter it</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                to="/recover"
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Recover Wallet
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default GetStartedPage;
