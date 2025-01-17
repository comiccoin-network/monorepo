// src/Components/Gateway/Login/View.jsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '../../../Hooks/useWallet';
import { Navigate, Link } from "react-router-dom";
import {
  Globe,
  Monitor,
  Wallet,
  AlertCircle,
  Info,
  Loader2,
  Key,
  LogIn,
  KeyRound
} from 'lucide-react';
import FooterMenu from "../FooterMenu/View";

function LoginPage() {
  const {
    wallets,
    loadWallet,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!selectedWalletId) {
        throw new Error("Please select a wallet");
      }
      if (!password) {
        throw new Error("Please enter your password");
      }

      await loadWallet(selectedWalletId, password);
      setRedirectTo("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (redirectTo) {
    return <Navigate to={redirectTo} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
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

      {/* Navigation Header */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Wallet aria-hidden="true" className="h-8 w-8" />
              <span className="text-2xl font-bold">ComicCoin Web Wallet</span>
            </div>
            <div className="flex space-x-4">
              <a
                href="/help"
                className="text-white hover:text-purple-200 px-3 py-2"
                aria-label="Help Center"
              >
                Help
              </a>
              <a
                href="/"
                className="text-white hover:text-purple-200 px-3 py-2"
                aria-label="Return to Homepage"
              >
                Home
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">
            Access Your Wallet
          </h1>
          <p className="text-xl text-gray-600">
            Login to your existing wallet
          </p>
        </div>

        {(error || serviceError) && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error || serviceError}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-xl">
                <KeyRound className="w-5 h-5 text-purple-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Login to Wallet
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Select your wallet and enter your password to continue.
            </p>
          </div>

          {wallets.length === 0 && !serviceLoading && (
            <div className="px-6">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div className="text-sm text-amber-800">
                    No wallets found. Please create a new wallet to continue.
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="p-6 space-y-6">
            {/* Security Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-2">Security Notice:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Make sure you're on the correct website ({process.env.REACT_APP_WWW_DOMAIN})</li>
                    <li>Never share your password with anyone</li>
                    <li>ComicCoin team will never ask for your password</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Wallet Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Wallet
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Choose the wallet you want to access
              </p>
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                disabled={isLoading || serviceLoading}
              >
                <option value="">Select a wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} - Last accessed: ${formatDate(wallet.lastAccessed)}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Enter your wallet password
              </p>
              <div className="relative mt-1">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your wallet password"
                  disabled={isLoading || serviceLoading}
                />
                <Key className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Link
                to="/"
                type="button"
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || serviceLoading}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || serviceLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Accessing...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Access Wallet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
}

export default LoginPage;
