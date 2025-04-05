// src/pages/Gateway/GetStartedPage.jsx
import React from "react";
import { Link } from "react-router";
import { UserPlus, LogIn, ArrowRight, Shield, Wallet } from "lucide-react";
import Header from "../../components/IndexPage/Header";
import Footer from "../../components/IndexPage/Footer";
import withRedirectAuthenticated from "../../components/withRedirectAuthenticated";

const GetStartedPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <Header showBackButton={true} />

      <main id="main-content" className="flex-grow">
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 lg:py-20 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Welcome to ComicCoin Digital Identity
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto">
                Join our community and securely link your blockchain wallet to
                your verified digital identity
              </p>
              <Link
                to="/"
                className="mt-8 inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-base sm:text-lg shadow-lg hover:shadow-xl active:bg-indigo-100 active:shadow-md"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-800 text-center mb-12">
            Choose Your Path
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 mb-12">
            <Link to="/register" className="group">
              <div className="bg-white h-full p-6 sm:p-8 rounded-xl border-2 border-purple-100 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col items-center text-center">
                <div className="p-4 bg-purple-50 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4">
                  New to ComicCoin?
                </h3>
                <p className="text-gray-600 mb-6 text-base sm:text-lg flex-grow">
                  Create your ComicCoin Network account to establish your
                  digital identity. Connect your wallet and join our community
                  of blockchain-verified users.
                </p>
                <span className="inline-flex items-center gap-2 text-purple-600 font-semibold text-lg">
                  Register Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link to="/login" className="group">
              <div className="bg-white h-full p-6 sm:p-8 rounded-xl border-2 border-purple-100 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col items-center text-center">
                <div className="p-4 bg-purple-50 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <LogIn className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4">
                  Already Have an Account?
                </h3>
                <p className="text-gray-600 mb-6 text-base sm:text-lg flex-grow">
                  Sign in with your existing credentials to manage your digital
                  identity. Access your verified profile and wallet connections
                  securely.
                </p>
                <span className="inline-flex items-center gap-2 text-purple-600 font-semibold text-lg">
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-indigo-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 text-center mb-10">
              Benefits of Digital Identity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 rounded-full p-3 inline-flex mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Trust & Security
                </h3>
                <p className="text-gray-600">
                  Establish credibility with a verified digital identity that
                  others can trust when conducting blockchain transactions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 rounded-full p-3 inline-flex mb-4">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Simplified Transactions
                </h3>
                <p className="text-gray-600">
                  Connect your name and profile to your wallet address, making
                  it easier for others to send you payments.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 rounded-full p-3 inline-flex mb-4">
                  <UserPlus className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Community Access
                </h3>
                <p className="text-gray-600">
                  Join our growing community of verified users and organizations
                  on the ComicCoin blockchain network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default withRedirectAuthenticated(GetStartedPage);
