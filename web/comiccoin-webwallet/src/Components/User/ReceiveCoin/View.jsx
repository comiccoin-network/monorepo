// src/Components/User/ReceiveCoin/View.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Wallet,
  Copy,
  Loader2,
  QrCode,
  Send,
  MoreHorizontal,
  CheckCircle2,
  Download,
  Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from '../../../Hooks/useWallet';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";

const ReceiveCoinPage = () => {
  const {
    currentWallet,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
        window.scrollTo(0, 0);
    }

    return () => {
        mounted = false;
    };
  }, []);

  const handleCopyAddress = async () => {
    if (currentWallet?.address) {
      await navigator.clipboard.writeText(currentWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector("#wallet-qr");
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = "wallet-qr.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgStr);
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    const svg = document.querySelector("#wallet-qr");
    printWindow.document.write(`
      <html>
        <head>
          <title>Wallet QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              font-family: system-ui, sans-serif;
            }
            .address {
              margin-top: 1rem;
              font-family: monospace;
              font-size: 0.875rem;
              color: #374151;
            }
          </style>
        </head>
        <body>
          ${svg.outerHTML}
          <div class="address">${currentWallet.address}</div>
          <script>window.print();window.close();</script>
        </body>
      </html>
    `);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <NavigationMenu />

      <main className="flex-grow w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 mb-20 sm:mb-0">
        <div className="max-w-[800px] mx-auto">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-1 sm:mb-2">Receive</h1>
            <p className="text-base sm:text-lg text-gray-600">Accept ComicCoins and NFTs to your wallet</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <QrCode className="w-4 h-4 text-purple-600" aria-hidden="true" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Receive ComicCoins</h2>
              </div>
              <p className="text-sm text-gray-500">
                Share your wallet address or QR code to receive coins and NFTs.
              </p>
            </div>

            <div className="p-4 sm:p-5 space-y-5">
              {/* QR Code section */}
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 w-full max-w-sm">
                  <QRCodeSVG
                    id="wallet-qr"
                    value={currentWallet.address}
                    size={240}
                    className="w-full h-auto"
                    level="H"
                    includeMargin={true}
                  />
                  {/* Action buttons */}
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      onClick={handlePrintQR}
                      className="flex items-center justify-center gap-1.5 h-9 px-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                      title="Print QR Code"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="text-sm">Print</span>
                    </button>
                    <button
                      onClick={handleDownloadQR}
                      className="flex items-center justify-center gap-1.5 h-9 px-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                      title="Download QR Code"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Your Wallet Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-grow">
                    <input
                      type="text"
                      readOnly
                      value={currentWallet.address}
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-800"
                    />
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center justify-center gap-1.5 h-10 px-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors touch-manipulation whitespace-nowrap"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
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
                    className="text-purple-600 hover:text-purple-700"
                  >
                    ComicCoin Faucet
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default ReceiveCoinPage;
