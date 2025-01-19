// src/Components/Gateway/DownloadNativeWallet/View.jsx
import React from 'react';
import { Wallet, Monitor, Globe, ArrowRight, Shield, Github, CheckCircle, Apple } from 'lucide-react';
import { Link } from "react-router-dom";
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";

const DownloadNativeWalletPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50">
        Skip to main content
      </a>

      {/* Navigation */}
      <NavigationMenu />

      <main id="main-content" className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-16 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{fontFamily: 'Comic Sans MS'}}>
                Download ComicCoin Wallet
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
                Get the official ComicCoin Wallet for your platform
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
          {/* Download Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {/* Microsoft Download Card */}
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
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">Full blockchain node support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">Automatic updates via Microsoft Store</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-700">
                      Download only from the Microsoft Store to ensure you're getting the genuine, verified app.
                    </p>
                  </div>
                </div>

                <a
                  href={process.env.REACT_APP_NATIVE_BINARY_WINDOWS_DOWNLOAD_LINK}
                  className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <Monitor className="h-5 w-5" />
                  Download from Microsoft Store
                  <ArrowRight className="h-5 w-5" />
                </a>

                <p className="text-center text-sm text-gray-500">
                  Requires Windows 10 version 17763.0 or higher
                </p>
              </div>
            </div>

            {/* MacOS Download Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-purple-100">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Apple className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">MacOS App</h2>
                    <p className="text-purple-600">Universal Binary (Intel/Apple Silicon)</p>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Features:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">Native Apple Silicon support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-600">Optimized for macOS performance</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-700">
                      App is notarized by Apple for enhanced security and seamless installation.
                    </p>
                  </div>
                </div>

                <a
                  href={process.env.REACT_APP_NATIVE_BINARY_MACOS_DOWNLOAD_LINK}
                  className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <Apple className="h-5 w-5" />
                  Download for MacOS
                  <ArrowRight className="h-5 w-5" />
                </a>

                <p className="text-center text-sm text-gray-500">
                  Requires macOS 11.0 (Big Sur) or higher
                </p>
              </div>
            </div>
          </div>

          {/* Shared Features Section */}
          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Common Features</h3>
            <div className="bg-white rounded-xl border-2 border-purple-100 p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-600">Full blockchain node support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-600">Enhanced security features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-600">Offline transaction signing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-600">4 GB RAM minimum (8 GB recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-600">1 GB available hard disk space</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default DownloadNativeWalletPage;
