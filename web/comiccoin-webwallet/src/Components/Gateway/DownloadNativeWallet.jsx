import React from 'react';
import {
  Monitor,
  Smartphone,
  Github,
  Download,
  Apple,
  Globe,
  Coins,
  AlertCircle
} from 'lucide-react';

const DownloadNativeWalletPage = () => {
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
      <div className="bg-purple-900 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Monitor className="h-5 w-5" />
            <span>Native Wallet Downloads - <strong>v1.2.0</strong></span>
          </div>
          <a
            href="/"
            className="text-purple-200 hover:text-white flex items-center gap-1 text-sm"
          >
            <Globe className="h-4 w-4" />
            Switch to Web Wallet
          </a>
        </div>
      </div>

      {/* Header Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8" />
              <span className="text-2xl font-bold" style={{fontFamily: 'Comic Sans MS, cursive'}}>
                ComicCoin Native Wallet
              </span>
            </div>
            <div className="flex space-x-4">
              <a href="/help" className="text-white hover:text-purple-200 px-3 py-2">Help</a>
              <a href="/" className="text-white hover:text-purple-200 px-3 py-2">Home</a>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-purple-800 mb-6" style={{fontFamily: 'Comic Sans MS, cursive'}}>
            Download Native Wallet
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the full ComicCoin experience on your preferred device
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-12 p-6 bg-yellow-50 border border-yellow-200 rounded-xl" role="alert">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 shrink-0" />
            <div>
              <h2 className="font-bold text-yellow-800 mb-2">Important Notice</h2>
              <p className="text-yellow-700">
                Only download the ComicCoin wallet from official sources listed on this page.
                Verify the blockchain address matches: <code className="bg-yellow-100 px-2 py-1 rounded font-mono">0xd4e4078ca3495DE5B1d4dB434BEbc5a986197782</code>
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Downloads */}
        <div className="bg-white rounded-xl p-8 border-2 border-purple-200 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-purple-100 rounded-xl">
              <Monitor className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Desktop Wallet</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Windows */}
            <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
              <img
                src="/api/placeholder/48/48"
                alt="Windows Logo"
                className="mb-4 mx-auto"
              />
              <h3 className="font-bold text-lg text-center mb-2">Windows</h3>
              <p className="text-sm text-gray-600 text-center mb-4">Windows 10/11 (64-bit)</p>
              <a
                href="https://comiccoin.ca/download/windows"
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download .exe
              </a>
            </div>

            {/* macOS */}
            <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
              <img
                src="/api/placeholder/48/48"
                alt="macOS Logo"
                className="mb-4 mx-auto"
              />
              <h3 className="font-bold text-lg text-center mb-2">macOS</h3>
              <p className="text-sm text-gray-600 text-center mb-4">Intel & Apple Silicon</p>
              <a
                href="https://comiccoin.ca/download/macos"
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download .dmg
              </a>
            </div>

            {/* Linux */}
            <div className="p-6 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
              <img
                src="/api/placeholder/48/48"
                alt="Linux Logo"
                className="mb-4 mx-auto"
              />
              <h3 className="font-bold text-lg text-center mb-2">Linux</h3>
              <p className="text-sm text-gray-600 text-center mb-4">Ubuntu, Debian & more</p>
              <div className="space-y-2">
                <a
                  href="https://comiccoin.ca/download/linux/appimage"
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download .AppImage
                </a>
                <a
                  href="https://comiccoin.ca/download/linux/deb"
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  .deb package
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Downloads */}
        <div className="bg-white rounded-xl p-8 border-2 border-purple-200 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-purple-100 rounded-xl">
              <Smartphone className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Mobile Wallet</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* iOS */}
            <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
              <div className="flex-shrink-0">
                <img
                  src="/api/placeholder/120/120"
                  alt="QR Code for iOS App Store"
                  className="rounded-xl"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg mb-2">iOS App</h3>
                <p className="text-sm text-gray-600 mb-4">iPhone & iPad</p>
                <a
                  href="https://apps.apple.com/app/comiccoin-wallet"
                  className="w-full px-4 py-2 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Apple className="h-4 w-4" />
                  Download on App Store
                </a>
              </div>
            </div>

            {/* Android */}
            <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
              <div className="flex-shrink-0">
                <img
                  src="/api/placeholder/120/120"
                  alt="QR Code for Google Play Store"
                  className="rounded-xl"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg mb-2">Android App</h3>
                <p className="text-sm text-gray-600 mb-4">Android 8.0+</p>
                <div className="space-y-2">
                  <a
                    href="https://play.google.com/store/apps/details?id=ca.comiccoin.wallet"
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Get on Play Store
                  </a>
                  <a
                    href="https://comiccoin.ca/download/android/apk"
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Direct APK Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-2">System Requirements</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Windows 10/11 (64-bit)</li>
                <li>• macOS 11.0 or later</li>
                <li>• Linux: Ubuntu 20.04+, Debian 11+</li>
                <li>• iOS 14.0 or later</li>
                <li>• Android 8.0 or later</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Blockchain Information</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Full node: ~2GB storage required</li>
                <li>• Light node: ~100MB storage required</li>
                <li>• Initial sync time: 10-15 minutes</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-left">
              <h3 className="font-bold mb-4">Project Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com/comiccoin-network/monorepo" className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-2">
                    <Github className="h-4 w-4" />
                    <span>GitHub Repository</span>
                  </a>
                </li>
                <li>
                  <a href="https://comiccoin.ca" className="hover:text-purple-200">
                    Project Website
                  </a>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="hover:text-purple-200">Help Center</a>
                </li>
                <li>
                  <a href="/security" className="hover:text-purple-200">Security Guide</a>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="hover:text-purple-200">Terms of Service</a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-purple-200">Privacy Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-purple-500">
            <p>© 2025 ComicCoin Native Wallet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DownloadNativeWalletPage;
