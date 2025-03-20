// src/components/IndexPage/WalletStepCard.jsx
import React from "react";
import { Wallet, ExternalLink } from "lucide-react";

const WalletStepCard = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 flex flex-col h-full transition-all duration-300 hover:shadow-xl">
      {/* Header with Step Number and Icon */}
      <div className="flex items-center justify-between mb-5">
        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
          <Wallet className="h-6 w-6 text-purple-600" />
        </div>
        <div className="bg-purple-100 text-purple-800 text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
          1
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Get Wallet</h3>
        <p className="text-gray-600">
          Download the ComicCoin Wallet to store your coins securely
        </p>
      </div>
    </div>
  );
};

export default WalletStepCard;
