import React, { useState } from 'react';
import {
  Globe,
  Monitor,
  Wallet,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  Loader2,
  KeyRound,
  ChevronRight
} from 'lucide-react';
import { Link } from "react-router-dom";

import FooterMenu from "../FooterMenu/View";

const RecoverHDWalletPage = () => {
  const [showPhrase, setShowPhrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    mnemonic: '',
    password: '',
    repeatPassword: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.label.trim()) {
      errors.label = 'Wallet label is required';
    }
    if (!formData.mnemonic.trim()) {
      errors.mnemonic = 'Recovery phrase is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 12) {
      errors.password = 'Password must be at least 12 characters long';
    }
    if (!formData.repeatPassword) {
      errors.repeatPassword = 'Please repeat your password';
    } else if (formData.password !== formData.repeatPassword) {
      errors.repeatPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle wallet access logic here
    }, 1500);
  };

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
            Enter your recovery phrase to access your wallet
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-xl">
                <KeyRound className="w-5 h-5 text-purple-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Enter Recovery Phrase
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Please enter your 12-word recovery phrase to access your wallet.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Security Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-2">Security Notice:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Make sure you're on the correct website ({process.env.REACT_APP_WWW_DOMAIN})</li>
                    <li>Never share your recovery phrase with anyone</li>
                    <li>ComicCoin team will never ask for your phrase</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Info Box about password and label */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
              <div className="flex gap-4">
                <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-2">Important Information:</p>
                  <ul className="list-disc ml-4 space-y-2">
                    <li>Your recovery phrase must match exactly with your original wallet</li>
                    <li>You can choose a new name for this wallet</li>
                    <li>You can set a new password - it doesn't have to match your original password</li>
                    <li>Double-check your recovery phrase before submitting</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Wallet Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="label">
                Wallet Label
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Choose any name that helps you identify this wallet
              </p>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Example: 'My Trading Wallet' or 'Main Wallet'"
              />
            </div>

            {/* Recovery Phrase Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="mnemonic">
                Recovery Phrase
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Enter your original wallet's recovery phrase exactly as it was given to you
              </p>
              <div className="mt-1 relative">
                <textarea
                  id="mnemonic"
                  name="mnemonic"
                  rows={3}
                  value={formData.mnemonic}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Enter your 12 or 24 word recovery phrase, with words separated by spaces"
                  aria-describedby="mnemonic-description"
                  type={showPhrase ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPhrase(!showPhrase)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  aria-label={showPhrase ? "Hide recovery phrase" : "Show recovery phrase"}
                >
                  {showPhrase ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                New Password
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Create a new password for this wallet - it doesn't need to match your original
              </p>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter your new password"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="repeatPassword">
                Confirm New Password
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Repeat your new password to confirm
              </p>
              <input
                type="password"
                id="repeatPassword"
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Repeat your new password"
              />
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
                disabled={isLoading}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isLoading ? "Accessing wallet..." : "Access wallet"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Accessing...
                  </>
                ) : (
                  <>
                    Access Wallet
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
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
};

export default RecoverHDWalletPage;
