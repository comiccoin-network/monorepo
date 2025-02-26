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

      {/* Navigation - Mobile optimized */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
              <span className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                ComicCoin Faucet
              </span>
            </div>
            <Link
              href="/"
              className="bg-white text-purple-700 px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back</span>
              <span className="hidden sm:inline">to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow">
        {/* Hero Section - Better on small screens */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-8 sm:py-12 md:py-16 mb-4 sm:mb-6 md:mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                Welcome to ComicCoin Network
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">
                Access all ComicCoin Network applications with a single account
              </p>
            </div>
          </div>
        </div>

        {/* Authentication Options - Improved for mobile */}
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 shadow-lg mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4 sm:mb-6 text-center">
              Choose Your Path
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Register Option */}
              <Link href="/register-call" className="group">
                <div className="bg-gradient-to-br from-purple-50 to-white p-5 sm:p-6 md:p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center text-center h-full">
                  <div className="p-3 sm:p-4 bg-purple-100 rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">
                    New to ComicCoin?
                  </h3>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                    Create your ComicCoin Network account
                  </p>
                  <span className="inline-flex items-center text-purple-600 font-semibold text-sm sm:text-base">
                    Register Now
                  </span>
                </div>
              </Link>

              {/* Login Option */}
              <Link href="/login-call" className="group">
                <div className="bg-gradient-to-br from-purple-50 to-white p-5 sm:p-6 md:p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col items-center text-center h-full">
                  <div className="p-3 sm:p-4 bg-purple-100 rounded-full mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <LogIn className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">
                    Already Have an Account?
                  </h3>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                    Sign in with your existing credentials
                  </p>
                  <span className="inline-flex items-center text-purple-600 font-semibold text-sm sm:text-base">
                    Sign In
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Network Benefits - Reflow for mobile */}
          <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 shadow-lg mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4 sm:mb-6">
              One Account, All Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-50 rounded-xl mb-3 sm:mb-4">
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-1 sm:mb-2">
                  Network-Wide Access
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Use your credentials across all ComicCoin applications
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-50 rounded-xl mb-3 sm:mb-4">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-1 sm:mb-2">
                  Secure Authentication
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Industry-standard security protecting your account
                </p>
              </div>
              <div className="flex flex-col items-center text-center sm:col-span-2 md:col-span-1 sm:max-w-xs sm:mx-auto md:mx-0 md:max-w-none">
                <div className="p-3 bg-purple-50 rounded-xl mb-3 sm:mb-4">
                  <KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-1 sm:mb-2">
                  Single Sign-On
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Seamless access across all network services
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-indigo-100">
            <p className="text-indigo-700 text-center text-sm sm:text-base">
              After authentication, you'll be automatically redirected back to
              continue claiming your ComicCoins.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-4 sm:py-6 md:py-8 mt-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-purple-200 text-sm sm:text-base">
            © {new Date().getFullYear()} ComicCoin Network. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GetStartedPage;
