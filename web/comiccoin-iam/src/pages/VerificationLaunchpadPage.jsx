// src/pages/VerificationLaunchpadPage.jsx
import React from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Building,
  Shield,
  LogOut,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";

const VerificationLaunchpadPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <Header showButton={false} showBackButton={false} />

      <main id="main-content" className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 lg:py-20 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Account Verification
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto">
                Complete your account verification to access all ComicCoin
                features
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden mb-8">
            {/* Content Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
              <Shield className="h-7 w-7 mr-3 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">
                  Select Verification Type
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  Choose the verification option that best applies to you
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Individual Verification Card */}
                <Link
                  to="/verification/individual"
                  className="bg-white rounded-xl p-6 border border-purple-100 hover:border-purple-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="bg-purple-100 rounded-full p-4 mb-4">
                    <User className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">
                    Individual Verification
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    Verify your personal identity to access all ComicCoin
                    features
                  </p>
                  <span className="inline-flex items-center gap-2 text-purple-600 font-semibold text-lg">
                    Start Individual Verification
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>

                {/* Business Verification Card */}
                <Link
                  to="/verification/business"
                  className="bg-white rounded-xl p-6 border border-purple-100 hover:border-purple-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="bg-purple-100 rounded-full p-4 mb-4">
                    <Building className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">
                    Business Verification
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow">
                    Verify your business identity for enhanced commercial
                    features
                  </p>
                  <span className="inline-flex items-center gap-2 text-purple-600 font-semibold text-lg">
                    Start Business Verification
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => logout()} // Call the logout function from useAuth hook
                  className="px-6 py-3 bg-red-600 text-white border border-red-700 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer
        isLoading={false}
        error={null}
        faucet={{}}
        formatBalance={(val) => val || "0"}
      />
    </div>
  );
};

export default VerificationLaunchpadPage;
