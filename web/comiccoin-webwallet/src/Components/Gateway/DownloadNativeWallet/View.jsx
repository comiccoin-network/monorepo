// src/Components/Gateway/DownloadNativeWallet/View.jsx
import React from 'react';
import { Monitor, Globe, ArrowRight, Shield, Github, CheckCircle } from 'lucide-react';
import { Link } from "react-router-dom";

import FooterMenu from "../FooterMenu/View";

const WindowsDownloadPage = () => {
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
            <span>You're viewing the <strong>Native Wallet Download</strong> page</span>
          </div>
          <Link
            to="/"
            className="text-purple-200 hover:text-white flex items-center gap-1 text-sm"
          >
            <Globe className="h-4 w-4" />
            Switch to Web Wallet →
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Monitor className="h-8 w-8" />
              <span className="text-2xl font-bold" style={{fontFamily: 'Comic Sans MS'}}>
                ComicCoin Native Wallet
              </span>
            </div>
            <div className="flex space-x-4">
              <Link to="/" className="text-white hover:text-purple-200 px-3 py-2">
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-16 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{fontFamily: 'Comic Sans MS'}}>
                Download ComicCoin Wallet for Windows
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
                Get the official ComicCoin Wallet from the Microsoft Store
              </p>
              <div className="inline-flex items-center bg-indigo-700 text-sm px-3 py-1 rounded-full">
                <span className="mr-2">Latest Version:</span>
                <span className="font-mono font-bold">v{process.env.REACT_APP_NATIVE_BINARY_VERSION}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Download Card */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-purple-100">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Monitor className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Windows App</h2>
                    <p className="text-purple-600">Available on Microsoft Store</p>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Features:</h3>
                    <ul className="grid md:grid-cols-2 gap-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">Full blockchain node support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">Automatic updates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">Enhanced security features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">Offline transaction signing</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-700">
                      Download only from the Microsoft Store to ensure you're getting the genuine, verified ComicCoin Wallet app.
                    </p>
                  </div>
                </div>

                <a
                  href={process.env.REACT_APP_NATIVE_BINARY_WINDOWS_DOWNLOAD_LINK}
                  className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  Download from Microsoft Store
                  <ArrowRight className="h-5 w-5" />
                </a>

                <p className="text-center text-sm text-gray-500">
                  By downloading, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>

          {/* System Requirements */}
          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">System Requirements</h3>
            <div className="bg-white rounded-xl border-2 border-purple-100 p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">•</span>
                  <span className="text-gray-600">Windows 10 version 17763.0 or higher</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">•</span>
                  <span className="text-gray-600">64-bit processor (x64)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">•</span>
                  <span className="text-gray-600">4 GB RAM minimum (8 GB recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">•</span>
                  <span className="text-gray-600">1 GB available hard disk space</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <FooterMenu />
    </div>
  );
};

export default WindowsDownloadPage;
