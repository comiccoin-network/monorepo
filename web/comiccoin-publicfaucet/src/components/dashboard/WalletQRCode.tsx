// src/components/dashboard/WalletQRCode.tsx
"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink } from "lucide-react";

interface WalletQRCodeProps {
  address: string;
}

export const WalletQRCode = ({ address }: WalletQRCodeProps) => {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    // TODO: Add toast notification
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">
        Your Wallet
      </h3>
      <div className="flex items-center justify-center mb-4">
        <QRCodeSVG
          value={`ethereum:${address}`}
          size={160}
          level="L"
          includeMargin={true}
          className="p-2 bg-white rounded-lg"
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Receive coins at:</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <code className="bg-purple-50 px-3 py-1 rounded text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </code>
          <button
            onClick={handleCopyAddress}
            className="p-1 hover:bg-purple-50 rounded"
            title="Copy address"
          >
            <Copy className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Share this QR code to receive coins from other users
        </p>
      </div>
    </div>
  );
};
