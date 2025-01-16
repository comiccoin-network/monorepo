import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Wallet,
  Copy,
  Loader2,
  QrCode,
  Send,
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from '../../../Hooks/useWallet';

const ReceivePage = () => {
  const {
    currentWallet,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); // Start the page at the top
  }, []);

  const handleCopyAddress = async () => {
    if (currentWallet?.address) {
      await navigator.clipboard.writeText(currentWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (serviceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading wallet...</span>
      </div>
    );
  }

  if (!currentWallet) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <QrCode className="w-5 h-5 text-purple-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Receive ComicCoins</h2>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Share your wallet address or QR code to receive coins and NFTs.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl border-2 border-gray-100">
                <QRCodeSVG
                  value={currentWallet.address}
                  size={240}
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Your Wallet Address
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-grow relative">
                  <input
                    type="text"
                    readOnly
                    value={currentWallet.address}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-800"
                  />
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Promotional Message */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                Want to earn free ComicCoins? Visit{' '}
                <a
                  href="https://comiccoinfaucet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  ComicCoin Faucet
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg" aria-label="Primary navigation">
        <div className="grid grid-cols-4 h-20">
          <Link to="/dashboard" className="flex flex-col items-center justify-center space-y-2">
            <Wallet className="w-7 h-7 text-gray-600" aria-hidden="true" />
            <span className="text-sm text-gray-600">Overview</span>
          </Link>
          <Link to="/send" className="flex flex-col items-center justify-center space-y-2">
            <Send className="w-7 h-7 text-gray-600" aria-hidden="true" />
            <span className="text-sm text-gray-600">Send</span>
          </Link>
          <div className="flex flex-col items-center justify-center space-y-2 bg-purple-50">
            <QrCode className="w-7 h-7 text-purple-600" aria-hidden="true" />
            <span className="text-sm text-purple-600">Receive</span>
          </div>
          <button className="flex flex-col items-center justify-center space-y-2">
            <MoreHorizontal className="w-7 h-7 text-gray-600" aria-hidden="true" />
            <span className="text-sm text-gray-600">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ReceivePage;
