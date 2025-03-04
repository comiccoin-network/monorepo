// src/components/IndexPage/WalletStepCard.jsx
import { Link } from "react-router";
import { ExternalLink, Wallet } from "lucide-react";

const WalletStepCard = () => {
  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg border border-purple-100 flex flex-col h-full transition-all duration-300 hover:shadow-xl">
      {/* Header with Step Number and Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
          <Wallet className="h-6 w-6 text-purple-600" />
        </div>
        <div className="bg-purple-100 text-purple-800 text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
          1
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Get Wallet</h3>
        <p className="text-gray-600">
          Download the ComicCoin Wallet to store your coins securely
        </p>
      </div>

      {/* App Icon and Store Buttons */}
      <div className="mt-auto">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md">
            <img
              src="/apple-touch-icon.png"
              alt="ComicCoin Wallet App"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-2">
          <a
            href="https://apps.apple.com/ca/app/comiccoin-wallet/id6741118881"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-black text-white py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors w-full"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.86-3.1.43-1.1-.44-2.1-.48-3.26 0-1.46.62-2.2.44-3.1-.43C3.1 15.45 3.74 8.83 8.14 8.5c1.32.07 2.24.87 3.07.87.83 0 2.37-1.08 4-.92 1.53.13 2.72.77 3.47 1.97-3.12 1.95-2.6 5.93.33 7.16-.92 2.23-2.03 3.76-3.96 4.7zM12.9 7.34c-.76-1.27-.29-3.27 1.05-4.5 1.2 1.1 1.82 2.9 1.05 4.5-1.08.05-1.96-.27-2.1 0z" />
            </svg>
            <span className="text-sm">App Store</span>
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.theshootingstarpress.comiccoinwallet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-black text-white py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors w-full"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.9 5c.1.1.2.3.2.5v13c0 .2-.1.3-.2.5l-7.6-7 7.6-7zM4 18.1c-.1-.1-.1-.2-.1-.4V6.3c0-.1 0-.3.1-.4l7.7 6.1-7.7 6.1z" />
              <path d="M15.4 3.2l-9.8 5.6-2-1.6c-.3-.2-.5-.5-.5-.9 0-.3.2-.7.5-.9l2-1.6 9.8 5.6-9.8 5.6L4 13.8c-.3-.2-.5-.5-.5-.9 0-.3.2-.7.5-.9l2-1.6 9.4 5.4 9.4-5.4-9.8-5.6 9.8-5.6 9.4 5.4-9.4 5.4 9.8 5.6c.3.2.5.5.5.9 0 .3-.2.7-.5.9l-9.8 5.6L3.6 19c-.3-.2-.5-.5-.5-.9 0-.3.2-.7.5-.9l11.8-6.7 11.8 6.7c.3.2.5.5.5.9 0 .3-.2.7-.5.9l-11.8 6.7-11.8-6.7c-.3-.2-.5-.5-.5-.9 0-.3.2-.7.5-.9l11.8-6.7-11.8-6.7z" />
            </svg>
            <span className="text-sm">Google Play</span>
          </a>

          <a
            href="https://comiccoinwallet.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg transition-colors w-full"
          >
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Web Wallet</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default WalletStepCard;
