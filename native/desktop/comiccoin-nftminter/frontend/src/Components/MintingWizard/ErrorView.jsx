import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, RotateCcw, ChevronLeft } from "lucide-react";

function MintingWizardErrorView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-6">
        <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              NFT Minting Failed
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              There was an error while minting your NFT to the ComicCoin blockchain
            </p>

            {/* Error Details */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800 mb-2">
                Error Details
              </div>
              <div className="text-sm text-red-700">
                <ul className="space-y-1 text-left list-disc list-inside">
                  <li>Invalid wallet address format</li>
                  <li>Image file size exceeds maximum limit (50MB)</li>
                  <li>Missing required field: Description</li>
                </ul>
              </div>
            </div>

            {/* Error Message */}
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs font-mono text-gray-600">
              Error Code: MINT_001 - Transaction failed due to invalid parameters
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => navigate("/minting-wizard-step3")}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <ChevronLeft className="w-4 h-4" />
              Return to Review
            </button>

            <button
              onClick={() => navigate("/minting-wizard-step1")}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RotateCcw className="w-4 h-4" />
              Start New Mint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MintingWizardErrorView;
