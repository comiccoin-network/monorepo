// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/get-started/page.tsx
"use client";

import React from "react";
import {
  Coins,
  ArrowLeft,
  UserPlus,
  LogIn,
  Globe,
  Shield,
  KeyRound,
} from "lucide-react";
import Link from "next/link";

const GetStartedPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Navigation */}
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
              href="/"
              className="bg-white text-purple-700 px-6 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 md:py-20 mb-6 sm:mb-8 md:mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                Welcome to ComicCoin Network
              </h1>
              <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
                Access all ComicCoin Network applications with a single account
              </p>
            </div>
          </div>
        </div>

        {/* Authentication Options */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">
              Choose Your Path
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Register Option */}
              <Link href="/register-call" className="group">
                <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center text-center h-full">
                  <div className="p-4 bg-purple-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-800 mb-3">
                    New to ComicCoin?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your ComicCoin Network account
                  </p>
                  <span className="inline-flex items-center text-purple-600 font-semibold">
                    Register Now
                  </span>
                </div>
              </Link>

              {/* Login Option */}
              <Link href="/login-call" className="group">
                <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center text-center h-full">
                  <div className="p-4 bg-purple-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <LogIn className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-800 mb-3">
                    Already Have an Account?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Sign in with your existing credentials
                  </p>
                  <span className="inline-flex items-center text-purple-600 font-semibold">
                    Sign In
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Network Benefits */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">
              One Account, All Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-50 rounded-xl mb-4">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  Network-Wide Access
                </h3>
                <p className="text-gray-600">
                  Use your credentials across all ComicCoin applications
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-50 rounded-xl mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  Secure Authentication
                </h3>
                <p className="text-gray-600">
                  Industry-standard security protecting your account
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-50 rounded-xl mb-4">
                  <KeyRound className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  Single Sign-On
                </h3>
                <p className="text-gray-600">
                  Seamless access across all network services
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-100">
            <p className="text-indigo-700 text-center">
              After authentication, you'll be automatically redirected back to
              continue claiming your ComicCoins.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-purple-200">
            © {new Date().getFullYear()} ComicCoin Network. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GetStartedPage;
